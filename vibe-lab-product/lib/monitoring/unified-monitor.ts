/**
 * Unified Monitoring System
 * Integrates Logic Monitor with existing MetricsCollector and LogManager
 */

import { logicMonitor } from './logic-monitor';
import { AVCADIASMonitor } from './avca-dias-monitor';
import { MetricsCollector, ServiceMetrics } from '../integration/monitoring/metrics-collector';
import { LogManager, LogLevel } from '../integration/logging/log-manager';
import { EventBus } from '../avca/services/event-bus';

export interface UnifiedMonitorConfig {
  eventBus?: EventBus;
  enableLogicMonitoring?: boolean;
  enableMetricsCollection?: boolean;
  enableLogging?: boolean;
  services?: string[];
}

export class UnifiedMonitor {
  private eventBus: EventBus;
  private logicMonitor: AVCADIASMonitor;
  private metricsCollector?: MetricsCollector;
  private logManager?: LogManager;
  private config: UnifiedMonitorConfig;

  constructor(config: UnifiedMonitorConfig = {}) {
    this.config = {
      enableLogicMonitoring: true,
      enableMetricsCollection: true,
      enableLogging: true,
      services: [
        'ai-client',
        'source-analyzer',
        'document-generator',
        'blueprint-service',
        'migration-service',
        'pattern-recognition',
        'framework-detector',
        'learning-system',
        'event-handler',
        'system-integrator'
      ],
      ...config
    };

    this.eventBus = config.eventBus || new EventBus();
    
    // Initialize components based on config
    if (this.config.enableLogicMonitoring) {
      this.logicMonitor = new AVCADIASMonitor({
        eventBus: this.eventBus,
        enableConsoleOutput: true,
        enableDashboard: true
      });
    }

    if (this.config.enableMetricsCollection) {
      this.metricsCollector = new MetricsCollector({
        services: this.config.services || [],
        interval: 5000,
        retentionPeriod: 3600000 // 1 hour
      });
    }

    if (this.config.enableLogging) {
      this.logManager = new LogManager({
        services: this.config.services || [],
        level: 'info',
        format: 'json',
        retention: 7 * 24 * 60 * 60 * 1000, // 7 days
        batchSize: 100,
        flushInterval: 5000
      });
    }

    this.setupIntegration();
  }

  private setupIntegration(): void {
    // Integrate logic monitoring with existing systems
    if (this.logicMonitor && this.metricsCollector) {
      this.integrateWithMetrics();
    }

    if (this.logicMonitor && this.logManager) {
      this.integrateWithLogging();
    }

    // Enhanced event monitoring
    this.setupEnhancedEventMonitoring();
  }

  private integrateWithMetrics(): void {
    // Convert logic monitoring events to metrics
    logicMonitor.on('module:complete', (event) => {
      const serviceName = `${event.system.toLowerCase()}-${event.module.toLowerCase()}`;
      
      // Record service metrics
      this.metricsCollector?.recordServiceMetrics(serviceName, {
        latency: event.duration,
        errorRate: event.metadata?.errors ? 1 : 0,
        throughput: 1,
        timestamp: event.timestamp
      });

      // Track token usage as a special metric
      if (event.metadata?.tokenUsage) {
        this.metricsCollector?.recordCustomMetric('token-usage', {
          service: serviceName,
          tokens: event.metadata.tokenUsage,
          timestamp: event.timestamp
        });
      }
    });
  }

  private integrateWithLogging(): void {
    // Convert logic monitoring events to structured logs
    logicMonitor.on('module:start', (event) => {
      this.logManager?.log('info', `${event.system}-${event.module}`, 
        `Starting ${event.operation}: ${event.decision.logic}`, {
          system: event.system,
          module: event.module,
          operation: event.operation,
          inputs: event.inputs,
          timestamp: event.timestamp
        });
    });

    logicMonitor.on('module:complete', (event) => {
      const level: LogLevel = event.metadata?.errors ? 'error' : 'info';
      
      this.logManager?.log(level, `${event.system}-${event.module}`,
        `Completed ${event.operation} in ${event.duration}ms`, {
          system: event.system,
          module: event.module,
          operation: event.operation,
          duration: event.duration,
          outputs: event.outputs,
          decision: event.decision,
          metadata: event.metadata,
          timestamp: event.timestamp
        });
    });

    logicMonitor.on('decision', (event) => {
      this.logManager?.log('debug', 'decision-engine',
        `Decision: ${event.decision}`, {
          decision: event.decision,
          confidence: event.confidence,
          alternatives: event.alternatives,
          flowId: event.flowId,
          timestamp: event.timestamp
        });
    });
  }

