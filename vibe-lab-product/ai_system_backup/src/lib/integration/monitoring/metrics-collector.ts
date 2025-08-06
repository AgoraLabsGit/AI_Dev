/**
 * Metrics Collector
 * 
 * Collects and aggregates system metrics:
 * - Service metrics
 * - Performance metrics
 * - Resource usage
 */

export interface MetricsCollectorConfig {
  services: string[];
  interval?: number;
  retentionPeriod?: number;
}

export interface ServiceMetrics {
  latency: number;
  errorRate: number;
  throughput: number;
  timestamp: number;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  activeRequests: number;
  timestamp: number;
}

export class MetricsCollector {
  private config: Required<MetricsCollectorConfig>;
  private metrics: Map<string, ServiceMetrics[]> = new Map();
  private systemMetrics: SystemMetrics[] = [];
  private collectionInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config: MetricsCollectorConfig) {
    this.config = {
      services: config.services,
      interval: config.interval || 5000,
      retentionPeriod: config.retentionPeriod || 3600000 // 1 hour
    };

    // Initialize metrics storage for each service
    for (const service of this.config.services) {
      this.metrics.set(service, []);
    }
  }

  /**
   * Start metrics collection
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startCollection();
  }

  /**
   * Stop metrics collection
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }
  }

  /**
   * Record service metrics
   */
  recordServiceMetrics(service: string, metrics: Omit<ServiceMetrics, 'timestamp'>): void {
    const serviceMetrics = this.metrics.get(service);
    if (!serviceMetrics) return;

    serviceMetrics.push({
      ...metrics,
      timestamp: Date.now()
    });

    this.pruneOldMetrics(service);
  }

  /**
   * Record system metrics
   */
  recordSystemMetrics(metrics: Omit<SystemMetrics, 'timestamp'>): void {
    this.systemMetrics.push({
      ...metrics,
      timestamp: Date.now()
    });

    this.pruneOldSystemMetrics();
  }

  /**
   * Get service metrics
   */
  getServiceMetrics(service: string): ServiceMetrics | undefined {
    const metrics = this.metrics.get(service);
    if (!metrics || metrics.length === 0) return undefined;

    // Calculate averages over the last minute
    const now = Date.now();
    const recentMetrics = metrics.filter(m => now - m.timestamp <= 60000);
    
    if (recentMetrics.length === 0) return undefined;

    return {
      latency: this.calculateAverage(recentMetrics, 'latency'),
      errorRate: this.calculateAverage(recentMetrics, 'errorRate'),
      throughput: this.calculateSum(recentMetrics, 'throughput'),
      timestamp: now
    };
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics | undefined {
    if (this.systemMetrics.length === 0) return undefined;

    // Calculate averages over the last minute
    const now = Date.now();
    const recentMetrics = this.systemMetrics.filter(m => now - m.timestamp <= 60000);
    
    if (recentMetrics.length === 0) return undefined;

    return {
      cpu: this.calculateAverage(recentMetrics, 'cpu'),
      memory: this.calculateAverage(recentMetrics, 'memory'),
      activeRequests: this.calculateAverage(recentMetrics, 'activeRequests'),
      timestamp: now
    };
  }

  /**
   * Get metrics for all services
   */
  getAllMetrics(): Record<string, ServiceMetrics | undefined> {
    const result: Record<string, ServiceMetrics | undefined> = {};
    
    for (const service of this.config.services) {
      result[service] = this.getServiceMetrics(service);
    }
    
    return result;
  }

  /**
   * Start metrics collection
   */
  private startCollection(): void {
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);
  }

  /**
   * Collect current metrics
   */
  private collectMetrics(): void {
    // Collect system metrics
    this.recordSystemMetrics({
      cpu: this.measureCPU(),
      memory: this.measureMemory(),
      activeRequests: this.measureActiveRequests()
    });

    // Collect service metrics
    for (const service of this.config.services) {
      this.recordServiceMetrics(service, {
        latency: this.measureLatency(service),
        errorRate: this.measureErrorRate(service),
        throughput: this.measureThroughput(service)
      });
    }
  }

  /**
   * Prune old metrics for a service
   */
  private pruneOldMetrics(service: string): void {
    const metrics = this.metrics.get(service);
    if (!metrics) return;

    const cutoff = Date.now() - this.config.retentionPeriod;
    this.metrics.set(service, metrics.filter(m => m.timestamp >= cutoff));
  }

  /**
   * Prune old system metrics
   */
  private pruneOldSystemMetrics(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Calculate average for a metric
   */
  private calculateAverage<T>(metrics: T[], key: keyof T): number {
    if (metrics.length === 0) return 0;
    return this.calculateSum(metrics, key) / metrics.length;
  }

  /**
   * Calculate sum for a metric
   */
  private calculateSum<T>(metrics: T[], key: keyof T): number {
    return metrics.reduce((sum, metric) => sum + (metric[key] as number), 0);
  }

  /**
   * Measure CPU usage
   */
  private measureCPU(): number {
    // Implementation would use process.cpuUsage()
    return Math.random() * 100;
  }

  /**
   * Measure memory usage
   */
  private measureMemory(): number {
    // Implementation would use process.memoryUsage()
    return Math.random() * 100;
  }

  /**
   * Measure active requests
   */
  private measureActiveRequests(): number {
    // Implementation would track actual request count
    return Math.floor(Math.random() * 100);
  }

  /**
   * Measure service latency
   */
  private measureLatency(service: string): number {
    // Implementation would measure actual service latency
    return Math.random() * 1000;
  }

  /**
   * Measure service error rate
   */
  private measureErrorRate(service: string): number {
    // Implementation would calculate actual error rate
    return Math.random() * 0.1;
  }

  /**
   * Measure service throughput
   */
  private measureThroughput(service: string): number {
    // Implementation would measure actual throughput
    return Math.floor(Math.random() * 1000);
  }
}