#!/usr/bin/env tsx
/**
 * Standalone SuperClaude Services Test
 * Tests services without requiring API keys
 */

import { personaMapper } from '../src/lib/integration/persona-mapper';
import { context7Service } from '../src/lib/integration/mcp-context7-service';
import { EventBus } from '../src/lib/avca/services/event-bus';
import { AIRole } from '../src/lib/avca/services/ai-client';

interface TestResult {
  component: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details?: any;
  error?: string;
}

class StandaloneServiceTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 SuperClaude Services Standalone Test');
    console.log('='.repeat(50));

    await this.testPersonaMapper();
    await this.testEventBus();
    await this.testContext7ServiceStructure();
    await this.testAPIEndpointsStructure();

    this.printReport();
  }

  private async testPersonaMapper(): Promise<void> {
    console.log('\n📋 Testing PersonaMapper');
    console.log('-'.repeat(30));

    // Test 1: Basic role mapping
    await this.runTest('PersonaMapper', 'Role to Persona Mapping', () => {
      const persona = personaMapper.mapRoleToPersona(AIRole.DEVELOPER);
      if (persona !== 'frontend') {
        throw new Error(`Expected 'frontend', got '${persona}'`);
      }
      return { persona, role: AIRole.DEVELOPER };
    });

    // Test 2: Context refinement
    await this.runTest('PersonaMapper', 'Context-Aware Refinement', () => {
      const persona = personaMapper.mapRoleToPersona(AIRole.DEVELOPER, 'API security audit');
      if (persona !== 'security') {
        throw new Error(`Expected 'security', got '${persona}'`);
      }
      return { persona, contextUsed: true };
    });

    // Test 3: Confidence scoring
    await this.runTest('PersonaMapper', 'Confidence Scoring', () => {
      const selection = personaMapper.selectPersonaWithConfidence(
        AIRole.AUDITOR,
        'performance optimization',
        'improve slow database queries'
      );
      
      if (selection.confidence < 0.7) {
        throw new Error(`Low confidence: ${selection.confidence}`);
      }
      
      return selection;
    });

    // Test 4: Command mappings
    await this.runTest('PersonaMapper', 'Command Mappings', () => {
      const planMapping = personaMapper.getCommandMapping('/plan');
      const reviewMapping = personaMapper.getCommandMapping('/review');
      const helpMapping = personaMapper.getCommandMapping('/help');
      
      if (!planMapping || planMapping.suggestedPersona !== 'architect') {
        throw new Error('Plan mapping failed');
      }
      
      return { planMapping, reviewMapping, helpMapping };
    });

    // Test 5: Reverse mapping
    await this.runTest('PersonaMapper', 'Reverse Persona Mapping', () => {
      const securityRole = personaMapper.mapPersonaToRole('security');
      const frontendRole = personaMapper.mapPersonaToRole('frontend');
      const qaRole = personaMapper.mapPersonaToRole('qa');
      
      return { 
        security: securityRole,
        frontend: frontendRole,
        qa: qaRole
      };
    });
  }

  private async testEventBus(): Promise<void> {
    console.log('\n🚌 Testing EventBus');
    console.log('-'.repeat(30));

    const eventBus = new EventBus();

    await this.runTest('EventBus', 'Event Emission and Subscription', () => {
      let received = false;
      let receivedData: any = null;

      // Subscribe to test event
      eventBus.subscribe('test', 'activation', (data) => {
        received = true;
        receivedData = data;
      });

      // Emit test event
      eventBus.emit('test', 'activation', { test: true, timestamp: Date.now() });

      // Give a moment for async processing
      return new Promise((resolve) => {
        setTimeout(() => {
          if (!received) {
            throw new Error('Event not received');
          }
          resolve({ received, receivedData });
        }, 10);
      });
    });

    await this.runTest('EventBus', 'Message Queuing', () => {
      // Test message queuing when no subscribers
      eventBus.emit('orphan', 'message', { queued: true });
      
      const stats = eventBus.getStats();
      return { stats, hasOrphanQueue: stats.totalMessages > 0 };
    });
  }

  private async testContext7ServiceStructure(): Promise<void> {
    console.log('\n📚 Testing Context7 Service Structure');
    console.log('-'.repeat(30));

    await this.runTest('Context7Service', 'Service Structure', () => {
      // Test service structure without actually calling CLI
      const cacheStats = context7Service.getCacheStats();
      
      // Test cache management
      context7Service.clearCache();
      const clearedStats = context7Service.getCacheStats();
      
      return {
        initialCacheSize: cacheStats.size,
        clearedCacheSize: clearedStats.size,
        hasCache: true
      };
    });

    await this.runTest('Context7Service', 'Methods Available', () => {
      // Verify all expected methods exist
      const methods = [
        'resolveLibraryId',
        'getLibraryDocs', 
        'searchPatterns',
        'getFrameworkDocs',
        'getCacheStats',
        'clearCache'
      ];
      
      const availableMethods = methods.filter(method => 
        typeof (context7Service as any)[method] === 'function'
      );
      
      if (availableMethods.length !== methods.length) {
        throw new Error(`Missing methods: ${methods.filter(m => !availableMethods.includes(m))}`);
      }
      
      return { methods: availableMethods };
    });
  }

  private async testAPIEndpointsStructure(): Promise<void> {
    console.log('\n🌐 Testing API Endpoints Structure');
    console.log('-'.repeat(30));

    const fs = require('fs');
    const path = require('path');

    await this.runTest('API Endpoints', 'Files Exist', () => {
      const apiDir = path.join(process.cwd(), 'src/app/api');
      const endpoints = ['plan', 'review', 'help'];
      
      const existingEndpoints = endpoints.filter(endpoint => {
        const routePath = path.join(apiDir, endpoint, 'route.ts');
        return fs.existsSync(routePath);
      });
      
      if (existingEndpoints.length !== endpoints.length) {
        throw new Error(`Missing endpoints: ${endpoints.filter(e => !existingEndpoints.includes(e))}`);
      }
      
      return { endpoints: existingEndpoints };
    });

    await this.runTest('API Endpoints', 'Import Structure', async () => {
      // Test that endpoints can import required services
      const endpoints = ['plan', 'review', 'help'];
      const importTests = [];
      
      for (const endpoint of endpoints) {
        try {
          const routePath = path.join(process.cwd(), 'src/app/api', endpoint, 'route.ts');
          const content = fs.readFileSync(routePath, 'utf8');
          
          const hasPersonaMapper = content.includes('persona-mapper');
          const hasEnhancedClient = content.includes('enhanced-ai-client');
          const hasEventBus = content.includes('event-bus');
          
          importTests.push({
            endpoint,
            hasPersonaMapper,
            hasEnhancedClient,
            hasEventBus
          });
        } catch (error) {
          importTests.push({
            endpoint,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      return { importTests };
    });
  }

  private async runTest(
    component: string,
    test: string,
    testFn: () => any
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`  ⏳ ${test}...`);
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ ${test} (${duration}ms)`);
      this.results.push({
        component,
        test,
        status: 'PASS',
        duration,
        details: result
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.log(`  ❌ ${test} (${duration}ms): ${errorMessage}`);
      this.results.push({
        component,
        test,
        status: 'FAIL',
        duration,
        error: errorMessage
      });
    }
  }

  private printReport(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 STANDALONE TEST REPORT');
    console.log('='.repeat(50));

    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${total}`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log(`\n🚨 Failed Tests:`);
      this.results.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`  ❌ ${test.component} - ${test.test}`);
        console.log(`     Error: ${test.error}`);
      });
    }

    console.log(`\n✅ Integration Status:`);
    console.log(`  📋 PersonaMapper: ${this.getComponentStatus('PersonaMapper')}`);
    console.log(`  🚌 EventBus: ${this.getComponentStatus('EventBus')}`);
    console.log(`  📚 Context7Service: ${this.getComponentStatus('Context7Service')}`);
    console.log(`  🌐 API Endpoints: ${this.getComponentStatus('API Endpoints')}`);

    const overallReady = (passed / total) >= 0.8;
    console.log(`\n🎯 Ready for Phase 1A: ${overallReady ? '✅ YES' : '❌ NO'}`);

    if (overallReady) {
      console.log(`\n📋 Next Steps:`);
      console.log('  1. ✅ Core services are functional');
      console.log('  2. 🔧 Set ANTHROPIC_API_KEY for full AI client testing');
      console.log('  3. 🚀 Begin frontend integration (Phase 1B)');
      console.log('  4. 🧪 Run full integration tests with API key');
    }

    console.log('\n' + '='.repeat(50));
  }

  private getComponentStatus(component: string): string {
    const componentTests = this.results.filter(r => r.component === component);
    const passed = componentTests.filter(r => r.status === 'PASS').length;
    const total = componentTests.length;
    
    if (total === 0) return '❌ No tests';
    const rate = (passed / total) * 100;
    
    if (rate === 100) return '✅ Ready';
    if (rate >= 80) return '⚠️  Mostly Ready';
    return '❌ Needs Work';
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new StandaloneServiceTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n🎉 Standalone testing completed');
    })
    .catch(error => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}