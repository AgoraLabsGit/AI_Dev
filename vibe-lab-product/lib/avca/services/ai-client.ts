import { BaseService, ServiceConfig } from './base-service';
import { EventBus } from './event-bus';
import { tokenTracker } from '../token-tracking';
import { getModelForStage, calculateCost, ModelType } from '../model-config';
import { RateLimiter } from './rate-limiter';
import { RetryHandler, RetryResult } from './retry-handler';
import Anthropic from '@anthropic-ai/sdk';

// AI Role Types
export enum AIRole {
  DEVELOPER = 'developer',
  AUDITOR = 'auditor',
  ROUTER = 'router'
}

// AI Request/Response interfaces
export interface AIRequest {
  role: AIRole;
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  role: AIRole;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  duration: number;
  metadata?: Record<string, any>;
}

// Model settings by role
interface RoleSettings {
  model: ModelType;
  temperature: number;
  maxTokens: number;
  topP: number;
}

const ROLE_SETTINGS: Record<AIRole, RoleSettings> = {
  [AIRole.DEVELOPER]: {
    model: 'claude-3-5-sonnet' as ModelType,
    temperature: 0.2,
    maxTokens: 4096,
    topP: 0.9
  },
  [AIRole.AUDITOR]: {
    model: 'claude-3-opus' as ModelType,
    temperature: 0.1,
    maxTokens: 3000,
    topP: 0.95
  },
  [AIRole.ROUTER]: {
    model: 'claude-3-haiku' as ModelType,
    temperature: 0.1,
    maxTokens: 500,
    topP: 1.0
  }
};

export class AIClientService extends BaseService {
  private anthropic: Anthropic;
  private rateLimiter: RateLimiter;
  private retryHandler: RetryHandler;
  private requestQueue: Map<string, AIRequest> = new Map();
  private activeRequests = 0;
  private maxConcurrentRequests = 5;
  private totalTokensProcessed = 0; // Track tokens for metrics

  constructor(eventBus: EventBus) {
    super({
      name: 'ai-client',
      version: '1.0.0',
      dependencies: [],
      healthCheckInterval: 30000
    });

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.anthropic = new Anthropic({
      apiKey
    });

    // Initialize rate limiter and retry handler
    this.rateLimiter = new RateLimiter();
    this.retryHandler = new RetryHandler({
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      retryableErrors: ['rate_limit_error', '429', '503', '504', 'network_error']
    });

    // Subscribe to rate limiter events
    this.rateLimiter.on('requestQueued', (data) => {
      this.log('info', `Request queued for ${data.model}, queue length: ${data.queueLength}`);
    });

    // Subscribe to retry handler events
    this.retryHandler.on('retryAttempt', (data) => {
      this.log('warn', `Retry attempt ${data.attempt} after ${data.delay}ms: ${data.error?.message}`);
    });

    this.retryHandler.on('circuitOpened', (data) => {
      this.log('error', `Circuit breaker opened after ${data.failures} consecutive failures`);
    });

    // Subscribe to AI request events
    eventBus.subscribe('ai.request', this.config.name, async (message) => {
      const request = message.data as AIRequest;
      const response = await this.process(request);
      
      await eventBus.publish('ai.response', this.config.name, {
        requestId: message.id,
        response
      });
    });
  }

