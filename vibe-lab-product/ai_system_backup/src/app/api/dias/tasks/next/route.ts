/**
 * DIAS Next Task API Route
 * Get the next task to work on
 */

import { NextRequest, NextResponse } from 'next/server';
import { DIASServiceIntegrator, createDefaultDIASConfig } from '@/lib/dias/services/dias-service-integrator';

// Initialize DIAS services
const diasConfig = createDefaultDIASConfig();
const diasServices = new DIASServiceIntegrator(diasConfig);

/**
 * GET /api/dias/tasks/next
 * Get the next task to work on based on dependencies and priorities
 */
export async function GET(_request: NextRequest) {
  try {
    const result = await diasServices.getNextTask();
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('DIAS Next Task API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get next task',
        executionTime: 0
      },
      { status: 500 }
    );
  }
}