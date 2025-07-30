/**
 * DIAS Event Handlers
 * 
 * Handles events for the AVCA-DIAS pipeline lifecycle
 */

import { EventBus } from '../../avca/services/event-bus';
import { BaseService } from '../../avca/services/base-service';
import {
  DIASEvent,
  EventCategory,
  ComponentEvent,
  PipelineEvent,
  QualityEvent,
  UserEvent,
  SystemEvent,
  IntegrationEvent,
  isComponentEvent,
  isPipelineEvent,
  isQualityEvent,
  isUserEvent,
  isSystemEvent,
  isIntegrationEvent
} from './event-types';

export interface EventHandlerConfig {
  enableAuditTrail?: boolean;
  auditRetentionDays?: number;
  deadLetterRetryInterval?: number;
  maxDeadLetterRetries?: number;
}

export interface EventAuditEntry {
  id: string;
  eventId: string;
  timestamp: Date;
  category: EventCategory;
  type: string;
  source: string;
  projectId: string;
  data: any;
  metadata?: Record<string, any>;
  ttl?: Date;
}

export class DIASEventHandler extends BaseService {
  private eventBus: EventBus;
  private handlerConfig: EventHandlerConfig;
  private auditTrail: EventAuditEntry[] = [];
  private eventHandlers: Map<string, ((event: DIASEvent) => Promise<void>)[]> = new Map();
  private deadLetterProcessor?: NodeJS.Timeout;

  constructor(eventBus: EventBus, config: EventHandlerConfig = {}) {
    super({
      name: 'dias-event-handler',
      version: '1.0.0'
    });
    this.eventBus = eventBus;
    this.handlerConfig = {
      enableAuditTrail: true,
      auditRetentionDays: 30,
      deadLetterRetryInterval: 60000, // 1 minute
      maxDeadLetterRetries: 3,
      ...config
    };
  }

  // BaseService abstract methods implementation
  async process(input: any): Promise<any> {
    // This service processes events through the event bus
    // The actual processing happens in handleEvent
    return { processed: true };
  }

  protected async initialize(): Promise<void> {
    // Subscribe to all DIAS event categories
    this.subscribeToEvents();
    
    // Start dead letter queue processor
    if (this.handlerConfig.deadLetterRetryInterval) {
      this.startDeadLetterProcessor();
    }
    
    this.emit('event-handler-ready', {});
  }

  protected async cleanup(): Promise<void> {
    // Stop dead letter processor
    if (this.deadLetterProcessor) {
      clearInterval(this.deadLetterProcessor);
    }
    
    // Persist audit trail if needed
    if (this.handlerConfig.enableAuditTrail) {
      await this.persistAuditTrail();
    }
  }

  protected async healthCheck(): Promise<boolean> {
    // Check if event bus is connected and handler is processing
    try {
      const metrics = this.eventBus.getMetrics();
      return metrics.totalSubscriptions > 0;
    } catch {
      return false;
    }
  }

  /**
   * Subscribe to all event categories
   */
  private subscribeToEvents(): void {
    const serviceName = this.config.name;
    
    // Component events
    this.eventBus.subscribe(
      EventCategory.COMPONENT,
      serviceName,
      async (message) => this.handleEvent(message.data as ComponentEvent)
    );

    // Pipeline events
    this.eventBus.subscribe(
      EventCategory.PIPELINE,
      serviceName,
      async (message) => this.handleEvent(message.data as PipelineEvent)
    );

    // Quality events
    this.eventBus.subscribe(
      EventCategory.QUALITY,
      serviceName,
      async (message) => this.handleEvent(message.data as QualityEvent)
    );

    // User events
    this.eventBus.subscribe(
      EventCategory.USER,
      serviceName,
      async (message) => this.handleEvent(message.data as UserEvent)
    );

    // System events
    this.eventBus.subscribe(
      EventCategory.SYSTEM,
      serviceName,
      async (message) => this.handleEvent(message.data as SystemEvent)
    );

    // Integration events
    this.eventBus.subscribe(
      EventCategory.INTEGRATION,
      serviceName,
      async (message) => this.handleEvent(message.data as IntegrationEvent)
    );
  }

