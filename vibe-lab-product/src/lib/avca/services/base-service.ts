/**
 * Base Service Class for AVCA Microservices
 * 
 * Provides common functionality for all services:
 * - Event bus integration
 * - Health checks
 * - Logging
 * - Error handling
 * - Metrics collection
 */

import { EventEmitter } from 'events';
import { PipelineStage } from '../types';

export interface ServiceConfig {
  name: string;
  version: string;
  stage?: PipelineStage;
  dependencies?: string[];
  healthCheckInterval?: number;
}

export interface ServiceStatus {
  service: string;
  status: 'starting' | 'healthy' | 'unhealthy' | 'stopping';
  uptime: number;
  lastHealthCheck: Date;
  metrics: {
    requestsProcessed: number;
    errorsCount: number;
    averageResponseTime: number;
  };
}

export interface ServiceEvent {
  type: 'request' | 'response' | 'error' | 'health' | 'metric';
  service: string;
  timestamp: Date;
  data: any;
}

export abstract class BaseService extends EventEmitter {
  protected config: ServiceConfig;
  protected status: ServiceStatus;
  protected startTime: Date;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: ServiceConfig) {
    super();
    this.config = {
      healthCheckInterval: 30000, // 30 seconds default
      ...config
    };
    
    this.startTime = new Date();
    this.status = {
      service: config.name,
      status: 'starting',
      uptime: 0,
      lastHealthCheck: new Date(),
      metrics: {
        requestsProcessed: 0,
        errorsCount: 0,
        averageResponseTime: 0
      }
    };
  }

  /**
   * Initialize the service
   */
  async start(): Promise<void> {
    try {
      this.log('info', `Starting service ${this.config.name} v${this.config.version}`);
      
      // Initialize service-specific resources
      await this.initialize();
      
      // Start health checks
      this.startHealthChecks();
      
      // Update status
      this.status.status = 'healthy';
      this.emitEvent('health', { status: 'healthy' });
      
      this.log('info', `Service ${this.config.name} started successfully`);
    } catch (error) {
      this.status.status = 'unhealthy';
      this.log('error', `Failed to start service: ${error}`);
      throw error;
    }
  }

  /**
   * Stop the service gracefully
   */
  async stop(): Promise<void> {
    try {
      this.log('info', `Stopping service ${this.config.name}`);
      this.status.status = 'stopping';
      
      // Stop health checks
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
      }
      
      // Cleanup service-specific resources
      await this.cleanup();
      
      this.log('info', `Service ${this.config.name} stopped`);
    } catch (error) {
      this.log('error', `Error stopping service: ${error}`);
      throw error;
    }
  }

  /**
   * Process a request (to be implemented by each service)
   */
  abstract process(input: any): Promise<any>;

  /**
   * Initialize service-specific resources
   */
  protected abstract initialize(): Promise<void>;

  /**
   * Cleanup service-specific resources
   */
  protected abstract cleanup(): Promise<void>;

  /**
   * Health check implementation
   */
  protected abstract healthCheck(): Promise<boolean>;

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const isHealthy = await this.healthCheck();
        this.status.status = isHealthy ? 'healthy' : 'unhealthy';
        this.status.lastHealthCheck = new Date();
        this.status.uptime = Date.now() - this.startTime.getTime();
        
        this.emitEvent('health', {
          status: this.status.status,
          uptime: this.status.uptime
        });
      } catch (error) {
        this.status.status = 'unhealthy';
        this.log('error', `Health check failed: ${error}`);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Update metrics after processing a request
   */
  protected updateMetrics(responseTime: number, success: boolean): void {
    const metrics = this.status.metrics;
    
    metrics.requestsProcessed++;
    if (!success) {
      metrics.errorsCount++;
    }
    
    // Calculate rolling average response time
    metrics.averageResponseTime = 
      (metrics.averageResponseTime * (metrics.requestsProcessed - 1) + responseTime) / 
      metrics.requestsProcessed;
    
    this.emitEvent('metric', {
      requestsProcessed: metrics.requestsProcessed,
      errorsCount: metrics.errorsCount,
      averageResponseTime: metrics.averageResponseTime,
      lastResponseTime: responseTime
    });
  }

  /**
   * Emit a service event
   */
  protected emitEvent(type: ServiceEvent['type'], data: any): void {
    const event: ServiceEvent = {
      type,
      service: this.config.name,
      timestamp: new Date(),
      data
    };
    
    this.emit('service-event', event);
  }

  /**
   * Log a message
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: this.config.name,
      level,
      message,
      data
    };
    
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Get current service status
   */
  getStatus(): ServiceStatus {
    return { ...this.status };
  }

  /**
   * Get service configuration
   */
  getConfig(): ServiceConfig {
    return { ...this.config };
  }
} 