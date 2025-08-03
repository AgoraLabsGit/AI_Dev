/**
 * System Integration Service
 * 
 * Connects AVCA and DIAS core systems:
 * - Service orchestration
 * - System monitoring
 * - Logging infrastructure
 */

import { BaseService } from '../avca/services/base-service';
import { EventBus } from '../avca/services/event-bus';
import { AIClientService } from '../avca/services/ai-client';
import { BlueprintService } from '../avca/services/blueprint-service';
import { MigrationService } from '../avca/services/migration-service';
import { PatternRecognitionEngine } from '../dias/intelligence/pattern-recognition-engine';
import { LearningSystem } from '../dias/intelligence/learning-system';
import { EventHandlingSystem } from '../dias/events/event-handlers';
import { EventGenerator } from '../dias/events/event-generator';
import { LogManager } from './logging/log-manager';
import { MetricsCollector } from './monitoring/metrics-collector';
import { CircuitBreaker } from './resilience/circuit-breaker';
import { RetryPolicy } from './resilience/retry-policy';
import { MonitorIntegration } from '../monitoring/logic-monitor-integration';

export interface SystemIntegratorConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  enableMonitoring?: boolean;
  enableLogging?: boolean;
  enableResilience?: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      lastCheck: Date;
      metrics: {
        latency: number;
        errorRate: number;
        throughput: number;
      };
    };
  };
  metrics: {
    totalRequests: number;
    errorRate: number;
    averageLatency: number;
  };
}

export class SystemIntegrator extends BaseService {
  private eventBus?: EventBus;
  private config: Required<SystemIntegratorConfig>;
  private services: Map<string, BaseService> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private retryPolicies: Map<string, RetryPolicy> = new Map();
  private metricsCollector?: MetricsCollector;
  private logManager?: LogManager;

  constructor(config: SystemIntegratorConfig = {}) {
    super({
      name: config.name || 'system-integrator',
      version: config.version || '1.0.0',
      dependencies: []
    });

    this.config = {
      name: config.name || 'system-integrator',
      version: config.version || '1.0.0',
      eventBus: config.eventBus,
      enableMonitoring: config.enableMonitoring ?? true,
      enableLogging: config.enableLogging ?? true,
      enableResilience: config.enableResilience ?? true
    };

    this.eventBus = config.eventBus;
  }

  protected async initialize(): Promise<void> {
    await this.initializeServices();
    await this.setupResilience();
    await this.setupMonitoring();
    await this.setupLogging();
    this.log('info', 'System Integrator initialized');
  }

