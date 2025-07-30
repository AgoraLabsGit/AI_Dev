/**
 * TypeScript API Contracts for AVCA/DIAS Integration
 * Defines interfaces and types for styling system integration
 */

// Core styling types
export interface AdvancedThemeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'geometric' | 'organic' | 'retro' | 'futuristic' | 'editorial' | 'playful' | 'financial';
  colors: TemplateColors;
  typography: TemplateTypography;
  borders: TemplateBorders;
  spacing: TemplateSpacing;
  shadows: TemplateShadows;
  animations: TemplateAnimations;
  effects: TemplateEffects;
  components: TemplateComponents;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
}

export interface TemplateTypography {
  primaryFont: FontConfig;
  headingFont: FontConfig;
  codeFont: FontConfig;
  scale: FontScale;
  lineHeight: LineHeightScale;
  letterSpacing: LetterSpacingScale;
}

export interface FontConfig {
  family: string;
  fallback: string;
  weights: number[];
}

export interface FontScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface LineHeightScale {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface LetterSpacingScale {
  tight: string;
  normal: string;
  wide: string;
}

export interface TemplateBorders {
  radius: BorderRadiusScale;
  width: BorderWidthScale;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
}

export interface BorderRadiusScale {
  none: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  full: string;
}

export interface BorderWidthScale {
  none: string;
  thin: string;
  base: string;
  thick: string;
}

export interface TemplateSpacing {
  scale: 'compact' | 'comfortable' | 'spacious';
  baseUnit: number;
}

export interface TemplateShadows {
  style: 'none' | 'subtle' | 'elevated' | 'dramatic' | 'neon';
  colors: string[];
}

export interface TemplateAnimations {
  duration: {
    fast: string;
    base: string;
    slow: string;
  };
  easing: {
    ease: string;
    spring: string;
    bounce: string;
  };
  effects: string[];
}

export interface TemplateEffects {
  gradients: boolean;
  glassmorphism: boolean;
  neumorphism: boolean;
  glows: boolean;
  patterns: boolean;
  noise: boolean;
}

export interface TemplateComponents {
  buttons: {
    style: 'rounded' | 'sharp' | 'pill' | 'cut-corners';
  };
  inputs: {
    style: 'outlined' | 'filled' | 'underlined';
  };
  cards: {
    style: 'flat' | 'outlined' | 'elevated' | 'glass';
  };
}

// Project styling integration
export interface ProjectStyling {
  id: string;
  projectId: string;
  templateId: string;
  customizations: TemplateCustomizations;
  appliedAt: Date;
  version: string;
}

export interface TemplateCustomizations {
  colors?: Partial<TemplateColors>;
  typography?: Partial<{
    primaryFont: string;
    headingFont: string;
    scale: 'compact' | 'comfortable' | 'spacious';
  }>;
  spacing?: Partial<TemplateSpacing>;
  borders?: Partial<{
    radius: string;
    style: string;
  }>;
  components?: Partial<{
    buttonStyle: string;
    inputStyle: string;
    cardStyle: string;
  }>;
}

// AVCA Integration Types
export interface AVCAStylingContext {
  projectStyling: {
    selectedTemplate: string;
    templateCategory: string;
    customizations: TemplateCustomizations;
    stylePreferences: UserStyleHistory;
  };
  componentGeneration: {
    inheritFromTemplate: boolean;
    styleConsistency: 'strict' | 'flexible';
    brandAlignment: BrandGuidelines;
  };
  userHistory: {
    templateSelections: TemplateUsageHistory[];
    customizationPatterns: CustomizationPattern[];
    industryAlignment: IndustryStyleAlignment;
  };
}

export interface UserStyleHistory {
  favoriteTemplates: string[];
  customizationFrequency: Record<string, number>;
  successfulProjects: string[];
  preferredCategories: string[];
}

export interface BrandGuidelines {
  primaryColors: string[];
  secondaryColors: string[];
  fontFamilies: string[];
  logoUrl?: string;
  brandPersonality: string[];
}

export interface TemplateUsageHistory {
  templateId: string;
  usageCount: number;
  lastUsedAt: Date;
  successRate: number;
  customizationFrequency: Record<string, number>;
}

export interface CustomizationPattern {
  type: 'color' | 'typography' | 'spacing' | 'component';
  frequency: number;
  preferences: Record<string, any>;
}

export interface IndustryStyleAlignment {
  detectedIndustry: string;
  confidence: number;
  recommendedCategories: string[];
  industryTrends: string[];
}

// DIAS Event Types
export interface StylingEvent {
  type: StylingEventType;
  projectId: string;
  templateId: string;
  userId: string;
  metadata: StylingEventMetadata;
  timestamp: Date;
  correlationId?: string;
  causationId?: string;
}

export type StylingEventType = 
  | 'TEMPLATE_SELECTED'
  | 'TEMPLATE_CUSTOMIZED'  
  | 'TEMPLATE_EXPORTED'
  | 'COMPONENT_STYLED'
  | 'TEMPLATE_PREVIEW_VIEWED'
  | 'STYLE_INCONSISTENCY_DETECTED'
  | 'TEMPLATE_SWITCHED'
  | 'CUSTOMIZATION_REVERTED';

export interface StylingEventMetadata {
  customizations?: TemplateCustomizations;
  customizationType?: string[];
  selectionContext?: 'onboarding' | 'modification' | 'switching';
  previousTemplate?: string;
  exportFormat?: string;
  exportSize?: number;
  componentType?: string;
  styleInheritance?: 'full' | 'partial' | 'custom';
  viewDuration?: number;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  inconsistencyType?: string;
  affectedComponents?: string[];
}

// Template Recommendation System
export interface TemplateRecommendation {
  templateId: string;
  confidence: number;
  reasoning: string[];
  customizationSuggestions: TemplateCustomizations;
  alternativeTemplates: string[];
  metadata: RecommendationMetadata;
}

export interface RecommendationMetadata {
  source: 'user_history' | 'industry_match' | 'brand_analysis' | 'collaborative_filtering';
  dataPoints: string[];
  similarUsers?: string[];
  successRate?: number;
}

export interface TemplateRecommendationRequest {
  userId: string;
  projectContext?: ProjectContext;
  brandGuidelines?: BrandGuidelines;
  preferenceOverrides?: Record<string, any>;
}

export interface ProjectContext {
  industry?: string;
  projectType?: string;
  targetAudience?: string;
  businessGoals?: string[];
  technicalRequirements?: string[];
  designPreferences?: string[];
}

// Component Styling Integration
export interface ComponentStylingRequest {
  projectId: string;
  componentType: string;
  componentProps: Record<string, any>;
  inheritFromTemplate: boolean;
  customizations?: ComponentCustomizations;
}

export interface ComponentCustomizations {
  colors?: Record<string, string>;
  typography?: Record<string, string>;
  spacing?: Record<string, string>;
  borders?: Record<string, string>;
  effects?: Record<string, boolean>;
}

export interface ComponentStylingResponse {
  styling: ComponentStyling;
  cssVariables: Record<string, string>;
  cssClasses: string[];
  recommendations: StyleRecommendation[];
  consistency: StyleConsistencyCheck;
}

export interface ComponentStyling {
  classes: string[];
  inlineStyles: Record<string, string>;
  cssVariables: Record<string, string>;
  animations: string[];
  effects: string[];
}

export interface StyleRecommendation {
  type: 'improvement' | 'consistency' | 'accessibility' | 'performance';
  message: string;
  impact: 'low' | 'medium' | 'high';
  suggestedChange: Record<string, any>;
  reasoning: string;
}

export interface StyleConsistencyCheck {
  isConsistent: boolean;
  inconsistencies: StyleInconsistency[];
  suggestions: StyleSuggestion[];
  overallScore: number;
}

export interface StyleInconsistency {
  type: 'color' | 'typography' | 'spacing' | 'component';
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  affectedElements: string[];
  suggestedFix: string;
}

export interface StyleSuggestion {
  type: 'optimization' | 'consistency' | 'accessibility' | 'branding';
  message: string;
  priority: 'low' | 'medium' | 'high';
  implementation: StyleImplementation;
}

export interface StyleImplementation {
  changes: Record<string, any>;
  cssUpdates: string[];
  componentUpdates: string[];
  estimatedEffort: 'minutes' | 'hours' | 'days';
}

// CSS Export Types
export interface CSSExportRequest {
  projectId: string;
  templateId: string;
  customizations: TemplateCustomizations;
  format: CSSExportFormat;
  options: CSSExportOptions;
}

export type CSSExportFormat = 'css-variables' | 'scss-variables' | 'tailwind-config' | 'js-object';

export interface CSSExportOptions {
  includeComponents: boolean;
  includeAnimations: boolean;
  includeEffects: boolean;
  prefix: string;
  minify: boolean;
  comments: boolean;
}

export interface CSSExportResponse {
  content: string;
  filename: string;
  size: number;
  format: CSSExportFormat;
  metadata: CSSExportMetadata;
}

export interface CSSExportMetadata {
  variables: number;
  components: number;
  animations: number;
  effects: number;
  compatibility: string[];
  dependencies: string[];
}

// Analytics and Insights
export interface StylingAnalytics {
  userId: string;
  projectId?: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: StylingMetrics;
  insights: StylingInsight[];
}

export interface StylingMetrics {
  templatesUsed: number;
  customizationsApplied: number;
  successfulProjects: number;
  averageCustomizationTime: number;
  mostUsedCategories: string[];
  exportCount: number;
}

export interface StylingInsight {
  type: 'trend' | 'recommendation' | 'optimization' | 'success_factor';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggestedActions: string[];
}

// Master DIAS Integration (Phase 2)
export interface MasterDIASIntegration {
  holisticUserProfile: HolisticUserProfile;
  crossStageOptimization: CrossStageOptimization;
  predictiveCapabilities: PredictiveCapabilities;
  continuousLearning: ContinuousLearning;
}

export interface HolisticUserProfile {
  developmentPatterns: DevelopmentPattern[];
  successFactors: SuccessFactor[];
  strugglingAreas: StrugglingArea[];
  predictedNeeds: PredictedNeed[];
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface DevelopmentPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  context: string[];
  outcomes: string[];
}

export interface SuccessFactor {
  factor: string;
  impact: number;
  confidence: number;
  applicableContexts: string[];
}

export interface StrugglingArea {
  area: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  commonCauses: string[];
  suggestedSolutions: string[];
}

export interface PredictedNeed {
  need: string;
  probability: number;
  timeframe: string;
  context: string[];
  preparation: string[];
}

export interface OptimizationOpportunity {
  opportunity: string;
  impact: number;
  effort: number;
  priority: number;
  implementation: string[];
}

export interface CrossStageOptimization {
  currentStage: string;
  futureImpact: FutureImpact[];
  optimizations: StageOptimization[];
  riskAssessment: RiskAssessment;
}

export interface FutureImpact {
  stage: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number;
  description: string;
  mitigation?: string[];
}

export interface StageOptimization {
  stage: string;
  optimization: string;
  benefit: string;
  implementation: string[];
  effort: 'low' | 'medium' | 'high';
}

export interface RiskAssessment {
  overallRisk: number;
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string[];
}

export interface PredictiveCapabilities {
  outcomesPrediction: OutcomePrediction;
  bottleneckDetection: BottleneckDetection;
  resourcePlanning: ResourcePlanning;
}

export interface OutcomePrediction {
  successProbability: number;
  expectedTimeline: string;
  confidenceInterval: number;
  keyFactors: string[];
  alternativeOutcomes: AlternativeOutcome[];
}

export interface AlternativeOutcome {
  outcome: string;
  probability: number;
  conditions: string[];
  actions: string[];
}

export interface BottleneckDetection {
  predictedBottlenecks: PredictedBottleneck[];
  preventionStrategies: string[];
  earlyWarningSignals: string[];
}

export interface PredictedBottleneck {
  stage: string;
  bottleneck: string;
  probability: number;
  impact: string;
  prevention: string[];
}

export interface ResourcePlanning {
  predictedResources: PredictedResource[];
  optimizationOpportunities: string[];
  scalingConsiderations: string[];
}

export interface PredictedResource {
  resource: string;
  amount: number;
  timeframe: string;
  confidence: number;
  alternatives: string[];
}

export interface ContinuousLearning {
  learningModel: LearningModel;
  feedbackLoops: FeedbackLoop[];
  adaptationStrategies: AdaptationStrategy[];
}

export interface LearningModel {
  modelType: string;
  accuracy: number;
  dataPoints: number;
  lastUpdated: Date;
  improvementAreas: string[];
}

export interface FeedbackLoop {
  source: string;
  frequency: string;
  impact: number;
  adaptations: string[];
}

export interface AdaptationStrategy {
  strategy: string;
  triggers: string[];
  actions: string[];
  measuredImpact: number;
}

// Service Interface Contracts
export interface IStylingService {
  getTemplates(userId?: string): Promise<AdvancedThemeTemplate[]>;
  getTemplate(templateId: string): Promise<AdvancedThemeTemplate | null>;
  getRecommendedTemplates(userId: string, projectContext?: ProjectContext): Promise<{
    templates: AdvancedThemeTemplate[];
    reasoning: string[];
    confidence: number;
  }>;
  applyTemplateToProject(projectId: string, templateId: string, userId: string, customizations?: TemplateCustomizations): Promise<ProjectStyling>;
  updateProjectStyling(projectId: string, customizations: TemplateCustomizations, userId: string): Promise<ProjectStyling>;
  getProjectStyling(projectId: string): Promise<ProjectStyling | null>;
  generateProjectCSS(projectId: string, format?: CSSExportFormat): Promise<string>;
  exportProjectTheme(projectId: string, userId: string, format?: CSSExportFormat): Promise<{ content: string; filename: string }>;
  getUserStylingAnalytics(userId: string): Promise<StylingAnalytics>;
  validateComponentStyle(projectId: string, componentType: string, componentStyle: Record<string, any>): Promise<StyleConsistencyCheck>;
}

// Event Handler Contracts
export interface IStylingEventHandler {
  handleTemplateSelected(event: StylingEvent): Promise<void>;
  handleTemplateCustomized(event: StylingEvent): Promise<void>;
  handleTemplateExported(event: StylingEvent): Promise<void>;
  handleComponentStyled(event: StylingEvent): Promise<void>;
  handleStyleInconsistencyDetected(event: StylingEvent): Promise<void>;
}

// AVCA Enhancement Contracts
export interface IAVCAStylingEnhancement {
  enhanceContextWithStyling(projectId: string, userId: string): Promise<AVCAStylingContext>;
  generateComponentWithStyling(request: ComponentStylingRequest): Promise<ComponentStylingResponse>;
  validateStyleConsistency(projectId: string, componentType: string, componentStyle: Record<string, any>): Promise<StyleConsistencyCheck>;
  suggestStyleOptimizations(projectId: string, componentType: string): Promise<StyleRecommendation[]>;
}

// Master DIAS Contracts (Phase 2)
export interface IMasterDIASStylingIntegration {
  analyzeUserStylingJourney(userId: string): Promise<HolisticUserProfile>;
  optimizeStylingPipeline(userId: string, currentStage: string): Promise<CrossStageOptimization>;
  predictStylingOutcomes(projectContext: ProjectContext, stylingDecisions: ProjectStyling): Promise<OutcomePrediction>;
  provideContinuousStyleOptimization(userId: string): Promise<OptimizationOpportunity[]>;
}