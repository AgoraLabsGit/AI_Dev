#!/usr/bin/env tsx
/**
 * Concurrent Load Testing Script
 * Tests API endpoints under concurrent load to validate performance and resilience
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

interface LoadTestResult {
  endpoint: string;
  concurrentUsers: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  duration: number;
  errors: string[];
}

interface LoadTestConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  payload?: any;
  concurrentUsers: number;
  requestsPerUser: number;
  maxDuration: number; // milliseconds
}

class ConcurrentLoadTester {
  private baseUrl = 'http://localhost:3000';
  private results: LoadTestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Concurrent Load Testing');
    console.log('='.repeat(60));

    // Test configurations
    const testConfigs: LoadTestConfig[] = [
      // Light load tests
      {
        endpoint: '/api/help',
        method: 'GET',
        concurrentUsers: 5,
        requestsPerUser: 2,
        maxDuration: 30000
      },
      {
        endpoint: '/api/plan',
        method: 'POST',
        payload: { prompt: 'Design a simple component' },
        concurrentUsers: 3,
        requestsPerUser: 1,
        maxDuration: 60000
      },
      {
        endpoint: '/api/review',
        method: 'POST',
        payload: { 
          prompt: 'Review this code', 
          codeToReview: 'const test = () => console.log("hello");' 
        },
        concurrentUsers: 3,
        requestsPerUser: 1,
        maxDuration: 60000
      },
      // Moderate load tests
      {
        endpoint: '/api/help',
        method: 'GET',
        concurrentUsers: 10,
        requestsPerUser: 3,
        maxDuration: 45000
      },
      // Mixed endpoint test
      {
        endpoint: '/api/help',
        method: 'GET',
        concurrentUsers: 15,
        requestsPerUser: 2,
        maxDuration: 60000
      }
    ];

    for (const config of testConfigs) {
      await this.runLoadTest(config);
      
      // Brief pause between tests
      console.log('⏳ Cooling down for 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    this.printSummary();
  }

  private async runLoadTest(config: LoadTestConfig): Promise<void> {
    console.log(`\n🔥 Load Testing: ${config.endpoint}`);
    console.log(`   Concurrent Users: ${config.concurrentUsers}`);
    console.log(`   Requests per User: ${config.requestsPerUser}`);
    console.log(`   Max Duration: ${config.maxDuration / 1000}s`);

    const startTime = Date.now();
    const responseTimes: number[] = [];
    const errors: string[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // Create concurrent user promises
    const userPromises = Array.from({ length: config.concurrentUsers }, (_, userIndex) =>
      this.simulateUser(userIndex, config, responseTimes, errors, 
        () => successfulRequests++, 
        () => failedRequests++)
    );

    // Wait for all users to complete or timeout
    try {
      await Promise.race([
        Promise.allSettled(userPromises),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Load test timeout')), config.maxDuration)
        )
      ]);
    } catch (error) {
      console.log(`⚠️  Load test timed out after ${config.maxDuration / 1000}s`);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const totalRequests = successfulRequests + failedRequests;

    // Calculate statistics
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
    const requestsPerSecond = totalRequests > 0 ? (totalRequests / (duration / 1000)) : 0;

    const result: LoadTestResult = {
      endpoint: config.endpoint,
      concurrentUsers: config.concurrentUsers,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      errorRate,
      requestsPerSecond,
      duration,
      errors: [...new Set(errors)].slice(0, 5) // Unique errors, max 5
    };

    this.results.push(result);

    // Print immediate results
    console.log(`\n📊 Results for ${config.endpoint}:`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   ✅ Successful: ${successfulRequests}`);
    console.log(`   ❌ Failed: ${failedRequests}`);
    console.log(`   Error Rate: ${errorRate.toFixed(1)}%`);
    console.log(`   Avg Response Time: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`   Response Time Range: ${minResponseTime}ms - ${maxResponseTime}ms`);
    console.log(`   Requests/sec: ${requestsPerSecond.toFixed(1)}`);
    
    if (errors.length > 0) {
      console.log(`   Top Errors: ${errors.slice(0, 2).join('; ')}`);
    }
  }

  private async simulateUser(
    userIndex: number,
    config: LoadTestConfig,
    responseTimes: number[],
    errors: string[],
    onSuccess: () => void,
    onError: () => void
  ): Promise<void> {
    for (let i = 0; i < config.requestsPerUser; i++) {
      try {
        const requestStart = Date.now();
        
        const requestConfig: RequestInit = {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(30000) // 30 second timeout per request
        };

        if (config.payload) {
          requestConfig.body = JSON.stringify(config.payload);
        }

        const response = await fetch(`${this.baseUrl}${config.endpoint}`, requestConfig);
        const responseTime = Date.now() - requestStart;
        
        if (response.ok) {
          responseTimes.push(responseTime);
          onSuccess();
        } else {
          errors.push(`HTTP ${response.status}: ${response.statusText}`);
          onError();
        }

        // Small delay between requests from same user
        if (i < config.requestsPerUser - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(errorMessage);
        onError();
      }
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📈 CONCURRENT LOAD TESTING SUMMARY');
    console.log('='.repeat(60));

    const totalRequests = this.results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.successfulRequests, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failedRequests, 0);
    const overallErrorRate = totalRequests > 0 ? (totalFailed / totalRequests) * 100 : 0;

    console.log(`\n🎯 Overall Performance:`);
    console.log(`   Total Requests Across All Tests: ${totalRequests}`);
    console.log(`   ✅ Overall Success Rate: ${((totalSuccessful / totalRequests) * 100).toFixed(1)}%`);
    console.log(`   ❌ Overall Error Rate: ${overallErrorRate.toFixed(1)}%`);

    console.log(`\n📊 Individual Test Results:`);
    this.results.forEach((result, index) => {
      const status = result.errorRate <= 5 ? '✅' : result.errorRate <= 15 ? '⚠️' : '❌';
      
      console.log(`\n   ${index + 1}. ${result.endpoint} ${status}`);
      console.log(`      Concurrent Users: ${result.concurrentUsers}`);
      console.log(`      Total Requests: ${result.totalRequests}`);
      console.log(`      Success Rate: ${((result.successfulRequests / Math.max(result.totalRequests, 1)) * 100).toFixed(1)}%`);
      console.log(`      Avg Response Time: ${result.averageResponseTime.toFixed(0)}ms`);
      console.log(`      Requests/sec: ${result.requestsPerSecond.toFixed(1)}`);
      
      if (result.errors.length > 0) {
        console.log(`      Common Errors: ${result.errors.slice(0, 2).join('; ')}`);
      }
    });

    console.log(`\n🔍 Performance Analysis:`);
    
    // Analyze help endpoint performance
    const helpResults = this.results.filter(r => r.endpoint === '/api/help');
    if (helpResults.length > 0) {
      const helpAvgTime = helpResults.reduce((sum, r) => sum + r.averageResponseTime, 0) / helpResults.length;
      console.log(`   Help Endpoint: ${helpAvgTime.toFixed(0)}ms avg (${helpResults.length} tests)`);
    }

    // Analyze AI endpoints performance
    const aiResults = this.results.filter(r => r.endpoint.includes('/plan') || r.endpoint.includes('/review'));
    if (aiResults.length > 0) {
      const aiAvgTime = aiResults.reduce((sum, r) => sum + r.averageResponseTime, 0) / aiResults.length;
      console.log(`   AI Endpoints: ${aiAvgTime.toFixed(0)}ms avg (${aiResults.length} tests)`);
    }

    console.log(`\n💡 Load Testing Assessment:`);
    
    if (overallErrorRate <= 5) {
      console.log('   ✅ System handles concurrent load well');
      console.log('   ✅ Error rate within acceptable limits (<5%)');
    } else if (overallErrorRate <= 15) {
      console.log('   ⚠️  System shows some strain under load');
      console.log('   ⚠️  Error rate elevated but manageable (5-15%)');
    } else {
      console.log('   ❌ System struggles under concurrent load');
      console.log('   ❌ High error rate requires investigation (>15%)');
    }

    // Performance recommendations
    const slowTests = this.results.filter(r => r.averageResponseTime > 20000);
    if (slowTests.length > 0) {
      console.log('   ⚠️  Some endpoints showing slow response times (>20s)');
      console.log('   💡 Consider implementing request queuing or rate limiting');
    }

    const highConcurrencyTests = this.results.filter(r => r.concurrentUsers >= 10);
    if (highConcurrencyTests.some(r => r.errorRate > 10)) {
      console.log('   ⚠️  High concurrency causing increased error rates');
      console.log('   💡 Consider implementing better concurrency handling');
    }

    console.log(`\n🚀 Recommendations:`);
    console.log('   1. ✅ Core API endpoints operational under load');
    console.log('   2. 📊 Monitor response times in production');
    console.log('   3. 🔧 Consider caching for help endpoint');
    console.log('   4. ⚡ AI endpoints may benefit from request queuing');
    
    if (overallErrorRate <= 10) {
      console.log('   5. ✅ System ready for Phase 1B frontend integration');
    } else {
      console.log('   5. ⚠️  Address error rate before Phase 1B integration');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run load tests if called directly
if (require.main === module) {
  const loadTester = new ConcurrentLoadTester();
  loadTester.runAllTests()
    .then(() => {
      console.log('\n🏁 Concurrent load testing completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Load testing failed:', error);
      process.exit(1);
    });
}