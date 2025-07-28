import { NextRequest, NextResponse } from 'next/server';

interface AgentStatus {
  id: string;
  type: 'developer' | 'auditor';
  status: 'idle' | 'thinking' | 'active' | 'error';
  lastActivity: string;
  currentTask?: string;
  projectId?: string;
}

// In-memory store for agent status (in production, use Redis or database)
let agentStatuses: Map<string, AgentStatus> = new Map();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');
  
  if (projectId) {
    // Get agents for specific project
    const projectAgents = Array.from(agentStatuses.values())
      .filter(agent => agent.projectId === projectId);
    
    return NextResponse.json({
      success: true,
      agents: projectAgents
    });
  }
  
  // Get all agents
  return NextResponse.json({
    success: true,
    agents: Array.from(agentStatuses.values())
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, type, status, currentTask, projectId } = body;
    
    if (!agentId || !type || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, type, status' },
        { status: 400 }
      );
    }
    
    const agentStatus: AgentStatus = {
      id: agentId,
      type,
      status,
      lastActivity: new Date().toISOString(),
      currentTask,
      projectId
    };
    
    agentStatuses.set(agentId, agentStatus);
    
    return NextResponse.json({
      success: true,
      agent: agentStatus
    });
    
  } catch (error) {
    console.error('Agent status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, status, currentTask } = body;
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing required field: agentId' },
        { status: 400 }
      );
    }
    
    const existingAgent = agentStatuses.get(agentId);
    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    const updatedAgent: AgentStatus = {
      ...existingAgent,
      status: status || existingAgent.status,
      currentTask: currentTask !== undefined ? currentTask : existingAgent.currentTask,
      lastActivity: new Date().toISOString()
    };
    
    agentStatuses.set(agentId, updatedAgent);
    
    return NextResponse.json({
      success: true,
      agent: updatedAgent
    });
    
  } catch (error) {
    console.error('Agent status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: agentId' },
        { status: 400 }
      );
    }
    
    const existed = agentStatuses.delete(agentId);
    
    if (!existed) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Agent status removed'
    });
    
  } catch (error) {
    console.error('Agent status deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}