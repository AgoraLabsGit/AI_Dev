import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/projects/[projectId]/tasks/[taskId] - Get specific task
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
      include: {
        dependencies: {
          include: {
            dependsOn: {
              select: {
                id: true,
                name: true,
                status: true,
                priority: true,
                estimatedHours: true,
                actualHours: true,
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
            progress: true,
          }
        },
        subtasks: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true,
            completedAt: true,
            estimatedHours: true,
            actualHours: true,
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
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

    // Calculate completion percentage based on subtasks
    let completionPercentage = 0;
    if (task.subtasks.length > 0) {
      const completedSubtasks = task.subtasks.filter(st => st.status === 'COMPLETED').length;
      completionPercentage = Math.round((completedSubtasks / task.subtasks.length) * 100);
    } else if (task.status === 'COMPLETED') {
      completionPercentage = 100;
    } else if (task.status === 'IN_PROGRESS') {
      completionPercentage = 50; // Estimate for in-progress tasks
    }

    const taskWithMetrics = {
      ...task,
      completionPercentage,
      isBlocked: task.dependencies.some(dep => dep.dependsOn.status !== 'COMPLETED'),
      blockedBy: task.dependencies
        .filter(dep => dep.dependsOn.status !== 'COMPLETED')
        .map(dep => dep.dependsOn),
      blockedTasks: task.dependents
        .filter(dep => dep.task.status === 'BLOCKED')
        .map(dep => dep.task),
      timeSpent: task.actualHours || 0,
      timeRemaining: (task.estimatedHours || 0) - (task.actualHours || 0),
    };

    return NextResponse.json({
      success: true,
      data: taskWithMetrics,
      meta: {
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/v1/projects/[projectId]/tasks/[taskId] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const { projectId, taskId } = params;
    const body = await request.json();
    
    const { 
      name,
      description,
      status,
      priority,
      complexity,
      estimatedHours,
      actualHours,
      assignedAgent,
      parentTaskId
    } = body;

    // Verify task exists and belongs to project
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (complexity !== undefined) updateData.complexity = Number(complexity);
    if (estimatedHours !== undefined) updateData.estimatedHours = Number(estimatedHours);
    if (actualHours !== undefined) updateData.actualHours = Number(actualHours);
    if (assignedAgent !== undefined) updateData.assignedAgent = assignedAgent;
    if (parentTaskId !== undefined) updateData.parentTaskId = parentTaskId;

    // Handle status changes with timestamps
    if (status && status !== existingTask.status) {
      updateData.status = status;
      
      if (status === 'IN_PROGRESS' && !existingTask.startedAt) {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED' && !existingTask.completedAt) {
        updateData.completedAt = new Date();
      } else if (status !== 'COMPLETED' && existingTask.completedAt) {
        updateData.completedAt = null; // Reset completion if status changed from completed
      }
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
        subtasks: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        }
      }
    });

    // Update project activity and recalculate progress
    const allTasks = await prisma.task.findMany({
      where: { projectId },
      select: { status: true }
    });

    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
    const progress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

    await prisma.project.update({
      where: { id: projectId },
      data: { 
        lastActivity: new Date(),
        progress
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedTask,
      meta: {
        timestamp: new Date().toISOString(),
        statusChanged: status && status !== existingTask.status,
        projectProgress: progress,
      }
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/projects/[projectId]/tasks/[taskId] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const { projectId, taskId } = params;

    // Verify task exists and belongs to project
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      include: {
        subtasks: true,
        dependents: true,
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task has dependencies that would be broken
    if (existingTask.dependents.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete task with dependent tasks',
          details: `${existingTask.dependents.length} tasks depend on this task`
        },
        { status: 400 }
      );
    }

    // Delete the task (cascading deletes will handle dependencies and subtasks)
    await prisma.task.delete({
      where: { id: taskId }
    });

    // Update project activity
    await prisma.project.update({
      where: { id: projectId },
      data: { lastActivity: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
      meta: {
        timestamp: new Date().toISOString(),
        deletedSubtasks: existingTask.subtasks.length,
      }
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}