  /**
   * Main event handler
   */
  private async handleEvent(event: DIASEvent): Promise<void> {
    try {
      // Audit trail
      if (this.handlerConfig.enableAuditTrail) {
        this.addToAuditTrail(event);
      }

      // Route to specific handlers
      if (isComponentEvent(event)) {
        await this.handleComponentEvent(event);
      } else if (isPipelineEvent(event)) {
        await this.handlePipelineEvent(event);
      } else if (isQualityEvent(event)) {
        await this.handleQualityEvent(event);
      } else if (isUserEvent(event)) {
        await this.handleUserEvent(event);
      } else if (isSystemEvent(event)) {
        await this.handleSystemEvent(event);
      } else if (isIntegrationEvent(event)) {
        await this.handleIntegrationEvent(event);
      }

      // Call registered handlers
      const handlers = this.eventHandlers.get(event.type) || [];
      await Promise.all(handlers.map(handler => handler(event)));

      // Emit processed event
      this.emit('event-processed', {
        eventId: event.id,
        category: event.category,
        type: event.type
      });

    } catch (error) {
      this.log('error', 'Failed to handle event', {
        eventId: event.id,
        error: error instanceof Error ? error.message : error
      });
      
      // Re-throw to trigger dead letter queue
      throw error;
    }
  }

  /**
   * Handle component lifecycle events
   */
  private async handleComponentEvent(event: ComponentEvent): Promise<void> {
    this.log('info', `Component event: ${event.type}`, {
      componentId: event.data.componentId,
      componentName: event.data.componentName
    });

    // Specific handling based on event type
    switch (event.type) {
      case 'component.created':
        // Trigger quality checks
        this.log('info', 'Triggering quality checks', { componentId: event.data.componentId });
        break;
      
      case 'component.updated':
        // Re-run affected tests
        this.log('info', 'Triggering dependent tests', { componentId: event.data.componentId });
        break;
      
      case 'component.registered':
        // Update component registry
        this.log('info', 'Updating component registry', { componentId: event.data.componentId });
        break;
    }
  }

  /**
   * Handle pipeline events
   */
  private async handlePipelineEvent(event: PipelineEvent): Promise<void> {
    this.log('info', `Pipeline event: ${event.type}`, {
      pipelineId: event.data.pipelineId,
      stage: event.data.stage
    });

    // Track pipeline metrics
    if (event.type === 'pipeline.stage.completed' && event.data.duration) {
      this.emitEvent('metric', {
        name: 'pipeline.stage.duration',
        value: event.data.duration,
        tags: { stage: event.data.stage || 'unknown' }
      });
    }

    // Handle failures
    if (event.type === 'pipeline.failed' || event.type === 'pipeline.stage.failed') {
      this.log('error', 'Pipeline failure', {
        pipelineId: event.data.pipelineId,
        error: event.data.error
      });
    }
  }

  /**
   * Handle quality gate events
   */
  private async handleQualityEvent(event: QualityEvent): Promise<void> {
    this.log('info', `Quality event: ${event.type}`, {
      checkType: event.data.checkType,
      passed: event.data.result?.passed
    });

    // Record quality metrics
    if (event.data.result) {
      this.emitEvent('metric', {
        name: 'quality.score',
        value: event.data.result.score,
        tags: { checkType: event.data.checkType }
      });
    }

    // Handle quality failures
    if (event.type === 'quality.check.failed') {
      this.log('warn', 'Quality check failed', {
        checkType: event.data.checkType,
        score: event.data.result?.score
      });
    }
  }