  protected async cleanup(): Promise<void> {
    await this.cleanupServices();
    this.log('info', 'System Integrator cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    const health = await this.checkSystemHealth();
    return health.status !== 'unhealthy';
  }

  /**
   * Initialize core services
   */
  private async initializeServices(): Promise<void> {
    // Initialize AVCA services
    const aiClient = new AIClientService({ eventBus: this.eventBus });
    const blueprintService = new BlueprintService({ eventBus: this.eventBus });
    const migrationService = new MigrationService({ eventBus: this.eventBus });

    // Initialize DIAS services
    const patternEngine = new PatternRecognitionEngine({ eventBus: this.eventBus });
    const learningSystem = new LearningSystem({ eventBus: this.eventBus });
    const eventHandler = new EventHandlingSystem({ eventBus: this.eventBus });
    const eventGenerator = new EventGenerator({ eventBus: this.eventBus });

    // Register all services
    this.registerService('ai-client', aiClient);
    this.registerService('blueprint-service', blueprintService);
    this.registerService('migration-service', migrationService);
    this.registerService('pattern-engine', patternEngine);
    this.registerService('learning-system', learningSystem);
    this.registerService('event-handler', eventHandler);
    this.registerService('event-generator', eventGenerator);

    // Initialize all services
    await Promise.all(
      Array.from(this.services.values()).map(service => service.start())
    );
  }

  /**
   * Register a service
   */
  private registerService(name: string, service: BaseService): void {
    this.services.set(name, service);
    
    if (this.config.enableResilience) {
      this.circuitBreakers.set(name, new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 30000
      }));
      
      this.retryPolicies.set(name, new RetryPolicy({
        maxRetries: 3,
        backoff: 'exponential'
      }));
    }
  }

  /**
   * Set up resilience patterns
   */
  private async setupResilience(): Promise<void> {
    if (!this.config.enableResilience) return;

    // Wrap service methods with circuit breakers and retry policies
    for (const [name, service] of this.services) {
      const circuitBreaker = this.circuitBreakers.get(name);
      const retryPolicy = this.retryPolicies.get(name);

      if (circuitBreaker && retryPolicy) {
        this.wrapServiceWithResilience(service, circuitBreaker, retryPolicy);
      }
    }
  }

  /**
   * Set up monitoring
   */
  private async setupMonitoring(): Promise<void> {
    if (!this.config.enableMonitoring) return;

    this.metricsCollector = new MetricsCollector({
      services: Array.from(this.services.keys()),
      interval: 5000
    });

    await this.metricsCollector.start();
  }

  /**
   * Set up logging
   */
  private async setupLogging(): Promise<void> {
    if (!this.config.enableLogging) return;

    this.logManager = new LogManager({
      services: Array.from(this.services.keys()),
      level: 'info',
      format: 'json'
    });

    await this.logManager.start();
  }

  /**
   * Check system health
   */
  @MonitorIntegration('SYSTEM_INTEGRATOR')
  async checkSystemHealth(): Promise<SystemHealth> {
    const serviceStatuses = await Promise.all(
      Array.from(this.services.entries()).map(async ([name, service]) => {
        const metrics = this.metricsCollector?.getServiceMetrics(name) || {
          latency: 0,
          errorRate: 0,
          throughput: 0
        };

        return [name, {
          status: await service.isHealthy() ? 'up' : 'down',
          lastCheck: new Date(),
          metrics
        }];
      })
    );

    const services = Object.fromEntries(serviceStatuses);
    const unhealthyCount = Object.values(services).filter(s => s.status === 'down').length;
    const degradedCount = Object.values(services).filter(s => s.status === 'degraded').length;

    return {
      status: unhealthyCount > 0 ? 'unhealthy' :
              degradedCount > 0 ? 'degraded' : 'healthy',
      services,
      metrics: this.calculateSystemMetrics(services)
    };
  }

  /**
   * Calculate system-wide metrics
   */
  private calculateSystemMetrics(services: SystemHealth['services']): SystemHealth['metrics'] {
    const metrics = Object.values(services).map(s => s.metrics);
    
    return {
      totalRequests: metrics.reduce((sum, m) => sum + m.throughput, 0),
      errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length,
      averageLatency: metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length
    };
  }

  /**
   * Wrap service with resilience patterns
   */
  private wrapServiceWithResilience(
    service: BaseService,
    circuitBreaker: CircuitBreaker,
    retryPolicy: RetryPolicy
  ): void {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
      .filter(name => typeof service[name as keyof typeof service] === 'function'
        && name !== 'constructor');

    for (const methodName of methodNames) {
      const originalMethod = service[methodName as keyof typeof service];
      if (typeof originalMethod === 'function') {
        (service as any)[methodName] = async (...args: any[]) => {
          return retryPolicy.execute(async () => {
            return circuitBreaker.execute(async () => {
              return originalMethod.apply(service, args);
            });
          });
        };
      }
    }
  }

  /**
   * Clean up services
   */
  private async cleanupServices(): Promise<void> {
    // Stop metrics collector
    if (this.metricsCollector) {
      await this.metricsCollector.stop();
    }

    // Stop log manager
    if (this.logManager) {
      await this.logManager.stop();
    }

    // Stop all services
    await Promise.all(
      Array.from(this.services.values()).map(service => service.stop())
    );

    // Clear maps
    this.services.clear();
    this.circuitBreakers.clear();
    this.retryPolicies.clear();
  }
}