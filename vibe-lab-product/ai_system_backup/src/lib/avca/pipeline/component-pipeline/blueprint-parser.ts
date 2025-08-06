/**
 * Blueprint Parser - Stage 1 of Component Pipeline
 * 
 * Parses and analyzes blueprint structures
 */

import { BaseService } from '../../services/base-service';
import { EventBus } from '../../services/event-bus';
import { EventFactory, EventCategory, PipelineEventType } from '../../../dias/events/event-types';
import {
  ComponentBlueprint,
  ComponentType,
  ComponentCategory,
  Priority,
  Complexity,
  FunctionalRequirement,
  TechnicalRequirement,
  DesignRequirement,
  InternalDependency,
  ExternalDependency,
  FileStructure,
  ExportDefinition,
  ImportRequirement,
  ValidationRule,
  Constraint,
  // NEW: Component detection types
  ComponentDetectionData,
  UIPattern,
  ComponentRequirement,
  TemplateRecommendation,
  ComponentMatch,
  ComponentCustomization
} from './types';

export interface ParserConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
}

export class BlueprintParser extends BaseService {
  private eventBus?: EventBus;

  constructor(config: ParserConfig = {}) {
    super({
      name: config.name || 'blueprint-parser',
      version: config.version || '1.0.0',
      dependencies: []
    });
    this.eventBus = config.eventBus;
  }