  /**
   * Handle user decision events
   */
  private async handleUserEvent(event: UserEvent): Promise<void> {
    this.log('info', `User event: ${event.type}`, {
      userId: event.data.userId,
      action: event.data.action,
      decision: event.data.decision
    });

    // Track user decisions for learning
    if (event.type === 'user.approved' || event.type === 'user.rejected') {
      this.log('info', 'Recording user decision', {
        decision: event.data.decision,
        target: event.data.target
      });
    }
  }

  /**
   * Handle system events
   */
  private async handleSystemEvent(event: SystemEvent): Promise<void> {
    this.log('info', `System event: ${event.type}`, {
      service: event.data.service,
      status: event.data.status
    });

    // Handle critical system events
    if (event.type === 'system.error' || event.data.status === 'down') {
      this.log('error', 'System error', {
        service: event.data.service,
        error: event.data.error
      });
    }
  }

  /**
   * Handle integration events
   */
  private async handleIntegrationEvent(event: IntegrationEvent): Promise<void> {
    this.log('info', `Integration event: ${event.type}`, {
      source: event.data.sourceSystem,
      target: event.data.targetSystem,
      operation: event.data.operation
    });

    // Track integration metrics
    if (event.data.result) {
      this.emitEvent('metric', {
        name: 'integration.success.rate',
        value: event.data.result.success ? 1 : 0,
        tags: {
          source: event.data.sourceSystem,
          target: event.data.targetSystem
        }
      });
    }
  }

  /**
   * Register custom event handler
   */
  registerHandler(eventType: string, handler: (event: DIASEvent) => Promise<void>): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Add event to audit trail
   */
  private addToAuditTrail(event: DIASEvent): void {
    const auditEntry: EventAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventId: event.id,
      timestamp: new Date(),
      category: event.category,
      type: event.type,
      source: event.source,
      projectId: event.projectId,
      data: event.data,
      metadata: event.metadata,
      ttl: new Date(Date.now() + (this.handlerConfig.auditRetentionDays! * 24 * 60 * 60 * 1000))
    };

    this.auditTrail.push(auditEntry);

    // Clean up old entries
    this.cleanupAuditTrail();
  }

  /**
   * Clean up expired audit entries
   */
  private cleanupAuditTrail(): void {
    const now = new Date();
    this.auditTrail = this.auditTrail.filter(entry => 
      !entry.ttl || entry.ttl > now
    );
  }

  /**
   * Get audit trail for project
   */
  getAuditTrail(projectId: string, limit?: number): EventAuditEntry[] {
    const projectAudit = this.auditTrail.filter(entry => 
      entry.projectId === projectId
    );
    
    if (limit) {
      return projectAudit.slice(-limit);
    }
    
    return projectAudit;
  }

  /**
   * Start dead letter queue processor
   */
  private startDeadLetterProcessor(): void {
    this.deadLetterProcessor = setInterval(async () => {
      const deadLetters = this.eventBus.getDeadLetterQueue();
      
      for (const message of deadLetters) {
        const retryCount = message.metadata?.retryCount || 0;
        
        if (retryCount < this.handlerConfig.maxDeadLetterRetries!) {
          // Retry the message
          await this.eventBus.publish(
            message.topic,
            'dead-letter-retry',
            message.data,
            {
              ...message.metadata,
              retryCount: retryCount + 1,
              correlationId: message.id
            }
          );
        }
      }
      
      // Clear processed dead letters
      this.eventBus.clearDeadLetterQueue();
      
    }, this.handlerConfig.deadLetterRetryInterval!);
  }

  /**
   * Persist audit trail to storage
   */
  private async persistAuditTrail(): Promise<void> {
    // Implementation would persist audit trail to storage
    this.log('info', 'Persisting audit trail', {
      entries: this.auditTrail.length
    });
  }

  /**
   * Get event statistics
   */
  getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const entry of this.auditTrail) {
      const key = `${entry.category}.${entry.type}`;
      stats[key] = (stats[key] || 0) + 1;
    }
    
    return stats;
  }
} 