import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/v1/projects/{projectId}/roadmap - Generate roadmap from blueprint
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await request.json();
    const { blueprint } = body;

    if (!blueprint) {
      return NextResponse.json(
        { success: false, error: 'Blueprint data is required' },
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

    // Save blueprint
    await prisma.blueprint.upsert({
      where: { 
        projectId_isActive: {
          projectId,
          isActive: true
        }
      },
      update: {
        content: blueprint,
        version: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        projectId,
        name: `${blueprint.projectName || 'Project'} Blueprint`,
        content: blueprint,
        version: 1,
        isActive: true
      }
    });

    // Generate roadmap based on blueprint
    const roadmap = await generateRoadmapFromBlueprint(blueprint);

    // Create tasks from roadmap
    const tasks = await createTasksFromRoadmap(projectId, roadmap);

    // Update project with roadmap data
    await prisma.project.update({
      where: { id: projectId },
      data: {
        complexity: blueprint.complexity,
        lastActivity: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        roadmap,
        tasksCreated: tasks.length,
        tasks: tasks.slice(0, 10) // Return first 10 tasks for preview
      }
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate roadmap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/v1/projects/{projectId}/roadmap - Get existing roadmap
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
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        blueprints: {
          where: { isActive: true },
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const roadmap = await generateRoadmapFromTasks(project.tasks);

    return NextResponse.json({
      success: true,
      data: {
        project,
        roadmap,
        blueprint: project.blueprints[0] || null
      }
    });

  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch roadmap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// AI-powered roadmap generation
async function generateRoadmapFromBlueprint(blueprint: any) {
  // Calculate complexity factors
  const complexityFactors = {
    frontend: blueprint.frontend?.length || 0,
    backend: blueprint.backend?.length || 0,
    database: blueprint.database?.length || 0,
    deployment: blueprint.deployment?.length || 0,
    testing: blueprint.testing?.length || 0,
    aiAssistance: blueprint.aiAssistance === 'full' ? 0.8 : blueprint.aiAssistance === 'advanced' ? 0.6 : 0.4,
    teamSize: blueprint.teamSize || 1,
    projectType: blueprint.projectType || 'web-app'
  };

  // Calculate timeline multipliers
  const timelineMap: Record<string, number> = {
    '1-2 weeks': 1,
    '2-4 weeks': 2,
    '4-6 weeks': 3,
    '6-8 weeks': 4,
    '2-3 months': 6,
    '3-6 months': 12,
    '6+ months': 24
  };

  const timelineMultiplier = timelineMap[blueprint.timeline] || 3;
  const complexity = blueprint.complexity || 0.5;

  // Generate phases based on project type and complexity
  const phases = generatePhases(blueprint, complexityFactors, timelineMultiplier);

  return {
    projectName: blueprint.projectName,
    complexity,
    estimatedWeeks: timelineMultiplier,
    phases,
    techStack: {
      frontend: blueprint.frontend || [],
      backend: blueprint.backend || [],
      database: blueprint.database || [],
      deployment: blueprint.deployment || [],
      testing: blueprint.testing || []
    },
    aiConfiguration: {
      assistance: blueprint.aiAssistance,
      codeGeneration: blueprint.codeGeneration,
      reviewLevel: blueprint.reviewLevel
    },
    generatedAt: new Date().toISOString()
  };
}

function generatePhases(blueprint: any, factors: any, timelineMultiplier: number) {
  const basePhases = [
    {
      name: 'Foundation & Setup',
      duration: Math.max(1, Math.round(timelineMultiplier * 0.2)),
      tasks: [
        'Project scaffolding and initial setup',
        'Development environment configuration',
        'Version control and CI/CD setup',
        'Database schema design and setup',
        'Authentication system implementation'
      ]
    },
    {
      name: 'Core Development',
      duration: Math.max(2, Math.round(timelineMultiplier * 0.4)),
      tasks: [
        'Frontend component development',
        'Backend API implementation',
        'Database integration',
        'Core business logic',
        'User interface development'
      ]
    },
    {
      name: 'Integration & Features',
      duration: Math.max(1, Math.round(timelineMultiplier * 0.25)),
      tasks: [
        'API integration and testing',
        'Feature completion and refinement',
        'Third-party service integration',
        'Performance optimization',
        'Security implementation'
      ]
    },
    {
      name: 'Testing & Deployment',
      duration: Math.max(1, Math.round(timelineMultiplier * 0.15)),
      tasks: [
        'Comprehensive testing suite',
        'Bug fixes and quality assurance',
        'Production deployment setup',
        'Performance monitoring',
        'Documentation and handover'
      ]
    }
  ];

  // Customize phases based on project type
  if (blueprint.projectType === 'mobile-app') {
    basePhases[1].tasks.push('Mobile platform optimization');
    basePhases[2].tasks.push('App store preparation');
  }

  if (blueprint.projectType === 'api') {
    basePhases[1].tasks = basePhases[1].tasks.filter(task => !task.includes('Frontend'));
    basePhases[1].tasks.push('API documentation');
    basePhases[2].tasks.push('Rate limiting and throttling');
  }

  // Add AI-specific tasks based on configuration
  if (blueprint.aiAssistance === 'full') {
    basePhases[1].tasks.push('AI-powered code generation setup');
    basePhases[2].tasks.push('Automated code review integration');
  }

  return basePhases.map((phase, index) => ({
    ...phase,
    id: `phase-${index + 1}`,
    complexity: Math.min(1, (factors.frontend + factors.backend) / 10 + blueprint.complexity),
    dependencies: index > 0 ? [`phase-${index}`] : []
  }));
}

async function createTasksFromRoadmap(projectId: string, roadmap: any) {
  const tasks = [];
  let order = 1;

  for (const [phaseIndex, phase] of roadmap.phases.entries()) {
    // Create phase header task
    const phaseTask = await prisma.task.create({
      data: {
        projectId,
        name: `Phase ${phaseIndex + 1}: ${phase.name}`,
        description: `Duration: ${phase.duration} week${phase.duration > 1 ? 's' : ''}`,
        status: 'PENDING',
        priority: 'HIGH',
        complexity: Math.round(phase.complexity * 5),
        estimatedHours: phase.duration * 40, // 40 hours per week
        aiGenerated: true,
        assignedAgent: 'developer'
      }
    });

    tasks.push(phaseTask);

    // Create individual task items
    for (const [taskIndex, taskName] of phase.tasks.entries()) {
      const task = await prisma.task.create({
        data: {
          projectId,
          name: taskName,
          description: `Part of ${phase.name} phase`,
          status: 'PENDING',
          priority: phaseIndex === 0 ? 'HIGH' : phaseIndex === 1 ? 'MEDIUM' : 'LOW',
          complexity: Math.min(5, Math.max(1, Math.round(phase.complexity * 3))),
          estimatedHours: Math.round((phase.duration * 40) / phase.tasks.length),
          parentTaskId: phaseTask.id,
          aiGenerated: true,
          assignedAgent: taskName.includes('test') ? 'auditor' : 'developer'
        }
      });

      tasks.push(task);
      order++;
    }
  }

  return tasks;
}

async function generateRoadmapFromTasks(tasks: any[]) {
  // Group tasks by parent (phases)
  const phaseTasks = tasks.filter(task => !task.parentTaskId);
  const childTasks = tasks.filter(task => task.parentTaskId);

  const phases = phaseTasks.map(phaseTask => {
    const children = childTasks.filter(task => task.parentTaskId === phaseTask.id);
    
    const completedChildren = children.filter(task => task.status === 'COMPLETED').length;
    const totalChildren = children.length;
    const completion = totalChildren > 0 ? (completedChildren / totalChildren) * 100 : 0;

    return {
      id: phaseTask.id,
      name: phaseTask.name,
      description: phaseTask.description,
      status: phaseTask.status,
      completion: Math.round(completion),
      estimatedHours: phaseTask.estimatedHours,
      tasks: children.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        complexity: task.complexity,
        estimatedHours: task.estimatedHours,
        assignedAgent: task.assignedAgent
      }))
    };
  });

  return {
    phases,
    overallCompletion: Math.round(
      phases.reduce((sum, phase) => sum + phase.completion, 0) / phases.length
    ),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'COMPLETED').length
  };
}