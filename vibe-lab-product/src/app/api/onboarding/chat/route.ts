import { NextRequest, NextResponse } from 'next/server';
import { AIClientService, AIRole, EntryPathType, AnalysisRequest } from '@/lib/avca/services/ai-client';
import { EventBus } from '@/lib/avca/services/event-bus';
import { EventHandlingSystem } from '@/lib/dias/events/event-handlers';
import { logicMonitor, AVCA_MODULES, INTEGRATION_MODULES } from '@/lib/monitoring/logic-monitor';
import { safeToISOString } from '@/utils/date';
import { FlexibleObject } from '@/types/development-friendly';

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

    // Generate stage-specific information extraction first
    const extractedInfo = extractBasicInfo(message, projectName);
    
    // Determine conversation stage and entry path
    const entryPath = determineEntryPath(sanitizedHistory, context);
    const conversationStage = determineConversationStage(sanitizedHistory, context);

    // Stage-specific analysis with focused goals
    const analysisRequest: AnalysisRequest = {
      role: AIRole.ANALYZER, // Use analyzer for better planning
      prompt: getStageSpecificPrompt(conversationStage, message, extractedInfo),
      context: JSON.stringify({
        projectName,
        stage: conversationStage,
        historyLength: sanitizedHistory.length,
        extractedInfo: extractedInfo,
        conversationHistory: sanitizedHistory.slice(-3)
      }),
      entryPath,
      temperature: 0.7,
      maxTokens: 150 // Keep responses short and focused
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

    // Generate stage-specific quick actions
    const quickActions = generateStageSpecificQuickActions(conversationStage, extractedInfo);
    const suggestions: string[] = [];

    // Check if we have enough information to generate both documents
    let projectOverview;
    let buildSpecifications;
    
    // Generate both foundational documents when we have sufficient info
    if (sanitizedHistory.length >= 3 && extractedInfo.projectType) {
      projectOverview = generateProjectOverview(extractedInfo, projectName, sanitizedHistory);
      buildSpecifications = generateBuildSpecifications(extractedInfo, projectOverview);
    }

    const responseData: any = {
      response: aiResponse.content,
      suggestions,
      quickActions,
      extractedInfo
    };
    
    if (projectOverview) {
      responseData.projectOverview = projectOverview;
    }
    
    if (buildSpecifications) {
      responseData.buildSpecifications = buildSpecifications;
    }
    
    const response: OnboardingChatResponse = responseData;

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

function determineEntryPath(history: unknown[], _context: unknown): EntryPathType {
  // Check for mentions of existing code, GitHub, or documentation
  const lastMessages = history.slice(-3).map((m: any) => m.content.toLowerCase());
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

function determineConversationStage(history: unknown[], context: any): string {
  const messageCount = history.length;
  const extractedInfo = context?.extractedInfo || {};
  
  if (messageCount <= 2) return 'initial';
  if (!extractedInfo.projectType && !extractedInfo.features) return 'requirements';
  if (extractedInfo.projectType && !extractedInfo.architecture) return 'features';
  return 'architecture';
}

function getStageSpecificPrompt(stage: string, message: string, extractedInfo: any, existingDocs?: any): string {
  const hasExistingDocs = existingDocs?.projectOverview || existingDocs?.buildSpecifications;
  
  if (hasExistingDocs) {
    // ITERATION MODE: Single Source of Truth document management
    return `You are managing the SINGLE SOURCE OF TRUTH for this AVCA project.

CURRENT PROJECT OVERVIEW (drives all development): ${JSON.stringify(existingDocs.projectOverview || {})}
CURRENT BUILD SPECIFICATIONS (defines system architecture): ${JSON.stringify(existingDocs.buildSpecifications || {})}

User message: "${message}"
Current context: ${JSON.stringify(extractedInfo)}

CRITICAL UNDERSTANDING:
These documents are the foundation for ALL code generation through the AVCA pipeline:
- Project Overview → Defines WHAT to build (features, users, problems)
- Build Specifications → Defines HOW to build it (tech stack, architecture, components)
- ALL AVCA code generation flows from these documents
- Changes here cascade through the entire system

Your task:
1. Determine if this request requires updating the Single Source of Truth documents
2. If YES: Propose specific document updates and explain the downstream impact
3. If NO: Provide guidance based on EXISTING documents without changes

UPDATE ONLY IF:
- Fundamental project scope change (new features, different users, pivot)
- Architectural requirements change (scale, tech stack, integrations)  
- Core problem or solution evolution

MAINTAIN CONSISTENCY: All responses must align with current documents unless updating them.`;
  }

  // INITIAL MODE: No documents exist yet
  const prompts = {
    'initial': `Project creation mode. Need: project name, type, target users, key features.

Message: "${message}"
Info: ${JSON.stringify(extractedInfo)}

Ask ONE focused question. Keep it short.`,

    'requirements': `Defining features and requirements.

Message: "${message}"
Info: ${JSON.stringify(extractedInfo)}

Ask about missing features or user workflows. Keep it brief.`,

    'features': `Technical planning mode. Need tech stack and architecture decisions.

Message: "${message}"
Info: ${JSON.stringify(extractedInfo)}

Suggest tech stack or ask about scale/complexity. Be concise.`,

    'architecture': `Final tech choices needed for Build Specifications.

Message: "${message}"
Info: ${JSON.stringify(extractedInfo)}

Finalize tech stack. Keep recommendations short.`
  };

  return prompts[stage as keyof typeof prompts] || prompts.initial;
}



function extractBasicInfo(message: string, projectName?: string): Record<string, any> {
  const info: Record<string, any> = {};
  
  if (projectName) {
    info.projectName = projectName;
  }
  
  const lowerMessage = message.toLowerCase();
  
  // Project type detection
  if (lowerMessage.includes('web app') || lowerMessage.includes('website')) {
    info.projectType = 'web application';
  } else if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
    info.projectType = 'mobile application';
  } else if (lowerMessage.includes('api') || lowerMessage.includes('service')) {
    info.projectType = 'API service';
  } else if (lowerMessage.includes('marketplace')) {
    info.projectType = 'marketplace';
  } else if (lowerMessage.includes('social')) {
    info.projectType = 'social platform';
  }
  
  // Target users extraction
  const userPatterns = [
    /for ([a-zA-Z\s]+) who/g,
    /help ([a-zA-Z\s]+) to/g,
    /([a-zA-Z\s]+) can use/g
  ];
  
  for (const pattern of userPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      info.targetUsers = match[1].trim();
      break;
    }
  }
  
  // Problem/solution extraction
  if (lowerMessage.includes('problem') || lowerMessage.includes('solve')) {
    info.hasProblemStatement = true;
  }
  
  // Feature mentions
  const features = [];
  if (lowerMessage.includes('auth') || lowerMessage.includes('login')) features.push('authentication');
  if (lowerMessage.includes('payment') || lowerMessage.includes('buy')) features.push('payments');
  if (lowerMessage.includes('chat') || lowerMessage.includes('message')) features.push('messaging');
  if (lowerMessage.includes('real-time') || lowerMessage.includes('live')) features.push('real-time');
  
  if (features.length > 0) {
    info.mentionedFeatures = features;
  }
  
  return info;
}

