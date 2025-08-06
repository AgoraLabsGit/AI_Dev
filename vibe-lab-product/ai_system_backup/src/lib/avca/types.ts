/**
 * AVCA Type Definitions
 * Core types for AI-Verified Component Architecture
 */

// Atomic Unit Types (8 types as per AVCA spec)
export type AtomicUnitType = 
  | 'UI Components'
  | 'Logic Modules'
  | 'Data Patterns'
  | 'Infrastructure'
  | 'Integration Patterns'
  | 'Workflow Patterns'
  | 'Cross-Cutting Patterns'
  | 'Capability Providers';

// Intent Classification Types
export interface UserIntent {
  originalMessage: string;
  classifiedIntent: IntentType;
  confidence: number;
  entities: Entity[];
}

export type IntentType = 
  | 'BLUEPRINT_CREATION'
  | 'COMPONENT_REQUEST'
  | 'STYLE_CHANGE'
  | 'FEATURE_REQUEST'
  | 'ERROR_REPORT'
  | 'DESIGN_CHANGE'
  | 'QUESTION'
  | 'CODE_REVIEW'
  | 'DEBUG_HELP'
  | 'OPTIMIZATION'
  | 'STATUS_CHECK'
  | 'ROADMAP_UPDATE'
  | 'TASK_MANAGEMENT'
  | 'GENERAL_QUESTION'
  | 'CLARIFICATION_REQUEST'
  | 'SUGGESTION_REQUEST'
  | 'FEEDBACK'
  | 'PREFERENCE_UPDATE'
  | 'COMMUNICATION_STYLE'
  | 'TECHNICAL_CHOICE'
  | 'CAPABILITIES_QUERY'
  | 'HELP_REQUEST'
  | 'UNRELATED_QUERY';

export interface Entity {
  type: string;
  value: string;
}

// Blueprint Requirements
export interface BlueprintRequirements {
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  designRequirements: string[];
}

// Component Requirements
export interface ComponentRequirement {
  name: string;
  type: string;
  atomic: AtomicUnitType;
  description: string;
  props?: Record<string, string>;
  exports?: Record<string, string>;
  schema?: Record<string, string>;
  dependencies: string[];
}

// Quality Gates
export interface QualityGates {
  coverage: {
    unit: number;
    integration: number;
    e2e: number;
  };
  performance: {
    responseTime: number;
    renderTime: number;
    bundleSize: number;
  };
  accessibility: {
    standard: 'WCAG_AA' | 'WCAG_AAA';
    keyboardNav: boolean;
    screenReader: boolean;
  };
  security: {
    inputSanitization: boolean;
    xssProtection: boolean;
    apiValidation: boolean;
  };
}

// Test Scenarios
export interface TestScenario {
  name: string;
  steps: string[];
}

// Success Metrics
export interface SuccessMetrics {
  pipelineExecution: {
    totalTime: number;
    manualIntervention: number;
    aiTokenCost: number;
  };
  generatedCode: {
    testCoverage: number;
    lintErrors: number;
    typeErrors: number;
    securityIssues: number;
  };
  userExperience: {
    searchSpeed: number;
    relevance: number;
    usability: string;
  };
}

// Feature Specification
export interface FeatureSpecification {
  id: string;
  title: string;
  description: string;
  userIntent: UserIntent;
  blueprintRequirements: BlueprintRequirements;
  componentRequirements: ComponentRequirement[];
  qualityGates: QualityGates;
  testScenarios: TestScenario[];
  successMetrics: SuccessMetrics;
}

// Pipeline Stage Types
export enum PipelineStage {
  IDEATION = 'ideation',
  BLUEPRINTS = 'blueprints',
  STYLING = 'styling',
  PAGE_DESIGNS = 'page_designs',
  COMPONENT_SPECS = 'component_specs',
  CODE_GENERATION = 'code_generation',
  VERIFICATION = 'verification',
  REGISTRY = 'registry',
  ASSEMBLY = 'assembly'
}

// Worker Types
export interface WorkerInput {
  stage: PipelineStage;
  data: any;
  context?: WorkerContext;
}

export interface WorkerOutput {
  success: boolean;
  data: any;
  errors?: string[];
  metrics?: Record<string, any>;
}

export interface WorkerContext {
  projectId: string;
  userId: string;
  preferences?: UserPreferences;
  history?: any[];
}

export interface UserPreferences {
  communicationStyle: 'concise' | 'detailed' | 'balanced';
  responseFormat: 'technical' | 'simple' | 'educational';
  codeStyle?: Record<string, any>;
  favoriteTools?: string[];
}

// Component Registry Types
export interface RegistryComponent {
  id: string;
  name: string;
  type: AtomicUnitType;
  version: string;
  propsSchema: Record<string, any>;
  dependencies: string[];
  qualityScores: QualityScores;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityScores {
  overall: number;
  coverage: number;
  security: number;
  performance: number;
  accessibility: number;
  typing: boolean;
}

// DIAS Event Types
export interface DIASEvent {
  type: string;
  module: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Validation Results
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} 