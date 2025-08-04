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
    extractedInfo?: Record<string, unknown>;
  };
}

interface OnboardingChatResponse {
  response: string;
  suggestions?: string[];
  quickActions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'suggest' | 'multi-select' | 'danger' | 'info' | 'warning';
    metadata?: {
      icon?: string;
      description?: string;
      keyboard?: string;
      dangerous?: boolean;
      requiresConfirm?: boolean;
    };
  }>;
  extractedInfo?: Record<string, unknown>;
  projectOverview?: Record<string, unknown>;
  buildSpecifications?: Record<string, unknown>;
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Staged Chat: Starting request processing');
    
    // Initialize VibeLabServices with staged loading
    const vibeLabServices = await initializeVibeLabServices({
      enableMonitoring: true,
      enableLearning: true,
      enableMigration: false,
      initTimeoutMs: 3000 // Reduced timeout for faster response
    });

    const body: OnboardingChatRequest = await request.json();
    const { message, projectName, conversationHistory, context } = body;

    // Validate and sanitize timestamps
    const sanitizedHistory = conversationHistory.map((msg, index) => ({
      ...msg,
      timestamp: msg.timestamp || safeToISOString(new Date(Date.now() - (conversationHistory.length - index) * 1000))
    }));

    console.log(`🎯 Staged Chat: Processing message - "${message.substring(0, 50)}..." for project: ${projectName}`);

    // Check system readiness
    const systemStatus = vibeLabServices.getSystemStatus();
    console.log('📊 System Status:', {
      basicReady: systemStatus.basicReady,
      enhancedReady: systemStatus.enhancedReady,
      readyServices: systemStatus.services.filter(s => s.status === 'ready').map(s => s.name)
    });

    // Route request based on available services
    const router = vibeLabServices.getRouter();
    
    const response = await router.routeRequest('enhanced-chat', async (service) => {
      console.log(`🛣️ Staged Chat: Routing to service: ${service.constructor.name}`);
      
      // If we have DIAS, use enhanced processing
      if (service.constructor.name === 'DIAS') {
        return await processWithDIAS(service, message, projectName, sanitizedHistory, context);
      }
      
      // If we have AI Client, use basic processing
      if (service.constructor.name === 'AIClientService') {
        return await processWithAIClient(service, message, projectName, sanitizedHistory, context);
      }
      
      // Fallback
      throw new Error('Unknown service type');
    });

    // Add timing and routing metadata
    const processingTime = Date.now() - startTime;
    const finalResponse = {
      ...response,
      _metadata: {
        processingTime,
        systemStatus: {
          basicReady: systemStatus.basicReady,
          enhancedReady: systemStatus.enhancedReady,
          routing: response._routing
        },
        timestamp: safeToISOString(new Date())
      }
    };

    // Remove internal routing data from response
    delete finalResponse._routing;

    console.log(`✅ Staged Chat: Completed in ${processingTime}ms`);
    return NextResponse.json(finalResponse);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Staged Chat Error:', error);
    
    return NextResponse.json(
      {
        response: "I encountered an error while processing your message. My systems are still initializing - please try again in a moment.",
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [
          "Try again in a few seconds",
          "Check if your message is clear and specific",
          "Consider using simpler requests while systems initialize"
        ],
        _metadata: {
          processingTime,
          error: true,
          timestamp: safeToISOString(new Date())
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Process with enhanced DIAS capabilities
 */
async function processWithDIAS(
  dias: unknown, 
  message: string, 
  projectName: string, 
  conversationHistory: unknown[], 
  context: unknown
): Promise<OnboardingChatResponse> {
  console.log('🧠 Using enhanced DIAS processing');
  
  try {
    const response = await dias.processUserInput({
      message,
      projectName,
      context: {
        messages: conversationHistory,
        currentStep: context?.stage || 'initial',
        projectType: 'auto',
        extractedInfo: context?.extractedInfo
      }
    });

    return {
      response: response.content,
      suggestions: response.suggestions || generateSuggestions(message, context?.stage),
      quickActions: generateQuickActions(context?.stage),
      extractedInfo: response.extractedInfo || {},
      projectOverview: response.projectOverview,
      buildSpecifications: response.buildSpecifications
    };
  } catch (error) {
    console.warn('⚠️ DIAS processing failed, falling back to AI client');
    throw error; // Let router handle fallback
  }
}

/**
 * Process with basic AI client
 */
async function processWithAIClient(
  aiClient: unknown,
  message: string,
  projectName: string,
  conversationHistory: unknown[],
  context: unknown
): Promise<OnboardingChatResponse> {
  console.log('🤖 Using basic AI client processing');
  
  // Build context for AI
  const contextString = buildContextString(message, projectName, conversationHistory, context);
  
  const aiResponse = await aiClient.process({
    role: AIRole.DEVELOPER,
    prompt: contextString,
    context: JSON.stringify({ 
      projectName, 
      stage: context?.stage,
      extractedInfo: context?.extractedInfo
    }),
    temperature: 0.7,
    maxTokens: 1000
  });

  return {
    response: aiResponse.content + "\n\n*Note: Enhanced features are initializing and will be available shortly.*",
    suggestions: generateSuggestions(message, context?.stage),
    quickActions: generateQuickActions(context?.stage),
    extractedInfo: extractBasicInfo(message, aiResponse.content),
    projectOverview: null, // Enhanced feature
    buildSpecifications: null // Enhanced feature
  };
}

/**
 * Build context string for AI processing
 */
function buildContextString(
  message: string,
  projectName: string,
  conversationHistory: unknown[],
  context: unknown
): string {
  const stage = context?.stage || 'initial';
  const historyContext = conversationHistory.slice(-5).map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n');

  return `You are a helpful AI assistant guiding a user through project onboarding.

Project: ${projectName || 'Unnamed Project'}
Current Stage: ${stage}
Recent Conversation:
${historyContext}

Current Message: ${message}

Please provide a helpful, encouraging response that guides the user forward in their project planning. Be specific and actionable.`;
}

/**
 * Extract basic information from the conversation
 */
function extractBasicInfo(message: string, response: string): Record<string, any> {
  const info: Record<string, any> = {};
  
  // Simple extraction patterns
  const projectTypes = ['web app', 'mobile app', 'api', 'website', 'dashboard', 'platform'];
  const foundType = projectTypes.find(type => 
    message.toLowerCase().includes(type) || response.toLowerCase().includes(type)
  );
  
  if (foundType) {
    info.projectType = foundType;
  }
  
  // Extract technologies mentioned
  const technologies = ['react', 'vue', 'angular', 'node', 'python', 'typescript', 'javascript'];
  const foundTech = technologies.filter(tech =>
    message.toLowerCase().includes(tech) || response.toLowerCase().includes(tech)
  );
  
  if (foundTech.length > 0) {
    info.technologies = foundTech;
  }
  
  return info;
}

/**
 * Generate contextual suggestions
 */
function generateSuggestions(message: string, stage?: string): string[] {
  const baseSuggestions = [
    "Tell me more about your project goals",
    "What features are most important to you?",
    "Who is your target audience?"
  ];
  
  switch (stage) {
    case 'initial':
      return [
        "Describe your project idea in detail",
        "What problem does your project solve?",
        "What type of application do you want to build?"
      ];
    case 'requirements':
      return [
        "List the main features you need",
        "What are your technical requirements?",
        "Do you have any design preferences?"
      ];
    case 'features':
      return [
        "Prioritize your feature list",
        "Are there any integrations needed?",
        "What's your timeline for development?"
      ];
    case 'architecture':
      return [
        "Review the proposed architecture",
        "Confirm your technology choices",
        "Discuss deployment preferences"
      ];
    default:
      return baseSuggestions;
  }
}

/**
 * Generate contextual quick actions
 */
function generateQuickActions(stage?: string): Array<{
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'suggest' | 'multi-select' | 'danger' | 'info' | 'warning';
  metadata?: Record<string, unknown>;
}> {
  const baseActions = [
    {
      id: 'next-step',
      label: 'Continue to Next Step',
      type: 'primary' as const,
      metadata: { icon: '→', description: 'Move forward in the onboarding process' }
    },
    {
      id: 'clarify',
      label: 'I need clarification',
      type: 'secondary' as const,
      metadata: { icon: '?', description: 'Ask for more detailed explanation' }
    }
  ];
  
  switch (stage) {
    case 'initial':
      return [
        ...baseActions,
        {
          id: 'project-template',
          label: 'Choose Project Template',
          type: 'suggest' as const,
          metadata: { icon: '📋', description: 'Start with a predefined template' }
        }
      ];
    case 'requirements':
      return [
        ...baseActions,
        {
          id: 'feature-suggestions',
          label: 'Get Feature Suggestions',
          type: 'info' as const,
          metadata: { icon: '💡', description: 'See common features for your project type' }
        }
      ];
    default:
      return baseActions;
  }
}