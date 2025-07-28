'use client';

/**
 * Cost Monitoring Dashboard
 * Real-time cost tracking and projections for AVCA pipeline
 */

import { useEffect, useState } from 'react';
import { tokenTracker, type TokenMetrics } from './token-tracking';
import { Card } from '../../src/components/ui/card';
import { Progress } from '../../src/components/ui/progress';
import { AlertCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface DashboardMetrics {
  current: {
    dailyTokens: number;
    dailyCost: number;
    requestCount: number;
    budgetUtilization: number;
  };
  projections: {
    dailyCost: number;
    monthlyCost: number;
    tokensPerRequest: number;
  };
  stageBreakdown: Array<{
    stage: string;
    cost: number;
    tokens: number;
    percentage: number;
  }>;
  alerts: Array<{
    level: 'warning' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

export function CostMonitoringDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  useEffect(() => {
    const updateMetrics = () => {
      const dailyMetrics = tokenTracker.getDailyMetrics();
      const exportedMetrics = tokenTracker.exportMetrics();
      const stageEfficiency = exportedMetrics.stageEfficiency;

      // Calculate stage breakdown
      const stageBreakdown = Object.entries(stageEfficiency).map(([stage, stats]) => {
        const percentage = (stats.averageTokens / Object.values(stageEfficiency)
          .reduce((sum, s) => sum + s.averageTokens, 0)) * 100;
        
        return {
          stage,
          cost: stats.averageCost,
          tokens: Math.round(stats.averageTokens),
          percentage: Math.round(percentage)
        };
      }).sort((a, b) => b.cost - a.cost);

      // Project monthly cost
      const daysInMonth = 30;
      const projectedMonthlyCost = dailyMetrics.totalCost * daysInMonth;

      // Generate alerts
      const alerts: DashboardMetrics['alerts'] = [];
      
      if (dailyMetrics.budgetUtilization >= 80) {
        alerts.push({
          level: 'critical',
          message: `Daily budget utilization at ${Math.round(dailyMetrics.budgetUtilization)}%`,
          timestamp: new Date()
        });
      }

      if (projectedMonthlyCost > 2500) {
        alerts.push({
          level: 'warning',
          message: `Projected monthly cost ($${projectedMonthlyCost.toFixed(2)}) exceeds target`,
          timestamp: new Date()
        });
      }

      setMetrics({
        current: {
          dailyTokens: dailyMetrics.totalTokens,
          dailyCost: dailyMetrics.totalCost,
          requestCount: dailyMetrics.requestCount,
          budgetUtilization: dailyMetrics.budgetUtilization
        },
        projections: {
          dailyCost: dailyMetrics.totalCost,
          monthlyCost: projectedMonthlyCost,
          tokensPerRequest: dailyMetrics.averageTokensPerRequest
        },
        stageBreakdown,
        alerts
      });

      setIsLoading(false);
    };

    // Initial load
    updateMetrics();

    // Set up refresh interval
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (isLoading) {
    return <div className="p-8">Loading cost metrics...</div>;
  }

  if (!metrics) {
    return <div className="p-8">No metrics available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cost Monitoring Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Live (updates every {refreshInterval / 1000}s)</span>
        </div>
      </div>

      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <div className="space-y-2">
          {metrics.alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-4 rounded-lg ${
                alert.level === 'critical' 
                  ? 'bg-red-50 text-red-800 border border-red-200' 
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily Cost</p>
              <p className="text-2xl font-bold">${metrics.current.dailyCost.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Daily Tokens</p>
              <p className="text-2xl font-bold">{(metrics.current.dailyTokens / 1000).toFixed(1)}K</p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Requests Today</p>
              <p className="text-2xl font-bold">{metrics.current.requestCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-500">Budget Utilization</p>
            <p className="text-2xl font-bold">{Math.round(metrics.current.budgetUtilization)}%</p>
            <Progress 
              value={metrics.current.budgetUtilization} 
              className="mt-2"
            />
          </div>
        </Card>
      </div>

      {/* Projections */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Cost Projections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Projected Daily</p>
            <p className="text-xl font-semibold">${metrics.projections.dailyCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Projected Monthly</p>
            <p className="text-xl font-semibold">${metrics.projections.monthlyCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Tokens/Request</p>
            <p className="text-xl font-semibold">{Math.round(metrics.projections.tokensPerRequest)}</p>
          </div>
        </div>
      </Card>

      {/* Stage Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Cost by Pipeline Stage</h2>
        <div className="space-y-3">
          {metrics.stageBreakdown.map((stage) => (
            <div key={stage.stage} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{stage.stage}</span>
                <span>${stage.cost.toFixed(3)} ({stage.tokens} tokens)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Success Metrics vs Target */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Phase 0 Success Criteria</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Cost per Feature</span>
            <span className={`font-semibold ${metrics.current.dailyCost < 0.50 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.current.dailyCost.toFixed(2)} / $0.50 target
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Daily Budget Utilization</span>
            <span className={`font-semibold ${metrics.current.budgetUtilization < 80 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.round(metrics.current.budgetUtilization)}% / 80% warning
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Projected Monthly Cost</span>
            <span className={`font-semibold ${metrics.projections.monthlyCost < 2567 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.projections.monthlyCost.toFixed(2)} / $2,567 budget
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
} 