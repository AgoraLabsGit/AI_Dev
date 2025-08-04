#!/usr/bin/env node

/**
 * Vibe Lab Quality Report Generator
 * Generates comprehensive quality reports for the project
 */

const { QualityAssuranceService } = require('../src/lib/avca/services/quality-assurance-service');
const { EventBus } = require('../src/lib/avca/services/event-bus');

async function generateReport() {
  const eventBus = new EventBus();
  
  const qaService = new QualityAssuranceService({
    name: 'quality-assurance',
    version: '1.0.0',
    projectRoot: process.cwd(),
    enabledChecks: {
      typescript: true,
      eslint: true,
      tests: true,
      build: true,
      dependencies: true,
      architecture: true
    },
    thresholds: {
      minTypeScriptScore: 90,
      maxLintErrors: 0,
      minTestCoverage: 80,
      maxBuildTime: 60000
    },
    autoFix: false,
    reportPath: './reports/quality'
  }, eventBus);

  try {
    await qaService.start();
    const report = await qaService.process({ action: 'analyze' });
    
    console.log('\n📊 Quality Report Generated');
    console.log('='.repeat(50));
    console.log(`📈 Overall Score: ${report.score}/100`);
    console.log(`🎯 Status: ${report.status.toUpperCase()}`);
    console.log(`🔧 TypeScript Errors: ${report.metrics.typeErrors}`);
    console.log(`⚠️  ESLint Errors: ${report.metrics.lintErrors}`);
    console.log(`🧪 Test Coverage: ${report.metrics.testCoverage}%`);
    console.log(`🏗️  Build Success: ${report.metrics.buildSuccess ? '✅' : '❌'}`);
    console.log(`🔒 Vulnerabilities: ${report.metrics.dependencyVulnerabilities}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n📋 Top Recommendations:');
      report.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: reports/quality/latest.json`);
    
  } catch (error) {
    console.error('❌ Failed to generate quality report:', error.message);
    process.exit(1);
  } finally {
    await qaService.stop();
  }
}

generateReport();