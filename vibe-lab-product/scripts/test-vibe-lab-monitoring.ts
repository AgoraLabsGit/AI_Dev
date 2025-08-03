#!/usr/bin/env ts-node

/**
 * Test monitoring system with actual Vibe Lab operations
 * This will trigger real AVCA/DIAS operations and show monitoring in action
 */

import { unifiedMonitor } from '../lib/monitoring/unified-monitor';
import { AIClientService, AIRole, EntryPathType } from '../lib/avca/services/ai-client';
import { BlueprintService } from '../lib/avca/services/blueprint-service';
import { PatternRecognitionEngine } from '../lib/dias/intelligence/pattern-recognition-engine';
import { SystemIntegrator } from '../lib/integration/system-integrator';
import { EventBus } from '../lib/avca/services/event-bus';

async function testVibeLabMonitoring() {
  console.log('🚀 Testing AVCA/DIAS Monitoring with Vibe Lab Operations');
  console.log('=======================================================\n');

  // Initialize EventBus and services
  const eventBus = new EventBus();
  
  console.log('🔧 Initializing services...\n');
  
  try {
    // Start monitoring
    unifiedMonitor.start();
    console.log('✅ Monitoring system started\n');

    // Initialize System Integrator (this coordinates AVCA & DIAS)
    const systemIntegrator = new SystemIntegrator({
      eventBus,
      enableMonitoring: true,
      enableLogging: true,
      enableResilience: true
    });

    await systemIntegrator.initialize();
    console.log('✅ System Integrator initialized\n');

    console.log('📊 Running test operations...\n');

    // Test 1: Check System Health (Integration Layer)
    console.log('🔍 Test 1: System Health Check');
    const healthStatus = await systemIntegrator.checkSystemHealth();
    console.log(`   Status: ${healthStatus.status}`);
    console.log(`   Services: ${Object.keys(healthStatus.services).length}`);
    console.log(`   Error Rate: ${healthStatus.metrics.errorRate}%\n`);

    // Test 2: Initialize AI Client (AVCA)
    console.log('🔍 Test 2: AI Client Analysis');
    const aiClient = new AIClientService(eventBus);
    await aiClient.initialize();

    // Simulate analyzing a fresh project
    const analysisResult = await aiClient.analyzeInput({
      role: AIRole.ANALYZER,
      prompt: 'Analyze project requirements',
      entryPath: EntryPathType.FRESH,
      source: {
        type: EntryPathType.FRESH,
        content: {
          name: 'Test SaaS Project',
          description: 'A multi-tenant SaaS platform with real-time features',
          features: ['authentication', 'billing', 'analytics', 'real-time-chat']
        }
      }
    });
    console.log(`   Analysis completed: ${analysisResult.projectType}`);
    console.log(`   Features identified: ${analysisResult.features.length}`);
    console.log(`   Confidence: ${analysisResult.confidence}%\n`);

    // Test 3: Pattern Recognition (DIAS)
    console.log('🔍 Test 3: DIAS Pattern Recognition');
    const patternEngine = new PatternRecognitionEngine({
      name: 'test-pattern-engine',
      version: '1.0.0',
      eventBus,
      analysisDepth: 'deep',
      confidenceThreshold: 0.8
    });
    
    await patternEngine.initialize();
    
    const patternAnalysis = await patternEngine.process({
      type: 'codebase',
      content: {
        files: ['src/components/UserAuth.tsx', 'src/services/billing.ts'],
        framework: 'react',
        patterns: ['component-based', 'service-layer']
      }
    });
    
    console.log(`   Patterns found: ${patternAnalysis.patterns.length}`);
    console.log(`   Insights generated: ${patternAnalysis.insights.length}`);
    console.log(`   Overall confidence: ${patternAnalysis.confidence}%\n`);

    // Test 4: Blueprint Generation (AVCA)
    console.log('🔍 Test 4: Blueprint Service');
    const blueprintService = new BlueprintService();
    await blueprintService.initialize();
    
    const blueprintResult = await blueprintService.process({
      requestId: 'test-blueprint-001',
      userIntent: {
        type: 'create_application',
        requirements: {
          name: 'Test App',
          description: 'Testing blueprint generation',
          features: ['auth', 'dashboard', 'api'],
          constraints: ['tailwind-only', 'nextjs']
        }
      }
    });
    
    console.log(`   Blueprint generated: ${blueprintResult.blueprint.name}`);
    console.log(`   Components: ${blueprintResult.blueprint.components?.length || 0}`);
    console.log(`   Cost: $${blueprintResult.cost.toFixed(4)}\n`);

    // Display monitoring results
    console.log('📊 Monitoring Results:');
    console.log('====================');
    console.log(unifiedMonitor.generateReport());

    // Cleanup
    await systemIntegrator.cleanup();
    await aiClient.cleanup();
    await patternEngine.cleanup();
    await blueprintService.cleanup();
    
    unifiedMonitor.stop();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n🔍 To see real-time monitoring during development:');
    console.log('   1. Start the Next.js dev server: npm run dev');
    console.log('   2. Navigate to: http://localhost:3000/dev/monitor');
    console.log('   3. Use Vibe Lab features to see live monitoring\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    unifiedMonitor.stop();
    process.exit(1);
  }
}

// Run the test
testVibeLabMonitoring();