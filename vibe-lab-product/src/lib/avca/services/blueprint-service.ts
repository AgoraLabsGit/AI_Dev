/**
 * Blueprint Service
 * 
 * Handles the Blueprints stage of the AVCA pipeline:
 * - Converts user intent to structured blueprints
 * - Validates blueprint schema
 * - Manages blueprint templates
 * - Integrates with AI for generation
 */

import { BaseService } from './base-service';
import { PipelineStage, BlueprintRequirements, UserIntent } from '../types';
import { getModelForStage, calculateCost } from '../model-config';
import { tokenTracker } from '../token-tracking';
import { MonitorAVCA } from '../../monitoring/logic-monitor-integration';

export interface BlueprintRequest {
  requestId: string;
  userIntent: UserIntent;
  context?: any;
}

export interface BlueprintResponse {
  requestId: string;
  blueprint: BlueprintRequirements;
  tokensUsed: number;
  cost: number;
  duration: number;
}

export class BlueprintService extends BaseService {
  private templates: Map<string, any> = new Map();

  constructor() {
    super({
      name: 'blueprint-service',
      version: '1.0.0',
      stage: PipelineStage.BLUEPRINTS,
      dependencies: []
    });
  }

  /**
   * Initialize the service
   */
  protected async initialize(): Promise<void> {
    // Load blueprint templates
    this.loadTemplates();
    
    // Initialize AI client if needed
    // For now, we'll simulate AI responses
    
    this.log('info', 'Blueprint service initialized');
  }

  /**
   * Cleanup resources
   */
  protected async cleanup(): Promise<void> {
    this.templates.clear();
    this.log('info', 'Blueprint service cleaned up');
  }

  /**
   * Health check
   */
  protected async healthCheck(): Promise<boolean> {
    // Check if we can access templates
    // In production, would check AI service connectivity
    return this.templates.size > 0;
  }

