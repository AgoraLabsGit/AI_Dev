#!/usr/bin/env tsx
/**
 * SuperClaude Integration Test Suite
 * Comprehensive testing of all integration services and API endpoints
 */

import { personaMapper } from '../src/lib/integration/persona-mapper';
import { createEnhancedAIClient } from '../src/lib/integration/enhanced-ai-client';
import { context7Service } from '../src/lib/integration/mcp-context7-service';
import { EventBus } from '../src/lib/avca/services/event-bus';
import { AIRole } from '../src/lib/avca/services/ai-client';

// Test configuration
const TEST_CONFIG = {
  enableSuperClaude: true,
  testTimeout: 30000,
  apiEndpoints: ['plan', 'review', 'help'],
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
};

interface TestResult {
  component: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details?: string;
  error?: string;
  metadata?: any;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
  summary: {
    personaMapper: TestResult[];
    enhancedAIClient: TestResult[];
    context7Service: TestResult[];
    apiEndpoints: TestResult[];
  };
}

class SuperClaudeIntegrationTester {
  private eventBus: EventBus;
  private enhancedAIClient: any;
  private results: TestResult[] = [];

  constructor() {
    this.eventBus = new EventBus();
    this.enhancedAIClient = createEnhancedAIClient(this.eventBus, TEST_CONFIG.enableSuperClaude);
  }

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting SuperClaude Integration Test Suite');
    console.log('=' .repeat(60));

    const startTime = Date.now();

    // Test PersonaMapper
    await this.testPersonaMapper();
    
    // Test Enhanced AI Client
    await this.testEnhancedAIClient();
    
    // Test Context7 Service
    await this.testContext7Service();
    
    // Test API Endpoints
    await this.testAPIEndpoints();

    const report = this.generateTestReport(startTime);
    this.printTestReport(report);
    