  protected async initialize(): Promise<void> {
    // Verify API key works
    try {
      await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      this.log('info', 'Anthropic API connection verified');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize AI client: ${errorMessage}`);
    }
  }

  protected async cleanup(): Promise<void> {
    // Cancel any pending requests
    this.requestQueue.clear();
    this.activeRequests = 0;
  }

  protected async healthCheck(): Promise<boolean> {
    // Check if we can reach Anthropic API
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'health check' }]
      });
      return response.id !== undefined;
    } catch {
      return false;
    }
  }

  async process(request: AIRequest): Promise<AIResponse> {
    const requestId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Get role-specific settings
      const settings = ROLE_SETTINGS[request.role];
      if (!settings) {
        throw new Error(`Invalid AI role: ${request.role}`);
      }

      // Estimate tokens for rate limiting (rough estimate)
      const estimatedTokens = this.estimateTokens(request);

      // Check rate limits
      const canProceed = await this.rateLimiter.checkLimit(settings.model, estimatedTokens);
      
      if (!canProceed) {
        // Queue the request
        const status = this.rateLimiter.getStatus(settings.model);
        this.log('warn', `Rate limited for ${settings.model}, queueing request`);
        
        // Create a promise that resolves when rate limit allows
        await new Promise<void>((resolve) => {
          this.rateLimiter.queueRequest(settings.model, resolve);
        });
      }

      // Execute with retry logic
      const result: RetryResult<AIResponse> = await this.retryHandler.execute(
        async () => this.executeAIRequest(request, settings, requestId),
        { operation: `ai-${request.role}`, metadata: { requestId } }
      );

      if (!result.success || !result.data) {
        throw result.error || new Error('AI request failed');
      }

      // Consume rate limits with actual token usage
      await this.rateLimiter.consumeLimit(
        settings.model,
        result.data.usage.totalTokens
      );

      // Update metrics on success
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, true);

      return result.data;

    } catch (error) {
      // Update metrics on failure
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, false);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log('error', `AI request failed: ${errorMessage}`);
      throw error;
    }
  }

  private async executeAIRequest(
    request: AIRequest,
    settings: RoleSettings,
    requestId: string
  ): Promise<AIResponse> {
    const startTime = Date.now();

    // Wait if at capacity
    while (this.activeRequests >= this.maxConcurrentRequests) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeRequests++;

    try {
      // Map model names to Anthropic format
      const modelMap: Record<ModelType, string> = {
        'claude-3-opus': 'claude-3-5-sonnet-20241022', // Opus deprecated, using Sonnet
        'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
        'claude-3-haiku': 'claude-3-haiku-20240307'
      };

      // Build messages array
      const messages: Anthropic.MessageParam[] = [];
      
      if (request.context) {
        messages.push({
          role: 'user',
          content: `Context:\n${request.context}`
        });
      }
      
      messages.push({
        role: 'user',
        content: request.prompt
      });

      // Make API call
      const response = await this.anthropic.messages.create({
        model: modelMap[settings.model],
        max_tokens: request.maxTokens || settings.maxTokens,
        temperature: request.temperature ?? settings.temperature,
        top_p: settings.topP,
        messages
      });

      // Calculate metrics
      const duration = Date.now() - startTime;
      const usage = {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      };
      const cost = calculateCost(
        settings.model,
        usage.promptTokens,
        usage.completionTokens
      );

      // Track token usage - use a stage name for tracking
      const trackingStage = `ai-${request.role}` as any; // Temporary workaround
      tokenTracker.track(requestId, trackingStage, {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        model: settings.model,
        cost
      }, duration);

      // Extract text content
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as Anthropic.TextBlock).text)
        .join('\n');
      
      // Track total tokens processed
      this.totalTokensProcessed += usage.totalTokens;

      return {
        content,
        role: request.role,
        model: settings.model,
        usage,
        cost,
        duration,
        metadata: {
          ...request.metadata,
          requestId,
          anthropicId: response.id
        }
      };

    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Estimate tokens for a request (rough approximation)
   */
  private estimateTokens(request: AIRequest): number {
    // Rough estimate: 1 token ≈ 4 characters
    const contextTokens = (request.context?.length || 0) / 4;
    const promptTokens = request.prompt.length / 4;
    const estimatedOutput = request.maxTokens || ROLE_SETTINGS[request.role].maxTokens;
    
    return Math.ceil(contextTokens + promptTokens + estimatedOutput);
  }

  // Get current queue size
  getQueueSize(): number {
    return this.requestQueue.size;
  }

  // Get active request count
  getActiveRequests(): number {
    return this.activeRequests;
  }

  // Get total tokens processed
  getTotalTokensProcessed(): number {
    return this.totalTokensProcessed;
  }

  // Update concurrency limit
  setConcurrencyLimit(limit: number): void {
    this.maxConcurrentRequests = Math.max(1, Math.min(limit, 20));
    this.log('info', `Concurrency limit updated to ${this.maxConcurrentRequests}`);
  }

  // Get rate limit status
  getRateLimitStatus() {
    return this.rateLimiter.getAllStatuses();
  }

  // Get retry handler status
  getRetryStatus() {
    return this.retryHandler.getCircuitStatus();
  }
} 