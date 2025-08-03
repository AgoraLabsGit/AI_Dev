#!/usr/bin/env tsx
/**
 * Load Testing Script
 * 
 * Tests system performance under high concurrent load
 */

import { EventBus } from '../lib/avca/services/event-bus';
import { ServiceRegistry } from '../lib/avca/services/service-registry';
import { DIAS } from '../lib/dias';
import { VibeLabAI } from '../lib/avca/services/vibe-lab-ai';
import { AIClientService } from '../lib/avca/services/ai-client';
import { IntegrationService } from '../lib/integration';
import { 
  EventFactory,
  EventCategory,
  PipelineEventType
} from '../lib/dias/events/event-types';

interface LoadTestConfig {
  concurrent: number;
  duration: number; // seconds
  rampUp: number; // seconds
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

async function runLoadTest(config: LoadTestConfig = {
  concurrent: 100,
  duration: 30,
  rampUp: 5
}) {
  console.log('🚀 Load Testing AVCA-DIAS System\n');
  console.log(`Configuration:`);
  console.log(`  - Concurrent Users: ${config.concurrent}`);
  console.log(`  - Test Duration: ${config.duration}s`);
  console.log(`  - Ramp Up Time: ${config.rampUp}s\n`);
  
  // Initialize services
  const { services, cleanup } = await initializeServices();
  
  const results: LoadTestResult = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    requestsPerSecond: 0,
    errors: []
  };
  
  const responseTimes: number[] = [];
  let activeUsers = 0;
  let testRunning = true;
  
  // Gradually ramp up users
  const rampUpInterval = (config.rampUp * 1000) / config.concurrent;
  const userPromises: Promise<void>[] = [];
  
  console.log('🔄 Ramping up users...');
  
  for (let i = 0; i < config.concurrent; i++) {
    setTimeout(() => {
      if (testRunning) {
        activeUsers++;
        console.log(`  Active users: ${activeUsers}/${config.concurrent}`);
        userPromises.push(simulateUser(i, services, results, responseTimes, () => testRunning));
      }
    }, i * rampUpInterval);
  }
  
  // Run test for specified duration
  setTimeout(() => {
    testRunning = false;
    console.log('\n⏹️  Stopping test...');
  }, (config.duration + config.rampUp) * 1000);
  
  // Wait for ramp up to complete
  await new Promise(resolve => setTimeout(resolve, config.rampUp * 1000));
  console.log('\n✅ All users active. Running load test...\n');
  
  // Show progress
  const progressInterval = setInterval(() => {
    if (testRunning) {
      const rps = results.totalRequests / ((Date.now() - startTime) / 1000);
      console.log(`📊 Progress: ${results.totalRequests} requests | ${rps.toFixed(1)} req/s | ${results.failedRequests} errors`);
    }
  }, 5000);
  
  const startTime = Date.now();
  
  // Wait for test to complete
  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (!testRunning && userPromises.length === config.concurrent) {
        clearInterval(checkInterval);
        clearInterval(progressInterval);
        resolve(undefined);
      }
    }, 100);
  });
  
  // Wait for all users to finish
  await Promise.all(userPromises);
  
  // Calculate final metrics
  const testDuration = (Date.now() - startTime) / 1000;
  results.requestsPerSecond = results.totalRequests / testDuration;
  results.averageResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  // Display results
  displayResults(results, config);
  
  // Cleanup
  await cleanup();
  
  return results.failedRequests === 0;
}

