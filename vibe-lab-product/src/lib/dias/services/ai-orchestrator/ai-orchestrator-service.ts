/**
 * AI Orchestrator Service
 * SuperClaude framework wrapper with resilience patterns
 */

import { BaseService } from '@/lib/avca/services/base-service';
import { CircuitBreaker } from '@/lib/integration/resilience/circuit-breaker';
import { 
  SuperClaudePersona, 
  SuperClaudeCommand, 
  SuperClaudeFlags,
  AIRequest,
  AIResponse,
  ServiceResponse,
  DIASServiceConfig,
  MCPServerType,
  ResilienceConfig
} from '../types';

export class AIOrchestratorService extends BaseService {
  private circuitBreaker: CircuitBreaker;
  private tokenBucket: TokenBucket;
  private defaultPersona: SuperClaudePersona;
  private defaultFlags: SuperClaudeFlags;
  private mcpServers: Record<MCPServerType, boolean>;

  constructor(config: DIASServiceConfig) {
    super('AIOrchestratorService');
    
    // Initialize resilience patterns
    this.circuitBreaker = new CircuitBreaker(config.resilience.circuitBreaker);
    this.tokenBucket = new TokenBucket(config.resilience.tokenBucket);
    
    // SuperClaude configuration
    this.defaultPersona = config.superClaude.defaultPersona;
    this.defaultFlags = config.superClaude.defaultFlags;
    
    // MCP server availability
    this.mcpServers = Object.entries(config.mcpServers).reduce((acc, [key, value]) => {
      acc[key as MCPServerType] = value.enabled;
      return acc;
    }, {} as Record<MCPServerType, boolean>);
  }

  /**
   * Execute SuperClaude command with intelligent routing and resilience
   */
  async execute(request: AIRequest): Promise<ServiceResponse<AIResponse>> {
    const startTime = Date.now();
    
    try {
      // Apply rate limiting
      if (!await this.tokenBucket.consume()) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          executionTime: Date.now() - startTime
        };
      }

      // Apply circuit breaker
      if (this.circuitBreaker.isOpen()) {
        return {
          success: false,
          error: 'Circuit breaker is open',
          executionTime: Date.now() - startTime
        };
      }

      // Select optimal persona for the command
      const persona = await this.selectPersona(request);
      
      // Determine required MCP servers
      const mcpServers = this.determineMCPServers(request, persona);
      
      // Select AI model based on command complexity and persona
      const model = this.selectModel(request, persona);
      
      // Execute the command
      const response = await this.executeCommand(request, persona, mcpServers, model);
      
