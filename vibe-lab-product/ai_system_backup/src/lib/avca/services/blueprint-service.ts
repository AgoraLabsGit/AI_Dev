/**
 * Blueprint Service
 * 
 * Handles the Blueprints stage of the AVCA pipeline:
 * - Converts user intent to structured blueprints
 * - Validates blueprint schema
 * - Manages blueprint templates
 * - Integrates with AI for generation
 */

import { BaseService, ServiceConfig } from './base-service';
import { 
  PipelineStage, 
  BlueprintRequirements, 
  UserIntent,
  ComponentBlueprint,
  AtomicUnitType,
  FunctionalRequirement,
  TechnicalRequirement,
  DesignRequirement,
  InternalDependency,
  ExternalDependency,
  PeerDependency,
  FileStructure,
  ExportDefinition,
  ImportRequirement,
  Priority,
  Complexity
} from '../types';
import { getModelForStage, calculateCost } from '../model-config';
import { QualityOrchestrator, QualityOrchestrationConfig } from '@/lib/dias/services/quality-orchestrator';
import { tokenTracker } from '../token-tracking';
import { MonitorAVCA } from '../../monitoring/logic-monitor-integration';
import { AIClient } from './ai-client';
import { EventBus } from './event-bus';

export interface BlueprintRequest {
  requestId: string;
  userIntent: UserIntent;
  context?: any;
}

export interface BlueprintResponse {
  requestId: string;
  blueprint: ComponentBlueprint;
  tokensUsed: number;
  cost: number;
  duration: number;
}

export class BlueprintService extends BaseService {
  private templates: Map<string, any> = new Map();
  private aiClient: AIClient;

  constructor(config: ServiceConfig) {
    super(config);
    this.aiClient = new AIClient(config);
  }

  /**
   * Initialize the service
   */
  protected async initialize(): Promise<void> {
    // Load blueprint templates
    this.loadTemplates();
    
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
  protected async healthCheck(): Promise<{ status: string; details: any; }> {
    const isHealthy = this.templates.size > 0;
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      details: {
        templateCount: this.templates.size,
        aiClientStatus: await this.aiClient.healthCheck()
      }
    };
  }
  
  private getAIClient(config: any): AIClient {
      return this.aiClient;
  }

