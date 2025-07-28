import { NextResponse } from 'next/server';
import { runE2EPipelineTest } from '@/../lib/avca/pipeline-e2e-test';
import { tokenTracker } from '@/../lib/avca/token-tracking';

export async function POST() {
  try {
    console.log('Starting AVCA Pipeline E2E Test via API...');
    
    // Run the test
    const result = await runE2EPipelineTest();
    
    // Get token metrics
    const metrics = tokenTracker.exportMetrics();
    
    return NextResponse.json({
      success: result.overallSuccess,
      summary: {
        duration: `${(result.totalDuration / 1000).toFixed(1)}s`,
        cost: `$${result.totalCost.toFixed(3)}`,
        tokens: result.totalTokens,
        quality: result.qualityMetrics.coverage,
        manualIntervention: `${(result.manualInterventionRequired / 8 * 100).toFixed(0)}%`
      },
      successCriteria: result.successCriteriaMet,
      stageResults: result.stageResults.map(stage => ({
        stage: stage.stage,
        success: stage.success,
        duration: `${(stage.duration / 1000).toFixed(1)}s`,
        cost: `$${stage.cost.toFixed(3)}`,
        tokens: stage.tokensUsed
      })),
      tokenMetrics: {
        daily: metrics.daily,
        stageEfficiency: metrics.stageEfficiency
      }
    });
  } catch (error) {
    console.error('E2E test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Test execution failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AVCA Pipeline E2E Test Endpoint',
    method: 'POST',
    description: 'Execute end-to-end pipeline test for "Add search to dashboard" feature',
    successCriteria: {
      time: '< 30 minutes',
      cost: '< $0.50',
      quality: '> 90% test coverage',
      manual: '< 20% intervention'
    }
  });
} 