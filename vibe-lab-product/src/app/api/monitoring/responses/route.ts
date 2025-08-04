import { NextResponse } from 'next/server';

// In-memory store for recent responses (in production, this would be a database)
let recentResponses: Array<{
  id: string;
  timestamp: string;
  projectName: string;
  userMessage: string;
  aiResponse: string;
  extractedInfo: Record<string, unknown>;
  suggestions: string[];
  quickActions: Record<string, unknown>[];
}> = [];

export async function GET() {
  return NextResponse.json({
    responses: recentResponses.slice(-10), // Last 10 responses
    count: recentResponses.length
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const responseRecord = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    recentResponses.push(responseRecord);
    
    // Keep only last 50 responses
    if (recentResponses.length > 50) {
      recentResponses = recentResponses.slice(-50);
    }
    
    return NextResponse.json({ success: true, id: responseRecord.id });
  } catch (error) {
    console.error('Error storing response:', error);
    return NextResponse.json(
      { error: 'Failed to store response' },
      { status: 500 }
    );
  }
}