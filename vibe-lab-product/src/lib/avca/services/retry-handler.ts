/**
 * Retry Handler with Exponential Backoff
 * 
 * Implements:
 * - Exponential backoff with jitter
 * - Configurable retry strategies
 * - Error classification
 * - Circuit breaker pattern
 */

import { EventEmitter } from 'events';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number; // 0-1, adds randomness to prevent thundering herd
  retryableErrors: string[];
  circuitBreakerThreshold: number; // Open circuit after N consecutive failures
  circuitBreakerResetTime: number; // Time to wait before half-opening circuit
}

export interface RetryContext {
  attempt: number;
  totalAttempts: number;
  lastError?: Error;
  nextDelay: number;
  startTime: number;
  endTime?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  context: RetryContext;
}

export enum CircuitState {
  CLOSED = 'closed',    // Normal operation
  OPEN = 'open',        // Failing, reject all requests
  HALF_OPEN = 'half-open' // Testing if service recovered
}

// Default configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.2,
  retryableErrors: [
    'rate_limit_error',
    'overloaded_error',
    'api_error',
    'network_error',
    'timeout_error',
    '429', // Too Many Requests
    '503', // Service Unavailable
    '504'  // Gateway Timeout
  ],
  circuitBreakerThreshold: 5,
  circuitBreakerResetTime: 60000 // 1 minute
};

export class RetryHandler extends EventEmitter {
  private config: RetryConfig;
  private circuitState: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;

  constructor(config: Partial<RetryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    context?: { operation?: string; metadata?: any }
  ): Promise<RetryResult<T>> {
    // Check circuit breaker
    if (this.circuitState === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.circuitState = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    const retryContext: RetryContext = {
      attempt: 0,
      totalAttempts: 0,
      nextDelay: this.config.initialDelay,
      startTime: Date.now()
    };

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      retryContext.attempt = attempt;
      retryContext.totalAttempts = attempt + 1;

      try {
        // Execute the function
        const result = await fn();
        
        // Success - update circuit breaker
        this.handleSuccess();
        
        retryContext.endTime = Date.now();
        
        this.emit('retrySuccess', {
          ...retryContext,
          operation: context?.operation
        });

        return {
          success: true,
          data: result,
          context: retryContext
        };

      } catch (error) {
        lastError = error as Error;
        retryContext.lastError = lastError;

        // Check if error is retryable
        if (!this.isRetryable(lastError) || attempt === this.config.maxRetries) {
          // Final failure
          this.handleFailure();
          
          retryContext.endTime = Date.now();
          
          this.emit('retryFailure', {
            ...retryContext,
            operation: context?.operation,
            error: lastError
          });

          return {
            success: false,
            error: lastError,
            context: retryContext
          };
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt);
        retryContext.nextDelay = delay;

        this.emit('retryAttempt', {
          ...retryContext,
          operation: context?.operation,
          error: lastError,
          delay
        });

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // Should not reach here, but for safety
    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      context: retryContext
    };
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    const errorCode = (error as any).status || (error as any).code;

    // Check against retryable error patterns
    return this.config.retryableErrors.some(pattern => {
      const patternLower = pattern.toLowerCase();
      return (
        errorMessage.includes(patternLower) ||
        String(errorCode) === pattern ||
        error.name?.toLowerCase().includes(patternLower)
      );
    });
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    // Base delay with exponential backoff
    const baseDelay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt),
      this.config.maxDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = baseDelay * this.config.jitterFactor * Math.random();
    const jitterSign = Math.random() > 0.5 ? 1 : -1;

    return Math.floor(baseDelay + (jitter * jitterSign));
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle successful request
   */
  private handleSuccess(): void {
    this.consecutiveFailures = 0;

    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
      
      // Close circuit after successful half-open attempts
      if (this.halfOpenAttempts >= 3) {
        this.circuitState = CircuitState.CLOSED;
        this.emit('circuitClosed');
      }
    }
  }

  /**
   * Handle failed request
   */
  private handleFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.circuitState === CircuitState.HALF_OPEN) {
      // Failed during half-open, reopen circuit
      this.circuitState = CircuitState.OPEN;
      this.emit('circuitOpened', { failures: this.consecutiveFailures });
    } else if (
      this.circuitState === CircuitState.CLOSED &&
      this.consecutiveFailures >= this.config.circuitBreakerThreshold
    ) {
      // Open circuit after threshold
      this.circuitState = CircuitState.OPEN;
      this.emit('circuitOpened', { failures: this.consecutiveFailures });
    }
  }

  /**
   * Check if circuit should attempt reset
   */
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.circuitBreakerResetTime;
  }

  /**
   * Get circuit breaker status
   */
  getCircuitStatus(): {
    state: CircuitState;
    consecutiveFailures: number;
    lastFailureTime: number;
    canAttemptReset: boolean;
  } {
    return {
      state: this.circuitState,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
      canAttemptReset: this.circuitState === CircuitState.OPEN && this.shouldAttemptReset()
    };
  }

  /**
   * Manually reset circuit breaker
   */
  resetCircuit(): void {
    this.circuitState = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.halfOpenAttempts = 0;
    this.emit('circuitReset');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
  }
} 