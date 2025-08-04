import { NextRequest, NextResponse } from 'next/server';
import { AIClientService, AIRole, EntryPathType, AnalysisRequest } from '@/lib/avca/services/ai-client';
import { EventBus } from '@/lib/avca/services/event-bus';
import { EventHandlingSystem } from '@/lib/dias/events/event-handlers';
import { logicMonitor, AVCA_MODULES, DIAS_MODULES, INTEGRATION_MODULES } from '@/lib/monitoring/logic-monitor';
import { safeToISOString } from '@/utils/date';
import { FlexibleObject, ConversationMessage } from '@/types/development-friendly';

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

// Initialize services
let aiClient: AIClientService;
let eventBus: EventBus;
let diasEventHandler: EventHandlingSystem;

async function initializeServices() {
  if (!aiClient) {
    eventBus = new EventBus();
    
    aiClient = new AIClientService(eventBus);
    await aiClient.start();
    
    diasEventHandler = new EventHandlingSystem({ eventBus });
    await diasEventHandler.start();
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeServices();
    
    const body: OnboardingChatRequest = await request.json();
    const { message, projectName, conversationHistory, context } = body;

    // Validate and sanitize timestamps in conversation history
    const sanitizedHistory = conversationHistory.map((msg, index) => ({
      ...msg,
      timestamp: msg.timestamp || safeToISOString(new Date(Date.now() - (conversationHistory.length - index) * 1000))
    }));

    // Start monitoring the overall chat processing flow
    const chatFlowMonitor = logicMonitor.trackModule(
      'INTEGRATION',
      INTEGRATION_MODULES.SERVICE_ORCHESTRATOR,
      'onboarding_chat_processing',
      { 
        message: message.substring(0, 100),
        projectName,
        historyLength: sanitizedHistory.length 
      },
      'Processing onboarding chat message through AVCA and DIAS pipeline'
    );

    // Temporarily disable DIAS to isolate the timestamp issue
    /*
    // Create DIAS event for pattern recognition
    const analysisEvent = EventFactory.createEvent(
      EventCategory.ANALYSIS,
      'onboarding_message_analysis',
      {
        message,
        projectName,
        conversationHistory: sanitizedHistory,
        context,
        timestamp: safeToISOString(new Date())
      }
    );

    // Track DIAS pattern recognition
    const diasMonitor = logicMonitor.trackModule(
      'DIAS',
      DIAS_MODULES.PATTERN_RECOGNITION,
      'analyze_conversation_patterns',
      { 
        messageType: 'onboarding',
        conversationStage: context?.stage || 'initial'
      },
      'Analyzing conversation patterns for intelligent routing'
    );

    // Process through DIAS for pattern recognition
    await diasEventHandler.processEvent(analysisEvent);

    // Complete DIAS monitoring
    logicMonitor.completeModule(
      diasMonitor.flowId,
      diasMonitor.startTime,
      { patternsFound: true, eventProcessed: true },
      { 
        confidence: 90,
        logic: 'Successfully analyzed conversation patterns and processed through event system'
      },
      { tokenUsage: 0, cacheHit: false }
    );
    */

    // Determine conversation stage and entry path
    const entryPath = determineEntryPath(sanitizedHistory, context);
    const conversationStage = determineConversationStage(sanitizedHistory, context);

    // Simplified analysis for faster response
    const analysisRequest: AnalysisRequest = {
      role: AIRole.DEVELOPER, // Use faster role
      prompt: buildSimpleConversationPrompt(message, conversationStage),
      context: JSON.stringify({
        projectName,
        stage: conversationStage,
        historyLength: sanitizedHistory.length
      }),
      entryPath,
      temperature: 0.7,
      maxTokens: 500 // Limit for faster response
    };

    // Track AVCA analysis
    const avcaAnalysisMonitor = logicMonitor.trackModule(
      'AVCA',
      AVCA_MODULES.AI_CLIENT,
      'analyze_user_input',
      { 
        entryPath,
        conversationStage,
        role: analysisRequest.role
      },
      `Analyzing user input through ${entryPath} entry path for ${conversationStage} stage`
    );

    // Quick AI response for better UX
    const aiResponse = await aiClient.process(analysisRequest);

    // Complete AVCA analysis monitoring
    logicMonitor.completeModule(
      avcaAnalysisMonitor.flowId,
      avcaAnalysisMonitor.startTime,
      { 
        responseGenerated: true,
        wordCount: aiResponse.content.split(' ').length,
        tokenUsage: aiResponse.usage.totalTokens
      },
      { 
        confidence: 95,
        logic: `Generated quick response for ${conversationStage} stage`
      },
      { 
        tokenUsage: aiResponse.usage.totalTokens,
        cacheHit: false
      }
    );

    // Generate quick actions and basic extraction
    const extractedInfo = extractBasicInfo(message, projectName);
    const quickActions = generateQuickActions({ content: aiResponse.content }, conversationStage);
    const suggestions: string[] = [];

    // Check if we have enough information to generate project overview
    let projectOverview;
    let buildSpecifications;
    
    // Skip complex blueprint generation for now (faster response)
    if (sanitizedHistory.length >= 3) {
      projectOverview = generateSimpleProjectOverview(extractedInfo, projectName);
    }

    const response: OnboardingChatResponse = {
      response: aiResponse.content,
      suggestions,
      quickActions,
      extractedInfo,
      projectOverview,
      buildSpecifications
    };

    // Complete the overall chat flow monitoring
    logicMonitor.completeModule(
      chatFlowMonitor.flowId,
      chatFlowMonitor.startTime,
      { 
        success: true,
        responseWordCount: aiResponse.content.split(' ').length,
        quickActionsGenerated: quickActions?.length || 0,
        suggestionsGenerated: suggestions?.length || 0,
        extractedInfoFields: Object.keys(extractedInfo || {}).length
      },
      { 
        confidence: 100,
        logic: 'Successfully completed full onboarding chat processing pipeline'
      },
      { 
        tokenUsage: aiResponse.usage.totalTokens,
        cacheHit: false
      }
    );

    // Mark the flow as completed
    logicMonitor.completeFlow(chatFlowMonitor.flowId, 'completed');

    // Log response for monitoring (direct to console for now)
    console.log('🤖 AVCA Response Generated:', {
      projectName,
      userMessage: message.substring(0, 100) + '...',
      aiResponse: aiResponse.content.substring(0, 200) + '...',
      extractedInfo: Object.keys(extractedInfo || {}),
      suggestionsCount: suggestions?.length || 0,
      quickActionsCount: quickActions?.length || 0,
      timestamp: safeToISOString(new Date())
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Onboarding chat error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return NextResponse.json(
      { 
        response: "I'm sorry, I encountered an error processing your message. Please try again.",
        error: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          errorType: error?.constructor?.name || 'Unknown',
          errorString: String(error)
        }
      },
      { status: 500 }
    );
  }
}

function determineEntryPath(history: unknown[], context: unknown): EntryPathType {
  // Check for mentions of existing code, GitHub, or documentation
  const lastMessages = history.slice(-3).map(m => m.content.toLowerCase());
  const allText = lastMessages.join(' ');
  
  if (allText.includes('github') || allText.includes('repository') || allText.includes('repo')) {
    return EntryPathType.GITHUB;
  }
  if (allText.includes('upload') || allText.includes('existing code') || allText.includes('codebase')) {
    return EntryPathType.CODE;
  }
  if (allText.includes('documentation') || allText.includes('docs') || allText.includes('requirements')) {
    return EntryPathType.DOCS;
  }
  
  return EntryPathType.FRESH;
}

function determineConversationStage(history: unknown[], context: unknown): string {
  const messageCount = history.length;
  const extractedInfo = context?.extractedInfo || {};
  
  if (messageCount <= 2) return 'initial';
  if (!extractedInfo.projectType && !extractedInfo.features) return 'requirements';
  if (extractedInfo.projectType && !extractedInfo.architecture) return 'features';
  return 'architecture';
}

function buildSimpleConversationPrompt(message: string, stage: string): string {
  return `You are an expert product architect helping someone build their app idea.

User message: "${message}"
Stage: ${stage}

Respond with:
1. Brief acknowledgment (1-2 sentences)
2. One key insight about their idea
3. One focused follow-up question

Keep it conversational, encouraging, and under 100 words.`;
}

function buildConversationPrompt(message: string, history: unknown[], stage: string): string {
  const stagePrompts = {
    initial: `Analyze this initial project description and extract:
1. Project type (web app, mobile app, API, etc.)
2. Primary purpose and target users
3. Key features mentioned
4. Technical complexity indicators`,
    
    requirements: `Based on the ongoing conversation, extract:
1. Additional features and requirements
2. Technical constraints or preferences
3. Scale and performance needs
4. Integration requirements`,
    
    features: `Focus on feature analysis:
1. Core features vs nice-to-have
2. User flows and interactions
3. Data requirements
4. Third-party integrations`,
    
    architecture: `Analyze architectural needs:
1. Scalability requirements
2. Performance considerations
3. Technology stack preferences
4. Deployment and hosting needs`
  };

  return `${stagePrompts[stage as keyof typeof stagePrompts] || stagePrompts.initial}

Current message: "${message}"

Context from conversation:
${history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

Provide a structured analysis focusing on the current conversation stage.`;
}

function buildResponsePrompt(analysisResult: FlexibleObject, stage: string): string {
  return `Based on the analysis results, generate a conversational response that:

1. Acknowledges what the user has shared
2. Extracts 2-3 key insights from their message
3. Asks 1 focused follow-up question to gather missing critical information
4. Maintains an encouraging, expert tone

Analysis Results:
${JSON.stringify(analysisResult.results, null, 2)}

Current Stage: ${stage}

Guidelines:
- Keep response under 100 words
- Focus on moving the conversation forward
- Show understanding of technical requirements
- Be specific rather than generic
- Sound like an experienced software architect who understands the user's vision`;
}

function extractBasicInfo(message: string, projectName?: string): Record<string, any> {
  const info: Record<string, any> = {};
  
  if (projectName) {
    info.projectName = projectName;
  }
  
  // Simple keyword extraction
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('web app') || lowerMessage.includes('website')) {
    info.projectType = 'web application';
  } else if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
    info.projectType = 'mobile application';
  } else if (lowerMessage.includes('api') || lowerMessage.includes('service')) {
    info.projectType = 'API service';
  }
  
  return info;
}

