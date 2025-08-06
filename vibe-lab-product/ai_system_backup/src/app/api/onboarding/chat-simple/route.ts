import { NextRequest, NextResponse } from 'next/server';
import { initializeVibeLabServices } from '@/lib/core/vibe-lab-services';
import { AIRole } from '@/lib/avca/types/ai-client';
import { safeToISOString } from '@/utils/date';

interface OnboardingChatRequest {
  message: string;
  projectName?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  context?: {
    stage: 'initial' | 'requirements' | 'features' | 'architecture';
    extractedInfo?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Simple Staged Chat: Starting fast processing...');
    
    // Initialize with minimal timeout for immediate response
    const vibeLabServices = await initializeVibeLabServices({
      enableMonitoring: false, // Disable for speed
      enableLearning: false,   // Disable for speed
      enableMigration: false,
      initTimeoutMs: 1000      // Very fast timeout
    });
    
    const body: OnboardingChatRequest = await request.json();
    const { message, projectName } = body;

    console.log(`🎯 Simple Staged: Processing "${message.substring(0, 50)}..." for ${projectName}`);

    // Use basic chat route with immediate fallback
    const router = vibeLabServices.getRouter();
    
    const response = await router.routeRequest('basic-chat', async (service) => {
      console.log(`🛣️ Simple Staged: Using ${service.constructor.name}`);
      
      const aiResponse = await service.process({
        role: AIRole.DEVELOPER,
        prompt: `You are a helpful AI assistant. Respond to this user message: "${message}"`,
        context: JSON.stringify({ projectName }),
        temperature: 0.7,
        maxTokens: 200
      });

      return {
        response: aiResponse.content,
        suggestions: [],
        quickActions: [],
        extractedInfo: {},
        projectOverview: null,
        buildSpecifications: null
      };
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Simple Staged: Completed in ${processingTime}ms`);
    
    // Add metadata
    const finalResponse = {
      ...response,
      _metadata: {
        processingTime,
        mode: 'simple-staged',
        systemStatus: vibeLabServices.getSystemStatus().basicReady ? 'ready' : 'fallback',
        timestamp: safeToISOString(new Date())
      }
    };

    // Remove internal routing data
    delete finalResponse._routing;

    return NextResponse.json(finalResponse);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Simple Staged Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return NextResponse.json(
      { 
        response: "I'm sorry, I encountered an error processing your message. My systems are starting up - please try again in a moment.",
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: ["Try again in a few seconds", "Make sure your message is clear"],
        _metadata: {
          processingTime,
          mode: 'simple-staged',
          error: true,
          timestamp: safeToISOString(new Date())
        },
        debug: {
          errorType: error?.constructor?.name || 'Unknown',
          errorString: String(error)
        }
      },
      { status: 500 }
    );
  }
}