function generateProjectOverview(extractedInfo: FlexibleObject, projectName?: string, conversationHistory?: any[]): FlexibleObject {
  // Extract more detailed information from conversation history
  const allMessages = conversationHistory?.map((msg: any) => msg.content.toLowerCase()).join(' ') || '';
  
  // Extract key features from conversation
  const features = [];
  if (allMessages.includes('auth') || allMessages.includes('login') || allMessages.includes('user')) features.push('User Authentication');
  if (allMessages.includes('payment') || allMessages.includes('buy') || allMessages.includes('purchase')) features.push('Payment Processing');
  if (allMessages.includes('chat') || allMessages.includes('message') || allMessages.includes('communicate')) features.push('Messaging System');
  if (allMessages.includes('search') || allMessages.includes('find') || allMessages.includes('discover')) features.push('Search Functionality');
  if (allMessages.includes('admin') || allMessages.includes('manage') || allMessages.includes('dashboard')) features.push('Admin Dashboard');
  if (allMessages.includes('mobile') || allMessages.includes('responsive')) features.push('Mobile Responsive Design');
  if (allMessages.includes('real-time') || allMessages.includes('live') || allMessages.includes('instant')) features.push('Real-time Updates');
  
  // Add project-type specific features
  if (extractedInfo.projectType === 'marketplace') {
    features.push('Product Listings', 'Vendor Management', 'Order Management');
  } else if (extractedInfo.projectType === 'social platform') {
    features.push('User Profiles', 'Content Feed', 'Social Interactions');
  } else if (extractedInfo.projectType === 'web application') {
    features.push('User Dashboard', 'Data Management', 'Analytics');
  }
  
  // Extract target users more intelligently
  let targetUsers = extractedInfo.targetUsers || 'General Users';
  if (allMessages.includes('business') || allMessages.includes('company')) targetUsers = 'Business Users';
  if (allMessages.includes('developer') || allMessages.includes('programmer')) targetUsers = 'Developers';
  if (allMessages.includes('student') || allMessages.includes('education')) targetUsers = 'Students';
  if (allMessages.includes('consumer') || allMessages.includes('customer')) targetUsers = 'Consumers';
  
  // Generate problem statement
  let problemSolved = 'Addresses user needs efficiently';
  if (extractedInfo.projectType === 'marketplace') {
    problemSolved = 'Connects buyers and sellers in a streamlined digital marketplace';
  } else if (extractedInfo.projectType === 'social platform') {
    problemSolved = 'Facilitates meaningful connections and content sharing between users';
  } else if (extractedInfo.projectType === 'web application') {
    problemSolved = 'Provides an efficient digital solution for user workflows and data management';
  }

  return {
    name: projectName || extractedInfo.projectName || 'Your Project',
    description: `A comprehensive ${extractedInfo.projectType || 'modern application'} designed to ${problemSolved.toLowerCase()}`,
    targetUsers,
    keyFeatures: features.length > 0 ? features : ['Core Functionality', 'User Management', 'Data Processing'],
    problemSolved,
    successMetrics: [
      'User engagement and retention',
      'System performance and reliability',
      'Business goals achievement'
    ],
    userJourneys: [
      'User registration and onboarding',
      'Core feature utilization',
      'Account management and settings'
    ]
  };
}

