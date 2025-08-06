import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(_request: NextRequest) {
  const results = {
    nodeEnv: process.env.NODE_ENV,
    apiKeyExists: !!process.env.ANTHROPIC_API_KEY,
    apiKeyPrefix: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 15) + '...' : 'not found',
    databaseUrl: !!process.env.DATABASE_URL,
    nextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    anthropicTest: null as any
  };

  // Test Anthropic SDK initialization
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      results.anthropicTest = {
        success: true,
        message: 'Anthropic SDK initialized successfully'
      };
    } else {
      results.anthropicTest = {
        success: false,
        message: 'API key not found'
      };
    }
  } catch (error) {
    results.anthropicTest = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  return NextResponse.json(results);
}