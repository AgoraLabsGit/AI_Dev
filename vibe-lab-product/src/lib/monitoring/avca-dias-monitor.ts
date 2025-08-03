/**
 * AVCA & DIAS System Monitor
 * Integrates with actual implemented services for real-time monitoring
 */

import { logicMonitor, AVCA_MODULES, DIAS_MODULES, INTEGRATION_MODULES } from './logic-monitor';
import { BaseService } from '../avca/services/base-service';
import { EventBus } from '../avca/services/event-bus';

export interface MonitorConfig {
  eventBus?: EventBus;
  enableConsoleOutput?: boolean;
  enableDashboard?: boolean;
}

export class AVCADIASMonitor extends BaseService {
  private eventBus: EventBus;
  private config: MonitorConfig;

  constructor(config: MonitorConfig = {}) {
    super({
      name: 'avca-dias-monitor',
      version: '1.0.0',
      dependencies: []
    });

    this.config = config;
    this.eventBus = config.eventBus || new EventBus();
    
    if (process.env.NODE_ENV === 'development') {
      this.initialize();
    }
  }

  private initialize(): void {
    // Subscribe to all AVCA events
    this.subscribeToAVCAEvents();
    
    // Subscribe to all DIAS events
    this.subscribeToDIASEvents();
    
    // Subscribe to integration events
    this.subscribeToIntegrationEvents();
    
    // Subscribe to service lifecycle events
    this.subscribeToServiceEvents();
  }

