import { NextRequest, NextResponse } from 'next/server';
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
  _metadata?: {
    processingTime: number;
    mode: string;
    timestamp: string;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Basic Chat: Starting simple processing...');
    
    const body: OnboardingChatRequest = await request.json();
    const { message, projectName, context } = body;

    console.log(`🎯 Basic Chat: Processing "${message.substring(0, 50)}..." for ${projectName}`);

    // Simple response generation without external AI services
    const stage = context?.stage || 'initial';
    const response = generateSimpleResponse(message, stage, projectName);
    const quickActions = generateStageQuickActions(stage);
    const extractedInfo = extractBasicInfo(message, projectName);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Basic Chat: Completed in ${processingTime}ms`);
    
    const finalResponse: OnboardingChatResponse = {
      response,
      suggestions: [],
      quickActions,
      extractedInfo,
      _metadata: {
        processingTime,
        mode: 'basic-fallback',
        timestamp: safeToISOString(new Date())
      }
    };

    return NextResponse.json(finalResponse);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Basic Chat Error:', error);
    
    return NextResponse.json(
      { 
        response: "I'm here to help you build your project! Please tell me what you'd like to create.",
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: ["Describe your project idea", "Tell me about your goals"],
        quickActions: generateStageQuickActions('initial'),
        _metadata: {
          processingTime,
          mode: 'basic-fallback',
          error: true,
          timestamp: safeToISOString(new Date())
        }
      },
      { status: 200 } // Return 200 even on error for better UX
    );
  }
}

function generateSimpleResponse(message: string, stage: string, projectName?: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Instagram clone specific response
  if (lowerMessage.includes('instagram')) {
    return `Great choice! Creating an Instagram-style platform is a fantastic way to learn about social media mechanics and user engagement. Key insight: While many focus on the photo-sharing aspect, Instagram's success largely comes from its elegant solution to two core human needs: self-expression and social validation. Before we dive deeper, I'd love to know: What specific aspect of Instagram interests you most - is it the photo sharing, the social connections, or perhaps the business/creator features?`;
  }
  
  // Web application responses
  if (lowerMessage.includes('web app') || lowerMessage.includes('website')) {
    return `Excellent! Web applications offer incredible flexibility and reach. Based on your message, I can see you're thinking about building something meaningful. What's the core problem you want to solve for your users?`;
  }
  
  // Mobile app responses
  if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
    return `Mobile apps are a great choice! They offer native performance and can leverage device features beautifully. What type of mobile experience are you envisioning?`;
  }
  
  // Social media responses
  if (lowerMessage.includes('social') || lowerMessage.includes('platform')) {
    return `Social platforms are fascinating to build! They're all about connecting people and creating engaging experiences. What kind of interactions do you want to enable between users?`;
  }
  
  // Default responses by stage
  switch (stage) {
    case 'initial':
      return `Hello! I'm excited to help you build your project${projectName ? ` "${projectName}"` : ''}. Tell me more about what you have in mind - what problem are you trying to solve or what experience do you want to create?`;
    
    case 'requirements':
      return `Thanks for sharing those details! I'm getting a clearer picture of your vision. What are the most important features you'd want users to experience first?`;
    
    case 'features':
      return `Perfect! Those features sound really useful. Let's think about the technical side - do you have any preferences for the technology stack or hosting platform?`;
    
    case 'architecture':
      return `Great! We're really shaping up a solid plan. Based on everything you've shared, I think we can start building something amazing. Ready to move forward?`;
    
    default:
      return `That's an interesting idea! Tell me more about what you're envisioning - I'm here to help you turn your concept into reality.`;
  }
}

function generateStageQuickActions(stage: string): Array<{
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'suggest' | 'multi-select' | 'danger' | 'info' | 'warning';
  metadata?: {
    icon?: string;
    description?: string;
    keyboard?: string;
  };
}> {
  const actions = [];
  
  // Stage-specific quick actions
  if (stage === 'initial') {
    actions.push(
      { 
        id: 'web-app', 
        label: 'Web Application', 
        type: 'suggest' as const,
        metadata: {
          icon: 'Globe',
          description: 'Build a modern web application',
          keyboard: '1'
        }
      },
      { 
        id: 'mobile-app', 
        label: 'Mobile App', 
        type: 'suggest' as const,
        metadata: {
          icon: 'Smartphone',
          description: 'Create a mobile application',
          keyboard: '2'
        }
      },
      { 
        id: 'api-service', 
        label: 'API Service', 
        type: 'suggest' as const,
        metadata: {
          icon: 'Zap',
          description: 'Build a backend API service',
          keyboard: '3'
        }
      }
    );
  }

  // Always add helpful universal actions
  actions.push(
    { 
      id: 'get-examples', 
      label: 'Show Examples', 
      type: 'info' as const,
      metadata: {
        icon: 'Lightbulb',
        description: 'See similar project examples',
        keyboard: 'E'
      }
    }
  );
  
  return actions;
}

function extractBasicInfo(message: string, projectName?: string): Record<string, any> {
  const info: Record<string, any> = {};
  
  if (projectName) {
    info.projectName = projectName;
  }
  
  // Simple keyword extraction
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('instagram')) {
    info.projectType = 'social media platform';
    info.inspiration = 'Instagram';
  } else if (lowerMessage.includes('web app') || lowerMessage.includes('website')) {
    info.projectType = 'web application';
  } else if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
    info.projectType = 'mobile application';
  } else if (lowerMessage.includes('api') || lowerMessage.includes('service')) {
    info.projectType = 'API service';
  }
  
  return info;
}