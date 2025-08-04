/**
 * Styling Integration Service
 * Implements pure Tailwind CSS approach for template management
 */

import { fontLoader } from '@/utils/font-loader';
import { cn } from '@/lib/utils';

// Types for template system
export interface TailwindTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  classVariants: {
    // Core component classes
    button: {
      base: string;
      primary: string;
      secondary: string;
      ghost: string;
      destructive: string;
    };
    input: {
      base: string;
      filled: string;
      outlined: string;
      underlined: string;
    };
    card: {
      base: string;
      elevated: string;
      outlined: string;
      interactive: string;
    };
    // Add other component variants as needed
  };
  typography: {
    fonts: {
      primary: string;
      heading: string;
      mono: string;
    };
    weights: number[];
  };
}

// Available templates
export const tailwindTemplates: TailwindTemplate[] = [
  {
    id: 'linear',
    name: 'Linear',
    description: 'Clean, minimal interface inspired by Linear',
    category: 'minimal',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      input: {
        base: 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        filled: 'bg-muted border-transparent',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-lg bg-card text-card-foreground',
        elevated: 'shadow-lg',
        outlined: 'border border-border',
        interactive: 'hover:shadow-md transition-shadow cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'Inter',
        heading: 'Inter',
        mono: 'JetBrains Mono',
      },
      weights: [400, 500, 600, 700],
    },
  },
  // Add other templates here
];

interface ProjectStyling {
  id: string;
  projectId: string;
  templateId: string;
  customizations: Record<string, unknown>;
  appliedAt: Date;
  version: string;
}

interface StylingEvent {
  type: 'TEMPLATE_SELECTED' | 'TEMPLATE_CUSTOMIZED' | 'TEMPLATE_EXPORTED';
  projectId: string;
  templateId: string;
  userId: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Core Styling Service using pure Tailwind approach
 */
export class StylingService {
  private templateUsageCache = new Map<string, { usageCount: number; lastUsedAt: Date }>();
  private projectStylingCache = new Map<string, ProjectStyling>();

  /**
   * Get all available templates
   */
  async getTemplates(): Promise<TailwindTemplate[]> {
    return tailwindTemplates;
  }

  /**
   * Get specific template by ID
   */
  async getTemplate(templateId: string): Promise<TailwindTemplate | null> {
    return tailwindTemplates.find(t => t.id === templateId) || null;
  }

  /**
   * Get templates recommended for a specific project context
   */
  async getRecommendedTemplates(
    userId: string,
    projectContext?: {
      industry?: string;
      projectType?: string;
    }
  ): Promise<{
    templates: TailwindTemplate[];
    reasoning: string[];
  }> {
    let recommendedTemplates = tailwindTemplates;
    const reasoning: string[] = [];

    if (projectContext?.industry) {
      const industryMapping: Record<string, string[]> = {
        'saas': ['minimal', 'modern'],
        'ecommerce': ['playful', 'modern'],
        'finance': ['minimal', 'professional'],
        'creative': ['playful', 'modern'],
      };

      const preferredCategories = industryMapping[projectContext.industry.toLowerCase()] || [];
      if (preferredCategories.length > 0) {
        recommendedTemplates = recommendedTemplates.filter(t =>
          preferredCategories.includes(t.category)
        );
        reasoning.push(`Filtered by ${projectContext.industry} industry preferences`);
      }
    }

    // Sort by usage history
    recommendedTemplates = recommendedTemplates.sort((a, b) => {
      const aUsage = this.templateUsageCache.get(a.id)?.usageCount || 0;
      const bUsage = this.templateUsageCache.get(b.id)?.usageCount || 0;
      return bUsage - aUsage;
    });

    return {
      templates: recommendedTemplates.slice(0, 6), // Top 6 recommendations
      reasoning,
    };
  }

  /**
   * Apply template to project
   */
  async applyTemplateToProject(
    projectId: string,
    templateId: string,
    userId: string
  ): Promise<ProjectStyling> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Create project styling record
    const projectStyling: ProjectStyling = {
      id: `ps_${Date.now()}`,
      projectId,
      templateId,
      customizations: {},
      appliedAt: new Date(),
      version: '1.0'
    };

    // Cache for quick access
    this.projectStylingCache.set(projectId, projectStyling);

    // Preload template fonts
    await this.preloadTemplateFonts(template);

    // Track usage
    await this.updateTemplateUsage(templateId);

    // Emit event
    await this.emitStylingEvent({
      type: 'TEMPLATE_SELECTED',
      projectId,
      templateId,
      userId,
      metadata: {
        templateCategory: template.category,
      },
      timestamp: new Date()
    });

    return projectStyling;
  }

  /**
   * Get project styling configuration
   */
  async getProjectStyling(projectId: string): Promise<ProjectStyling | null> {
    return this.projectStylingCache.get(projectId) || null;
  }

  /**
   * Get component classes for a specific template
   */
  getTemplateClasses(templateId: string, component: keyof TailwindTemplate['classVariants'], variant?: string): string {
    const template = tailwindTemplates.find(t => t.id === templateId);
    if (!template) return '';

    const componentVariants = template.classVariants[component];
    if (!componentVariants) return '';

    if (variant && variant in componentVariants) {
      return cn(componentVariants.base, componentVariants[variant as keyof typeof componentVariants]);
    }

    return componentVariants.base;
  }

  // Private helper methods

  private async preloadTemplateFonts(template: TailwindTemplate): Promise<void> {
    try {
      await Promise.all([
        fontLoader.loadGoogleFont(template.typography.fonts.primary, template.typography.weights),
        fontLoader.loadGoogleFont(template.typography.fonts.heading, template.typography.weights),
        fontLoader.loadGoogleFont(template.typography.fonts.mono, [400]),
      ]);
    } catch (error) {
      console.warn('Failed to preload template fonts:', error);
    }
  }

  private async emitStylingEvent(event: StylingEvent): Promise<void> {
    // In production, this would emit to event system
    console.log('Styling Event:', event);
  }

  private async updateTemplateUsage(templateId: string): Promise<void> {
    const current = this.templateUsageCache.get(templateId) || {
      usageCount: 0,
      lastUsedAt: new Date(),
    };

    this.templateUsageCache.set(templateId, {
      usageCount: current.usageCount + 1,
      lastUsedAt: new Date(),
    });
  }
}

// Export singleton instance
export const stylingService = new StylingService();