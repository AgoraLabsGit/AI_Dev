/**
 * Token Usage Tracking for AVCA Pipeline
 * Tracks AI token consumption across all pipeline stages
 */

import { PipelineStage } from './types';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  cost: number;
}

export interface StageTokenUsage extends TokenUsage {
  stage: PipelineStage;
  timestamp: Date;
  duration: number;
  retries: number;
}

export interface TokenBudget {
  daily: number;
  perRequest: number;
  perStage: Record<PipelineStage, number>;
  warningThreshold: number; // percentage
  hardLimit: number; // percentage
}

export interface TokenMetrics {
  totalUsage: TokenUsage;
  stageBreakdown: StageTokenUsage[];
  costBreakdown: Record<string, number>;
  efficiency: number; // tokens per successful component
  projectedDailyCost: number;
  budgetUtilization: number; // percentage
}

// Model pricing (per 1M tokens)
const MODEL_PRICING = {
  'claude-3-opus-20240229': { input: 15, output: 75 },
  'claude-3-sonnet-20240229': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 }
};

// Default token budgets per stage
const DEFAULT_STAGE_BUDGETS: Record<PipelineStage, number> = {
  [PipelineStage.IDEATION]: 5000,
  [PipelineStage.BLUEPRINTS]: 20000,
  [PipelineStage.STYLING]: 3000,
  [PipelineStage.PAGE_DESIGNS]: 15000,
  [PipelineStage.COMPONENT_SPECS]: 2000,
  [PipelineStage.CODE_GENERATION]: 30000,
  [PipelineStage.VERIFICATION]: 10000,
  [PipelineStage.REGISTRY]: 500,
  [PipelineStage.ASSEMBLY]: 2000
};

export class TokenTracker {
  private usage: Map<string, StageTokenUsage[]> = new Map();
  private budgets: Map<string, TokenBudget> = new Map();
  private dailyUsage: Map<string, number> = new Map();

  constructor(private defaultBudget: TokenBudget = {
    daily: 1000000, // 1M tokens/day
    perRequest: 100000, // 100K per request
    perStage: DEFAULT_STAGE_BUDGETS,
    warningThreshold: 80,
    hardLimit: 95
  }) {}

  /**
   * Track token usage for a specific operation
   */
  track(
    requestId: string,
    stage: PipelineStage,
    usage: TokenUsage,
    duration: number,
    retries: number = 0
  ): void {
    const stageUsage: StageTokenUsage = {
      ...usage,
      stage,
      timestamp: new Date(),
      duration,
      retries
    };

    // Add to request tracking
    const existing = this.usage.get(requestId) || [];
    existing.push(stageUsage);
    this.usage.set(requestId, existing);

    // Update daily usage
    const today = new Date().toISOString().split('T')[0];
    const currentDaily = this.dailyUsage.get(today) || 0;
    this.dailyUsage.set(today, currentDaily + usage.totalTokens);

    // Check budget warnings
    this.checkBudgetAlerts(requestId, today);
  }

  /**
   * Calculate token cost based on model and usage
   */
  calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
    if (!pricing) {
      console.warn(`Unknown model for pricing: ${model}`);
      return 0;
    }

