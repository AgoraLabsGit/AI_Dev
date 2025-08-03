import { ServiceManager, ServiceStatus } from './service-manager';

export interface RouteConfig {
  primaryService: string;
  fallbackServices?: string[];
  requiresService?: string[];
  fallbackResponse?: any;
}

export interface RoutingResult {
  service: string | null;
  isFallback: boolean;
  response?: any;
  availableServices: string[];
  requestedServices: string[];
}

export class HealthAwareRouter {
  private serviceManager: ServiceManager;
  private routes = new Map<string, RouteConfig>();

  constructor(serviceManager: ServiceManager) {
    this.serviceManager = serviceManager;
  }

  /**
   * Register a route configuration
   */
  registerRoute(routeName: string, config: RouteConfig): void {
    this.routes.set(routeName, config);
    console.log(`🛣️ HealthAwareRouter: Registered route ${routeName}`);
  }

  /**
   * Route a request to the best available service
   */
  async routeRequest(routeName: string, requestHandler: (service: any) => Promise<any>): Promise<any> {
    const config = this.routes.get(routeName);
    if (!config) {
      throw new Error(`Route ${routeName} not found`);
    }

    const routingResult = this.determineRouting(config);
    
    console.log(`🛣️ HealthAwareRouter: Routing ${routeName} to ${routingResult.service || 'fallback'}`);

    // If we have a service, try to use it
    if (routingResult.service) {
      try {
        const service = this.serviceManager.getService(routingResult.service);
        if (service) {
          const result = await requestHandler(service);
          
          // Enhance result with routing metadata
          if (typeof result === 'object' && result !== null) {
            result._routing = {
              service: routingResult.service,
              isFallback: routingResult.isFallback,
              availableServices: routingResult.availableServices
            };
          }
          
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ HealthAwareRouter: Service ${routingResult.service} failed, trying fallback`);
        
        // Try fallback services
        for (const fallbackService of config.fallbackServices || []) {
          if (this.serviceManager.isServiceReady(fallbackService)) {
            try {
              const service = this.serviceManager.getService(fallbackService);
              if (service) {
                const result = await requestHandler(service);
                
                if (typeof result === 'object' && result !== null) {
                  result._routing = {
                    service: fallbackService,
                    isFallback: true,
                    originalService: routingResult.service,
                    availableServices: routingResult.availableServices
                  };
                }
                
                return result;
              }
            } catch (fallbackError) {
              console.warn(`⚠️ HealthAwareRouter: Fallback service ${fallbackService} also failed`);
            }
          }
        }
      }
    }

    // Return configured fallback response
    if (config.fallbackResponse) {
      console.log(`🛣️ HealthAwareRouter: Using configured fallback for ${routeName}`);
      return {
        ...config.fallbackResponse,
        _routing: {
          service: null,
          isFallback: true,
          reason: 'no_services_available',
          availableServices: routingResult.availableServices,
          requestedServices: routingResult.requestedServices
        }
      };
    }

    // Default fallback response
    return this.getDefaultFallbackResponse(routeName, routingResult);
  }

  /**
   * Determine which service to route to
   */
  private determineRouting(config: RouteConfig): RoutingResult {
    const availableServices = this.serviceManager.getReadyServices();
    const requestedServices = [
      config.primaryService,
      ...(config.fallbackServices || []),
      ...(config.requiresService || [])
    ];

    // Check if primary service is available
    if (this.serviceManager.isServiceReady(config.primaryService)) {
      return {
        service: config.primaryService,
        isFallback: false,
        availableServices,
        requestedServices
      };
    }

    // Check required services
    if (config.requiresService) {
      const missingRequired = config.requiresService.filter(
        service => !this.serviceManager.isServiceReady(service)
      );
      
      if (missingRequired.length > 0) {
        console.warn(`⚠️ HealthAwareRouter: Missing required services: ${missingRequired.join(', ')}`);
        return {
          service: null,
          isFallback: true,
          availableServices,
          requestedServices
        };
      }
    }

    // Try fallback services
    for (const fallbackService of config.fallbackServices || []) {
      if (this.serviceManager.isServiceReady(fallbackService)) {
        return {
          service: fallbackService,
          isFallback: true,
          availableServices,
          requestedServices
        };
      }
    }

    // No services available
    return {
      service: null,
      isFallback: true,
      availableServices,
      requestedServices
    };
  }

  /**
   * Get default fallback response when no configured fallback exists
   */
  private getDefaultFallbackResponse(routeName: string, routingResult: RoutingResult): any {
    const serviceStatuses = this.serviceManager.getServiceStatuses();
    const initializingServices = serviceStatuses.filter(s => s.status === 'initializing');
    
    let message = "I'm currently starting up my systems. ";
    
    if (initializingServices.length > 0) {
      message += `${initializingServices.map(s => s.name).join(', ')} ${initializingServices.length === 1 ? 'is' : 'are'} still initializing. `;
    }
    
    message += "Please try again in a moment for full functionality.";

    return {
      content: message,
      fallback: true,
      route: routeName,
      metadata: {
        availableServices: routingResult.availableServices,
        requestedServices: routingResult.requestedServices,
        serviceStatuses: serviceStatuses.map(s => ({
          name: s.name,
          status: s.status,
          initTime: s.initTime
        }))
      },
      _routing: {
        service: null,
        isFallback: true,
        reason: 'default_fallback',
        availableServices: routingResult.availableServices,
        requestedServices: routingResult.requestedServices
      }
    };
  }

  /**
   * Get routing status for a specific route
   */
  getRouteStatus(routeName: string): any {
    const config = this.routes.get(routeName);
    if (!config) {
      return { error: `Route ${routeName} not found` };
    }

    const routingResult = this.determineRouting(config);
    const serviceStatuses = this.serviceManager.getServiceStatuses();
    
    return {
      route: routeName,
      config,
      routing: routingResult,
      serviceStatuses: serviceStatuses.filter(s => 
        routingResult.requestedServices.includes(s.name)
      )
    };
  }

  /**
   * Get status of all routes
   */
  getAllRouteStatuses(): any {
    const statuses: any = {};
    
    for (const [routeName] of this.routes) {
      statuses[routeName] = this.getRouteStatus(routeName);
    }
    
    return {
      routes: statuses,
      globalStatus: {
        totalServices: this.serviceManager.getServiceStatuses().length,
        readyServices: this.serviceManager.getReadyServices().length,
        serviceStatuses: this.serviceManager.getServiceStatuses()
      }
    };
  }

  /**
   * Check if route can handle request without fallback
   */
  canRouteWithoutFallback(routeName: string): boolean {
    const config = this.routes.get(routeName);
    if (!config) return false;

    const routingResult = this.determineRouting(config);
    return routingResult.service !== null && !routingResult.isFallback;
  }

  /**
   * Wait for route to become available
   */
  async waitForRoute(routeName: string, timeoutMs: number = 10000): Promise<boolean> {
    const config = this.routes.get(routeName);
    if (!config) return false;

    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (this.canRouteWithoutFallback(routeName)) {
        return true;
      }
      
      // Try to force initialize primary service
      if (!this.serviceManager.isServiceReady(config.primaryService)) {
        await this.serviceManager.forceInitialize(config.primaryService);
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return false;
  }
}