#!/usr/bin/env tsx
/**
 * API Endpoint Timeout Debug Script
 * Identifies and resolves timeout issues with plan and review endpoints
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { createEnhancedAIClient } from '../src/lib/integration/enhanced-ai-client';
import { personaMapper } from '../src/lib/integration/persona-mapper';
import { EventBus } from '../src/lib/avca/services/event-bus';
import { AIRole } from '../src/lib/avca/services/ai-client';

interface TimeoutTestResult {
  endpoint: string;
  test: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

class APITimeoutDebugger {
  private eventBus: EventBus;
  private aiClient: any;
  private results: TimeoutTestResult[] = [];

  constructor() {
    this.eventBus = new EventBus();
    this.aiClient = createEnhancedAIClient(this.eventBus, true);
  }

  async runAllTests(): Promise<void> {
    console.log('🔍 API Endpoint Timeout Debug Analysis');
    console.log('='.repeat(50));

    // Test 1: SuperClaude CLI availability
    await this.testSuperClaudeAvailability();
    
    // Test 2: PersonaMapper command mappings
    await this.testPersonaMapperCommands();
    
    // Test 3: Enhanced AI Client basic functionality
    await this.testEnhancedAIClientBasic();
    
    // Test 4: Enhanced AI Client with timeout
    await this.testEnhancedAIClientWithTimeout();
    
    // Test 5: Environment variable validation
    await this.testEnvironmentVariables();

    this.printResults();
  }

  private async testSuperClaudeAvailability(): Promise<void> {
    const startTime = Date.now();
    console.log('⏳ Testing SuperClaude CLI availability...');

    try {
      const available = await this.aiClient.checkSuperClaudeAvailability();
      const status = this.aiClient.getSuperClaudeStatus();
      const duration = Date.now() - startTime;

      console.log(`✅ SuperClaude availability check completed (${duration}ms)`);
      this.results.push({
        endpoint: 'SuperClaude CLI',
        test: 'availability_check',
        success: true,
        duration,
        details: { available, status }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.log(`❌ SuperClaude availability check failed (${duration}ms): ${errorMessage}`);
      this.results.push({
        endpoint: 'SuperClaude CLI',
        test: 'availability_check',
        success: false,
        duration,
        error: errorMessage
      });
    }
  }

  private async testPersonaMapperCommands(): Promise<void> {
    const startTime = Date.now();
    console.log('⏳ Testing PersonaMapper command mappings...');

    try {
      const planMapping = personaMapper.getCommandMapping('/plan');
      const reviewMapping = personaMapper.getCommandMapping('/review');
      const helpMapping = personaMapper.getCommandMapping('/help');
      const duration = Date.now() - startTime;

      console.log(`✅ PersonaMapper command mappings verified (${duration}ms)`);
      this.results.push({
        endpoint: 'PersonaMapper',
        test: 'command_mappings',
        success: true,
        duration,
        details: { planMapping, reviewMapping, helpMapping }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.log(`❌ PersonaMapper command mappings failed (${duration}ms): ${errorMessage}`);
      this.results.push({
        endpoint: 'PersonaMapper',
        test: 'command_mappings',
        success: false,
        duration,
        error: errorMessage
      });
    }
  }

  private async testEnhancedAIClientBasic(): Promise<void> {
    const startTime = Date.now();
    console.log('⏳ Testing Enhanced AI Client basic functionality...');

    try {
      // Create a very simple request without SuperClaude
      const simpleRequest = {
        role: AIRole.DEVELOPER,
        command: 'test' as any,
        prompt: 'Simple test',
        useSuperClaude: false, // Disable SuperClaude for this test
        metadata: { test: true }
      };

      const response = await Promise.race([
        this.aiClient.process(simpleRequest),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 5s')), 5000))
      ]);

      const duration = Date.now() - startTime;
      console.log(`✅ Enhanced AI Client basic test completed (${duration}ms)`);
      this.results.push({
        endpoint: 'Enhanced AI Client',
        test: 'basic_functionality',
        success: true,
        duration,
        details: { responseLength: response.content?.length || 0 }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.log(`❌ Enhanced AI Client basic test failed (${duration}ms): ${errorMessage}`);
      this.results.push({
        endpoint: 'Enhanced AI Client',
        test: 'basic_functionality',
        success: false,
        duration,
        error: errorMessage
      });
    }
  }

  private async testEnhancedAIClientWithTimeout(): Promise<void> {
    const startTime = Date.now();
    console.log('⏳ Testing Enhanced AI Client with timeout protection...');

    try {
      // Create request similar to /plan endpoint
      const planRequest = {
        role: AIRole.DEVELOPER,
        command: '/plan' as any,
        prompt: 'Strategic Planning Request: Design a simple component',
        useSuperClaude: true, // Enable SuperClaude to reproduce the issue
        flags: ['--persona-architect'],
        metadata: {
          endpoint: '/api/plan',
          timestamp: new Date().toISOString()
        }
      };

      // Set a 15-second timeout to prevent hanging
      const response = await Promise.race([
        this.aiClient.process(planRequest),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 15s')), 15000))
      ]);

      const duration = Date.now() - startTime;
      console.log(`✅ Enhanced AI Client with SuperClaude completed (${duration}ms)`);
      this.results.push({
        endpoint: 'Enhanced AI Client',
        test: 'superclaude_functionality',
        success: true,
        duration,
        details: { 
          superClaudeUsed: response.superClaudeUsed,
          responseLength: response.content?.length || 0 
        }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.log(`❌ Enhanced AI Client with SuperClaude failed (${duration}ms): ${errorMessage}`);
      this.results.push({
        endpoint: 'Enhanced AI Client',
        test: 'superclaude_functionality',
        success: false,
        duration,
        error: errorMessage
      });
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    const startTime = Date.now();
    console.log('⏳ Testing environment variables...');

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const superClaudeEnabled = process.env.NEXT_PUBLIC_USE_SUPERCLAUDE;
      const duration = Date.now() - startTime;

      const hasApiKey = !!apiKey && apiKey.length > 0;
      const superClaudeFlag = superClaudeEnabled === 'true';

      console.log(`✅ Environment variables verified (${duration}ms)`);
      this.results.push({
        endpoint: 'Environment',
        test: 'environment_variables',
        success: true,
        duration,
        details: { 
          hasApiKey,
          superClaudeFlag,
          apiKeyLength: apiKey?.length || 0
        }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.log(`❌ Environment variables test failed (${duration}ms): ${errorMessage}`);
      this.results.push({
        endpoint: 'Environment',
        test: 'environment_variables',
        success: false,
        duration,
        error: errorMessage
      });
    }
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TIMEOUT DEBUG ANALYSIS RESULTS');
    console.log('='.repeat(50));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success).length;

    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  ✅ Passed: ${passedTests}`);
    console.log(`  ❌ Failed: ${failedTests}`);
    console.log(`  📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    console.log(`\n🔍 Test Details:`);
    this.results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`  ${icon} ${result.endpoint} - ${result.test} (${result.duration}ms)`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`     Details: ${JSON.stringify(result.details, null, 2).replace(/\n/g, '\n     ')}`);
      }
    });

    console.log(`\n🎯 Timeout Analysis:`);
    const longTests = this.results.filter(r => r.duration > 5000);
    const failedTimeouts = this.results.filter(r => !r.success && r.error?.includes('Timeout'));
    
    if (longTests.length > 0) {
      console.log(`  ⚠️  Slow Tests (>5s):`);
      longTests.forEach(test => {
        console.log(`    - ${test.endpoint}: ${test.duration}ms`);
      });
    }

    if (failedTimeouts.length > 0) {
      console.log(`  ❌ Timeout Failures:`);
      failedTimeouts.forEach(test => {
        console.log(`    - ${test.endpoint}: ${test.error}`);
      });
    }

    console.log(`\n💡 Recommendations:`);
    const superClaudeTest = this.results.find(r => r.test === 'availability_check');
    if (superClaudeTest && !superClaudeTest.success) {
      console.log('  1. ⚠️  SuperClaude CLI not available - API endpoints will fallback to standard AI client');
      console.log('  2. 🔧 Install SuperClaude CLI for full functionality');
      console.log('  3. 🎯 Test endpoints without SuperClaude for basic validation');
    }

    const environmentTest = this.results.find(r => r.test === 'environment_variables');
    if (environmentTest?.details?.hasApiKey) {
      console.log('  4. ✅ API key configured correctly');
    } else {
      console.log('  4. ❌ API key configuration issue');
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new APITimeoutDebugger();
  analyzer.runAllTests()
    .then(() => {
      console.log('\n🏁 Timeout debug analysis completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Debug analysis failed:', error);
      process.exit(1);
    });
}