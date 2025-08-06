'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { logicMonitor, LogicModuleEvent, LogicFlow } from '@/lib/monitoring/logic-monitor';

interface ModuleStats {
  module: string;
  count: number;
  avgDuration: number;
}

export function LogicMonitorDashboard() {
  const [events, setEvents] = useState<LogicModuleEvent[]>([]);
  const [activeFlows, setActiveFlows] = useState<LogicFlow[]>([]);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [filter, setFilter] = useState<'all' | 'AVCA' | 'DIAS' | 'INTEGRATION'>('all');
  const [showDetails, setShowDetails] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Fetch server-side monitoring data
  const fetchServerData = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/logic');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setActiveFlows(data.flows || []);
        setModuleStats(data.stats || []);
        setLastUpdate(data.timestamp);
      } else {
        console.error('Server monitoring data fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch server monitoring data:', error);
      // Don't fail silently - show user there's an issue
      setEvents([]);
      setActiveFlows([]);
      setModuleStats([]);
    }
  }, []);

  useEffect(() => {
    // Subscribe to client-side events (for browser operations)
    const handleModuleComplete = (event: LogicModuleEvent) => {
      setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
      updateStats();
    };

    const handleFlowUpdate = () => {
      setActiveFlows(prev => [...prev, ...logicMonitor.getActiveFlows()]);
    };

    logicMonitor.on('module:complete', handleModuleComplete);
    logicMonitor.on('flow:complete', handleFlowUpdate);
    logicMonitor.on('module:start', handleFlowUpdate);

    // Initial load from both client and server
    updateStats();
    setActiveFlows(logicMonitor.getActiveFlows());
    fetchServerData();

    return () => {
      logicMonitor.off('module:complete', handleModuleComplete);
      logicMonitor.off('flow:complete', handleFlowUpdate);
      logicMonitor.off('module:start', handleFlowUpdate);
    };
  }, [fetchServerData]);

  // Polling for server-side updates
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      fetchServerData();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [isPolling, fetchServerData]);

  const updateStats = useCallback(() => {
    setModuleStats(logicMonitor.getModuleStats());
  }, []);

  const getSystemColor = (system: string) => {
    switch (system) {
      case 'AVCA': return 'text-blue-400 bg-blue-500/20 border border-blue-500/30';
      case 'DIAS': return 'text-green-400 bg-green-500/20 border border-green-500/30';
      case 'INTEGRATION': return 'text-purple-400 bg-purple-500/20 border border-purple-500/30';
      default: return 'text-[#A1A1AA] bg-[#1F1F23] border border-[#1F1F23]';
    }
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'AVCA': return '🔷';
      case 'DIAS': return '🧠';
      case 'INTEGRATION': return '🔗';
      default: return '📊';
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.system === filter);

  return (
    <div className="p-6 bg-[#0A0A0B] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#111113] border border-[#1F1F23] rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-light text-white mb-2">
            AVCA/DIAS Logic Monitor
          </h1>
          <p className="text-[#A1A1AA]">
            Real-time visibility into system decision-making and module activation
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-[#111113] border border-[#1F1F23] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-[#1F1F23] text-[#A1A1AA] hover:bg-[#2A2A2E] border border-[#1F1F23]'
                }`}
              >
                All Systems
              </button>
              <button
                onClick={() => setFilter('AVCA')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'AVCA' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-[#1F1F23] text-blue-400/70 hover:bg-blue-500/10 border border-[#1F1F23]'
                }`}
              >
                🔷 AVCA
              </button>
              <button
                onClick={() => setFilter('DIAS')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'DIAS' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-[#1F1F23] text-green-400/70 hover:bg-green-500/10 border border-[#1F1F23]'
                }`}
              >
                🧠 DIAS
              </button>
              <button
                onClick={() => setFilter('INTEGRATION')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'INTEGRATION' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'bg-[#1F1F23] text-purple-400/70 hover:bg-purple-500/10 border border-[#1F1F23]'
                }`}
              >
                🔗 Integration
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-[#A1A1AA]">
                  {isPolling ? 'Live' : 'Paused'}
                </span>
                {lastUpdate > 0 && (
                  <span className="text-xs text-[#71717A]">
                    • Updated {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPolling(!isPolling)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    isPolling 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' 
                      : 'bg-[#1F1F23] text-[#A1A1AA] hover:bg-[#2A2A2E] border border-[#1F1F23]'
                  }`}
                >
                  {isPolling ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={fetchServerData}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 border border-blue-500/30 text-sm font-medium"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 bg-[#1F1F23] text-[#A1A1AA] rounded-md hover:bg-[#2A2A2E] border border-[#1F1F23] font-medium"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Flows */}
          <div className="lg:col-span-2">
            <div className="bg-[#111113] border border-[#1F1F23] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Recent Module Activations
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.length === 0 ? (
                  <p className="text-[#71717A] text-center py-8">
                    No module activations yet. Trigger an operation to see activity.
                  </p>
                ) : (
                  filteredEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="border border-[#1F1F23] rounded-lg p-4 hover:border-[#2A2A2E] transition-colors bg-[#0F0F10]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSystemColor(event.system)}`}>
                              {getSystemIcon(event.system)} {event.system}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {event.module}
                            </span>
                          </div>
                          <p className="text-sm text-[#A1A1AA] mb-1">
                            {event.operation}: {event.decision.logic}
                          </p>
                          {event.decision.confidence && (
                            <p className="text-xs text-[#71717A]">
                              Confidence: {event.decision.confidence}%
                            </p>
                          )}
                          {showDetails && (
                            <div className="mt-2 pt-2 border-t border-[#1F1F23]">
                              <div className="text-xs text-[#A1A1AA]">
                                <p>Duration: {event.duration}ms</p>
                                {event.metadata?.tokenUsage && (
                                  <p>Tokens: {event.metadata.tokenUsage}</p>
                                )}
                                {event.metadata?.cacheHit && (
                                  <p className="text-green-600">Cache Hit ✓</p>
                                )}
                                {event.metadata?.sourcePage && (
                                  <p className="text-blue-600">📄 Page: {event.metadata.sourcePage}</p>
                                )}
                                {event.metadata?.sourceRoute && (
                                  <p className="text-purple-600">🛣️ Route: {event.metadata.sourceRoute}</p>
                                )}
                                {event.metadata?.modelUsed && (
                                  <p className="text-indigo-600">🤖 Model: {event.metadata.modelUsed}</p>
                                )}
                                {event.metadata?.qualityScore && (
                                  <p className="text-amber-600">⭐ Quality: {event.metadata.qualityScore}%</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-[#71717A] ml-4">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Module Statistics */}
          <div className="space-y-6">
            <div className="bg-[#111113] border border-[#1F1F23] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Module Statistics
              </h2>
              <div className="space-y-3">
                {moduleStats.length === 0 ? (
                  <p className="text-[#71717A] text-sm">
                    No statistics available yet.
                  </p>
                ) : (
                  moduleStats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[#A1A1AA]">
                        {stat.module}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-white">{stat.count} calls</p>
                        <p className="text-xs text-[#71717A]">avg {stat.avgDuration}ms</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Flows */}
            <div className="bg-[#111113] border border-[#1F1F23] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Active Flows
              </h2>
              <div className="space-y-2">
                {activeFlows.length === 0 ? (
                  <p className="text-[#71717A] text-sm">
                    No active flows.
                  </p>
                ) : (
                  activeFlows.map((flow, idx) => (
                    <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm font-medium text-yellow-400">
                        Flow: {flow.id.slice(-8)}
                      </p>
                      <p className="text-xs text-yellow-400/70">
                        Modules: {flow.modules.length}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-[#111113] border border-[#1F1F23] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                System Health
              </h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-[#A1A1AA]">AVCA Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-[#A1A1AA]">DIAS Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-[#A1A1AA]">Integration Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <span className="font-semibold">💡 Tip:</span> This dashboard shows real-time logic module 
            activations as AVCA and DIAS process requests. Use this to understand system behavior and 
            identify missing or underutilized modules.
          </p>
        </div>
      </div>
    </div>
  );
}