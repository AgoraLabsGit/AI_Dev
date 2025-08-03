/**
 * DIAS Event Types
 * 
 * Defines all event types for the AVCA-DIAS pipeline lifecycle
 */

// Event Categories
export enum EventCategory {
  COMPONENT = 'component',
  PIPELINE = 'pipeline',
  QUALITY = 'quality',
  USER = 'user',
  SYSTEM = 'system',
  INTEGRATION = 'integration',
  ANALYSIS = 'analysis',
  MIGRATION = 'migration'
}

// Base Event Interface
export interface DIASEvent {
  id: string;
  category: EventCategory;
  type: string;
  timestamp: Date;
  source: string;
  projectId: string;
  correlationId?: string;
  causationId?: string;
  data: any;
  metadata?: Record<string, any>;
}

// Component Lifecycle Events
export enum ComponentEventType {
  CREATED = 'component.created',
  UPDATED = 'component.updated',
  REGISTERED = 'component.registered',
  DEPLOYED = 'component.deployed',
  DEPRECATED = 'component.deprecated',
  DELETED = 'component.deleted'
}

export interface ComponentEvent extends DIASEvent {
  category: EventCategory.COMPONENT;
  type: ComponentEventType;
  data: {
    componentId: string;
    componentName: string;
    componentType: string;
    version: string;
    blueprint?: any;
    code?: string;
    tests?: any;
    dependencies?: string[];
  };
}

// Pipeline Events
export enum PipelineEventType {
  STAGE_STARTED = 'STAGE_STARTED',
  STAGE_COMPLETED = 'STAGE_COMPLETED',
  STAGE_FAILED = 'STAGE_FAILED',
  PIPELINE_STARTED = 'PIPELINE_STARTED',
  PIPELINE_COMPLETED = 'PIPELINE_COMPLETED',
  PIPELINE_FAILED = 'PIPELINE_FAILED',
  // Component system events
  COMPONENT_SEARCH = 'COMPONENT_SEARCH',
  COMPONENT_SEARCH_COMPLETED = 'COMPONENT_SEARCH_COMPLETED',
  COMPONENT_SEARCH_FAILED = 'COMPONENT_SEARCH_FAILED',
  COMPONENT_RECOMMENDATION = 'COMPONENT_RECOMMENDATION',
  COMPONENT_RECOMMENDATION_COMPLETED = 'COMPONENT_RECOMMENDATION_COMPLETED',
  COMPONENT_RECOMMENDATION_FAILED = 'COMPONENT_RECOMMENDATION_FAILED',
  COMPONENT_VIEWED = 'COMPONENT_VIEWED'
}

export interface PipelineEvent extends DIASEvent {
  category: EventCategory.PIPELINE;
  type: PipelineEventType;
  data: {
    pipelineId: string;
    stage?: string;
    stageNumber?: number;
    totalStages?: number;
    input?: any;
    output?: any;
    duration?: number;
    error?: {
      message: string;
      code: string;
      details?: any;
    };
  };
}

// Quality Gate Events
export enum QualityEventType {
  CHECK_STARTED = 'quality.check.started',
  CHECK_PASSED = 'quality.check.passed',
  CHECK_FAILED = 'quality.check.failed',
  CHECK_SKIPPED = 'quality.check.skipped',
  OVERRIDE_REQUESTED = 'quality.override.requested',
  OVERRIDE_APPROVED = 'quality.override.approved',
  OVERRIDE_REJECTED = 'quality.override.rejected'
}

export interface QualityEvent extends DIASEvent {
  category: EventCategory.QUALITY;
  type: QualityEventType;
  data: {
    checkType: 'coverage' | 'security' | 'performance' | 'style' | 'custom';
    target: string;
    result?: {
      score: number;
      passed: boolean;
      details: Record<string, any>;
    };
    threshold?: number;
    override?: {
      reason: string;
      approvedBy?: string;
    };
  };
}

// User Decision Events
export enum UserEventType {
  APPROVED = 'user.approved',
  REJECTED = 'user.rejected',
  MODIFIED = 'user.modified',
  REQUESTED_CHANGE = 'user.requested.change',
  PROVIDED_FEEDBACK = 'user.provided.feedback'
}

export interface UserEvent extends DIASEvent {
  category: EventCategory.USER;
  type: UserEventType;
  data: {
    userId?: string;
    action: string;
    target: {
      type: string;
      id: string;
    };
    decision?: 'approve' | 'reject' | 'modify';
    modifications?: any;
    feedback?: string;
    reason?: string;
  };
}

// System Events
export enum SystemEventType {
  READY = 'system.ready',
  ERROR = 'system.error',
  WARNING = 'system.warning',
  RECOVERING = 'system.recovering',
  MAINTENANCE = 'system.maintenance',
  SHUTDOWN = 'system.shutdown',
  METRICS_UPDATED = 'system.metrics.updated'
}

export interface SystemEvent extends DIASEvent {
  category: EventCategory.SYSTEM;
  type: SystemEventType;
  data: {
    service?: string;
    status?: 'healthy' | 'degraded' | 'down';
    message: string;
    error?: {
      code: string;
      details: any;
    };
    metrics?: {
      cpu?: number;
      memory?: number;
      requestsPerSecond?: number;
      errorRate?: number;
    };
  };
}

// Integration Events (AVCA-DIAS specific)
export enum IntegrationEventType {
  AVCA_REQUEST = 'integration.avca.request',
  AVCA_RESPONSE = 'integration.avca.response',
  DIAS_SUGGESTION = 'integration.dias.suggestion',
  DIAS_LEARNING = 'integration.dias.learning',
  SYNC_STARTED = 'integration.sync.started',
  SYNC_COMPLETED = 'integration.sync.completed'
}

export interface IntegrationEvent extends DIASEvent {
  category: EventCategory.INTEGRATION;
  type: IntegrationEventType;
  data: {
    sourceSystem: 'avca' | 'dias';
    targetSystem: 'avca' | 'dias';
    operation: string;
    payload: any;
    result?: {
      success: boolean;
      data?: any;
      error?: any;
    };
  };
}

// Type Guards
export function isComponentEvent(event: DIASEvent): event is ComponentEvent {
  return event.category === EventCategory.COMPONENT;
}

export function isPipelineEvent(event: DIASEvent): event is PipelineEvent {
  return event.category === EventCategory.PIPELINE;
}

export function isQualityEvent(event: DIASEvent): event is QualityEvent {
  return event.category === EventCategory.QUALITY;
}

export function isUserEvent(event: DIASEvent): event is UserEvent {
  return event.category === EventCategory.USER;
}

export function isSystemEvent(event: DIASEvent): event is SystemEvent {
  return event.category === EventCategory.SYSTEM;
}

export function isIntegrationEvent(event: DIASEvent): event is IntegrationEvent {
  return event.category === EventCategory.INTEGRATION;
}

// Event Factory
export class EventFactory {
  static createEvent<T extends DIASEvent>(
    category: EventCategory,
    type: string,
    data: any,
    metadata?: Record<string, any>
  ): T {
    return {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      type,
      timestamp: new Date(),
      source: 'onboarding-system',
      projectId: metadata?.projectId || 'unknown',
      data,
      metadata
    } as T;
  }
} 