/**
 * Migration Service
 * 
 * Handles repository analysis and migration planning:
 * - Analyzes GitHub repositories
 * - Analyzes local code
 * - Analyzes documentation
 * - Generates migration plans
 * - Validates migration feasibility
 */

import { BaseService } from './base-service';
import { EventBus } from './event-bus';
import { AIClientService } from './ai-client';
import { tokenTracker } from '../token-tracking';
import { getModelForStage, calculateCost } from '../model-config';
import { PipelineStage } from '../types';

// Migration Request Types
export interface MigrationRequest {
  requestId: string;
  source: {
    type: 'github' | 'code' | 'docs';
    content: any;
    metadata?: Record<string, any>;
  };
  context?: any;
}

export interface MigrationResponse {
  requestId: string;
  analysis: MigrationAnalysis;
  plan: MigrationPlan;
  tokensUsed: number;
  cost: number;
  duration: number;
}

export interface MigrationAnalysis {
  sourceType: 'github' | 'code' | 'docs';
  structure: {
    files: string[];
    components: string[];
    dependencies: string[];
  };
  patterns: {
    architectural: string[];
    design: string[];
    styling: string[];
  };
  complexity: {
    score: number;
    factors: string[];
  };
  risks: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

export interface MigrationPlan {
  steps: {
    id: string;
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dependencies: string[];
    estimatedTime: number;
  }[];
  timeline: {
    totalDuration: number;
    phases: {
      name: string;
      duration: number;
      steps: string[];
    }[];
  };
  recommendations: string[];
}

export class MigrationService extends BaseService {
  private aiClient: AIClientService;

  constructor(eventBus: EventBus) {
    super({
      name: 'migration-service',
      version: '1.0.0',
      stage: PipelineStage.MIGRATION,
      dependencies: ['ai-client']
    });

    this.aiClient = new AIClientService(eventBus);
  }

  protected async initialize(): Promise<void> {
    await this.aiClient.start();
    this.log('info', 'Migration service initialized');
  }

  protected async cleanup(): Promise<void> {
    await this.aiClient.stop();
    this.log('info', 'Migration service cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    return this.aiClient.isHealthy();
  }

  /**
   * Process a migration request
   */
  async process(request: MigrationRequest): Promise<MigrationResponse> {
    const startTime = Date.now();
    
    try {
      this.log('info', `Processing migration request ${request.requestId}`);
      this.emitEvent('request', { requestId: request.requestId, stage: 'migration' });

      // Get model configuration
      const modelConfig = getModelForStage('migration');
      
      // Analyze source
      const analysis = await this.analyzeSource(request.source);
      
      // Generate migration plan
      const plan = await this.generateMigrationPlan(analysis, request.context);
      
      // Track token usage and cost
      const duration = Date.now() - startTime;
      tokenTracker.track(
        request.requestId,
        PipelineStage.MIGRATION,
        {
          model: modelConfig.model,
          promptTokens: analysis.tokenUsage.prompt + plan.tokenUsage.prompt,
          completionTokens: analysis.tokenUsage.completion + plan.tokenUsage.completion,
          totalTokens: analysis.tokenUsage.total + plan.tokenUsage.total,
          cost: analysis.cost + plan.cost
        },
        duration
      );

      // Update metrics
      this.updateMetrics(duration, true);

      const response: MigrationResponse = {
        requestId: request.requestId,
        analysis: analysis.result,
        plan: plan.result,
        tokensUsed: analysis.tokenUsage.total + plan.tokenUsage.total,
        cost: analysis.cost + plan.cost,
        duration
      };

      this.emitEvent('response', response);
      this.log('info', `Migration plan generated in ${duration}ms, cost: $${(analysis.cost + plan.cost).toFixed(4)}`);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(duration, false);
      
      this.emitEvent('error', {
        requestId: request.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Analyze source code/repository/documentation
   */
  private async analyzeSource(source: MigrationRequest['source']): Promise<{
    result: MigrationAnalysis;
    tokenUsage: { prompt: number; completion: number; total: number };
    cost: number;
  }> {
    // Prepare analysis prompt based on source type
    const prompt = this.prepareAnalysisPrompt(source);

    // Process with AI
    const response = await this.aiClient.process({
      role: 'analyzer',
      prompt,
      context: JSON.stringify(source.content),
      metadata: {
        operation: 'migration_analysis',
        sourceType: source.type
      }
    });

    // Parse analysis result
    const result = JSON.parse(response.content) as MigrationAnalysis;

    return {
      result,
      tokenUsage: {
        prompt: response.usage.promptTokens,
        completion: response.usage.completionTokens,
        total: response.usage.totalTokens
      },
      cost: response.cost
    };
  }

  /**
   * Generate migration plan from analysis
   */
  private async generateMigrationPlan(
    analysis: MigrationAnalysis,
    context?: any
  ): Promise<{
    result: MigrationPlan;
    tokenUsage: { prompt: number; completion: number; total: number };
    cost: number;
  }> {
    // Prepare plan generation prompt
    const prompt = this.preparePlanPrompt(analysis, context);

    // Process with AI
    const response = await this.aiClient.process({
      role: 'developer',
      prompt,
      context: context ? JSON.stringify(context) : undefined,
      metadata: {
        operation: 'migration_planning',
        sourceType: analysis.sourceType
      }
    });

    // Parse plan result
    const result = JSON.parse(response.content) as MigrationPlan;

    return {
      result,
      tokenUsage: {
        prompt: response.usage.promptTokens,
        completion: response.usage.completionTokens,
        total: response.usage.totalTokens
      },
      cost: response.cost
    };
  }

  /**
   * Prepare prompt for source analysis
   */
  private prepareAnalysisPrompt(source: MigrationRequest['source']): string {
    return `
Analyze the provided ${source.type} source and generate a comprehensive analysis following these guidelines:
1. Focus on identifying patterns that need migration to Tailwind-only styling
2. Detect any custom CSS or design system usage that needs conversion
3. Identify component architecture and dependencies
4. Assess migration complexity and risks

Source Type: ${source.type}
${source.metadata ? `Additional Context:\n${JSON.stringify(source.metadata, null, 2)}` : ''}

Response Format:
{
  "sourceType": "${source.type}",
  "structure": {
    "files": ["string"],
    "components": ["string"],
    "dependencies": ["string"]
  },
  "patterns": {
    "architectural": ["string"],
    "design": ["string"],
    "styling": ["string"]
  },
  "complexity": {
    "score": number,
    "factors": ["string"]
  },
  "risks": [
    {
      "type": "string",
      "severity": "low" | "medium" | "high",
      "description": "string"
    }
  ]
}`;
  }

  /**
   * Prepare prompt for migration plan generation
   */
  private preparePlanPrompt(analysis: MigrationAnalysis, context?: any): string {
    return `
Generate a migration plan based on the following analysis and context.
Focus on converting to Tailwind-only styling while maintaining functionality.

Analysis:
${JSON.stringify(analysis, null, 2)}

${context ? `Additional Context:\n${JSON.stringify(context, null, 2)}` : ''}

Guidelines:
1. Break down migration into manageable steps
2. Prioritize critical components and dependencies
3. Include clear validation criteria for each step
4. Consider parallel work opportunities
5. Account for identified risks and complexity factors

Response Format:
{
  "steps": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "priority": "low" | "medium" | "high",
      "dependencies": ["string"],
      "estimatedTime": number
    }
  ],
  "timeline": {
    "totalDuration": number,
    "phases": [
      {
        "name": "string",
        "duration": number,
        "steps": ["string"]
      }
    ]
  },
  "recommendations": ["string"]
}`;
  }
}