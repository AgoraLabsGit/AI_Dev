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
  // NEW: Component detection and recommendation data
  componentDetection?: ComponentDetectionData;
}

// NEW: Component detection and recommendation types
export interface ComponentDetectionData {
  detectedPatterns: UIPattern[];
  componentRequirements: ComponentRequirement[];
  templateRecommendations: TemplateRecommendation[];
  confidence: number;
  reasoning: string[];
}

export interface UIPattern {
  type: 'dashboard' | 'ecommerce' | 'blog' | 'landing' | 'admin' | 'auth' | 'form' | 'gallery' | 'navigation' | 'sidebar' | 'modal' | 'table' | 'list' | 'card' | 'button' | 'input' | 'chart' | 'calendar' | 'chat' | 'profile' | 'search' | 'settings';
  confidence: number;
  keywords: string[];
  description: string;
  context?: string; // Optional context for enhanced pattern matching
}

export interface ComponentRequirement {
  category: 'navigation' | 'content' | 'form' | 'display' | 'interaction' | 'layout' | 'feedback' | 'data';
  type: string;
  priority: Priority;
  description: string;
  constraints?: string[];
  alternatives?: string[];
}

export interface TemplateRecommendation {
  templateId: string;
  name: string;
  confidence: number;
  reasoning: string[];
  componentMatches: ComponentMatch[];
}

export interface ComponentMatch {
  componentId: string;
  name: string;
  category: string;
  confidence: number;
  reasoning: string[];
  customization?: ComponentCustomization;
}

export interface ComponentCustomization {
  styling?: StyleCustomization;
  behavior?: BehaviorCustomization;
  content?: ContentCustomization;
}

export interface StyleCustomization {
  colors?: ColorCustomization;
  typography?: TypographyCustomization;
  spacing?: SpacingCustomization;
  animation?: AnimationCustomization;
}

export interface ColorCustomization {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface TypographyCustomization {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
}

export interface SpacingCustomization {
  padding?: string;
  margin?: string;
  gap?: string;
}

export interface AnimationCustomization {
  duration?: string;
  easing?: string;
  intensity?: 'subtle' | 'moderate' | 'energetic';
}

export interface BehaviorCustomization {
  interactions?: string[];
  states?: string[];
  events?: string[];
}

export interface ContentCustomization {
  text?: string;
  images?: string[];
  icons?: string[];
  data?: any;
}

// Component metadata for the catalog system
export interface ComponentMetadata {
  id: string;
  name: string;
  category: ComponentCategory;
  tags: string[];
  description: string;
  thumbnailUrl?: string;
  dependencies: string[];
  frameworkSupport: string[];
  templateVariations: ComponentVariation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentVariation {
  templateId: string;
  templateName: string;
  componentId: string;
  variationId: string;
  previewUrl?: string;
  customizationOptions: CustomizationOption[];
}

export interface CustomizationOption {
  type: 'color' | 'typography' | 'spacing' | 'animation' | 'behavior' | 'content';
  name: string;
  description: string;
  defaultValue: any;
  constraints?: any;
}

// Template system types
export interface AdvancedThemeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'minimal' | 'bold' | 'elegant';
  previewUrl?: string;
  colorPalette: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  animation: AnimationConfig;
  components: ComponentConfig[];
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  neutral: string[];
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface TypographyConfig {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface SpacingConfig {
  scale: number[];
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  intensity: 'subtle' | 'moderate' | 'energetic';
}

export interface ComponentConfig {
  componentId: string;
  defaultStyling: any;
  customizationOptions: CustomizationOption[];
  constraints: ComponentConstraint[];
}

export interface ComponentConstraint {
  type: 'size' | 'color' | 'typography' | 'spacing' | 'animation';
  property: string;
  allowedValues?: any[];
  minValue?: number;
  maxValue?: number;
  required?: boolean;
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
  styling: 'tailwind'; // Only Tailwind is allowed per AVCA architecture
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
