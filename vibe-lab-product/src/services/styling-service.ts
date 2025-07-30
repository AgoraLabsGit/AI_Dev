/**
 * Styling Integration Service
 * Connects styling system with AVCA/DIAS architecture
 */

import { advancedThemeTemplates, type AdvancedThemeTemplate } from '@/lib/design-system/templates/advanced-templates';
import { fontLoader } from '@/utils/font-loader';
import { cssGenerator } from '@/utils/css-generator';

// Types for integration
interface ProjectStyling {
  id: string;
  projectId: string;
  templateId: string;
  customizations: TemplateCustomizations;
  appliedAt: Date;
  version: string;
}

interface TemplateCustomizations {
  colors?: Partial<{
    primary: string;
    secondary: string;
    accent: string;
  }>;
  typography?: Partial<{
    primaryFont: string;
    headingFont: string;
    scale: 'compact' | 'comfortable' | 'spacious';
  }>;
  spacing?: Partial<{
    scale: 'compact' | 'comfortable' | 'spacious';
    baseUnit: number;
  }>;
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

interface TemplateUsageHistory {
  templateId: string;
  usageCount: number;
  lastUsedAt: Date;
  successRate: number;
  customizationFrequency: Record<string, number>;
}

interface StylingEvent {
  type: 'TEMPLATE_SELECTED' | 'TEMPLATE_CUSTOMIZED' | 'TEMPLATE_EXPORTED' | 'COMPONENT_STYLED';
  projectId: string;
  templateId: string;
  userId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

/**
 * Core Styling Service for AVCA/DIAS Integration
 */
export class StylingService {
  private templateUsageCache = new Map<string, TemplateUsageHistory>();
  private projectStylingCache = new Map<string, ProjectStyling>();

  /**
   * Get all available templates with usage analytics
   */
  async getTemplates(userId?: string): Promise<AdvancedThemeTemplate[]> {
    // In Phase 2, this would include AI recommendations based on user history
    return advancedThemeTemplates;
  }

  /**
   * Get specific template by ID
   */
  async getTemplate(templateId: string): Promise<AdvancedThemeTemplate | null> {
    return advancedThemeTemplates.find(t => t.id === templateId) || null;
  }

  /**
   * Get templates recommended for a specific user/project
   * Phase 1: Basic category filtering
   * Phase 2: AI-powered recommendations
   */
  async getRecommendedTemplates(
    userId: string,
    projectContext?: {
      industry?: string;
      projectType?: string;
      brandColors?: string[];
    }
  ): Promise<{
    templates: AdvancedThemeTemplate[];
    reasoning: string[];
    confidence: number;
  }> {
    // Phase 1: Basic filtering by category and usage
    let recommendedTemplates = advancedThemeTemplates;
    const reasoning: string[] = [];

    // Filter by project context if provided
    if (projectContext?.industry) {
      const industryMapping: Record<string, string[]> = {
        'saas': ['futuristic', 'geometric'],
        'ecommerce': ['playful', 'editorial'],
        'finance': ['financial', 'geometric'],
        'creative': ['organic', 'playful'],
        'corporate': ['geometric', 'futuristic']
      };

      const preferredCategories = industryMapping[projectContext.industry.toLowerCase()] || [];
      if (preferredCategories.length > 0) {
        recommendedTemplates = recommendedTemplates.filter(t => 
          preferredCategories.includes(t.category)
        );
        reasoning.push(`Filtered by ${projectContext.industry} industry preferences`);
      }
    }

    // Sort by usage history (mock data for Phase 1)
    recommendedTemplates = recommendedTemplates.sort((a, b) => {
      const aUsage = this.templateUsageCache.get(a.id)?.usageCount || 0;
      const bUsage = this.templateUsageCache.get(b.id)?.usageCount || 0;
      return bUsage - aUsage;
    });

    reasoning.push('Sorted by community popularity');

    return {
      templates: recommendedTemplates.slice(0, 6), // Top 6 recommendations
      reasoning,
      confidence: 0.7 // Phase 1 confidence level
    };
  }

