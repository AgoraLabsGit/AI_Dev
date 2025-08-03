/**
 * Real-Time Logic Module Monitor for AVCA & DIAS
 * Provides visibility into system decision-making and module activation
 */

import { EventEmitter } from 'events';

export interface LogicModuleEvent {
  timestamp: number;
  system: 'AVCA' | 'DIAS' | 'INTEGRATION';
  module: string;
  operation: string;
  inputs: Record<string, any>;
  decision: {
    logic: string;
    confidence?: number;
    alternatives?: string[];
  };
  outputs: Record<string, any>;
  duration: number;
  metadata?: {
    tokenUsage?: number;
    cacheHit?: boolean;
    errors?: string[];
  };
}

export interface LogicFlow {
  id: string;
  startTime: number;
  modules: LogicModuleEvent[];
  status: 'active' | 'completed' | 'failed';
}

export class LogicMonitor extends EventEmitter {
  private flows: Map<string, LogicFlow> = new Map();
  private moduleStats: Map<string, { count: number; avgDuration: number }> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Track a logic module activation
   */
  trackModule(
    system: LogicModuleEvent['system'],
    module: string,
    operation: string,
    inputs: Record<string, any>,
    logic: string
  ): { flowId: string; startTime: number } {
    if (!this.isEnabled) return { flowId: '', startTime: 0 };

    const flowId = this.generateFlowId();
    const startTime = Date.now();

    const event: Partial<LogicModuleEvent> = {
      timestamp: startTime,
      system,
      module,
      operation,
      inputs: this.sanitizeInputs(inputs),
      decision: { logic }
    };

    // Start tracking this flow
    this.flows.set(flowId, {
      id: flowId,
      startTime,
      modules: [],
      status: 'active'
    });

    // Emit for real-time display
    this.emit('module:start', { flowId, ...event });

    return { flowId, startTime };
  }

  /**
   * Complete a module operation tracking
   */
  completeModule(
    flowId: string,
    startTime: number,
    outputs: Record<string, any>,
    decision?: Partial<LogicModuleEvent['decision']>,
    metadata?: LogicModuleEvent['metadata']
  ) {
    if (!this.isEnabled || !flowId) return;

    const flow = this.flows.get(flowId);
    if (!flow) return;

    const duration = Date.now() - startTime;
    const lastEvent = flow.modules[flow.modules.length - 1] || {};

    const completeEvent: LogicModuleEvent = {
      ...lastEvent,
      outputs: this.sanitizeOutputs(outputs),
      decision: { ...lastEvent.decision, ...decision },
      duration,
      metadata
    } as LogicModuleEvent;

    flow.modules.push(completeEvent);
    this.updateModuleStats(completeEvent.module, duration);

    // Emit for real-time display
    this.emit('module:complete', completeEvent);
    this.logToConsole(completeEvent);
  }

  /**
   * Track decision logic branching
   */
  trackDecision(
    flowId: string,
    decision: string,
    confidence?: number,
    alternatives?: string[]
  ) {
    if (!this.isEnabled || !flowId) return;

    const flow = this.flows.get(flowId);
    if (!flow) return;

    this.emit('decision', {
      flowId,
      decision,
      confidence,
      alternatives,
      timestamp: Date.now()
    });
  }

  /**
   * Log module activation to console with formatting
   */
  private logToConsole(event: LogicModuleEvent) {
    const color = this.getSystemColor(event.system);
    const icon = this.getSystemIcon(event.system);
    
    console.log(
      `${color}[${this.safeFormatTimestamp(event.timestamp)}] ${icon} ${event.system}:${event.module}${this.resetColor()}`,
      `\n  └─ ${event.operation}: ${event.decision.logic}`,
      event.decision.confidence ? `(confidence: ${event.decision.confidence}%)` : '',
      `\n  └─ Duration: ${event.duration}ms`,
      event.metadata?.tokenUsage ? `| Tokens: ${event.metadata.tokenUsage}` : '',
      event.metadata?.cacheHit ? '| CACHE HIT' : ''
    );

    if (event.decision.alternatives?.length) {
      console.log(`  └─ Alternatives considered: ${event.decision.alternatives.join(', ')}`);
    }
  }

