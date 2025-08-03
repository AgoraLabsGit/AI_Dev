/**
 * Circuit Breaker
 * 
 * Implements the circuit breaker pattern:
 * - Failure detection
 * - Service isolation
 * - Automatic recovery
 */

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeout?: number;
  monitorInterval?: number;
}

export interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailure: number;
  lastSuccess: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
}

export class CircuitBreaker {
  private config: Required<CircuitBreakerConfig>;
  private state: CircuitBreakerState;
  private monitorInterval?: NodeJS.Timeout;

  constructor(config: CircuitBreakerConfig = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 30000,
      monitorInterval: config.monitorInterval || 5000
    };

    this.state = {
      status: 'closed',
      failures: 0,
      lastFailure: 0,
      lastSuccess: 0,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0
    };

    this.startMonitoring();
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.state = {
      status: 'closed',
      failures: 0,
      lastFailure: 0,
      lastSuccess: 0,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0
    };
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }

  /**
   * Check if circuit is open
   */
  private isOpen(): boolean {
    if (this.state.status === 'closed') {
      return false;
    }

    if (this.state.status === 'open') {
      const now = Date.now();
      if (now - this.state.lastFailure >= this.config.resetTimeout) {
        this.state.status = 'half-open';
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Record a successful call
   */
  private recordSuccess(): void {
    this.state.failures = 0;
    this.state.lastSuccess = Date.now();
    this.state.status = 'closed';
    this.state.totalCalls++;
    this.state.successfulCalls++;
  }

  /**
   * Record a failed call
   */
  private recordFailure(): void {
    this.state.failures++;
    this.state.lastFailure = Date.now();
    this.state.totalCalls++;
    this.state.failedCalls++;

    if (this.state.failures >= this.config.failureThreshold) {
      this.state.status = 'open';
    }
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.monitorInterval = setInterval(() => {
      this.monitor();
    }, this.config.monitorInterval);
  }

  /**
   * Monitor circuit state
   */
  private monitor(): void {
    const now = Date.now();

    // Check for automatic reset
    if (this.state.status === 'open' &&
        now - this.state.lastFailure >= this.config.resetTimeout) {
      this.state.status = 'half-open';
    }

    // Check for successful recovery
    if (this.state.status === 'half-open' &&
        now - this.state.lastSuccess >= this.config.monitorInterval) {
      this.state.status = 'closed';
      this.state.failures = 0;
    }
  }
}