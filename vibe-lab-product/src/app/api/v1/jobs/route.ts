import { NextRequest, NextResponse } from 'next/server';

interface Job {
  id: string;
  type: 'roadmap_generation' | 'code_analysis' | 'dual_agent_review' | 'task_execution';
  status: 'pending' | 'running' | 'completed' | 'failed';
  projectId: string;
  payload: any;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: number;
  actualDuration?: number;
}

// In-memory job queue (in production, use Redis or a proper job queue)
let jobs: Map<string, Job> = new Map();
let jobQueue: string[] = [];

// Simulate job processing
async function processJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  // Update job status to running
  const startTime = Date.now();
  job.status = 'running';
  job.updatedAt = new Date().toISOString();
  jobs.set(jobId, job);

  try {
    // Simulate different job types
    let result: any;
    
    switch (job.type) {
      case 'roadmap_generation':
        result = await simulateRoadmapGeneration(job.payload);
        break;
      case 'code_analysis':
        result = await simulateCodeAnalysis(job.payload);
        break;
      case 'dual_agent_review':
        result = await simulateDualAgentReview(job.payload);
        break;
      case 'task_execution':
        result = await simulateTaskExecution(job.payload);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    // Job completed successfully
    job.status = 'completed';
    job.result = result;
    job.actualDuration = Date.now() - startTime;
    
  } catch (error) {
    // Job failed
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
  }

  job.updatedAt = new Date().toISOString();
  jobs.set(jobId, job);
}

// Simulation functions for different job types
async function simulateRoadmapGeneration(payload: any): Promise<any> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    phases: [
      {
        id: 'phase-1',
        name: 'Foundation Setup',
        tasks: ['Setup project structure', 'Configure dependencies'],
        estimatedHours: 8
      },
      {
        id: 'phase-2',
        name: 'Core Implementation',
        tasks: ['Implement core features', 'Add business logic'],
        estimatedHours: 16
      }
    ],
    totalHours: 24,
    complexity: 0.7
  };
}

async function simulateCodeAnalysis(payload: any): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    qualityScore: 8.5,
    securityScore: 9.2,
    performanceScore: 7.8,
    issues: [
      { type: 'warning', message: 'Consider adding error boundaries' },
      { type: 'info', message: 'Optimize bundle size for production' }
    ],
    recommendations: [
      'Add unit tests for critical functions',
      'Implement proper error handling'
    ]
  };
}

async function simulateDualAgentReview(payload: any): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  return {
    developerSuggestions: [
      'Implement feature using React hooks',
      'Add TypeScript interfaces for better type safety'
    ],
    auditorFindings: [
      'Security: Input validation needed',
      'Performance: Consider memoization'
    ],
    consensus: 'Approved with minor recommendations',
    confidence: 0.92
  };
}

async function simulateTaskExecution(payload: any): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return {
    taskId: payload.taskId,
    completedSteps: [
      'Analyzed requirements',
      'Generated code structure',
      'Implemented core logic',
      'Added error handling',
      'Created tests'
    ],
    filesModified: ['src/components/NewComponent.tsx', 'src/types/index.ts'],
    testResults: { passed: 12, failed: 0, coverage: 85 }
  };
}

// Job queue processor (runs continuously)
async function processJobQueue() {
  while (jobQueue.length > 0) {
    const jobId = jobQueue.shift();
    if (jobId) {
      await processJob(jobId);
    }
  }
  
  // Check again in 1 second
  setTimeout(processJobQueue, 1000);
}

// Start the job processor
processJobQueue();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');
  const status = url.searchParams.get('status');
  const jobId = url.searchParams.get('jobId');
  
  if (jobId) {
    // Get specific job
    const job = jobs.get(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      job
    });
  }
  
  // Get filtered jobs
  let filteredJobs = Array.from(jobs.values());
  
  if (projectId) {
    filteredJobs = filteredJobs.filter(job => job.projectId === projectId);
  }
  
  if (status) {
    filteredJobs = filteredJobs.filter(job => job.status === status);
  }
  
  // Sort by creation date (newest first)
  filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return NextResponse.json({
    success: true,
    jobs: filteredJobs,
    total: filteredJobs.length,
    queueLength: jobQueue.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, projectId, payload, estimatedDuration } = body;
    
    if (!type || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, projectId' },
        { status: 400 }
      );
    }
    
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const job: Job = {
      id: jobId,
      type,
      status: 'pending',
      projectId,
      payload: payload || {},
      createdAt: now,
      updatedAt: now,
      estimatedDuration
    };
    
    jobs.set(jobId, job);
    jobQueue.push(jobId);
    
    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        type,
        status: 'pending',
        projectId,
        createdAt: now,
        queuePosition: jobQueue.length
      }
    });
    
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing required parameter: jobId' },
        { status: 400 }
      );
    }
    
    const job = jobs.get(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Can only cancel pending jobs
    if (job.status !== 'pending') {
      return NextResponse.json(
        { error: 'Job cannot be cancelled (not in pending status)' },
        { status: 400 }
      );
    }
    
    // Remove from queue and jobs
    const queueIndex = jobQueue.indexOf(jobId);
    if (queueIndex > -1) {
      jobQueue.splice(queueIndex, 1);
    }
    
    jobs.delete(jobId);
    
    return NextResponse.json({
      success: true,
      message: 'Job cancelled and removed'
    });
    
  } catch (error) {
    console.error('Job deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}