function generateBuildSpecifications(extractedInfo: FlexibleObject, projectOverview: FlexibleObject): FlexibleObject {
  const projectType = extractedInfo.projectType || 'web application';
  const features = projectOverview.keyFeatures || [];
  
  // Determine tech stack based on project type and features
  let techStack = {
    frontend: 'React with TypeScript',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    styling: 'Tailwind CSS',
    authentication: 'NextAuth.js',
    deployment: 'Vercel'
  };
  
  // Adjust tech stack based on project type
  if (projectType === 'mobile application') {
    techStack.frontend = 'React Native with TypeScript';
    techStack.deployment = 'App Store / Google Play';
  } else if (projectType === 'API service') {
    techStack.frontend = 'Admin Dashboard (React)';
    techStack.backend = 'Node.js with Fastify';
  }
  
  // Add integrations based on features
  const integrations = [];
  if (features.some((f: string) => f.toLowerCase().includes('payment'))) {
    integrations.push('Stripe Payment Processing');
  }
  if (features.some((f: string) => f.toLowerCase().includes('email'))) {
    integrations.push('SendGrid Email Service');
  }
  if (features.some((f: string) => f.toLowerCase().includes('storage'))) {
    integrations.push('AWS S3 File Storage');
  }
  if (features.some((f: string) => f.toLowerCase().includes('analytics'))) {
    integrations.push('Google Analytics');
  }
  
  // Determine architecture pattern
  let architecturePattern = 'Monolithic';
  if (features.length > 6 || projectType === 'marketplace') {
    architecturePattern = 'Microservices';
  } else if (features.length > 3) {
    architecturePattern = 'Modular Monolith';
  }
  
  // Generate data models based on project type
  const dataModels = [];
  if (features.some((f: string) => f.toLowerCase().includes('user'))) {
    dataModels.push('User', 'UserProfile', 'UserSession');
  }
  if (projectType === 'marketplace') {
    dataModels.push('Product', 'Order', 'Vendor', 'Category');
  } else if (projectType === 'social platform') {
    dataModels.push('Post', 'Comment', 'Follow', 'Like');
  } else {
    dataModels.push('Item', 'Category', 'Activity');
  }
  
  return {
    techStack,
    architecture: {
      pattern: architecturePattern,
      description: `${architecturePattern} architecture for ${projectType} with scalable component design`
    },
    dataModels,
    integrations,
    securityRequirements: [
      'HTTPS encryption',
      'Input validation and sanitization',
      'Authentication and authorization',
      'Data privacy compliance (GDPR)',
      'API rate limiting'
    ],
    performanceTargets: {
      pageLoadTime: '< 3 seconds',
      apiResponseTime: '< 200ms',
      uptime: '99.9%',
      concurrentUsers: projectType === 'marketplace' ? '10,000+' : '1,000+'
    },
    scalingStrategy: architecturePattern === 'Microservices' ? 
      'Horizontal scaling with containerized services' :
      'Vertical scaling with load balancing',
    testingStrategy: [
      'Unit testing (Jest)',
      'Integration testing',
      'End-to-end testing (Playwright)',
      'Performance testing'
    ]
  };
}


