import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/projects/[projectId]/tasks - Get all tasks for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedAgent = searchParams.get('assignedAgent');

    // Build where clause
    const where: any = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedAgent) where.assignedAgent = assignedAgent;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        dependencies: {
          include: {
            dependsOn: {
              select: {
                id: true,
                name: true,
                status: true,
                priority: true,
              }
            }
          }
        },
        dependents: {
          include: {
            task: {
              select: {
                id: true,
                name: true,
                status: true,
                priority: true,
              }
            }
          }
        },
        parentTask: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        subtasks: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true,
            completedAt: true,
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // Calculate task analytics
    const analytics = {
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(t => t.status === 'PENDING').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        blocked: tasks.filter(t => t.status === 'BLOCKED').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        cancelled: tasks.filter(t => t.status === 'CANCELLED').length,
      },
      byPriority: {
        critical: tasks.filter(t => t.priority === 'CRITICAL').length,
        high: tasks.filter(t => t.priority === 'HIGH').length,
        medium: tasks.filter(t => t.priority === 'MEDIUM').length,
        low: tasks.filter(t => t.priority === 'LOW').length,
      },
      byAgent: {
        developer: tasks.filter(t => t.assignedAgent === 'developer').length,
        auditor: tasks.filter(t => t.assignedAgent === 'auditor').length,
        user: tasks.filter(t => t.assignedAgent === 'user').length,
        unassigned: tasks.filter(t => !t.assignedAgent).length,
      },
      estimatedHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      actualHours: tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: tasks,
      analytics,
      meta: {
        projectId,
        filters: { status, priority, assignedAgent },
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects/[projectId]/tasks - Create new task
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await request.json();
    
    const { 
      name, 
      description, 
      priority = 'MEDIUM',
      complexity = 1,
      estimatedHours,
      parentTaskId,
      assignedAgent,
      dependencies = []
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Task name is required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        name,
        description,
        priority,
        complexity: Number(complexity),
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        parentTaskId,
        assignedAgent,
        projectId,
        status: 'PENDING',
        aiGenerated: false,
      },
      include: {
        dependencies: {
          include: {
            dependsOn: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        },
        subtasks: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        }
      }
    });

    // Create task dependencies if provided
    if (dependencies.length > 0) {
      await prisma.taskDependency.createMany({
        data: dependencies.map((depId: string) => ({
          taskId: task.id,
          dependsOnId: depId,
        }))
      });
    }

    // Update project activity
    await prisma.project.update({
      where: { id: projectId },
      data: { lastActivity: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: task,
      meta: {
        timestamp: new Date().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}