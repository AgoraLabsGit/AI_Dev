/**
 * Rate Limiter for AI API Requests
 * 
 * Implements:
 * - Per-model rate limiting
 * - Token bucket algorithm
 * - Request queuing
 * - Burst allowance
 */

import { ModelType } from '../model-config';
import { EventEmitter } from 'events';

export interface RateLimitConfig {
  model: ModelType;
  requestsPerMinute: number;
  requestsPerHour: number;
  tokensPerMinute: number;
  tokensPerHour: number;
  burstAllowance: number; // Allow burst up to this multiplier
}

export interface RateLimitStatus {
  model: ModelType;
  requestsRemaining: {
    perMinute: number;
    perHour: number;
  };
  tokensRemaining: {
    perMinute: number;
    perHour: number;
  };
  nextResetTime: {
    minute: Date;
    hour: Date;
  };
  isLimited: boolean;
  queueLength: number;
}

// Anthropic rate limits (conservative estimates)
export const DEFAULT_RATE_LIMITS: Record<ModelType, RateLimitConfig> = {
  'claude-3-opus': {
    model: 'claude-3-opus',
    requestsPerMinute: 50,
    requestsPerHour: 1000,
    tokensPerMinute: 20000,
    tokensPerHour: 300000,
    burstAllowance: 1.5
  },
  'claude-3-5-sonnet': {
    model: 'claude-3-5-sonnet',
    requestsPerMinute: 50,
    requestsPerHour: 1000,
    tokensPerMinute: 40000,
    tokensPerHour: 400000,
    burstAllowance: 1.5
  },
  'claude-3-haiku': {
    model: 'claude-3-haiku',
    requestsPerMinute: 50,
    requestsPerHour: 1000,
    tokensPerMinute: 100000,
    tokensPerHour: 1000000,
    burstAllowance: 2.0
  }
};

interface TokenBucket {
  capacity: number;
  tokens: number;
  lastRefill: number;
  refillRate: number; // tokens per millisecond
}

export class RateLimiter extends EventEmitter {
  private limits: Map<ModelType, RateLimitConfig>;
  private buckets: Map<string, TokenBucket>;
  private requestQueue: Map<ModelType, Array<() => void>>;
  private usageHistory: Map<string, Array<{ timestamp: number; amount: number }>>;

  constructor(customLimits?: Partial<Record<ModelType, RateLimitConfig>>) {
    super();
    
    // Initialize rate limits
    this.limits = new Map();
    Object.entries(DEFAULT_RATE_LIMITS).forEach(([model, config]) => {
      this.limits.set(model as ModelType, {
        ...config,
        ...customLimits?.[model as ModelType]
      });
    });

    // Initialize token buckets
    this.buckets = new Map();
    this.requestQueue = new Map();
    this.usageHistory = new Map();

    // Initialize buckets for each model and metric
    this.limits.forEach((config, model) => {
      // Request buckets
      this.buckets.set(`${model}:requests:minute`, {
        capacity: config.requestsPerMinute * config.burstAllowance,
        tokens: config.requestsPerMinute,
        lastRefill: Date.now(),
        refillRate: config.requestsPerMinute / 60000 // per ms
      });

      this.buckets.set(`${model}:requests:hour`, {
        capacity: config.requestsPerHour * config.burstAllowance,
        tokens: config.requestsPerHour,
        lastRefill: Date.now(),
        refillRate: config.requestsPerHour / 3600000 // per ms
      });

      // Token buckets
      this.buckets.set(`${model}:tokens:minute`, {
        capacity: config.tokensPerMinute * config.burstAllowance,
        tokens: config.tokensPerMinute,
        lastRefill: Date.now(),
        refillRate: config.tokensPerMinute / 60000 // per ms
      });

      this.buckets.set(`${model}:tokens:hour`, {
        capacity: config.tokensPerHour * config.burstAllowance,
        tokens: config.tokensPerHour,
        lastRefill: Date.now(),
        refillRate: config.tokensPerHour / 3600000 // per ms
      });

      // Initialize queue
      this.requestQueue.set(model, []);
    });

    // Periodic queue processing
    setInterval(() => this.processQueues(), 1000);
  }

  /**
   * Check if a request can be made
   */
  async checkLimit(model: ModelType, estimatedTokens: number): Promise<boolean> {
    this.refillBuckets();

    const requestsPerMin = this.consumeTokens(`${model}:requests:minute`, 1, false);
    const requestsPerHour = this.consumeTokens(`${model}:requests:hour`, 1, false);
    const tokensPerMin = this.consumeTokens(`${model}:tokens:minute`, estimatedTokens, false);
    const tokensPerHour = this.consumeTokens(`${model}:tokens:hour`, estimatedTokens, false);

    return requestsPerMin && requestsPerHour && tokensPerMin && tokensPerHour;
  }

