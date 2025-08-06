/**
 * Event Bus for AVCA Microservices
 * 
 * Provides pub/sub messaging between services:
 * - Topic-based routing
 * - Message persistence
 * - Dead letter queue
 * - Retry logic
 * - Message ordering
 */

import { EventEmitter } from 'events';

export interface EventBusConfig {
  maxRetries?: number;
  retryDelay?: number;
  maxQueueSize?: number;
  persistMessages?: boolean;
}

export interface Message {
  id: string;
  topic: string;
  source: string;
  timestamp: Date;
  data: any;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    version?: string;
    retryCount?: number;
    failureReason?: string;
    failedSubscriber?: string;
    failedAt?: string;
  };
}

export interface Subscription {
  id: string;
  topic: string;
  subscriber: string;
  handler: (message: Message) => Promise<void>;
  filter?: ((message: Message) => boolean) | undefined;
}

export class EventBus extends EventEmitter {
  private config: EventBusConfig;
  private subscriptions: Map<string, Subscription[]> = new Map();
  private messageQueue: Map<string, Message[]> = new Map();
  private deadLetterQueue: Message[] = [];
  private messageCounter = 0;

  constructor(config: EventBusConfig = {}) {
    super();
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      maxQueueSize: 1000,
      persistMessages: false,
      ...config
    };
  }

  /**
   * Subscribe to a topic
   */
  subscribe(
    topic: string,
    subscriber: string,
    handler: (message: Message) => Promise<void>,
    filter?: (message: Message) => boolean | undefined
  ): string {
    const subscription: Subscription = {
      id: `sub-${++this.messageCounter}`,
      topic,
      subscriber,
      handler,
      filter
    };

    const topicSubs = this.subscriptions.get(topic) || [];
    topicSubs.push(subscription);
    this.subscriptions.set(topic, topicSubs);

    this.log('info', `Subscriber ${subscriber} subscribed to topic ${topic}`);
    
    // Process any queued messages
    this.processQueuedMessages(topic);

    return subscription.id;
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(subscriptionId: string): void {
    for (const [topic, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        const removed = subs.splice(index, 1)[0];
        this.log('info', `Subscriber ${removed.subscriber} unsubscribed from topic ${topic}`);
        break;
      }
    }
  }

  /**
   * Publish a message to a topic
   */
  async publish(
    topic: string,
    source: string,
    data: any,
    metadata?: Message['metadata']
  ): Promise<void> {
    const message: Message = {
      id: `msg-${++this.messageCounter}`,
      topic,
      source,
      timestamp: new Date(),
      data,
      metadata: {
        ...metadata,
        retryCount: 0
      }
    };

    this.log('debug', `Publishing message to topic ${topic}`, { messageId: message.id });

    // Get subscribers for this topic
    const subscribers = this.subscriptions.get(topic) || [];
    
    if (subscribers.length === 0) {
      // No subscribers, queue the message
      this.queueMessage(topic, message);
      return;
    }

    // Deliver to each subscriber
    await Promise.all(
      subscribers.map(sub => this.deliverMessage(sub, message))
    );
  }

  /**
   * Deliver a message to a subscriber
   */
  private async deliverMessage(
    subscription: Subscription,
    message: Message
  ): Promise<void> {
    // Apply filter if provided
    if (subscription.filter && !subscription.filter(message)) {
      return;
    }

    const startTime = Date.now();
    
    try {
      await subscription.handler(message);
      
      const duration = Date.now() - startTime;
      this.emit('message-delivered', {
        messageId: message.id,
        topic: message.topic,
        subscriber: subscription.subscriber,
        duration
      });
      
    } catch (error) {
      this.log('error', `Failed to deliver message to ${subscription.subscriber}`, {
        messageId: message.id,
        error: error instanceof Error ? error.message : error
      });
      
      // Retry logic
      await this.retryMessage(subscription, message, error);
    }
  }

  /**
   * Retry failed message delivery
   */
  private async retryMessage(
    subscription: Subscription,
    message: Message,
    error: any
  ): Promise<void> {
    const retryCount = message.metadata?.retryCount || 0;
    
    if (retryCount >= this.config.maxRetries!) {
      // Move to dead letter queue
      this.deadLetterQueue.push({
        ...message,
        metadata: {
          ...message.metadata,
          failureReason: error instanceof Error ? error.message : String(error),
          failedSubscriber: subscription.subscriber,
          failedAt: new Date().toISOString()
        }
      });
      
      this.emit('message-dead-lettered', {
        messageId: message.id,
        topic: message.topic,
        subscriber: subscription.subscriber,
        retries: retryCount
      });
      
      return;
    }

    // Schedule retry
    setTimeout(async () => {
      const retryMessage = {
        ...message,
        metadata: {
          ...message.metadata,
          retryCount: retryCount + 1
        }
      };
      
      await this.deliverMessage(subscription, retryMessage);
    }, this.config.retryDelay! * Math.pow(2, retryCount)); // Exponential backoff
  }

  /**
   * Queue a message when no subscribers are available
   */
  private queueMessage(topic: string, message: Message): void {
    const queue = this.messageQueue.get(topic) || [];
    
    if (queue.length >= this.config.maxQueueSize!) {
      // Remove oldest message
      queue.shift();
    }
    
    queue.push(message);
    this.messageQueue.set(topic, queue);
    
    this.log('debug', `Message queued for topic ${topic}`, {
      messageId: message.id,
      queueSize: queue.length
    });
  }

  /**
   * Process queued messages for a topic
   */
  private async processQueuedMessages(topic: string): Promise<void> {
    const queue = this.messageQueue.get(topic);
    if (!queue || queue.length === 0) return;

    const subscribers = this.subscriptions.get(topic) || [];
    if (subscribers.length === 0) return;

    // Process all queued messages
    const messages = [...queue];
    this.messageQueue.set(topic, []);

    for (const message of messages) {
      await Promise.all(
        subscribers.map(sub => this.deliverMessage(sub, message))
      );
    }
  }

  /**
   * Get metrics for monitoring
   */
  getMetrics() {
    const topicMetrics = new Map<string, {
      subscribers: number;
      queuedMessages: number;
    }>();

    for (const [topic, subs] of this.subscriptions.entries()) {
      topicMetrics.set(topic, {
        subscribers: subs.length,
        queuedMessages: this.messageQueue.get(topic)?.length || 0
      });
    }

    return {
      topics: topicMetrics,
      deadLetterQueueSize: this.deadLetterQueue.length,
      totalSubscriptions: Array.from(this.subscriptions.values())
        .reduce((sum, subs) => sum + subs.length, 0)
    };
  }

  /**
   * Get dead letter queue messages
   */
  getDeadLetterQueue(): Message[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  /**
   * Log a message
   */
  private log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      component: 'EventBus',
      level,
      message,
      data
    };
    
    if (level === 'error' || level === 'warn') {
      console.error(JSON.stringify(logEntry));
    } else if (level === 'info') {
      console.log(JSON.stringify(logEntry));
    }
    // Debug logs are silent unless explicitly enabled
  }
} 