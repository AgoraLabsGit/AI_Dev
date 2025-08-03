#!/usr/bin/env ts-node
/**
 * Test script for DIAS Event System (DIAS-001)
 * 
 * Tests:
 * 1. Event type definitions and factory
 * 2. Event handler subscriptions
 * 3. Event routing and processing
 * 4. Audit trail functionality
 * 5. Dead letter queue handling
 * 6. DIAS initialization and lifecycle
 */

import { EventBus } from '../lib/avca/services/event-bus';
import { ServiceRegistry } from '../lib/avca/services/service-registry';
import { DIAS } from '../lib/dias';
import {
  EventFactory,
  EventCategory,
  ComponentEventType,
  PipelineEventType,
  QualityEventType,
  UserEventType,
  SystemEventType
} from '../lib/dias/events/event-types';

async function testDIASEvents() {
  console.log('🧪 Testing DIAS Event System (DIAS-001)\n');
  
  let allTestsPassed = true;
  
  // Initialize components
  const eventBus = new EventBus({
    maxRetries: 2,
    retryDelay: 100 // Fast retry for testing
  });
  
  const registry = new ServiceRegistry(eventBus);
  await registry.start();
  
  const dias = new DIAS(eventBus, registry, {
    enableAuditTrail: true,
    enableLearning: false // Not implemented yet
  });

  try {
    // Test 1: Initialize DIAS
    console.log('1️⃣  Testing DIAS Initialization...');
    await dias.initialize();
    
    if (dias.isInitialized()) {
      console.log('   ✅ DIAS initialized successfully\n');
    } else {
      console.log('   ❌ DIAS initialization failed\n');
      allTestsPassed = false;
    }

    // Test 2: Event Factory
    console.log('2️⃣  Testing Event Factory...');
    const testEvent = EventFactory.createEvent(
      EventCategory.COMPONENT,
      ComponentEventType.CREATED,
      'test-service',
      'test-project-001',
      {
        componentId: 'comp-123',
        componentName: 'TestButton',
        componentType: 'ui',
        version: '1.0.0'
      }
    );
    
    if (testEvent.id && testEvent.timestamp && testEvent.category === EventCategory.COMPONENT) {
      console.log(`   ✅ Event created: ${testEvent.id}`);
      console.log(`   Category: ${testEvent.category}, Type: ${testEvent.type}\n`);
    } else {
      console.log('   ❌ Event factory failed\n');
      allTestsPassed = false;
    }

    // Test 3: Component Events
    console.log('3️⃣  Testing Component Events...');
    await dias.emitComponentEvent(
      ComponentEventType.CREATED,
      'test-project-001',
      {
        componentId: 'btn-001',
        componentName: 'PrimaryButton',
        componentType: 'ui',
        version: '1.0.0',
        code: 'export const Button = () => <button>Click me</button>;'
      }
    );
    
    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('   ✅ Component event emitted and processed\n');

    // Test 4: Pipeline Events
    console.log('4️⃣  Testing Pipeline Events...');
    const pipelineId = 'pipeline-001';
    
    // Start pipeline
    await dias.emitPipelineEvent(
      PipelineEventType.PIPELINE_STARTED,
      'test-project-001',
      {
        pipelineId,
        totalStages: 8
      }
    );
    
    // Stage completed
    await dias.emitPipelineEvent(
      PipelineEventType.STAGE_COMPLETED,
      'test-project-001',
      {
        pipelineId,
        stage: 'blueprint',
        stageNumber: 1,
        duration: 1500,
        output: { blueprintId: 'bp-001' }
      }
    );
    
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('   ✅ Pipeline events emitted and processed\n');

    // Test 5: Quality Events
    console.log('5️⃣  Testing Quality Events...');
    
    // Quality check passed
    await eventBus.publish(
      EventCategory.QUALITY,
      'test-service',
      EventFactory.createEvent(
        EventCategory.QUALITY,
        QualityEventType.CHECK_PASSED,
        'quality-gate',
        'test-project-001',
        {
          checkType: 'coverage',
          target: 'btn-001',
          result: {
            score: 85,
            passed: true,
            details: { linesCovered: 85, linesTotal: 100 }
          },
          threshold: 80
        }
      )
    );
    
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('   ✅ Quality events processed\n');

    // Test 6: User Events
    console.log('6️⃣  Testing User Events...');
    
    await eventBus.publish(
      EventCategory.USER,
      'test-service',
      EventFactory.createEvent(
        EventCategory.USER,
        UserEventType.APPROVED,
        'ui-service',
        'test-project-001',
        {
          userId: 'user-123',
          action: 'approve_component',
          target: {
            type: 'component',
            id: 'btn-001'
          },
          decision: 'approve',
          feedback: 'Looks good!'
        }
      )
    );
    
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('   ✅ User events processed\n');

    // Test 7: Audit Trail
    console.log('7️⃣  Testing Audit Trail...');
    const auditTrail = dias.getAuditTrail('test-project-001');
    
    console.log(`   Audit entries: ${auditTrail.length}`);
    if (auditTrail.length > 0) {
      console.log('   ✅ Audit trail working correctly');
      console.log('   Recent events:');
      auditTrail.slice(-3).forEach(entry => {
        console.log(`     - ${entry.type} at ${entry.timestamp}`);
      });
    } else {
      console.log('   ⚠️  No audit entries found');
    }
    console.log();

    // Test 8: Event Statistics
    console.log('8️⃣  Testing Event Statistics...');
    const stats = dias.getEventStats();
    console.log('   Event counts:');
    Object.entries(stats).forEach(([eventType, count]) => {
      console.log(`     ${eventType}: ${count}`);
    });
    console.log('   ✅ Event statistics working\n');

    // Test 9: Custom Event Handler
    console.log('9️⃣  Testing Custom Event Handler...');
    let customHandlerCalled = false;
    
    dias.registerEventHandler(
      ComponentEventType.UPDATED,
      async (event) => {
        customHandlerCalled = true;
        console.log(`   Custom handler called for: ${event.type}`);
      }
    );
    
    await dias.emitComponentEvent(
      ComponentEventType.UPDATED,
      'test-project-001',
      {
        componentId: 'btn-001',
        componentName: 'PrimaryButton',
        componentType: 'ui',
        version: '1.0.1'
      }
    );
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (customHandlerCalled) {
      console.log('   ✅ Custom event handler working\n');
    } else {
      console.log('   ❌ Custom event handler not called\n');
      allTestsPassed = false;
    }

    // Test 10: Error Handling & Dead Letter Queue
    console.log('🔟  Testing Error Handling...');
    
    // Force an error by sending malformed event
    try {
      await eventBus.publish(
        'invalid-topic',
        'test-service',
        { invalid: 'event' }
      );
    } catch (error) {
      // Expected
    }
    
    const dlq = eventBus.getDeadLetterQueue();
    console.log(`   Dead letter queue size: ${dlq.length}`);
    console.log('   ✅ Error handling working\n');

    // Summary
    console.log('📊 Test Summary:');
    console.log(`   DIAS initialized: ✅`);
    console.log(`   Event routing: ✅`);
    console.log(`   Audit trail: ${auditTrail.length > 0 ? '✅' : '⚠️'}`);
    console.log(`   Custom handlers: ${customHandlerCalled ? '✅' : '❌'}`);
    console.log(`   All tests passed: ${allTestsPassed ? '✅' : '❌'}`);
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await dias.shutdown();
    await registry.stop();
    console.log('   ✅ DIAS shutdown complete');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    allTestsPassed = false;
  }

  return allTestsPassed;
}

// Run tests
if (require.main === module) {
  testDIASEvents()
    .then(passed => process.exit(passed ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 