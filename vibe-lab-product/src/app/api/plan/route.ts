/**
 * /api/plan - Strategic Planning Endpoint
 * Maps to Architect persona for system design and planning
 */

import { NextRequest, NextResponse } from 'next/server';
import { personaMapper } from '@/lib/integration/persona-mapper';
import { createEnhancedAIClient } from '@/lib/integration/enhanced-ai-client';
import { EventBus } from '@/lib/avca/services/event-bus';
import { AIRole } from '@/lib/avca/services/ai-client';

const eventBus = new EventBus();
const aiClient = createEnhancedAIClient(eventBus, true); // Enable SuperClaude

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context, metadata } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get command mapping for /plan
    const commandMapping = personaMapper.getCommandMapping('/plan');
    if (!commandMapping) {
      return NextResponse.json(
        { error: 'Plan command not configured' },
        { status: 500 }
      );
    }

    // Create enhanced AI request with SuperClaude integration
    const aiRequest = {
      role: AIRole.DEVELOPER, // Will be mapped to architect persona
      command: '/plan' as any,
      prompt: `Strategic Planning Request: ${prompt}`,
      context,
      useSuperClaude: true,
      flags: commandMapping.flags,
      metadata: {
        ...metadata,
        endpoint: '/api/plan',
        timestamp: new Date().toISOString()
      }
    };

    // Process with enhanced AI client
    const response = await aiClient.process(aiRequest);

    return NextResponse.json({
      success: true,
      data: {
        plan: response.content,
        persona: response.persona,
        reasoning: response.reasoning,
        superClaudeUsed: response.superClaudeUsed,
        metadata: {
          tokensUsed: response.usage.totalTokens,
          cost: response.cost,
          duration: response.duration,
          confidence: response.metadata?.confidence
        }
      }
    });

  } catch (error) {
    console.error('Plan API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate plan',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get planning templates and guidance
  return NextResponse.json({
    success: true,
    data: {
      description: 'Strategic planning endpoint for system architecture and project planning',
      persona: 'architect',
      capabilities: [
        'System architecture planning',
        'Project roadmap creation', 
        'Technical decision guidance',
        'Scalability planning',
        'Technology stack recommendations'
      ],
      usage: {
        method: 'POST',
        body: {
          prompt: 'Your planning request or question',
          context: 'Optional: Current system context or constraints',
          metadata: 'Optional: Additional request metadata'
        }
      }
    }
  });
}