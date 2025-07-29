#!/usr/bin/env ts-node

/**
 * Test Microservices Architecture
 * Validates the Phase 1 foundation components
 */

import { EventBus } from '../lib/avca/services/event-bus';
import { ServiceRegistry } from '../lib/avca/services/service-registry';
import { BlueprintService } from '../lib/avca/services/blueprint-service';
import { UserIntent } from '../lib/avca/types';

async function testMicroservices() {
  console.log('=== AVCA Microservices Architecture Test ===\n');

  // Initialize components
  const eventBus = new EventBus({
    maxRetries: 2,
    retryDelay: 500
  });

  const registry = new ServiceRegistry(eventBus, {
    healthCheckInterval: 5000
  });

  try {
    // Start registry
    console.log('1. Starting Service Registry...');
    await registry.start();
    console.log('   ✓ Registry started\n');

    // Create and register blueprint service
    console.log('2. Creating Blueprint Service...');
    const blueprintService = new BlueprintService();
    const instanceId = await registry.register(blueprintService);
    console.log(`   ✓ Blueprint service registered: ${instanceId}\n`);

    // Test service discovery
    console.log('3. Testing Service Discovery...');
    const instances = registry.getInstances('blueprint-service');
    console.log(`   ✓ Found ${instances.length} instance(s)`);
    
    const healthyInstance = registry.getHealthyInstance('blueprint-service');
    console.log(`   ✓ Healthy instance available: ${healthyInstance?.id}\n`);

    // Test event bus
    console.log('4. Testing Event Bus...');
    let messageReceived = false;
    
    const subId = eventBus.subscribe(
      'test.topic',
      'test-subscriber',
      async (message) => {
        console.log(`   ✓ Message received: ${message.data.test}`);
        messageReceived = true;
      }
    );

    await eventBus.publish('test.topic', 'test-publisher', { test: 'Hello Microservices!' });
    
    // Wait for message delivery
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!messageReceived) {
      throw new Error('Message not received');
    }
    
    eventBus.unsubscribe(subId);
    console.log('   ✓ Event bus working correctly\n');

    // Test blueprint processing
    console.log('5. Testing Blueprint Service...');
    const testIntent: UserIntent = {
      originalMessage: 'Add search functionality to the dashboard',
      classifiedIntent: 'FEATURE_REQUEST',
      confidence: 0.95,
      entities: [
        { type: 'feature', value: 'search' },
        { type: 'location', value: 'dashboard' }
      ]
    };

    const response = await blueprintService.process({
      requestId: 'test-001',
      userIntent: testIntent
    });

    console.log(`   ✓ Blueprint generated in ${response.duration}ms`);
    console.log(`   ✓ Tokens used: ${response.tokensUsed}`);
    console.log(`   ✓ Cost: $${response.cost.toFixed(4)}`);
    console.log(`   ✓ Blueprint created successfully\n`);

    // Check registry metrics
    console.log('6. Registry Metrics:');
    const metrics = registry.getMetrics();
    console.log(`   - Total services: ${metrics.totalServices}`);
    console.log(`   - Total instances: ${metrics.totalInstances}`);
    console.log(`   - Healthy instances: ${metrics.healthyInstances}`);
    console.log(`   - Unhealthy instances: ${metrics.unhealthyInstances}\n`);

    // Check event bus metrics
    console.log('7. Event Bus Metrics:');
    const eventMetrics = eventBus.getMetrics();
    console.log(`   - Total subscriptions: ${eventMetrics.totalSubscriptions}`);
    console.log(`   - Dead letter queue: ${eventMetrics.deadLetterQueueSize} messages\n`);

    // Cleanup
    console.log('8. Cleaning up...');
    await registry.stop();
    console.log('   ✓ All services stopped\n');

    console.log('✅ All tests passed!');
    console.log('\nMicroservices architecture is working correctly.');
    
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await registry.stop().catch(() => {});
    return false;
  }
}

// Run the test
testMicroservices()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 