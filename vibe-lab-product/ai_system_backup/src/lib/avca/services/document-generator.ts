import { BaseService } from './base-service';
import { EntryPathType } from './ai-client';
import { SourceAnalysisResult } from './source-analyzer';

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  metadata?: {
    sourceType?: string;
    confidence?: number;
    suggestions?: string[];
  };
}

export interface GeneratedDocument {
  type: 'overview' | 'specs';
  sections: DocumentSection[];
  metadata: {
    generationTime: number;
    sourceType: EntryPathType;
    confidence: number;
    wordCount: number;
  };
}

export interface DocumentTemplate {
  sections: {
    id: string;
    title: string;
    prompts: string[];
    required: boolean;
  }[];
  metadata: {
    type: 'overview' | 'specs';
    minSections: number;
    maxSections: number;
  };
}

export class DocumentGenerator extends BaseService {
  private templates: Record<'overview' | 'specs', DocumentTemplate> = {
    overview: {
      sections: [
        {
          id: 'description',
          title: 'Project Description',
          prompts: [
            'Provide a clear, concise description of the project',
            'What is the main purpose of this application?',
            'What problem does it solve?'
          ],
          required: true
        },
        {
          id: 'target_users',
          title: 'Target Users',
          prompts: [
            'Who are the primary users of this application?',
            'What are their key characteristics and needs?',
            'How will they benefit from this solution?'
          ],
          required: true
        },
        {
          id: 'key_features',
          title: 'Key Features',
          prompts: [
            'List the most important features of the application',
            'What capabilities make this solution unique?',
            'What are the must-have functionalities?'
          ],
          required: true
        },
        {
          id: 'technical_requirements',
          title: 'Technical Requirements',
          prompts: [
            'What are the key technical requirements?',
            'Are there specific performance needs?',
            'What are the scalability requirements?'
          ],
          required: true
        },
        {
          id: 'success_metrics',
          title: 'Success Metrics',
          prompts: [
            'How will success be measured?',
            'What are the key performance indicators?',
            'What metrics need to be tracked?'
          ],
          required: true
        }
      ],
      metadata: {
        type: 'overview',
        minSections: 4,
        maxSections: 6
      }
    },
    specs: {
      sections: [
        {
          id: 'architecture',
          title: 'Architecture Overview',
          prompts: [
            'Describe the high-level architecture',
            'What are the main system components?',
            'How do components interact?'
          ],
          required: true
        },
        {
          id: 'tech_stack',
          title: 'Technology Stack',
          prompts: [
            'What technologies will be used?',
            'Why were these technologies chosen?',
            'Are there any specific version requirements?'
          ],
          required: true
        },
        {
          id: 'data_model',
          title: 'Data Model',
          prompts: [
            'What are the key data entities?',
            'How are they related?',
            'What are the data storage requirements?'
          ],
          required: true
        },
        {
          id: 'api_design',
          title: 'API Design',
          prompts: [
            'What are the main API endpoints?',
            'What are the request/response formats?',
            'What are the authentication requirements?'
          ],
          required: true
        },
        {
          id: 'security',
          title: 'Security Requirements',
          prompts: [
            'What are the security requirements?',
            'How is authentication handled?',
            'What data needs to be protected?'
          ],
          required: true
        },
        {
          id: 'deployment',
          title: 'Deployment Strategy',
          prompts: [
            'How will the application be deployed?',
            'What environments are needed?',
            'What are the infrastructure requirements?'
          ],
          required: true
        }
      ],
      metadata: {
        type: 'specs',
        minSections: 5,
        maxSections: 7
      }
    }
  };

  constructor() {
    super({
      name: 'document-generator',
      version: '1.0.0',
      dependencies: [],
      healthCheckInterval: 30000
    });
  }

