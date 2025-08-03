/**
 * Phase 3 QUAL-001 Stage 2: Load Testing Demo
 * 
 * Shortened demo of load testing infrastructure for rapid validation
 */

import { LoadTestingInfrastructure } from './test-load-infrastructure';

async function runLoadTestingDemo() {
  const infrastructure = new LoadTestingInfrastructure();
  
  console.log('🧪 Running Load Testing Infrastructure Demo...\n');

  // Quick demo with smaller loads
  const testConfigurations = [
    { users: 5, duration: 2000, name: 'Quick Baseline Test' },
    { users: 25, duration: 3000, name: 'Quick Load Test' },
    { users: 50, duration: 4000, name: 'Quick Stress Test' }
  ];

  const results = [];

  for (const config of testConfigurations) {
    console.log(`🔬 Running ${config.name}...`);
    
    try {
      const result = await infrastructure.runLoadTest(config.users, config.duration);
      results.push(result);

      console.log(`   ✓ Completed: ${result.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`   📊 Metrics:`);
      console.log(`     • Total Requests: ${result.metrics.totalRequests}`);
      console.log(`     • Success Rate: ${(100 - result.metrics.errorRate).toFixed(1)}%`);
      console.log(`     • Avg Response Time: ${result.metrics.averageResponseTime.toFixed(2)}ms`);
      console.log(`     • Throughput: ${result.metrics.throughput.toFixed(1)} req/s`);
      console.log(`     • Memory Usage: ${result.metrics.memoryUsage.peak.toFixed(1)}MB`);
      
      if (result.bottlenecks.length > 0) {
        console.log(`   ⚠️  Bottlenecks: ${result.bottlenecks.join(', ')}`);
      }

    } catch (error) {
      console.error(`   ❌ ${config.name} failed:`, error);
    }
  }

  // Summary
  const passedTests = results.filter(r => r.passed);
  const totalRequests = results.reduce((sum, r) => sum + (r.metrics.totalRequests || 0), 0);

  console.log('\n📈 Load Testing Demo Results:');
  console.log(`   Tests Completed: ${results.length}`);
  console.log(`   Tests Passed: ${passedTests.length}/${results.length}`);
  console.log(`   Total Requests Processed: ${totalRequests}`);
  console.log(`   Peak Concurrent Users: ${Math.max(...results.map(r => r.metrics.concurrentUsers || 0))}`);

  console.log('\n✅ Load Testing Infrastructure Demo Complete!\n');
  
  return results;
}

if (require.main === module) {
  runLoadTestingDemo()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Load Testing Demo Failed:', error);
      process.exit(1);
    });
}