  /**
   * Apply template to project with AVCA/DIAS integration
   */
  async applyTemplateToProject(
    projectId: string,
    templateId: string,
    userId: string,
    customizations: TemplateCustomizations = {}
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
      customizations,
      appliedAt: new Date(),
      version: '1.0'
    };

    // Cache for quick access
    this.projectStylingCache.set(projectId, projectStyling);

    // Preload template fonts
    await this.preloadTemplateFonts(template);

    // Emit DIAS event for tracking
    await this.emitStylingEvent({
      type: 'TEMPLATE_SELECTED',
      projectId,
      templateId,
      userId,
      metadata: {
        customizations,
        templateCategory: template.category,
        selectionContext: 'project_creation'
      },
      timestamp: new Date()
    });

    // Update usage analytics
    await this.updateTemplateUsage(templateId, userId);

    return projectStyling;
  }

  /**
   * Update project styling with customizations
   */
  async updateProjectStyling(
    projectId: string,
    customizations: TemplateCustomizations,
    userId: string
  ): Promise<ProjectStyling> {
    const currentStyling = this.projectStylingCache.get(projectId);
    if (!currentStyling) {
      throw new Error(`No styling found for project ${projectId}`);
    }

    // Merge customizations
    const updatedStyling: ProjectStyling = {
      ...currentStyling,
      customizations: {
        ...currentStyling.customizations,
        ...customizations
      }
    };

    this.projectStylingCache.set(projectId, updatedStyling);

    // Emit DIAS event
    await this.emitStylingEvent({
      type: 'TEMPLATE_CUSTOMIZED',
      projectId,
      templateId: currentStyling.templateId,
      userId,
      metadata: {
        customizations,
        customizationType: Object.keys(customizations)
      },
      timestamp: new Date()
    });

    return updatedStyling;
  }

  /**
   * Get project styling configuration
   */
  async getProjectStyling(projectId: string): Promise<ProjectStyling | null> {
    // In production, this would query the database
    return this.projectStylingCache.get(projectId) || null;
  }

  /**
   * Generate CSS for project with applied customizations
   */
  async generateProjectCSS(
    projectId: string,
    format: 'css-variables' | 'tailwind-config' | 'js-object' = 'css-variables'
  ): Promise<string> {
    const projectStyling = await this.getProjectStyling(projectId);
    if (!projectStyling) {
      throw new Error(`No styling configuration found for project ${projectId}`);
    }

    const template = await this.getTemplate(projectStyling.templateId);
    if (!template) {
      throw new Error(`Template ${projectStyling.templateId} not found`);
    }

    // Apply customizations to template
    const customizedTemplate = this.applyCustomizationsToTemplate(
      template,
      projectStyling.customizations
    );

    // Generate CSS using css-generator
    return cssGenerator.exportTemplate(customizedTemplate, { format });
  }

  /**
   * Export project theme for download
   */  
  async exportProjectTheme(
    projectId: string,
    userId: string,
    format: 'css-variables' | 'tailwind-config' | 'js-object' = 'css-variables'
  ): Promise<{ content: string; filename: string }> {
    const projectStyling = await this.getProjectStyling(projectId);
    if (!projectStyling) {
      throw new Error(`No styling configuration found for project ${projectId}`);
    }

    const content = await this.generateProjectCSS(projectId, format);
    const filename = `${projectId}-theme.${this.getFileExtension(format)}`;

    // Emit DIAS event
    await this.emitStylingEvent({
      type: 'TEMPLATE_EXPORTED',
      projectId,
      templateId: projectStyling.templateId,
      userId,
      metadata: {
        format,
        contentSize: content.length
      },
      timestamp: new Date()
    });

    return { content, filename };
  }

  /**
   * Get styling analytics for a user
   */
  async getUserStylingAnalytics(userId: string): Promise<{
    favoriteTemplates: TemplateUsageHistory[];
    customizationPatterns: Record<string, number>;
    successRate: number;
  }> {
    // Mock implementation for Phase 1
    const favoriteTemplates = Array.from(this.templateUsageCache.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      favoriteTemplates,
      customizationPatterns: {
        'color': 0.8,
        'typography': 0.6,
        'spacing': 0.4,
        'borders': 0.3
      },
      successRate: 0.85
    };
  }

