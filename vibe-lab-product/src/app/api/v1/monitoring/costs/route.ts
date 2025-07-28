import { NextResponse } from 'next/server';
import { tokenTracker } from '@/../lib/avca/token-tracking';

export async function GET() {
  try {
    // Get current metrics
    const dailyMetrics = tokenTracker.getDailyMetrics();
    const exportedMetrics = tokenTracker.exportMetrics();
    
    // Calculate success criteria
    const successMetrics = {
      costPerFeature: dailyMetrics.totalCost,
      timeToProduction: 0, // Would be tracked separately
      testCoverage: 0, // Would be tracked separately
      manualIntervention: 0 // Would be tracked separately
    };

    return NextResponse.json({
      daily: dailyMetrics,
      stageEfficiency: exportedMetrics.stageEfficiency,
      requests: exportedMetrics.requests.slice(0, 10), // Last 10 requests
      successMetrics
    });
  } catch (error) {
    console.error('Error fetching cost metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { requestId, stage, usage, duration, retries } = data;

    // Track the usage
    tokenTracker.track(requestId, stage, usage, duration, retries);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking token usage:', error);
    return NextResponse.json(
      { error: 'Failed to track token usage' },
      { status: 500 }
    );
  }
} 