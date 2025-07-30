#!/usr/bin/env tsx
/**
 * Test script for Code Generator - Stage 3 of Component Pipeline
 */

import { CodeGenerator } from '../lib/avca/pipeline/component-pipeline/code-generator';
import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
import { ComponentPlanner } from '../lib/avca/pipeline/component-pipeline/component-planner';
import { EventBus } from '../lib/avca/services/event-bus';
import { ComponentType } from '../lib/avca/pipeline/component-pipeline/types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class TestRunner {
  private results: TestResult[] = [];
  private eventBus: EventBus;
  private parser: BlueprintParser;
  private planner: ComponentPlanner;
  private generator: CodeGenerator;

  constructor() {
    this.eventBus = new EventBus();
    this.parser = new BlueprintParser({ eventBus: this.eventBus });
    this.planner = new ComponentPlanner({ eventBus: this.eventBus });
    this.generator = new CodeGenerator({ eventBus: this.eventBus });
  }

  async runTests() {
    console.log('🧪 Starting Code Generator Tests\n');

    await this.parser.start();
    await this.planner.start();
    await this.generator.start();

    // Run all tests
    await this.test('Generate basic UI component code', this.testBasicUIComponent.bind(this));
    await this.test('Generate service class code', this.testServiceComponent.bind(this));
    await this.test('Generate component with state', this.testStatefulComponent.bind(this));
    await this.test('Generate test files', this.testTestGeneration.bind(this));
    await this.test('Generate complete file set', this.testCompleteFileGeneration.bind(this));
    await this.test('Code quality checks', this.testCodeQuality.bind(this));

    // Clean up
    await this.generator.stop();
    await this.planner.stop();
    await this.parser.stop();

    // Report results
    this.reportResults();
  }

  private async test(name: string, testFn: () => Promise<void>) {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - startTime
      });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      console.error(`❌ ${name}: ${error}`);
    }
  }

  private async testBasicUIComponent() {
    const rawBlueprint = {
      description: 'Create a button component',
      functionalRequirements: [
        'Display text label',
        'Handle click events'
      ]
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);
    const generated = await this.generator.process(plan);

    // Check files were generated
    if (generated.files.length === 0) {
      throw new Error('No files generated');
    }

    // Find main component file
    const componentFile = generated.files.find(f => f.path.includes('.tsx') && !f.path.includes('test'));
    if (!componentFile) {
      throw new Error('No component file generated');
    }

    // Check component content
    if (!componentFile.content.includes('import React')) {
      throw new Error('Component missing React import');
    }
    if (!componentFile.content.includes('export const')) {
      throw new Error('Component missing export');
    }
    if (!componentFile.content.includes('onClick')) {
      throw new Error('Component missing click handler');
    }
  }

  private async testServiceComponent() {
    const rawBlueprint = {
      name: 'DataService',
      description: 'Service for data management',
      functionalRequirements: [
        'Fetch data from API',
        'Cache results'
      ]
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);
    const generated = await this.generator.process(plan);

    const serviceFile = generated.files.find(f => f.path.includes('DataService'));
    if (!serviceFile) {
      throw new Error('No service file generated');
    }

    // Check service structure
    if (!serviceFile.content.includes('export class DataService')) {
      throw new Error('Service missing class declaration');
    }
    if (!serviceFile.content.includes('getInstance()')) {
      throw new Error('Service missing singleton getInstance method');
    }
    if (!serviceFile.content.includes('fetchDataFromApi()')) {
      throw new Error('Service missing method for functional requirement');
    }
  }

  private async testStatefulComponent() {
    const rawBlueprint = {
      name: 'FilterPanel',
      description: 'Panel with filtering options',
      functionalRequirements: [
        'Display filter options',
        'Allow filter selection',
        'Update on filter change'
      ]
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);
    const generated = await this.generator.process(plan);

    const componentFile = generated.files.find(f => f.path.includes('FilterPanel.tsx'));
    if (!componentFile) {
      throw new Error('No component file generated');
    }

    // Check for state management
    if (!componentFile.content.includes('useState')) {
      throw new Error('Stateful component missing useState');
    }
    if (!componentFile.content.includes('filters')) {
      throw new Error('Component missing filters state');
    }
    if (!componentFile.content.includes('handleChange')) {
      throw new Error('Component missing change handler');
    }
  }

  private async testTestGeneration() {
    const rawBlueprint = {
      name: 'TestComponent',
      description: 'Component for testing',
      functionalRequirements: [
        'Display content',
        'Handle interactions'
      ]
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);
    const generated = await this.generator.process(plan);

    const testFile = generated.files.find(f => f.path.includes('.test.tsx'));
    if (!testFile) {
      throw new Error('No test file generated');
    }

    // Check test structure
    if (!testFile.content.includes('describe(')) {
      throw new Error('Test file missing describe block');
    }
    if (!testFile.content.includes('it(')) {
      throw new Error('Test file missing test cases');
    }
    if (!testFile.content.includes('@testing-library/react')) {
      throw new Error('Test file missing testing library import');
    }
    if (!testFile.content.includes('render(')) {
      throw new Error('Test file missing render call');
    }
  }

  private async testCompleteFileGeneration() {
    const rawBlueprint = {
      name: 'CompleteComponent',
      description: 'UI component with all features',
      components: ['sub-component'],
      functionalRequirements: [
        'Display data',
        'Handle user input'
      ]
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);
    const generated = await this.generator.process(plan);

    // Check for all expected files
    const hasComponent = generated.files.some(f => f.path.includes('CompleteComponent.tsx'));
    const hasTest = generated.files.some(f => f.path.includes('.test.tsx'));
    const hasStory = generated.files.some(f => f.path.includes('.stories.tsx'));
    const hasIndex = generated.files.some(f => f.path.includes('index.ts'));

    if (!hasComponent) throw new Error('Missing component file');
    if (!hasTest) throw new Error('Missing test file');
    if (!hasStory) throw new Error('Missing story file');
    if (!hasIndex) throw new Error('Missing index file');

    // Check documentation was generated
    if (!generated.documentation.readme) {
      throw new Error('Missing README documentation');
    }
    if (!generated.documentation.examples || generated.documentation.examples.length === 0) {
      throw new Error('Missing code examples');
    }
  }

  private async testCodeQuality() {
    const rawBlueprint = {
      name: 'QualityComponent',
      description: 'Component for quality testing'
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);
    const generated = await this.generator.process(plan);

    // Check quality report exists
    if (!generated.qualityReport) {
      throw new Error('Quality report missing');
    }

    // Check for expected quality issues (TODOs)
    const todoIssues = generated.qualityReport.issues.filter(i => i.message.includes('TODO'));
    if (todoIssues.length === 0) {
      throw new Error('Expected TODO issues not found');
    }

    // Check strict mode worked (any types)
    const componentFile = generated.files.find(f => f.path.includes('QualityComponent.tsx'));
    if (componentFile && componentFile.content.includes(': any[]')) {
      const anyIssues = generated.qualityReport.issues.filter(i => i.message.includes('any'));
      if (anyIssues.length === 0) {
        throw new Error('Strict mode did not catch "any" type usage');
      }
    }
  }

  private reportResults() {
    console.log('\n📊 Test Results Summary\n');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Time: ${totalDuration}ms`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('Failed Tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    }

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run tests
(async () => {
  const runner = new TestRunner();
  await runner.runTests();
})();