function generateSimpleProjectOverview(extractedInfo: FlexibleObject, projectName?: string): FlexibleObject {
  return {
    name: projectName || extractedInfo.projectName || 'Your Project',
    description: `A ${extractedInfo.projectType || 'modern application'}`,
    targetUsers: 'Users',
    keyFeatures: [],
    problemSolved: 'Addresses user needs efficiently'
  };
}

function extractInformationFromAnalysis(analysisResult: unknown): Record<string, unknown> {
  const info: Record<string, any> = {};
  
  // Extract from analysis results
  if (analysisResult.results.project_type) {
    info.projectType = analysisResult.results.project_type;
  }
  if (analysisResult.results.features) {
    info.features = analysisResult.results.features;
  }
  if (analysisResult.results.complexity) {
    info.complexity = analysisResult.results.complexity;
  }
  if (analysisResult.results.architecture) {
    info.architecture = analysisResult.results.architecture;
  }
  
  return info;
}

function generateQuickActions(context: FlexibleObject, stage: string): Array<{
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
          icon: '🌐',
          description: 'Build a modern web application',
          keyboard: '1'
        }
      },
      { 
        id: 'mobile-app', 
        label: 'Mobile App', 
        type: 'suggest' as const,
        metadata: {
          icon: '📱',
          description: 'Create a mobile application',
          keyboard: '2'
        }
      },
      { 
        id: 'api-service', 
        label: 'API Service', 
        type: 'suggest' as const,
        metadata: {
          icon: '🔌',
          description: 'Build a backend API service',
          keyboard: '3'
        }
      }
    );
  } else if (stage === 'features') {
    actions.push(
      { 
        id: 'user-auth', 
        label: 'User Authentication', 
        type: 'multi-select' as const,
        metadata: {
          icon: '🔐',
          description: 'Add user login and registration',
          keyboard: '1'
        }
      },
      { 
        id: 'real-time', 
        label: 'Real-time Features', 
        type: 'multi-select' as const,
        metadata: {
          icon: '⚡',
          description: 'Live updates and notifications',
          keyboard: '2'
        }
      },
      { 
        id: 'file-upload', 
        label: 'File Upload', 
        type: 'multi-select' as const,
        metadata: {
          icon: '📁',
          description: 'Allow users to upload files',
          keyboard: '3'
        }
      },
      { 
        id: 'payments', 
        label: 'Payment System', 
        type: 'multi-select' as const,
        metadata: {
          icon: '💳',
          description: 'Integrate payment processing',
          keyboard: '4'
        }
      }
    );
  } else if (stage === 'architecture') {
    actions.push(
      { 
        id: 'react-nextjs', 
        label: 'React + Next.js', 
        type: 'suggest' as const,
        metadata: {
          icon: '⚛️',
          description: 'Modern React framework with SSR',
          keyboard: '1'
        }
      },
      { 
        id: 'node-express', 
        label: 'Node.js + Express', 
        type: 'suggest' as const,
        metadata: {
          icon: '🟢',
          description: 'Fast backend with Express',
          keyboard: '2'
        }
      },
      { 
        id: 'postgresql', 
        label: 'PostgreSQL', 
        type: 'suggest' as const,
        metadata: {
          icon: '🐘',
          description: 'Reliable relational database',
          keyboard: '3'
        }
      }
    );
  } else if (stage === 'requirements') {
    actions.push(
      { 
        id: 'continue-chat', 
        label: 'Continue Conversation', 
        type: 'primary' as const,
        metadata: {
          icon: '💬',
          description: 'Keep discussing your project',
          keyboard: '1'
        }
      },
      { 
        id: 'skip-to-build', 
        label: 'Skip to Build Phase', 
        type: 'secondary' as const,
        metadata: {
          icon: '🏗️',
          description: 'Start building with current info',
          keyboard: '2'
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
        icon: '💡',
        description: 'See similar project examples',
        keyboard: 'E'
      }
    }
  );
  
  return actions;
}

function shouldGenerateOverview(extractedInfo: FlexibleObject, history: ConversationMessage[]): boolean {
  // Generate overview if we have enough information
  const hasProjectType = extractedInfo.projectType;
  const hasFeatures = extractedInfo.features && extractedInfo.features.length > 0;
  const hasArchitecture = extractedInfo.architecture;
  const enoughMessages = history.length >= 6;
  
  return hasProjectType && hasFeatures && (hasArchitecture || enoughMessages);
}

function generateProjectOverview(extractedInfo: FlexibleObject, analysisResult: FlexibleObject): FlexibleObject {
  return {
    name: extractedInfo.projectName || 'Your Project',
    description: extractedInfo.description || `A ${extractedInfo.projectType} application`,
    targetUsers: extractedInfo.targetUsers || 'End users',
    keyFeatures: extractedInfo.features || [],
    problemSolved: extractedInfo.problemSolved || 'Addresses user needs efficiently',
    successMetrics: extractedInfo.successMetrics || ['User adoption', 'Performance', 'Reliability']
  };
}