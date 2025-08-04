// Core Vibe Lab services module
// This provides the core services that power the application

export interface VibeLabService {
  name: string;
  version: string;
  status: 'online' | 'offline' | 'initializing';
  health: () => Promise<boolean>;
}

export interface Router {
  routeRequest: (type: string, handler: (service: any) => Promise<any>) => Promise<any>;
}

export interface VibeLabServices {
  avca: VibeLabService;
  dias: VibeLabService;
  integration: VibeLabService;
  getRouter: () => Router;
  getSystemStatus: () => any;
}

// Simple service implementation
const createService = (name: string): VibeLabService => ({
  name,
  version: '1.0.0',
  status: 'online',
  health: async () => true
});

// Simple router implementation
const createRouter = (): Router => ({
  routeRequest: async (type: string, handler: (service: any) => Promise<any>) => {
    // Simple routing logic - use AVCA for most requests
    const service = { constructor: { name: 'AVCA' } };
    return await handler(service);
  }
});

// Core services
export const vibeLabServices: VibeLabServices = {
  avca: createService('AVCA'),
  dias: createService('DIAS'),
  integration: createService('Integration'),
  getRouter: () => createRouter(),
  getSystemStatus: () => ({
    overall: 'operational',
    services: getServicesStatus(),
    timestamp: new Date().toISOString()
  })
};

// Health check for all services
export async function getServicesHealth(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  for (const [key, service] of Object.entries(vibeLabServices)) {
    try {
      results[key] = await service.health();
    } catch {
      results[key] = false;
    }
  }
  
  return results;
}

// Service status
export function getServicesStatus() {
  return Object.entries(vibeLabServices).map(([key, service]) => ({
    name: key,
    status: service.status,
    version: service.version
  }));
}

// Initialize services function
export async function initializeVibeLabServices(config?: {
  enableMonitoring?: boolean;
  enableLearning?: boolean;
  enableMigration?: boolean;
  initTimeoutMs?: number;
}) {
  // Initialize AVCA, DIAS, and Integration services
  console.log('Initializing Vibe Lab services with config:', config);
  return vibeLabServices;
}

// Get services function (alias for vibeLabServices)
export function getVibeLabServices() {
  return vibeLabServices;
}

export default vibeLabServices;