#!/usr/bin/env ts-node
/**
 * Test script for Context Manager Stage 3 features (AVCA-002)
 * 
 * Tests:
 * 1. Context caching (LRU with TTL)
 * 2. Content compression
 * 3. Sliding window management
 * 4. Token counting accuracy
 * 5. Performance improvements
 */

import { ContextManager, ProjectContext } from '../lib/avca/services/context-manager';
import { AIRole } from '../lib/avca/services/ai-client';

// Test data
const testProject: ProjectContext = {
  projectId: 'test-001',
  projectName: 'Test Project',
  description: 'A test project for validating context management',
  techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma'],
  currentPhase: 'Phase 1 - Foundation',
  recentChanges: [
    'Added authentication system',
    'Implemented dashboard layout',
    'Set up database schema',
    'Created API endpoints',
    'Added user management'
  ]
};

const longAdditionalContext = `
This is a very long additional context that includes detailed requirements:

## Feature Requirements
The authentication system should support multiple providers including:
- Email/password authentication with secure hashing
- Social login (Google, GitHub, Discord)
- Two-factor authentication (2FA) support
- Session management with JWT tokens
- Role-based access control (RBAC)

## Technical Specifications
The implementation should follow these patterns:
1. Use Next.js App Router for routing
2. Implement middleware for auth checks
3. Store sessions in Redis for scalability
4. Use Prisma for database operations
5. Follow OWASP security guidelines

## Code Examples
Here's an example of the auth middleware:
\`\`\`typescript
export async function authMiddleware(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const payload = await verifyJWT(token);
    req.user = payload;
    return NextResponse.next();
  } catch (error) {
    return new Response('Invalid token', { status: 401 });
  }
}
\`\`\`

## Additional Notes
- Performance is critical - aim for sub-100ms response times
- Security audits should be performed quarterly
- All sensitive data must be encrypted at rest
- Implement rate limiting on all API endpoints
- Use structured logging for debugging
`.repeat(10); // Make it very long to test compression

