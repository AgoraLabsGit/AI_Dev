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
  UIPattern
} from '../pipeline/component-pipeline/types';

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

      // Generate recommendations based on patterns
      for (const pattern of params.blueprintAnalysis.patterns) {
        const patternComponents = this.getComponentsForPattern(pattern);
        recommendations.push(...patternComponents);
        reasoning.push(`Pattern "${pattern.type}" detected: ${patternComponents.length} components recommended`);
      }

      // Generate recommendations based on requirements
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

      // Sort by confidence and apply limit
      const sortedRecommendations = recommendations
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
        category: 'FEATURE',
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
        category: 'CORE',
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
   * Emit catalog events
   */
  private async emitCatalogEvent(type: PipelineEventType, componentId: string, data: any): Promise<void> {
    if (this.eventBus) {
      const event = EventFactory.createEvent(EventCategory.PIPELINE, type, {
        service: this.name,
        componentId,
        ...data
      });
      await this.eventBus.publish('component-catalog', event);
    }
  }
} 