async function simulateUser(
  userId: number,
  services: any,
  results: LoadTestResult,
  responseTimes: number[],
  isRunning: () => boolean
) {
  const { eventBus, integration } = services;
  const userProjectId = `load-test-user-${userId}`;
  
  while (isRunning()) {
    const requestStart = Date.now();
    
    try {
      // Simulate different types of operations
      const operation = Math.floor(Math.random() * 4);
      
      switch (operation) {
        case 0:
          // Pipeline event
          await eventBus.publish(
            EventCategory.PIPELINE,
            `user-${userId}`,
            EventFactory.createEvent(
              EventCategory.PIPELINE,
              PipelineEventType.PIPELINE_STARTED,
              `user-${userId}`,
              userProjectId,
              { pipelineId: `pipe-${Date.now()}` }
            )
          );
          break;
          
        case 1:
          // State update
          integration.updateProjectState(
            userProjectId,
            { currentStage: `stage-${Date.now()}` },
            'avca'
          );
          break;
          
        case 2:
          // State query
          integration.getProjectState(userProjectId);
          break;
          
        case 3:
          // State sync
          await integration.syncState(userProjectId);
          break;
      }
      
      const responseTime = Date.now() - requestStart;
      responseTimes.push(responseTime);
      results.totalRequests++;
      results.successfulRequests++;
      results.minResponseTime = Math.min(results.minResponseTime, responseTime);
      results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
      
    } catch (error) {
      results.totalRequests++;
      results.failedRequests++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!results.errors.includes(errorMessage)) {
        results.errors.push(errorMessage);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  }
}

async function initializeServices() {
  const eventBus = new EventBus();
  const registry = new ServiceRegistry(eventBus);
  const aiClient = new AIClientService(eventBus);
  const vibeLabAI = new VibeLabAI();
  const dias = new DIAS(eventBus, registry);
  const integration = new IntegrationService(
    eventBus,
    registry,
    dias,
    vibeLabAI
  );
  
  // Start services
  await registry.start();
  await aiClient.start();
  await dias.initialize();
  await integration.start();
  
  const cleanup = async () => {
    await integration.stop();
    await dias.shutdown();
    await aiClient.stop();
    await registry.stop();
  };
  
  return {
    services: {
      eventBus,
      registry,
      aiClient,
      vibeLabAI,
      dias,
      integration
    },
    cleanup
  };
}

function displayResults(results: LoadTestResult, config: LoadTestConfig) {
  console.log('\n═══════════════════════════════════════');
  console.log('📊 Load Test Results');
  console.log('═══════════════════════════════════════\n');
  
  console.log('📈 Request Statistics:');
  console.log(`   Total Requests: ${results.totalRequests}`);
  console.log(`   Successful: ${results.successfulRequests} (${((results.successfulRequests / results.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`   Failed: ${results.failedRequests} (${((results.failedRequests / results.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`   Requests/Second: ${results.requestsPerSecond.toFixed(2)}`);
  
  console.log('\n⏱️  Response Times:');
  console.log(`   Average: ${results.averageResponseTime.toFixed(2)}ms`);
  console.log(`   Min: ${results.minResponseTime}ms`);
  console.log(`   Max: ${results.maxResponseTime}ms`);
  
  console.log('\n🎯 Performance Targets:');
  const targets = {
    responseTime: results.averageResponseTime < 100,
    errorRate: (results.failedRequests / results.totalRequests) < 0.01,
    throughput: results.requestsPerSecond > 50
  };
  
  console.log(`   Avg Response < 100ms: ${targets.responseTime ? '✅' : '❌'} (${results.averageResponseTime.toFixed(0)}ms)`);
  console.log(`   Error Rate < 1%: ${targets.errorRate ? '✅' : '❌'} (${((results.failedRequests / results.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`   Throughput > 50 req/s: ${targets.throughput ? '✅' : '❌'} (${results.requestsPerSecond.toFixed(0)} req/s)`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors Encountered:');
    results.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════\n');
  
  const allTargetsMet = Object.values(targets).every(t => t);
  console.log(`Overall Result: ${allTargetsMet ? '✅ PASSED' : '❌ FAILED'}`);
}

// Run load test
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: LoadTestConfig = {
    concurrent: parseInt(args[0]) || 100,
    duration: parseInt(args[1]) || 30,
    rampUp: parseInt(args[2]) || 5
  };
  
  runLoadTest(config)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 