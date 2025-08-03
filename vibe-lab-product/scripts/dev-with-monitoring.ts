#!/usr/bin/env ts-node

/**
 * Development startup script with monitoring enabled
 * Initializes AVCA/DIAS monitoring and provides development insights
 */

import { unifiedMonitor } from '../lib/monitoring/unified-monitor';

function startDevelopmentWithMonitoring() {
  console.log('🚀 Starting Vibe Lab Development with Monitoring');
  console.log('================================================\n');

  // Start monitoring system
  unifiedMonitor.start();

  const status = unifiedMonitor.getSystemStatus();
  console.log('📊 Monitoring System Status:');
  console.log(`   Health: ${status.health}`);
  console.log(`   Logic Monitoring: ${status.logic.activeModules} modules ready`);
  console.log(`   Metrics Collection: ${status.metrics.services} services tracked`);
  console.log(`   Centralized Logging: ${status.logs.active ? 'Active' : 'Inactive'}\n`);

  console.log('🔍 Available Monitoring Interfaces:');
  console.log('   • Real-time Dashboard: http://localhost:3000/dev/monitor');
  console.log('   • Console Logs: Color-coded system activities');
  console.log('   • Test Monitoring: npm run test:vibe-lab-monitor\n');

  console.log('🎯 What You\'ll See During Development:');
  console.log('   🔷 AVCA Operations (Blue):');
  console.log('      - AI client requests and responses');
  console.log('      - Blueprint generation and validation');
  console.log('      - Document generation processes');
  console.log('      - Source analysis operations');
  console.log('   🧠 DIAS Intelligence (Green):');
  console.log('      - Pattern recognition analysis');
  console.log('      - Framework detection results');
  console.log('      - Learning system updates');
  console.log('      - Architecture insights');
  console.log('   🔗 Integration Layer (Purple):');
  console.log('      - Service orchestration');
  console.log('      - System health checks');
  console.log('      - Resilience patterns (circuit breakers, retries)');
  console.log('      - Performance monitoring\n');

  console.log('💡 Tips for Development:');
  console.log('   • Monitor console output for real-time system behavior');
  console.log('   • Use /dev/monitor page for visual monitoring');
  console.log('   • Watch for missing modules that need implementation');
  console.log('   • Performance metrics help optimize slow operations\n');

  console.log('✅ Monitoring system is now active for development!');
  console.log('   Start your Next.js development server to begin monitoring.\n');

  // Keep process alive for monitoring
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down monitoring system...');
    unifiedMonitor.stop();
    process.exit(0);
  });
}

// Only run if this script is executed directly
if (require.main === module) {
  startDevelopmentWithMonitoring();
}

export { startDevelopmentWithMonitoring };