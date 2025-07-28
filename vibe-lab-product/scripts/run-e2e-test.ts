#!/usr/bin/env ts-node

/**
 * Execute AVCA Pipeline E2E Test
 * Run with: npx ts-node scripts/run-e2e-test.ts
 */

import { runE2EPipelineTest } from '../lib/avca/pipeline-e2e-test';
import { tokenTracker } from '../lib/avca/token-tracking';
import { qualityMeasurement } from '../lib/avca/quality-measurement';

async function main() {
  console.log('='.repeat(60));
  console.log('AVCA PIPELINE E2E TEST - PHASE 0');
  console.log('='.repeat(60));
  console.log('Test Feature: Add Search to Dashboard');
  console.log('Success Criteria:');
  console.log('  - Time: < 30 minutes');
  console.log('  - Cost: < $0.50');
  console.log('  - Quality: > 90% test coverage');
  console.log('  - Manual: < 20% intervention');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Run the E2E test
    const result = await runE2EPipelineTest();

    // Export metrics for analysis
    const metrics = tokenTracker.exportMetrics();
    
    console.log('\n📈 Token Usage Analysis:');
    console.log('Stage Efficiency:');
    Object.entries(metrics.stageEfficiency).forEach(([stage, stats]) => {
      console.log(`  ${stage}: ${Math.round(stats.averageTokens)} tokens, $${stats.averageCost.toFixed(3)}`);
    });

    console.log('\n📊 Quality Metrics:');
    const qualityScore = qualityMeasurement.getQualityScore('SearchBar');
    if (qualityScore) {
      console.log(`  Overall: ${qualityScore.overall.toFixed(1)}/100`);
      console.log(`  Coverage: ${qualityScore.coverage}%`);
      console.log(`  Security: ${qualityScore.security}/10`);
      console.log(`  Performance: ${qualityScore.performance.toFixed(1)}/100`);
      console.log(`  Accessibility: ${qualityScore.accessibility}/100`);
    }

    // Write detailed report
    const reportPath = './e2e-test-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      result,
      tokenMetrics: metrics,
      qualityReport: qualityMeasurement.exportReport('SearchBar')
    };

    require('fs').writeFileSync(
      reportPath,
      JSON.stringify(report, null, 2)
    );
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(result.overallSuccess ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error); 