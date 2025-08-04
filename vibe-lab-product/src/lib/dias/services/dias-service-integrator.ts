/**
 * DIAS Service Integrator
 * Main orchestrator for all DIAS services
 */

import { BaseService, ServiceConfig } from '@/lib/avca/services/base-service';
import { AIOrchestratorService } from './ai-orchestrator/ai-orchestrator-service';
import { TaskMasterService } from './task-master/task-master-service';
import { ContextManagerService } from './context-manager/context-manager-service';
import { MCPServerFactory, BaseMCPServer } from './mcp-servers/mcp-interfaces';
import {
  DIASServiceConfig,
  AIRequest,
  AIResponse,
  ServiceResponse,
  Task,
  ComplexityReport,
  MCPServerType,
  DIASEvent,
  EventHandler
} from './types';

export class DIASServiceIntegrator extends BaseService {
  private aiOrchestrator!: AIOrchestratorService;
  private taskMaster!: TaskMasterService;
  private contextManager!: ContextManagerService;
  private mcpServers!: Map<MCPServerType, BaseMCPServer>;
  private diasConfig: DIASServiceConfig;

  constructor(config: DIASServiceConfig) {
    const serviceConfig: ServiceConfig = {
      name: 'DIASServiceIntegrator',
      version: '1.0.0',
      dependencies: ['AIOrchestratorService', 'TaskMasterService', 'ContextManagerService'],
    };
    super(serviceConfig);
    this.diasConfig = config;
  }

  protected async initialize(): Promise<void> {
    this.log('info', 'Initializing DIAS services...');

    const baseServiceConfig: ServiceConfig = { name: 'placeholder', version: '1.0.0' };

    this.taskMaster = new TaskMasterService(baseServiceConfig);
    this.contextManager = new ContextManagerService(baseServiceConfig);
    this.aiOrchestrator = new AIOrchestratorService(baseServiceConfig, this.taskMaster);

    this.mcpServers = new Map();
    if (this.diasConfig.mcpServers) {
        Object.keys(this.diasConfig.mcpServers).forEach(key => {
            const serverType = key as MCPServerType;
            const server = MCPServerFactory.createServer(serverType, baseServiceConfig);
            if(server) {
                this.mcpServers.set(serverType, server);
            }
        });
    }

    await this.taskMaster.start();
    await this.contextManager.start();
    await this.aiOrchestrator.start();
    for(const server of this.mcpServers.values()){
        await server.start();
    }

    this.log('info', 'DIAS services initialized successfully');
  }
  
  public async process(request: AIRequest): Promise<AIResponse> {
    this.log('info', `DIAS Integrator processing request: ${request.command}`);
    const result = await this.aiOrchestrator.process(request);
    return result;
  }
  
  protected async cleanup(): Promise<void> {
      this.log('info', 'Cleaning up DIAS Integrator...');
      await this.shutdown();
  }

  protected async healthCheck(): Promise<boolean> {
      const health = await this.systemHealthCheck();
      return health.success;
  }

  async shutdown(): Promise<void> {
    this.log('info', 'Shutting down DIAS services...');
    
    await this.contextManager.stop();
    await this.taskMaster.stop();
    await this.aiOrchestrator.stop();

    for(const server of this.mcpServers.values()) {
        await server.stop();
    }
    
    this.log('info', 'DIAS services shutdown complete');
  }
  
  async systemHealthCheck(): Promise<ServiceResponse<{
    aiOrchestrator: boolean;
    taskMaster: boolean;
    contextManager: boolean;
    mcpServers: Record<MCPServerType, boolean>;
  }>> {
    try {
      const [
        aiHealth,
        taskHealth,
        contextHealth,
        mcpHealth
      ] = await Promise.all([
        this.aiOrchestrator.healthCheck(),
        this.taskMaster.healthCheck(),
        this.contextManager.healthCheck(),
        this.healthCheckMCPServers()
      ]);

      const mcpResults: Record<MCPServerType, boolean> = {};
        if (mcpHealth.data) {
            for (const key in mcpHealth.data) {
                mcpResults[key as MCPServerType] = mcpHealth.data[key];
            }
        }

      return {
        success: true,
        data: {
          aiOrchestrator: aiHealth,
          taskMaster: taskHealth,
          contextManager: contextHealth,
          mcpServers: mcpResults
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async healthCheckMCPServers(): Promise<ServiceResponse<Record<MCPServerType, boolean>>> {
    const results: Record<string, boolean> = {};
    
    for (const [serverType, server] of this.mcpServers) {
      try {
        const health = await server.healthCheck();
        results[serverType] = health;
      } catch (error) {
        results[serverType] = false;
      }
    }

    return {
      success: true,
      data: results as Record<MCPServerType, boolean>
    };
  }
}

export const createDefaultDIASConfig = (): DIASServiceConfig => ({
  taskMasterCLI: {
    command: 'task-master',
    configPath: './.taskmasterconfig',
    apiKey: process.env.ANTHROPIC_API_KEY || ''
  },
  superClaude: {
    defaultPersona: 'architect',
    defaultFlags: {
      think: false,
      uc: false,
      validate: true
    }
  },
  mcpServers: {
    context7: { enabled: true, timeout: 30000, retries: 3 },
    sequential: { enabled: true, timeout: 60000, retries: 3 },
    magic: { enabled: true, timeout: 45000, retries: 3 },
    playwright: { enabled: true, timeout: 120000, retries: 2 }
  },
  resilience: {
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 30000
    },
    tokenBucket: {
      capacity: 100,
      refillRate: 10,
      refillPeriod: 1000
    },
    retryAttempts: 3,
    retryDelay: 1000
  },
  cache: {
    maxSize: 1000,
    defaultTTL: 3600000, // 1 hour
    compressionThreshold: 10000 // 10KB
  },
  memory: {
    layers: ['in-memory', 'redis', 'database'],
    syncInterval: 300000 // 5 minutes
  }
});
