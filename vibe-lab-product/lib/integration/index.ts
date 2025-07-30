/**
 * Integration Layer
 * 
 * Connects AVCA and DIAS systems with worker orchestration and state management
 */

import { BaseService } from '../avca/services/base-service';
import { EventBus } from '../avca/services/event-bus';
import { ServiceRegistry } from '../avca/services/service-registry';
import { DIAS } from '../dias';
import { VibeLabAI } from '../avca/services/vibe-lab-ai';
import { WorkerManager } from './workers/worker-manager';
import { StateManager } from './state-manager';
import { AIWorker, WorkerConfig, WorkerInput, WorkerOutput, WorkerContext } from './workers/worker-base';

export interface IntegrationConfig {
  enableWorkers?: boolean;
  enableStateSync?: boolean;
  workerPoolSizes?: {
    ai?: { min: number; max: number };
    script?: { min: number; max: number };
    hybrid?: { min: number; max: number };
  };
}

export class IntegrationService extends BaseService {
  private eventBus: EventBus;
  private registry: ServiceRegistry;
  private dias: DIAS;
  private ai: VibeLabAI;
  private workerManager: WorkerManager;
  private stateManager: StateManager;
  private integrationConfig: IntegrationConfig;

  constructor(
    eventBus: EventBus,
    registry: ServiceRegistry,
    dias: DIAS,
    ai: VibeLabAI,
    config: IntegrationConfig = {}
  ) {
    super({
      name: 'integration-service',
      version: '1.0.0'
    });
    
    this.eventBus = eventBus;
    this.registry = registry;
    this.dias = dias;
    this.ai = ai;
    this.integrationConfig = {
      enableWorkers: true,
      enableStateSync: true,
      workerPoolSizes: {
        ai: { min: 1, max: 3 },
        script: { min: 1, max: 2 },
        hybrid: { min: 1, max: 2 }
      },
      ...config
    };
    
    // Initialize components
    this.workerManager = new WorkerManager(eventBus);
    this.stateManager = new StateManager(eventBus, dias);
  }

  /**
   * Process an integration request
   */
  async process(input: any): Promise<any> {
    // This is the main entry point for integration requests
    const { type, projectId, data } = input;
    
    switch (type) {
      case 'execute-worker':
        return this.executeWorker(data);
      
      case 'sync-state':
        return this.syncState(projectId);
      
      case 'get-state':
        return this.getProjectState(projectId);
      
      default:
        throw new Error(`Unknown integration request type: ${type}`);
    }
  }

  /**
   * Execute a worker job
   */
  async executeWorker(jobRequest: {
    workerType: string;
    input: WorkerInput;
    context?: WorkerContext;
    priority?: number;
  }): Promise<WorkerOutput> {
    if (!this.integrationConfig.enableWorkers) {
      throw new Error('Workers are disabled');
    }
    
    return this.workerManager.submitJob({
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workerType: jobRequest.workerType,
      input: jobRequest.input,
      context: jobRequest.context || {
        projectId: jobRequest.input.projectId
      },
      priority: jobRequest.priority
    });
  }

  /**
   * Sync project state between systems
   */
  async syncState(projectId: string): Promise<void> {
    if (!this.config.enableStateSync) {
      throw new Error('State sync is disabled');
    }
    
    return this.stateManager.syncState(projectId);
  }

  /**
   * Get project state
   */
  getProjectState(projectId: string): any {
    return this.stateManager.getProjectState(projectId);
  }

  /**
   * Update project state
   */
  updateProjectState(
    projectId: string,
    updates: any,
    source: 'avca' | 'dias'
  ): void {
    this.stateManager.updateProjectState(projectId, updates, source);
  }

  /**
   * Subscribe to state changes
   */
  subscribeToState(projectId: string, callback: (state: any) => void): () => void {
    return this.stateManager.subscribe(projectId, callback);
  }

  /**
   * Get integration statistics
   */
  getStats(): any {
    return {
      workers: this.workerManager.getStats(),
      state: {
        projects: this.stateManager.getSnapshot().projects,
        historySize: this.stateManager.getHistory().length
      }
    };
  }

