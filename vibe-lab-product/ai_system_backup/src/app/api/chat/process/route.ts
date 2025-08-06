import { NextResponse } from 'next/server';
import { initializeVibeLabServices } from '@/lib/core/vibe-lab-services';

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Chat Process: Starting with staged initialization...');
    
    // Initialize with reasonable timeout for enhanced features
    const vibeLabServices = await initializeVibeLabServices({
      enableMonitoring: true,
      enableLearning: true,
      enableMigration: false,
      initTimeoutMs: 4000
    });

    const body = await request.json();
    const { message, projectName, context } = body;

    console.log(`🎯 Chat Process: Processing "${message.substring(0, 50)}..." for ${projectName}`);

    // Route request intelligently
    const router = vibeLabServices.getRouter();
    
    const response = await router.routeRequest('enhanced-chat', async (service) => {
      console.log(`🛣️ Chat Process: Using ${service.constructor.name}`);
      
      if (service.constructor.name === 'DIAS') {
        // Enhanced DIAS processing
        const result = await service.processUserInput({
          message,
          projectName,
          context: {
            messages: context.messages,
            currentStep: 'onboarding',
            projectType: 'auto'
          }
        });
        
        return {
          response: result.content,
          context: result.context
        };
      } else {
        // Fallback AI processing
        const result = await service.process({
          role: 'DEVELOPER',
          prompt: `Process this user message for project "${projectName}": ${message}`,
          context: JSON.stringify(context),
          temperature: 0.7,
          maxTokens: 500
        });
        
        return {
          response: result.content,
          context: {
            fallback: true,
            enhancedFeaturesInitializing: true
          }
        };
      }
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ Chat Process: Completed in ${processingTime}ms`);

    // Add metadata
    const finalResponse = {
      ...response,
      _metadata: {
        processingTime,
        systemStatus: vibeLabServices.getSystemStatus(),
        timestamp: new Date().toISOString()
      }
    };

    // Remove internal routing data
    delete finalResponse._routing;

    return NextResponse.json(finalResponse);
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Chat Process Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message - systems initializing',
        fallback: true,
        processingTime,
        message: 'Please try again in a moment as advanced features come online'
      },
      { status: 500 }
    );
  }
}