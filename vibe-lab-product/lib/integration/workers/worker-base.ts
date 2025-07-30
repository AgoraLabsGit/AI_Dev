/**
 * Base Worker Classes for Integration Layer
 * 
 * Provides abstraction for AI, Script, and Hybrid workers
 */

import { BaseService } from '../../avca/services/base-service';
import { EventBus } from '../../avca/services/event-bus';
import { DIAS } from '../../dias';
import { VibeLabAI } from '../../avca/services/vibe-lab-ai';

export interface WorkerConfig {
  name: string;
  type: 'ai' | 'script' | 'hybrid';
  version: string;
  concurrency?: number;
  timeout?: number;
}

export interface WorkerInput {
  id: string;
  projectId: string;
  type: string;
  data: any;
  context?: any;
  metadata?: Record<string, any>;
}

export interface WorkerOutput {
  id: string;
  workerId: string;
  status: 'success' | 'failed' | 'partial';
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  duration: number;
  metadata?: Record<string, any>;
}

export interface WorkerContext {
  projectId: string;
  stage?: string;
  previousResults?: any[];
  sharedState?: Record<string, any>;
}

export abstract class BaseWorker extends BaseService {
  protected workerConfig: WorkerConfig;
  protected eventBus: EventBus;
  protected activeJobs: Map<string, AbortController> = new Map();
  
  constructor(config: WorkerConfig, eventBus: EventBus) {
    super({
      name: config.name,
      version: config.version
    });
    this.workerConfig = config;
    this.eventBus = eventBus;
  }

  /**
   * Process input and return output
   */
  abstract process(input: WorkerInput, context: WorkerContext): Promise<WorkerOutput>;

  /**
   * Main entry point for worker
   */
  async execute(input: WorkerInput, context: WorkerContext): Promise<WorkerOutput> {
    const startTime = Date.now();
    const abortController = new AbortController();
    this.activeJobs.set(input.id, abortController);
    
    try {
      // Emit start event
      this.emit('worker-started', {
        workerId: this.config.name,
        inputId: input.id,
        type: input.type
      });
      
      // Process with timeout
      const result = await this.withTimeout(
        this.process(input, context),
        this.workerConfig.timeout || 30000,
        abortController.signal
      );
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      // Emit completion event
      this.emit('worker-completed', {
        workerId: this.config.name,
        inputId: input.id,
        duration,
        status: result.status
      });
      
      return {
        ...result,
        duration,
        workerId: this.config.name
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log('error', `Worker ${this.config.name} failed`, {
        inputId: input.id,
        error: error instanceof Error ? error.message : error
      });
      
      // Emit failure event
      this.emit('worker-failed', {
        workerId: this.config.name,
        inputId: input.id,
        duration,
        error
      });
      
      return {
        id: input.id,
        workerId: this.config.name,
        status: 'failed',
        error: {
          code: 'WORKER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        },
        duration
      };
    } finally {
      this.activeJobs.delete(input.id);
    }
  }

  /**
   * Cancel a job
   */
  cancel(jobId: string): boolean {
    const controller = this.activeJobs.get(jobId);
    if (controller) {
      controller.abort();
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }

  /**
   * Utility: Execute with timeout
   */
  protected async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    signal?: AbortSignal
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`));
        }, timeout);
        
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Operation cancelled'));
        });
      })
    ]);
  }

  /**
   * BaseService implementations
   */
  protected async initialize(): Promise<void> {
    this.log('info', `Worker ${this.config.name} initializing`);
  }

  protected async cleanup(): Promise<void> {
    // Cancel all active jobs
    for (const [jobId, controller] of this.activeJobs) {
      controller.abort();
    }
    this.activeJobs.clear();
  }

  protected async healthCheck(): Promise<boolean> {
    return this.activeJobs.size < (this.workerConfig.concurrency || 10);
  }
}

/**
 * AI Worker - Uses Vibe Lab AI
 */
export abstract class AIWorker extends BaseWorker {
  protected ai: VibeLabAI;
  
  constructor(config: WorkerConfig, eventBus: EventBus, ai: VibeLabAI) {
    super(config, eventBus);
    this.ai = ai;
  }

  /**
   * Enhance prompt with context
   */
  protected async enhance(prompt: string, context: WorkerContext): Promise<string> {
    const contextInfo = context.sharedState 
      ? `\nContext: ${JSON.stringify(context.sharedState, null, 2)}`
      : '';
    
    return `${prompt}${contextInfo}`;
  }

  /**
   * Validate AI output
   */
  protected abstract validate(output: any): Promise<{ valid: boolean; errors?: string[] }>;
}

/**
 * Script Worker - Executes scripts
 */
export abstract class ScriptWorker extends BaseWorker {
  protected runtime: 'node' | 'python' | 'bash';
  
  constructor(config: WorkerConfig, eventBus: EventBus, runtime: 'node' | 'python' | 'bash') {
    super(config, eventBus);
    this.runtime = runtime;
  }

  /**
   * Execute a script (mock implementation)
   */
  protected async runScript(script: string, args: string[]): Promise<string> {
    // In production, this would use child_process or similar
    this.log('info', `Running ${this.runtime} script`, { script, args });
    
    // Mock implementation
    return JSON.stringify({
      script,
      args,
      runtime: this.runtime,
      result: 'mock-result'
    });
  }
}

/**
 * Hybrid Worker - Combines AI and Script capabilities
 */
export abstract class HybridWorker extends BaseWorker {
  protected aiWorker: AIWorker;
  protected scriptWorker: ScriptWorker;
  
  constructor(
    config: WorkerConfig,
    eventBus: EventBus,
    aiWorker: AIWorker,
    scriptWorker: ScriptWorker
  ) {
    super(config, eventBus);
    this.aiWorker = aiWorker;
    this.scriptWorker = scriptWorker;
  }

  /**
   * Process using both AI and script capabilities
   */
  async process(input: WorkerInput, context: WorkerContext): Promise<WorkerOutput> {
    // First, run script analysis
    const scriptResult = await this.scriptWorker.execute(input, context);
    
    if (scriptResult.status === 'failed') {
      return scriptResult;
    }
    
    // Then enhance with AI
    const enhancedInput: WorkerInput = {
      ...input,
      data: {
        ...input.data,
        scriptAnalysis: scriptResult.data
      }
    };
    
    return this.aiWorker.execute(enhancedInput, context);
  }
} 