import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  agent?: 'developer' | 'auditor';
}

interface ChatRequest {
  messages: ChatMessage[];
  agent: 'developer' | 'auditor';
  projectContext?: {
    name: string;
    description: string;
    techStack: string[];
    complexity: number;
  };
}

// Agent personas and system prompts
const AGENT_PROMPTS = {
  developer: `You are Claude Developer, a Senior Full-Stack Software Engineer specialized in modern web development. You help users build applications, write code, and solve technical problems.

Your expertise includes:
- React, Next.js, TypeScript, Node.js development
- Database design and API development  
- Modern JavaScript/TypeScript patterns
- UI/UX implementation with Tailwind CSS
- Testing and deployment best practices

Always provide:
- Practical, working code examples
- Clear explanations of technical decisions
- Best practices for maintainable code
- Security and performance considerations

You work collaboratively in a dual-agent system with an Auditor for code review.`,

  auditor: `You are Claude Auditor, a Senior Software Quality Assurance Engineer specializing in code review and system analysis.

Your expertise includes:
- Code quality assessment and improvement recommendations
- Security vulnerability identification and mitigation
- Performance optimization and architectural review
- Testing strategy and coverage analysis
- Best practices compliance verification

Always provide:
- Constructive, actionable feedback
- Security and performance insights
- Specific improvement recommendations
- Risk assessment and priority levels

You work collaboratively with a Developer agent to ensure high-quality deliverables.`
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, agent, projectContext } = body;

    // Validate required fields
    if (!messages || !agent) {
      return NextResponse.json(
        { error: 'Missing required fields: messages and agent' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Build system prompt with project context
    let systemPrompt = AGENT_PROMPTS[agent];
    
    if (projectContext) {
      systemPrompt += `\n\nCurrent Project Context:
- Name: ${projectContext.name}
- Description: ${projectContext.description}
- Tech Stack: ${projectContext.techStack.join(', ')}
- Complexity Level: ${Math.round(projectContext.complexity * 100)}%

Tailor your responses to this specific project context.`;
    }

    // Convert messages to Anthropic format with preprocessing
    const anthropicMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Ensure we have at least one user message
    if (anthropicMessages.length === 0 || anthropicMessages[anthropicMessages.length - 1].role !== 'user') {
      throw new Error('Invalid message format: must end with user message');
    }

    // Call Anthropic API with speed-optimized parameters
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,  // Reduced for faster responses
      temperature: 0.1,  // Lower for faster, more focused responses
      system: systemPrompt,
      messages: anthropicMessages
    });

    // We can remove the debugging log now that we know the cause
    // console.log('Anthropic API Response:', JSON.stringify(response, null, 2));

    // Extract response content and handle empty response
    if (!response.content || response.content.length === 0) {
      return NextResponse.json({
        success: true,
        message: {
          role: 'assistant',
          content: "I'm sorry, I was unable to generate a response. This might be due to a safety filter or an issue with the prompt. Please try rephrasing your message.",
          timestamp: new Date().toISOString(),
          agent: agent
        }
      });
    }

    const responseContent = response.content[0];
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    // Return structured response
    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: responseContent.text,
        timestamp: new Date().toISOString(),
        agent: agent
      },
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    const body: ChatRequest = await request.json();
    const { messages, agent } = body;
    
    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      // Check for insufficient credits
      if (error.message.includes('credit balance is too low')) {
        return NextResponse.json({
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: {
            role: 'assistant',
            content: `🔧 **API Configuration Notice**

I'm a real Claude ${agent} agent, but there are insufficient API credits to process your request.

**Demo Response for "${messages[messages.length - 1]?.content || 'your request'}":**

${agent === 'developer' ? 
`🚀 **Developer Agent Response**

I would help you implement this efficiently using modern best practices:

\`\`\`typescript
// Clean, production-ready implementation
export function YourSolution() {
  // TypeScript types for safety
  // Performance optimized
  // Accessible by default
  return <div>Implementation here</div>;
}
\`\`\`

✅ **Features I'd provide:**
- Clean architecture patterns
- Type-safe implementation  
- Performance optimization
- Security best practices` :
`🔍 **Auditor Agent Response**

I would review the implementation for:

✅ **Security Analysis**
- Input validation checks
- Authentication flows
- Data sanitization

⚡ **Performance Review**  
- Bundle size optimization
- Rendering efficiency
- Memory management

🏗️ **Architecture Assessment**
- Code maintainability
- Design pattern adherence
- Scalability considerations`}

💡 **To enable real AI responses:** Add credits to your Anthropic account at console.anthropic.com`,
            timestamp: new Date().toISOString(),
            agent: agent
          }
        });
      }
      
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

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Dual-Claude Chat API is operational',
    timestamp: new Date().toISOString()
  });
}