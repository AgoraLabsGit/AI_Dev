#!/usr/bin/env tsx
/**
 * Test script for Blueprint Parser - Stage 1 of Component Pipeline
 */

import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
import { EventBus } from '../lib/avca/services/event-bus';
import { ComponentType, Priority, Complexity } from '../lib/avca/pipeline/component-pipeline/types';

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

  constructor() {
    this.eventBus = new EventBus();
    this.parser = new BlueprintParser({ eventBus: this.eventBus });
  }

  async runTests() {
    console.log('🧪 Starting Blueprint Parser Tests\n');

    await this.parser.start();

    // Run all tests
    await this.test('Parse basic UI component blueprint', this.testBasicUIComponent.bind(this));
    await this.test('Parse service blueprint', this.testServiceBlueprint.bind(this));
    await this.test('Parse complex blueprint with all fields', this.testComplexBlueprint.bind(this));
    await this.test('Handle minimal blueprint', this.testMinimalBlueprint.bind(this));
    await this.test('Extract dependencies correctly', this.testDependencyExtraction.bind(this));
    await this.test('Calculate complexity accurately', this.testComplexityCalculation.bind(this));

    // Clean up
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
      description: 'Create a search component with filtering',
      components: ['search-component', 'filter-component'],
      technicalRequirements: {
        framework: 'Next.js 14',
        styling: 'Tailwind CSS'
      }
    };

    const result = await this.parser.process(rawBlueprint);

    // Assertions
    if (result.type !== ComponentType.UI_COMPONENT) {
      throw new Error(`Expected UI_COMPONENT, got ${result.type}`);
    }
    if (result.name !== 'CreateASearch') {
      throw new Error(`Expected name 'CreateASearch', got ${result.name}`);
    }
    if (result.dependencies.internal.length !== 2) {
      throw new Error(`Expected 2 internal dependencies, got ${result.dependencies.internal.length}`);
    }
  }

  private async testServiceBlueprint() {
    const rawBlueprint = {
      name: 'AuthService',
      description: 'Authentication service for user management',
      functionalRequirements: [
        'Must validate user credentials',
        'Should support JWT tokens',
        'Could log authentication attempts'
      ]
    };

    const result = await this.parser.process(rawBlueprint);

    // Assertions
    if (result.type !== ComponentType.SERVICE) {
      throw new Error(`Expected SERVICE, got ${result.type}`);
    }
    if (result.metadata.priority !== Priority.CRITICAL) {
      throw new Error(`Expected CRITICAL priority, got ${result.metadata.priority}`);
    }
    if (result.requirements.functional.length !== 3) {
      throw new Error(`Expected 3 functional requirements, got ${result.requirements.functional.length}`);
    }
    
    // Check priority parsing
    const priorities = result.requirements.functional.map(r => r.priority);
    if (priorities[0] !== Priority.CRITICAL || priorities[1] !== Priority.HIGH || priorities[2] !== Priority.LOW) {
      throw new Error('Incorrect priority parsing');
    }
  }

  private async testComplexBlueprint() {
    const rawBlueprint = {
      id: 'comp_12345',
      name: 'DataTable',
      description: 'Advanced data table with sorting and pagination',
      functionalRequirements: [
        'Display data in rows and columns',
        'Support sorting by column',
        'Include pagination controls',
        'Allow row selection'
      ],
      technicalRequirements: {
        framework: 'Next.js 14',
        language: 'TypeScript',
        styling: 'Tailwind CSS',
        testing: 'Jest + React Testing Library'
      },
      architecturalGuidelines: {
        componentStructure: 'atomic',
        statePattern: 'hooks'
      },
      performanceTargets: {
        loadTime: '<3s',
        bundleSize: '<500KB'
      },
      securityRequirements: {
        inputSanitization: 'required',
        xssProtection: true
      }
    };

    const result = await this.parser.process(rawBlueprint);

    // Assertions
    if (result.id !== 'comp_12345') {
      throw new Error('ID not preserved');
    }
    if (result.requirements.technical.length < 3) {
      throw new Error('Not all technical requirements parsed');
    }
    if (result.validation.rules.length !== 2) {
      throw new Error('Security requirements not converted to validation rules');
    }
    if (result.validation.constraints.length !== 2) {
      throw new Error('Performance targets not converted to constraints');
    }
  }

  private async testMinimalBlueprint() {
    const rawBlueprint = {
      description: 'Simple utility function'
    };

    const result = await this.parser.process(rawBlueprint);

    // Should still produce valid output
    if (!result.id || !result.name || result.type !== ComponentType.UTILITY) {
      throw new Error('Minimal blueprint not handled correctly');
    }
    if (result.metadata.complexity !== Complexity.SIMPLE) {
      throw new Error('Expected SIMPLE complexity for minimal blueprint');
    }
  }

  private async testDependencyExtraction() {
    const rawBlueprint = {
      components: ['button-component', 'modal-component', 'form-handler'],
      technicalRequirements: {
        framework: 'Next.js 14'
      }
    };

    const result = await this.parser.process(rawBlueprint);

    // Check internal dependencies (only -component ones)
    if (result.dependencies.internal.length !== 2) {
      throw new Error(`Expected 2 internal dependencies, got ${result.dependencies.internal.length}`);
    }

    // Check external dependencies
    const hasReact = result.dependencies.external.some(d => d.package === 'react');
    const hasNext = result.dependencies.external.some(d => d.package === 'next');
    
    if (!hasReact || !hasNext) {
      throw new Error('Missing expected external dependencies');
    }
  }

  private async testComplexityCalculation() {
    // Simple component
    const simple = await this.parser.process({
      description: 'Basic button'
    });
    if (simple.metadata.complexity !== Complexity.SIMPLE) {
      throw new Error('Simple component complexity incorrect');
    }

    // Moderate component
    const moderate = await this.parser.process({
      functionalRequirements: ['Req1', 'Req2', 'Req3'],
      components: ['comp1', 'comp2']
    });
    if (moderate.metadata.complexity !== Complexity.MODERATE) {
      throw new Error('Moderate component complexity incorrect');
    }

    // Complex component
    const complex = await this.parser.process({
      functionalRequirements: Array(10).fill('Requirement'),
      components: Array(5).fill('component'),
      technicalRequirements: { framework: 'Next.js' }
    });
    if (complex.metadata.complexity !== Complexity.COMPLEX) {
      throw new Error('Complex component complexity incorrect');
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
