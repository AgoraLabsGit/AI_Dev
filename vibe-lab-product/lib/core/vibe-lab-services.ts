import { EventBus } from '@/lib/avca/services/event-bus';
import { AIClientService } from '@/lib/avca/services/ai-client';
import { BlueprintService } from '@/lib/avca/services/blueprint-service';
import { MigrationService } from '@/lib/migration/migration-service';
import { PatternRecognitionEngine } from '@/lib/dias/pattern-recognition';
import { LearningSystem } from '@/lib/dias/learning-system';
import { EventHandlingSystem } from '@/lib/dias/events/event-handlers';
import { EventGenerator } from '@/lib/dias/events/event-generator';
import { DIAS } from '@/lib/dias';
import { ServiceManager } from './service-manager';
import { HealthAwareRouter } from './health-aware-router';

// Singleton instance
let vibeLabServices: VibeLabServices | null = null;

export interface VibeLabServicesConfig {
  enableMonitoring?: boolean;
  enableLearning?: boolean;
  enableMigration?: boolean;
  initTimeoutMs?: number;
}

export class VibeLabServices {
  private serviceManager: ServiceManager;
  private router: HealthAwareRouter;
  private eventBus: EventBus;
  private config: Required<VibeLabServicesConfig>;
  private initialized = false;

  constructor(config: VibeLabServicesConfig = {}) {
    this.config = {
      enableMonitoring: config.enableMonitoring ?? true,
      enableLearning: config.enableLearning ?? true,
      enableMigration: config.enableMigration ?? false, // Phase 2
      initTimeoutMs: config.initTimeoutMs ?? 5000
    };

    // Initialize core infrastructure
    this.eventBus = new EventBus();
    this.serviceManager = new ServiceManager(this.eventBus, {
      initTimeoutMs: this.config.initTimeoutMs,
      healthCheckIntervalMs: 30000,
      circuitBreakerThreshold: 3,
      backgroundRetryIntervalMs: 60000
    });
    this.router = new HealthAwareRouter(this.serviceManager);
  }

  /**
   * Initialize all services with staged loading
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🚀 VibeLabServices: Starting staged initialization...');

    // Register core services first (immediate)
    this.registerCoreServices();
    
    // Register AVCA services (fast initialization)
    this.registerAVCAServices();
    
    // Register DIAS services (slower initialization)
    this.registerDIASServices();
    
    // Register optional services (background)
    if (this.config.enableMigration) {
      this.registerMigrationServices();
    }

    // Configure routes
    this.configureRoutes();

    this.initialized = true;
    console.log('✅ VibeLabServices: Staged initialization started');
  }

  /**
   * Register core services that must be available immediately
   */
  private registerCoreServices(): void {
    // EventBus is already available
    console.log('📋 VibeLabServices: Core services ready (EventBus)');
  }

  /**
   * Register AVCA services (AI, Blueprint)
   */
  private registerAVCAServices(): void {
    // AI Client Service (highest priority)
    this.serviceManager.registerService('ai-client', () => {
      return new AIClientService(this.eventBus);
    });

    // Blueprint Service
    this.serviceManager.registerService('blueprint-service', () => {
      return new BlueprintService({ eventBus: this.eventBus });
    });

    console.log('📋 VibeLabServices: AVCA services registered');
  }

  /**
   * Register DIAS services (intelligence and learning)
   */
  private registerDIASServices(): void {
    // Pattern Recognition
    this.serviceManager.registerService('pattern-engine', () => {
      return new PatternRecognitionEngine({ eventBus: this.eventBus });
    });

    // Learning System
    if (this.config.enableLearning) {
      this.serviceManager.registerService('learning-system', () => {
        return new LearningSystem({ eventBus: this.eventBus });
      });
    }

    // Event Handling
    this.serviceManager.registerService('event-handler', () => {
      return new EventHandlingSystem({ eventBus: this.eventBus });
    });

    // Event Generator
    this.serviceManager.registerService('event-generator', () => {
      return new EventGenerator({ eventBus: this.eventBus });
    });

    // DIAS Integration
    this.serviceManager.registerService('dias', () => {
      // Create a minimal service registry for DIAS
      const mockRegistry = {
        register: async () => {},
        get: () => null,
        getAll: () => []
      };
      return new DIAS(this.eventBus, mockRegistry as any);
    });

    console.log('📋 VibeLabServices: DIAS services registered');
  }

