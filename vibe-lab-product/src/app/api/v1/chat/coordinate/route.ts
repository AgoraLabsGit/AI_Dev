import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface CoordinationRequest {
  task: string;
  context: {
    projectName: string;
    description: string;
    techStack: string[];
    complexity: number;
  };
  developerResponse?: string;
  auditorFeedback?: string;
}

interface CoordinationResponse {
  success: boolean;
  coordination: {
    taskBreakdown: string[];
    developerInstructions: string;
    auditorCheckpoints: string[];
    estimatedTime: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
  error?: string;
}

const COORDINATION_PROMPT = `You are the Dual-Claude Orchestrator, responsible for coordinating between Developer and Auditor AI agents in the Vibe Lab development environment.

Your role is to:
1. Break down complex tasks into manageable steps
2. Provide clear instructions for the Developer agent
3. Define quality checkpoints for the Auditor agent
4. Estimate time and assess risk levels
5. Ensure efficient collaboration between agents

Respond with a structured coordination plan in the following format:
- Task Breakdown: Step-by-step implementation plan
- Developer Instructions: Specific technical guidance
- Auditor Checkpoints: Quality gates and review points
- Estimated Time: Realistic time estimate
- Risk Level: low/medium/high based on complexity and dependencies

Be concise but thorough. Focus on actionable guidance.`;

export async function POST(request: NextRequest) {
  try {
    const body: CoordinationRequest = await request.json();
    const { task, context, developerResponse, auditorFeedback } = body;

    if (!task || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: task and context' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Build coordination request
    let coordinationInput = `Task: ${task}

Project Context:
- Name: ${context.projectName}
- Description: ${context.description}
- Tech Stack: ${context.techStack.join(', ')}
- Complexity: ${Math.round(context.complexity * 100)}%`;

    if (developerResponse) {
      coordinationInput += `\n\nDeveloper Response:\n${developerResponse}`;
    }

    if (auditorFeedback) {
      coordinationInput += `\n\nAuditor Feedback:\n${auditorFeedback}`;
    }

    coordinationInput += '\n\nProvide a structured coordination plan for this task.';

    // Call Anthropic API for coordination
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      system: COORDINATION_PROMPT,
      messages: [{
        role: 'user',
        content: coordinationInput
      }]
    });

    const responseContent = response.content[0];
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    // Parse the response to extract structured data
    const coordinationText = responseContent.text;
    
    // Extract sections using regex patterns
    const taskBreakdownMatch = coordinationText.match(/Task Breakdown:?\s*([\s\S]*?)(?=Developer Instructions|Auditor Checkpoints|Estimated Time|Risk Level|$)/i);
    const developerInstructionsMatch = coordinationText.match(/Developer Instructions:?\s*([\s\S]*?)(?=Auditor Checkpoints|Estimated Time|Risk Level|$)/i);
    const auditorCheckpointsMatch = coordinationText.match(/Auditor Checkpoints:?\s*([\s\S]*?)(?=Estimated Time|Risk Level|$)/i);
    const estimatedTimeMatch = coordinationText.match(/Estimated Time:?\s*(.*?)(?=Risk Level|$)/i);
    const riskLevelMatch = coordinationText.match(/Risk Level:?\s*(low|medium|high)/i);

    // Parse task breakdown into array
    const taskBreakdown = taskBreakdownMatch?.[1]
      ?.trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*|-\s*|\*\s*/, '').trim())
      .filter(line => line) || [];

    // Parse auditor checkpoints into array
    const auditorCheckpoints = auditorCheckpointsMatch?.[1]
      ?.trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*|-\s*|\*\s*/, '').trim())
      .filter(line => line) || [];

    const coordination = {
      taskBreakdown,
      developerInstructions: developerInstructionsMatch?.[1]?.trim() || 'Follow standard development practices.',
      auditorCheckpoints,
      estimatedTime: estimatedTimeMatch?.[1]?.trim() || 'Time estimate not provided',
      riskLevel: (riskLevelMatch?.[1]?.toLowerCase() as 'low' | 'medium' | 'high') || 'medium'
    };

    const result: CoordinationResponse = {
      success: true,
      coordination
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Coordination API error:', error);
    
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}