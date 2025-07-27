import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/v1/projects/[projectId]/tasks/[taskId]/status - Update task status only
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const { projectId, taskId } = params;
    const body = await request.json();
    
    const { status, assignedAgent, actualHours } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Verify task exists
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      include: {
        dependencies: {
          include: {
            dependsOn: true
          }
        }
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task can be moved to the requested status
    if (status === 'IN_PROGRESS') {
      // Check if all dependencies are completed
      const blockedBy = existingTask.dependencies.filter(
        dep => dep.dependsOn.status !== 'COMPLETED'
      );
      
      if (blockedBy.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cannot start task with incomplete dependencies',
            details: {
              blockedBy: blockedBy.map(dep => ({
                id: dep.dependsOn.id,
                name: dep.dependsOn.name,
                status: dep.dependsOn.status
              }))
            }
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (assignedAgent !== undefined) {
      updateData.assignedAgent = assignedAgent;
    }

    if (actualHours !== undefined) {
      updateData.actualHours = Number(actualHours);
    }

    // Set timestamps based on status
    if (status === 'IN_PROGRESS' && !existingTask.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      if (!existingTask.completedAt) {
        updateData.completedAt = new Date();
      }
      // Auto-assign actual hours if not provided
      if (actualHours === undefined && existingTask.estimatedHours) {
        updateData.actualHours = existingTask.actualHours || existingTask.estimatedHours;
      }
    } else if (status !== 'COMPLETED' && existingTask.completedAt) {
      updateData.completedAt = null;
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
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
        dependents: {
          include: {
            task: {
              select: {
                id: true,
                name: true,
                status: true,
              }
            }
          }
        }
      }
    });

    // Recalculate project progress
    const allTasks = await prisma.task.findMany({
      where: { projectId },
      select: { status: true }
    });

    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
    const progress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

    // Update project
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        lastActivity: new Date(),
        progress
      }
    });

    // Check for newly unblocked dependent tasks
    const newlyUnblocked = [];
    if (status === 'COMPLETED') {
      for (const dependent of updatedTask.dependents) {
        const dependentTask = await prisma.task.findUnique({
          where: { id: dependent.task.id },
          include: {
            dependencies: {
              include: {
                dependsOn: true
              }
            }
          }
        });

        if (dependentTask) {
          const stillBlocked = dependentTask.dependencies.some(
            dep => dep.dependsOn.status !== 'COMPLETED'
          );

          if (!stillBlocked && dependentTask.status === 'BLOCKED') {
            // Auto-unblock the task
            await prisma.task.update({
              where: { id: dependentTask.id },
              data: { status: 'PENDING' }
            });
            newlyUnblocked.push({
              id: dependentTask.id,
              name: dependentTask.name
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      meta: {
        timestamp: new Date().toISOString(),
        projectProgress: progress,
        statusChanged: true,
        newlyUnblocked,
        notifications: {
          taskCompleted: status === 'COMPLETED',
          taskStarted: status === 'IN_PROGRESS' && existingTask.status === 'PENDING',
          tasksUnblocked: newlyUnblocked.length > 0,
        }
      }
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update task status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/v1/projects/[projectId]/tasks/[taskId]/status - Get task status with dependencies
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const { projectId, taskId } = params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        assignedAgent: true,
        startedAt: true,
        completedAt: true,
        estimatedHours: true,
        actualHours: true,
        updatedAt: true,
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
        }
      }
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Analyze task status
    const isBlocked = task.dependencies.some(dep => dep.dependsOn.status !== 'COMPLETED');
    const canStart = !isBlocked && task.status === 'PENDING';
    const canComplete = task.status === 'IN_PROGRESS';
    const blockedTasks = task.dependents.filter(dep => dep.task.status === 'BLOCKED').length;

    const statusInfo = {
      ...task,
      canStart,
      canComplete,
      isBlocked,
      blockedBy: task.dependencies
        .filter(dep => dep.dependsOn.status !== 'COMPLETED')
        .map(dep => dep.dependsOn),
      blocksCount: blockedTasks,
      timeSpent: task.actualHours || 0,
      timeRemaining: (task.estimatedHours || 0) - (task.actualHours || 0),
      durationDays: task.startedAt && task.completedAt 
        ? Math.ceil((task.completedAt.getTime() - task.startedAt.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    };

    return NextResponse.json({
      success: true,
      data: statusInfo,
      meta: {
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching task status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch task status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}