  /**
   * Register migration services (Phase 2)
   */
  private registerMigrationServices(): void {
    this.serviceManager.registerService('migration-service', () => {
      return new MigrationService({ eventBus: this.eventBus });
    });

    console.log('📋 VibeLabServices: Migration services registered');
  }

  /**
   * Configure routing for different request types
   */
  private configureRoutes(): void {
    // Basic chat route - requires AI client, can fallback gracefully
    this.router.registerRoute('basic-chat', {
      primaryService: 'ai-client',
      fallbackResponse: {
        content: "I'm starting up my AI systems. Give me a moment and try again for a more intelligent response.",
        suggestions: [],
        quickActions: [],
        extractedInfo: {},
        projectOverview: null,
        buildSpecifications: null
      }
    });

    // Enhanced chat route - requires AI + DIAS
    this.router.registerRoute('enhanced-chat', {
      primaryService: 'dias',
      fallbackServices: ['ai-client'],
      requiresService: ['ai-client'],
      fallbackResponse: {
        content: "I'm initializing my advanced intelligence systems. You'll get a basic response now, with enhanced capabilities coming online shortly.",
        suggestions: [],
        quickActions: [],
        extractedInfo: {},
        projectOverview: null,
        buildSpecifications: null
      }
    });

    // Blueprint route - requires blueprint service
    this.router.registerRoute('blueprint', {
      primaryService: 'blueprint-service',
      requiresService: ['ai-client'],
      fallbackResponse: {
        content: "Blueprint services are initializing. Please try again in a moment.",
        error: "Blueprint service not available"
      }
    });

    // Migration route - requires migration service
    if (this.config.enableMigration) {
      this.router.registerRoute('migration', {
        primaryService: 'migration-service',
        requiresService: ['ai-client'],
        fallbackResponse: {
          content: "Migration services are not available yet.",
          error: "Migration service not available"
        }
      });
    }

    console.log('🛣️ VibeLabServices: Routes configured');
  }

  /**
   * Get the health-aware router
   */
  getRouter(): HealthAwareRouter {
    return this.router;
  }

  /**
   * Get the service manager
   */
  getServiceManager(): ServiceManager {
    return this.serviceManager;
  }

  /**
   * Get the event bus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get a specific service
   */
  getService<T>(name: string): T | null {
    return this.serviceManager.getService<T>(name);
  }

  /**
   * Check if core services are ready for basic functionality
   */
  isBasicFunctionalityReady(): boolean {
    return this.serviceManager.isServiceReady('ai-client');
  }

  /**
   * Check if enhanced functionality is ready
   */
  isEnhancedFunctionalityReady(): boolean {
    return this.serviceManager.isServiceReady('ai-client') && 
           this.serviceManager.isServiceReady('dias');
  }

  /**
   * Get system status
   */
  getSystemStatus(): any {
    return {
      initialized: this.initialized,
      basicReady: this.isBasicFunctionalityReady(),
      enhancedReady: this.isEnhancedFunctionalityReady(),
      services: this.serviceManager.getServiceStatuses(),
      routes: this.router.getAllRouteStatuses(),
      config: {
        enableMonitoring: this.config.enableMonitoring,
        enableLearning: this.config.enableLearning,
        enableMigration: this.config.enableMigration,
        initTimeoutMs: this.config.initTimeoutMs
      }
    };
  }

  /**
   * Force initialize critical services
   */
  async forceCriticalServices(): Promise<void> {
    console.log('⚡ VibeLabServices: Force initializing critical services...');
    
    await Promise.allSettled([
      this.serviceManager.forceInitialize('ai-client'),
      this.serviceManager.forceInitialize('blueprint-service')
    ]);
  }

  /**
   * Cleanup all services
   */
  destroy(): void {
    this.serviceManager.destroy();
    this.initialized = false;
    console.log('🛑 VibeLabServices: Destroyed');
  }
}

/**
 * Get the singleton instance
 */
export function getVibeLabServices(config?: VibeLabServicesConfig): VibeLabServices {
  if (!vibeLabServices) {
    vibeLabServices = new VibeLabServices(config);
  }
  return vibeLabServices;
}

/**
 * Initialize the singleton if not already done
 */
export async function initializeVibeLabServices(config?: VibeLabServicesConfig): Promise<VibeLabServices> {
  const services = getVibeLabServices(config);
  await services.initialize();
  return services;
}