  async generateDocument(
    type: 'overview' | 'specs',
    analysis: SourceAnalysisResult,
    aiClient: any // Will be properly typed when integrated
  ): Promise<GeneratedDocument> {
    const startTime = Date.now();
    const template = this.templates[type];
    const sections: DocumentSection[] = [];

    try {
      // Generate each section
      for (const sectionTemplate of template.sections) {
        if (!sectionTemplate.required && !this.shouldIncludeSection(sectionTemplate, analysis)) {
          continue;
        }

        const section = await this.generateSection(
          sectionTemplate,
          analysis,
          aiClient
        );

        sections.push(section);
      }

      // Calculate metadata
      const wordCount = sections.reduce(
        (total, section) => total + section.content.split(' ').length,
        0
      );

      // Calculate overall confidence
      const confidence = sections.reduce(
        (total, section) => total + (section.metadata?.confidence || 0),
        0
      ) / sections.length;

      return {
        type,
        sections,
        metadata: {
          generationTime: Date.now() - startTime,
          sourceType: analysis.type,
          confidence,
          wordCount
        }
      };

    } catch (error) {
      this.log('error', `Failed to generate ${type} document`, { error });
      throw error;
    }
  }

  private async generateSection(
    template: DocumentTemplate['sections'][0],
    analysis: SourceAnalysisResult,
    aiClient: any
  ): Promise<DocumentSection> {
    try {
      // Create context from analysis
      const context = this.createContext(template.id, analysis);

      // Generate content using AI
      const response = await aiClient.process({
        role: 'developer',
        prompt: this.createPrompt(template, context),
        context: JSON.stringify(context)
      });

      // Extract suggestions if any
      const suggestions = this.extractSuggestions(response.content);

      return {
        id: template.id,
        title: template.title,
        content: this.cleanContent(response.content),
        metadata: {
          sourceType: analysis.type,
          confidence: this.calculateConfidence(response),
          suggestions
        }
      };

    } catch (error) {
      this.log('error', `Failed to generate section ${template.id}`, { error });
      throw error;
    }
  }

  private shouldIncludeSection(
    template: DocumentTemplate['sections'][0],
    analysis: SourceAnalysisResult
  ): boolean {
    // Implement logic to determine if optional section should be included
    return true;
  }

  private createContext(
    sectionId: string,
    analysis: SourceAnalysisResult
  ): Record<string, any> {
    // Create relevant context based on section and analysis
    return {
      sectionType: sectionId,
      analysisType: analysis.type,
      analysisResults: analysis.analysis,
      recommendations: analysis.recommendations
    };
  }

  private createPrompt(
    template: DocumentTemplate['sections'][0],
    context: Record<string, any>
  ): string {
    // Create AI prompt using template and context
    return template.prompts.join('\n\n') +
      '\n\nContext:\n' + JSON.stringify(context, null, 2);
  }

  private cleanContent(content: string): string {
    // Clean and format the generated content
    return content.trim();
  }

  private calculateConfidence(response: any): number {
    // Calculate confidence score for the generated content
    return 0.9; // Placeholder
  }

  private extractSuggestions(content: string): string[] {
    // Extract any suggestions from the generated content
    return [];
  }

  protected async initialize(): Promise<void> {
    // Verify templates are valid
    this.validateTemplates();
  }

  protected async cleanup(): Promise<void> {
    // No cleanup needed
  }

  protected async healthCheck(): Promise<boolean> {
    // Verify templates are still valid
    try {
      this.validateTemplates();
      return true;
    } catch {
      return false;
    }
  }

  private validateTemplates(): void {
    // Validate all templates
    for (const [type, template] of Object.entries(this.templates)) {
      if (template.sections.length < template.metadata.minSections) {
        throw new Error(`Template ${type} has too few sections`);
      }
      if (template.sections.length > template.metadata.maxSections) {
        throw new Error(`Template ${type} has too many sections`);
      }
      if (!template.sections.some(s => s.required)) {
        throw new Error(`Template ${type} has no required sections`);
      }
    }
  }
}