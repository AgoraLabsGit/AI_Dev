#!/usr/bin/env tsx
/**
 * Test script for Quality Assurance - Stage 4 of Component Pipeline
 */

import { QualityAssurance } from '../lib/avca/pipeline/component-pipeline/quality-assurance';
import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
import { ComponentPlanner } from '../lib/avca/pipeline/component-pipeline/component-planner';
import { CodeGenerator } from '../lib/avca/pipeline/component-pipeline/code-generator';
import { EventBus } from '../lib/avca/services/event-bus';

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
  private qa: QualityAssurance;

  constructor() {
    this.eventBus = new EventBus();
    this.parser = new BlueprintParser({ eventBus: this.eventBus });
    this.planner = new ComponentPlanner({ eventBus: this.eventBus });
    this.generator = new CodeGenerator({ eventBus: this.eventBus });
    this.qa = new QualityAssurance({ eventBus: this.eventBus });
  }

  async runTests() {
    console.log('🧪 Starting Quality Assurance Tests\n');

    await this.parser.start();
    await this.planner.start();
    await this.generator.start();
    await this.qa.start();

    // Run all tests
    await this.test('Validate TypeScript issues', this.testTypeScriptValidation.bind(this));
    await this.test('Auto-fix code issues', this.testAutoFix.bind(this));
    await this.test('Optimize code performance', this.testOptimizations.bind(this));
    await this.test('Format code properly', this.testCodeFormatting.bind(this));
    await this.test('Check best practices', this.testBestPractices.bind(this));
    await this.test('Calculate quality score', this.testQualityScoring.bind(this));

    // Clean up
    await this.qa.stop();
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

  private async testTypeScriptValidation() {
    const rawBlueprint = {
      name: 'TypeScriptComponent',
      description: 'Component with TypeScript issues',
      functionalRequirements: ['Display data']
    };

    const generated = await this.generateComponent(rawBlueprint);
    
    // Inject some TypeScript issues
    if (!generated.files[0].content.includes(': any')) {
      // Add any type to props
      generated.files[0].content = generated.files[0].content.replace(
        'data: any[]',
        'data: any'
      );
      // Also add a direct any type
      generated.files[0].content = generated.files[0].content.replace(
        'export interface',
        'export interface TestInterface { value: any; }\nexport interface'
      );
    }

    const optimized = await this.qa.process(generated);

    // Check that TypeScript issues were detected
    const typeIssues = optimized.qualityReport.issues.filter(i => i.type === 'type');
    if (typeIssues.length === 0) {
      throw new Error('Failed to detect TypeScript issues');
    }

    // Check that any types were flagged
    const anyTypeIssue = typeIssues.find(i => i.message.includes('any'));
    if (!anyTypeIssue) {
      throw new Error('Failed to detect "any" type usage');
    }
  }

  private async testAutoFix() {
    const rawBlueprint = {
      name: 'FixableComponent',
      description: 'Component with fixable issues'
    };

    const generated = await this.generateComponent(rawBlueprint);
    
    // Add console.log that should be auto-fixed
    generated.files[0].content += '\nconsole.log("debug");';

    const optimized = await this.qa.process(generated);

    // Check that console.log was removed
    if (optimized.files[0].content.includes('console.log')) {
      throw new Error('Auto-fix failed to remove console.log');
    }

    // Check that fixes were tracked
    if (optimized.improvements.issuesFixed === 0) {
      throw new Error('No fixes were tracked');
    }
  }

  private async testOptimizations() {
    const rawBlueprint = {
      name: 'ComplexComponent',
      description: 'Complex component needing optimization',
      functionalRequirements: [
        'Display data grid',
        'Filter results',
        'Sort columns',
        'Handle pagination'
      ]
    };

    const generated = await this.generateComponent(rawBlueprint);
    const optimized = await this.qa.process(generated);

    // Check that optimizations were applied
    if (!optimized.qualityReport.optimizations || optimized.qualityReport.optimizations.length === 0) {
      throw new Error('No optimizations were applied');
    }

    // Check for React.memo optimization on complex components
    const perfOptimization = optimized.qualityReport.optimizations.find(o => o.type === 'performance');
    if (!perfOptimization) {
      throw new Error('Performance optimizations not applied to complex component');
    }

    if (optimized.improvements.optimizationsApplied === 0) {
      throw new Error('Optimization count not tracked');
    }
  }

  private async testCodeFormatting() {
    const rawBlueprint = {
      name: 'UnformattedComponent',
      description: 'Component with formatting issues'
    };

    const generated = await this.generateComponent(rawBlueprint);
    
    // Mess up formatting
    generated.files[0].content = generated.files[0].content
      .replace(/\n\s+/g, '\n') // Remove indentation
      .replace(/{\s+/g, '{')   // Remove spacing
      .replace(/\s+}/g, '}');

    const optimized = await this.qa.process(generated);

    // Check that code is properly formatted
    const lines = optimized.files[0].content.split('\n');
    const hasIndentation = lines.some(line => line.startsWith('  '));
    if (!hasIndentation) {
      throw new Error('Code formatting failed to add indentation');
    }

    // Check spacing around braces
    if (optimized.files[0].content.includes('{const') || optimized.files[0].content.includes('const}')) {
      throw new Error('Code formatting failed to add proper spacing');
    }
  }

  private async testBestPractices() {
    const rawBlueprint = {
      name: 'BestPracticeComponent',
      description: 'Component to test best practices',
      functionalRequirements: ['Display form with button']
    };

    const generated = await this.generateComponent(rawBlueprint);
    const optimized = await this.qa.process(generated);

    // Check that best practices were evaluated
    if (!optimized.qualityReport.bestPractices || optimized.qualityReport.bestPractices.length === 0) {
      throw new Error('No best practices were evaluated');
    }

    // Check TypeScript best practices
    const typescriptPractices = optimized.qualityReport.bestPractices.filter(p => p.category === 'typescript');
    if (typescriptPractices.length === 0) {
      throw new Error('TypeScript best practices not evaluated');
    }

    // Check that prop types practice was applied
    const propTypesPractice = typescriptPractices.find(p => p.practice.includes('prop types'));
    if (!propTypesPractice || !propTypesPractice.applied) {
      throw new Error('Prop types best practice not properly evaluated');
    }
  }

  private async testQualityScoring() {
    const rawBlueprint = {
      name: 'QualityComponent',
      description: 'Component for quality scoring',
      functionalRequirements: [
        'Display user profile',
        'Handle profile updates'
      ]
    };

    const generated = await this.generateComponent(rawBlueprint);
    const optimized = await this.qa.process(generated);

    // Check that quality score exists
    if (typeof optimized.qualityReport.score !== 'number') {
      throw new Error('Quality score not calculated');
    }

    // Score should be reasonable (expecting less than 100 due to TODOs and any types)
    if (optimized.qualityReport.score === 0) {
      throw new Error(`Quality score too low: ${optimized.qualityReport.score}`);
    }
    
    // With TODOs in the code, score should be less than 100
    if (optimized.qualityReport.score >= 100) {
      throw new Error(`Quality score too high for code with TODOs: ${optimized.qualityReport.score}`);
    }

    // Score should be between 0 and 100
    if (optimized.qualityReport.score < 0 || optimized.qualityReport.score > 100) {
      throw new Error(`Invalid quality score: ${optimized.qualityReport.score}`);
    }
    
    // Should have detected some issues
    if (optimized.qualityReport.issues.length === 0) {
      throw new Error('No quality issues detected in code with TODOs');
    }
  }

  private async generateComponent(rawBlueprint: any) {
    const blueprint = await this.parser.process(rawBlueprint);
    const plan = await this.planner.process(blueprint);
    return await this.generator.process(plan);
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
