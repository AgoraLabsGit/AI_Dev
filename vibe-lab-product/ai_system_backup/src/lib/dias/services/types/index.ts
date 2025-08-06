/**
 * DIAS Services Types
 * TypeScript interfaces for SuperClaude and TaskMaster integration
 */

// SuperClaude Personas
export type SuperClaudePersona = 
  | 'architect'
  | 'frontend' 
  | 'backend'
  | 'analyzer'
  | 'security'
  | 'mentor'
  | 'refactorer'
  | 'performance'
  | 'qa'
  | 'devops'
  | 'scribe';

// SuperClaude Commands
export type SuperClaudeCommand = 
  | '/analyze'
  | '/build'
  | '/implement'
  | '/improve'
  | '/design'
  | '/task'
  | '/troubleshoot'
  | '/explain'
  | '/cleanup'
  | '/document'
  | '/estimate'
  | '/test'
  | '/git'
  | '/index'
  | '/load'
  | '/spawn';

// SuperClaude Flags
export interface SuperClaudeFlags {
  plan?: boolean;
  think?: boolean;
  thinkHard?: boolean;
  ultrathink?: boolean;
  uc?: boolean;
  answerOnly?: boolean;
  validate?: boolean;
  safeMode?: boolean;
  verbose?: boolean;
  c7?: boolean;
  seq?: boolean;
  magic?: boolean;
  play?: boolean;
  allMcp?: boolean;
  noMcp?: boolean;
  delegate?: 'files' | 'folders' | 'auto';
  concurrency?: number;
  waveMode?: 'auto' | 'force' | 'off';
  waveStrategy?: 'progressive' | 'systematic' | 'adaptive' | 'enterprise';
  scope?: 'file' | 'module' | 'project' | 'system';
  focus?: 'performance' | 'security' | 'quality' | 'architecture' | 'accessibility' | 'testing';
  loop?: boolean;
  iterations?: number;
  interactive?: boolean;
  persona?: SuperClaudePersona;
  introspect?: boolean;
}

// MCP Server Types
export type MCPServerType = 'context7' | 'sequential' | 'magic' | 'playwright';

export interface MCPServerConfig {
  enabled: boolean;
  endpoint?: string;
  timeout?: number;
  retries?: number;
}

// TaskMaster Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done' | 'deferred' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  details?: string;
  testStrategy?: string;
  subtasks?: SubTask[];
  complexity?: number;
  estimatedTime?: string;
  mcpIntegration?: MCPServerType[];
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
}

export interface ComplexityReport {
  tasks: ComplexityAnalysis[];
  summary: {
    totalTasks: number;
    averageComplexity: number;
    highComplexityTasks: number;
    recommendedExpansions: number;
  };
}

export interface ComplexityAnalysis {
  taskId: string;
  complexity: number;
  recommendedSubtasks: number;
  expansionPrompt: string;
  expansionCommand: string;
}

// Service Response Types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
  metadata?: Record<string, any>;
}

// AI Orchestrator Types
export interface AIRequest {
  command: SuperClaudeCommand;
  args?: string[];
  flags?: SuperClaudeFlags;
  context?: string;
  sessionId?: string;
}

export interface AIResponse {
  result: string;
  persona?: SuperClaudePersona;
  mcpServersUsed: MCPServerType[];
  executionTime: number;
  tokensUsed?: number;
  cost?: number;
  metadata: Record<string, any>;
}

// Context Manager Types
export interface ContextData {
  projectId: string;
  files: string[];
  code: string;
  documentation: string;
  history: string[];
  userPreferences: Record<string, any>;
}

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  compressed: boolean;
}

// Memory System Types
export type MemoryLayer = 'in-memory' | 'redis' | 'database';

export interface MemoryEntry {
  id: string;
  layer: MemoryLayer;
  data: any;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

// Resilience Pattern Types
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
  refillPeriod: number;
}

export interface ResilienceConfig {
  circuitBreaker: CircuitBreakerConfig;
  tokenBucket: TokenBucketConfig;
  retryAttempts: number;
  retryDelay: number;
}

// Service Configuration
export interface DIASServiceConfig {
  taskMasterCLI: {
    command: string;
    configPath: string;
    apiKey: string;
  };
  superClaude: {
    defaultPersona: SuperClaudePersona;
    defaultFlags: SuperClaudeFlags;
  };
  mcpServers: Record<MCPServerType, MCPServerConfig>;
  resilience: ResilienceConfig;
  cache: {
    maxSize: number;
    defaultTTL: number;
    compressionThreshold: number;
  };
  memory: {
    layers: MemoryLayer[];
    syncInterval: number;
  };
}

// Event Types for AVCA Integration
export interface DIASEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

export interface EventHandler {
  eventType: string;
  handler: (event: DIASEvent) => Promise<void>;
}