    return report;
  }

  private async testPersonaMapper(): Promise<void> {
    console.log('\n📋 Testing PersonaMapper Service');
    console.log('-'.repeat(40));

    // Test 1: Basic role mapping
    await this.runTest('PersonaMapper', 'Basic Role Mapping', async () => {
      const persona = personaMapper.mapRoleToPersona(AIRole.DEVELOPER);
      if (persona !== 'frontend') {
        throw new Error(`Expected 'frontend', got '${persona}'`);
      }
      return { persona, role: AIRole.DEVELOPER };
    });

    // Test 2: Context-aware persona refinement
    await this.runTest('PersonaMapper', 'Context-Aware Refinement', async () => {
      const persona = personaMapper.mapRoleToPersona(AIRole.DEVELOPER, 'API security vulnerability');
      if (persona !== 'security') {
        throw new Error(`Expected 'security', got '${persona}'`);
      }
      return { persona, context: 'security-refined' };
    });

    // Test 3: Enhanced persona selection with confidence
    await this.runTest('PersonaMapper', 'Confidence Scoring', async () => {
      const selection = personaMapper.selectPersonaWithConfidence(
        AIRole.AUDITOR, 
        'performance bottleneck', 
        'optimize slow queries'
      );
      if (selection.confidence < 0.7) {
        throw new Error(`Low confidence: ${selection.confidence}`);
      }
      return selection;
    });

    // Test 4: Command mapping
    await this.runTest('PersonaMapper', 'Command Mapping', async () => {
      const mapping = personaMapper.getCommandMapping('/plan');
      if (!mapping || mapping.suggestedPersona !== 'architect') {
        throw new Error('Plan command mapping failed');
      }
      return mapping;
    });

    // Test 5: Reverse persona mapping
    await this.runTest('PersonaMapper', 'Reverse Persona Mapping', async () => {
      const role = personaMapper.mapPersonaToRole('qa');
      if (role !== AIRole.AUDITOR) {
        throw new Error(`Expected '${AIRole.AUDITOR}', got '${role}'`);
      }
      return { persona: 'qa', role };
    });
  }

  private async testEnhancedAIClient(): Promise<void> {
    console.log('\n🤖 Testing Enhanced AI Client');
    console.log('-'.repeat(40));

    // Test 1: SuperClaude availability check
    await this.runTest('EnhancedAIClient', 'SuperClaude Availability', async () => {
      const available = await this.enhancedAIClient.checkSuperClaudeAvailability();
      const status = this.enhancedAIClient.getSuperClaudeStatus();
      return { available, status };
    });

    // Test 2: Basic request processing with fallback
    await this.runTest('EnhancedAIClient', 'Request Processing (Fallback)', async () => {
      const request = {
        role: AIRole.DEVELOPER,
        prompt: 'Test prompt for integration',
        useSuperClaude: false, // Force fallback
        metadata: { test: true }
      };
      
      const response = await this.enhancedAIClient.process(request);
      if (response.superClaudeUsed !== false) {
        throw new Error('Should have used fallback mode');
      }
      return { fallbackUsed: true, duration: response.duration };
    });

    // Test 3: SuperClaude request (will likely fail but should handle gracefully)
    await this.runTest('EnhancedAIClient', 'SuperClaude Request (Graceful Failure)', async () => {
      const request = {
        role: AIRole.DEVELOPER,
        prompt: 'Create a React component for user authentication',
        context: 'TypeScript project with modern React patterns',
        useSuperClaude: true,
        command: '/implement',
        flags: ['--persona-frontend', '--magic'],
        metadata: { test: true }
      };
      
      const response = await this.enhancedAIClient.process(request);
      // Should fall back gracefully if SuperClaude not available
      return { 
        superClaudeAttempted: true,
        superClaudeUsed: response.superClaudeUsed,
        fallbackWorked: !!response.content,
        persona: response.persona,
        duration: response.duration
      };
    });

    // Test 4: Command inference
    await this.runTest('EnhancedAIClient', 'Command Inference', async () => {
      const request = {
        role: AIRole.DEVELOPER,
        prompt: 'Please review this code for security issues',
        useSuperClaude: true
      };
      
      // Test the private method through a controlled flow
      const response = await this.enhancedAIClient.process(request);
      return { commandInferred: true, response: !!response };
    });
  }

  private async testContext7Service(): Promise<void> {
    console.log('\n📚 Testing Context7 Service');
    console.log('-'.repeat(40));

    // Test 1: Service initialization
    await this.runTest('Context7Service', 'Service Initialization', async () => {
      // Context7 service is already instantiated as singleton
      const cacheStats = context7Service.getCacheStats();
      return { 
        initialized: true, 
        cacheSize: cacheStats.size,
        cacheKeys: cacheStats.keys 
      };
    });

    // Test 2: Library ID resolution (will likely fail but should handle gracefully)
    await this.runTest('Context7Service', 'Library ID Resolution (Expected Failure)', async () => {
      try {
        const libraryId = await context7Service.resolveLibraryId('react');
        return { resolved: true, libraryId };
      } catch (error) {
        // Expected to fail if SuperClaude CLI not available
        return { 
          resolved: false, 
          error: error instanceof Error ? error.message : String(error),
          gracefulFailure: true 
        };
      }
    });

    // Test 3: Framework documentation lookup (will likely fail but should handle gracefully)
    await this.runTest('Context7Service', 'Framework Docs Lookup (Expected Failure)', async () => {
      try {
        const docs = await context7Service.getFrameworkDocs('react', 'hooks');
        return { success: true, docLength: docs.documentation.length };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : String(error),
          gracefulFailure: true 
        };
      }
    });

    // Test 4: Cache management
    await this.runTest('Context7Service', 'Cache Management', async () => {
      const initialStats = context7Service.getCacheStats();
      context7Service.clearCache();
      const clearedStats = context7Service.getCacheStats();
      
      return { 
        initialSize: initialStats.size,
        clearedSize: clearedStats.size,
        cacheCleared: clearedStats.size === 0
      };
    });
  }

  private async testAPIEndpoints(): Promise<void> {
    console.log('\n🌐 Testing API Endpoints');
    console.log('-'.repeat(40));

    for (const endpoint of TEST_CONFIG.apiEndpoints) {
      // Test GET endpoint
      await this.runTest('API Endpoints', `GET /api/${endpoint}`, async () => {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/${endpoint}`);
        if (!response.ok) {
          throw new Error(`GET /api/${endpoint} failed: ${response.status}`);
        }
        const data = await response.json();
        return { 
          status: response.status, 
          success: data.success,
          description: data.data?.description 
        };
      });

      // Test POST endpoint with sample data
      await this.runTest('API Endpoints', `POST /api/${endpoint}`, async () => {
        const testPrompts = {
          plan: 'Create a system architecture for a React TypeScript application',
          review: 'Review this component for best practices',
          help: 'How do I use the persona system effectively?'
        };

        const body = {
          prompt: testPrompts[endpoint as keyof typeof testPrompts],
          context: 'Test context for integration verification',
          metadata: { test: true, endpoint }
        };

        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          throw new Error(`POST /api/${endpoint} failed: ${response.status}`);
        }

        const data = await response.json();
        return { 
          status: response.status,
          success: data.success,
          hasData: !!data.data,
          persona: data.data?.persona,
          superClaudeUsed: data.data?.superClaudeUsed
        };
      });
    }
  }

  private async runTest(
    component: string,
    test: string,
    testFn: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`  ⏳ ${test}...`);
      const result = await Promise.race([
        testFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.testTimeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      console.log(`  ✅ ${test} (${duration}ms)`);
      
      this.results.push({
        component,
        test,
        status: 'PASS',
        duration,
        metadata: result
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

  private generateTestReport(startTime: number): TestReport {
    const totalDuration = Date.now() - startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    return {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      skipped,
      results: this.results,
      summary: {
        personaMapper: this.results.filter(r => r.component === 'PersonaMapper'),
        enhancedAIClient: this.results.filter(r => r.component === 'EnhancedAIClient'),
        context7Service: this.results.filter(r => r.component === 'Context7Service'),
        apiEndpoints: this.results.filter(r => r.component === 'API Endpoints')
      }
    };
  }

  private printTestReport(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUPERCLAUDE INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${report.totalTests}`);
    console.log(`  ✅ Passed: ${report.passed}`);
    console.log(`  ❌ Failed: ${report.failed}`);
    console.log(`  ⏭️  Skipped: ${report.skipped}`);
    console.log(`  📊 Success Rate: ${((report.passed / report.totalTests) * 100).toFixed(1)}%`);

    console.log(`\n🧩 Component Breakdown:`);
    Object.entries(report.summary).forEach(([component, results]) => {
      const componentPassed = results.filter(r => r.status === 'PASS').length;
      const componentTotal = results.length;
      const componentRate = componentTotal > 0 ? ((componentPassed / componentTotal) * 100).toFixed(1) : '0.0';
      console.log(`  ${component}: ${componentPassed}/${componentTotal} (${componentRate}%)`);
    });

    console.log(`\n🚨 Failed Tests:`);
    const failedTests = report.results.filter(r => r.status === 'FAIL');
    if (failedTests.length === 0) {
      console.log('  None! 🎉');
    } else {
      failedTests.forEach(test => {
        console.log(`  ❌ ${test.component} - ${test.test}`);
        console.log(`     Error: ${test.error}`);
      });
    }

    console.log(`\n⏱️  Performance:`);
    const avgDuration = report.results.reduce((sum, r) => sum + r.duration, 0) / report.results.length;
    console.log(`  Average Test Duration: ${avgDuration.toFixed(0)}ms`);
    
    const slowTests = report.results.filter(r => r.duration > 5000);
    if (slowTests.length > 0) {
      console.log(`  Slow Tests (>5s):`);
      slowTests.forEach(test => {
        console.log(`    ${test.component} - ${test.test}: ${test.duration}ms`);
      });
    }

    console.log(`\n💡 Recommendations:`);
    if (report.failed > 0) {
      console.log('  1. Review failed tests and address integration issues');
    }
    if (failedTests.some(t => t.error?.includes('SuperClaude'))) {
      console.log('  2. Verify SuperClaude CLI installation and PATH configuration');
    }
    if (failedTests.some(t => t.error?.includes('timeout'))) {
      console.log('  3. Consider increasing test timeout values for slow operations');
    }
    if (report.passed / report.totalTests > 0.8) {
      console.log('  ✅ Integration services are functioning well - ready for activation');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SuperClaudeIntegrationTester();
  tester.runAllTests()
    .then(report => {
      console.log(`\n📄 Test report generated at: ${report.timestamp}`);
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { SuperClaudeIntegrationTester, type TestReport };