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
  Constraint
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
    const requirements = {
      functional: this.parseFunctionalRequirements(raw),
      technical: this.parseTechnicalRequirements(raw),
      design: this.parseDesignRequirements(raw)
    };

    // Analyze dependencies
    const dependencies = {
      internal: this.extractInternalDependencies(raw),
      external: this.extractExternalDependencies(raw),
      peer: []
    };

    // Determine structure
    const structure = {
      files: this.determineFileStructure(name, type),
      exports: this.determineExports(name, type),
      imports: this.determineImports(type)
    };

    // Extract validation
    const validation = {
      rules: this.extractValidationRules(raw),
      constraints: this.extractConstraints(raw)
    };

    // Calculate metadata
    const complexity = this.calculateComplexity(requirements, dependencies);
    const metadata = {
      priority: this.determinePriority(requirements, category),
      complexity,
      estimatedTime: this.estimateTime(complexity, type),
      tags: this.extractTags(raw, type)
    };

    return {
      id,
      name,
      description,
      type,
      category,
      requirements,
      dependencies,
      structure,
      validation,
      metadata
    };
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