  /**
   * Validate component style consistency with project template
   */
  async validateComponentStyle(
    projectId: string,
    componentType: string,
    componentStyle: Record<string, any>
  ): Promise<{
    isConsistent: boolean;
    inconsistencies: string[];
    suggestions: string[];
  }> {
    const projectStyling = await this.getProjectStyling(projectId);
    if (!projectStyling) {
      return {
        isConsistent: true,
        inconsistencies: [],
        suggestions: []
      };
    }

    const template = await this.getTemplate(projectStyling.templateId);
    if (!template) {
      return {
        isConsistent: true,
        inconsistencies: [],
        suggestions: []
      };
    }

    // Basic validation logic (Phase 1)
    const inconsistencies: string[] = [];
    const suggestions: string[] = [];

    // Check color consistency
    if (componentStyle.backgroundColor && 
        !this.isColorInTemplate(componentStyle.backgroundColor, template)) {
      inconsistencies.push('Background color not from template palette');
      suggestions.push(`Use template colors: ${template.colors.primary}, ${template.colors.secondary}`);
    }

    // Check typography consistency
    if (componentStyle.fontFamily && 
        componentStyle.fontFamily !== template.typography.primaryFont.family) {
      inconsistencies.push('Font family does not match template');
      suggestions.push(`Use template font: ${template.typography.primaryFont.family}`);
    }

    return {
      isConsistent: inconsistencies.length === 0,
      inconsistencies,
      suggestions
    };
  }

  // Private helper methods

  private async preloadTemplateFonts(template: AdvancedThemeTemplate): Promise<void> {
    try {
      await Promise.all([
        fontLoader.loadGoogleFont(
          template.typography.primaryFont.family,
          template.typography.primaryFont.weights
        ),
        fontLoader.loadGoogleFont(
          template.typography.headingFont.family,
          template.typography.headingFont.weights
        )
      ]);
    } catch (error) {
      console.warn('Failed to preload template fonts:', error);
    }
  }

  private async emitStylingEvent(event: StylingEvent): Promise<void> {
    // In production, this would emit to DIAS event system
    console.log('DIAS Event:', event);
  }

  private async updateTemplateUsage(templateId: string, userId: string): Promise<void> {
    const current = this.templateUsageCache.get(templateId) || {
      templateId,
      usageCount: 0,
      lastUsedAt: new Date(),
      successRate: 0.85,
      customizationFrequency: {}
    };

    this.templateUsageCache.set(templateId, {
      ...current,
      usageCount: current.usageCount + 1,
      lastUsedAt: new Date()
    });
  }

  private applyCustomizationsToTemplate(
    template: AdvancedThemeTemplate,
    customizations: TemplateCustomizations
  ): AdvancedThemeTemplate {
    return {
      ...template,
      colors: {
        ...template.colors,
        ...customizations.colors
      },
      typography: {
        ...template.typography,
        ...(customizations.typography && {
          primaryFont: customizations.typography.primaryFont ? {
            ...template.typography.primaryFont,
            family: customizations.typography.primaryFont
          } : template.typography.primaryFont,
          headingFont: customizations.typography.headingFont ? {
            ...template.typography.headingFont,
            family: customizations.typography.headingFont
          } : template.typography.headingFont
        })
      },
      spacing: {
        ...template.spacing,
        ...customizations.spacing
      },
      borders: {
        ...template.borders,
        ...customizations.borders
      }
    };
  }

  private isColorInTemplate(color: string, template: AdvancedThemeTemplate): boolean {
    const templateColors = [
      template.colors.primary,
      template.colors.secondary,
      template.colors.accent,
      template.colors.background.primary,
      template.colors.background.secondary,
      template.colors.background.tertiary,
      template.colors.text.primary,
      template.colors.text.secondary
    ];

    return templateColors.includes(color);
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'css-variables':
        return 'css';
      case 'tailwind-config':
      case 'js-object':
        return 'js';
      default:
        return 'txt';
    }
  }
}

// Export singleton instance
export const stylingService = new StylingService();