      // Record success in circuit breaker
      this.circuitBreaker.recordSuccess();
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          result: response.result,
          persona,
          mcpServersUsed: mcpServers,
          executionTime,
          tokensUsed: response.tokensUsed,
          cost: response.cost,
          metadata: {
            model,
            flags: request.flags,
            ...response.metadata
          }
        },
        executionTime
      };

    } catch (error) {
      // Record failure in circuit breaker
      this.circuitBreaker.recordFailure();
      
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log('error', 'AI Orchestrator execution failed', error);
      
      return {
        success: false,
        error: errorMessage,
        executionTime
      };
    }
  }

  /**
   * Select the optimal persona for the request
   */
  private async selectPersona(request: AIRequest): Promise<SuperClaudePersona> {
    // If persona is explicitly specified in flags, use it
    if (request.flags?.persona) {
      return request.flags.persona;
    }

    // Intelligent persona selection based on command and context
    const personaMap: Record<SuperClaudeCommand, SuperClaudePersona> = {
      '/analyze': 'analyzer',
      '/build': 'architect',
      '/implement': 'frontend', // Default, can be overridden by context
      '/improve': 'refactorer',
      '/design': 'frontend',
      '/task': 'architect',
      '/troubleshoot': 'analyzer',
      '/explain': 'mentor',
      '/cleanup': 'refactorer',
      '/document': 'scribe',
      '/estimate': 'architect',
      '/test': 'qa',
      '/git': 'devops',
      '/index': 'mentor',
      '/load': 'analyzer',
      '/spawn': 'architect'
    };

    let selectedPersona = personaMap[request.command] || this.defaultPersona;

    // Context-based persona refinement
    if (request.context) {
      selectedPersona = this.refinePersonaFromContext(request.context, selectedPersona);
    }

    this.log('info', `Selected persona: ${selectedPersona} for command: ${request.command}`);
    return selectedPersona;
  }

  /**
   * Refine persona selection based on context analysis
   */
  private refinePersonaFromContext(context: string, defaultPersona: SuperClaudePersona): SuperClaudePersona {
    const contextLower = context.toLowerCase();
    
    // Security context
    if (contextLower.includes('security') || contextLower.includes('vulnerability') || 
        contextLower.includes('auth') || contextLower.includes('encryption')) {
      return 'security';
    }

    // Performance context
    if (contextLower.includes('performance') || contextLower.includes('optimize') || 
        contextLower.includes('slow') || contextLower.includes('bottleneck')) {
      return 'performance';
    }

    // Backend context
    if (contextLower.includes('api') || contextLower.includes('database') || 
        contextLower.includes('server') || contextLower.includes('backend')) {
      return 'backend';
    }

    // Frontend context
    if (contextLower.includes('ui') || contextLower.includes('component') || 
        contextLower.includes('react') || contextLower.includes('frontend')) {
      return 'frontend';
    }

    // DevOps context
    if (contextLower.includes('deploy') || contextLower.includes('docker') || 
        contextLower.includes('ci/cd') || contextLower.includes('infrastructure')) {
      return 'devops';
    }

    return defaultPersona;
  }

  /**
   * Determine which MCP servers are needed for the request
   */
  private determineMCPServers(request: AIRequest, persona: SuperClaudePersona): MCPServerType[] {
    const servers: MCPServerType[] = [];

    // Force specific MCP servers based on flags
    if (request.flags?.c7 && this.mcpServers.context7) servers.push('context7');
    if (request.flags?.seq && this.mcpServers.sequential) servers.push('sequential');
    if (request.flags?.magic && this.mcpServers.magic) servers.push('magic');
    if (request.flags?.play && this.mcpServers.playwright) servers.push('playwright');
    
    if (request.flags?.allMcp) {
      return Object.entries(this.mcpServers)
        .filter(([_, enabled]) => enabled)
        .map(([server, _]) => server as MCPServerType);
    }

    if (request.flags?.noMcp) {
      return [];
    }

    // Auto-select MCP servers based on command and persona
    const commandServerMap: Record<SuperClaudeCommand, MCPServerType[]> = {
      '/analyze': ['sequential', 'context7'],
      '/build': ['context7', 'magic'],
      '/implement': ['context7', 'magic'],
      '/improve': ['sequential', 'context7'],
      '/design': ['magic', 'context7'],
      '/task': ['sequential'],
      '/troubleshoot': ['sequential'],
      '/explain': ['context7'],
      '/cleanup': ['sequential'],
      '/document': ['context7'],
      '/estimate': ['sequential', 'context7'],
      '/test': ['playwright', 'sequential'],
      '/git': ['sequential'],
      '/index': ['context7'],
      '/load': ['sequential'],
      '/spawn': ['sequential']
    };

    const personaServerMap: Record<SuperClaudePersona, MCPServerType[]> = {
      'architect': ['sequential', 'context7'],
      'frontend': ['magic', 'context7'],
      'backend': ['context7', 'sequential'],
      'analyzer': ['sequential'],
      'security': ['sequential', 'context7'],
      'mentor': ['context7'],
      'refactorer': ['sequential'],
      'performance': ['playwright', 'sequential'],
      'qa': ['playwright', 'sequential'],
      'devops': ['sequential'],
      'scribe': ['context7']
    };

    // Combine command and persona recommendations
    const commandServers = commandServerMap[request.command] || [];
    const personaServers = personaServerMap[persona] || [];
    
    const recommendedServers = [...new Set([...commandServers, ...personaServers])];
    
    // Filter by availability
    return recommendedServers.filter(server => this.mcpServers[server]);
  }

  /**
   * Select AI model based on command complexity and role
   * Implements the cost-effective model selection strategy
   */
  private selectModel(request: AIRequest, persona: SuperClaudePersona): 'haiku' | 'sonnet' | 'opus' {
    // Force Opus for audit/critical operations
    if (request.flags?.ultrathink || request.flags?.safeMode || 
        persona === 'security' || persona === 'architect') {
      return 'opus';
    }

    // Use Sonnet for development work
    if (request.command === '/implement' || request.command === '/build' || 
        request.command === '/improve' || persona === 'frontend' || persona === 'backend') {
      return 'sonnet';
    }

    // Use Haiku for routing and simple operations
    if (request.command === '/explain' || request.command === '/index' || 
        request.flags?.answerOnly) {
      return 'haiku';
    }

    // Default to Sonnet for balanced performance
    return 'sonnet';
  }

  /**
   * Execute the actual SuperClaude command
   */
  private async executeCommand(
    request: AIRequest, 
    persona: SuperClaudePersona, 
    mcpServers: MCPServerType[], 
    model: string
  ): Promise<{
    result: string;
    tokensUsed?: number;
    cost?: number;
    metadata: Record<string, any>;
  }> {
    // This would integrate with the actual SuperClaude system
    // For now, we'll simulate the execution
    
    this.log('info', `Executing command: ${request.command} with persona: ${persona}, MCP servers: ${mcpServers.join(', ')}, model: ${model}`);
    
    // Simulate execution time based on complexity
    const simulatedDelay = this.calculateExecutionTime(request, mcpServers);
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));
    
    // Simulate response
    return {
      result: `Executed ${request.command} with ${persona} persona using ${mcpServers.join(', ')} MCP servers`,
      tokensUsed: Math.floor(Math.random() * 5000) + 1000,
      cost: Math.random() * 0.1 + 0.01,
      metadata: {
        simulatedExecution: true,
        delay: simulatedDelay
      }
    };
  }

  /**
   * Calculate estimated execution time
   */
  private calculateExecutionTime(request: AIRequest, mcpServers: MCPServerType[]): number {
    let baseTime = 1000; // 1 second base

    // Add time for each MCP server
    baseTime += mcpServers.length * 500;

    // Add time for complex flags
    if (request.flags?.think) baseTime += 2000;
    if (request.flags?.thinkHard) baseTime += 5000;
    if (request.flags?.ultrathink) baseTime += 10000;

    return Math.floor(baseTime * (0.5 + Math.random()));
  }

  /**
   * Health check for AI Orchestrator
   */
  async healthCheck(): Promise<ServiceResponse<{
    circuitBreaker: string;
    tokenBucket: string;
    mcpServers: Record<MCPServerType, boolean>;
  }>> {
    return {
      success: true,
      data: {
        circuitBreaker: this.circuitBreaker.isOpen() ? 'open' : 'closed',
        tokenBucket: await this.tokenBucket.getAvailableTokens() > 0 ? 'available' : 'exhausted',
        mcpServers: this.mcpServers
      }
    };
  }
}

/**
 * Token Bucket Rate Limiter
 */
class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillRate: number;
  private lastRefill: number;

  constructor(config: { capacity: number; refillRate: number; refillPeriod: number }) {
    this.capacity = config.capacity;
    this.tokens = config.capacity;
    this.refillRate = config.refillRate;
    this.lastRefill = Date.now();
  }

  async consume(tokens = 1): Promise<boolean> {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  async getAvailableTokens(): Promise<number> {
    this.refill();
    return this.tokens;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor((timePassed / 1000) * this.refillRate);
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}