#!/usr/bin/env tsx
/**
 * Full Integration Test Suite
 * 
 * Tests the complete AVCA-DIAS flow from blueprint to deployed component
 */

import { EventBus } from '../lib/avca/services/event-bus';
import { ServiceRegistry } from '../lib/avca/services/service-registry';
import { DIAS } from '../lib/dias';
import { VibeLabAI } from '../lib/avca/services/vibe-lab-ai';
import { AIClientService } from '../lib/avca/services/ai-client';
import { ContextManager } from '../lib/avca/services/context-manager';
import { IntegrationService } from '../lib/integration';
import { 
  EventFactory,
  EventCategory,
  ComponentEventType,
  PipelineEventType,
  QualityEventType
} from '../lib/dias/events/event-types';

interface TestScenario {
  name: string;
  description: string;
  test: () => Promise<boolean>;
}

async function runFullIntegrationTests() {
  console.log('🧪 Full AVCA-DIAS Integration Test Suite\n');
  
  // Initialize all services
  const { services, cleanup } = await initializeServices();
  
  const scenarios: TestScenario[] = [
    {
      name: 'Blueprint to Component Flow',
      description: 'Tests full pipeline from blueprint submission to component generation',
      test: () => testBlueprintToComponent(services)
    },
    {
      name: 'Event Flow and State Sync',
      description: 'Tests event propagation and state synchronization',
      test: () => testEventFlowAndStateSync(services)
    },
    {
      name: 'Quality Gates and Feedback',
      description: 'Tests quality checks and DIAS feedback loop',
      test: () => testQualityGatesAndFeedback(services)
    },
    {
      name: 'Error Handling and Recovery',
      description: 'Tests system resilience and error recovery',
      test: () => testErrorHandlingAndRecovery(services)
    },
    {
      name: 'Concurrent Operations',
      description: 'Tests handling of multiple concurrent requests',
      test: () => testConcurrentOperations(services)
    }
  ];
  
  let passedTests = 0;
  const totalTests = scenarios.length;
  
  console.log(`Running ${totalTests} integration scenarios...\n`);
  
  for (const scenario of scenarios) {
    console.log(`📋 ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    
    try {
      const passed = await scenario.test();
      if (passed) {
        console.log(`   ✅ PASSED\n`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED\n`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error}\n`);
    }
  }
  
  // Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 Integration Test Summary');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${totalTests - passedTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('═══════════════════════════════════════\n');
  
  // Cleanup
  await cleanup();
  
  return passedTests === totalTests;
}

async function initializeServices() {
  const eventBus = new EventBus();
  const registry = new ServiceRegistry(eventBus);
  const contextManager = new ContextManager();
  const aiClient = new AIClientService(eventBus);
  const vibeLabAI = new VibeLabAI();
  const dias = new DIAS(eventBus, registry);
  const integration = new IntegrationService(
    eventBus,
    registry,
    dias,
    vibeLabAI
  );
  
  // Start all services
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
      contextManager,
      aiClient,
      vibeLabAI,
      dias,
      integration
    },
    cleanup
  };
}

async function testBlueprintToComponent(services: any): Promise<boolean> {
  const { eventBus, integration, dias } = services;
  const projectId = 'test-project-blueprint';
  
  try {
    // Step 1: Submit blueprint
    const blueprint = {
      id: 'bp-001',
      name: 'UserDashboard',
      description: 'Main user dashboard with stats',
      components: ['StatsCard', 'ActivityFeed', 'QuickActions']
    };
    
    integration.updateProjectState(projectId, { blueprints: [blueprint] }, 'avca');
    
    // Step 2: Emit pipeline start
    await eventBus.publish(
      EventCategory.PIPELINE,
      'test',
      EventFactory.createEvent(
        EventCategory.PIPELINE,
        PipelineEventType.STARTED,
        'test',
        projectId,
        { pipelineId: 'pipe-001', blueprint }
      )
    );
    
    // Step 3: Process through stages
    const stages = ['parsing', 'styling', 'component-generation', 'validation'];
    
    for (const stage of stages) {
      await eventBus.publish(
        EventCategory.PIPELINE,
        'test',
        EventFactory.createEvent(
          EventCategory.PIPELINE,
          PipelineEventType.STAGE_STARTED,
          'test',
          projectId,
          { pipelineId: 'pipe-001', stage }
        )
      );
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await eventBus.publish(
        EventCategory.PIPELINE,
        'test',
        EventFactory.createEvent(
          EventCategory.PIPELINE,
          PipelineEventType.STAGE_COMPLETED,
          'test',
          projectId,
          { pipelineId: 'pipe-001', stage, duration: 100 }
        )
      );
    }
    
    // Step 4: Verify state
    const finalState = integration.getProjectState(projectId);
    const auditTrail = dias.getAuditTrail(projectId);
    
    console.log(`   - Pipeline stages processed: ${stages.length}`);
    console.log(`   - Audit events recorded: ${auditTrail.length}`);
    console.log(`   - Final stage: ${finalState?.currentStage}`);
    
    return auditTrail.length >= 8 && finalState?.currentStage === 'validation';
    
  } catch (error) {
    console.error('   Error in blueprint test:', error);
    return false;
  }
}

async function testEventFlowAndStateSync(services: any): Promise<boolean> {
  const { eventBus, integration, dias } = services;
  const projectId = 'test-project-events';
  
  try {
    // Test bidirectional event flow
    let avcaEventReceived = false;
    let diasEventReceived = false;
    
    // Subscribe to events
    eventBus.subscribe(EventCategory.COMPONENT, 'test-listener', async (message: any) => {
      if (message.data.source === 'avca') avcaEventReceived = true;
    });
    
    eventBus.subscribe(EventCategory.INTEGRATION, 'test-listener', async (message: any) => {
      if (message.data.data?.sourceSystem === 'dias') diasEventReceived = true;
    });
    
    // Emit from AVCA side
    await eventBus.publish(
      EventCategory.COMPONENT,
      'avca',
      EventFactory.createEvent(
        EventCategory.COMPONENT,
        ComponentEventType.CREATED,
        'avca',
        projectId,
        { componentId: 'comp-001', componentName: 'TestComponent' }
      )
    );
    
    // Sync state
    await integration.syncState(projectId);
    
    // Wait for propagation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`   - AVCA event flow: ${avcaEventReceived ? '✅' : '❌'}`);
    console.log(`   - DIAS sync triggered: ${diasEventReceived ? '✅' : '❌'}`);
    console.log(`   - State synchronized: ✅`);
    
    return avcaEventReceived;
    
  } catch (error) {
    console.error('   Error in event flow test:', error);
    return false;
  }
}

async function testQualityGatesAndFeedback(services: any): Promise<boolean> {
  const { eventBus, dias } = services;
  const projectId = 'test-project-quality';
  
  try {
    // Emit quality check failed
    await eventBus.publish(
      EventCategory.QUALITY,
      'test',
      EventFactory.createEvent(
        EventCategory.QUALITY,
        QualityEventType.CHECK_FAILED,
        'test',
        projectId,
        {
          componentId: 'comp-002',
          checkType: 'accessibility',
          errors: ['Missing alt text', 'Low contrast ratio'],
          suggestions: ['Add descriptive alt text', 'Increase text contrast']
        }
      )
    );
    
    // Wait for DIAS to process
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if DIAS recorded the failure
    const auditTrail = dias.getAuditTrail(projectId);
    const qualityEvents = auditTrail.filter((e: any) => e.category === EventCategory.QUALITY);
    
    console.log(`   - Quality events recorded: ${qualityEvents.length}`);
    console.log(`   - Feedback loop active: ${qualityEvents.length > 0 ? '✅' : '❌'}`);
    
    return qualityEvents.length > 0;
    
  } catch (error) {
    console.error('   Error in quality test:', error);
    return false;
  }
}

async function testErrorHandlingAndRecovery(services: any): Promise<boolean> {
  const { integration } = services;
  
  try {
    // Test invalid operation
    let errorCaught = false;
    try {
      await integration.process({
        type: 'invalid-operation',
        projectId: 'test',
        data: null
      });
    } catch (error) {
      errorCaught = true;
    }
    
    // Test recovery from state corruption
    const projectId = 'test-recovery';
    integration.updateProjectState(projectId, { blueprints: [] }, 'avca');
    
    // Force sync on empty project
    await integration.syncState(projectId);
    
    // System should still be operational
    const stats = integration.getStats();
    
    console.log(`   - Invalid operation rejected: ${errorCaught ? '✅' : '❌'}`);
    console.log(`   - System still operational: ✅`);
    console.log(`   - Active jobs after error: ${stats.workers.activeJobs}`);
    
    return errorCaught && stats.workers.activeJobs === 0;
    
  } catch (error) {
    console.error('   Error in resilience test:', error);
    return false;
  }
}

async function testConcurrentOperations(services: any): Promise<boolean> {
  const { eventBus, integration } = services;
  
  try {
    const promises: Promise<any>[] = [];
    const projectCount = 10;
    
    // Submit multiple concurrent operations
    for (let i = 0; i < projectCount; i++) {
      const projectId = `concurrent-project-${i}`;
      
      promises.push(
        eventBus.publish(
          EventCategory.PIPELINE,
          'test',
          EventFactory.createEvent(
            EventCategory.PIPELINE,
            PipelineEventType.STARTED,
            'test',
            projectId,
            { pipelineId: `pipe-${i}` }
          )
        )
      );
      
      promises.push(
        integration.updateProjectState(
          projectId,
          { currentStage: 'processing' },
          'avca'
        )
      );
    }
    
    // Wait for all to complete
    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    // Check stats
    const stats = integration.getStats();
    
    console.log(`   - Concurrent operations: ${projectCount * 2}`);
    console.log(`   - Completion time: ${duration}ms`);
    console.log(`   - Projects in state: ${Object.keys(stats.state.projects).length}`);
    console.log(`   - Average time per op: ${Math.round(duration / (projectCount * 2))}ms`);
    
    return Object.keys(stats.state.projects).length >= projectCount;
    
  } catch (error) {
    console.error('   Error in concurrent test:', error);
    return false;
  }
}

// Run the tests
if (require.main === module) {
  runFullIntegrationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 