/**
 * DIAS Event Handlers
 * 
 * Core event handling system for DIAS:
 * - Event processing
 * - Event routing
 * - Event validation
 */

import { BaseService } from '@/lib/avca/services/base-service';
import { EventBus } from '../../avca/services/event-bus';
import { EventCategory, DIASEvent } from './event-types';

export interface EventHandlerConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  maxRetries?: number;
  retryDelay?: number;
}

export interface EventProcessingResult {
  success: boolean;
  eventId: string;
  processingTime: number;
  error?: string | undefined;
  metadata: {
    retries: number;
    handler: string;
    category: EventCategory;
  };
}

export interface EventHandler {
  canHandle(event: DIASEvent): boolean;
  handle(event: DIASEvent): Promise<void>;
  priority: number;
}

export class EventHandlingSystem extends BaseService {
  private eventBus?: EventBus;
  private config: Required<EventHandlerConfig>;
  private handlers: Map<string, EventHandler[]> = new Map();
  private processingHistory: Map<string, EventProcessingResult> = new Map();

  constructor(config: EventHandlerConfig = {}) {
    super({
      name: config.name || 'event-handling-system',
      version: config.version || '1.0.0',
      dependencies: []
    });

    this.config = {
      name: config.name || 'event-handling-system',
      version: config.version || '1.0.0',
      eventBus: config.eventBus,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000
    };

    this.eventBus = config.eventBus;
  }

  protected async initialize(): Promise<void> {
    await this.setupEventHandlers();
    await this.subscribeToEvents();
    this.log('info', 'Event Handling System initialized');
  }

  protected async cleanup(): Promise<void> {
    this.handlers.clear();
    this.processingHistory.clear();
    this.log('info', 'Event Handling System cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    return this.handlers.size > 0;
  }

  /**
   * Register a new event handler
   */
  registerHandler(category: EventCategory, handler: EventHandler): void {
    const existingHandlers = this.handlers.get(category) || [];
    existingHandlers.push(handler);
    
    // Sort by priority (higher numbers first)
    existingHandlers.sort((a, b) => b.priority - a.priority);
    
    this.handlers.set(category, existingHandlers);
    this.log('info', `Registered handler for category: ${category}`);
  }

  /**
   * Process an incoming event
   */
  async processEvent(event: DIASEvent): Promise<EventProcessingResult> {
    const startTime = Date.now();
    const handlers = this.handlers.get(event.category) || [];
    
    if (handlers.length === 0) {
      return {
        success: false,
        eventId: event.id,
        processingTime: Date.now() - startTime,
        error: `No handlers registered for category: ${event.category}`,
        metadata: {
          retries: 0,
          handler: 'none',
          category: event.category
        }
      };
    }

    let retries = 0;
    let lastError: string | undefined;

    while (retries < this.config.maxRetries) {
      try {
        // Find first handler that can handle this event
        const handler = handlers.find(h => h.canHandle(event));
        if (!handler) {
          throw new Error(`No suitable handler found for event: ${event.id}`);
        }

        // Handle the event
        await handler.handle(event);

        const result: EventProcessingResult = {
          success: true,
          eventId: event.id,
          processingTime: Date.now() - startTime,
          metadata: {
            retries,
            handler: handler.constructor.name,
            category: event.category
          }
        };

        // Store result in history
        this.processingHistory.set(event.id, result);
        return result;

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        retries++;
        
        if (retries < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    const failureResult: EventProcessingResult = {
      success: false,
      eventId: event.id,
      processingTime: Date.now() - startTime,
      error: lastError || undefined,
      metadata: {
        retries,
        handler: 'failed',
        category: event.category
      }
    };

    // Store failure in history
    this.processingHistory.set(event.id, failureResult);
    return failureResult;
  }

  /**
   * Get processing history for an event
   */
  getEventHistory(eventId: string): EventProcessingResult | undefined {
    return this.processingHistory.get(eventId);
  }

  /**
   * Clear processing history
   */
  clearHistory(): void {
    this.processingHistory.clear();
  }

  private async setupEventHandlers(): Promise<void> {
    // Register system event handlers
    this.registerHandler(EventCategory.SYSTEM, {
      canHandle: (event) => event.category === EventCategory.SYSTEM,
      handle: async (event) => {
        this.log('info', `Processing system event: ${event.type}`);
        // Handle system events
      },
      priority: 10
    });

    // Register analysis event handlers
    this.registerHandler(EventCategory.ANALYSIS, {
      canHandle: (event) => event.category === EventCategory.ANALYSIS,
      handle: async (event) => {
        this.log('info', `Processing analysis event: ${event.type}`);
        // Handle analysis events
      },
      priority: 5
    });

    // Register migration event handlers
    this.registerHandler(EventCategory.MIGRATION, {
      canHandle: (event) => event.category === EventCategory.MIGRATION,
      handle: async (event) => {
        this.log('info', `Processing migration event: ${event.type}`);
        // Handle migration events
      },
      priority: 5
    });
  }

  private async subscribeToEvents(): Promise<void> {
    if (this.eventBus) {
      // Subscribe to all event categories
      Object.values(EventCategory).forEach(category => {
        this.eventBus!.subscribe(category, 'event-handling-system', async (event: DIASEvent) => {
          await this.processEvent(event);
        });
      });
    }
  }
}