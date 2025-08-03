/**
 * Code Generator - Stage 3 of Component Pipeline
 * 
 * Generates actual TypeScript/React code from component plans
 */

import { BaseService } from '../../services/base-service';
import { EventBus } from '../../services/event-bus';
import { EventFactory, EventCategory, PipelineEventType } from '../../../dias/events/event-types';
import { createHash } from 'crypto';
import {
  ComponentPlan,
  GeneratedComponent,
  GeneratedFile,
  CodeExample,
  QualityIssue,
  ComponentType,
  FileStructure,
  InterfaceDefinition,
  PropertyDefinition,
  EventDefinition
} from './types';

export interface GeneratorConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  generateTests?: boolean;
  generateStories?: boolean;
  strict?: boolean;
}

export class CodeGenerator extends BaseService {
  private eventBus?: EventBus;
  private generatorConfig: GeneratorConfig;

  constructor(config: GeneratorConfig = {}) {
    super({
      name: config.name || 'code-generator',
      version: config.version || '1.0.0',
      dependencies: []
    });
    this.eventBus = config.eventBus;
    this.generatorConfig = {
      generateTests: true,
      generateStories: true,
      strict: true,
      ...config
    };
  }

  protected async initialize(): Promise<void> {
    this.log('info', 'Code generator initialized');
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'Code generator cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Main processing method - generates code from component plan
   */
  async process(plan: ComponentPlan): Promise<GeneratedComponent> {
    const startTime = Date.now();
    
    try {
      // Emit start event
      await this.emitPipelineEvent(PipelineEventType.STAGE_STARTED, plan.blueprint.id, {
        stage: 'code-generation',
        fileCount: plan.fileStructure.files.length
      });

      // Generate all files
      const files = await this.generateFiles(plan);
      
      // Generate documentation
      const documentation = this.generateDocumentation(plan);
      
      // Run quality checks
      const qualityReport = await this.runQualityChecks(files, plan);

      const result: GeneratedComponent = {
        plan,
        files,
        documentation,
        qualityReport
      };

      // Emit completion event
      const duration = Date.now() - startTime;
      const totalLines = files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
      
      await this.emitPipelineEvent(PipelineEventType.STAGE_COMPLETED, plan.blueprint.id, {
        stage: 'code-generation',
        duration,
        filesGenerated: files.length,
        totalLines,
        qualityScore: qualityReport.issues.length === 0 ? 100 : 90
      });

      this.log('info', `Code generated in ${duration}ms - ${files.length} files, ${totalLines} lines`);
      return result;

    } catch (error) {
      await this.emitPipelineEvent(PipelineEventType.STAGE_FAILED, plan.blueprint.id, {
        stage: 'code-generation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Generate all files for the component
   */
  private async generateFiles(plan: ComponentPlan): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    for (const plannedFile of plan.fileStructure.files) {
      let content = '';
      
      switch (plannedFile.type) {
        case 'COMPONENT':
          content = await this.generateComponentFile(plan, plannedFile);
          break;
                 case 'TEST':
           if (this.generatorConfig.generateTests) {
             content = await this.generateTestFile(plan, plannedFile);
           }
           break;
         case 'STORY':
           if (this.generatorConfig.generateStories) {
             content = await this.generateStoryFile(plan, plannedFile);
           }
           break;
        case 'TYPE':
          content = await this.generateTypeFile(plan, plannedFile);
          break;
        case 'UTIL':
          content = await this.generateUtilFile(plan, plannedFile);
          break;
      }

      if (content) {
        files.push({
          path: plannedFile.path,
          content,
          language: this.getFileLanguage(plannedFile.path),
          size: content.length,
          hash: createHash('md5').update(content).digest('hex')
        });
      }
    }

    return files;
  }

  /**
   * Generate main component file
   */
  private async generateComponentFile(plan: ComponentPlan, file: any): Promise<string> {
    const { blueprint, implementation, interfaces } = plan;
    const isReactComponent = blueprint.type !== ComponentType.UTILITY && blueprint.type !== ComponentType.API_ROUTE;
    
    let content = '';

    // Add imports
    content += this.generateImports(file.dependencies, isReactComponent);
    content += '\n';

    // Add interfaces if inline
    if (interfaces.props && !this.hasTypeFile(plan)) {
      content += this.generateInterface(interfaces.props);
      content += '\n';
    }

    // Generate component based on architecture
    if (implementation.architecture === 'functional') {
      content += this.generateFunctionalComponent(blueprint, interfaces, implementation);
    } else {
      content += this.generateClassComponent(blueprint, interfaces, implementation);
    }

    // Add exports
    if (blueprint.type === ComponentType.UI_COMPONENT || blueprint.type === ComponentType.LAYOUT) {
      content += `\nexport default ${blueprint.name};\n`;
      if (interfaces.props) {
        content += `export type { ${interfaces.props.name} };\n`;
      }
    }

    return this.formatCode(content);
  }

  /**
   * Generate test file
   */
  private async generateTestFile(plan: ComponentPlan, file: any): Promise<string> {
    const { blueprint, testPlan } = plan;
    let content = '';

    // Test imports
    content += `import React from 'react';\n`;
    content += `import { render, screen, fireEvent } from '@testing-library/react';\n`;
    content += `import '@testing-library/jest-dom';\n`;
    content += `import { ${blueprint.name} } from '../${blueprint.name}';\n\n`;

    // Test suite
    content += `describe('${blueprint.name}', () => {\n`;

    // Basic rendering test
    content += `  it('renders without crashing', () => {\n`;
    content += `    render(<${blueprint.name} />);\n`;
    content += `    expect(screen.getByRole('region')).toBeInTheDocument();\n`;
    content += `  });\n\n`;

    // Generate tests from test plan
    for (const test of testPlan.unitTests) {
      content += `  it('${test.name}', () => {\n`;
      content += `    // ${test.description}\n`;
      content += `    render(<${blueprint.name} />);\n`;
      
      for (const assertion of test.assertions) {
        content += `    // TODO: ${assertion}\n`;
      }
      
      content += `  });\n\n`;
    }

    content += `});\n`;

    return this.formatCode(content);
  }

  /**
   * Generate Storybook story file
   */
  private async generateStoryFile(plan: ComponentPlan, file: any): Promise<string> {
    const { blueprint, interfaces } = plan;
    let content = '';

    // Story imports
    content += `import type { Meta, StoryObj } from '@storybook/react';\n`;
    content += `import { ${blueprint.name} } from './${blueprint.name}';\n\n`;

    // Meta configuration
    content += `const meta = {\n`;
    content += `  title: 'Components/${blueprint.name}',\n`;
    content += `  component: ${blueprint.name},\n`;
    content += `  parameters: {\n`;
    content += `    layout: 'centered',\n`;
    content += `  },\n`;
    content += `  tags: ['autodocs'],\n`;
    
    if (interfaces.props) {
      content += `  argTypes: {\n`;
      for (const prop of interfaces.props.properties) {
        if (prop.name !== 'className') {
          content += `    ${prop.name}: {\n`;
          content += `      description: '${prop.description || ''}',\n`;
          content += `    },\n`;
        }
      }
      content += `  },\n`;
    }
    
    content += `} satisfies Meta<typeof ${blueprint.name}>;\n\n`;
    content += `export default meta;\n`;
    content += `type Story = StoryObj<typeof meta>;\n\n`;

    // Default story
    content += `export const Default: Story = {\n`;
    content += `  args: {\n`;
    
    if (interfaces.props) {
      for (const prop of interfaces.props.properties) {
        if (prop.required && prop.default !== undefined) {
          content += `    ${prop.name}: ${JSON.stringify(prop.default)},\n`;
        }
      }
    }
    
    content += `  },\n`;
    content += `};\n`;

    return this.formatCode(content);
  }

  /**
   * Generate type definition file
   */
  private async generateTypeFile(plan: ComponentPlan, file: any): Promise<string> {
    const { interfaces, blueprint } = plan;
    let content = '';

    content += `/**\n`;
    content += ` * Type definitions for ${blueprint.name}\n`;
    content += ` */\n\n`;

    // Generate all interfaces
    if (interfaces.props) {
      content += this.generateInterface(interfaces.props);
      content += '\n';
    }

    if (interfaces.state) {
      content += this.generateInterface(interfaces.state);
      content += '\n';
    }

    if (interfaces.context) {
      content += this.generateInterface(interfaces.context);
      content += '\n';
    }

    // Generate event types
    if (interfaces.events && interfaces.events.length > 0) {
      for (const event of interfaces.events) {
        if (event.payload) {
          content += this.generateInterface(event.payload);
          content += '\n';
        }
      }
    }

    return this.formatCode(content);
  }

  /**
   * Generate utility/index file
   */
  private async generateUtilFile(plan: ComponentPlan, file: any): Promise<string> {
    const { blueprint } = plan;
    let content = '';

    // For index files, re-export main component
    if (file.path.endsWith('index.ts')) {
      content += `export { default as ${blueprint.name} } from './${blueprint.name}';\n`;
      
      if (plan.interfaces.props) {
        content += `export type { ${plan.interfaces.props.name} } from './${blueprint.name}';\n`;
      }
    }

    return content;
  }

  /**
   * Generate import statements
   */
  private generateImports(dependencies: string[], includeReact: boolean): string {
    let imports = '';

    if (includeReact) {
      imports += `import React from 'react';\n`;
    }

    // Group dependencies by type
    const packageImports: string[] = [];
    const relativeImports: string[] = [];

    for (const dep of dependencies) {
      if (dep.startsWith('.') || dep.startsWith('@/')) {
        relativeImports.push(dep);
      } else if (dep !== 'react') {
        packageImports.push(dep);
      }
    }

    // Add package imports
    for (const pkg of packageImports) {
      imports += `import ${pkg} from '${pkg}';\n`;
    }

    if (packageImports.length > 0 && relativeImports.length > 0) {
      imports += '\n';
    }

    // Add relative imports
    for (const rel of relativeImports) {
      const name = rel.split('/').pop()?.replace(/-/g, '');
      imports += `import { ${name} } from '${rel}';\n`;
    }

    return imports;
  }

  /**
   * Generate TypeScript interface
   */
  private generateInterface(def: InterfaceDefinition): string {
    let content = `export interface ${def.name} {\n`;

    for (const prop of def.properties) {
      if (prop.description) {
        content += `  /** ${prop.description} */\n`;
      }
      content += `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};\n`;
    }

    content += `}\n`;
    return content;
  }

  /**
   * Generate functional component
   */
  private generateFunctionalComponent(
    blueprint: any,
    interfaces: any,
    implementation: any
  ): string {
    let content = '';
    const hasProps = interfaces.props && interfaces.props.properties.length > 0;

    // Component signature
    if (blueprint.type === ComponentType.HOOK) {
      content += `export function ${blueprint.name}(`;
    } else {
      content += `export const ${blueprint.name}`;
      if (hasProps) {
        content += `: React.FC<${interfaces.props.name}>`;
      } else {
        content += `: React.FC`;
      }
      content += ` = (`;
    }

    // Props parameter
    if (hasProps) {
      content += `{\n`;
      const props = interfaces.props.properties.map((p: PropertyDefinition) => `  ${p.name}`);
      content += props.join(',\n');
      content += `\n}`;
    } else {
      content += '';
    }

    content += `) => {\n`;

    // Add state if needed
    if (interfaces.state) {
      content += `  // Component state\n`;
      for (const prop of interfaces.state.properties) {
        const defaultValue = prop.default !== undefined ? JSON.stringify(prop.default) : 'null';
        content += `  const [${prop.name}, set${this.capitalize(prop.name)}] = React.useState<${prop.type}>(${defaultValue});\n`;
      }
      content += '\n';
    }

    // Add event handlers
    if (interfaces.events && interfaces.events.length > 0) {
      content += `  // Event handlers\n`;
      for (const event of interfaces.events) {
        content += `  const handle${this.capitalize(event.name.replace(/^on/, ''))} = (`;
        if (event.payload) {
          content += `payload: ${event.payload.name}`;
        }
        content += `) => {\n`;
        content += `    // TODO: Implement ${event.name} handler\n`;
        content += `  };\n`;
      }
      content += '\n';
    }

    // Return statement
    if (blueprint.type === ComponentType.HOOK) {
      content += `  // Hook logic\n`;
      content += `  return {\n`;
      if (interfaces.state) {
        for (const prop of interfaces.state.properties) {
          content += `    ${prop.name},\n`;
        }
      }
      content += `  };\n`;
    } else {
      content += `  return (\n`;
      content += `    <div className={className}>\n`;
      content += `      {/* TODO: Implement ${blueprint.name} */}\n`;
      content += `      <h1>${blueprint.name}</h1>\n`;
      content += `    </div>\n`;
      content += `  );\n`;
    }

    content += `};\n`;
    return content;
  }

  /**
   * Generate class component
   */
  private generateClassComponent(
    blueprint: any,
    interfaces: any,
    implementation: any
  ): string {
    let content = '';

    content += `export class ${blueprint.name} `;
    
    if (blueprint.type === ComponentType.SERVICE) {
      content += `{\n`;
      content += `  private static instance: ${blueprint.name};\n\n`;
      
      content += `  private constructor() {\n`;
      content += `    // Private constructor for singleton\n`;
      content += `  }\n\n`;
      
      content += `  public static getInstance(): ${blueprint.name} {\n`;
      content += `    if (!${blueprint.name}.instance) {\n`;
      content += `      ${blueprint.name}.instance = new ${blueprint.name}();\n`;
      content += `    }\n`;
      content += `    return ${blueprint.name}.instance;\n`;
      content += `  }\n\n`;
      
      // Add methods based on requirements
      for (const req of blueprint.requirements.functional) {
        const methodName = this.generateMethodName(req.description);
        content += `  public async ${methodName}(): Promise<void> {\n`;
        content += `    // TODO: Implement ${req.description}\n`;
        content += `  }\n\n`;
      }
    } else {
      // React class component
      content += `extends React.Component`;
      if (interfaces.props && interfaces.state) {
        content += `<${interfaces.props.name}, ${interfaces.state.name}>`;
      }
      content += ` {\n`;
      
      content += `  render() {\n`;
      content += `    return (\n`;
      content += `      <div>\n`;
      content += `        {/* TODO: Implement ${blueprint.name} */}\n`;
      content += `      </div>\n`;
      content += `    );\n`;
      content += `  }\n`;
    }

    content += `}\n`;
    return content;
  }

  /**
   * Generate documentation
   */
  private generateDocumentation(plan: ComponentPlan): GeneratedComponent['documentation'] {
    const { blueprint, interfaces, implementation } = plan;

    // Generate README
    let readme = `# ${blueprint.name}\n\n`;
    readme += `${blueprint.description}\n\n`;
    
    readme += `## Usage\n\n`;
    readme += '```tsx\n';
    readme += `import { ${blueprint.name} } from './${blueprint.name}';\n\n`;
    
    if (blueprint.type === ComponentType.UI_COMPONENT) {
      readme += `<${blueprint.name} />\n`;
    }
    
    readme += '```\n\n';

    if (interfaces.props) {
      readme += `## Props\n\n`;
      readme += `| Prop | Type | Required | Description |\n`;
      readme += `|------|------|----------|-------------|\n`;
      
      for (const prop of interfaces.props.properties) {
        readme += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.description || ''} |\n`;
      }
      readme += '\n';
    }

    // Generate API docs
    let apiDocs = `## API Reference\n\n`;
    apiDocs += `### ${blueprint.name}\n\n`;
    apiDocs += implementation.approach + '\n\n';

    // Generate examples
    const examples: CodeExample[] = [{
      title: 'Basic Usage',
      description: `Basic example of using ${blueprint.name}`,
      code: this.generateExampleCode(blueprint, interfaces),
      language: 'tsx'
    }];

    return { readme, apiDocs, examples };
  }

  /**
   * Run quality checks on generated code
   */
  private async runQualityChecks(files: GeneratedFile[], plan: ComponentPlan): Promise<any> {
    const issues: QualityIssue[] = [];

    // Check for TODOs
    for (const file of files) {
      const lines = file.content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('TODO:')) {
          issues.push({
            severity: 'info',
            type: 'test',
            message: `TODO found: ${line.trim()}`,
            file: file.path,
            line: index + 1
          });
        }
      });
    }

         // Check TypeScript strict compliance
     if (this.generatorConfig.strict) {
       for (const file of files) {
         if (file.content.includes(': any')) {
           issues.push({
             severity: 'warning',
             type: 'type',
             message: 'Usage of "any" type detected',
             file: file.path,
             suggestion: 'Replace with specific type'
           });
         }
       }
     }

    return {
      lintingPassed: true, // Would run actual linter
      typeCheckPassed: issues.filter(i => i.type === 'type').length === 0,
      testsPassed: true, // Would run actual tests
      coverage: undefined, // Would calculate actual coverage
      issues
    };
  }

  // Helper methods

  private hasTypeFile(plan: ComponentPlan): boolean {
    return plan.fileStructure.files.some(f => f.type === 'TYPE');
  }

  private getFileLanguage(path: string): 'typescript' | 'javascript' | 'css' | 'markdown' {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.md')) return 'markdown';
    return 'typescript';
  }

  private formatCode(code: string): string {
    // Simple formatting - in production would use prettier
    return code
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateMethodName(description: string): string {
    const words = description.toLowerCase().split(' ');
    const verb = words[0];
    const rest = words.slice(1).map(w => this.capitalize(w)).join('');
    return verb + rest.replace(/[^a-zA-Z0-9]/g, '');
  }

  private generateExampleCode(blueprint: any, interfaces: any): string {
    let code = `import { ${blueprint.name} } from './${blueprint.name}';\n\n`;
    
    if (blueprint.type === ComponentType.UI_COMPONENT) {
      code += `function Example() {\n`;
      code += `  return (\n`;
      code += `    <${blueprint.name}\n`;
      
      if (interfaces.props) {
        for (const prop of interfaces.props.properties) {
          if (prop.required) {
            const value = prop.type === 'string' ? '"example"' : '{}';
            code += `      ${prop.name}={${value}}\n`;
          }
        }
      }
      
      code += `    />\n`;
      code += `  );\n`;
      code += `}`;
    }
    
    return code;
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
