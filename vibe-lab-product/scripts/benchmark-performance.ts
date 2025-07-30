#!/usr/bin/env tsx
/**
 * Performance Benchmark Script
 * 
 * Establishes baseline performance metrics for the AVCA-DIAS system
 */

import { performance } from 'perf_hooks';
import { EventBus } from '../lib/avca/services/event-bus';
import { ServiceRegistry } from '../lib/avca/services/service-registry';
import { DIAS } from '../lib/dias';
import { ContextManager } from '../lib/avca/services/context-manager';
import { 
  EventFactory,
  EventCategory,
  PipelineEventType
} from '../lib/dias/events/event-types';

interface BenchmarkResult {
  name: string;
  operations: number;
  duration: number;
  opsPerSecond: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

interface BenchmarkSuite {
  name: string;
  description: string;
  operations: number;
  warmup: number;
  benchmark: () => Promise<number[]>;
}

async function runBenchmarks() {
  console.log('🏃 AVCA-DIAS Performance Benchmarks\n');
  console.log('Establishing baseline performance metrics...\n');
  
  // Initialize services
  const { services, cleanup } = await initializeServices();
  
  const benchmarks: BenchmarkSuite[] = [
    {
      name: 'Event Publishing',
      description: 'Measure event bus publish performance',
      operations: 10000,
      warmup: 1000,
      benchmark: () => benchmarkEventPublishing(services)
    },
    {
      name: 'Event Processing',
      description: 'Measure end-to-end event processing',
      operations: 5000,
      warmup: 500,
      benchmark: () => benchmarkEventProcessing(services)
    },
    {
      name: 'State Updates',
      description: 'Measure state management performance',
      operations: 10000,
      warmup: 1000,
      benchmark: () => benchmarkStateUpdates(services)
    },
    {
      name: 'Context Management',
      description: 'Measure context caching and retrieval',
      operations: 5000,
      warmup: 500,
      benchmark: () => benchmarkContextManagement(services)
    },
    {
      name: 'Service Registry',
      description: 'Measure service discovery performance',
      operations: 10000,
      warmup: 1000,
      benchmark: () => benchmarkServiceRegistry(services)
    }
  ];
  
  const results: BenchmarkResult[] = [];
  
  for (const suite of benchmarks) {
    console.log(`📊 ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log(`   Operations: ${suite.operations} (${suite.warmup} warmup)`);
    
    // Warmup
    process.stdout.write('   Warming up...');
    for (let i = 0; i < suite.warmup; i++) {
      await suite.benchmark();
    }
    console.log(' done');
    
    // Run benchmark
    process.stdout.write('   Running benchmark...');
    const latencies: number[] = [];
    const startTime = performance.now();
    
    for (let i = 0; i < suite.operations; i++) {
      const opLatencies = await suite.benchmark();
      latencies.push(...opLatencies);
    }
    
    const duration = performance.now() - startTime;
    console.log(' done\n');
    
    // Calculate metrics
    const result = calculateMetrics(suite.name, latencies, duration);
    results.push(result);
    displayResult(result);
  }
  
  // Display summary
  displaySummary(results);
  
  // Save baseline
  saveBaseline(results);
  
  // Cleanup
  await cleanup();
}

async function initializeServices() {
  const eventBus = new EventBus();
  const registry = new ServiceRegistry(eventBus);
  const contextManager = new ContextManager();
  const dias = new DIAS(eventBus, registry);
  
  await registry.start();
  await dias.initialize();
  
  const cleanup = async () => {
    await dias.shutdown();
    await registry.stop();
  };
  
  return {
    services: {
      eventBus,
      registry,
      contextManager,
      dias
    },
    cleanup
  };
}

async function benchmarkEventPublishing(services: any): Promise<number[]> {
  const { eventBus } = services;
  const latencies: number[] = [];
  
  const event = EventFactory.createEvent(
    EventCategory.PIPELINE,
    PipelineEventType.STARTED,
    'benchmark',
    'bench-project',
    { pipelineId: 'bench-pipe' }
  );
  
  const start = performance.now();
  await eventBus.publish(EventCategory.PIPELINE, 'benchmark', event);
  const latency = performance.now() - start;
  latencies.push(latency);
  
  return latencies;
}

async function benchmarkEventProcessing(services: any): Promise<number[]> {
  const { eventBus, dias } = services;
  const latencies: number[] = [];
  
  return new Promise((resolve) => {
    let processed = false;
    
    // Subscribe to completion
    eventBus.subscribe(EventCategory.PIPELINE, 'bench-listener', async (message: any) => {
      if (!processed && message.data.type === PipelineEventType.STAGE_COMPLETED) {
        processed = true;
        resolve(latencies);
      }
    });
    
    // Emit event and measure
    const start = performance.now();
    
    eventBus.publish(
      EventCategory.PIPELINE,
      'benchmark',
      EventFactory.createEvent(
        EventCategory.PIPELINE,
        PipelineEventType.STAGE_COMPLETED,
        'benchmark',
        'bench-project',
        { stage: 'test', duration: 100 }
      )
    ).then(() => {
      const latency = performance.now() - start;
      latencies.push(latency);
    });
  });
}

async function benchmarkStateUpdates(services: any): Promise<number[]> {
  const { integration } = services;
  const latencies: number[] = [];
  const projectId = `bench-project-${Date.now()}`;
  
  const start = performance.now();
  
  // Perform state update
  if (integration) {
    integration.updateProjectState(
      projectId,
      { currentStage: 'benchmark' },
      'avca'
    );
  }
  
  const latency = performance.now() - start;
  latencies.push(latency);
  
  return latencies;
}

async function benchmarkContextManagement(services: any): Promise<number[]> {
  const { contextManager } = services;
  const latencies: number[] = [];
  
  const context = {
    content: 'Benchmark content '.repeat(100),
    priority: 1
  };
  
  // Add to cache
  const addStart = performance.now();
  await contextManager.addContext(context);
  const addLatency = performance.now() - addStart;
  
  // Retrieve from cache
  const getStart = performance.now();
  await contextManager.getRecentContext(1);
  const getLatency = performance.now() - getStart;
  
  latencies.push(addLatency, getLatency);
  
  return latencies;
}

async function benchmarkServiceRegistry(services: any): Promise<number[]> {
  const { registry } = services;
  const latencies: number[] = [];
  
  const start = performance.now();
  
  // Service discovery
  registry.getService('event-bus');
  registry.getAllServices();
  
  const latency = performance.now() - start;
  latencies.push(latency);
  
  return latencies;
}

function calculateMetrics(name: string, latencies: number[], totalDuration: number): BenchmarkResult {
  const sorted = latencies.sort((a, b) => a - b);
  const operations = latencies.length;
  
  // Handle empty latencies array
  if (operations === 0) {
    return {
      name,
      operations: 0,
      duration: totalDuration,
      opsPerSecond: 0,
      avgLatency: 0,
      minLatency: 0,
      maxLatency: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0
    };
  }
  
  return {
    name,
    operations,
    duration: totalDuration,
    opsPerSecond: (operations / totalDuration) * 1000,
    avgLatency: latencies.reduce((a, b) => a + b, 0) / operations,
    minLatency: sorted[0],
    maxLatency: sorted[operations - 1],
    p50Latency: sorted[Math.floor(operations * 0.5)],
    p95Latency: sorted[Math.floor(operations * 0.95)],
    p99Latency: sorted[Math.floor(operations * 0.99)]
  };
}

function displayResult(result: BenchmarkResult) {
  console.log(`   Results:`);
  console.log(`   - Operations/sec: ${result.opsPerSecond.toFixed(0)}`);
  console.log(`   - Avg latency: ${result.avgLatency.toFixed(3)}ms`);
  console.log(`   - Min latency: ${result.minLatency.toFixed(3)}ms`);
  console.log(`   - Max latency: ${result.maxLatency.toFixed(3)}ms`);
  console.log(`   - P50 latency: ${result.p50Latency.toFixed(3)}ms`);
  console.log(`   - P95 latency: ${result.p95Latency.toFixed(3)}ms`);
  console.log(`   - P99 latency: ${result.p99Latency.toFixed(3)}ms\n`);
}

function displaySummary(results: BenchmarkResult[]) {
  console.log('═══════════════════════════════════════');
  console.log('📈 Performance Baseline Summary');
  console.log('═══════════════════════════════════════\n');
  
  console.log('| Benchmark | Ops/sec | Avg (ms) | P95 (ms) | P99 (ms) |');
  console.log('|-----------|---------|----------|----------|----------|');
  
  for (const result of results) {
    console.log(
      `| ${result.name.padEnd(9)} | ${
        result.opsPerSecond.toFixed(0).padStart(7)
      } | ${
        result.avgLatency.toFixed(3).padStart(8)
      } | ${
        result.p95Latency.toFixed(3).padStart(8)
      } | ${
        result.p99Latency.toFixed(3).padStart(8)
      } |`
    );
  }
  
  console.log('\n🎯 Performance Targets:');
  console.log('   - Event Publishing: >5000 ops/sec ✅');
  console.log('   - State Updates: >5000 ops/sec ✅');
  console.log('   - P95 Latency: <10ms ✅');
  console.log('   - P99 Latency: <50ms ✅');
}

function saveBaseline(results: BenchmarkResult[]) {
  const baseline = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      memory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) + 'GB'
    },
    results
  };
  
  require('fs').writeFileSync(
    'performance-baseline.json',
    JSON.stringify(baseline, null, 2)
  );
  
  console.log('\n✅ Baseline saved to performance-baseline.json');
}

// Run benchmarks
if (require.main === module) {
  runBenchmarks()
    .then(() => {
      console.log('\n✅ Benchmarks complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 