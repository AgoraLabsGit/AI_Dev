import { EventBus } from '../avca/services/event-bus';
import { BaseService } from '../avca/services/base-service';
import { FlexibleObject } from '../../types/development-friendly';

export interface ServiceStatus {
  name: string;
  status: 'initializing' | 'ready' | 'failed' | 'timeout';
  lastCheck: number;
  error?: string;
  initTime?: number;
}

export interface ServiceManagerConfig {
  initTimeoutMs?: number;
  healthCheckIntervalMs?: number;
  circuitBreakerThreshold?: number;
  backgroundRetryIntervalMs?: number;
}

export class ServiceManager {
  private services = new Map<string, BaseService>();
  private serviceStatus = new Map<string, ServiceStatus>();
  private serviceProxies = new Map<string, unknown>();
  private initializationPromises = new Map<string, Promise<void>>();
  private config: Required<ServiceManagerConfig>;
  private eventBus: EventBus;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(eventBus: EventBus, config: ServiceManagerConfig = {}) {
    this.eventBus = eventBus;
    this.config = {
      initTimeoutMs: config.initTimeoutMs || 5000,
      healthCheckIntervalMs: config.healthCheckIntervalMs || 30000,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 3,
      backgroundRetryIntervalMs: config.backgroundRetryIntervalMs || 60000
    };
    
    this.startHealthCheck();
  }

  /**
   * Register a service for staged initialization
   */
  registerService<T extends BaseService>(name: string, serviceFactory: () => T): void {
    console.log(`📋 ServiceManager: Registering service ${name}`);
    
    this.serviceStatus.set(name, {
      name,
      status: 'initializing',
      lastCheck: Date.now()
    });

    // Create lazy proxy that initializes on first use
    const proxy = this.createLazyProxy(name, serviceFactory);
    this.serviceProxies.set(name, proxy);
    
    // Start background initialization
    this.initializeServiceInBackground(name, serviceFactory);
  }

  /**
   * Get a service (either ready or proxy)
   */
  getService<T>(name: string): T | null {
    const status = this.serviceStatus.get(name);
    if (!status) {
      console.warn(`⚠️ ServiceManager: Service ${name} not registered`);
      return null;
    }

    if (status.status === 'ready') {
      return this.services.get(name) as T;
    }

    // Return proxy for services not yet ready
    return this.serviceProxies.get(name) as T;
  }

  /**
   * Check if service is ready
   */
  isServiceReady(name: string): boolean {
    const status = this.serviceStatus.get(name);
    return status?.status === 'ready';
  }

