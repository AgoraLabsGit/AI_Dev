import { NextRequest, NextResponse } from 'next/server'
import { TaskMaster } from 'task-master-ai'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const body = await request.json()
    
    // Initialize TaskMaster with project context
    const taskMaster = new TaskMaster({
      projectId,
      complexity: body.complexity || 'moderate',
      framework: body.framework || 'next.js',
      mcp_servers: ['Context7', 'Sequential', 'Magic', 'Playwright']
    })

    // Generate comprehensive task analysis
    const analysis = await taskMaster.analyze({
      roadmap: body.roadmap,
      requirements: body.requirements,
      constraints: body.constraints,
      team_size: body.team_size || 4
    })

    // Store results in database (placeholder for now)
    // await storeTaskAnalysis(projectId, analysis)

    return NextResponse.json({
      success: true,
      data: {
        task_matrix: analysis.tasks,
        critical_path: analysis.critical_path,
        dependencies: analysis.dependencies,
        resource_allocation: analysis.resource_allocation,
        wave_strategy: analysis.wave_strategy,
        confidence_score: analysis.confidence_score,
        estimated_timeline: analysis.timeline,
        risk_assessment: analysis.risks
      }
    })

  } catch (error) {
    console.error('TaskMaster analysis failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Task analysis generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    
    // Retrieve stored task analysis (placeholder)
    // const analysis = await getTaskAnalysis(projectId)
    
    // For now, return sample data structure
    return NextResponse.json({
      success: true,
      data: {
        project_id: projectId,
        last_updated: new Date().toISOString(),
        task_count: 25,
        completion_percentage: 15,
        critical_path_length: 18,
        estimated_weeks: 7
      }
    })

  } catch (error) {
    console.error('TaskMaster retrieval failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Task analysis retrieval failed' 
      },
      { status: 500 }
    )
  }
}