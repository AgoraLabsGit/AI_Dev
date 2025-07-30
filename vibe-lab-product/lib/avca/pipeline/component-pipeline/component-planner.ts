/**
 * Component Planner - Stage 2 of Component Pipeline
 * 
 * Plans component implementation based on parsed blueprints
 */

import { BaseService } from '../../services/base-service';
import { EventBus } from '../../services/event-bus';
import { EventFactory, EventCategory, PipelineEventType } from '../../../dias/events/event-types';
import {
  ComponentBlueprint,
  ComponentPlan,
  PlannedFile,
  InterfaceDefinition,
  PropertyDefinition,
  MethodDefinition,
  EventDefinition,
  TestCase,
  TestScenario,
  ComponentType,
  FileStructure
} from './types';

export interface PlannerConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
}

export class ComponentPlanner extends BaseService {
  private eventBus?: EventBus;

  constructor(config: PlannerConfig = {}) {
    super({
      name: config.name || 'component-planner',
      version: config.version || '1.0.0',
      dependencies: []
    });
    this.eventBus = config.eventBus;
  }

  protected async initialize(): Promise<void> {
    this.log('info', 'Component planner initialized');
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'Component planner cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Main processing method - creates implementation plan from blueprint
   */
  async process(blueprint: ComponentBlueprint): Promise<ComponentPlan> {
    const startTime = Date.now();
    
    try {
      // Emit start event
      await this.emitPipelineEvent(PipelineEventType.STAGE_STARTED, blueprint.id, {
        stage: 'component-planning',
        componentType: blueprint.type
      });

      // Create the plan
      const plan = await this.createPlan(blueprint);

      // Emit completion event
      const duration = Date.now() - startTime;
      await this.emitPipelineEvent(PipelineEventType.STAGE_COMPLETED, blueprint.id, {
        stage: 'component-planning',
        duration,
        fileCount: plan.fileStructure.files.length,
        testCount: plan.testPlan.unitTests.length + plan.testPlan.integrationTests.length
      });

      this.log('info', `Component plan created in ${duration}ms`);
      return plan;

    } catch (error) {
      await this.emitPipelineEvent(PipelineEventType.STAGE_FAILED, blueprint.id, {
        stage: 'component-planning',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Create implementation plan from blueprint
   */
  private async createPlan(blueprint: ComponentBlueprint): Promise<ComponentPlan> {
    // Determine implementation approach
    const implementation = this.determineImplementation(blueprint);
    
    // Plan file structure
    const fileStructure = this.planFileStructure(blueprint);
    
    // Design interfaces
    const interfaces = this.designInterfaces(blueprint);
    
    // Create test plan
    const testPlan = this.createTestPlan(blueprint);

    return {
      blueprint,
      implementation,
      fileStructure,
      interfaces,
      testPlan
    };
  }

  /**
   * Determine implementation approach based on component type and requirements
   */
  private determineImplementation(blueprint: ComponentBlueprint): ComponentPlan['implementation'] {
    const { type, requirements } = blueprint;
    
    // Determine architecture
    let architecture: 'functional' | 'class' | 'mixed' = 'functional';
    if (type === ComponentType.SERVICE || requirements.technical.some(r => r.specification.includes('class'))) {
      architecture = 'class';
    }
    
    // Determine patterns
    const patterns: string[] = [];
    
    // Add patterns based on type
    switch (type) {
      case ComponentType.UI_COMPONENT:
        patterns.push('compound-component', 'render-props');
        if (requirements.functional.length > 3) {
          patterns.push('custom-hooks');
        }
        break;
      case ComponentType.SERVICE:
        patterns.push('singleton', 'dependency-injection');
        break;
      case ComponentType.HOOK:
        patterns.push('custom-hook', 'state-management');
        break;
      case ComponentType.LAYOUT:
        patterns.push('composition', 'slot-pattern');
        break;
    }

    // Add patterns based on requirements
    if (requirements.design.some(r => r.pattern === 'atomic')) {
      patterns.push('atomic-design');
    }
    if (requirements.technical.some(r => r.category === 'PERFORMANCE' || r.specification.toLowerCase().includes('performance'))) {
      patterns.push('memoization', 'lazy-loading');
    }

    return {
      approach: this.generateApproach(blueprint),
      patterns,
      architecture
    };
  }

  /**
   * Plan detailed file structure
   */
  private planFileStructure(blueprint: ComponentBlueprint): ComponentPlan['fileStructure'] {
    const { name, type, structure } = blueprint;
    const rootPath = this.determineRootPath(type, name);
    
    const files: PlannedFile[] = structure.files.map(file => {
      // Handle test file path
      let filePath = file.path;
      if (file.type === 'TEST' && filePath.includes('__tests__/')) {
        filePath = filePath.replace('__tests__/', '');
        filePath = `__tests__/${filePath}`;
      }
      
      const plannedFile: PlannedFile = {
        path: `${rootPath}/${filePath}`,
        type: file.type,
        purpose: this.getFilePurpose(file),
        dependencies: this.getFileDependencies(file, blueprint),
        exports: this.getFileExports(file, blueprint),
        estimatedLines: this.estimateFileSize(file, blueprint)
      };
      
      return plannedFile;
    });

    // Add index file if needed
    if (files.length > 1 && !files.some(f => f.path.endsWith('index.ts'))) {
      files.push({
        path: `${rootPath}/index.ts`,
        type: 'UTIL',
        purpose: 'Re-export main component and types',
        dependencies: [`./${name}`],
        exports: [name, `${name}Props`],
        estimatedLines: 10
      });
    }

    return { rootPath, files };
  }

  /**
   * Design component interfaces
   */
  private designInterfaces(blueprint: ComponentBlueprint): ComponentPlan['interfaces'] {
    const { name, type, requirements } = blueprint;
    const interfaces: ComponentPlan['interfaces'] = {};

    // Props interface for UI components
    if (type === ComponentType.UI_COMPONENT || type === ComponentType.LAYOUT) {
      interfaces.props = this.createPropsInterface(blueprint);
    }

    // State interface if component has state
    if (this.hasState(blueprint)) {
      interfaces.state = this.createStateInterface(blueprint);
    }

    // Context interface if needed
    if (this.needsContext(blueprint)) {
      interfaces.context = this.createContextInterface(blueprint);
    }

    // Event definitions
    const events = this.extractEvents(blueprint);
    if (events.length > 0) {
      interfaces.events = events;
    }

    return interfaces;
  }

  /**
   * Create test plan
   */
  private createTestPlan(blueprint: ComponentBlueprint): ComponentPlan['testPlan'] {
    const unitTests: TestCase[] = [];
    const integrationTests: TestCase[] = [];
    const scenarios: TestScenario[] = [];

    // Unit tests for each requirement
    blueprint.requirements.functional.forEach((req, index) => {
      unitTests.push({
        name: `should ${req.description.toLowerCase()}`,
        type: 'unit',
        description: `Test that component ${req.description.toLowerCase()}`,
        assertions: req.acceptanceCriteria
      });
    });

    // Integration tests for dependencies
    if (blueprint.dependencies.internal.length > 0) {
      integrationTests.push({
        name: 'should integrate with dependent components',
        type: 'integration',
        description: 'Test component integration with internal dependencies',
        assertions: [
          'All dependent components render correctly',
          'Data flows properly between components',
          'No console errors or warnings'
        ]
      });
    }

    // Test scenarios based on component type
    scenarios.push(...this.generateTestScenarios(blueprint));

    return { unitTests, integrationTests, scenarios };
  }

  // Helper methods

  private generateApproach(blueprint: ComponentBlueprint): string {
    const { type, requirements } = blueprint;
    const parts: string[] = [];

    // Base approach
    parts.push(`Create a ${type.toLowerCase().replace('_', ' ')}`);
    
    // Add key features
    if (requirements.functional.length > 0) {
      parts.push(`that ${requirements.functional[0].description.toLowerCase()}`);
    }

    // Add technical considerations
    if (requirements.technical.some(r => r.category === 'PERFORMANCE')) {
      parts.push('with performance optimization');
    }
    if (requirements.design.some(r => r.responsive)) {
      parts.push('with responsive design');
    }

    return parts.join(' ');
  }

  private determineRootPath(type: ComponentType, name: string): string {
    const basePaths = {
      [ComponentType.UI_COMPONENT]: 'src/components',
      [ComponentType.SERVICE]: 'src/services',
      [ComponentType.HOOK]: 'src/hooks',
      [ComponentType.UTILITY]: 'src/utils',
      [ComponentType.LAYOUT]: 'src/layouts',
      [ComponentType.PAGE]: 'src/pages',
      [ComponentType.API_ROUTE]: 'src/api'
    };

    return `${basePaths[type]}/${name}`;
  }

  private getFilePurpose(file: FileStructure): string {
    const purposes = {
      'COMPONENT': 'Main component implementation',
      'TEST': 'Unit and integration tests',
      'STORY': 'Storybook stories for component development',
      'STYLE': 'Component-specific styles',
      'TYPE': 'TypeScript type definitions',
      'UTIL': 'Helper functions and utilities'
    };

    return purposes[file.type] || 'Supporting file';
  }

  private getFileDependencies(file: FileStructure, blueprint: ComponentBlueprint): string[] {
    const deps: string[] = [];

    if (file.type === 'COMPONENT') {
      // React for components
      if (blueprint.type !== ComponentType.UTILITY && blueprint.type !== ComponentType.API_ROUTE) {
        deps.push('react');
      }
      
      // Internal dependencies
      blueprint.dependencies.internal.forEach(dep => {
        deps.push(`@/components/${dep.componentId}`);
      });
    }

    if (file.type === 'TEST') {
      deps.push('@testing-library/react', 'jest');
      deps.push(`./${blueprint.name}`);
    }

    if (file.type === 'STORY') {
      deps.push('@storybook/react');
      deps.push(`./${blueprint.name}`);
    }

    return deps;
  }

  private getFileExports(file: FileStructure, blueprint: ComponentBlueprint): string[] {
    const exports: string[] = [];

    if (file.type === 'COMPONENT') {
      exports.push(blueprint.name);
      if (blueprint.type === ComponentType.UI_COMPONENT) {
        exports.push(`${blueprint.name}Props`);
      }
    }

    if (file.type === 'TYPE') {
      exports.push(`${blueprint.name}Props`, `${blueprint.name}State`);
    }

    return exports;
  }

  private estimateFileSize(file: FileStructure, blueprint: ComponentBlueprint): number {
    const baseSizes = {
      'COMPONENT': 100,
      'TEST': 150,
      'STORY': 80,
      'STYLE': 50,
      'TYPE': 30,
      'UTIL': 40
    };

    let size = baseSizes[file.type] || 50;

    // Adjust based on complexity
    const complexityMultiplier = {
      'SIMPLE': 0.5,
      'MODERATE': 1.0,
      'COMPLEX': 1.5,
      'VERY_COMPLEX': 2.0
    };

    size *= complexityMultiplier[blueprint.metadata.complexity];

    // Add for requirements
    size += blueprint.requirements.functional.length * 10;
    size += blueprint.requirements.technical.length * 5;

    return Math.round(size);
  }

  private createPropsInterface(blueprint: ComponentBlueprint): InterfaceDefinition {
    const properties: PropertyDefinition[] = [];

    // Add basic props
    properties.push({
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS classes'
    });

    // Add props based on requirements
    let hasData = false;
    let hasOnSelect = false;
    
    blueprint.requirements.functional.forEach((req, index) => {
      if (!hasData && (req.description.toLowerCase().includes('display') || req.description.toLowerCase().includes('show'))) {
        properties.push({
          name: 'data',
          type: 'any[]',
          required: true,
          description: 'Data to display'
        });
        hasData = true;
      }
      
      if (!hasOnSelect && (req.description.toLowerCase().includes('click') || req.description.toLowerCase().includes('select'))) {
        properties.push({
          name: 'onSelect',
          type: '(item: any) => void',
          required: false,
          description: 'Selection handler'
        });
        hasOnSelect = true;
      }
    });

    // Add children for layouts
    if (blueprint.type === ComponentType.LAYOUT) {
      properties.push({
        name: 'children',
        type: 'React.ReactNode',
        required: true,
        description: 'Child components'
      });
    }

    return {
      name: `${blueprint.name}Props`,
      properties
    };
  }

  private createStateInterface(blueprint: ComponentBlueprint): InterfaceDefinition {
    const properties: PropertyDefinition[] = [];

    // Add state based on requirements
    if (blueprint.requirements.functional.some(r => r.description.includes('filter'))) {
      properties.push({
        name: 'filters',
        type: 'Record<string, any>',
        required: true,
        default: {},
        description: 'Active filters'
      });
    }

    if (blueprint.requirements.functional.some(r => r.description.includes('sort'))) {
      properties.push({
        name: 'sortBy',
        type: 'string',
        required: false,
        description: 'Current sort field'
      });
      properties.push({
        name: 'sortOrder',
        type: "'asc' | 'desc'",
        required: false,
        default: 'asc',
        description: 'Sort direction'
      });
    }

    return {
      name: `${blueprint.name}State`,
      properties
    };
  }

  private createContextInterface(blueprint: ComponentBlueprint): InterfaceDefinition {
    return {
      name: `${blueprint.name}Context`,
      properties: [
        {
          name: 'state',
          type: `${blueprint.name}State`,
          required: true,
          description: 'Component state'
        },
        {
          name: 'actions',
          type: 'Record<string, Function>',
          required: true,
          description: 'State actions'
        }
      ]
    };
  }

  private hasState(blueprint: ComponentBlueprint): boolean {
    return blueprint.requirements.functional.some(r => 
      r.description.includes('filter') ||
      r.description.includes('sort') ||
      r.description.includes('select') ||
      r.description.includes('toggle')
    );
  }

  private needsContext(blueprint: ComponentBlueprint): boolean {
    return blueprint.dependencies.peer.some(p => p.communication === 'CONTEXT') ||
           blueprint.metadata.complexity === 'COMPLEX' ||
           blueprint.metadata.complexity === 'VERY_COMPLEX';
  }

  private extractEvents(blueprint: ComponentBlueprint): EventDefinition[] {
    const events: EventDefinition[] = [];

    blueprint.requirements.functional.forEach(req => {
      if (req.description.includes('click')) {
        events.push({
          name: 'onClick',
          payload: {
            name: 'ClickPayload',
            properties: [
              { name: 'target', type: 'HTMLElement', required: true }
            ]
          },
          description: 'Click event'
        });
      }

      if (req.description.includes('change')) {
        events.push({
          name: 'onChange',
          payload: {
            name: 'ChangePayload',
            properties: [
              { name: 'value', type: 'any', required: true },
              { name: 'previousValue', type: 'any', required: false }
            ]
          },
          description: 'Change event'
        });
      }
    });

    return events;
  }

  private generateTestScenarios(blueprint: ComponentBlueprint): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // Basic rendering scenario
    scenarios.push({
      name: 'Basic Rendering',
      steps: [
        'Render component with default props',
        'Verify component appears in DOM',
        'Check for accessibility violations'
      ],
      expectedResults: [
        'Component renders without errors',
        'All required elements are present',
        'No accessibility issues detected'
      ]
    });

    // User interaction scenario
    if (this.hasUserInteraction(blueprint)) {
      scenarios.push({
        name: 'User Interaction Flow',
        steps: [
          'Render component with interactive elements',
          'Simulate user interactions',
          'Verify state changes',
          'Check event handlers called'
        ],
        expectedResults: [
          'Interactions work as expected',
          'State updates correctly',
          'Events fired with correct data',
          'UI reflects state changes'
        ]
      });
    }

    return scenarios;
  }

  private hasUserInteraction(blueprint: ComponentBlueprint): boolean {
    const desc = blueprint.requirements.functional.map(r => r.description.toLowerCase());
    return desc.some(d =>
      d.includes('click') ||
      d.includes('interact') ||
      d.includes('select') ||
      d.includes('input') ||
      d.includes('add') ||
      d.includes('delete') ||
      d.includes('mark')
    );
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
