/**
 * DIAS Task Management API Routes
 * REST endpoints for TaskMaster operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { DIASServiceIntegrator, createDefaultDIASConfig } from '@/lib/dias/services/dias-service-integrator';

// Initialize DIAS services
const diasConfig = createDefaultDIASConfig();
const diasServices = new DIASServiceIntegrator(diasConfig);

/**
 * GET /api/dias/tasks
 * List all tasks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const withSubtasks = searchParams.get('withSubtasks') === 'true';

    const result = await diasServices.listTasks(status, withSubtasks);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('DIAS Tasks GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to list tasks',
        executionTime: 0
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dias/tasks
 * Create tasks from roadmap or add individual task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create-from-roadmap': {
        const { filePath, numTasks } = params;
        
        if (!filePath) {
          return NextResponse.json(
            { success: false, error: 'filePath is required for create-from-roadmap action' },
            { status: 400 }
          );
        }

        const result = await diasServices.createTasksFromRoadmap(filePath, numTasks);
        return NextResponse.json(result);
      }

      case 'initialize-project': {
        const { projectName, description } = params;
        
        if (!projectName) {
          return NextResponse.json(
            { success: false, error: 'projectName is required for initialize-project action' },
            { status: 400 }
          );
        }

        const result = await diasServices.initializeProject(projectName, description);
        return NextResponse.json(result);
      }

      case 'analyze-complexity': {
        const { useResearch = false } = params;
        const result = await diasServices.analyzeTaskComplexity(useResearch);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('DIAS Tasks POST error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Task operation failed',
        executionTime: 0
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dias/tasks/[taskId]
 * Update task status
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, status } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'taskId is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'done', 'deferred', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await diasServices.updateTaskStatus(taskId, status);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('DIAS Tasks PUT error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update task',
        executionTime: 0
      },
      { status: 500 }
    );
  }
}