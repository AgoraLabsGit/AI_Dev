import { EventBus } from './event-bus';
import { ServiceRegistry } from './service-registry';
import { AIClientService, AIRole, AIRequest, AIResponse } from './ai-client';
import { ContextManager, ProjectContext } from './context-manager';
import { tokenTracker } from '../token-tracking';

export interface VibeLabAIRequest {
  type: 'development' | 'audit' | 'routing';
  prompt: string;
  projectContext?: ProjectContext;
  additionalContext?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface VibeLabAIResponse extends AIResponse {
  type: 'development' | 'audit' | 'routing';
  contextUsed: string;
}

export class VibeLabAI {
  private aiClient: AIClientService;
  private contextManager: ContextManager;
  private eventBus: EventBus;
  private registry: ServiceRegistry;
  private initialized = false;

  constructor() {
    this.eventBus = new EventBus({
      maxRetries: 3,
      retryDelay: 1000,
      maxQueueSize: 100  // Changed from deadLetterQueueSize
    });
    
    this.registry = new ServiceRegistry(this.eventBus);
    this.contextManager = new ContextManager();
    this.aiClient = new AIClientService(this.eventBus);
  }

  /**
   * Initialize the AI system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Start service registry
      await this.registry.start();
      
      // Register and start AI client
      await this.registry.register(this.aiClient);
      await this.aiClient.start();
      
      this.initialized = true;
      console.log('VibeLab AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VibeLab AI:', error);
      throw error;
    }
  }

  /**
   * Process a VibeLab AI request
   */
  async process(request: VibeLabAIRequest): Promise<VibeLabAIResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Map request type to AI role
    const roleMap: Record<VibeLabAIRequest['type'], AIRole> = {
      'development': AIRole.DEVELOPER,
      'audit': AIRole.AUDITOR,
      'routing': AIRole.ROUTER
    };

    const role = roleMap[request.type];
    
    // Prepare context based on role
    const projectContext = request.projectContext || {
      projectId: 'default',
      projectName: 'Vibe Lab Project',
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL']
    };

    const context = this.contextManager.prepareContext(
      role,
      projectContext,
      request.additionalContext
    );

    // Create AI request
    const aiRequest: AIRequest = {
      role,
      prompt: request.prompt,
      context,
      temperature: request.options?.temperature,
      maxTokens: request.options?.maxTokens
    };

    // Process through AI client
    const aiResponse = await this.aiClient.process(aiRequest);

    // Return enhanced response
    return {
      ...aiResponse,
      type: request.type,
      contextUsed: context
    };
  }

  /**
   * Development-specific helper
   */
  async generateCode(
    prompt: string,
    projectContext?: ProjectContext,
    codeContext?: string
  ): Promise<VibeLabAIResponse> {
    return this.process({
      type: 'development',
      prompt: `Generate code for the following request:\n\n${prompt}`,
      projectContext,
      additionalContext: codeContext,
      options: {
        temperature: 0.2,
        maxTokens: 4096
      }
    });
  }

  /**
   * Audit-specific helper
   */
  async reviewCode(
    code: string,
    projectContext?: ProjectContext,
    reviewFocus?: string
  ): Promise<VibeLabAIResponse> {
    const prompt = reviewFocus
      ? `Review the following code with focus on ${reviewFocus}:`
      : 'Review the following code for quality, security, and best practices:';

    return this.process({
      type: 'audit',
      prompt,
      projectContext,
      additionalContext: code,
      options: {
        temperature: 0.1,
        maxTokens: 3000
      }
    });
  }

  /**
   * Routing-specific helper
   */
  async classifyIntent(
    userMessage: string,
    projectContext?: ProjectContext
  ): Promise<VibeLabAIResponse> {
    return this.process({
      type: 'routing',
      prompt: 'Classify the intent of this message and determine the appropriate system to handle it.',
      projectContext,
      additionalContext: userMessage,
      options: {
        temperature: 0.1,
        maxTokens: 500
      }
    });
  }

  /**
   * Get system metrics
   */
  async getMetrics() {
    const aiMetrics = this.aiClient.getStatus().metrics;
    
    // Get today's date for daily metrics
    const today = new Date().toISOString().split('T')[0];
    const dailyMetrics = tokenTracker.getDailyMetrics(today);
    
    return {
      ai: {
        requestsProcessed: aiMetrics.requestsProcessed || 0,
        errorsCount: aiMetrics.errorsCount || 0,  // Fixed property name
        averageResponseTime: aiMetrics.averageResponseTime || 0,
        activeRequests: this.aiClient.getActiveRequests(),
        queueSize: this.aiClient.getQueueSize()
      },
      tokens: {
        daily: dailyMetrics,
        // We'll aggregate by role from the usage map
        byRole: this.aggregateTokensByRole()
      },
      context: {
        cacheSize: this.contextManager.getCacheSize()
      }
    };
  }

  /**
   * Aggregate token usage by AI role
   */
  private aggregateTokensByRole() {
    // This is a simplified aggregation
    // In a real implementation, we'd track usage by role more explicitly
    return {
      developer: { totalTokens: 0, totalCost: 0, requestCount: 0 },
      auditor: { totalTokens: 0, totalCost: 0, requestCount: 0 },
      router: { totalTokens: 0, totalCost: 0, requestCount: 0 }
    };
  }

  /**
   * Shutdown the AI system
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await this.aiClient.stop();
      await this.registry.stop();
      this.contextManager.clearCache();
      this.initialized = false;
      console.log('VibeLab AI shutdown successfully');
    } catch (error) {
      console.error('Error during VibeLab AI shutdown:', error);
      throw error;
    }
  }

  /**
   * Update AI concurrency settings
   */
  setConcurrencyLimit(limit: number): void {
    this.aiClient.setConcurrencyLimit(limit);
  }
} 