function detectDocumentUpdateNeeds(message: string, existingDocs: any): {
  needsProjectOverviewUpdate: boolean;
  needsBuildSpecsUpdate: boolean;
  updateReasons: string[];
} {
  const lowerMessage = message.toLowerCase();
  const updateReasons: string[] = [];
  let needsProjectOverviewUpdate = false;
  let needsBuildSpecsUpdate = false;
  
  // Project Overview update triggers
  const overviewTriggers = [
    { pattern: /add.*feature|new.*feature|also want|need.*to/, reason: "New feature addition" },
    { pattern: /change.*target|different.*users|now.*for/, reason: "Target audience change" },
    { pattern: /pivot|different.*problem|solve.*instead/, reason: "Problem/solution pivot" },
    { pattern: /rebrand|rename|call.*it/, reason: "Project name/branding change" }
  ];
  
  for (const trigger of overviewTriggers) {
    if (trigger.pattern.test(lowerMessage)) {
      needsProjectOverviewUpdate = true;
      updateReasons.push(trigger.reason);
    }
  }
  
  // Build Specifications update triggers
  const specsTriggers = [
    { pattern: /switch.*to|use.*instead|migrate.*to/, reason: "Tech stack change" },
    { pattern: /scale.*to|handle.*users|performance/, reason: "Scalability requirements change" },
    { pattern: /add.*integration|connect.*to|api/, reason: "New integration requirements" },
    { pattern: /security.*require|compliance|audit/, reason: "Security/compliance requirements" }
  ];
  
  for (const trigger of specsTriggers) {
    if (trigger.pattern.test(lowerMessage)) {
      needsBuildSpecsUpdate = true;
      updateReasons.push(trigger.reason);
    }
  }
  
  return { needsProjectOverviewUpdate, needsBuildSpecsUpdate, updateReasons };
}

