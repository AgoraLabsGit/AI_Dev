#!/usr/bin/env tsx

/**
 * Test Environment Variables Loading
 * Verifies that API keys and environment variables are properly loaded
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.local:', result.error);
} else {
  console.log('✅ Successfully loaded .env.local');
}

// Check for ANTHROPIC_API_KEY
console.log('\n🔍 Checking environment variables:');
console.log('-----------------------------------');

const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey) {
  console.log('✅ ANTHROPIC_API_KEY:', `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`);
} else {
  console.log('❌ ANTHROPIC_API_KEY: Not found');
}

// Check other important environment variables
const envVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_USE_SUPERCLAUDE',
  'NEXT_PUBLIC_SHOW_PERSONA_INFO',
  'NEXT_PUBLIC_ENABLE_CONTEXT7'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      console.log(`✅ ${varName}: [REDACTED]`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: Not found`);
  }
});

console.log('\n📍 Current working directory:', process.cwd());
console.log('📍 Node environment:', process.env.NODE_ENV || 'development');

// Test creating an AI client instance
console.log('\n🧪 Testing AI Client initialization:');
console.log('-----------------------------------');

try {
  // Import after env vars are loaded
  const { AIClientService } = require('../src/lib/avca/services/ai-client');
  const { EventBus } = require('../src/lib/avca/services/event-bus');
  
  const eventBus = new EventBus();
  const aiClient = new AIClientService(eventBus);
  
  console.log('✅ AI Client created successfully');
} catch (error: any) {
  console.error('❌ Failed to create AI Client:', error.message);
}

console.log('\n✨ Environment test complete');