/**
 * Component Pipeline Types
 * 
 * Shared types for all stages of the component generation pipeline
 */

// Enhanced blueprint structure for component generation
export interface ComponentBlueprint {
  id: string;
  name: string;
  description: string;
  type: ComponentType;
  category: ComponentCategory;
  requirements: {
    functional: FunctionalRequirement[];
    technical: TechnicalRequirement[];
    design: DesignRequirement[];
  };
  dependencies: {
    internal: InternalDependency[];
    external: ExternalDependency[];
    peer: PeerDependency[];
  };
  structure: {
    files: FileStructure[];
    exports: ExportDefinition[];
    imports: ImportRequirement[];
  };
  validation: {
    schema?: any; // JSON Schema
    rules: ValidationRule[];
    constraints: Constraint[];
  };
  metadata: {
    priority: Priority;
    complexity: Complexity;
    estimatedTime: number; // in minutes
    tags: string[];
  };
}

export enum ComponentType {
  UI_COMPONENT = 'UI_COMPONENT',
  SERVICE = 'SERVICE',
  HOOK = 'HOOK',
  UTILITY = 'UTILITY',
  LAYOUT = 'LAYOUT',
  PAGE = 'PAGE',
  API_ROUTE = 'API_ROUTE'
}

export enum ComponentCategory {
  CORE = 'CORE',
  FEATURE = 'FEATURE',
  SHARED = 'SHARED',
  EXTERNAL = 'EXTERNAL'
}

export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum Complexity {
  SIMPLE = 'SIMPLE',
  MODERATE = 'MODERATE',
  COMPLEX = 'COMPLEX',
  VERY_COMPLEX = 'VERY_COMPLEX'
}

export interface FunctionalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  priority: Priority;
}

export interface TechnicalRequirement {
  id: string;
  category: 'PERFORMANCE' | 'SECURITY' | 'ACCESSIBILITY' | 'COMPATIBILITY';
  specification: string;
  threshold?: number | string;
  mandatory: boolean;
}

export interface DesignRequirement {
  id: string;
  pattern: string; // e.g., 'atomic', 'compound', 'container', 'presentational'
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion';
  responsive: boolean;
  theme: boolean;
  animation?: string;
}

export interface InternalDependency {
  componentId: string;
  type: 'IMPORT' | 'COMPOSE' | 'EXTEND';
  required: boolean;
}

export interface ExternalDependency {
  package: string;
  version: string;
  type: 'PROD' | 'DEV' | 'PEER';
}

export interface PeerDependency {
  componentId: string;
  relationship: 'SIBLING' | 'PARENT' | 'CHILD';
  communication: 'PROPS' | 'CONTEXT' | 'EVENT' | 'STATE';
}

export interface FileStructure {
  path: string;
  type: 'COMPONENT' | 'TEST' | 'STORY' | 'STYLE' | 'TYPE' | 'UTIL';
  template?: string;
}

export interface ExportDefinition {
  name: string;
  type: 'DEFAULT' | 'NAMED' | 'TYPE';
  description?: string;
}

export interface ImportRequirement {
  source: string;
  imports: string[];
  type: 'RELATIVE' | 'ABSOLUTE' | 'PACKAGE';
}

export interface ValidationRule {
  property: string;
  rule: string;
  errorMessage: string;
}

export interface Constraint {
  type: 'SIZE' | 'PERFORMANCE' | 'DEPENDENCY';
  limit: number | string;
  metric: string;
}

// Component Plan (Stage 2 output)
export interface ComponentPlan {
  blueprint: ComponentBlueprint;
  implementation: {
    approach: string;
    patterns: string[];
    architecture: 'functional' | 'class' | 'mixed';
  };
  fileStructure: {
    rootPath: string;
    files: PlannedFile[];
  };
  interfaces: {
    props?: InterfaceDefinition;
    state?: InterfaceDefinition;
    context?: InterfaceDefinition;
    events?: EventDefinition[];
  };
  testPlan: {
    unitTests: TestCase[];
    integrationTests: TestCase[];
    scenarios: TestScenario[];
  };
}

export interface PlannedFile {
  path: string;
  type: FileStructure['type'];
  purpose: string;
  dependencies: string[];
  exports: string[];
  estimatedLines: number;
}

export interface InterfaceDefinition {
  name: string;
  properties: PropertyDefinition[];
  methods?: MethodDefinition[];
}

export interface PropertyDefinition {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description?: string;
}

export interface MethodDefinition {
  name: string;
  parameters: PropertyDefinition[];
  returnType: string;
  description?: string;
}

export interface EventDefinition {
  name: string;
  payload?: InterfaceDefinition;
  description?: string;
}

export interface TestCase {
  name: string;
  type: 'unit' | 'integration' | 'e2e';
  description: string;
  assertions: string[];
}

export interface TestScenario {
  name: string;
  steps: string[];
  expectedResults: string[];
}

// Generated Component (Stage 3 output)
export interface GeneratedComponent {
  plan: ComponentPlan;
  files: GeneratedFile[];
  documentation: {
    readme: string;
    apiDocs: string;
    examples: CodeExample[];
  };
  qualityReport: {
    lintingPassed: boolean;
    typeCheckPassed: boolean;
    testsPassed: boolean;
    coverage?: number;
    issues: QualityIssue[];
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: 'typescript' | 'javascript' | 'css' | 'markdown';
  size: number;
  hash: string;
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: string;
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  type: 'lint' | 'type' | 'test' | 'performance' | 'security' | 'react' | 'import' | 'style' | 'quality';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  suggestion?: string;
  fix?: {
    searchValue: string | RegExp;
    replaceValue: string;
  };
  fixed?: boolean;
}

// Pipeline Configuration
export interface PipelineConfig {
  stages: {
    parsing: boolean;
    planning: boolean;
    generation: boolean;
    quality: boolean;
  };
  options: {
    strictMode: boolean;
    validateDependencies: boolean;
    generateTests: boolean;
    generateDocs: boolean;
    optimizeBundle: boolean;
  };
  constraints: {
    maxFileSize?: number;
    maxComplexity?: number;
    minCoverage?: number;
    allowedDependencies?: string[];
  };
}

// Quality Assurance Types (Stage 4)
export interface CodeOptimization {
  type: 'import' | 'performance' | 'refactor' | 'bundle' | 'style';
  description: string;
  impact: 'major' | 'moderate' | 'minor';
  file?: string;
}

export interface BestPractice {
  category: 'react' | 'typescript' | 'testing' | 'performance' | 'accessibility' | 'security';
  practice: string;
  applied: boolean;
  recommendation?: string;
}

export interface QualityReport {
  lintingPassed: boolean;
  typeCheckPassed: boolean;
  testsPassed: boolean;
  coverage?: number;
  issues: QualityIssue[];
  score?: number;
  optimizations?: CodeOptimization[];
  bestPractices?: BestPractice[];
}

export interface OptimizedComponent extends GeneratedComponent {
  qualityReport: QualityReport;
  improvements: {
    optimizationsApplied: number;
    issuesFixed: number;
    codeReduced: number;
    performanceGain: number;
  };
}
