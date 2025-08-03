/**
 * Component Catalog Service
 * 
 * Manages component metadata, search, and recommendations
 */

import { BaseService } from './base-service';
import { EventBus } from './event-bus';
import { EventFactory, EventCategory, PipelineEventType } from '../../dias/events/event-types';
import {
  ComponentMetadata,
  ComponentVariation,
  AdvancedThemeTemplate,
  ComponentMatch,
  ComponentRequirement,
  UIPattern,
  ComponentCustomization
} from '../pipeline/component-pipeline/types';
import { ComponentCategory } from '../pipeline/component-pipeline/types';

export interface ComponentCatalogConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  cdnUrl?: string;
}

export interface ComponentSearchParams {
  category?: string;
  tags?: string[];
  templateId?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ComponentRecommendationParams {
  blueprintAnalysis: {
    patterns: UIPattern[];
    requirements: ComponentRequirement[];
  };
  templateId?: string;
  userHistory?: string[];
  limit?: number;
}

export class ComponentCatalogService extends BaseService {
  private eventBus?: EventBus;
  private cdnUrl: string;
  private componentCache: Map<string, ComponentMetadata> = new Map();
  private templateCache: Map<string, AdvancedThemeTemplate> = new Map();

  constructor(config: ComponentCatalogConfig = {}) {
    super({
      name: config.name || 'component-catalog-service',
      version: config.version || '1.0.0',
      dependencies: []
    });
    this.eventBus = config.eventBus;
    this.cdnUrl = config.cdnUrl || 'https://cdn.vibelab.com/components';
  }

  protected async initialize(): Promise<void> {
    this.log('info', 'Component catalog service initialized');
    await this.loadComponentMetadata();
    await this.loadTemplateData();
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'Component catalog service cleaned up');
    this.componentCache.clear();
    this.templateCache.clear();
  }

  protected async healthCheck(): Promise<boolean> {
    return this.componentCache.size > 0 && this.templateCache.size > 0;
  }

  /**
   * Implement abstract process method from BaseService
   */
  async process(data: any): Promise<any> {
    // This service doesn't process data in the traditional sense
    // but implements the abstract method for consistency
    return data;
  }

