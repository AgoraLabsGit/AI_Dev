import { NextResponse } from 'next/server';
import { logicMonitor } from '@/lib/monitoring/logic-monitor';

export async function GET() {
  try {
    // Get recent events and stats from the logic monitor
    const activeFlows = logicMonitor.getActiveFlows();
    const moduleStats = logicMonitor.getModuleStats();
    
    // Since events are emitted in real-time, we'll return current state
    const monitoring = {
      activeFlows: activeFlows.length,
      totalModules: moduleStats.length,
      stats: moduleStats,
      flows: activeFlows.map(flow => ({
        id: flow.id.slice(-8),
        startTime: flow.startTime,
        modules: flow.modules.length,
        status: flow.status,
        recentModule: flow.modules[flow.modules.length - 1]?.module || 'none'
      })),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(monitoring);
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}