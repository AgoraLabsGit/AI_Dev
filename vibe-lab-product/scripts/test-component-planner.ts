#!/usr/bin/env tsx
/**
 * Test script for Component Planner - Stage 2 of Component Pipeline
 */

import { ComponentPlanner } from '../lib/avca/pipeline/component-pipeline/component-planner';
import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
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

  constructor() {
    this.eventBus = new EventBus();
    this.parser = new BlueprintParser({ eventBus: this.eventBus });
    this.planner = new ComponentPlanner({ eventBus: this.eventBus });
  }

  async runTests() {
    console.log('🧪 Starting Component Planner Tests\n');

    await this.parser.start();
    await this.planner.start();

    // Run all tests
    await this.test('Plan basic UI component', this.testBasicUIComponent.bind(this));
    await this.test('Plan service component', this.testServiceComponent.bind(this));
    await this.test('Plan complex component with state', this.testComplexComponent.bind(this));
    await this.test('Generate appropriate file structure', this.testFileStructure.bind(this));
    await this.test('Design interfaces correctly', this.testInterfaceDesign.bind(this));
    await this.test('Create comprehensive test plan', this.testTestPlan.bind(this));

    // Clean up
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

    // Assertions
    if (plan.implementation.architecture !== 'functional') {
      throw new Error('Expected functional architecture for UI component');
    }
    if (!plan.implementation.patterns.includes('compound-component')) {
      throw new Error('Expected compound-component pattern');
    }
    if (!plan.interfaces.props) {
      throw new Error('Expected props interface for UI component');
    }
    if (!plan.interfaces.events || plan.interfaces.events.length === 0) {
      throw new Error('Expected click event definition');
    }
  }

  private async testServiceComponent() {
    const rawBlueprint = {
      name: 'DataService',
      description: 'Service for data management',
      functionalRequirements: [
        'Fetch data from API',
        'Cache results',
        'Handle errors'
      ]
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);

    // Assertions
    if (plan.implementation.architecture !== 'class') {
      throw new Error('Expected class architecture for service');
    }
    if (!plan.implementation.patterns.includes('singleton')) {
      throw new Error('Expected singleton pattern for service');
    }
    if (plan.interfaces.props) {
      throw new Error('Service should not have props interface');
    }
  }

  private async testComplexComponent() {
    const rawBlueprint = {
      name: 'DataTable',
      description: 'Advanced data table with sorting and filtering',
      functionalRequirements: [
        'Display data in rows',
        'Support column sorting',
        'Allow filtering by criteria',
        'Enable row selection',
        'Handle pagination'
      ],
      technicalRequirements: {
        framework: 'Next.js 14',
        performance: 'optimize for large datasets'
      }
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);

    // Assertions
    if (!plan.implementation.patterns.includes('custom-hooks')) {
      throw new Error('Expected custom-hooks pattern for complex component');
    }
    if (!plan.implementation.patterns.includes('memoization')) {
      throw new Error('Expected memoization for performance optimization');
    }
    if (!plan.interfaces.state) {
      throw new Error('Expected state interface for complex component');
    }
    
    // Check state has sorting fields
    const stateProps = plan.interfaces.state.properties;
    const hasSortBy = stateProps.some(p => p.name === 'sortBy');
    const hasSortOrder = stateProps.some(p => p.name === 'sortOrder');
    const hasFilters = stateProps.some(p => p.name === 'filters');
    
    if (!hasSortBy || !hasSortOrder || !hasFilters) {
      throw new Error('State interface missing required properties');
    }
  }

  private async testFileStructure() {
    const rawBlueprint = {
      name: 'SearchBar',
      description: 'Search input component',
      components: ['search-component']
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);

    // Check file paths
    const { rootPath, files } = plan.fileStructure;
    
    if (!rootPath.includes('src/components')) {
      throw new Error('UI component should be in src/components');
    }

    const expectedFiles = ['SearchBar.tsx', 'SearchBar.test.tsx', 'SearchBar.stories.tsx'];
    const actualFileNames = files.map(f => {
      const parts = f.path.split('/');
      return parts[parts.length - 1];
    });
    
    for (const expected of expectedFiles) {
      if (!actualFileNames.includes(expected)) {
        throw new Error(`Missing expected file: ${expected}. Found: ${actualFileNames.join(', ')}`);
      }
    }
    
    // Check test file is in __tests__ directory
    const testFile = files.find(f => f.path.includes('.test.tsx'));
    if (!testFile || !testFile.path.includes('__tests__/')) {
      throw new Error('Test file should be in __tests__ directory');
    }

    // Check index file was added
    const hasIndex = files.some(f => f.path.endsWith('index.ts'));
    if (!hasIndex) {
      throw new Error('Expected index.ts file for multi-file component');
    }

    // Check dependencies
    const mainFile = files.find(f => f.path.includes('SearchBar.tsx'));
    if (!mainFile?.dependencies.includes('react')) {
      throw new Error('Component should depend on react');
    }
  }

  private async testInterfaceDesign() {
    const rawBlueprint = {
      name: 'FormInput',
      description: 'Form input with validation',
      functionalRequirements: [
        'Display input field',
        'Show validation errors',
        'Handle change events'
      ]
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);

    // Check props interface
    if (!plan.interfaces.props) {
      throw new Error('Expected props interface');
    }

    const props = plan.interfaces.props.properties;
    const hasClassName = props.some(p => p.name === 'className');
    const hasData = props.some(p => p.name === 'data');
    
    if (!hasClassName) {
      throw new Error('Props should include className');
    }
    if (!hasData) {
      throw new Error('Props should include data for display requirement');
    }

    // Check events
    if (!plan.interfaces.events || plan.interfaces.events.length === 0) {
      throw new Error('Expected change event');
    }

    const changeEvent = plan.interfaces.events.find(e => e.name === 'onChange');
    if (!changeEvent) {
      throw new Error('Expected onChange event');
    }
  }

  private async testTestPlan() {
    const rawBlueprint = {
      name: 'TodoList',
      description: 'Todo list with CRUD operations',
      functionalRequirements: [
        'Display list of todos',
        'Add new todo',
        'Mark todo as complete',
        'Delete todo'
      ],
      components: ['todo-component']
    };

    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);

    // Check unit tests (4 functional requirements + 1 for todo-component)
    if (plan.testPlan.unitTests.length !== 5) {
      throw new Error(`Expected 5 unit tests, got ${plan.testPlan.unitTests.length}`);
    }

    // Check integration tests
    if (plan.testPlan.integrationTests.length === 0) {
      throw new Error('Expected integration tests for component dependencies');
    }

    // Check test scenarios
    if (plan.testPlan.scenarios.length < 2) {
      throw new Error('Expected at least 2 test scenarios');
    }

    const hasRenderingScenario = plan.testPlan.scenarios.some(s => s.name === 'Basic Rendering');
    const hasInteractionScenario = plan.testPlan.scenarios.some(s => s.name === 'User Interaction Flow');
    
    if (!hasRenderingScenario || !hasInteractionScenario) {
      throw new Error('Missing expected test scenarios');
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
