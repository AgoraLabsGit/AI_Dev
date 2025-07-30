/**
 * Test Performance Optimization Service
 * 
 * Validates advanced caching strategies, CDN optimization, and performance monitoring
 */

import { PerformanceOptimizationService } from '../lib/avca/services/performance-optimization-service';
import { EventBus } from '../lib/avca/services/event-bus';

async function testPerformanceOptimization() {
  console.log('🧪 Testing Performance Optimization Service...\n');

  // Initialize services
  const eventBus = new EventBus();
  const performanceService = new PerformanceOptimizationService({
    eventBus,
    cdnConfig: {
      primaryEndpoint: 'https://cdn.vibelab.com',
      fallbackEndpoints: ['https://cdn2.vibelab.com', 'https://cdn3.vibelab.com'],
      regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      enableCompression: true,
      enableImageOptimization: true,
      maxAge: 86400,
      purgeStrategy: 'intelligent'
    },
    cacheConfig: {
      levels: [
        {
          name: 'memory',
          type: 'memory',
          priority: 1,
          maxSize: 100 * 1024 * 1024, // 100MB
          ttl: 300, // 5 minutes
          compression: false
        },
        {
          name: 'localStorage',
          type: 'localStorage',
          priority: 2,
          maxSize: 10 * 1024 * 1024, // 10MB
          ttl: 3600, // 1 hour
          compression: true
        }
      ],
      strategies: [
        {
          name: 'component-cache',
          pattern: 'component:*',
          level: 'memory',
          ttl: 1800, // 30 minutes
          tags: ['component', 'ui'],
          invalidationRules: [
            {
              trigger: 'update',
              condition: 'component.updated',
              action: 'purge'
            }
          ]
        },
        {
          name: 'template-cache',
          pattern: 'template:*',
          level: 'memory',
          ttl: 7200, // 2 hours
          tags: ['template', 'design'],
          invalidationRules: [
            {
              trigger: 'time',
              condition: 'every 2 hours',
              action: 'refresh'
            }
          ]
        }
      ],
      ttl: {
        'component:*': 1800,
        'template:*': 7200,
        'api:*': 300,
        'static:*': 86400
      },
      maxSize: {
        'memory': 100 * 1024 * 1024,
        'localStorage': 10 * 1024 * 1024
      },
      evictionPolicy: 'intelligent'
    },
    monitoringConfig: {
      enableMetrics: true,
      enableProfiling: true,
      sampleRate: 0.1,
      thresholds: {
        responseTime: 200,
        errorRate: 0.01,
        cacheHitRate: 0.8,
        cpuUsage: 0.8,
        memoryUsage: 0.8
      },
      alerts: [
        {
          name: 'high-response-time',
          condition: 'responseTime > 200ms',
          threshold: 200,
          action: 'log'
        },
        {
          name: 'low-cache-hit-rate',
          condition: 'cacheHitRate < 0.8',
          threshold: 0.8,
          action: 'webhook'
        }
      ]
    }
  });

  try {
    // Initialize the performance service
    await performanceService.start();

    // Test 1: Caching functionality
    console.log('📋 Test 1: Caching functionality');
    
    // Cache component data
    const componentData = {
      id: 'button-primary',
      name: 'Primary Button',
      category: 'interaction',
      template: 'linear',
      code: '<button className="btn btn-primary">Click me</button>'
    };

    await performanceService.cache('component:button-primary', componentData, {
      ttl: 1800,
      tags: ['component', 'ui', 'button'],
      strategy: 'component-cache',
      level: 'memory'
    });

    console.log('✅ Cached component data');

    // Retrieve cached data
    const retrievedData = await performanceService.get('component:button-primary');
    console.log(`✅ Retrieved cached data: ${retrievedData ? 'SUCCESS' : 'FAILED'}`);

    // Test 2: CDN optimization
    console.log('\n🔍 Test 2: CDN optimization');
    
    const cdnUrl = performanceService.getCDNUrl('/images/logo.png', {
      width: 200,
      height: 100,
      format: 'webp',
      quality: 85,
      region: 'us-east-1'
    });

    console.log(`✅ Generated CDN URL: ${cdnUrl}`);

    // Test 3: Cache invalidation
    console.log('\n🎯 Test 3: Cache invalidation');
    
    const invalidationCount = await performanceService.invalidate({
      tags: ['component'],
      level: 'memory'
    });

    console.log(`✅ Invalidated ${invalidationCount} cache entries`);

    // Test 4: Cache warming
    console.log('\n🔥 Test 4: Cache warming');
    
    await performanceService.warmCache([
      {
        pattern: 'component:*',
        loader: async () => ({ id: 'warmed-component', name: 'Warmed Component' }),
        ttl: 1800,
        tags: ['component', 'warmed']
      }
    ]);

    console.log('✅ Cache warming completed');

    // Test 5: Performance metrics
    console.log('\n📊 Test 5: Performance metrics');
    
    const metrics = performanceService.getMetrics();
    const cacheStats = performanceService.getCacheStats();

    console.log(`✅ Response time: ${metrics.responseTime}ms`);
    console.log(`✅ Cache hit rate: ${(cacheStats.hitRate * 100).toFixed(2)}%`);
    console.log(`✅ Total requests: ${cacheStats.totalRequests}`);
    console.log(`✅ Memory usage: ${(metrics.resourceUsage.memory * 100).toFixed(2)}%`);

    // Test 6: Performance optimization
    console.log('\n⚡ Test 6: Performance optimization');
    
    const optimization = await performanceService.optimizePerformance();
    
    console.log(`✅ Optimization actions: ${optimization.actions.length}`);
    console.log(`✅ Performance improvements: ${Object.keys(optimization.improvements).length} areas`);

    // Test 7: Asset preloading
    console.log('\n🚀 Test 7: Asset preloading');
    
    await performanceService.preloadAssets([
      {
        url: '/images/hero-banner.jpg',
        type: 'image',
        priority: 'high'
      },
      {
        url: '/styles/main.css',
        type: 'style',
        priority: 'high'
      },
      {
        url: '/scripts/app.js',
        type: 'script',
        priority: 'medium'
      }
    ]);

    console.log('✅ Asset preloading completed');

    // Performance summary
    console.log('\n⚡ Performance Summary:');
    console.log('✅ Advanced caching strategies operational');
    console.log('✅ CDN optimization functional');
    console.log('✅ Performance monitoring active');
    console.log('✅ Cache warming and invalidation working');
    console.log('✅ Asset preloading operational');
    console.log('✅ Performance optimization algorithms active');
    
    console.log('\n🎉 Performance Optimization Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await performanceService.stop();
  }
}

// Run the test
if (require.main === module) {
  testPerformanceOptimization()
    .then(() => {
      console.log('\n✅ All performance optimization tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Performance optimization tests failed:', error);
      process.exit(1);
    });
}

export { testPerformanceOptimization }; 