  /**
   * Process a blueprint request
   */
  @MonitorAVCA('BLUEPRINT_SERVICE')
  async process(request: BlueprintRequest): Promise<BlueprintResponse> {
    const startTime = Date.now();
    
    try {
      this.log('info', `Processing blueprint request ${request.requestId}`);
      this.emitEvent('request', { requestId: request.requestId, stage: 'blueprints' });

      // Get model configuration
      const modelConfig = getModelForStage('blueprints');
      
      // Generate initial blueprint
      const rawBlueprint = await this.generateBlueprint(request.userIntent);
      
      // Validate blueprint
      const validationResult = await this.validateBlueprint(rawBlueprint);
      if (!validationResult.isValid) {
        throw new Error(`Blueprint validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Convert to AVCA format
      const blueprint = this.convertToAVCAFormat(rawBlueprint);
      
      // Track token usage and cost
      const duration = Date.now() - startTime;
      tokenTracker.track(
        request.requestId,
        PipelineStage.BLUEPRINTS,
        {
          model: modelConfig.model,
          promptTokens: rawBlueprint.tokenUsage.prompt,
          completionTokens: rawBlueprint.tokenUsage.completion,
          totalTokens: rawBlueprint.tokenUsage.total,
          cost: rawBlueprint.cost
        },
        duration
      );

      // Update metrics
      this.updateMetrics(duration, true);

      const response: BlueprintResponse = {
        requestId: request.requestId,
        blueprint,
        tokensUsed: rawBlueprint.tokenUsage.total,
        cost: rawBlueprint.cost,
        duration
      };

      this.emitEvent('response', response);
      this.log('info', `Blueprint generated in ${duration}ms, cost: $${rawBlueprint.cost.toFixed(4)}`);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, false);
      
      this.emitEvent('error', {
        requestId: request.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Generate blueprint from user intent using AI analysis
   */
  private async generateBlueprint(userIntent: UserIntent): Promise<BlueprintRequirements> {
    const startTime = Date.now();
    
    try {
      // Get AI client configuration for blueprint generation
      const modelConfig = getModelForStage('blueprints');
      const aiClient = this.getAIClient(modelConfig);

      // Analyze user intent and context
      const analysis = await aiClient.analyze({
        type: userIntent.classifiedIntent,
        content: userIntent.originalMessage,
        context: userIntent.context || {}
      });

      // Generate blueprint structure
      const blueprint = await aiClient.generateBlueprint({
        analysis,
        requirements: this.extractRequirements(userIntent),
        templates: Array.from(this.templates.values())
      });

      // Validate blueprint against schema
      const validationResult = await this.validateBlueprint(blueprint);
      if (!validationResult.isValid) {
        throw new Error(`Blueprint validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Track token usage and cost
      const duration = Date.now() - startTime;
      tokenTracker.track(
        userIntent.requestId,
        PipelineStage.BLUEPRINTS,
        {
          model: modelConfig.model,
          promptTokens: analysis.tokenUsage.prompt,
          completionTokens: analysis.tokenUsage.completion,
          totalTokens: analysis.tokenUsage.total,
          cost: analysis.cost
        },
        duration
      );

      return blueprint;

    } catch (error) {
      this.log('error', `Blueprint generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Extract requirements from user intent
   */
  private extractRequirements(userIntent: UserIntent): {
    functional: string[];
    technical: string[];
    design: string[];
  } {
    const requirements = {
      functional: [],
      technical: [],
      design: []
    };

    // Extract from original message
    const message = userIntent.originalMessage.toLowerCase();
    
    // Functional requirements
    if (message.includes('should') || message.includes('must') || message.includes('needs to')) {
      requirements.functional.push(userIntent.originalMessage);
    }

    // Technical requirements
    if (message.includes('performance') || message.includes('security') || message.includes('accessibility')) {
      requirements.technical.push('Must meet performance, security, and accessibility standards');
    }

    // Design requirements
    if (message.includes('design') || message.includes('style') || message.includes('look')) {
      requirements.design.push('Must follow Tailwind-only styling architecture');
    }

    // Add default requirements if none found
    if (requirements.functional.length === 0) {
      requirements.functional.push('Implement component based on user intent');
    }
    if (requirements.technical.length === 0) {
      requirements.technical.push('Follow project technical standards');
    }
    if (requirements.design.length === 0) {
      requirements.design.push('Use Tailwind utility classes for styling');
    }

    return requirements;
  }

  /**
   * Validate generated blueprint against schema
   */
  private async validateBlueprint(blueprint: any): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Basic structure validation
    if (!blueprint.id) errors.push('Missing blueprint ID');
    if (!blueprint.name) errors.push('Missing blueprint name');
    if (!blueprint.type) errors.push('Missing blueprint type');
    if (!blueprint.requirements) errors.push('Missing requirements');

    // Tailwind compliance check
    if (blueprint.designRequirements) {
      const hasCustomCSS = blueprint.designRequirements.some((req: any) => 
        req.styling && req.styling !== 'tailwind'
      );
      if (hasCustomCSS) {
        errors.push('Blueprint contains non-Tailwind styling approaches');
      }
    }

    // Component structure validation
    if (blueprint.components) {
      for (const component of blueprint.components) {
        if (!component.name) errors.push(`Component missing name: ${component.id}`);
        if (!component.type) errors.push(`Component missing type: ${component.id}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert blueprint to AVCA format
   */
  private convertToAVCAFormat(blueprint: any): ComponentBlueprint {
    // Map component type to AVCA atomic unit type
    const getAtomicType = (type: string): AtomicUnitType => {
      switch (type) {
        case 'UI_COMPONENT':
          return 'UI Components';
        case 'SERVICE':
        case 'HOOK':
          return 'Logic Modules';
        case 'API_ROUTE':
          return 'Integration Patterns';
        case 'LAYOUT':
          return 'Infrastructure';
        default:
          return 'UI Components';
      }
    };

    // Map requirements to AVCA format
    const mapRequirements = (reqs: any[]): {
      functional: FunctionalRequirement[];
      technical: TechnicalRequirement[];
      design: DesignRequirement[];
    } => {
      return {
        functional: reqs.functional.map((req: any) => ({
          id: req.id,
          description: req.description,
          acceptanceCriteria: [req.description],
          priority: req.priority || Priority.MEDIUM
        })),
        technical: reqs.technical.map((req: any) => ({
          id: req.id,
          category: req.category || 'COMPATIBILITY',
          specification: req.specification,
          mandatory: true
        })),
        design: reqs.design.map((req: any) => ({
          id: req.id || `design_${Date.now()}`,
          pattern: 'atomic',
          styling: 'tailwind',
          responsive: true,
          theme: true
        }))
      };
    };

    // Map dependencies
    const mapDependencies = (deps: any): {
      internal: InternalDependency[];
      external: ExternalDependency[];
      peer: PeerDependency[];
    } => {
      return {
        internal: deps.internal?.map((dep: any) => ({
          componentId: dep.id,
          type: 'COMPOSE',
          required: true
        })) || [],
        external: deps.external?.map((dep: any) => ({
          package: dep.name,
          version: dep.version || 'latest',
          type: 'PEER'
        })) || [],
        peer: []
      };
    };

    // Map file structure
    const mapFileStructure = (files: any[]): {
      files: FileStructure[];
      exports: ExportDefinition[];
      imports: ImportRequirement[];
    } => {
      return {
        files: files.map(f => ({
          path: f.path,
          type: f.type || 'COMPONENT'
        })),
        exports: [{
          name: blueprint.name,
          type: 'DEFAULT',
          description: `Main ${blueprint.type.toLowerCase()} export`
        }],
        imports: [{
          source: 'react',
          imports: ['React'],
          type: 'PACKAGE'
        }]
      };
    };

    // Convert to AVCA format
    return {
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.description,
      type: blueprint.type,
      category: blueprint.category || 'FEATURE',
      requirements: mapRequirements(blueprint.requirements),
      dependencies: mapDependencies(blueprint.dependencies || {}),
      structure: mapFileStructure(blueprint.structure?.files || []),
      validation: {
        rules: [],
        constraints: []
      },
      metadata: {
        priority: blueprint.priority || Priority.MEDIUM,
        complexity: blueprint.complexity || Complexity.MODERATE,
        estimatedTime: blueprint.estimatedTime || 60,
        tags: blueprint.tags || []
      },
      componentDetection: blueprint.componentDetection
    };
  }

  /**
   * Extract component requirements from description
   */
  private extractComponents(description: string): string[] {
    // Simple keyword extraction (in production, AI would do this)
    const componentKeywords = [
      'search', 'filter', 'sort', 'table', 'form', 
      'button', 'modal', 'card', 'list', 'navigation'
    ];

    const components: string[] = [];
    const lowerDesc = description.toLowerCase();

    for (const keyword of componentKeywords) {
      if (lowerDesc.includes(keyword)) {
        components.push(`${keyword}-component`);
      }
    }

    return components.length > 0 ? components : ['generic-component'];
  }

  /**
   * Load blueprint templates
   */
  private loadTemplates(): void {
    // Feature blueprint template
    this.templates.set('feature-blueprint', {
      projectContext: {
        name: 'vibe-lab',
        type: 'web-app',
        framework: 'nextjs',
        language: 'typescript'
      },
      technicalRequirements: {
        framework: 'Next.js 14',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        stateManagement: 'React Context',
        testing: 'Jest + React Testing Library'
      },
      architecturalGuidelines: {
        componentStructure: 'atomic',
        statePattern: 'hooks',
        apiPattern: 'rest',
        errorHandling: 'boundary'
      },
      performanceTargets: {
        loadTime: '<3s',
        bundleSize: '<500KB',
        lighthouse: '>90'
      },
      securityRequirements: {
        authentication: 'required',
        authorization: 'role-based',
        dataEncryption: 'in-transit',
        apiSecurity: 'jwt'
      }
    });

    // Bugfix blueprint template
    this.templates.set('bugfix-blueprint', {
      projectContext: {
        name: 'vibe-lab',
        type: 'web-app',
        framework: 'nextjs',
        language: 'typescript'
      },
      technicalRequirements: {
        testCoverage: 'required',
        regression: 'prevented',
        documentation: 'updated'
      },
      architecturalGuidelines: {
        minimalChange: true,
        backwardCompatible: true
      },
      performanceTargets: {
        noRegression: true
      },
      securityRequirements: {
        vulnerabilityCheck: 'required'
      }
    });

    this.log('info', `Loaded ${this.templates.size} blueprint templates`);
  }
} 