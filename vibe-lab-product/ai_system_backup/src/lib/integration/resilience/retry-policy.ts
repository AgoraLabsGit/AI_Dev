/**
 * Retry Policy
 * 
 * Implements retry patterns:
 * - Multiple retry strategies
 * - Backoff algorithms
 * - Failure handling
 */

export type BackoffStrategy = 'fixed' | 'linear' | 'exponential';

export interface RetryPolicyConfig {
  maxRetries?: number;
  backoff?: BackoffStrategy;
  baseDelay?: number;
  maxDelay?: number;
}

export interface RetryState {
  attempts: number;
  lastAttempt: number;
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
}

export class RetryPolicy {
  private config: Required<RetryPolicyConfig>;
  private state: RetryState;

  constructor(config: RetryPolicyConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      backoff: config.backoff || 'exponential',
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000
    };

    this.state = {
      attempts: 0,
      lastAttempt: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0
    };
  }

  /**
   * Execute a function with retry policy
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    while (this.state.attempts <= this.config.maxRetries) {
      try {
        if (this.state.attempts > 0) {
          await this.delay();
        }

        const result = await fn();
        this.recordSuccess();
        return result;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.recordFailure();
        
        if (this.state.attempts >= this.config.maxRetries) {
          break;
        }
      }
    }

    throw new Error(`Max retries (${this.config.maxRetries}) exceeded: ${lastError?.message}`);
  }

  /**
   * Get current state
   */
  getState(): RetryState {
    return { ...this.state };
  }

  /**
   * Reset the retry policy
   */
  reset(): void {
    this.state = {
      attempts: 0,
      lastAttempt: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0
    };
  }

  /**
   * Calculate delay based on backoff strategy
   */
  private calculateDelay(): number {
    switch (this.config.backoff) {
      case 'fixed':
        return this.config.baseDelay;
      
      case 'linear':
        return this.config.baseDelay * this.state.attempts;
      
      case 'exponential':
        const delay = this.config.baseDelay * Math.pow(2, this.state.attempts - 1);
        return Math.min(delay, this.config.maxDelay);
      
      default:
        return this.config.baseDelay;
    }
  }

  /**
   * Delay execution
   */
  private async delay(): Promise<void> {
    const delay = this.calculateDelay();
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Record a successful attempt
   */
  private recordSuccess(): void {
    this.state.lastAttempt = Date.now();
    this.state.totalAttempts++;
    this.state.successfulAttempts++;
    this.state.attempts = 0;
  }

  /**
   * Record a failed attempt
   */
  private recordFailure(): void {
    this.state.lastAttempt = Date.now();
    this.state.totalAttempts++;
    this.state.failedAttempts++;
    this.state.attempts++;
  }
}