    const inputCost = (promptTokens / 1_000_000) * pricing.input;
    const outputCost = (completionTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Get metrics for a specific request
   */
  getRequestMetrics(requestId: string): TokenMetrics | null {
    const stages = this.usage.get(requestId);
    if (!stages || stages.length === 0) return null;

    const totalUsage: TokenUsage = stages.reduce((acc, stage) => ({
      promptTokens: acc.promptTokens + stage.promptTokens,
      completionTokens: acc.completionTokens + stage.completionTokens,
      totalTokens: acc.totalTokens + stage.totalTokens,
      model: stage.model, // Last model used
      cost: acc.cost + stage.cost
    }), {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      model: '',
      cost: 0
    });

    const costBreakdown = stages.reduce((acc, stage) => {
      acc[stage.stage] = (acc[stage.stage] || 0) + stage.cost;
      return acc;
    }, {} as Record<string, number>);

    // Calculate efficiency (tokens per component generated)
    const componentsGenerated = stages.filter(s => 
      s.stage === PipelineStage.CODE_GENERATION
    ).length;
    const efficiency = componentsGenerated > 0 
      ? totalUsage.totalTokens / componentsGenerated 
      : 0;

    // Project daily cost based on current usage
    const hoursSoFar = new Date().getHours() + new Date().getMinutes() / 60;
    const projectedDailyCost = hoursSoFar > 0 
      ? (totalUsage.cost / hoursSoFar) * 24 
      : 0;

    const budget = this.budgets.get(requestId) || this.defaultBudget;
    const budgetUtilization = (totalUsage.totalTokens / budget.perRequest) * 100;

    return {
      totalUsage,
      stageBreakdown: stages,
      costBreakdown,
      efficiency,
      projectedDailyCost,
      budgetUtilization
    };
  }

  /**
   * Get daily usage statistics
   */
  getDailyMetrics(date: string = new Date().toISOString().split('T')[0]): {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
    averageTokensPerRequest: number;
    budgetUtilization: number;
  } {
    const dailyTokens = this.dailyUsage.get(date) || 0;
    
    // Calculate total cost for the day
    let totalCost = 0;
    let requestCount = 0;
    
    for (const [requestId, stages] of this.usage.entries()) {
      const requestDate = stages[0]?.timestamp.toISOString().split('T')[0];
      if (requestDate === date) {
        requestCount++;
        totalCost += stages.reduce((sum, stage) => sum + stage.cost, 0);
      }
    }

    const averageTokensPerRequest = requestCount > 0 
      ? dailyTokens / requestCount 
      : 0;

    const budgetUtilization = (dailyTokens / this.defaultBudget.daily) * 100;

    return {
      totalTokens: dailyTokens,
      totalCost,
      requestCount,
      averageTokensPerRequest,
      budgetUtilization
    };
  }

  /**
   * Check and alert on budget thresholds
   */
  private checkBudgetAlerts(requestId: string, date: string): void {
    const requestMetrics = this.getRequestMetrics(requestId);
    const dailyMetrics = this.getDailyMetrics(date);

    if (!requestMetrics) return;

    // Check request budget
    if (requestMetrics.budgetUtilization >= this.defaultBudget.hardLimit) {
      this.emitAlert('HARD_LIMIT_EXCEEDED', {
        type: 'request',
        requestId,
        utilization: requestMetrics.budgetUtilization
      });
    } else if (requestMetrics.budgetUtilization >= this.defaultBudget.warningThreshold) {
      this.emitAlert('WARNING_THRESHOLD', {
        type: 'request',
        requestId,
        utilization: requestMetrics.budgetUtilization
      });
    }

    // Check daily budget
    if (dailyMetrics.budgetUtilization >= this.defaultBudget.hardLimit) {
      this.emitAlert('HARD_LIMIT_EXCEEDED', {
        type: 'daily',
        date,
        utilization: dailyMetrics.budgetUtilization
      });
    } else if (dailyMetrics.budgetUtilization >= this.defaultBudget.warningThreshold) {
      this.emitAlert('WARNING_THRESHOLD', {
        type: 'daily',
        date,
        utilization: dailyMetrics.budgetUtilization
      });
    }
  }

  /**
   * Emit budget alerts (would integrate with monitoring system)
   */
  private emitAlert(level: string, data: any): void {
    console.warn(`[TOKEN BUDGET ALERT] ${level}:`, data);
    // TODO: Integrate with monitoring/alerting system
  }

  /**
   * Set custom budget for a specific request
   */
  setRequestBudget(requestId: string, budget: Partial<TokenBudget>): void {
    const currentBudget = this.budgets.get(requestId) || this.defaultBudget;
    this.budgets.set(requestId, { ...currentBudget, ...budget });
  }

  /**
   * Get stage-by-stage token efficiency analysis
   */
  getStageEfficiency(): Record<PipelineStage, {
    averageTokens: number;
    averageCost: number;
    averageDuration: number;
    retryRate: number;
  }> {
    const stageStats: Record<string, {
      totalTokens: number;
      totalCost: number;
      totalDuration: number;
      totalCount: number;
      retryCount: number;
    }> = {};

    // Aggregate stats by stage
    for (const stages of this.usage.values()) {
      for (const stage of stages) {
        if (!stageStats[stage.stage]) {
          stageStats[stage.stage] = {
            totalTokens: 0,
            totalCost: 0,
            totalDuration: 0,
            totalCount: 0,
            retryCount: 0
          };
        }

        const stats = stageStats[stage.stage];
        stats.totalTokens += stage.totalTokens;
        stats.totalCost += stage.cost;
        stats.totalDuration += stage.duration;
        stats.totalCount++;
        stats.retryCount += stage.retries;
      }
    }

    // Calculate averages
    const efficiency: Record<PipelineStage, any> = {} as any;
    
    for (const [stage, stats] of Object.entries(stageStats)) {
      efficiency[stage as PipelineStage] = {
        averageTokens: stats.totalTokens / stats.totalCount,
        averageCost: stats.totalCost / stats.totalCount,
        averageDuration: stats.totalDuration / stats.totalCount,
        retryRate: stats.retryCount / stats.totalCount
      };
    }

    return efficiency;
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    const requests: Array<{ id: string; metrics: TokenMetrics }> = [];
    
    for (const [id, _] of this.usage.entries()) {
      const metrics = this.getRequestMetrics(id);
      if (metrics) {
        requests.push({ id, metrics });
      }
    }

    const daily: Record<string, any> = {};
    for (const date of this.dailyUsage.keys()) {
      daily[date] = this.getDailyMetrics(date);
    }

    return {
      requests,
      daily,
      stageEfficiency: this.getStageEfficiency()
    };
  }

  /**
   * Clear old tracking data (retention policy)
   */
  cleanup(daysToKeep: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Clean up request data
    for (const [requestId, stages] of this.usage.entries()) {
      if (stages[0]?.timestamp < cutoffDate) {
        this.usage.delete(requestId);
        this.budgets.delete(requestId);
      }
    }

    // Clean up daily data
    for (const date of this.dailyUsage.keys()) {
      if (new Date(date) < cutoffDate) {
        this.dailyUsage.delete(date);
      }
    }
  }
}

// Singleton instance
export const tokenTracker = new TokenTracker(); 