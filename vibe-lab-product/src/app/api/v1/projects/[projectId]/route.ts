import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/projects/[projectId] - Get specific project
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
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
            },
            subtasks: {
              select: {
                id: true,
                name: true,
                status: true,
                priority: true,
              }
            }
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        blueprints: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1
        },
        chatHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Last 50 messages
        },
        _count: {
          select: {
            tasks: true,
            chatHistory: true,
            blueprints: true,
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Calculate detailed statistics
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate critical path and blocked tasks
    const blockedTasks = project.tasks.filter(task => task.status === 'BLOCKED');
    const criticalTasks = project.tasks.filter(task => 
      task.priority === 'CRITICAL' || task.priority === 'HIGH'
    );

    const projectWithStats = {
      ...project,
      progress,
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        pending: project.tasks.filter(task => task.status === 'PENDING').length,
        inProgress: project.tasks.filter(task => task.status === 'IN_PROGRESS').length,
        blocked: blockedTasks.length,
        critical: criticalTasks.length,
      },
      insights: {
        blockedTasks: blockedTasks.map(task => ({
          id: task.id,
          name: task.name,
          blockedBy: task.dependencies.map(dep => dep.dependsOn)
        })),
        criticalPath: criticalTasks.slice(0, 5).map(task => ({
          id: task.id,
          name: task.name,
          priority: task.priority,
          estimatedHours: task.estimatedHours,
        }))
      }
    };

    return NextResponse.json({
      success: true,
      data: projectWithStats,
      meta: {
        timestamp: new Date().toISOString(),
        lastActivity: project.lastActivity,
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/v1/projects/[projectId] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await request.json();
    
    const { name, description, status, complexity } = body;

    const updateData: any = {
      lastActivity: new Date(),
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (complexity !== undefined) updateData.complexity = Number(complexity);

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    // Recalculate progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update progress in database
    await prisma.project.update({
      where: { id: projectId },
      data: { progress }
    });

    return NextResponse.json({
      success: true,
      data: { ...project, progress },
      meta: {
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/projects/[projectId] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    await prisma.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
      meta: {
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}