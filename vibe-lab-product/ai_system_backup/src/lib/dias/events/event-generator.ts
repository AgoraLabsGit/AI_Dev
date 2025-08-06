/**
 * DIAS Event Generator
 * 
 * Generates events for various system activities:
 * - System events
 * - Analysis events
 * - Migration events
 */

import { BaseService } from '@/lib/avca/services/base-service';
import { EventBus } from '../../avca/services/event-bus';
import { EventFactory, EventCategory, DIASEvent } from './event-types';

export interface EventGeneratorConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  batchSize?: number;
  flushInterval?: number;
}

export interface EventGenerationResult {
  success: boolean;
  eventId: string;
  generationTime: number;
  metadata: {
    category: EventCategory;
    type: string;
    source: string;
  };
}

export class EventGenerator extends BaseService {
  private eventBus?: EventBus;
  private config: Required<EventGeneratorConfig>;
  private eventQueue: DIASEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: EventGeneratorConfig = {}) {
    super({
      name: config.name || 'event-generator',
      version: config.version || '1.0.0',
      dependencies: []
    });

    this.config = {
      name: config.name || 'event-generator',
      version: config.version || '1.0.0',
      eventBus: config.eventBus,
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000
    };

    this.eventBus = config.eventBus;
  }

  protected async initialize(): Promise<void> {
    this.startFlushTimer();
    this.log('info', 'Event Generator initialized');
  }

  protected async cleanup(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flushEvents();
    this.log('info', 'Event Generator cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Generate a system event
   */
  async generateSystemEvent(
    type: string,
    source: string,
    data: any
  ): Promise<EventGenerationResult> {
    const startTime = Date.now();
    
    try {
      const event = EventFactory.createEvent(
        EventCategory.SYSTEM,
        type,
        source,
        'system',
        data
      );

      await this.queueEvent(event);

      return {
        success: true,
        eventId: event.id,
        generationTime: Date.now() - startTime,
        metadata: {
          category: EventCategory.SYSTEM,
          type,
          source
        }
      };

    } catch (error) {
      this.log('error', `Failed to generate system event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Generate an analysis event
   */
  async generateAnalysisEvent(
    type: string,
    source: string,
    data: any
  ): Promise<EventGenerationResult> {
    const startTime = Date.now();
    
    try {
      const event = EventFactory.createEvent(
        EventCategory.ANALYSIS,
        type,
        source,
        'analysis',
        data
      );

      await this.queueEvent(event);

      return {
        success: true,
        eventId: event.id,
        generationTime: Date.now() - startTime,
        metadata: {
          category: EventCategory.ANALYSIS,
          type,
          source
        }
      };

    } catch (error) {
      this.log('error', `Failed to generate analysis event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Generate a migration event
   */
  async generateMigrationEvent(
    type: string,
    source: string,
    data: any
  ): Promise<EventGenerationResult> {
    const startTime = Date.now();
    
    try {
      const event = EventFactory.createEvent(
        EventCategory.MIGRATION,
        type,
        source,
        'migration',
        data
      );

      await this.queueEvent(event);

      return {
        success: true,
        eventId: event.id,
        generationTime: Date.now() - startTime,
        metadata: {
          category: EventCategory.MIGRATION,
          type,
          source
        }
      };

    } catch (error) {
      this.log('error', `Failed to generate migration event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Queue an event for processing
   */
  private async queueEvent(event: DIASEvent): Promise<void> {
    this.eventQueue.push(event);
    
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.flushEvents();
    }
  }

  /**
   * Flush queued events to the event bus
   */
  private async flushEvents(): Promise<void> {
    if (!this.eventBus || this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await Promise.all(
        events.map(event =>
          this.eventBus!.publish(event.category, event.source, event)
        )
      );
      
      this.log('info', `Flushed ${events.length} events`);
      
    } catch (error) {
      this.log('error', `Failed to flush events: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Re-queue failed events
      this.eventQueue.push(...events);
    }
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(
      () => this.flushEvents(),
      this.config.flushInterval
    );
  }
}