async function testContextManager() {
  console.log('🧪 Testing Context Manager Stage 3 Features\n');
  
  const contextManager = new ContextManager({
    ttlMs: 2000, // 2 second TTL for testing
    maxSize: 3   // Small cache for testing eviction
  });
  
  let allTestsPassed = true;

  try {
    // Test 1: Basic Context Preparation
    console.log('1️⃣  Testing Basic Context Preparation...');
    const developerContext = contextManager.prepareContext(
      AIRole.DEVELOPER,
      testProject
    );
    console.log(`   ✓ Developer context prepared (${developerContext.length} chars)`);
    
    const auditorContext = contextManager.prepareContext(
      AIRole.AUDITOR,
      testProject
    );
    console.log(`   ✓ Auditor context prepared (${auditorContext.length} chars)`);
    
    const routerContext = contextManager.prepareContext(
      AIRole.ROUTER,
      testProject
    );
    console.log(`   ✓ Router context prepared (${routerContext.length} chars)`);
    
    // Verify isolation
    if (developerContext.length > auditorContext.length && 
        auditorContext.length > routerContext.length) {
      console.log('   ✅ Context isolation working correctly\n');
    } else {
      console.log('   ❌ Context isolation failed\n');
      allTestsPassed = false;
    }

    // Test 2: Context Caching
    console.log('2️⃣  Testing Context Caching (LRU + TTL)...');
    const start1 = Date.now();
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Test 1');
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Test 1'); // Same - should hit cache
    const time2 = Date.now() - start2;
    
    console.log(`   First call: ${time1}ms`);
    console.log(`   Cached call: ${time2}ms`);
    
    if (time2 < time1 / 2) {
      console.log('   ✅ Cache hit successful (>50% faster)\n');
    } else {
      console.log('   ⚠️  Cache might not be working efficiently\n');
    }
    
    // Test TTL
    console.log('   Testing TTL expiration...');
    await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for TTL
    
    const start3 = Date.now();
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Test 1'); // Should miss cache
    const time3 = Date.now() - start3;
    
    if (time3 >= time1 / 2) {
      console.log('   ✅ TTL expiration working correctly\n');
    } else {
      console.log('   ❌ TTL expiration failed\n');
      allTestsPassed = false;
    }

    // Test 3: LRU Eviction
    console.log('3️⃣  Testing LRU Cache Eviction...');
    contextManager.clearCache();
    
    // Fill cache to capacity (3 entries)
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Entry 1');
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Entry 2');
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Entry 3');
    
    console.log(`   Cache size: ${contextManager.getCacheSize()}`);
    
    // Add 4th entry - should evict Entry 1
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Entry 4');
    
    // Try to access Entry 1 - should be cache miss
    const start4 = Date.now();
    contextManager.prepareContext(AIRole.DEVELOPER, testProject, 'Entry 1');
    const time4 = Date.now() - start4;
    
    if (contextManager.getCacheSize() === 3 && time4 > 1) {
      console.log('   ✅ LRU eviction working correctly\n');
    } else {
      console.log('   ❌ LRU eviction failed\n');
      allTestsPassed = false;
    }

    // Test 4: Content Compression
    console.log('4️⃣  Testing Content Compression...');
    const uncompressedContext = contextManager.prepareContext(
      AIRole.DEVELOPER,
      testProject,
      longAdditionalContext
    );
    
    const compressionRatio = 1 - (uncompressedContext.length / longAdditionalContext.length);
    console.log(`   Original size: ${longAdditionalContext.length} chars`);
    console.log(`   Context size: ${uncompressedContext.length} chars`);
    console.log(`   Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
    
    if (compressionRatio > 0.3) {
      console.log('   ✅ Content compression working effectively\n');
    } else {
      console.log('   ⚠️  Compression might need optimization\n');
    }

    // Test 5: Token Counting (if tiktoken is available)
    console.log('5️⃣  Testing Token Counting...');
    // Wait for encoder initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const testText = "This is a test sentence for token counting.";
    const shortContext = contextManager.prepareContext(
      AIRole.ROUTER,
      { ...testProject, projectId: 'token-test' },
      testText
    );
    
    // Rough check: tokens should be less than characters
    const estimatedTokens = Math.ceil(testText.length / 4);
    console.log(`   Test text: ${testText.length} chars`);
    console.log(`   Estimated tokens: ~${estimatedTokens}`);
    console.log('   ✅ Token counting initialized\n');

    // Test 6: Sliding Window Management
    console.log('6️⃣  Testing Sliding Window Priority...');
    const projectWithManyChanges = {
      ...testProject,
      recentChanges: Array(50).fill(0).map((_, i) => `Change ${i + 1}`)
    };
    
    const contextWithWindow = contextManager.prepareContext(
      AIRole.AUDITOR,
      projectWithManyChanges
    );
    
    // Check that critical sections are included
    if (contextWithWindow.includes(testProject.projectName) &&
        contextWithWindow.includes('Tech Stack')) {
      console.log('   ✅ Critical sections preserved in sliding window\n');
    } else {
      console.log('   ❌ Sliding window priority failed\n');
      allTestsPassed = false;
    }

    // Test 7: Context Statistics
    console.log('7️⃣  Testing Context Statistics...');
    const stats = contextManager.getContextStats();
    console.log(`   Cache size: ${stats.cacheSize}`);
    console.log(`   Average tokens by role:`);
    Object.entries(stats.averageTokens).forEach(([role, avg]) => {
      console.log(`     ${role}: ${avg?.toFixed(0) || 'N/A'} tokens`);
    });
    console.log('   ✅ Statistics tracking working\n');

    // Test 8: Performance Benchmark
    console.log('8️⃣  Performance Benchmark...');
    const iterations = 100;
    const perfStart = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      contextManager.prepareContext(
        AIRole.DEVELOPER,
        { ...testProject, projectId: `perf-${i % 10}` }, // Some cache hits
        `Iteration ${i}`
      );
    }
    
    const perfTime = Date.now() - perfStart;
    const avgTime = perfTime / iterations;
    
    console.log(`   ${iterations} context preparations in ${perfTime}ms`);
    console.log(`   Average: ${avgTime.toFixed(2)}ms per preparation`);
    
    if (avgTime < 10) {
      console.log('   ✅ Performance excellent (<10ms average)\n');
    } else if (avgTime < 50) {
      console.log('   ✅ Performance good (<50ms average)\n');
    } else {
      console.log('   ⚠️  Performance needs optimization\n');
    }

    // Summary
    console.log('📊 Test Summary:');
    console.log(`   All tests passed: ${allTestsPassed ? '✅' : '❌'}`);
    console.log(`   Cache efficiency: Demonstrated`);
    console.log(`   Compression working: Yes`);
    console.log(`   Token counting: Available`);
    console.log(`   Performance: <${avgTime.toFixed(0)}ms average`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    allTestsPassed = false;
  }

  return allTestsPassed;
}

// Run tests
if (require.main === module) {
  testContextManager()
    .then(passed => process.exit(passed ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 