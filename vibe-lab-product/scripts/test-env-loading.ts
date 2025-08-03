#!/usr/bin/env node

/**
 * Test Environment Variable Loading
 * Simple script to verify ANTHROPIC_API_KEY is loaded correctly
 */

console.log('🔍 Testing Environment Variable Loading...\n');

// Check if running in Next.js context or standalone
const isNextJs = typeof process !== 'undefined' && process.env.NODE_ENV;

console.log('Environment Context:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`- Next.js context: ${isNextJs ? 'Yes' : 'No'}`);

// Check ANTHROPIC_API_KEY
const apiKey = process.env.ANTHROPIC_API_KEY;
console.log('\nANTHROPIC_API_KEY Status:');
if (apiKey) {
  console.log(`✅ Found: ${apiKey.substring(0, 15)}...${apiKey.slice(-4)}`);
  console.log(`✅ Length: ${apiKey.length} characters`);
  console.log(`✅ Starts with 'sk-ant-': ${apiKey.startsWith('sk-ant-') ? 'Yes' : 'No'}`);
} else {
  console.log('❌ Not found or empty');
}

// Check other environment variables
console.log('\nOther Environment Variables:');
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`- NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`- NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Found' : '❌ Missing'}`);

// Test Anthropic SDK initialization
async function testSdk() {
  console.log('\n🧪 Testing Anthropic SDK Initialization...');
  try {
    // Dynamic import to avoid issues if not available
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    
    if (!apiKey) {
      console.log('❌ Cannot test SDK - API key missing');
    } else {
      const anthropic = new Anthropic({
        apiKey
      });
      console.log('✅ Anthropic SDK initialized successfully');
      
      // Test a simple call (but don't actually make it to avoid costs)
      console.log('✅ SDK configuration appears valid');
    }
  } catch (error) {
    console.log(`❌ SDK initialization failed: ${error.message}`);
  }
  
  console.log('\n✅ Environment test complete');
}

testSdk();