function generateStageSpecificQuickActions(stage: string, extractedInfo: any, existingDocs?: any): Array<{
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
  const hasExistingDocs = existingDocs?.projectOverview || existingDocs?.buildSpecifications;
  
  if (hasExistingDocs) {
    // ITERATION MODE: Show document management actions
    actions.push(
      { 
        id: 'update-overview', 
        label: 'Update Project Overview', 
        type: 'primary' as const,
        metadata: { icon: '📝', description: 'Modify project vision and goals' }
      },
      { 
        id: 'update-build-specs', 
        label: 'Update Build Specifications', 
        type: 'primary' as const,
        metadata: { icon: '🔧', description: 'Change technical requirements' }
      },
      { 
        id: 'generate-docs', 
        label: 'Generate Documents', 
        type: 'primary' as const,
        metadata: { icon: '📄', description: 'Create project documents' }
      }
    );
  } else {
    // CREATION MODE: Generate comprehensive feature selection buttons
    switch (stage) {
      case 'initial':
        if (!extractedInfo.projectType) {
          actions.push(
            { id: 'web-app', label: 'Web App', type: 'suggest' as const, metadata: { icon: '🌐' }},
            { id: 'mobile-app', label: 'Mobile App', type: 'suggest' as const, metadata: { icon: '📱' }},
            { id: 'marketplace', label: 'Marketplace', type: 'suggest' as const, metadata: { icon: '🛒' }},
            { id: 'social-app', label: 'Social Platform', type: 'suggest' as const, metadata: { icon: '👥' }}
          );
        }
        break;

      case 'requirements':
        // Generate project-specific feature buttons
        const projectType = extractedInfo.projectType;
        
        if (projectType === 'web app' || projectType === 'web application') {
          // Todo app features example
          actions.push(
            // Core Features
            { id: 'task-management', label: 'Task Management', type: 'primary' as const, metadata: { icon: '✅', description: 'Add, edit, delete tasks' }},
            { id: 'task-properties', label: 'Due Dates & Priority', type: 'primary' as const, metadata: { icon: '📅', description: 'Task scheduling' }},
            
            // Standard Features  
            { id: 'organization', label: 'Categories & Lists', type: 'suggest' as const, metadata: { icon: '📁', description: 'Organize tasks' }},
            { id: 'search-filter', label: 'Search & Filter', type: 'suggest' as const, metadata: { icon: '🔍', description: 'Find tasks easily' }},
            { id: 'data-persistence', label: 'Save Data', type: 'suggest' as const, metadata: { icon: '💾', description: 'Keep your tasks safe' }},
            
            // Advanced Features
            { id: 'subtasks', label: 'Subtasks', type: 'secondary' as const, metadata: { icon: '📝', description: 'Break down complex tasks' }},
            { id: 'notifications', label: 'Reminders', type: 'secondary' as const, metadata: { icon: '🔔', description: 'Never miss a deadline' }},
            { id: 'themes', label: 'Dark/Light Theme', type: 'secondary' as const, metadata: { icon: '🎨', description: 'Customize appearance' }}
          );
        } else if (projectType === 'marketplace') {
          actions.push(
            // Core marketplace features
            { id: 'product-listings', label: 'Product Listings', type: 'primary' as const, metadata: { icon: '🏪', description: 'Display products' }},
            { id: 'user-accounts', label: 'User Accounts', type: 'primary' as const, metadata: { icon: '👤', description: 'Buyers and sellers' }},
            { id: 'payment-system', label: 'Payment Processing', type: 'primary' as const, metadata: { icon: '💳', description: 'Secure transactions' }},
            
            // Standard features
            { id: 'search-browse', label: 'Search & Browse', type: 'suggest' as const, metadata: { icon: '🔍', description: 'Find products easily' }},
            { id: 'reviews-ratings', label: 'Reviews & Ratings', type: 'suggest' as const, metadata: { icon: '⭐', description: 'Build trust' }},
            { id: 'order-management', label: 'Order Tracking', type: 'suggest' as const, metadata: { icon: '📦', description: 'Track purchases' }},
            
            // Advanced features
            { id: 'vendor-dashboard', label: 'Vendor Dashboard', type: 'secondary' as const, metadata: { icon: '📊', description: 'Seller analytics' }},
            { id: 'messaging-system', label: 'Buyer-Seller Chat', type: 'secondary' as const, metadata: { icon: '💬', description: 'Direct communication' }}
          );
        } else if (projectType === 'social platform' || projectType === 'social app') {
          actions.push(
            // Core social features
            { id: 'user-profiles', label: 'User Profiles', type: 'primary' as const, metadata: { icon: '👤', description: 'Personal profiles' }},
            { id: 'content-feed', label: 'Activity Feed', type: 'primary' as const, metadata: { icon: '📱', description: 'Content stream' }},
            { id: 'social-interactions', label: 'Like & Share', type: 'primary' as const, metadata: { icon: '👍', description: 'Engage with content' }},
            
            // Standard features
            { id: 'messaging', label: 'Direct Messages', type: 'suggest' as const, metadata: { icon: '💬', description: 'Private chat' }},
            { id: 'friend-system', label: 'Follow/Friends', type: 'suggest' as const, metadata: { icon: '👥', description: 'Build connections' }},
            { id: 'content-creation', label: 'Post Creation', type: 'suggest' as const, metadata: { icon: '✏️', description: 'Share content' }},
            
            // Advanced features
            { id: 'groups-communities', label: 'Groups/Communities', type: 'secondary' as const, metadata: { icon: '👥', description: 'Interest-based groups' }},
            { id: 'live-features', label: 'Live Streaming', type: 'secondary' as const, metadata: { icon: '📹', description: 'Real-time content' }}
          );
        } else {
          // Generic app features
          actions.push(
            { id: 'user-auth', label: 'User Accounts', type: 'primary' as const, metadata: { icon: '👤', description: 'Login system' }},
            { id: 'data-management', label: 'Data Storage', type: 'primary' as const, metadata: { icon: '💾', description: 'Save user data' }},
            { id: 'admin-panel', label: 'Admin Dashboard', type: 'suggest' as const, metadata: { icon: '🔧', description: 'Manage content' }},
            { id: 'search-functionality', label: 'Search', type: 'suggest' as const, metadata: { icon: '🔍', description: 'Find content' }},
            { id: 'notifications', label: 'Notifications', type: 'secondary' as const, metadata: { icon: '🔔', description: 'Keep users informed' }}
          );
        }
        
        // Add focus options
        actions.push(
          { id: 'focus-simple', label: 'Keep It Simple', type: 'info' as const, metadata: { icon: '🎯', description: 'Minimal features, fast launch' }},
          { id: 'focus-comprehensive', label: 'Full-Featured', type: 'info' as const, metadata: { icon: '🚀', description: 'Complete solution' }}
        );
        break;

      case 'features':
      case 'architecture':
        actions.push(
          { id: 'recommend-stack', label: 'Recommend Tech Stack', type: 'primary' as const, metadata: { icon: '🔧' }},
          { id: 'generate-docs', label: 'Generate Documents', type: 'primary' as const, metadata: { icon: '📄' }}
        );
        break;
    }
  }

  return actions;
}


