// @vibe-lab/core - Core API endpoint for onboarding chat
// This is the main AI-powered onboarding interface that users interact with

import { NextResponse } from 'next/server';
import { enhancedAIClient } from '@/lib/integration/enhanced-ai-client';

// @vibe-lab/build:start
import { logicMonitor } from '@/lib/monitoring/logic-monitor';
import { capturePageContext } from '@/lib/monitoring/page-context';
// @vibe-lab/build:end

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json();

    // @vibe-lab/build:start
    // Development monitoring - track AI module activation
    const pageContext = capturePageContext();
    const { flowId, startTime } = logicMonitor.trackModule(
      'AVCA',
      'ONBOARDING_CHAT',
      'process-message',
      { message: message.substring(0, 50) + '...' }, // Truncate for logging
      'Processing user onboarding message',
      pageContext
    );
    // @vibe-lab/build:end

    // Core AI processing
    const response = await enhancedAIClient.processOnboardingMessage({
      message,
      conversationHistory,
      stage: 'initial'
    });

    // @vibe-lab/build:start
    // Complete monitoring tracking
    logicMonitor.completeModule(
      flowId,
      startTime,
      { 
        responseLength: response.response?.length || 0,
        quickActionsCount: response.quickActions?.length || 0
      },
      {
        logic: 'Successfully processed onboarding message',
        confidence: response.confidence || 85
      },
      {
        tokenUsage: response.tokenUsage,
        sourcePage: pageContext.sourcePage,
        sourceRoute: pageContext.sourceRoute,
        modelUsed: 'gpt-4',
        qualityScore: response.confidence || 85
      }
    );
    // @vibe-lab/build:end

    return NextResponse.json(response);

  } catch (error) {
    console.error('Onboarding chat error:', error);

    // @vibe-lab/build:start
    if (typeof flowId !== 'undefined') {
      logicMonitor.completeModule(
        flowId,
        startTime,
        { error: error.message },
        { logic: 'Error processing onboarding message' },
        { errors: [error.message] }
      );
    }
    // @vibe-lab/build:end

    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}