  /**
   * BaseService implementations
   */
  protected async initialize(): Promise<void> {
    // Register worker pools if enabled
    if (this.config.enableWorkers) {
      await this.registerWorkerPools();
    }
    
    // Register with service registry
    await this.registry.register(this.workerManager);
    
    // Start worker manager
    await this.workerManager.start();
    
    // Setup event bridges
    this.setupEventBridges();
    
    this.log('info', 'Integration service initialized');
  }

  protected async cleanup(): Promise<void> {
    // Stop worker manager
    await this.workerManager.stop();
    
    this.log('info', 'Integration service cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    // Check worker manager health
    const workerHealth = await this.workerManager.healthCheck();
    
    // Check DIAS connection
    const diasHealth = this.dias.isInitialized();
    
    return workerHealth && diasHealth;
  }

  /**
   * Register worker pools
   */
  private async registerWorkerPools(): Promise<void> {
    // Register AI worker pool
    if (this.config.workerPoolSizes?.ai) {
      this.workerManager.registerWorkerPool('ai', {
        workerClass: ComponentGeneratorWorker as any,
        minWorkers: this.config.workerPoolSizes.ai.min,
        maxWorkers: this.config.workerPoolSizes.ai.max
      });
    }
    
    // Additional worker pools would be registered here
  }

  /**
   * Setup event bridges between AVCA and DIAS
   */
  private setupEventBridges(): void {
    // Bridge component events
    this.eventBus.subscribe(
      'component',
      'integration-bridge',
      async (message) => {
        const event = message.data;
        
        // Update state
        if (event.type === 'component.created' || event.type === 'component.updated') {
          const state = this.stateManager.getProjectState(event.projectId);
          if (state) {
            this.log('info', 'Bridging component event to state', {
              eventType: event.type,
              projectId: event.projectId
            });
          }
        }
      }
    );
    
    // Bridge quality events
    this.eventBus.subscribe(
      'quality',
      'integration-bridge',
      async (message) => {
        const event = message.data;
        
        // If quality check failed, notify DIAS for analysis
        if (event.type === 'quality.check.failed') {
          await this.dias.emitIntegrationEvent(
            'integration.dias.suggestion',
            event.projectId,
            {
              sourceSystem: 'avca',
              targetSystem: 'dias',
              operation: 'quality-analysis',
              payload: event.data
            }
          );
        }
      }
    );
  }
}

/**
 * Example AI Worker implementation
 */
class ComponentGeneratorWorker extends AIWorker {
  constructor(config: WorkerConfig, eventBus: EventBus, ai: VibeLabAI) {
    super(config, eventBus, ai);
  }
  
  async process(input: WorkerInput, context: WorkerContext): Promise<WorkerOutput> {
    try {
      // Generate component using AI
      const prompt = await this.enhance(
        `Generate a React component based on: ${JSON.stringify(input.data)}`,
        context
      );
      
      const result = await this.ai.generateComponent({
        prompt,
        projectId: input.projectId,
        metadata: input.metadata
      });
      
      // Validate result
      const validation = await this.validate(result);
      
      if (!validation.valid) {
        return {
          id: input.id,
          workerId: this.config.name,
          status: 'failed',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Generated component failed validation',
            details: validation.errors
          },
          duration: 0
        };
      }
      
      return {
        id: input.id,
        workerId: this.config.name,
        status: 'success',
        data: result,
        duration: 0
      };
      
    } catch (error) {
      return {
        id: input.id,
        workerId: this.config.name,
        status: 'failed',
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        duration: 0
      };
    }
  }
  
  protected async validate(output: any): Promise<{ valid: boolean; errors?: string[] }> {
    // Simple validation - check if component has required fields
    const errors: string[] = [];
    
    if (!output.name) errors.push('Component name is required');
    if (!output.code) errors.push('Component code is required');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export all integration components
export { WorkerManager } from './workers/worker-manager';
export { StateManager } from './state-manager';
export * from './workers/worker-base'; 