  private subscribeToAVCAEvents(): void {
    // AI Client events
    this.eventBus.subscribe('ai:request:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'AVCA',
        AVCA_MODULES.AI_CLIENT,
        event.data.role,
        { prompt: event.data.prompt, entryPath: event.data.entryPath },
        `Processing ${event.data.role} request for ${event.data.entryPath || 'default'} path`
      );
      event.data._monitoring = { flowId, startTime };
    });

    this.eventBus.subscribe('ai:request:complete', (event) => {
      if (event.data._monitoring) {
        logicMonitor.completeModule(
          event.data._monitoring.flowId,
          event.data._monitoring.startTime,
          { 
            response: event.data.response?.substring(0, 100) + '...',
            model: event.data.model 
          },
          { 
            logic: `Generated ${event.data.usage?.completionTokens || 0} tokens`,
            confidence: event.data.confidence 
          },
          { 
            tokenUsage: event.data.usage?.totalTokens,
            cacheHit: event.data.cacheHit 
          }
        );
        logicMonitor.completeFlow(event.data._monitoring.flowId);
      }
    });

    // Blueprint Service events
    this.eventBus.subscribe('blueprint:generation:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'AVCA',
        AVCA_MODULES.BLUEPRINT_SERVICE,
        'generateBlueprint',
        { projectType: event.data.projectType, features: event.data.features },
        `Generating blueprint for ${event.data.projectType} project`
      );
      event.data._monitoring = { flowId, startTime };
    });

    this.eventBus.subscribe('blueprint:validation:complete', (event) => {
      if (event.data._monitoring) {
        logicMonitor.completeModule(
          event.data._monitoring.flowId,
          event.data._monitoring.startTime,
          { isValid: event.data.isValid, errors: event.data.errors },
          { 
            logic: event.data.isValid ? 'Blueprint validated' : 'Blueprint validation failed',
            confidence: event.data.validationScore 
          }
        );
      }
    });

    // Document Generator events
    this.eventBus.subscribe('document:generation:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'AVCA',
        AVCA_MODULES.DOCUMENT_GENERATOR,
        'generateDocument',
        { type: event.data.type, sections: event.data.sections },
        `Generating ${event.data.type} document`
      );
      event.data._monitoring = { flowId, startTime };
    });

    // Migration Service events
    this.eventBus.subscribe('migration:analysis:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'AVCA',
        AVCA_MODULES.MIGRATION_SERVICE,
        'analyzeMigration',
        { source: event.data.source, target: event.data.target },
        `Analyzing migration from ${event.data.source}`
      );
      event.data._monitoring = { flowId, startTime };
    });

    // Source Analyzer events
    this.eventBus.subscribe('source:analysis:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'AVCA',
        AVCA_MODULES.SOURCE_ANALYZER,
        'analyzeSource',
        { type: event.data.type, fileCount: event.data.fileCount },
        `Analyzing ${event.data.type} source with ${event.data.fileCount || 0} files`
      );
      event.data._monitoring = { flowId, startTime };
    });
  }

  private subscribeToDIASEvents(): void {
    // Pattern Recognition events
    this.eventBus.subscribe('pattern:recognition:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'DIAS',
        DIAS_MODULES.PATTERN_RECOGNITION,
        'recognizePattern',
        { type: event.data.type, context: event.data.context },
        `Recognizing ${event.data.type} patterns`
      );
      event.data._monitoring = { flowId, startTime };
      
      // Track decision point
      if (event.data.alternatives) {
        logicMonitor.trackDecision(
          flowId,
          `Evaluating pattern alternatives`,
          event.data.confidence,
          event.data.alternatives
        );
      }
    });

    // Framework Detection events
    this.eventBus.subscribe('framework:detection:complete', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'DIAS',
        DIAS_MODULES.FRAMEWORK_DETECTOR,
        'detectFramework',
        { detected: event.data.framework },
        `Framework detection completed`
      );
      
      logicMonitor.completeModule(
        flowId,
        startTime,
        { 
          framework: event.data.framework,
          version: event.data.version 
        },
        { 
          logic: `Detected ${event.data.framework} v${event.data.version}`,
          confidence: event.data.confidence,
          alternatives: event.data.alternatives 
        }
      );
      logicMonitor.completeFlow(flowId);
    });

    // Learning System events
    this.eventBus.subscribe('learning:pattern:stored', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'DIAS',
        DIAS_MODULES.LEARNING_SYSTEM,
        'storePattern',
        { pattern: event.data.pattern, outcome: event.data.outcome },
        `Storing learned pattern: ${event.data.pattern}`
      );
      
      logicMonitor.completeModule(
        flowId,
        startTime,
        { stored: true, patternId: event.data.patternId },
        { logic: 'Pattern stored for future optimization' }
      );
      logicMonitor.completeFlow(flowId);
    });

    // Event Handler events
    this.eventBus.subscribe('event:processing:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'DIAS',
        DIAS_MODULES.EVENT_HANDLER,
        'processEvent',
        { eventType: event.data.type, category: event.data.category },
        `Processing ${event.data.category} event`
      );
      event.data._monitoring = { flowId, startTime };
    });

    // Architecture Analyzer events (from unified pipeline)
    this.eventBus.subscribe('architecture:analysis:complete', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'DIAS',
        DIAS_MODULES.ARCHITECTURE_ANALYZER,
        'analyzeArchitecture',
        { patterns: event.data.patterns },
        `Architecture analysis completed`
      );
      
      logicMonitor.completeModule(
        flowId,
        startTime,
        { 
          patterns: event.data.patterns,
          quality: event.data.qualityScore 
        },
        { 
          logic: `Identified ${event.data.patterns.length} architecture patterns`,
          confidence: event.data.confidence 
        }
      );
      logicMonitor.completeFlow(flowId);
    });
  }

  private subscribeToIntegrationEvents(): void {
    // System Integration events
    this.eventBus.subscribe('integration:orchestration:start', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'INTEGRATION',
        INTEGRATION_MODULES.SYSTEM_INTEGRATOR,
        'orchestrate',
        { services: event.data.services, operation: event.data.operation },
        `Orchestrating ${event.data.services.length} services for ${event.data.operation}`
      );
      event.data._monitoring = { flowId, startTime };
    });

    // Service Orchestration events
    this.eventBus.subscribe('service:routing:complete', (event) => {
      if (event.data._monitoring) {
        logicMonitor.completeModule(
          event.data._monitoring.flowId,
          event.data._monitoring.startTime,
          { 
            routedTo: event.data.service,
            success: event.data.success 
          },
          { logic: `Routed to ${event.data.service} service` }
        );
      }
    });

    // Resilience events
    this.eventBus.subscribe('resilience:circuit:open', (event) => {
      const { flowId, startTime } = logicMonitor.trackModule(
        'INTEGRATION',
        INTEGRATION_MODULES.RESILIENCE_MANAGER,
        'circuitBreaker',
        { service: event.data.service, reason: event.data.reason },
        `Circuit breaker opened for ${event.data.service}`
      );
      
      logicMonitor.completeModule(
        flowId,
        startTime,
        { action: 'circuit_opened', service: event.data.service },
        { logic: `Service protection activated: ${event.data.reason}` }
      );
      logicMonitor.completeFlow(flowId);
    });

    // Performance Monitoring events
    this.eventBus.subscribe('metrics:collected', (event) => {
      if (event.data.metrics?.latency > 1000) {
        const { flowId, startTime } = logicMonitor.trackModule(
          'INTEGRATION',
          INTEGRATION_MODULES.PERFORMANCE_MONITOR,
          'performanceAlert',
          { service: event.data.service, latency: event.data.metrics.latency },
          `High latency detected in ${event.data.service}`
        );
        
        logicMonitor.completeModule(
          flowId,
          startTime,
          { alert: 'high_latency', threshold: 1000 },
          { logic: 'Performance degradation detected' }
        );
        logicMonitor.completeFlow(flowId);
      }
    });
  }

  private subscribeToServiceEvents(): void {
    // Service lifecycle events
    this.eventBus.subscribe('service:initialized', (event) => {
      console.log(`✅ Service initialized: ${event.data.name} v${event.data.version}`);
    });

    this.eventBus.subscribe('service:error', (event) => {
      console.error(`❌ Service error in ${event.data.service}: ${event.data.error}`);
    });

    this.eventBus.subscribe('service:health:check', (event) => {
      if (event.data.status !== 'healthy') {
        console.warn(`⚠️ Service ${event.data.service} is ${event.data.status}`);
      }
    });
  }

  /**
   * Get missing modules that haven't been triggered
   */
  getMissingModules(): { avca: string[], dias: string[], integration: string[] } {
    const stats = logicMonitor.getModuleStats();
    const activeModules = new Set(stats.map(s => s.module));

    const missingAVCA = Object.values(AVCA_MODULES)
      .filter(module => !activeModules.has(module));
    
    const missingDIAS = Object.values(DIAS_MODULES)
      .filter(module => !activeModules.has(module));
    
    const missingIntegration = Object.values(INTEGRATION_MODULES)
      .filter(module => !activeModules.has(module));

    return {
      avca: missingAVCA,
      dias: missingDIAS,
      integration: missingIntegration
    };
  }

  /**
   * Generate monitoring report
   */
  generateReport(): string {
    const stats = logicMonitor.getModuleStats();
    const missing = this.getMissingModules();

    let report = '📊 AVCA/DIAS Monitoring Report\n';
    report += '================================\n\n';

    report += '✅ Active Modules:\n';
    stats.forEach(stat => {
      report += `  - ${stat.module}: ${stat.count} calls (avg ${stat.avgDuration}ms)\n`;
    });

    report += '\n❌ Missing/Inactive Modules:\n';
    if (missing.avca.length > 0) {
      report += `  AVCA: ${missing.avca.join(', ')}\n`;
    }
    if (missing.dias.length > 0) {
      report += `  DIAS: ${missing.dias.join(', ')}\n`;
    }
    if (missing.integration.length > 0) {
      report += `  Integration: ${missing.integration.join(', ')}\n`;
    }

    return report;
  }
}

// Export singleton instance
export const systemMonitor = new AVCADIASMonitor({
  enableConsoleOutput: true,
  enableDashboard: true
});