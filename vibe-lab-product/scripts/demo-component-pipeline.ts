#!/usr/bin/env tsx
/**
 * Demo: Complete Component Pipeline
 * 
 * Shows the full flow from blueprint to generated code
 */

import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
import { ComponentPlanner } from '../lib/avca/pipeline/component-pipeline/component-planner';
import { CodeGenerator } from '../lib/avca/pipeline/component-pipeline/code-generator';
import { QualityAssurance } from '../lib/avca/pipeline/component-pipeline/quality-assurance';
import { EventBus } from '../lib/avca/services/event-bus';

async function runDemo() {
  console.log('🚀 Component Pipeline Demo\n');
  console.log('This demo shows the complete flow from user requirements to generated code.\n');

  // Initialize pipeline
  const eventBus = new EventBus();
  const parser = new BlueprintParser({ eventBus });
  const planner = new ComponentPlanner({ eventBus });
  const generator = new CodeGenerator({ eventBus });
  const qa = new QualityAssurance({ eventBus });

  await parser.start();
  await planner.start();
  await generator.start();
  await qa.start();

  // Example: Search Component with filtering
  const searchBlueprint = {
    name: 'SearchDashboard',
    description: 'Advanced search dashboard with real-time filtering',
    functionalRequirements: [
      'Display search input with icon',
      'Show search results in a grid',
      'Filter results by category',
      'Sort results by relevance or date',
      'Handle empty states gracefully'
    ],
    components: ['search-component', 'filter-component', 'results-grid'],
    technicalRequirements: {
      framework: 'Next.js 14',
      styling: 'Tailwind CSS',
      performance: 'Optimize for fast searches'
    },
    performanceTargets: {
      searchTime: '<100ms',
      renderTime: '<50ms'
    }
  };

  console.log('📋 STAGE 1: Blueprint Parsing\n');
  console.log('Input:', JSON.stringify(searchBlueprint, null, 2));
  
  const blueprint = await parser.process(searchBlueprint);
  
  console.log('\n✅ Parsed Blueprint:');
  console.log(`- Type: ${blueprint.type}`);
  console.log(`- Complexity: ${blueprint.metadata.complexity}`);
  console.log(`- Estimated Time: ${blueprint.metadata.estimatedTime} minutes`);
  console.log(`- Dependencies: ${blueprint.dependencies.internal.length} internal, ${blueprint.dependencies.external.length} external`);

  console.log('\n📐 STAGE 2: Component Planning\n');
  
  const plan = await planner.process(blueprint);
  
  console.log('✅ Generated Plan:');
  console.log(`- Architecture: ${plan.implementation.architecture}`);
  console.log(`- Patterns: ${plan.implementation.patterns.join(', ')}`);
  console.log(`- Files: ${plan.fileStructure.files.length}`);
  console.log(`- Props: ${plan.interfaces.props?.properties.length || 0}`);
  console.log(`- Test Cases: ${plan.testPlan.unitTests.length}`);

  console.log('\n💻 STAGE 3: Code Generation\n');
  
  const generated = await generator.process(plan);
  
  console.log('✅ Generated Code:');
  console.log(`- Files Created: ${generated.files.length}`);
  console.log(`- Total Lines: ${generated.files.reduce((sum, f) => sum + f.content.split('\n').length, 0)}`);
  console.log(`- Issues Found: ${generated.qualityReport.issues.length}`);

  console.log('\n🎯 STAGE 4: Quality Assurance\n');
  
  const optimized = await qa.process(generated);
  
  console.log('✅ Optimized Code:');
  console.log(`- Quality Score: ${optimized.qualityReport.score}%`);
  console.log(`- Issues Fixed: ${optimized.improvements.issuesFixed}`);
  console.log(`- Optimizations Applied: ${optimized.improvements.optimizationsApplied}`);
  console.log(`- Performance Gain: +${optimized.improvements.performanceGain}%`);

  console.log('\n📁 Generated Files:');
  for (const file of optimized.files.slice(0, 2)) {
    console.log(`\n--- ${file.path} (${file.content.split('\n').length} lines) ---`);
    console.log(file.content.substring(0, 400) + (file.content.length > 400 ? '\n...' : ''));
  }

  console.log('\n📚 Documentation:');
  console.log(optimized.documentation.readme.substring(0, 300) + '...');

  console.log('\n🎯 Final Quality Report:');
  console.log(`- Linting: ${optimized.qualityReport.lintingPassed ? '✅' : '❌'}`);
  console.log(`- Type Checking: ${optimized.qualityReport.typeCheckPassed ? '✅' : '❌'}`);
  console.log(`- Best Practices Applied: ${optimized.qualityReport.bestPractices?.filter(p => p.applied).length || 0}`);
  console.log(`- Remaining Issues: ${optimized.qualityReport.issues.filter(i => !i.fixed).length}`);

  // Clean up
  await qa.stop();
  await generator.stop();
  await planner.stop();
  await parser.stop();

  console.log('\n✨ Pipeline Complete!');
  console.log('From requirements to production-ready code in milliseconds! 🚀');
}

// Run the demo
(async () => {
  try {
    await runDemo();
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
})();
