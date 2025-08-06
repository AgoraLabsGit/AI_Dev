/**
 * /api/help - Intelligent Help and Guidance System
 * Maps to Mentor persona for educational support and system guidance
 */

import { NextRequest, NextResponse } from 'next/server';
import { personaMapper } from '@/lib/integration/persona-mapper';
import { createEnhancedAIClient } from '@/lib/integration/enhanced-ai-client';
import { EventBus } from '@/lib/avca/services/event-bus';
import { AIRole } from '@/lib/avca/services/ai-client';

const eventBus = new EventBus();
const aiClient = createEnhancedAIClient(eventBus, true); // Enable SuperClaude

// Help topics and system information
const HELP_TOPICS = {
  system: {
    title: 'Vibe Lab System Overview',
    description: 'Learn about the Vibe Lab AI-powered development platform',
    capabilities: [
      'AI-verified component architecture (AVCA)',
      'Dynamic intelligence and adaptation system (DIAS)',
      'Automated code generation and quality assurance',
      'Intelligent task management and project planning'
    ]
  },
  personas: {
    title: 'AI Personas and Capabilities', 
    description: 'Understanding the different AI specialists available',
    personas: [
      { name: 'architect', role: 'System design and planning' },
      { name: 'frontend', role: 'UI/UX development and React components' },
      { name: 'backend', role: 'Server-side development and APIs' },
      { name: 'qa', role: 'Quality assurance and testing' },
      { name: 'security', role: 'Security analysis and vulnerability assessment' },
      { name: 'performance', role: 'Performance optimization and monitoring' },
      { name: 'analyzer', role: 'Root cause analysis and investigation' },
      { name: 'refactorer', role: 'Code quality improvement and technical debt' },
      { name: 'mentor', role: 'Knowledge transfer and guidance' },
      { name: 'scribe', role: 'Documentation and technical writing' },
      { name: 'devops', role: 'Infrastructure and deployment automation' }
    ]
  },
  commands: {
    title: 'Available Commands and Endpoints',
    description: 'How to interact with the Vibe Lab AI system',
    endpoints: [
      { path: '/api/plan', method: 'POST', purpose: 'Strategic planning and architecture' },
      { path: '/api/review', method: 'POST', purpose: 'Code review and quality assurance' },
      { path: '/api/help', method: 'GET/POST', purpose: 'Help and guidance system' },
      { path: '/api/chat', method: 'POST', purpose: 'General AI conversation and assistance' },
      { path: '/api/dias/ai', method: 'POST', purpose: 'Direct DIAS AI orchestrator access' },
      { path: '/api/dias/tasks', method: 'GET/POST', purpose: 'Task management and tracking' }
    ]
  },
  integration: {
    title: 'SuperClaude Framework Integration',
    description: 'Advanced AI capabilities through SuperClaude',
    features: [
      'Multi-persona intelligent routing',
      'Context-aware response generation',
      'MCP server integration (Context7, Sequential, Magic, Playwright)',
      'Quality gates and validation cycles',
      'Token optimization and cost management'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, topic, context, metadata } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required for help requests' },
        { status: 400 }
      );
    }

    // Get command mapping for /help
    const commandMapping = personaMapper.getCommandMapping('/help');
    if (!commandMapping) {
      return NextResponse.json(
        { error: 'Help command not configured' },
        { status: 500 }
      );
    }

    // Build help prompt with system context
    const helpPrompt = `Help Request: ${prompt}

System Context:
- You are the Vibe Lab AI assistant with access to comprehensive system knowledge
- Provide clear, actionable guidance tailored to the user's experience level
- Include relevant examples and next steps when appropriate
- Focus on helping users accomplish their goals effectively

${topic ? `Specific Topic: ${topic}` : ''}
${context ? `Additional Context: ${context}` : ''}

Please provide helpful, detailed guidance while being concise and actionable.`;

    // Create enhanced AI request with SuperClaude integration
    const aiRequest = {
      role: AIRole.ROUTER, // Will be mapped to mentor persona
      command: '/help' as string,
      prompt: helpPrompt,
      context: JSON.stringify(HELP_TOPICS), // Provide system knowledge as context
      useSuperClaude: true,
      flags: commandMapping.flags,
      metadata: {
        ...metadata,
        endpoint: '/api/help',
        topic,
        timestamp: new Date().toISOString()
      }
    };

    // Process with enhanced AI client
    const response = await aiClient.process(aiRequest);

    return NextResponse.json({
      success: true,
      data: {
        guidance: response.content,
        persona: response.persona,
        reasoning: response.reasoning,
        superClaudeUsed: response.superClaudeUsed,
        topic,
        relatedTopics: getSuggestedTopics(prompt, topic),
        metadata: {
          tokensUsed: response.usage.totalTokens,
          cost: response.cost,
          duration: response.duration,
          confidence: response.metadata?.confidence
        }
      }
    });

  } catch (error) {
    console.error('Help API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate help response',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  // Return specific topic information or general help overview
  if (topic && HELP_TOPICS[topic as keyof typeof HELP_TOPICS]) {
    const topicData = HELP_TOPICS[topic as keyof typeof HELP_TOPICS];
    return NextResponse.json({
      success: true,
      data: {
        topic,
        ...topicData,
        availableTopics: Object.keys(HELP_TOPICS)
      }
    });
  }

  // Return general help overview
  return NextResponse.json({
    success: true,
    data: {
      description: 'Vibe Lab AI Help and Guidance System',
      persona: 'mentor',
      topics: HELP_TOPICS,
      usage: {
        get: 'GET /api/help?topic=<topic> - Get information about specific topics',
        post: 'POST /api/help - Ask specific questions and get personalized guidance',
        body: {
          prompt: 'Your question or help request',
          topic: 'Optional: Specific topic area (system, personas, commands, integration)',
          context: 'Optional: Additional context about your situation',
          metadata: 'Optional: Additional request metadata'
        }
      },
      examples: [
        'How do I create a new component using AVCA?',
        'What personas are available for different types of work?', 
        'How do I integrate SuperClaude with my existing workflow?',
        'What are the best practices for code review in Vibe Lab?'
      ]
    }
  });
}

/**
 * Get suggested related topics based on user query
 */
function getSuggestedTopics(prompt: string, currentTopic?: string): string[] {
  const promptLower = prompt.toLowerCase();
  const suggestions: string[] = [];

  // Topic suggestions based on prompt content
  if (promptLower.includes('component') || promptLower.includes('ui')) {
    suggestions.push('personas', 'commands');
  }
  if (promptLower.includes('plan') || promptLower.includes('architecture')) {
    suggestions.push('system', 'personas');
  }
  if (promptLower.includes('review') || promptLower.includes('quality')) {
    suggestions.push('personas', 'integration');
  }
  if (promptLower.includes('persona') || promptLower.includes('ai')) {
    suggestions.push('personas', 'integration');
  }

  // Add general topics if none matched
  if (suggestions.length === 0) {
    suggestions.push('system', 'personas', 'commands');
  }

  // Filter out current topic and deduplicate
  return [...new Set(suggestions.filter(topic => topic !== currentTopic))];
}