/**
 * /api/review - Code Review and Quality Assurance Endpoint
 * Maps to QA persona for comprehensive code review and quality assessment
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
    const { 
      prompt, 
      context, 
      codeToReview, 
      reviewType = 'comprehensive',
      metadata 
    } = body;

    if (!prompt && !codeToReview) {
      return NextResponse.json(
        { error: 'Either prompt or codeToReview is required' },
        { status: 400 }
      );
    }

    // Get command mapping for /review
    const commandMapping = personaMapper.getCommandMapping('/review');
    if (!commandMapping) {
      return NextResponse.json(
        { error: 'Review command not configured' },
        { status: 500 }
      );
    }

    // Build review prompt
    let reviewPrompt = '';
    if (codeToReview) {
      reviewPrompt = `Code Review Request (${reviewType}):
${prompt || 'Please review the following code for quality, security, and best practices.'}

Code to Review:
\`\`\`
${codeToReview}
\`\`\`

Please provide:
1. Quality assessment
2. Security considerations  
3. Performance implications
4. Best practice recommendations
5. Specific improvement suggestions`;
    } else {
      reviewPrompt = `Quality Review Request: ${prompt}`;
    }

    // Create enhanced AI request with SuperClaude integration
    const aiRequest = {
      role: AIRole.AUDITOR, // Will be mapped to qa persona
      command: '/review' as any,
      prompt: reviewPrompt,
      context,
      useSuperClaude: true,
      flags: [...commandMapping.flags, '--focus', 'quality'],
      metadata: {
        ...metadata,
        endpoint: '/api/review',
        reviewType,
        hasCode: !!codeToReview,
        timestamp: new Date().toISOString()
      }
    };

    // Process with enhanced AI client
    const response = await aiClient.process(aiRequest);

    return NextResponse.json({
      success: true,
      data: {
        review: response.content,
        persona: response.persona,
        reasoning: response.reasoning,
        superClaudeUsed: response.superClaudeUsed,
        reviewType,
        metadata: {
          tokensUsed: response.usage.totalTokens,
          cost: response.cost,
          duration: response.duration,
          confidence: response.metadata?.confidence
        }
      }
    });

  } catch (error) {
    console.error('Review API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate review',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  // Get review types and guidance
  return NextResponse.json({
    success: true,
    data: {
      description: 'Code review and quality assurance endpoint',
      persona: 'qa',
      reviewTypes: [
        'comprehensive', // Full code review with all aspects
        'security', // Security-focused review
        'performance', // Performance-focused review  
        'quality', // Code quality and maintainability
        'accessibility', // UI accessibility review
        'architecture' // Architectural review
      ],
      capabilities: [
        'Code quality assessment',
        'Security vulnerability detection',
        'Performance bottleneck identification',
        'Best practice validation', 
        'Accessibility compliance checking',
        'Architectural pattern review'
      ],
      usage: {
        method: 'POST',
        body: {
          prompt: 'Your review request or specific concerns',
          codeToReview: 'Optional: Code to be reviewed',
          reviewType: 'Optional: Type of review (default: comprehensive)',
          context: 'Optional: Additional context about the code',
          metadata: 'Optional: Additional request metadata'
        }
      }
    }
  });
}