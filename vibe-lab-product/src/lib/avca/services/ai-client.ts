import { BaseService, ServiceConfig } from './base-service';
import { EventBus } from './event-bus';
import { tokenTracker } from '../token-tracking';
import { getModelForStage, calculateCost, ModelType } from '../model-config';
import { RateLimiter } from './rate-limiter';
import { RetryHandler, RetryResult } from './retry-handler';
import { MonitorAVCA } from '../../monitoring/logic-monitor-integration';
import Anthropic from '@anthropic-ai/sdk';

// AI Role Types
export enum AIRole {
  DEVELOPER = 'developer',
  AUDITOR = 'auditor',
  ROUTER = 'router',
  ANALYZER = 'analyzer'  // For multi-path analysis
}

// Entry Path Types
export enum EntryPathType {
  FRESH = 'fresh',
  GITHUB = 'github',
  CODE = 'code',
  DOCS = 'docs'
}

// Analysis Types
export interface AnalysisRequest extends AIRequest {
  entryPath: EntryPathType;
  source?: {
    type: EntryPathType;
    content: any;
    metadata?: Record<string, any>;
  };
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
  },
  [AIRole.ANALYZER]: {
    model: 'claude-3-5-sonnet' as ModelType,
    temperature: 0.1,
    maxTokens: 4096,
    topP: 0.95
  }
};

// Entry path specific settings
const ENTRY_PATH_SETTINGS: Record<EntryPathType, {
  requiredAnalysis: string[];
  contextLimit: number;
  defaultPrompts: Record<string, string>;
}> = {
  [EntryPathType.FRESH]: {
    requiredAnalysis: ['project_type', 'features', 'complexity'],
    contextLimit: 2000,
    defaultPrompts: {
      project_type: 'Analyze the project description to determine the type of application being built.',
      features: 'Extract key features and requirements from the project description.',
      complexity: 'Assess the project complexity and suggest appropriate architecture.'
    }
  },
  [EntryPathType.GITHUB]: {
    requiredAnalysis: ['repo_structure', 'dependencies', 'architecture', 'migration_path'],
    contextLimit: 8000,
    defaultPrompts: {
      repo_structure: 'Analyze the repository structure and identify key components.',
      dependencies: 'Extract and analyze project dependencies and tech stack.',
      architecture: 'Determine the current architecture patterns in use.',
      migration_path: 'Suggest optimal migration path to Vibe Lab architecture.'
    }
  },
  [EntryPathType.CODE]: {
    requiredAnalysis: ['code_quality', 'patterns', 'dependencies', 'migration_path'],
    contextLimit: 8000,
    defaultPrompts: {
      code_quality: 'Analyze code quality metrics and identify improvement areas.',
      patterns: 'Identify architectural and design patterns in use.',
      dependencies: 'Map dependencies and technology requirements.',
      migration_path: 'Plan optimal migration strategy to Vibe Lab architecture.'
    }
  },
  [EntryPathType.DOCS]: {
    requiredAnalysis: ['doc_structure', 'requirements', 'architecture', 'validation'],
    contextLimit: 4000,
    defaultPrompts: {
      doc_structure: 'Extract structured information from documentation.',
      requirements: 'Identify key requirements and specifications.',
      architecture: 'Map documented architecture to Vibe Lab patterns.',
      validation: 'Validate completeness and consistency of documentation.'
    }
  }
};

export interface AnalysisResult {
  entryPath: EntryPathType;
  results: Record<string, any>;
  confidence: number;
  suggestions: string[];
  metadata: {
    processingTime: number;
    tokenUsage: number;
    analysisTypes: string[];
  };
}

export interface BlueprintGenerationRequest {
  analysis: AnalysisResult;
  requirements: {
    functional: string[];
    technical: string[];
    design: string[];
  };
  templates: any[];
}

export interface BlueprintGenerationResult {
  blueprint: any;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  metadata: {
    processingTime: number;
    confidence: number;
    suggestions: string[];
  };
}

