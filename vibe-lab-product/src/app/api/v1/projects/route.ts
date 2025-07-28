import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// GET /api/v1/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      // Return mock data when database is not available
      const mockProjects = [
        {
          id: 'demo-project-1',
          name: 'Vibe Lab Demo Project',
          description: 'AI-powered development environment demonstration project',
          status: 'ACTIVE',
          lastActivity: new Date().toISOString(),
          progress: 75,
          taskStats: {
            total: 12,
            completed: 9,
            pending: 2,
            inProgress: 1,
            blocked: 0,
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          updatedAt: new Date().toISOString(),
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockProjects,
        meta: {
          total: mockProjects.length,
          timestamp: new Date().toISOString(),
          note: 'Demo data - Database not connected. Start Prisma database to use real data.'
        }
      });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where = status ? { status: status as any } : {};
    
    // Try to fetch projects, but handle case where tables don't exist
    let projects;
    try {
      projects = await prisma.project.findMany({
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
    } catch (dbError) {
      // If tables don't exist or other DB error, return empty data with explanation
      console.error('Database query failed:', dbError);
      
      // Return empty data instead of error - this handles case where DB is not set up yet
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          timestamp: new Date().toISOString(),
          note: 'Database not initialized. Create a project to set up the database.'
        }
      });
    }

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

    // Check database connection
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      // Return mock created project when database is not available
      const mockProject = {
        id: `demo-project-${Date.now()}`,
        name,
        description,
        complexity: Number(complexity),
        status: 'ACTIVE',
        progress: 0,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskStats: {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          blocked: 0,
        }
      };

      return NextResponse.json({
        success: true,
        data: mockProject,
        meta: {
          note: 'Demo mode - Database not connected. Project not persisted.'
        }
      }, { status: 201 });
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