  /**
   * Get all service statuses
   */
  getServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatus.values());
  }

  /**
   * Get ready services
   */
  getReadyServices(): string[] {
    return Array.from(this.serviceStatus.entries())
      .filter(([_, status]) => status.status === 'ready')
      .map(([name, _]) => name);
  }

  /**
   * Force initialize a service immediately
   */
  async forceInitialize(name: string): Promise<boolean> {
    const promise = this.initializationPromises.get(name);
    if (promise) {
      try {
        await promise;
        return this.isServiceReady(name);
      } catch (error) {
        console.error(`❌ ServiceManager: Failed to force initialize ${name}:`, error);
        return false;
      }
    }
    return false;
  }

  /**
   * Initialize service in background with timeout and retry logic
   */
  private initializeServiceInBackground<T extends BaseService>(
    name: string, 
    serviceFactory: () => T
  ): void {
    const initPromise = this.performServiceInitialization(name, serviceFactory);
    this.initializationPromises.set(name, initPromise);
    
    // Handle completion
    initPromise
      .then(() => {
        console.log(`✅ ServiceManager: ${name} initialized successfully`);
      })
      .catch((error) => {
        console.error(`❌ ServiceManager: ${name} initialization failed:`, error);
        this.scheduleRetry(name, serviceFactory);
      });
  }

  /**
   * Perform actual service initialization with timeout
   */
  private async performServiceInitialization<T extends BaseService>(
    name: string, 
    serviceFactory: () => T
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Service ${name} initialization timed out after ${this.config.initTimeoutMs}ms`));
        }, this.config.initTimeoutMs);
      });

      // Create service and initialize
      const initPromise = (async () => {
        const service = serviceFactory();
        await service.start();
        return service;
      })();

      // Race between initialization and timeout
      const service = await Promise.race([initPromise, timeoutPromise]);
      
      // Success - store service and update status
      this.services.set(name, service);
      this.serviceStatus.set(name, {
        name,
        status: 'ready',
        lastCheck: Date.now(),
        initTime: Date.now() - startTime
      });

    } catch (error) {
      // Handle failure
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.serviceStatus.set(name, {
        name,
        status: error instanceof Error && error.message.includes('timed out') ? 'timeout' : 'failed',
        lastCheck: Date.now(),
        error: errorMessage,
        initTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Create lazy proxy that initializes service on first method call
   */
  private createLazyProxy<T extends BaseService>(name: string, serviceFactory: () => T): T {
    return new Proxy({} as T, {
      get: (target, prop) => {
        // If service is ready, delegate to actual service
        const actualService = this.services.get(name);
        if (actualService) {
          const value = (actualService as unknown as FlexibleObject)[prop as string];
          return typeof value === 'function' ? value.bind(actualService) : value;
        }

        // If not ready, return async function that waits for service
        if (typeof prop === 'string') {
          return async (...args: unknown[]) => {
            console.log(`🔄 ServiceManager: Lazy loading ${name} for method ${prop}`);
            
            // Try to wait for existing initialization
            const initPromise = this.initializationPromises.get(name);
            if (initPromise) {
              try {
                await Promise.race([
                  initPromise,
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Lazy load timeout')), 3000)
                  )
                ]);
              } catch (error) {
                console.warn(`⚠️ ServiceManager: Lazy load timeout for ${name}, using fallback`);
              }
            }

            // If service is now ready, call it
            const readyService = this.services.get(name);
            if (readyService) {
              const method = (readyService as unknown as FlexibleObject)[prop];
              if (typeof method === 'function') {
                return method.apply(readyService, args);
              }
              return method;
            }

            // Fallback response
            console.warn(`⚠️ ServiceManager: Service ${name} not ready, returning fallback response`);
            return this.getFallbackResponse(name, prop, args);
          };
        }

        return undefined;
      }
    });
  }

  /**
   * Get fallback response when service isn't ready
   */
  private getFallbackResponse(serviceName: string, method: string, args: unknown[]): FlexibleObject {
    console.log(`🔄 ServiceManager: Providing fallback for ${serviceName}.${method}`);
    
    // Common fallback patterns
    if (method === 'process' || method === 'handle') {
      return {
        content: "I'm initializing my advanced capabilities. Please try again in a moment for enhanced responses.",
        metadata: {
          fallback: true,
          service: serviceName,
          status: 'initializing'
        }
      };
    }

    if (method === 'isHealthy' || method === 'getStatus') {
      return false as unknown as FlexibleObject;
    }

    // Default fallback
    return {
      success: false,
      error: `Service ${serviceName} is still initializing`,
      fallback: true
    };
  }

  /**
   * Schedule retry for failed service
   */
  private scheduleRetry<T extends BaseService>(name: string, serviceFactory: () => T): void {
    setTimeout(() => {
      console.log(`🔄 ServiceManager: Retrying initialization for ${name}`);
      this.initializeServiceInBackground(name, serviceFactory);
    }, this.config.backgroundRetryIntervalMs);
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Perform health check on all services
   */
  private async performHealthCheck(): Promise<void> {
    for (const [name, service] of this.services) {
      try {
        const isHealthy = await this.checkServiceHealth(service);
        if (!isHealthy) {
          console.warn(`⚠️ ServiceManager: Service ${name} failed health check`);
          this.serviceStatus.set(name, {
            ...this.serviceStatus.get(name)!,
            status: 'failed',
            lastCheck: Date.now(),
            error: 'Health check failed'
          });
        }
      } catch (error) {
        console.error(`❌ ServiceManager: Health check error for ${name}:`, error);
      }
    }
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(service: BaseService): Promise<boolean> {
    try {
      // Try calling service health check if available
      if ('isHealthy' in service && typeof service.isHealthy === 'function') {
        return await (service as unknown as FlexibleObject).isHealthy();
      }
      
      // Basic check - service should be startable/stoppable
      return (service as unknown as FlexibleObject).isRunning?.() ?? true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Stop all services
    for (const [name, service] of this.services) {
      service.stop().catch(error => {
        console.error(`Error stopping service ${name}:`, error);
      });
    }
    
    this.services.clear();
    this.serviceStatus.clear();
    this.serviceProxies.clear();
    this.initializationPromises.clear();
  }
}