export class AIClientService extends BaseService {
  private anthropic: Anthropic;
  private rateLimiter: RateLimiter;
  private retryHandler: RetryHandler;
  private requestQueue: Map<string, AIRequest> = new Map();
  private activeRequests = 0;
  private maxConcurrentRequests = 5;
  private totalTokensProcessed = 0; // Track tokens for metrics
  private analysisCache: Map<string, AnalysisResult> = new Map(); // Cache analysis results

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

  @MonitorAVCA('AI_CLIENT')
  async analyzeInput(request: AnalysisRequest): Promise<AnalysisResult> {
    const startTime = Date.now();
    const cacheKey = `${request.entryPath}-${JSON.stringify(request.source)}`;

    // Check cache first
    const cachedResult = this.analysisCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Get entry path settings
    const pathSettings = ENTRY_PATH_SETTINGS[request.entryPath];
    if (!pathSettings) {
      throw new Error(`Invalid entry path: ${request.entryPath}`);
    }

    // Initialize results container
    const results: Record<string, any> = {};
    let totalTokens = 0;

    // Run required analysis steps
    for (const analysisType of pathSettings.requiredAnalysis) {
      const analysisPrompt = pathSettings.defaultPrompts[analysisType];
      
      // Create analysis request
      const aiRequest: AIRequest = {
        role: AIRole.ANALYZER,
        prompt: analysisPrompt,
        context: request.source ? JSON.stringify(request.source) : undefined,
        maxTokens: Math.min(pathSettings.contextLimit, ROLE_SETTINGS[AIRole.ANALYZER].maxTokens)
      };

      // Process analysis request
      const response = await this.process(aiRequest);
      
      // Store results
      results[analysisType] = response.content;
      totalTokens += response.usage.totalTokens;
    }

    // Calculate confidence based on token usage and response quality
    const confidence = this.calculateConfidence(results, request.entryPath);

    // Generate suggestions based on analysis
    const suggestions = this.generateSuggestions(results, request.entryPath);

    // Create final result
    const analysisResult: AnalysisResult = {
      entryPath: request.entryPath,
      results,
      confidence,
      suggestions,
      metadata: {
        processingTime: Date.now() - startTime,
        tokenUsage: totalTokens,
        analysisTypes: pathSettings.requiredAnalysis
      }
    };

    // Cache the result
    this.analysisCache.set(cacheKey, analysisResult);

    return analysisResult;
  }

  private calculateConfidence(results: Record<string, any>, entryPath: EntryPathType): number {
    // Implement confidence calculation based on:
    // 1. Completeness of results
    // 2. Token usage efficiency
    // 3. Response quality indicators
    const requiredAnalysis = ENTRY_PATH_SETTINGS[entryPath].requiredAnalysis;
    const completeness = requiredAnalysis.every(type => results[type]) ? 1 : 0.5;
    
    // Start with base confidence
    let confidence = completeness;

    // Add quality indicators (implement based on your quality metrics)
    confidence *= 0.9; // Temporary placeholder

    return Math.min(1, Math.max(0, confidence));
  }

  private generateSuggestions(results: Record<string, any>, entryPath: EntryPathType): string[] {
    const suggestions: string[] = [];

    // Add entry path specific suggestions
    switch (entryPath) {
      case EntryPathType.FRESH:
        if (results.complexity === 'high') {
          suggestions.push('Consider breaking down the project into smaller phases');
        }
        break;
      case EntryPathType.GITHUB:
        if (results.migration_path) {
          suggestions.push('Review suggested migration path before proceeding');
        }
        break;
      case EntryPathType.CODE:
        if (results.code_quality) {
          suggestions.push('Address identified code quality issues during migration');
        }
        break;
      case EntryPathType.DOCS:
        if (results.validation) {
          suggestions.push('Validate documentation completeness before proceeding');
        }
        break;
    }

    return suggestions;
  }

  @MonitorAVCA('AI_CLIENT')
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

