/**
 * Service Registry for AVCA Microservices
 * 
 * Manages service discovery and lifecycle:
 * - Service registration/deregistration
 * - Health monitoring
 * - Load balancing
 * - Service discovery
 * - Dependency management
 */

import { EventEmitter } from 'events';
import { BaseService, ServiceConfig, ServiceStatus } from './base-service';
import { EventBus } from './event-bus';

export interface ServiceInstance {
  id: string;
  config: ServiceConfig;
  service: BaseService;
  status: ServiceStatus;
  registeredAt: Date;
  lastHealthCheck: Date;
}

export interface ServiceRegistryConfig {
  healthCheckInterval?: number;
  unhealthyThreshold?: number;
  deregisterUnhealthy?: boolean;
}

export class ServiceRegistry extends EventEmitter {
  private services: Map<string, ServiceInstance[]> = new Map();
  private config: ServiceRegistryConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private instanceCounter = 0;

  constructor(
    private eventBus: EventBus,
    config: ServiceRegistryConfig = {}
  ) {
    super();
    this.config = {
      healthCheckInterval: 10000, // 10 seconds
      unhealthyThreshold: 3,
      deregisterUnhealthy: true,
      ...config
    };
  }

  /**
   * Start the registry
   */
  async start(): Promise<void> {
    // Subscribe to service events
    this.eventBus.subscribe(
      'service.events',
      'ServiceRegistry',
      async (message) => {
        if (message.data.type === 'health') {
          await this.updateServiceHealth(message.source, message.data);
        }
      }
    );

    // Start health monitoring
    this.startHealthMonitoring();
    
    this.log('info', 'Service Registry started');
  }

  /**
   * Stop the registry
   */
  async stop(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Stop all services
    for (const instances of this.services.values()) {
      for (const instance of instances) {
        try {
          await instance.service.stop();
        } catch (error) {
          this.log('error', `Failed to stop service ${instance.id}`, error);
        }
      }
    }

    this.services.clear();
    this.log('info', 'Service Registry stopped');
  }

  /**
   * Register a service
   */
  async register(service: BaseService): Promise<string> {
    const config = service.getConfig();
    const instanceId = `${config.name}-${++this.instanceCounter}`;
    
    const instance: ServiceInstance = {
      id: instanceId,
      config,
      service,
      status: service.getStatus(),
      registeredAt: new Date(),
      lastHealthCheck: new Date()
    };

    // Add to registry
    const instances = this.services.get(config.name) || [];
    instances.push(instance);
    this.services.set(config.name, instances);

    // Start the service if not already started
    if (instance.status.status === 'starting') {
      await service.start();
    }

    // Subscribe to service events
    service.on('service-event', (event) => {
      this.eventBus.publish(
        'service.events',
        instanceId,
        event
      );
    });

    this.log('info', `Service registered: ${instanceId}`);
    this.emit('service-registered', { instanceId, service: config.name });

    return instanceId;
  }

  /**
   * Deregister a service
   */
  async deregister(instanceId: string): Promise<void> {
    for (const [serviceName, instances] of this.services.entries()) {
      const index = instances.findIndex(inst => inst.id === instanceId);
      if (index !== -1) {
        const instance = instances[index];
        
        // Stop the service
        await instance.service.stop();
        
        // Remove from registry
        instances.splice(index, 1);
        if (instances.length === 0) {
          this.services.delete(serviceName);
        }

        this.log('info', `Service deregistered: ${instanceId}`);
        this.emit('service-deregistered', { instanceId, service: serviceName });
        
        return;
      }
    }

    throw new Error(`Service instance not found: ${instanceId}`);
  }

  /**
   * Get all instances of a service
   */
  getInstances(serviceName: string): ServiceInstance[] {
    return [...(this.services.get(serviceName) || [])];
  }