  private setupEnhancedEventMonitoring(): void {
    // Monitor key system events with enhanced context
    const keyEvents = [
      // AVCA Events
      'ai:request:start',
      'ai:request:complete',
      'blueprint:generation:start',
      'blueprint:validation:complete',
      'document:generation:start',
      'document:section:complete',
      'migration:analysis:start',
      'migration:plan:complete',
      'source:analysis:start',
      'source:analysis:complete',
      
      // DIAS Events
      'pattern:recognition:start',
      'pattern:recognition:complete',
      'framework:detection:start',
      'framework:detection:complete',
      'learning:pattern:stored',
      'learning:optimization:complete',
      'event:processing:start',
      'event:processing:complete',
      'architecture:analysis:start',
      'architecture:analysis:complete',
      
      // Integration Events
      'integration:orchestration:start',
      'integration:orchestration:complete',
      'service:routing:start',
      'service:routing:complete',
      'resilience:circuit:open',
      'resilience:circuit:close',
      'metrics:threshold:exceeded',
      'service:health:degraded'
    ];

    keyEvents.forEach(eventType => {
      this.eventBus.subscribe(eventType, (event) => {
        // Enhanced logging with context
        this.logManager?.log('info', 'system-monitor', 
          `Event: ${eventType}`, {
            eventType,
            data: event.data,
            timestamp: Date.now()
          });

        // Track event metrics
        this.metricsCollector?.recordCustomMetric('system-events', {
          eventType,
          timestamp: Date.now()
        });
      });
    });
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus(): {
    logic: any;
    metrics: any;
    logs: any;
    health: string;
  } {
    const logicStats = logicMonitor.getModuleStats();
    const missing = this.logicMonitor?.getMissingModules();
    
    return {
      logic: {
        activeModules: logicStats.length,
        totalCalls: logicStats.reduce((sum, stat) => sum + stat.count, 0),
        averageDuration: Math.round(
          logicStats.reduce((sum, stat) => sum + stat.avgDuration, 0) / logicStats.length
        ),
        missingModules: missing
      },
      metrics: {
        services: this.config.services?.length || 0,
        collectionActive: !!this.metricsCollector
      },
      logs: {
        level: 'info',
        format: 'json',
        active: !!this.logManager
      },
      health: this.calculateOverallHealth(logicStats, missing)
    };
  }

  private calculateOverallHealth(
    logicStats: any[], 
    missing?: { avca: string[], dias: string[], integration: string[] }
  ): string {
    const totalModules = 17; // Expected total from AVCA + DIAS + Integration
    const activeModules = logicStats.length;
    const healthPercentage = (activeModules / totalModules) * 100;

    if (healthPercentage >= 90) return 'excellent';
    if (healthPercentage >= 75) return 'good';
    if (healthPercentage >= 50) return 'fair';
    return 'needs-attention';
  }

  /**
   * Generate comprehensive monitoring report
   */
  generateReport(): string {
    const status = this.getSystemStatus();
    const logicReport = this.logicMonitor?.generateReport() || 'Logic monitoring disabled';

    let report = '🔍 Unified System Monitoring Report\n';
    report += '===================================\n\n';

    report += `📊 System Health: ${status.health.toUpperCase()}\n`;
    report += `📈 Active Modules: ${status.logic.activeModules}\n`;
    report += `📞 Total Calls: ${status.logic.totalCalls}\n`;
    report += `⏱️ Average Duration: ${status.logic.averageDuration}ms\n\n`;

    report += logicReport;

    report += '\n🔧 System Components:\n';
    report += `  Logic Monitoring: ${this.config.enableLogicMonitoring ? '✅' : '❌'}\n`;
    report += `  Metrics Collection: ${this.config.enableMetricsCollection ? '✅' : '❌'}\n`;
    report += `  Centralized Logging: ${this.config.enableLogging ? '✅' : '❌'}\n`;

    return report;
  }

  /**
   * Start all monitoring components
   */
  start(): void {
    this.metricsCollector?.start();
    this.logManager?.start();
    console.log('🚀 Unified monitoring system started');
  }

  /**
   * Stop all monitoring components
   */
  stop(): void {
    this.metricsCollector?.stop();
    this.logManager?.stop();
    console.log('🛑 Unified monitoring system stopped');
  }
}

// Export singleton instance for development use
export const unifiedMonitor = new UnifiedMonitor({
  eventBus: new EventBus(),
  enableLogicMonitoring: process.env.NODE_ENV === 'development',
  enableMetricsCollection: true,
  enableLogging: true
});