  /**
   * Generate blueprint from analysis and requirements
   */
  @MonitorAVCA('AI_CLIENT')
  async generateBlueprint(request: BlueprintGenerationRequest): Promise<BlueprintGenerationResult> {
    const startTime = Date.now();

    try {
      // Prepare prompt for blueprint generation
      const prompt = this.prepareBlueprintPrompt(request);

      // Get model configuration for blueprint generation
      const settings = ROLE_SETTINGS[AIRole.DEVELOPER];

      // Create AI request
      const aiRequest: AIRequest = {
        role: AIRole.DEVELOPER,
        prompt,
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
        metadata: {
          operation: 'blueprint_generation',
          entryPath: request.analysis.entryPath
        }
      };

      // Process request
      const response = await this.process(aiRequest);

      // Parse blueprint from response
      const blueprint = JSON.parse(response.content);

      return {
        blueprint,
        tokenUsage: {
          prompt: response.usage.promptTokens,
          completion: response.usage.completionTokens,
          total: response.usage.totalTokens
        },
        cost: response.cost,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: this.calculateBlueprintConfidence(blueprint, request),
          suggestions: this.generateBlueprintSuggestions(blueprint, request)
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log('error', `Blueprint generation failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Prepare prompt for blueprint generation
   */
  private prepareBlueprintPrompt(request: BlueprintGenerationRequest): string {
    return `
Generate a blueprint for a component based on the following analysis and requirements.
Follow these strict guidelines:
1. Use ONLY Tailwind CSS for styling - no custom CSS or design system
2. Ensure all styling uses Tailwind utility classes
3. Implement template variations through Tailwind class conditionals
4. No separate CSS files or modules allowed
5. No @/lib/design-system imports allowed

Analysis Results:
${JSON.stringify(request.analysis.results, null, 2)}

Requirements:
- Functional: ${request.requirements.functional.join(', ')}
- Technical: ${request.requirements.technical.join(', ')}
- Design: ${request.requirements.design.join(', ')}

Available Templates:
${request.templates.map(t => t.name).join(', ')}

Response Format:
{
  "id": "string",
  "name": "string",
  "type": "UI_COMPONENT | SERVICE | HOOK | LAYOUT | PAGE",
  "category": "CORE | SHARED | FEATURE",
  "requirements": {
    "functional": [{"id": "string", "description": "string", "priority": "HIGH | MEDIUM | LOW"}],
    "technical": [{"id": "string", "category": "string", "specification": "string"}],
    "design": [{"pattern": "string", "styling": "tailwind"}]
  },
  "structure": {
    "files": [{"path": "string", "type": "string"}],
    "exports": [{"name": "string", "type": "string"}],
    "imports": [{"source": "string", "imports": ["string"]}]
  }
}`;
  }

  /**
   * Calculate confidence score for generated blueprint
   */
  private calculateBlueprintConfidence(blueprint: any, request: BlueprintGenerationRequest): number {
    let score = 0;

    // Check basic structure
    if (blueprint.id && blueprint.name && blueprint.type) score += 0.2;
    
    // Check requirements coverage
    const hasAllRequirements = 
      blueprint.requirements?.functional?.length >= request.requirements.functional.length &&
      blueprint.requirements?.technical?.length >= request.requirements.technical.length &&
      blueprint.requirements?.design?.length >= request.requirements.design.length;
    if (hasAllRequirements) score += 0.3;

    // Check Tailwind compliance
    const hasTailwindOnly = blueprint.requirements?.design?.every((r: any) => r.styling === 'tailwind');
    if (hasTailwindOnly) score += 0.3;

    // Check file structure
    if (blueprint.structure?.files?.length > 0) score += 0.2;

    return Math.min(1, score);
  }

  /**
   * Generate suggestions for blueprint implementation
   */
  private generateBlueprintSuggestions(blueprint: any, request: BlueprintGenerationRequest): string[] {
    const suggestions: string[] = [];

    // Add template-specific suggestions
    if (blueprint.requirements?.design?.length > 0) {
      suggestions.push('Ensure all styling uses Tailwind utility classes only');
    }

    // Add complexity-based suggestions
    if (blueprint.requirements?.functional?.length > 5) {
      suggestions.push('Consider breaking down into smaller components');
    }

    // Add testing suggestions
    if (blueprint.type === 'UI_COMPONENT') {
      suggestions.push('Add comprehensive component tests');
    }

    return suggestions;
  }
} 