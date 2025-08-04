/**
 * Development-Friendly Types for Vibe Lab
 * Designed to support both current ESLint cleanup and future Roadmap 9 implementation
 */

// ===== FLEXIBLE BASE TYPES =====

/** Flexible object type that can accommodate future properties */
export type FlexibleObject = Record<string, unknown>;

/** Service response that can evolve with implementation */
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: FlexibleObject;
}

/** Configuration object that can grow with features */
export interface FlexibleConfig {
  [key: string]: string | number | boolean | FlexibleObject | unknown[];
}

// ===== AI SYSTEM TYPES =====

/** Base AI client interface - will be refined in Roadmap 9 */
export interface BaseAIClient {
  id?: string;
  model?: string;
  configuration?: FlexibleConfig;
  capabilities?: string[];
}

/** Analysis request that supports various types of analysis */
export interface AnalysisRequest {
  type: 'code' | 'system' | 'architecture' | 'quality' | 'performance' | string;
  target: string | FlexibleObject;
  context?: FlexibleObject;
  options?: FlexibleConfig;
}

/** Analysis result with flexible data structure */
export interface AnalysisResult {
  type: string;
  findings: FlexibleObject[];
  recommendations?: string[];
  metrics?: FlexibleObject;
  confidence?: number;
}

// ===== CONVERSATION TYPES =====

/** Message in conversation history */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: FlexibleObject;
}

/** Conversation context that can expand with features */
export interface ConversationContext {
  stage?: 'initial' | 'requirements' | 'features' | 'architecture' | string;
  extractedInfo?: FlexibleObject;
  userPreferences?: FlexibleConfig;
  sessionData?: FlexibleObject;
}

// ===== COMPONENT TYPES =====

/** Component request for AVCA pipeline */
export interface ComponentRequest {
  type: string;
  name: string;
  specifications?: FlexibleObject;
  styling?: FlexibleConfig;
  functionality?: string[];
  context?: FlexibleObject;
}

/** Component result from generation */
export interface ComponentResult {
  code: string;
  files: Array<{
    path: string;
    content: string;
    type: 'component' | 'style' | 'test' | 'documentation';
  }>;
  dependencies?: string[];
  documentation?: string;
  metadata?: FlexibleObject;
}

// ===== TASK MANAGEMENT TYPES =====

/** Task definition that supports various complexity levels */
export interface TaskDefinition {
  id: string;
  name: string;
  description?: string;
  type?: 'component' | 'feature' | 'bug' | 'enhancement' | string;
  complexity?: number | 'low' | 'medium' | 'high' | 'very-high';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
  requirements?: FlexibleObject;
  constraints?: FlexibleConfig;
  metadata?: FlexibleObject;
}

/** Task execution result */
export interface TaskResult {
  taskId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  result?: FlexibleObject;
  artifacts?: Array<{
    type: string;
    path: string;
    content?: string;
    metadata?: FlexibleObject;
  }>;
  metrics?: {
    duration?: number;
    complexity?: number;
    quality?: number;
    [key: string]: unknown;
  };
  error?: string;
}

// ===== MCP SERVER TYPES =====

/** Base MCP server request */
export interface MCPRequest {
  type: string;
  operation: string;
  parameters: FlexibleObject;
  context?: FlexibleObject;
  metadata?: FlexibleConfig;
}

/** MCP server response */
export interface MCPResponse {
  success: boolean;
  data?: FlexibleObject;
  error?: string;
  serverInfo?: {
    name: string;
    version?: string;
    capabilities?: string[];
  };
  processingTime?: number;
  metadata?: FlexibleObject;
}

// ===== DIAS INTELLIGENCE TYPES =====

/** Intelligence module configuration */
export interface IntelligenceConfig {
  moduleId: string;
  enabled: boolean;
  configuration: FlexibleConfig;
  capabilities: string[];
  dependencies?: string[];
  metadata?: FlexibleObject;
}

/** System state for monitoring and adaptation */
export interface SystemState {
  timestamp: string;
  modules: Array<{
    id: string;
    status: 'active' | 'inactive' | 'error' | 'initializing';
    metrics?: FlexibleObject;
    configuration?: FlexibleConfig;
  }>;
  performance: {
    responseTime?: number;
    throughput?: number;
    errorRate?: number;
    [key: string]: unknown;
  };
  resources: {
    memory?: number;
    cpu?: number;
    storage?: number;
    [key: string]: unknown;
  };
  metadata?: FlexibleObject;
}

// ===== QUALITY TYPES =====

/** Quality assessment result */
export interface QualityAssessment {
  overall: number; // 0-100 score
  dimensions: {
    functionality?: number;
    reliability?: number;
    usability?: number;
    efficiency?: number;
    maintainability?: number;
    portability?: number;
    [key: string]: unknown;
  };
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    location?: string;
    suggestion?: string;
    metadata?: FlexibleObject;
  }>;
  recommendations: string[];
  metadata?: FlexibleObject;
}

// ===== UTILITY TYPES =====

/** Function that can be used in various contexts */
export type FlexibleFunction<T = unknown[], R = unknown> = (...args: T[]) => R | Promise<R>;

/** Event data that can accommodate any event type */
export interface FlexibleEvent {
  type: string;
  source: string;
  timestamp: string;
  data: FlexibleObject;
  metadata?: FlexibleConfig;
}

/** Generic service interface that can be extended */
export interface BaseService {
  readonly name: string;
  readonly version?: string;
  initialize?(): Promise<void>;
  health?(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: FlexibleObject }>;
  cleanup?(): Promise<void>;
}

// ===== EXPORT CONVENIENCE TYPES =====

/** Common use cases for quick development */
export type APIResponseData = ServiceResponse<FlexibleObject>;
export type ConfigObject = FlexibleConfig;
export type DataObject = FlexibleObject;
export type EventData = FlexibleEvent;
export type ServiceConfig = IntelligenceConfig;

/**
 * Type Guards for Runtime Safety
 */
export const isServiceResponse = (obj: unknown): obj is ServiceResponse => {
  return typeof obj === 'object' && obj !== null && 'success' in obj;
};

export const isConversationMessage = (obj: unknown): obj is ConversationMessage => {
  return typeof obj === 'object' && obj !== null && 
         'role' in obj && 'content' in obj && 'timestamp' in obj;
};

export const isTaskDefinition = (obj: unknown): obj is TaskDefinition => {
  return typeof obj === 'object' && obj !== null && 
         'id' in obj && 'name' in obj;
};