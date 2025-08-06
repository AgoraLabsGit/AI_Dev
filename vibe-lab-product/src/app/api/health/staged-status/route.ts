import { NextResponse } from 'next/server';
import { getVibeLabServices } from '@/lib/core/vibe-lab-services';

export async function GET() {
  try {
    // Get current services instance (don't initialize if not ready)
    const vibeLabServices = getVibeLabServices();
    const systemStatus = vibeLabServices.getSystemStatus();
    
    // Check route readiness
    
    // Calculate overall health
    const totalServices = systemStatus.services.length;
    const readyServices = systemStatus.services.filter((s: SystemService) => s.status === 'ready').length;
    const initializingServices = systemStatus.services.filter((s: SystemService) => s.status === 'initializing').length;
    const failedServices = systemStatus.services.filter((s: SystemService) => s.status === 'failed').length;
    
    const healthScore = totalServices > 0 ? (readyServices / totalServices) * 100 : 0;
    
    const response = {
      timestamp: new Date().toISOString(),
      overall: {
        status: systemStatus.basicReady ? 'operational' : 'initializing',
        healthScore: Math.round(healthScore),
        basicFunctionality: systemStatus.basicReady,
        enhancedFunctionality: systemStatus.enhancedReady
      },
      services: {
        total: totalServices,
        ready: readyServices,
        initializing: initializingServices,
        failed: failedServices,
        details: systemStatus.services.map((service: SystemService) => ({
          name: service.name,
          status: service.status,
          lastCheck: service.lastCheck,
          initTime: service.initTime,
          error: service.error
        }))
      },
      routes: {
        'basic-chat': true, // Assume basic routes are available
        'enhanced-chat': systemStatus.enhancedReady,
        'blueprint': systemStatus.enhancedReady
      },
      capabilities: {
        immediateResponse: true, // Always available due to fallbacks
        aiProcessing: systemStatus.basicReady,
        intelligentRouting: systemStatus.enhancedReady,
        patternRecognition: systemStatus.services.some((s: SystemService) => s.name === 'pattern-engine' && s.status === 'ready'),
        learningSystem: systemStatus.services.some((s: SystemService) => s.name === 'learning-system' && s.status === 'ready'),
        blueprintGeneration: systemStatus.services.some((s: SystemService) => s.name === 'blueprint-service' && s.status === 'ready')
      },
      recommendations: generateRecommendations(systemStatus, healthScore)
    };
    
    // Set appropriate HTTP status
    const httpStatus = systemStatus.basicReady ? 200 : 202; // 202 = Accepted (still processing)
    
    return NextResponse.json(response, { status: httpStatus });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overall: {
          status: 'error',
          healthScore: 0,
          basicFunctionality: false,
          enhancedFunctionality: false
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      },
      { status: 503 } // Service Unavailable
    );
  }
}

interface SystemService {
  name: string;
  status: string;
  lastCheck?: Date;
  initTime?: number;
  error?: string;
}

interface SystemStatus {
  basicReady: boolean;
  enhancedReady: boolean;
  services: SystemService[];
}

function generateRecommendations(systemStatus: SystemStatus, healthScore: number): string[] {
  const recommendations: string[] = [];
  
  if (healthScore < 50) {
    recommendations.push('System is still initializing - expect basic functionality only');
  }
  
  if (healthScore >= 50 && healthScore < 100) {
    recommendations.push('Partial functionality available - some advanced features may be limited');
  }
  
  if (healthScore === 100) {
    recommendations.push('All systems operational - full functionality available');
  }
  
  if (!systemStatus.basicReady) {
    recommendations.push('Core AI services are starting up - responses may use fallback mode');
  }
  
  if (!systemStatus.enhancedReady) {
    recommendations.push('Enhanced intelligence features are initializing in the background');
  }
  
  const failedServices = systemStatus.services.filter((s: SystemService) => s.status === 'failed');
  if (failedServices.length > 0) {
    recommendations.push(`${failedServices.length} service(s) failed to initialize - some features may be unavailable`);
  }
  
  const initializingServices = systemStatus.services.filter((s: SystemService) => s.status === 'initializing');
  if (initializingServices.length > 0) {
    recommendations.push(`${initializingServices.length} service(s) are still starting up - check back in a moment`);
  }
  
  return recommendations;
}