  /**
   * Get module activation statistics
   */
  getModuleStats() {
    return Array.from(this.moduleStats.entries()).map(([module, stats]) => ({
      module,
      ...stats
    }));
  }

  /**
   * Get active flows
   */
  getActiveFlows(): LogicFlow[] {
    return Array.from(this.flows.values()).filter(f => f.status === 'active');
  }

  /**
   * Mark flow as completed
   */
  completeFlow(flowId: string, status: 'completed' | 'failed' = 'completed') {
    const flow = this.flows.get(flowId);
    if (flow) {
      flow.status = status;
      this.emit('flow:complete', flow);
    }
  }

  private generateFlowId(): string {
    return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeInputs(inputs: Record<string, any>): Record<string, any> {
    // Truncate large inputs for display
    return Object.entries(inputs).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.length > 100) {
        acc[key] = value.substring(0, 100) + '...';
      } else if (Array.isArray(value)) {
        acc[key] = `Array(${value.length})`;
      } else if (typeof value === 'object' && value !== null) {
        acc[key] = `Object(${Object.keys(value).length} keys)`;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  private safeFormatTimestamp(timestamp: number | undefined): string {
    try {
      if (!timestamp || isNaN(timestamp)) {
        return new Date().toISOString();
      }
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch (error) {
      console.warn('Error formatting timestamp:', error, timestamp);
      return new Date().toISOString();
    }
  }

  private sanitizeOutputs(outputs: Record<string, any>): Record<string, any> {
    return this.sanitizeInputs(outputs); // Same logic
  }

  private updateModuleStats(module: string, duration: number) {
    const current = this.moduleStats.get(module) || { count: 0, avgDuration: 0 };
    const newCount = current.count + 1;
    const newAvg = (current.avgDuration * current.count + duration) / newCount;
    
    this.moduleStats.set(module, {
      count: newCount,
      avgDuration: Math.round(newAvg)
    });
  }

  private getSystemColor(system: LogicModuleEvent['system']): string {
    const colors = {
      AVCA: '\x1b[34m',      // Blue
      DIAS: '\x1b[32m',      // Green
      INTEGRATION: '\x1b[35m' // Magenta
    };
    return colors[system] || '\x1b[37m';
  }

  private getSystemIcon(system: LogicModuleEvent['system']): string {
    const icons = {
      AVCA: '🔷',
      DIAS: '🧠',
      INTEGRATION: '🔗'
    };
    return icons[system] || '📊';
  }

  private resetColor(): string {
    return '\x1b[0m';
  }
}

// Singleton instance
export const logicMonitor = new LogicMonitor();

// AVCA Module Tracking Helpers
export const AVCA_MODULES = {
  AI_CLIENT: 'AI_CLIENT',
  SOURCE_ANALYZER: 'SOURCE_ANALYZER',
  DOCUMENT_GENERATOR: 'DOCUMENT_GENERATOR',
  BLUEPRINT_SERVICE: 'BLUEPRINT_SERVICE',
  MIGRATION_SERVICE: 'MIGRATION_SERVICE',
  PIPELINE: 'PIPELINE',
  VALIDATOR: 'VALIDATOR'
} as const;

// DIAS Module Tracking Helpers
export const DIAS_MODULES = {
  PATTERN_RECOGNITION: 'PATTERN_RECOGNITION',
  FRAMEWORK_DETECTOR: 'FRAMEWORK_DETECTOR',
  ARCHITECTURE_ANALYZER: 'ARCHITECTURE_ANALYZER',
  COMPONENT_MAPPER: 'COMPONENT_MAPPER',
  LEARNING_SYSTEM: 'LEARNING_SYSTEM',
  EVENT_HANDLER: 'EVENT_HANDLER',
  INTELLIGENCE_ENGINE: 'INTELLIGENCE_ENGINE'
} as const;

// Integration Module Tracking
export const INTEGRATION_MODULES = {
  SYSTEM_INTEGRATOR: 'SYSTEM_INTEGRATOR',
  SERVICE_ORCHESTRATOR: 'SERVICE_ORCHESTRATOR',
  RESILIENCE_MANAGER: 'RESILIENCE_MANAGER',
  PERFORMANCE_MONITOR: 'PERFORMANCE_MONITOR'
} as const;