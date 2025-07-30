/**
 * DIAS (Dynamic Intelligence & Adaptation System)
 * 
 * Main entry point for DIAS functionality
 */

import { EventBus } from '../avca/services/event-bus';
import { ServiceRegistry } from '../avca/services/service-registry';
import { DIASEventHandler } from './events/event-handlers';
import { 
  EventFactory, 
  EventCategory,
  PipelineEventType,
  ComponentEventType,
  SystemEventType,
  IntegrationEventType
} from './events/event-types';

export interface DIASConfig {
  enableAuditTrail?: boolean;
  enableLearning?: boolean;
  enableSuggestions?: boolean;
}

export class DIAS {
  private eventBus: EventBus;
  private registry: ServiceRegistry;
  private eventHandler: DIASEventHandler;
  private config: DIASConfig;
  private initialized = false;

  constructor(eventBus: EventBus, registry: ServiceRegistry, config: DIASConfig = {}) {
    this.eventBus = eventBus;
    this.registry = registry;
    this.config = {
      enableAuditTrail: true,
      enableLearning: true,
      enableSuggestions: false, // Phase 2
      ...config
    };
    
    // Create event handler
    this.eventHandler = new DIASEventHandler(eventBus, {
      enableAuditTrail: this.config.enableAuditTrail
    });
  }

  /**
   * Initialize DIAS
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Register event handler with service registry
    await this.registry.register(this.eventHandler);
    
    // Start the event handler
    await this.eventHandler.start();
    
    // Emit system ready event
    await this.emitSystemEvent(SystemEventType.READY, {
      message: 'DIAS initialized and ready',
      service: 'dias-core'
    });
    
    this.initialized = true;
  }

  /**
   * Shutdown DIAS
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Emit shutdown event
    await this.emitSystemEvent(SystemEventType.SHUTDOWN, {
      message: 'DIAS shutting down',
      service: 'dias-core'
    });
    
    // Stop event handler
    await this.eventHandler.stop();
    
    // Deregister from registry
    // Note: deregister expects instance ID, not service name
    // For now, we'll skip deregistration as we don't track the instance ID
    
    this.initialized = false;
  }

  /**
   * Emit a pipeline event
   */
  async emitPipelineEvent(
    type: PipelineEventType,
    projectId: string,
    data: any
  ): Promise<void> {
    const event = EventFactory.createEvent(
      EventCategory.PIPELINE,
      type,
      'dias-core',
      projectId,
      data
    );
    
    await this.eventBus.publish(EventCategory.PIPELINE, 'dias-core', event);
  }

  /**
   * Emit a component event
   */
  async emitComponentEvent(
    type: ComponentEventType,
    projectId: string,
    data: any
  ): Promise<void> {
    const event = EventFactory.createEvent(
      EventCategory.COMPONENT,
      type,
      'dias-core',
      projectId,
      data
    );
    
    await this.eventBus.publish(EventCategory.COMPONENT, 'dias-core', event);
  }

  /**
   * Emit a system event
   */
  async emitSystemEvent(
    type: SystemEventType,
    data: any
  ): Promise<void> {
    const event = EventFactory.createEvent(
      EventCategory.SYSTEM,
      type,
      'dias-core',
      'system', // System events don't belong to a specific project
      data
    );
    
    await this.eventBus.publish(EventCategory.SYSTEM, 'dias-core', event);
  }

  /**
   * Emit an integration event
   */
  async emitIntegrationEvent(
    type: IntegrationEventType,
    projectId: string,
    data: any
  ): Promise<void> {
    const event = EventFactory.createEvent(
      EventCategory.INTEGRATION,
      type,
      'dias-core',
      projectId,
      data
    );
    
    await this.eventBus.publish(EventCategory.INTEGRATION, 'dias-core', event);
  }

  /**
   * Get audit trail for a project
   */
  getAuditTrail(projectId: string, limit?: number): any[] {
    return this.eventHandler.getAuditTrail(projectId, limit);
  }

  /**
   * Get event statistics
   */
  getEventStats(): Record<string, number> {
    return this.eventHandler.getEventStats();
  }

  /**
   * Register custom event handler
   */
  registerEventHandler(
    eventType: string,
    handler: (event: any) => Promise<void>
  ): void {
    this.eventHandler.registerHandler(eventType, handler);
  }

  /**
   * Check if DIAS is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get DIAS configuration
   */
  getConfig(): DIASConfig {
    return { ...this.config };
  }
}

// Export event types for external use
export * from './events/event-types';
export { DIASEventHandler } from './events/event-handlers'; 