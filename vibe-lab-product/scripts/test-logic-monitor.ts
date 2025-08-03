#!/usr/bin/env ts-node

/**
 * Test script to demonstrate AVCA/DIAS logic monitoring
 * Run with: npm run test:logic-monitor
 */

import { demonstrateMonitoring, detectMissingModules } from '../lib/monitoring/instrumented-example';
import { unifiedMonitor } from '../lib/monitoring/unified-monitor';

async function runTest() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('     AVCA/DIAS Logic Module Monitoring Test');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('This test demonstrates real-time monitoring of:');
  console.log('  • AVCA modules (AI Client, Blueprint Service, etc.)');
  console.log('  • DIAS modules (Pattern Recognition, Framework Detection, etc.)');
  console.log('  • Integration layer orchestration');
  console.log('  • Decision points and logic flow\n');

  console.log('Starting monitoring demo...\n');

  try {
    // Start unified monitoring
    console.log('Starting unified monitoring system...\n');
    unifiedMonitor.start();

    // Run the demonstration
    await demonstrateMonitoring();

    // Check for missing modules
    console.log('\n═══════════════════════════════════════════════════════════════');
    detectMissingModules();

    // Generate unified report
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(unifiedMonitor.generateReport());

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Monitoring test completed successfully!\n');
    console.log('Available monitoring interfaces:');
    console.log('  • Real-time dashboard: http://localhost:3000/dev/monitor');
    console.log('  • Console output: Running in development mode');
    console.log('  • Metrics collection: Integrated with existing system');
    console.log('  • Centralized logging: Structured logs with context\n');

    // Stop monitoring
    unifiedMonitor.stop();

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    unifiedMonitor.stop();
    process.exit(1);
  }
}

// Run the test
runTest();