  /**
   * Consume rate limit for a request
   */
  async consumeLimit(model: ModelType, actualTokens: number): Promise<void> {
    this.refillBuckets();

    // Consume request limits
    this.consumeTokens(`${model}:requests:minute`, 1, true);
    this.consumeTokens(`${model}:requests:hour`, 1, true);

    // Consume token limits
    this.consumeTokens(`${model}:tokens:minute`, actualTokens, true);
    this.consumeTokens(`${model}:tokens:hour`, actualTokens, true);

    // Track usage
    this.trackUsage(model, 'requests', 1);
    this.trackUsage(model, 'tokens', actualTokens);

    this.emit('limitConsumed', { model, tokens: actualTokens });
  }

  /**
   * Queue a request if rate limited
   */
  async queueRequest(model: ModelType, callback: () => void): Promise<void> {
    const queue = this.requestQueue.get(model) || [];
    queue.push(callback);
    this.requestQueue.set(model, queue);
    
    this.emit('requestQueued', { model, queueLength: queue.length });
  }

  /**
   * Get current rate limit status
   */
  getStatus(model: ModelType): RateLimitStatus {
    this.refillBuckets();

    const now = Date.now();
    const minuteReset = new Date(now + 60000);
    const hourReset = new Date(now + 3600000);

    const requestsMinBucket = this.buckets.get(`${model}:requests:minute`)!;
    const requestsHourBucket = this.buckets.get(`${model}:requests:hour`)!;
    const tokensMinBucket = this.buckets.get(`${model}:tokens:minute`)!;
    const tokensHourBucket = this.buckets.get(`${model}:tokens:hour`)!;

    const queue = this.requestQueue.get(model) || [];
    const isLimited = requestsMinBucket.tokens < 1 || tokensMinBucket.tokens < 100;

    return {
      model,
      requestsRemaining: {
        perMinute: Math.floor(requestsMinBucket.tokens),
        perHour: Math.floor(requestsHourBucket.tokens)
      },
      tokensRemaining: {
        perMinute: Math.floor(tokensMinBucket.tokens),
        perHour: Math.floor(tokensHourBucket.tokens)
      },
      nextResetTime: {
        minute: minuteReset,
        hour: hourReset
      },
      isLimited,
      queueLength: queue.length
    };
  }

  /**
   * Get all model statuses
   */
  getAllStatuses(): Record<ModelType, RateLimitStatus> {
    const statuses: Partial<Record<ModelType, RateLimitStatus>> = {};
    
    this.limits.forEach((_, model) => {
      statuses[model] = this.getStatus(model);
    });

    return statuses as Record<ModelType, RateLimitStatus>;
  }

  /**
   * Refill token buckets based on elapsed time
   */
  private refillBuckets(): void {
    const now = Date.now();

    this.buckets.forEach((bucket) => {
      const elapsed = now - bucket.lastRefill;
      const tokensToAdd = elapsed * bucket.refillRate;

      bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    });
  }

  /**
   * Consume tokens from a bucket
   */
  private consumeTokens(bucketKey: string, amount: number, actuallyConsume: boolean): boolean {
    const bucket = this.buckets.get(bucketKey);
    if (!bucket) return false;

    if (bucket.tokens >= amount) {
      if (actuallyConsume) {
        bucket.tokens -= amount;
      }
      return true;
    }

    return false;
  }

  /**
   * Track usage history
   */
  private trackUsage(model: ModelType, metric: string, amount: number): void {
    const key = `${model}:${metric}`;
    const history = this.usageHistory.get(key) || [];
    const now = Date.now();

    // Add new entry
    history.push({ timestamp: now, amount });

    // Keep only last hour of history
    const oneHourAgo = now - 3600000;
    const filtered = history.filter(entry => entry.timestamp > oneHourAgo);
    
    this.usageHistory.set(key, filtered);
  }

  /**
   * Process queued requests
   */
  private async processQueues(): Promise<void> {
    for (const [model, queue] of this.requestQueue.entries()) {
      if (queue.length === 0) continue;

      // Check if we can process a request
      const canProcess = await this.checkLimit(model, 1000); // Estimate 1k tokens
      
      if (canProcess) {
        const callback = queue.shift();
        if (callback) {
          callback();
          this.emit('requestDequeued', { model, remaining: queue.length });
        }
      }
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(model: ModelType, duration: 'minute' | 'hour' = 'hour'): {
    requests: number;
    tokens: number;
    averageTokensPerRequest: number;
  } {
    const now = Date.now();
    const cutoff = now - (duration === 'minute' ? 60000 : 3600000);

    const requestHistory = this.usageHistory.get(`${model}:requests`) || [];
    const tokenHistory = this.usageHistory.get(`${model}:tokens`) || [];

    const recentRequests = requestHistory
      .filter(entry => entry.timestamp > cutoff)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const recentTokens = tokenHistory
      .filter(entry => entry.timestamp > cutoff)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      requests: recentRequests,
      tokens: recentTokens,
      averageTokensPerRequest: recentRequests > 0 ? recentTokens / recentRequests : 0
    };
  }

  /**
   * Reset rate limits (for testing)
   */
  reset(): void {
    this.buckets.forEach(bucket => {
      bucket.tokens = bucket.capacity;
      bucket.lastRefill = Date.now();
    });

    this.requestQueue.forEach(queue => queue.length = 0);
    this.usageHistory.clear();
  }
} 