  /**
   * Search components with filters
   */
  async searchComponents(params: ComponentSearchParams): Promise<{
    components: ComponentMetadata[];
    total: number;
    filters: ComponentSearchParams;
  }> {
    const startTime = Date.now();
    
    try {
      await this.emitCatalogEvent(PipelineEventType.COMPONENT_SEARCH, 'search', {
        filters: params
      });

      let results = Array.from(this.componentCache.values());

      // Apply filters
      if (params.category) {
        results = results.filter(c => c.category === params.category);
      }

      if (params.tags && params.tags.length > 0) {
        results = results.filter(c => 
          params.tags!.some(tag => c.tags.includes(tag))
        );
      }

      if (params.templateId) {
        results = results.filter(c => 
          c.templateVariations.some(v => v.templateId === params.templateId)
        );
      }

      if (params.query) {
        const query = params.query.toLowerCase();
        results = results.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Apply pagination
      const total = results.length;
      const offset = params.offset || 0;
      const limit = params.limit || 20;
      const paginatedResults = results.slice(offset, offset + limit);

      const duration = Date.now() - startTime;
      await this.emitCatalogEvent(PipelineEventType.COMPONENT_SEARCH_COMPLETED, 'search', {
        filters: params,
        results: paginatedResults.length,
        total,
        duration
      });

      this.log('info', `Component search completed in ${duration}ms: ${paginatedResults.length}/${total} results`);
      
      return {
        components: paginatedResults,
        total,
        filters: params
      };

    } catch (error) {
      await this.emitCatalogEvent(PipelineEventType.COMPONENT_SEARCH_FAILED, 'search', {
        filters: params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get component recommendations based on blueprint analysis
   */
  async getRecommendations(params: ComponentRecommendationParams): Promise<{
    recommendations: ComponentMatch[];
    confidence: number;
    reasoning: string[];
  }> {
    const startTime = Date.now();
    
    try {
      await this.emitCatalogEvent(PipelineEventType.COMPONENT_RECOMMENDATION, 'recommendation', {
        patterns: params.blueprintAnalysis.patterns.length,
        requirements: params.blueprintAnalysis.requirements.length
      });

      const recommendations: ComponentMatch[] = [];
      const reasoning: string[] = [];

      // Enhanced recommendation generation based on patterns
      for (const pattern of params.blueprintAnalysis.patterns) {
        const patternComponents = this.getComponentsForPattern(pattern);
        recommendations.push(...patternComponents);
        reasoning.push(`Pattern "${pattern.type}" detected: ${patternComponents.length} components recommended`);
      }

      // Enhanced recommendation generation based on requirements
      for (const req of params.blueprintAnalysis.requirements) {
        const reqComponents = this.getComponentsForRequirement(req, params.templateId);
        recommendations.push(...reqComponents);
        reasoning.push(`Requirement "${req.type}" detected: ${reqComponents.length} components recommended`);
      }

      // Apply template filtering if specified
      if (params.templateId) {
        const template = this.templateCache.get(params.templateId);
        if (template) {
          recommendations.forEach(rec => {
            rec.confidence = Math.min(rec.confidence, 95); // Cap confidence for template-specific
          });
          reasoning.push(`Template "${params.templateId}" applied to recommendations`);
        }
      }

      // Apply user history influence
      if (params.userHistory && params.userHistory.length > 0) {
        recommendations.forEach(rec => {
          if (params.userHistory!.includes(rec.componentId)) {
            rec.confidence += 10; // Boost confidence for previously used components
          }
        });
        reasoning.push('User history applied to boost familiar components');
      }

      // Enhanced ranking and scoring
      const rankedRecommendations = this.rankRecommendations(recommendations, params);
      
      // Sort by confidence and apply limit
      const sortedRecommendations = rankedRecommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, params.limit || 12);

      // Calculate overall confidence
      const confidence = sortedRecommendations.length > 0
        ? Math.round(sortedRecommendations.reduce((sum, r) => sum + r.confidence, 0) / sortedRecommendations.length)
        : 0;

      const duration = Date.now() - startTime;
      await this.emitCatalogEvent(PipelineEventType.COMPONENT_RECOMMENDATION_COMPLETED, 'recommendation', {
        recommendations: sortedRecommendations.length,
        confidence,
        duration
      });

      this.log('info', `Component recommendations generated in ${duration}ms: ${sortedRecommendations.length} recommendations with ${confidence}% confidence`);
      
      return {
        recommendations: sortedRecommendations,
        confidence,
        reasoning
      };

    } catch (error) {
      await this.emitCatalogEvent(PipelineEventType.COMPONENT_RECOMMENDATION_FAILED, 'recommendation', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get component by ID
   */
  async getComponent(componentId: string): Promise<ComponentMetadata | null> {
    const component = this.componentCache.get(componentId);
    
    if (component) {
      await this.emitCatalogEvent(PipelineEventType.COMPONENT_VIEWED, componentId, {
        componentId,
        category: component.category
      });
    }
    
    return component || null;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<AdvancedThemeTemplate | null> {
    return this.templateCache.get(templateId) || null;
  }

  /**
   * Get all templates
   */
  async getTemplates(): Promise<AdvancedThemeTemplate[]> {
    return Array.from(this.templateCache.values());
  }

  /**
   * Get component variations for a template
   */
  async getComponentVariations(componentId: string, templateId: string): Promise<ComponentVariation[]> {
    const component = this.componentCache.get(componentId);
    if (!component) return [];

    return component.templateVariations.filter(v => v.templateId === templateId);
  }

  /**
   * Load component metadata from storage
   */
  private async loadComponentMetadata(): Promise<void> {
    // TODO: Load from database or API
    // For now, create sample data
    const sampleComponents: ComponentMetadata[] = [
      {
        id: 'button-primary',
        name: 'Primary Button',
        category: ComponentCategory.FEATURE,
        tags: ['button', 'interaction', 'cta'],
        description: 'Primary call-to-action button component',
        thumbnailUrl: `${this.cdnUrl}/thumbnails/button-primary.png`,
        dependencies: ['react', 'tailwindcss'],
        frameworkSupport: ['react', 'vue', 'angular'],
        templateVariations: [
          {
            templateId: 'linear',
            templateName: 'Linear',
            componentId: 'button-primary',
            variationId: 'button-primary-linear',
            previewUrl: `${this.cdnUrl}/previews/button-primary-linear.png`,
            customizationOptions: [
              {
                type: 'color',
                name: 'Primary Color',
                description: 'Primary button color',
                defaultValue: '#3B82F6',
                constraints: { type: 'color' }
              }
            ]
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'navigation-header',
        name: 'Header Navigation',
        category: ComponentCategory.CORE,
        tags: ['navigation', 'header', 'menu'],
        description: 'Main navigation header component',
        thumbnailUrl: `${this.cdnUrl}/thumbnails/navigation-header.png`,
        dependencies: ['react', 'tailwindcss'],
        frameworkSupport: ['react', 'vue', 'angular'],
        templateVariations: [
          {
            templateId: 'linear',
            templateName: 'Linear',
            componentId: 'navigation-header',
            variationId: 'navigation-header-linear',
            previewUrl: `${this.cdnUrl}/previews/navigation-header-linear.png`,
            customizationOptions: [
              {
                type: 'color',
                name: 'Background Color',
                description: 'Header background color',
                defaultValue: '#FFFFFF',
                constraints: { type: 'color' }
              }
            ]
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleComponents.forEach(component => {
      this.componentCache.set(component.id, component);
    });

    this.log('info', `Loaded ${sampleComponents.length} component metadata entries`);
  }

  /**
   * Load template data
   */
  private async loadTemplateData(): Promise<void> {
    // TODO: Load from database or API
    // For now, create sample templates
    const sampleTemplates: AdvancedThemeTemplate[] = [
      {
        id: 'linear',
        name: 'Linear',
        description: 'Clean, modern design system inspired by Linear',
        category: 'business',
        previewUrl: `${this.cdnUrl}/templates/linear-preview.png`,
        colorPalette: {
          primary: ['#3B82F6', '#1D4ED8', '#1E40AF'],
          secondary: ['#6B7280', '#4B5563', '#374151'],
          accent: ['#10B981', '#059669', '#047857'],
          neutral: ['#F9FAFB', '#F3F4F6', '#E5E7EB'],
          semantic: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
          }
        },
        typography: {
          fontFamily: {
            primary: 'Inter',
            secondary: 'Inter',
            monospace: 'JetBrains Mono'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          scale: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32],
          breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px'
          }
        },
        animation: {
          duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms'
          },
          easing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            linear: 'linear',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
          },
          intensity: 'subtle'
        },
        components: []
      },
      {
        id: 'apple',
        name: 'Apple',
        description: 'Elegant, minimalist design system inspired by Apple\'s Human Interface Guidelines',
        category: 'elegant',
        previewUrl: `${this.cdnUrl}/templates/apple-preview.png`,
        colorPalette: {
          primary: ['#007AFF', '#0056CC', '#003D99'],
          secondary: ['#8E8E93', '#636366', '#48484A'],
          accent: ['#34C759', '#30D158', '#28BD50'],
          neutral: ['#FFFFFF', '#F2F2F7', '#E5E5EA'],
          semantic: {
            success: '#34C759',
            warning: '#FF9500',
            error: '#FF3B30',
            info: '#007AFF'
          }
        },
        typography: {
          fontFamily: {
            primary: 'SF Pro Display',
            secondary: 'SF Pro Text',
            monospace: 'SF Mono'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          scale: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32],
          breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px'
          }
        },
        animation: {
          duration: {
            fast: '200ms',
            normal: '400ms',
            slow: '600ms'
          },
          easing: {
            ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            linear: 'linear',
            easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
            easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
            easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)'
          },
          intensity: 'moderate'
        },
        components: []
      },
      {
        id: 'spotify',
        name: 'Spotify',
        description: 'Bold, vibrant design system inspired by Spotify\'s dark theme and energetic branding',
        category: 'creative',
        previewUrl: `${this.cdnUrl}/templates/spotify-preview.png`,
        colorPalette: {
          primary: ['#1DB954', '#1ED760', '#1FDF64'],
          secondary: ['#B3B3B3', '#A7A7A7', '#8C8C8C'],
          accent: ['#FF6B6B', '#FF8E53', '#FFA726'],
          neutral: ['#121212', '#181818', '#282828'],
          semantic: {
            success: '#1DB954',
            warning: '#FFA726',
            error: '#FF6B6B',
            info: '#1DB954'
          }
        },
        typography: {
          fontFamily: {
            primary: 'Circular',
            secondary: 'Circular',
            monospace: 'JetBrains Mono'
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        spacing: {
          scale: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32],
          breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px'
          }
        },
        animation: {
          duration: {
            fast: '100ms',
            normal: '250ms',
            slow: '400ms'
          },
          easing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            linear: 'linear',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
          },
          intensity: 'energetic'
        },
        components: []
      }
    ];

    sampleTemplates.forEach(template => {
      this.templateCache.set(template.id, template);
    });

    this.log('info', `Loaded ${sampleTemplates.length} template configurations`);
  }

  /**
   * Get components for a specific pattern
   */
  private getComponentsForPattern(pattern: UIPattern): ComponentMatch[] {
    const matches: ComponentMatch[] = [];
    
    // Pattern to component mapping
    const patternComponents: Record<string, string[]> = {
      dashboard: ['navigation-header', 'data-table', 'chart-card', 'metric-card'],
      ecommerce: ['product-card', 'shopping-cart', 'checkout-form', 'product-grid'],
      blog: ['article-card', 'blog-header', 'content-editor', 'tag-list'],
      navigation: ['navigation-header', 'sidebar-menu', 'breadcrumb', 'pagination'],
      form: ['input-field', 'form-group', 'submit-button', 'validation-message'],
      table: ['data-table', 'table-header', 'table-row', 'table-pagination'],
      modal: ['modal-dialog', 'modal-overlay', 'modal-header', 'modal-content'],
      card: ['info-card', 'product-card', 'article-card', 'metric-card']
    };

    const componentIds = patternComponents[pattern.type] || [];
    
    for (const componentId of componentIds) {
      const component = this.componentCache.get(componentId);
      if (component) {
        matches.push({
          componentId,
          name: component.name,
          category: component.category,
          confidence: pattern.confidence,
          reasoning: [`Matches ${pattern.type} pattern with ${pattern.confidence}% confidence`],
          customization: this.generateDefaultCustomization(component)
        });
      }
    }

    return matches;
  }

  /**
   * Get components for a specific requirement
   */
  private getComponentsForRequirement(req: ComponentRequirement, templateId?: string): ComponentMatch[] {
    const matches: ComponentMatch[] = [];
    
    // Requirement to component mapping
    const requirementComponents: Record<string, string[]> = {
      navigation: ['navigation-header', 'sidebar-menu', 'breadcrumb'],
      form: ['input-field', 'form-group', 'submit-button'],
      display: ['data-table', 'card-grid', 'list-view'],
      interaction: ['button-primary', 'button-secondary', 'link-button'],
      layout: ['container', 'grid-layout', 'flex-layout'],
      content: ['text-block', 'image-gallery', 'video-player']
    };

    const componentIds = requirementComponents[req.category] || [];
    
    for (const componentId of componentIds) {
      const component = this.componentCache.get(componentId);
      if (component) {
        matches.push({
          componentId,
          name: component.name,
          category: component.category,
          confidence: 75, // Base confidence for requirements
          reasoning: [`Matches ${req.category} requirement: ${req.description}`],
          customization: this.generateDefaultCustomization(component, templateId)
        });
      }
    }

    return matches;
  }

  /**
   * Generate default customization for a component
   */
  private generateDefaultCustomization(component: ComponentMetadata, templateId?: string): ComponentCustomization {
    const template = templateId ? this.templateCache.get(templateId) : null;
    
    return {
      styling: {
        colors: {
          primary: template?.colorPalette.primary[0] || '#3B82F6',
          secondary: template?.colorPalette.secondary[0] || '#6B7280',
          accent: template?.colorPalette.accent[0] || '#10B981'
        },
        typography: {
          fontFamily: template?.typography.fontFamily.primary || 'Inter',
          fontSize: template?.typography.fontSize.base || '1rem',
          fontWeight: template?.typography.fontWeight.normal.toString() || '400'
        },
        spacing: {
          padding: '1rem',
          margin: '0.5rem',
          gap: '0.5rem'
        },
        animation: {
          duration: template?.animation.duration.normal || '300ms',
          easing: template?.animation.easing.ease || 'cubic-bezier(0.4, 0, 0.2, 1)',
          intensity: template?.animation.intensity || 'subtle'
        }
      },
      behavior: {
        interactions: ['hover', 'focus', 'click'],
        states: ['default', 'hover', 'active', 'disabled'],
        events: ['onClick', 'onChange', 'onSubmit']
      },
      content: {
        text: component.description,
        icons: [],
        data: {}
      }
    };
  }

  /**
   * Enhanced ranking algorithm for recommendations
   */
  private rankRecommendations(recommendations: ComponentMatch[], params: ComponentRecommendationParams): ComponentMatch[] {
    return recommendations.map(rec => {
      let score = rec.confidence;

      // Pattern relevance bonus
      const patternRelevance = this.calculatePatternRelevance(rec, params.blueprintAnalysis.patterns);
      score += patternRelevance * 10;

      // Requirement match bonus
      const requirementMatch = this.calculateRequirementMatch(rec, params.blueprintAnalysis.requirements);
      score += requirementMatch * 15;

      // Template compatibility bonus
      if (params.templateId) {
        const templateCompatibility = this.calculateTemplateCompatibility(rec, params.templateId);
        score += templateCompatibility * 20;
      }

      // User preference bonus
      if (params.userHistory && params.userHistory.includes(rec.componentId)) {
        score += 25; // Significant boost for user history
      }

      // Popularity bonus (if we had popularity data)
      const popularityBonus = this.calculatePopularityBonus(rec);
      score += popularityBonus * 5;

      return {
        ...rec,
        confidence: Math.min(100, Math.round(score))
      };
    });
  }

  /**
   * Enhanced pattern relevance calculation with semantic analysis
   */
  private calculatePatternRelevance(component: ComponentMatch, patterns: UIPattern[]): number {
    let relevance = 0;
    
    for (const pattern of patterns) {
      // Enhanced semantic matching
      const semanticScore = this.calculateSemanticMatch(component, pattern);
      relevance += semanticScore * (pattern.confidence / 100);
      
      // Pattern type matching with fuzzy logic
      const typeMatch = this.calculateTypeMatch(component, pattern);
      relevance += typeMatch * 0.3;
      
      // Keyword matching with context awareness
      const keywordScore = this.calculateKeywordMatch(component, pattern);
      relevance += keywordScore * 0.2;
      
      // Context-based scoring
      const contextScore = this.calculateContextMatch(component, pattern);
      relevance += contextScore * 0.15;
    }
    
    return Math.min(1, relevance);
  }

  /**
   * Calculate semantic match between component and pattern
   */
  private calculateSemanticMatch(component: ComponentMatch, pattern: UIPattern): number {
    const semanticGroups: Record<string, string[]> = {
      navigation: ['header', 'nav', 'menu', 'sidebar', 'breadcrumb', 'pagination'],
      interaction: ['button', 'link', 'input', 'form', 'select', 'checkbox'],
      display: ['table', 'card', 'list', 'grid', 'chart', 'metric'],
      layout: ['container', 'wrapper', 'section', 'divider', 'spacer'],
      feedback: ['alert', 'toast', 'modal', 'tooltip', 'notification'],
      content: ['text', 'image', 'video', 'icon', 'avatar', 'badge']
    };

    // Find the semantic group for the pattern
    const patternGroup = Object.keys(semanticGroups).find(group => 
      semanticGroups[group].some(term => pattern.type.includes(term))
    );

    if (patternGroup) {
      // Check if component belongs to the same semantic group
      const componentGroup = Object.keys(semanticGroups).find(group => 
        semanticGroups[group].some(term => 
          component.name.toLowerCase().includes(term) || 
          component.category.toLowerCase().includes(term)
        )
      );

      if (componentGroup === patternGroup) {
        return 0.9; // High semantic match
      } else if (componentGroup) {
        return 0.4; // Partial semantic match
      }
    }

    return 0.1; // Low semantic match
  }

  /**
   * Calculate type match with fuzzy logic
   */
  private calculateTypeMatch(component: ComponentMatch, pattern: UIPattern): number {
    const componentType = component.name.toLowerCase();
    const patternType = pattern.type.toLowerCase();
    
    // Exact match
    if (componentType === patternType) {
      return 1.0;
    }
    
    // Contains match
    if (componentType.includes(patternType) || patternType.includes(componentType)) {
      return 0.8;
    }
    
    // Category match
    if (component.category.toLowerCase() === patternType) {
      return 0.7;
    }
    
    // Partial word match
    const componentWords = componentType.split('-');
    const patternWords = patternType.split('-');
    
    const commonWords = componentWords.filter(word => 
      patternWords.some(patternWord => 
        word.includes(patternWord) || patternWord.includes(word)
      )
    );
    
    if (commonWords.length > 0) {
      return Math.min(0.6, commonWords.length * 0.2);
    }
    
    return 0.1;
  }

  /**
   * Calculate keyword match with context awareness
   */
  private calculateKeywordMatch(component: ComponentMatch, pattern: UIPattern): number {
    let score = 0;
    const componentText = `${component.name} ${component.category}`.toLowerCase();
    
    for (const keyword of pattern.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Exact keyword match
      if (componentText.includes(keywordLower)) {
        score += 0.4;
      }
      
      // Partial keyword match
      else if (componentText.split(' ').some(word => 
        word.includes(keywordLower) || keywordLower.includes(word)
      )) {
        score += 0.2;
      }
      
      // Stemmed match (basic stemming)
      const stemmedKeyword = this.stemWord(keywordLower);
      const stemmedWords = componentText.split(' ').map(word => this.stemWord(word));
      
      if (stemmedWords.some(word => word.includes(stemmedKeyword) || stemmedKeyword.includes(word))) {
        score += 0.15;
      }
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate context match based on pattern context
   */
  private calculateContextMatch(component: ComponentMatch, pattern: UIPattern): number {
    if (!pattern.context) {
      return 0.5; // Default score for patterns without context
    }
    
    const contextLower = pattern.context.toLowerCase();
    const componentText = `${component.name} ${component.category}`.toLowerCase();
    
    // Context keyword matching
    const contextWords = contextLower.split(' ').filter((word: string) => word.length > 3);
    let contextMatches = 0;
    
    for (const contextWord of contextWords) {
      if (componentText.includes(contextWord)) {
        contextMatches++;
      }
    }
    
    if (contextWords.length > 0) {
      return Math.min(1, contextMatches / contextWords.length);
    }
    
    return 0.5;
  }

  /**
   * Basic word stemming for better keyword matching
   */
  private stemWord(word: string): string {
    // Basic stemming - remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    
    return word;
  }

  /**
   * Enhanced requirement match calculation with advanced scoring
   */
  private calculateRequirementMatch(component: ComponentMatch, requirements: ComponentRequirement[]): number {
    let match = 0;
    
    for (const req of requirements) {
      // Enhanced category matching with semantic analysis
      const categoryMatch = this.calculateRequirementCategoryMatch(component, req);
      match += categoryMatch * 0.4;
      
      // Enhanced type matching with fuzzy logic
      const typeMatch = this.calculateRequirementTypeMatch(component, req);
      match += typeMatch * 0.3;
      
      // Enhanced constraint analysis
      const constraintMatch = this.calculateRequirementConstraintMatch(component, req);
      match += constraintMatch * 0.2;
      
      // Alternative component analysis
      const alternativeMatch = this.calculateRequirementAlternativeMatch(component, req);
      match += alternativeMatch * 0.1;
    }
    
    return Math.min(1, match);
  }

  /**
   * Calculate requirement category match with semantic analysis
   */
  private calculateRequirementCategoryMatch(component: ComponentMatch, req: ComponentRequirement): number {
    const componentCategory = component.category.toLowerCase();
    const requirementCategory = req.category.toLowerCase();
    
    // Exact category match
    if (componentCategory === requirementCategory) {
      return 1.0;
    }
    
    // Semantic category groups
    const categoryGroups: Record<string, string[]> = {
      navigation: ['nav', 'menu', 'header', 'sidebar'],
      interaction: ['button', 'input', 'form', 'control'],
      display: ['table', 'card', 'list', 'grid', 'chart'],
      layout: ['container', 'wrapper', 'section', 'divider'],
      feedback: ['alert', 'toast', 'modal', 'notification'],
      content: ['text', 'image', 'media', 'icon']
    };
    
    // Check if both categories belong to the same semantic group
    for (const [group, categories] of Object.entries(categoryGroups)) {
      if (categories.some(cat => componentCategory.includes(cat)) && 
          categories.some(cat => requirementCategory.includes(cat))) {
        return 0.8;
      }
    }
    
    // Partial category match
    if (componentCategory.includes(requirementCategory) || 
        requirementCategory.includes(componentCategory)) {
      return 0.6;
    }
    
    return 0.2;
  }

  /**
   * Calculate requirement type match with fuzzy logic
   */
  private calculateRequirementTypeMatch(component: ComponentMatch, req: ComponentRequirement): number {
    const componentName = component.name.toLowerCase();
    const requirementType = req.type.toLowerCase();
    
    // Exact type match
    if (componentName === requirementType) {
      return 1.0;
    }
    
    // Contains match
    if (componentName.includes(requirementType) || requirementType.includes(componentName)) {
      return 0.8;
    }
    
    // Word-level matching
    const componentWords = componentName.split('-');
    const requirementWords = requirementType.split('-');
    
    const commonWords = componentWords.filter(word => 
      requirementWords.some(reqWord => 
        word.includes(reqWord) || reqWord.includes(word)
      )
    );
    
    if (commonWords.length > 0) {
      return Math.min(0.7, commonWords.length * 0.3);
    }
    
    return 0.2;
  }

  /**
   * Calculate requirement constraint match
   */
  private calculateRequirementConstraintMatch(component: ComponentMatch, req: ComponentRequirement): number {
    if (!req.constraints || req.constraints.length === 0) {
      return 0.5; // Default score for requirements without constraints
    }
    
    let constraintMatches = 0;
    const componentText = `${component.name} ${component.category}`.toLowerCase();
    
    for (const constraint of req.constraints) {
      const constraintLower = constraint.toLowerCase();
      
      // Direct constraint match
      if (componentText.includes(constraintLower)) {
        constraintMatches++;
      }
      // Partial constraint match
      else if (componentText.split(' ').some(word => 
        word.includes(constraintLower) || constraintLower.includes(word)
      )) {
        constraintMatches += 0.5;
      }
    }
    
    return constraintMatches / req.constraints.length;
  }

  /**
   * Calculate requirement alternative match
   */
  private calculateRequirementAlternativeMatch(component: ComponentMatch, req: ComponentRequirement): number {
    if (!req.alternatives || req.alternatives.length === 0) {
      return 0.5; // Default score for requirements without alternatives
    }
    
    const componentName = component.name.toLowerCase();
    
    for (const alternative of req.alternatives) {
      const alternativeLower = alternative.toLowerCase();
      
      // Exact alternative match
      if (componentName === alternativeLower) {
        return 0.9;
      }
      
      // Contains alternative match
      if (componentName.includes(alternativeLower) || alternativeLower.includes(componentName)) {
        return 0.7;
      }
    }
    
    return 0.3;
  }

  /**
   * Calculate template compatibility score with enhanced template-specific logic
   */
  private calculateTemplateCompatibility(component: ComponentMatch, templateId: string): number {
    // Enhanced template-specific compatibility mapping
    const templateCompatibilityMap: Record<string, Record<string, number>> = {
      linear: {
        navigation: 0.95, // Linear excels at navigation components
        form: 0.85,
        display: 0.90,
        interaction: 0.88,
        layout: 0.92,
        content: 0.80,
        feedback: 0.85,
        data: 0.90
      },
      apple: {
        navigation: 0.85,
        form: 0.95, // Apple excels at form components
        display: 0.88,
        interaction: 0.92,
        layout: 0.90,
        content: 0.85,
        feedback: 0.88,
        data: 0.82
      },
      spotify: {
        navigation: 0.80,
        form: 0.75,
        display: 0.95, // Spotify excels at display components
        interaction: 0.90,
        layout: 0.88,
        content: 0.92, // Spotify excels at content components
        feedback: 0.85,
        data: 0.88
      }
    };
    
    const templateCompatibility = templateCompatibilityMap[templateId];
    if (templateCompatibility && templateCompatibility[component.category]) {
      let baseScore = templateCompatibility[component.category];
      
      // Apply template-specific adjustments based on component characteristics
      baseScore = this.applyTemplateSpecificAdjustments(component, templateId, baseScore);
      
      return Math.min(1, Math.max(0, baseScore));
    }
    
    return 0.5; // Default compatibility
  }

  /**
   * Apply template-specific adjustments based on component characteristics
   */
  private applyTemplateSpecificAdjustments(component: ComponentMatch, templateId: string, baseScore: number): number {
    const componentName = component.name.toLowerCase();
    let adjustedScore = baseScore;

    switch (templateId) {
      case 'linear':
        // Linear prefers clean, minimal components
        if (componentName.includes('simple') || componentName.includes('minimal')) {
          adjustedScore += 0.1;
        }
        if (componentName.includes('complex') || componentName.includes('detailed')) {
          adjustedScore -= 0.05;
        }
        // Linear excels at data-heavy components
        if (componentName.includes('table') || componentName.includes('chart') || componentName.includes('metric')) {
          adjustedScore += 0.08;
        }
        break;

      case 'apple':
        // Apple prefers elegant, refined components
        if (componentName.includes('elegant') || componentName.includes('refined')) {
          adjustedScore += 0.1;
        }
        // Apple excels at form and input components
        if (componentName.includes('input') || componentName.includes('form') || componentName.includes('button')) {
          adjustedScore += 0.12;
        }
        // Apple prefers subtle animations
        if (componentName.includes('animated') || componentName.includes('transition')) {
          adjustedScore += 0.05;
        }
        break;

      case 'spotify':
        // Spotify prefers bold, vibrant components
        if (componentName.includes('bold') || componentName.includes('vibrant') || componentName.includes('energetic')) {
          adjustedScore += 0.1;
        }
        // Spotify excels at media and content components
        if (componentName.includes('media') || componentName.includes('content') || componentName.includes('player')) {
          adjustedScore += 0.12;
        }
        // Spotify prefers dark theme components
        if (componentName.includes('dark') || componentName.includes('night')) {
          adjustedScore += 0.08;
        }
        // Spotify excels at interactive components
        if (componentName.includes('interactive') || componentName.includes('dynamic')) {
          adjustedScore += 0.1;
        }
        break;
    }

    return adjustedScore;
  }

  /**
   * Calculate popularity bonus (placeholder for future enhancement)
   */
  private calculatePopularityBonus(component: ComponentMatch): number {
    // This would be enhanced with actual usage data
    // For now, use a simple heuristic based on component type
    const popularityMap: Record<string, number> = {
      'button-primary': 0.9,
      'navigation-header': 0.8,
      'input-field': 0.8,
      'data-table': 0.7,
      'modal-dialog': 0.7,
      'card': 0.6
    };
    
    return popularityMap[component.componentId] || 0.5;
  }

  /**
   * Emit catalog events
   */
  private async emitCatalogEvent(type: PipelineEventType, componentId: string, data: any): Promise<void> {
    if (this.eventBus) {
      const event = EventFactory.createEvent(
        EventCategory.PIPELINE,
        type,
        'component-catalog-service',
        'vibe-lab-project',
        {
          componentId,
          ...data
        }
      );
      await this.eventBus.publish('component-catalog', 'component-catalog-service', event);
    }
  }
} 