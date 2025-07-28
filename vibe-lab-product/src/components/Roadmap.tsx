'use client';

import React, { useState } from 'react';
import { Check, Circle, Clock, AlertCircle } from 'lucide-react';

interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  completionPercentage?: number;
  items: {
    id: string;
    title: string;
    status: 'completed' | 'in-progress' | 'pending' | 'blocked';
    description?: string;
  }[];
}

const roadmapData: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1: Core Foundation & Authentication',
    duration: 'Week 1-2',
    status: 'in-progress',
    completionPercentage: 100,
    items: [
      {
        id: '1.1',
        title: 'Project Scaffolding',
        status: 'completed',
        description: 'Initialize Next.js application with TypeScript, Tailwind CSS, and shadcn/ui components'
      },
      {
        id: '1.2',
        title: 'Linear-Inspired Layout Implementation',
        status: 'in-progress',
        description: 'Build three-column AppLayout with Command Palette (Cmd+K) and agent visual indicators'
      },
      {
        id: '1.3',
        title: 'Authentication with NextAuth.js',
        status: 'completed',
        description: 'Integrate NextAuth.js with GitHub OAuth provider and session management'
      },
      {
        id: '1.4',
        title: 'Database Setup',
        status: 'pending',
        description: 'Set up PostgreSQL schema with enhanced Tasks model for Task Master integration'
      }
    ]
  },
  {
    id: 'phase-2',
    title: 'Phase 2: Plan & Build Pages Implementation',
    duration: 'Week 3-4',
    status: 'completed',
    completionPercentage: 100,
    items: [
      {
        id: '2.1',
        title: 'Dashboard (Linear-Style)',
        status: 'completed',
        description: 'Build /dashboard page with Linear-inspired project cards and keyboard navigation'
      },
      {
        id: '2.2',
        title: 'Plan Page (/project/{projectId}/plan)',
        status: 'completed',
        description: 'Build interactive blueprint editor with real-time AI assistance and multi-agent chat UI'
      },
      {
        id: '2.3',
        title: 'Build Page (/project/{projectId}/build)',
        status: 'completed',
        description: 'Create Task Complexity Matrix component with dependency graph visualization'
      },
      {
        id: '2.4',
        title: 'Enhanced AI Pipeline Integration',
        status: 'completed',
        description: 'Implement Pattern D: Task Master Integration workflow from AI architecture'
      }
    ]
  },
  {
    id: 'phase-3',
    title: 'Phase 3: Dual-Claude AI Backend Integration',
    duration: 'Week 5-6',
    status: 'in-progress',
    completionPercentage: 25,
    items: [
      {
        id: '3.1',
        title: 'Dual-Claude Orchestrator Service',
        status: 'completed',
        description: 'Real Anthropic API integration with developer/auditor agents'
      },
      {
        id: '3.2',
        title: 'Developer/Auditor Workflow',
        status: 'pending',
        description: 'Coordinated dual-agent development workflow'
      },
      {
        id: '3.3',
        title: 'Agent Status Tracking',
        status: 'pending',
        description: 'Real-time agent coordination and status updates'
      },
      {
        id: '3.4',
        title: 'Background Job System',
        status: 'pending',
        description: 'Async task processing and AI workflow management'
      }
    ]
  },
  {
    id: 'phase-4',
    title: 'Phase 4: Polish, Testing & MVP Launch',
    duration: 'Week 7',
    status: 'pending',
    completionPercentage: 0,
    items: [
      {
        id: '4.1',
        title: 'Linear UI Polish',
        status: 'pending',
        description: 'Perfect keyboard navigation and agent indicators'
      },
      {
        id: '4.2',
        title: 'Task Master & Wave Mode Testing',
        status: 'pending',
        description: 'Complexity scoring accuracy validation'
      },
      {
        id: '4.3',
        title: 'End-to-End Workflow Validation',
        status: 'pending',
        description: 'Complete Plan→Build→Test→Visualize journey'
      },
      {
        id: '4.4',
        title: 'Production Deployment',
        status: 'pending',
        description: 'Deploy to Vercel with Neon PostgreSQL'
      }
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Check className="w-5 h-5 text-green-500" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
    case 'blocked':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Circle className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'blocked':
      return 'bg-red-500';
    default:
      return 'bg-gray-600';
  }
};

export default function Roadmap() {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['phase-1', 'phase-2']));

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vibe Lab SaaS - Project Roadmap (MVP)</h1>
        <p className="text-gray-400">Plan → Build → Test → Visualize Framework</p>
      </div>

      <div className="space-y-6">
        {roadmapData.map((phase) => (
          <div
            key={phase.id}
            className={`border rounded-lg transition-all ${
              phase.status === 'completed' 
                ? 'border-green-500/30 bg-green-500/5' 
                : phase.status === 'in-progress'
                ? 'border-blue-500/30 bg-blue-500/5'
                : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => togglePhase(phase.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(phase.status)}
                  <div>
                    <h2 className="text-xl font-semibold">{phase.title}</h2>
                    <p className="text-sm text-gray-400">{phase.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {phase.completionPercentage !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getStatusColor(phase.status)}`}
                          style={{ width: `${phase.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{phase.completionPercentage}%</span>
                    </div>
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedPhases.has(phase.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {expandedPhases.has(phase.id) && (
              <div className="px-6 pb-6 space-y-3 border-t border-gray-700/50">
                {phase.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      item.status === 'completed'
                        ? 'bg-green-500/10'
                        : item.status === 'in-progress'
                        ? 'bg-blue-500/10'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.id}. {item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Key Metrics & Performance Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400">Command Palette Response</div>
            <div className="text-xl font-semibold text-green-500">&lt;100ms</div>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400">Multi-agent Coordination</div>
            <div className="text-xl font-semibold text-blue-500">&lt;30s/cycle</div>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400">Task Master Analysis</div>
            <div className="text-xl font-semibold text-purple-500">&lt;30s for 50 tasks</div>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400">Workflow Completion</div>
            <div className="text-xl font-semibold text-orange-500">&lt;15 min</div>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400">GitHub Integration</div>
            <div className="text-xl font-semibold text-green-500">&gt;99.5%</div>
          </div>
          <div className="p-4 bg-gray-700/30 rounded-lg">
            <div className="text-sm text-gray-400">Parallel Efficiency</div>
            <div className="text-xl font-semibold text-blue-500">40% improvement</div>
          </div>
        </div>
      </div>
    </div>
  );
}