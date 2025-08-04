/**
 * DIAS AI API Routes
 * REST endpoints for AI Orchestrator operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { DIASServiceIntegrator, createDefaultDIASConfig } from '@/lib/dias/services/dias-service-integrator';
import { AIRequest, SuperClaudeCommand, SuperClaudeFlags } from '@/lib/dias/services/types';

// Initialize DIAS services
const diasConfig = createDefaultDIASConfig();
const diasServices = new DIASServiceIntegrator(diasConfig);

/**
 * POST /api/dias/ai
 * Execute SuperClaude AI command
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      command, 
      args = [], 
      flags = {}, 
      context, 
      sessionId 
    } = body;

    // Validate command
    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Command is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate command is supported
    const supportedCommands: SuperClaudeCommand[] = [
      '/analyze', '/build', '/implement', '/improve', '/design', 
      '/task', '/troubleshoot', '/explain', '/cleanup', '/document', 
      '/estimate', '/test', '/git', '/index', '/load', '/spawn'
    ];

    if (!supportedCommands.includes(command as SuperClaudeCommand)) {
      return NextResponse.json(
        { success: false, error: `Unsupported command: ${command}` },
        { status: 400 }
      );
    }

    // Create AI request
    const aiRequest: AIRequest = {
      command,
      args: Array.isArray(args) ? args : [],
      flags: flags as SuperClaudeFlags,
      context: typeof context === 'string' ? context : undefined,
      sessionId: typeof sessionId === 'string' ? sessionId : undefined
    };

    // Execute command
    const result = await diasServices.executeAICommand(aiRequest);

    // Return response
    return NextResponse.json(result);

  } catch (error) {
    console.error('DIAS AI API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        executionTime: 0
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dias/ai/health
 * AI Orchestrator health check
 */
export async function GET() {
  try {
    const health = await diasServices.systemHealthCheck();
    
    return NextResponse.json({
      success: true,
      data: {
        aiOrchestrator: health.data?.aiOrchestrator,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('DIAS AI health check error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      },
      { status: 500 }
    );
  }
}