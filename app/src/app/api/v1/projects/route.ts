import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where = status ? { status: status as any } : {};
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            completedAt: true,
          }
        },
        _count: {
          select: {
            tasks: true,
            chatHistory: true,
          }
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    // Calculate progress and task statistics
    const projectsWithStats = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        ...project,
        progress,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          pending: project.tasks.filter(task => task.status === 'PENDING').length,
          inProgress: project.tasks.filter(task => task.status === 'IN_PROGRESS').length,
          blocked: project.tasks.filter(task => task.status === 'BLOCKED').length,
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: projectsWithStats,
      meta: {
        total: projects.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, complexity = 0.5 } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        complexity: Number(complexity),
        status: 'ACTIVE',
        progress: 0,
        lastActivity: new Date(),
      },
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true,
            chatHistory: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        taskStats: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          blocked: 0,
        }
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}