  /**
   * Process a blueprint request
   */
  async process(request: BlueprintRequest): Promise<BlueprintResponse> {
    const startTime = Date.now();
    
    try {
      this.log('info', `Processing blueprint request ${request.requestId}`);
      this.emitEvent('blueprint:generation:start', { requestId: request.requestId, stage: 'blueprints' });

      // Get model configuration
      const modelConfig = getModelForStage('blueprints');
      
      // Generate initial blueprint
      const rawBlueprint: any = await this.generateBlueprint(request.userIntent);
      
      // Validate blueprint
      const validationResult = await this.validateBlueprint(rawBlueprint);
      if (!validationResult.isValid) {
        throw new Error(`Blueprint validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Convert to AVCA format
      const blueprint = this.convertToAVCAFormat(rawBlueprint);
      
      // Track token usage and cost
      const duration = Date.now() - startTime;
      const tokens = rawBlueprint.tokenUsage?.total || 0;
      const cost = rawBlueprint.cost || 0;
      
      tokenTracker.track(
        request.requestId,
        PipelineStage.BLUEPRINTS,
        {
          model: modelConfig.model,
          promptTokens: rawBlueprint.tokenUsage?.prompt || 0,
          completionTokens: rawBlueprint.tokenUsage?.completion || 0,
          totalTokens: tokens,
          cost: cost
        },
        duration
      );

      // Update metrics
      this.updateMetrics({ duration, success: true, tokens, cost });

      const response: BlueprintResponse = {
        requestId: request.requestId,
        blueprint,
        tokensUsed: tokens,
        cost: cost,
        duration
      };

      this.emitEvent('blueprint:generation:complete', response);
      this.log('info', `Blueprint generated in ${duration}ms, cost: $${cost.toFixed(4)}`);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateMetrics({ duration, success: false });
      
      this.emitEvent('blueprint:generation:error', {
        requestId: request.requestId,
        error: errorMessage
      });
      
      this.log('error', `Blueprint request ${request.requestId} failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Generate blueprint from user intent using AI analysis
   */
  private async generateBlueprint(userIntent: UserIntent): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Get AI client configuration for blueprint generation
      const modelConfig = getModelForStage('blueprints');
      const aiClient = this.getAIClient(modelConfig);

      // Analyze user intent and context
      const analysis = await aiClient.process({
        action: 'analyze',
        payload: {
          type: userIntent.classifiedIntent,
          content: userIntent.originalMessage,
          context: userIntent.context || {}
        }
      });

      // Generate blueprint structure
      const blueprint = await aiClient.process({
        action: 'generateBlueprint',
        payload: {
          analysis,
          requirements: this.extractRequirements(userIntent),
          templates: Array.from(this.templates.values())
        }
      });

      // Validate blueprint against schema
      const validationResult = await this.validateBlueprint(blueprint.data);
      if (!validationResult.isValid) {
        throw new Error(`Blueprint validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Track token usage and cost
      const duration = Date.now() - startTime;
      const totalTokens = (analysis.data.tokenUsage?.total || 0) + (blueprint.data.tokenUsage?.total || 0);
      const totalCost = (analysis.data.cost || 0) + (blueprint.data.cost || 0);

      tokenTracker.track(
        userIntent.requestId,
        PipelineStage.BLUEPRINTS,
        {
          model: modelConfig.model,
          promptTokens: (analysis.data.tokenUsage?.prompt || 0) + (blueprint.data.tokenUsage?.prompt || 0),
          completionTokens: (analysis.data.tokenUsage?.completion || 0) + (blueprint.data.tokenUsage?.completion || 0),
          totalTokens: totalTokens,
          cost: totalCost
        },
        duration
      );

      return blueprint.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', `Blueprint generation failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Extract requirements from user intent
   */
  private extractRequirements(userIntent: UserIntent): {
    functional: any[];
    technical: any[];
    design: any[];
  } {
    const requirements: { functional: any[], technical: any[], design: any[] } = {
      functional: [],
      technical: [],
      design: []
    };

    // Extract from original message
    const message = userIntent.originalMessage.toLowerCase();
    
    // Functional requirements
    if (message.includes('should') || message.includes('must') || message.includes('needs to')) {
      requirements.functional.push({ id: 'func-1', description: userIntent.originalMessage });
    }

    // Technical requirements
    if (message.includes('performance') || message.includes('security') || message.includes('accessibility')) {
      requirements.technical.push({ id: 'tech-1', specification: 'Must meet performance, security, and accessibility standards' });
    }

    // Design requirements
    if (message.includes('design') || message.includes('style') || message.includes('look')) {
      requirements.design.push({ id: 'design-1', styling: 'tailwind' });
    }

    // Add default requirements if none found
    if (requirements.functional.length === 0) {
      requirements.functional.push({ id: 'func-default', description: 'Implement component based on user intent' });
    }
    if (requirements.technical.length === 0) {
      requirements.technical.push({ id: 'tech-default', specification: 'Follow project technical standards' });
    }
    if (requirements.design.length === 0) {
      requirements.design.push({ id: 'design-default', styling: 'tailwind' });
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
    if (blueprint.requirements?.design) {
      const hasCustomCSS = blueprint.requirements.design.some((req: any) => 
        req.styling && req.styling !== 'tailwind'
      );
      if (hasCustomCSS) {
        errors.push('Blueprint contains non-Tailwind styling approaches');
      }
    }

    // Component structure validation
    if (blueprint.components) {
      for (const component of blueprint.components) {
        if (!component.name) errors.push(`Component missing name: ${JSON.stringify(component)}`);
        if (!component.type) errors.push(`Component missing type: ${JSON.stringify(component)}`);
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
    const mapRequirements = (reqs: any = { functional: [], technical: [], design: [] }): {
      functional: FunctionalRequirement[];
      technical: TechnicalRequirement[];
      design: DesignRequirement[];
    } => {
      return {
        functional: (reqs.functional || []).map((req: any, index: number) => ({
          id: req.id || `func-${index}`,
          description: req.description,
          acceptanceCriteria: [req.description],
          priority: req.priority || Priority.MEDIUM
        })),
        technical: (reqs.technical || []).map((req: any, index: number) => ({
          id: req.id || `tech-${index}`,
          category: req.category || 'COMPATIBILITY',
          specification: req.specification,
          mandatory: true
        })),
        design: (reqs.design || []).map((req: any, index: number) => ({
          id: req.id || `design-${index}`,
          pattern: 'atomic',
          styling: 'tailwind',
          responsive: true,
          theme: true
        }))
      };
    };

    // Map dependencies
    const mapDependencies = (deps: any = {}): {
      internal: InternalDependency[];
      external: ExternalDependency[];
      peer: PeerDependency[];
    } => {
      return {
        internal: (deps.internal || []).map((dep: any) => ({
          componentId: dep.id,
          type: 'COMPOSE',
          required: true
        })),
        external: (deps.external || []).map((dep: any) => ({
          package: dep.name,
          version: dep.version || 'latest',
          type: 'PEER'
        })),
        peer: []
      };
    };

    // Map file structure
    const mapFileStructure = (files: any[] = []): {
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
      type: getAtomicType(blueprint.type),
      category: blueprint.category || 'FEATURE',
      requirements: mapRequirements(blueprint.requirements),
      dependencies: mapDependencies(blueprint.dependencies),
      structure: mapFileStructure(blueprint.structure?.files),
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
      componentDetection: blueprint.componentDetection || []
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

  /**
   * Generate blueprint with integrated quality assurance setup
   * This ensures every Vibe Lab project has quality controls from day one
   */
  async generateProjectWithQuality(
    intent: UserIntent,
    projectRoot: string,
    includeQualitySetup: boolean = true
  ): Promise<ComponentBlueprint & { qualitySetup?: any }> {
    this.log('info', 'Generating project blueprint with integrated quality assurance');

    // Generate the base blueprint
    const blueprint = await this.process(intent);

    if (includeQualitySetup) {
      // Add quality assurance files to the blueprint structure
      const qualityFiles = [
        {
          path: 'scripts/vibe-lab-quality-setup.js',
          type: 'SCRIPT' as const,
          content: 'Quality setup automation script'
        },
        {
          path: '.husky/pre-commit',
          type: 'CONFIG' as const,
          content: 'Pre-commit quality checks'
        },
        {
          path: '.github/workflows/quality-check.yml',
          type: 'CONFIG' as const,
          content: 'CI/CD quality validation'
        },
        {
          path: 'reports/quality/.gitkeep',
          type: 'CONFIG' as const,
          content: 'Quality reports directory'
        }
      ];

      // Add quality setup files to blueprint structure
      if (blueprint.structure?.files) {
        blueprint.structure.files.push(...qualityFiles);
      }

      // Add quality-specific requirements
      const qualityRequirements: FunctionalRequirement[] = [
        {
          id: 'quality-typescript-checking',
          description: 'Automated TypeScript error detection and prevention',
          priority: Priority.HIGH,
          category: 'QUALITY',
          acceptanceCriteria: [
            'TypeScript compilation must pass without errors',
            'Type checking runs automatically on file changes',
            'Pre-commit hooks prevent committing with type errors'
          ],
          dependencies: [],
          validation: {
            rules: ['typescript-check'],
            testable: true
          }
        },
        {
          id: 'quality-linting',
          description: 'Automated code style and quality enforcement',
          priority: Priority.HIGH,
          category: 'QUALITY',
          acceptanceCriteria: [
            'ESLint rules enforced automatically',
            'Code formatting standardized',
            'Import organization optimized'
          ],
          dependencies: [],
          validation: {
            rules: ['eslint-check'],
            testable: true
          }
        },
        {
          id: 'quality-testing',
          description: 'Automated test coverage and quality monitoring',
          priority: Priority.MEDIUM,
          category: 'QUALITY',
          acceptanceCriteria: [
            'Minimum 80% test coverage maintained',
            'Tests run automatically on changes',
            'Coverage reports generated'
          ],
          dependencies: [],
          validation: {
            rules: ['test-coverage'],
            testable: true
          }
        },
        {
          id: 'quality-security',
          description: 'Automated security vulnerability monitoring',
          priority: Priority.HIGH,
          category: 'SECURITY',
          acceptanceCriteria: [
            'Dependency vulnerabilities detected automatically',
            'Security audits run on CI/CD',
            'Zero high/critical vulnerabilities allowed'
          ],
          dependencies: [],
          validation: {
            rules: ['security-audit'],
            testable: true
          }
        }
      ];

      // Add quality requirements to blueprint
      if (blueprint.requirements?.functional) {
        blueprint.requirements.functional.push(...qualityRequirements);
      }

      // Add quality setup metadata
      const qualitySetup = {
        enabled: true,
        tools: [
          'typescript-checking',
          'eslint-linting', 
          'jest-testing',
          'husky-git-hooks',
          'github-actions-ci'
        ],
        thresholds: {
          typeScriptScore: 90,
          lintErrors: 0,
          testCoverage: 80,
          vulnerabilities: 0
        },
        automation: {
          preCommitChecks: true,
          ciValidation: true,
          autoReporting: true,
          alerting: false
        }
      };

      return {
        ...blueprint,
        qualitySetup
      };
    }

    return blueprint;
  }

  /**
   * Generate quality orchestrator configuration for a project
   */
  generateQualityConfig(projectRoot: string): QualityOrchestrationConfig {
    return {
      name: 'quality-orchestrator',
      version: '1.0.0',
      projectRoot,
      autoRemediation: false, // Start conservative
      qualityGates: {
        preCommit: true,
        preBuild: true,
        preDeployment: true
      },
      alerting: {
        // Configure based on project needs
      }
    };
  }
} 