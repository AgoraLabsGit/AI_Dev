import { NextResponse } from 'next/server'
import { logicMonitor } from '@/lib/monitoring/logic-monitor'

export async function GET() {
  try {
    // Get current monitoring data from server-side instance
    const monitoringData = {
      stats: logicMonitor.getStats(),
      events: logicMonitor.getRecentEvents(50), // Last 50 events
      flows: logicMonitor.getActiveFlows(),
      performance: logicMonitor.getPerformanceMetrics(),
      timestamp: Date.now()
    }

    return NextResponse.json(monitoringData)
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'clear':
        logicMonitor.clearEvents()
        return NextResponse.json({ success: true, message: 'Events cleared' })
      
      case 'reset':
        logicMonitor.reset()
        return NextResponse.json({ success: true, message: 'Monitor reset' })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error handling monitoring action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}