  /**
   * Get a healthy instance of a service (load balancing)
   */
  getHealthyInstance(serviceName: string): ServiceInstance | null {
    const instances = this.services.get(serviceName) || [];
    const healthyInstances = instances.filter(inst => inst.status.status === 'healthy');
    
    if (healthyInstances.length === 0) {
      return null;
    }

    // Simple round-robin load balancing
    const index = Math.floor(Math.random() * healthyInstances.length);
    return healthyInstances[index];
  }

  /**
   * Get service by instance ID
   */
  getInstance(instanceId: string): ServiceInstance | null {
    for (const instances of this.services.values()) {
      const instance = instances.find(inst => inst.id === instanceId);
      if (instance) {
        return instance;
      }
    }
    return null;
  }

  /**
   * Get all registered services
   */
  getAllServices(): Map<string, ServiceInstance[]> {
    return new Map(this.services);
  }

  /**
   * Check service dependencies
   */
  checkDependencies(serviceName: string): {
    satisfied: boolean;
    missing: string[];
    unhealthy: string[];
  } {
    const instances = this.services.get(serviceName);
    if (!instances || instances.length === 0) {
      return { satisfied: false, missing: [serviceName], unhealthy: [] };
    }

    const config = instances[0].config;
    const dependencies = config.dependencies || [];
    const missing: string[] = [];
    const unhealthy: string[] = [];

    for (const dep of dependencies) {
      const depInstances = this.services.get(dep);
      if (!depInstances || depInstances.length === 0) {
        missing.push(dep);
      } else {
        const hasHealthy = depInstances.some(inst => inst.status.status === 'healthy');
        if (!hasHealthy) {
          unhealthy.push(dep);
        }
      }
    }

    return {
      satisfied: missing.length === 0 && unhealthy.length === 0,
      missing,
      unhealthy
    };
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      for (const instances of this.services.values()) {
        for (const instance of instances) {
          const timeSinceLastCheck = Date.now() - instance.lastHealthCheck.getTime();
          
          // Check if service is unresponsive
          if (timeSinceLastCheck > this.config.healthCheckInterval! * this.config.unhealthyThreshold!) {
            instance.status.status = 'unhealthy';
            
            this.emit('service-unhealthy', {
              instanceId: instance.id,
              service: instance.config.name,
              lastSeen: instance.lastHealthCheck
            });

            // Deregister if configured
            if (this.config.deregisterUnhealthy) {
              this.deregister(instance.id).catch(error => {
                this.log('error', `Failed to deregister unhealthy service ${instance.id}`, error);
              });
            }
          }
        }
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Update service health status
   */
  private async updateServiceHealth(instanceId: string, healthData: any): Promise<void> {
    const instance = this.getInstance(instanceId);
    if (instance) {
      instance.status = {
        ...instance.status,
        status: healthData.status,
        uptime: healthData.uptime
      };
      instance.lastHealthCheck = new Date();
    }
  }

  /**
   * Get registry metrics
   */
  getMetrics() {
    const metrics = {
      totalServices: this.services.size,
      totalInstances: 0,
      healthyInstances: 0,
      unhealthyInstances: 0,
      serviceBreakdown: new Map<string, {
        total: number;
        healthy: number;
        unhealthy: number;
      }>()
    };

    for (const [serviceName, instances] of this.services.entries()) {
      const healthy = instances.filter(inst => inst.status.status === 'healthy').length;
      const unhealthy = instances.filter(inst => inst.status.status === 'unhealthy').length;
      
      metrics.totalInstances += instances.length;
      metrics.healthyInstances += healthy;
      metrics.unhealthyInstances += unhealthy;
      
      metrics.serviceBreakdown.set(serviceName, {
        total: instances.length,
        healthy,
        unhealthy
      });
    }

    return metrics;
  }

  /**
   * Log a message
   */
  private log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      component: 'ServiceRegistry',
      level,
      message,
      data
    };
    
    console.log(JSON.stringify(logEntry));
  }
} 