  protected async initialize(): Promise<void> {
    this.log('info', 'Blueprint parser initialized');
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'Blueprint parser cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Main processing method - parses raw blueprint into structured format
   */
  async process(rawBlueprint: any): Promise<ComponentBlueprint> {
    const startTime = Date.now();
    
    try {
      // Emit start event
      await this.emitPipelineEvent(PipelineEventType.STAGE_STARTED, rawBlueprint.id || 'unknown', {
        stage: 'blueprint-parsing'
      });

      // Parse the blueprint
      const blueprint = await this.parseBlueprint(rawBlueprint);

      // Emit completion event
      const duration = Date.now() - startTime;
      await this.emitPipelineEvent(PipelineEventType.STAGE_COMPLETED, blueprint.id, {
        stage: 'blueprint-parsing',
        duration,
        complexity: blueprint.metadata.complexity
      });

      this.log('info', `Blueprint parsed in ${duration}ms`);
      return blueprint;

    } catch (error) {
      await this.emitPipelineEvent(PipelineEventType.STAGE_FAILED, rawBlueprint.id || 'unknown', {
        stage: 'blueprint-parsing',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Parse blueprint into structured format
   */
  private async parseBlueprint(raw: any): Promise<ComponentBlueprint> {
    // Extract basic info
    const id = raw.id || `comp_${Date.now()}`;
    const name = this.extractName(raw);
    const description = raw.description || raw.projectContext?.description || '';
    const type = this.determineType(raw);
    const category = this.determineCategory(raw, type);

    // Parse requirements
    const functionalRequirements = this.parseFunctionalRequirements(raw);
    const technicalRequirements = this.parseTechnicalRequirements(raw);
    const designRequirements = this.parseDesignRequirements(raw);

    // Extract dependencies
    const internalDependencies = this.extractInternalDependencies(raw);
    const externalDependencies = this.extractExternalDependencies(raw);

    // Determine structure
    const files = this.determineFileStructure(name, type);
    const exports = this.determineExports(name, type);
    const imports = this.determineImports(type);

    // Extract validation
    const validationRules = this.extractValidationRules(raw);
    const constraints = this.extractConstraints(raw);

    // Calculate metadata
    const complexity = this.calculateComplexity(
      { functional: functionalRequirements, technical: technicalRequirements, design: designRequirements },
      { internal: internalDependencies, external: externalDependencies, peer: [] }
    );
    const priority = this.determinePriority(
      { functional: functionalRequirements, technical: technicalRequirements, design: designRequirements },
      category
    );
    const estimatedTime = this.estimateTime(complexity, type);
    const tags = this.extractTags(raw, type);

    // NEW: Component detection and analysis
    const componentDetection = await this.detectComponentRequirements(raw, {
      functional: functionalRequirements,
      technical: technicalRequirements,
      design: designRequirements
    });

    return {
      id,
      name,
      description,
      type,
      category,
      requirements: {
        functional: functionalRequirements,
        technical: technicalRequirements,
        design: designRequirements
      },
      dependencies: {
        internal: internalDependencies,
        external: externalDependencies,
        peer: []
      },
      structure: {
        files,
        exports,
        imports
      },
      validation: {
        rules: validationRules,
        constraints
      },
      metadata: {
        priority,
        complexity,
        estimatedTime,
        tags
      },
      componentDetection
    };
  }

  /**
   * NEW: Detect component requirements from blueprint
   */
  private async detectComponentRequirements(
    raw: any,
    requirements: ComponentBlueprint['requirements']
  ): Promise<ComponentDetectionData> {
    const startTime = Date.now();
    
    try {
      // Detect UI patterns
      const detectedPatterns = this.detectUIPatterns(raw, requirements);
      
      // Extract component requirements
      const componentRequirements = this.extractComponentRequirements(raw, requirements);
      
      // Generate template recommendations
      const templateRecommendations = this.generateTemplateRecommendations(detectedPatterns, componentRequirements);
      
      // Calculate overall confidence
      const confidence = this.calculateDetectionConfidence(detectedPatterns, componentRequirements);
      
      // Generate reasoning
      const reasoning = this.generateDetectionReasoning(detectedPatterns, componentRequirements);
      
      const duration = Date.now() - startTime;
      this.log('info', `Component detection completed in ${duration}ms with ${confidence}% confidence`);
      
      return {
        detectedPatterns,
        componentRequirements,
        templateRecommendations,
        confidence,
        reasoning
      };
      
    } catch (error) {
      this.log('error', `Component detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Return fallback detection data
      return {
        detectedPatterns: [],
        componentRequirements: [],
        templateRecommendations: [],
        confidence: 0,
        reasoning: ['Component detection failed, using fallback']
      };
    }
  }

  /**
   * Detect UI patterns from blueprint text and requirements
   * Enhanced with advanced NLP-like pattern recognition
   */
  private detectUIPatterns(raw: any, requirements: ComponentBlueprint['requirements']): UIPattern[] {
    const patterns: UIPattern[] = [];
    const text = this.extractBlueprintText(raw);
    
    // Enhanced pattern detection with semantic analysis and context awareness
    const patternRules = {
      dashboard: {
        keywords: ['dashboard', 'admin', 'control panel', 'metrics', 'analytics', 'charts', 'graphs', 'kpi', 'performance', 'monitoring', 'reporting', 'insights', 'visualization'],
        context: ['management', 'overview', 'summary', 'statistics', 'business intelligence', 'data visualization'],
        semanticPhrases: ['data visualization', 'business metrics', 'performance monitoring', 'admin interface', 'control dashboard'],
        negativeKeywords: ['simple', 'basic', 'minimal'],
        confidence: 0.9
      },
      ecommerce: {
        keywords: ['shop', 'store', 'product', 'cart', 'checkout', 'payment', 'inventory', 'catalog', 'shopping', 'buy', 'purchase', 'order', 'customer', 'retail'],
        context: ['retail', 'commerce', 'marketplace', 'storefront', 'online shop', 'e-commerce'],
        semanticPhrases: ['online store', 'shopping cart', 'product catalog', 'checkout process', 'payment gateway'],
        negativeKeywords: ['blog', 'article', 'content'],
        confidence: 0.85
      },
      blog: {
        keywords: ['blog', 'article', 'post', 'content', 'editor', 'publish', 'author', 'writing', 'news', 'journal'],
        context: ['content management', 'publishing', 'editorial'],
        confidence: 0.8
      },
      landing: {
        keywords: ['landing', 'hero', 'cta', 'conversion', 'marketing', 'signup', 'lead', 'funnel', 'sales'],
        context: ['marketing', 'conversion', 'lead generation'],
        confidence: 0.85
      },
      auth: {
        keywords: ['login', 'register', 'signup', 'authentication', 'password', 'user', 'account', 'profile', 'security'],
        context: ['user management', 'access control', 'identity'],
        confidence: 0.9
      },
      form: {
        keywords: ['form', 'input', 'validation', 'submit', 'field', 'survey', 'questionnaire', 'data entry'],
        context: ['data collection', 'user input', 'submission'],
        confidence: 0.8
      },
      navigation: {
        keywords: ['nav', 'menu', 'header', 'footer', 'breadcrumb', 'sidebar', 'navigation', 'menu bar'],
        context: ['site structure', 'navigation', 'layout'],
        confidence: 0.75
      },
      table: {
        keywords: ['table', 'grid', 'list', 'data', 'rows', 'columns', 'sort', 'filter', 'spreadsheet'],
        context: ['data display', 'tabular', 'information'],
        confidence: 0.8
      },
      modal: {
        keywords: ['modal', 'dialog', 'popup', 'overlay', 'lightbox', 'window', 'alert', 'notification'],
        context: ['interaction', 'overlay', 'focus'],
        confidence: 0.7
      },
      card: {
        keywords: ['card', 'tile', 'widget', 'panel', 'container', 'box', 'item'],
        context: ['content display', 'modular', 'component'],
        confidence: 0.7
      },
      profile: {
        keywords: ['profile', 'user', 'account', 'settings', 'preferences', 'personal', 'dashboard'],
        context: ['user management', 'personalization'],
        confidence: 0.85
      },
      chat: {
        keywords: ['chat', 'message', 'conversation', 'messaging', 'communication', 'support', 'help'],
        context: ['communication', 'interaction', 'real-time'],
        confidence: 0.8
      },
      calendar: {
        keywords: ['calendar', 'schedule', 'booking', 'appointment', 'event', 'date', 'time'],
        context: ['scheduling', 'time management', 'events'],
        confidence: 0.8
      },
      gallery: {
        keywords: ['gallery', 'image', 'photo', 'media', 'portfolio', 'showcase', 'display'],
        context: ['media display', 'visual content', 'showcase'],
        confidence: 0.75
      },
      search: {
        keywords: ['search', 'find', 'filter', 'query', 'lookup', 'discover', 'explore'],
        context: ['information retrieval', 'discovery', 'exploration'],
        confidence: 0.8
      },
      settings: {
        keywords: ['settings', 'configuration', 'preferences', 'options', 'setup', 'admin', 'control'],
        context: ['configuration', 'administration', 'control'],
        confidence: 0.85
      }
    };

    // Enhanced pattern analysis with context awareness
    for (const [patternType, rule] of Object.entries(patternRules)) {
      const matches = this.analyzePatternMatch(text, rule.keywords, rule.context);
      
      if (matches.score > 0.3) { // Minimum threshold for pattern detection
        const confidence = Math.min(100, matches.score * rule.confidence * 100);
        
        patterns.push({
          type: patternType as UIPattern['type'],
          confidence,
          keywords: matches.matchedKeywords,
          description: this.generatePatternDescription(patternType, matches.score, matches.matchedKeywords)
        });
      }
    }

    // Analyze functional requirements for additional patterns
    for (const req of requirements.functional) {
      const reqText = req.description.toLowerCase();
      const reqAnalysis = this.analyzeRequirementPattern(reqText);
      
      if (reqAnalysis.patterns.length > 0) {
        patterns.push(...reqAnalysis.patterns);
      }
    }

    // Remove duplicates and sort by confidence
    const uniquePatterns = this.deduplicatePatterns(patterns);
    return uniquePatterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Enhanced pattern matching with context awareness
   */
  private analyzePatternMatch(text: string, keywords: string[], context: string[]): {
    score: number;
    matchedKeywords: string[];
  } {
    const textLower = text.toLowerCase();
    let score = 0;
    const matchedKeywords: string[] = [];

    // Keyword matching with weighted scoring
    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        score += 0.4; // Base keyword score
        matchedKeywords.push(keyword);
        
        // Bonus for exact matches
        if (textLower.includes(` ${keyword} `) || textLower.startsWith(keyword) || textLower.endsWith(keyword)) {
          score += 0.2;
        }
      }
    }

    // Context matching for higher confidence
    for (const ctx of context) {
      if (textLower.includes(ctx.toLowerCase())) {
        score += 0.3; // Context bonus
      }
    }

    // Frequency bonus
    const keywordFrequency = matchedKeywords.length / keywords.length;
    score += keywordFrequency * 0.2;

    return { score, matchedKeywords };
  }

  /**
   * Analyze functional requirements for pattern detection
   */
  private analyzeRequirementPattern(reqText: string): {
    patterns: UIPattern[];
  } {
    const patterns: UIPattern[] = [];
    
    // Requirement-specific pattern detection
    const requirementPatterns = {
      'user profile': {
        type: 'profile' as UIPattern['type'],
        confidence: 85,
        keywords: ['user', 'profile'],
        description: 'User profile management functionality detected'
      },
      'chat messaging': {
        type: 'chat' as UIPattern['type'],
        confidence: 90,
        keywords: ['chat', 'message'],
        description: 'Chat/messaging functionality detected'
      },
      'calendar scheduling': {
        type: 'calendar' as UIPattern['type'],
        confidence: 85,
        keywords: ['calendar', 'schedule'],
        description: 'Calendar and scheduling functionality detected'
      },
      'image gallery': {
        type: 'gallery' as UIPattern['type'],
        confidence: 80,
        keywords: ['gallery', 'image', 'photo'],
        description: 'Image gallery functionality detected'
      },
      'search functionality': {
        type: 'search' as UIPattern['type'],
        confidence: 85,
        keywords: ['search', 'find', 'filter'],
        description: 'Search functionality detected'
      },
      'settings configuration': {
        type: 'settings' as UIPattern['type'],
        confidence: 90,
        keywords: ['settings', 'configuration', 'preferences'],
        description: 'Settings and configuration functionality detected'
      }
    };

    for (const [pattern, config] of Object.entries(requirementPatterns)) {
      if (reqText.includes(pattern) || config.keywords.some(k => reqText.includes(k))) {
        patterns.push({
          type: config.type,
          confidence: config.confidence,
          keywords: config.keywords,
          description: config.description
        });
      }
    }

    return { patterns };
  }

  /**
   * Generate descriptive pattern analysis
   */
  private generatePatternDescription(patternType: string, score: number, keywords: string[]): string {
    const confidence = Math.round(score * 100);
    const keywordList = keywords.slice(0, 3).join(', ');
    
    return `Detected ${patternType} pattern with ${confidence}% confidence based on keywords: ${keywordList}`;
  }

  /**
   * Remove duplicate patterns and merge confidence scores
   */
  private deduplicatePatterns(patterns: UIPattern[]): UIPattern[] {
    const patternMap = new Map<string, UIPattern>();
    
    for (const pattern of patterns) {
      const existing = patternMap.get(pattern.type);
      
      if (existing) {
        // Merge patterns and take highest confidence
        existing.confidence = Math.max(existing.confidence, pattern.confidence);
        existing.keywords = [...new Set([...existing.keywords, ...pattern.keywords])];
        existing.description = `${existing.description}; ${pattern.description}`;
      } else {
        patternMap.set(pattern.type, pattern);
      }
    }
    
    return Array.from(patternMap.values());
  }

  /**
   * Extract component requirements from blueprint
   */
  private extractComponentRequirements(
    raw: any,
    requirements: ComponentBlueprint['requirements']
  ): ComponentRequirement[] {
    const componentReqs: ComponentRequirement[] = [];
    
    // Enhanced component requirement mapping
    const requirementMapping = {
      navigation: {
        patterns: ['navigation', 'header', 'footer', 'sidebar', 'menu', 'breadcrumb'],
        components: ['navigation-header', 'sidebar-menu', 'breadcrumb', 'pagination'],
        category: 'navigation' as ComponentRequirement['category'],
        constraints: ['responsive', 'accessible', 'mobile-friendly']
      },
      form: {
        patterns: ['form', 'input', 'validation', 'submit', 'field', 'survey', 'questionnaire'],
        components: ['input-field', 'form-group', 'submit-button', 'validation-message', 'form-wizard'],
        category: 'form' as ComponentRequirement['category'],
        constraints: ['validation', 'accessible', 'responsive']
      },
      display: {
        patterns: ['table', 'grid', 'list', 'data', 'chart', 'graph', 'card', 'gallery'],
        components: ['data-table', 'card-grid', 'list-view', 'chart-component', 'image-gallery'],
        category: 'display' as ComponentRequirement['category'],
        constraints: ['sortable', 'filterable', 'responsive']
      },
      interaction: {
        patterns: ['button', 'link', 'click', 'action', 'cta', 'modal', 'dialog'],
        components: ['button-primary', 'button-secondary', 'link-button', 'modal-dialog', 'tooltip'],
        category: 'interaction' as ComponentRequirement['category'],
        constraints: ['accessible', 'responsive', 'hover-effects']
      },
      layout: {
        patterns: ['layout', 'container', 'section', 'grid', 'flex', 'responsive'],
        components: ['container', 'grid-layout', 'flex-layout', 'responsive-wrapper'],
        category: 'layout' as ComponentRequirement['category'],
        constraints: ['responsive', 'flexible', 'mobile-first']
      },
      content: {
        patterns: ['text', 'content', 'article', 'blog', 'editor', 'rich-text'],
        components: ['text-block', 'content-editor', 'article-card', 'rich-text-editor'],
        category: 'content' as ComponentRequirement['category'],
        constraints: ['readable', 'accessible', 'seo-friendly']
      },
      feedback: {
        patterns: ['notification', 'alert', 'message', 'toast', 'status', 'progress'],
        components: ['notification-toast', 'alert-banner', 'progress-bar', 'status-indicator'],
        category: 'feedback' as ComponentRequirement['category'],
        constraints: ['accessible', 'dismissible', 'auto-hide']
      },
      data: {
        patterns: ['api', 'fetch', 'data', 'state', 'cache', 'storage'],
        components: ['data-provider', 'api-client', 'state-manager', 'cache-service'],
        category: 'data' as ComponentRequirement['category'],
        constraints: ['performant', 'cached', 'error-handled']
      }
    };

    // Analyze functional requirements for component needs
    for (const req of requirements.functional) {
      const reqText = req.description.toLowerCase();
      const reqAnalysis = this.analyzeComponentRequirement(reqText, requirementMapping);
      
      if (reqAnalysis.components.length > 0) {
        componentReqs.push({
          category: reqAnalysis.category,
          type: reqAnalysis.type,
          priority: req.priority,
          description: req.description,
          constraints: reqAnalysis.constraints,
          alternatives: reqAnalysis.alternatives
        });
      }
    }

    // Analyze design requirements for component styling needs
    for (const req of requirements.design) {
      if (req.pattern === 'atomic' || req.pattern === 'compound') {
        componentReqs.push({
          category: 'content',
          type: 'atomic-component',
          priority: Priority.MEDIUM,
          description: `Atomic design component with ${req.styling} styling`,
          constraints: ['reusable', 'consistent', 'themeable']
        });
      }
    }

    // Analyze technical requirements for component constraints
    for (const req of requirements.technical) {
      if (req.category === 'ACCESSIBILITY') {
        componentReqs.forEach(cr => {
          if (!cr.constraints?.includes('accessible')) {
            cr.constraints = [...(cr.constraints || []), 'accessible'];
          }
        });
      }
      
      if (req.category === 'PERFORMANCE') {
        componentReqs.forEach(cr => {
          if (!cr.constraints?.includes('performant')) {
            cr.constraints = [...(cr.constraints || []), 'performant'];
          }
        });
      }
    }
    
    return componentReqs;
  }

  /**
   * Analyze component requirement with enhanced pattern matching
   */
  private analyzeComponentRequirement(reqText: string, mapping: Record<string, {
    patterns: string[];
    components: string[];
    category: ComponentRequirement['category'];
    constraints: string[];
  }>): {
    category: ComponentRequirement['category'];
    type: string;
    components: string[];
    constraints: string[];
    alternatives: string[];
  } {
    let bestMatch: {
      category: ComponentRequirement['category'];
      type: string;
      components: string[];
      constraints: string[];
      alternatives: string[];
    } = {
      category: 'content',
      type: 'generic',
      components: [],
      constraints: [],
      alternatives: []
    };

    let highestScore = 0;

    for (const [category, config] of Object.entries(mapping)) {
      const score = this.calculateRequirementMatch(reqText, config.patterns);
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          category: config.category,
          type: category,
          components: config.components,
          constraints: config.constraints,
          alternatives: this.generateAlternatives(config.components)
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate requirement match score
   */
  private calculateRequirementMatch(reqText: string, patterns: string[]): number {
    let score = 0;
    
    for (const pattern of patterns) {
      if (reqText.includes(pattern)) {
        score += 1;
        
        // Bonus for exact matches
        if (reqText.includes(` ${pattern} `) || reqText.startsWith(pattern) || reqText.endsWith(pattern)) {
          score += 0.5;
        }
      }
    }
    
    return score / patterns.length;
  }

  /**
   * Generate alternative components
   */
  private generateAlternatives(components: string[]): string[] {
    // Generate alternatives based on component type
    const alternatives: string[] = [];
    
    for (const component of components) {
      if (component.includes('button')) {
        alternatives.push('link-button', 'icon-button', 'toggle-button');
      } else if (component.includes('form')) {
        alternatives.push('form-wizard', 'multi-step-form', 'inline-form');
      } else if (component.includes('table')) {
        alternatives.push('data-grid', 'virtual-table', 'editable-table');
      } else if (component.includes('card')) {
        alternatives.push('info-card', 'product-card', 'feature-card');
      }
    }
    
    return [...new Set(alternatives)];
  }

  /**
   * Generate template recommendations based on detected patterns
   */
  private generateTemplateRecommendations(
    patterns: UIPattern[],
    componentReqs: ComponentRequirement[]
  ): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = [];
    
    // Template matching logic based on patterns
    const templateMatches: Record<string, string[]> = {
      dashboard: ['linear', 'apple', 'corporate'],
      ecommerce: ['spotify', 'ecommerce', 'startup'],
      blog: ['editorial', 'minimal', 'creative'],
      landing: ['brutalist', 'startup', 'creative'],
      auth: ['minimal', 'corporate', 'linear'],
      form: ['linear', 'corporate', 'minimal'],
      navigation: ['apple', 'linear', 'corporate'],
      table: ['corporate', 'linear', 'startup'],
      modal: ['minimal', 'linear', 'apple'],
      card: ['spotify', 'creative', 'startup'],
      profile: ['linear', 'apple', 'corporate'],
      chat: ['spotify', 'creative', 'startup'],
      calendar: ['linear', 'corporate', 'apple'],
      gallery: ['creative', 'minimal', 'editorial'],
      search: ['linear', 'apple', 'corporate'],
      settings: ['corporate', 'linear', 'apple']
    };
    
    // Generate recommendations based on detected patterns
    for (const pattern of patterns) {
      const matchingTemplates = templateMatches[pattern.type] || ['linear'];
      
      for (const templateId of matchingTemplates) {
        const existingRec = recommendations.find(r => r.templateId === templateId);
        
        if (existingRec) {
          existingRec.confidence = Math.max(existingRec.confidence, pattern.confidence);
          existingRec.reasoning.push(`Pattern "${pattern.type}" detected with ${pattern.confidence}% confidence`);
        } else {
          recommendations.push({
            templateId,
            name: this.getTemplateName(templateId),
            confidence: pattern.confidence,
            reasoning: [`Pattern "${pattern.type}" detected with ${pattern.confidence}% confidence`],
            componentMatches: this.generateComponentMatches(componentReqs, templateId)
          });
        }
      }
    }
    
    // Sort by confidence
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate component matches for a template
   */
  private generateComponentMatches(
    componentReqs: ComponentRequirement[],
    templateId: string
  ): ComponentMatch[] {
    const matches: ComponentMatch[] = [];
    
    for (const req of componentReqs) {
      matches.push({
        componentId: `${templateId}-${req.category}-${req.type}`,
        name: `${req.type} Component`,
        category: req.category,
        confidence: 75, // Base confidence
        reasoning: [`Matches ${req.category} requirement: ${req.description}`],
        customization: this.generateCustomization(req, templateId)
      });
    }
    
    return matches;
  }

  /**
   * Generate customization options for a component
   */
  private generateCustomization(req: ComponentRequirement, templateId: string): ComponentCustomization {
    return {
      styling: {
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#10B981'
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: '1rem',
          fontWeight: '400'
        },
        spacing: {
          padding: '1rem',
          margin: '0.5rem',
          gap: '0.5rem'
        },
        animation: {
          duration: '200ms',
          easing: 'ease-in-out',
          intensity: 'subtle'
        }
      },
      behavior: {
        interactions: ['hover', 'focus', 'click'],
        states: ['default', 'hover', 'active', 'disabled'],
        events: ['onClick', 'onChange', 'onSubmit']
      },
      content: {
        text: req.description,
        icons: [],
        data: {}
      }
    };
  }

  /**
   * Calculate overall detection confidence
   */
  private calculateDetectionConfidence(
    patterns: UIPattern[],
    componentReqs: ComponentRequirement[]
  ): number {
    if (patterns.length === 0 && componentReqs.length === 0) {
      return 0;
    }
    
    const patternConfidence = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
      : 0;
    
    const reqConfidence = componentReqs.length > 0 ? 80 : 0; // Base confidence for requirements
    
    return Math.round((patternConfidence + reqConfidence) / 2);
  }

  /**
   * Generate reasoning for component detection
   */
  private generateDetectionReasoning(
    patterns: UIPattern[],
    componentReqs: ComponentRequirement[]
  ): string[] {
    const reasoning: string[] = [];
    
    if (patterns.length > 0) {
      reasoning.push(`Detected ${patterns.length} UI pattern(s): ${patterns.map(p => p.type).join(', ')}`);
    }
    
    if (componentReqs.length > 0) {
      reasoning.push(`Identified ${componentReqs.length} component requirement(s): ${componentReqs.map(r => r.type).join(', ')}`);
    }
    
    if (reasoning.length === 0) {
      reasoning.push('Limited component requirements detected in blueprint');
    }
    
    return reasoning;
  }

  /**
   * Extract blueprint text for analysis
   */
  private extractBlueprintText(raw: any): string {
    const textParts: string[] = [];
    
    if (raw.description) textParts.push(raw.description);
    if (raw.projectContext?.description) textParts.push(raw.projectContext.description);
    if (raw.requirements) textParts.push(JSON.stringify(raw.requirements));
    if (raw.functionalRequirements) textParts.push(JSON.stringify(raw.functionalRequirements));
    if (raw.technicalRequirements) textParts.push(JSON.stringify(raw.technicalRequirements));
    if (raw.designRequirements) textParts.push(JSON.stringify(raw.designRequirements));
    
    return textParts.join(' ').toLowerCase();
  }

  /**
   * Get template name by ID
   */
  private getTemplateName(templateId: string): string {
    const templateNames: Record<string, string> = {
      linear: 'Linear',
      apple: 'Apple',
      spotify: 'Spotify',
      mailchimp: 'Mailchimp',
      brutalist: 'Brutalist',
      corporate: 'Corporate',
      ecommerce: 'E-commerce',
      startup: 'Startup',
      editorial: 'Editorial',
      gaming: 'Gaming',
      minimal: 'Minimal',
      creative: 'Creative',
      bold: 'Bold',
      elegant: 'Elegant'
    };
    
    return templateNames[templateId] || templateId;
  }

  private extractName(raw: any): string {
    if (raw.name) return raw.name;
    if (raw.projectContext?.name) return raw.projectContext.name;
    
    // Generate from description
    const desc = raw.description || '';
    const words = desc.split(' ').slice(0, 3);
    return words.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }

  private determineType(raw: any): ComponentType {
    const desc = (raw.description || '').toLowerCase();
    const name = (raw.name || '').toLowerCase();
    
    // Check name first for more specific matches
    if (name.includes('service') || desc.includes('service')) return ComponentType.SERVICE;
    if (name.includes('hook') || name.startsWith('use') || desc.includes('hook')) return ComponentType.HOOK;
    if (desc.includes('api')) return ComponentType.SERVICE;
    if (desc.includes('page')) return ComponentType.PAGE;
    if (desc.includes('layout')) return ComponentType.LAYOUT;
    if (desc.includes('utility') || desc.includes('helper')) return ComponentType.UTILITY;
    if (desc.includes('route') || desc.includes('endpoint')) return ComponentType.API_ROUTE;
    
    return ComponentType.UI_COMPONENT;
  }

  private determineCategory(raw: any, type: ComponentType): ComponentCategory {
    if (type === ComponentType.SERVICE || type === ComponentType.HOOK) {
      return ComponentCategory.CORE;
    }
    if (raw.shared || raw.reusable) {
      return ComponentCategory.SHARED;
    }
    return ComponentCategory.FEATURE;
  }

  private parseFunctionalRequirements(raw: any): FunctionalRequirement[] {
    const reqs: FunctionalRequirement[] = [];
    
    if (raw.functionalRequirements && Array.isArray(raw.functionalRequirements)) {
      raw.functionalRequirements.forEach((req: string, index: number) => {
        reqs.push({
          id: `func_${index + 1}`,
          description: req,
          acceptanceCriteria: this.generateAcceptanceCriteria(req),
          priority: this.inferPriority(req)
        });
      });
    }

    // Also check for components list
    if (raw.components && Array.isArray(raw.components)) {
      raw.components.forEach((comp: string, index: number) => {
        reqs.push({
          id: `comp_${index + 1}`,
          description: `Include ${comp}`,
          acceptanceCriteria: [`${comp} is implemented and functional`],
          priority: Priority.HIGH
        });
      });
    }

    return reqs;
  }

  private parseTechnicalRequirements(raw: any): TechnicalRequirement[] {
    const reqs: TechnicalRequirement[] = [];
    
    if (raw.technicalRequirements) {
      const tech = raw.technicalRequirements;
      
      if (tech.framework) {
        reqs.push({
          id: 'tech_framework',
          category: 'COMPATIBILITY',
          specification: `Compatible with ${tech.framework}`,
          mandatory: true
        });
      }

      if (tech.testing) {
        reqs.push({
          id: 'tech_testing',
          category: 'COMPATIBILITY',
          specification: tech.testing,
          mandatory: true
        });
      }
      
      // Add performance requirements from technicalRequirements
      if (tech.performance) {
        reqs.push({
          id: 'tech_performance',
          category: 'PERFORMANCE',
          specification: tech.performance,
          mandatory: true
        });
      }
    }

    if (raw.performanceTargets) {
      Object.entries(raw.performanceTargets).forEach(([key, value], index) => {
        reqs.push({
          id: `perf_${index + 1}`,
          category: 'PERFORMANCE',
          specification: `${key}: ${value}`,
          threshold: value as string,
          mandatory: true
        });
      });
    }

    return reqs;
  }

  private parseDesignRequirements(raw: any): DesignRequirement[] {
    const reqs: DesignRequirement[] = [];
    
    if (raw.architecturalGuidelines || raw.technicalRequirements?.styling) {
      reqs.push({
        id: 'design_main',
        pattern: raw.architecturalGuidelines?.componentStructure || 'atomic',
        styling: 'tailwind',
        responsive: true,
        theme: true
      });
    }

    return reqs;
  }

  private extractInternalDependencies(raw: any): InternalDependency[] {
    const deps: InternalDependency[] = [];
    
    if (raw.components && Array.isArray(raw.components)) {
      raw.components.forEach((comp: string) => {
        if (comp.includes('-component')) {
          deps.push({
            componentId: comp,
            type: 'COMPOSE',
            required: true
          });
        }
      });
    }

    return deps;
  }

  private extractExternalDependencies(raw: any): ExternalDependency[] {
    const deps: ExternalDependency[] = [
      { package: 'react', version: '^18.0.0', type: 'PEER' }
    ];

    const framework = raw.technicalRequirements?.framework;
    if (framework && framework.toLowerCase().includes('next')) {
      deps.push({ package: 'next', version: '^14.0.0', type: 'PEER' });
    }

    return deps;
  }

  private determineFileStructure(name: string, type: ComponentType): FileStructure[] {
    const files: FileStructure[] = [
      { path: `${name}.tsx`, type: 'COMPONENT' },
      { path: `__tests__/${name}.test.tsx`, type: 'TEST' }
    ];

    if (type === ComponentType.UI_COMPONENT) {
      files.push({ path: `${name}.stories.tsx`, type: 'STORY' });
    }

    if (type === ComponentType.SERVICE || type === ComponentType.HOOK) {
      files.push({ path: `${name}.types.ts`, type: 'TYPE' });
    }

    return files;
  }

  private determineExports(name: string, type: ComponentType): ExportDefinition[] {
    return [
      { name, type: 'DEFAULT', description: `Main ${type.toLowerCase()} export` }
    ];
  }

  private determineImports(type: ComponentType): ImportRequirement[] {
    const imports: ImportRequirement[] = [];

    if (type !== ComponentType.UTILITY && type !== ComponentType.API_ROUTE) {
      imports.push({
        source: 'react',
        imports: ['React'],
        type: 'PACKAGE'
      });
    }

    return imports;
  }

  private extractValidationRules(raw: any): ValidationRule[] {
    const rules: ValidationRule[] = [];

    if (raw.securityRequirements) {
      Object.entries(raw.securityRequirements).forEach(([key, value]) => {
        if (value === 'required' || value === true) {
          rules.push({
            property: key,
            rule: 'required',
            errorMessage: `${key} is required for security`
          });
        }
      });
    }

    return rules;
  }

  private extractConstraints(raw: any): Constraint[] {
    const constraints: Constraint[] = [];

    if (raw.performanceTargets) {
      Object.entries(raw.performanceTargets).forEach(([key, value]) => {
        constraints.push({
          type: 'PERFORMANCE',
          limit: value as string,
          metric: key
        });
      });
    }

    return constraints;
  }

  private calculateComplexity(
    requirements: ComponentBlueprint['requirements'],
    dependencies: ComponentBlueprint['dependencies']
  ): Complexity {
    const reqCount = 
      requirements.functional.length + 
      requirements.technical.length + 
      requirements.design.length;
    
    const depCount = 
      dependencies.internal.length + 
      dependencies.external.length;
    
    // Check for complexity indicators in functional requirements
    let complexityBonus = 0;
    const complexKeywords = ['filter', 'sort', 'paginate', 'search', 'grid', 'multiple', 'complex'];
    requirements.functional.forEach(req => {
      const desc = req.description.toLowerCase();
      if (complexKeywords.some(keyword => desc.includes(keyword))) {
        complexityBonus += 1;
      }
    });
    
    const score = reqCount + (depCount * 0.5) + complexityBonus;
    
    if (score < 3) return Complexity.SIMPLE;
    if (score < 6) return Complexity.MODERATE;
    if (score < 10) return Complexity.COMPLEX;
    return Complexity.VERY_COMPLEX;
  }

  private determinePriority(
    requirements: ComponentBlueprint['requirements'],
    category: ComponentCategory
  ): Priority {
    if (category === ComponentCategory.CORE) return Priority.CRITICAL;
    
    const hasCritical = requirements.functional.some(r => r.priority === Priority.CRITICAL);
    if (hasCritical) return Priority.CRITICAL;
    
    const hasHigh = requirements.functional.some(r => r.priority === Priority.HIGH);
    if (hasHigh) return Priority.HIGH;
    
    return Priority.MEDIUM;
  }

  private estimateTime(complexity: Complexity, type: ComponentType): number {
    const baseTime = {
      [Complexity.SIMPLE]: 30,
      [Complexity.MODERATE]: 60,
      [Complexity.COMPLEX]: 120,
      [Complexity.VERY_COMPLEX]: 240
    };
    
    const typeMultiplier = {
      [ComponentType.UI_COMPONENT]: 1.0,
      [ComponentType.SERVICE]: 1.2,
      [ComponentType.HOOK]: 0.8,
      [ComponentType.UTILITY]: 0.6,
      [ComponentType.LAYOUT]: 1.1,
      [ComponentType.PAGE]: 1.5,
      [ComponentType.API_ROUTE]: 0.9
    };
    
    return Math.round(baseTime[complexity] * typeMultiplier[type]);
  }

  private extractTags(raw: any, type: ComponentType): string[] {
    const tags = [type.toLowerCase().replace('_', '-')];
    
    if (raw.technicalRequirements?.testing) {
      tags.push('tested');
    }
    
    if (raw.designRequirements || raw.architecturalGuidelines) {
      tags.push('designed');
    }
    
    return tags;
  }

  private generateAcceptanceCriteria(requirement: string): string[] {
    const criteria: string[] = [];
    const req = requirement.toLowerCase();
    
    if (req.includes('display') || req.includes('show')) {
      criteria.push('Component renders without errors');
      criteria.push('Data is displayed correctly');
    }
    
    if (req.includes('click') || req.includes('interact')) {
      criteria.push('User interactions are handled properly');
      criteria.push('Appropriate feedback is provided');
    }
    
    if (req.includes('form') || req.includes('input')) {
      criteria.push('Form validation works correctly');
      criteria.push('Error messages are displayed appropriately');
    }
    
    if (criteria.length === 0) {
      criteria.push('Requirement is fully implemented');
    }
    
    return criteria;
  }

  private inferPriority(requirement: string): Priority {
    const req = requirement.toLowerCase();
    
    if (req.includes('must') || req.includes('critical') || req.includes('required')) {
      return Priority.CRITICAL;
    }
    if (req.includes('should') || req.includes('important')) {
      return Priority.HIGH;
    }
    if (req.includes('could') || req.includes('nice to have')) {
      return Priority.LOW;
    }
    
    return Priority.MEDIUM;
  }

  private async emitPipelineEvent(type: PipelineEventType, projectId: string, data: any): Promise<void> {
    if (!this.eventBus) return;

    const event = EventFactory.createEvent(
      EventCategory.PIPELINE,
      type,
      this.config.name,
      projectId,
      data
    );

    await this.eventBus.publish(EventCategory.PIPELINE, this.config.name, event);
  }
}
