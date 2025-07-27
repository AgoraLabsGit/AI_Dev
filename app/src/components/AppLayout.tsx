'use client';

import { useState } from 'react';
import CommandPalette from './CommandPalette';
import DualClaudeChat from './DualClaudeChat';
import { 
  FolderOpen, 
  GitBranch, 
  Settings, 
  User, 
  Bot, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Activity
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Agent status type for dual-Claude coordination
interface AgentStatus {
  id: 'developer' | 'auditor';
  name: string;
  status: 'active' | 'idle' | 'thinking' | 'blocked';
  currentTask?: string;
  lastActivity?: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [selectedProject] = useState('Vibe Lab v1.0');
  
  // Mock dual-Claude agent status - will be real-time in production
  const [agentStatus] = useState<AgentStatus[]>([
    {
      id: 'developer',
      name: 'Claude Developer',
      status: 'active',
      currentTask: 'Implementing P1.2 Layout',
      lastActivity: '2 min ago'
    },
    {
      id: 'auditor',
      name: 'Claude Auditor',
      status: 'idle',
      currentTask: 'Ready for review',
      lastActivity: '5 min ago'
    }
  ]);

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'thinking': return 'text-yellow-400 bg-yellow-400/10';
      case 'blocked': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return <Zap className="w-3 h-3" />;
      case 'thinking': return <Clock className="w-3 h-3" />;
      case 'blocked': return <AlertCircle className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  return (
    <>
      <CommandPalette />
      <div className="flex h-screen bg-[#0D0D0D] text-white">
        {/* Column 1: Main Navigation (Linear-inspired) */}
        <aside className="w-64 flex-shrink-0 bg-[#161618] border-r border-[#2A2A2E] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#2A2A2E]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold">VL</span>
              </div>
              <span className="font-semibold text-lg">Vibe Lab</span>
            </div>
            
            {/* Project Selector */}
            <div className="text-sm text-gray-400 mb-1">Current Project</div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-[#1C1C1E] border border-[#2A2A2E] hover:border-[#404040] transition-colors cursor-pointer">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium truncate">{selectedProject}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {[
                { href: '/dashboard', label: 'Dashboard', icon: Activity },
                { href: '/plan', label: 'Plan', icon: FolderOpen },
                { href: '/build', label: 'Build', icon: GitBranch },
                { href: '/test', label: 'Test', icon: CheckCircle },
                { href: '/visualize', label: 'Visualize', icon: Zap }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-[#1C1C1E] hover:text-white text-gray-300 transition-colors group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </nav>

          {/* Agent Status Panel */}
          <div className="p-4 border-t border-[#2A2A2E]">
            <div className="text-xs text-gray-400 mb-3 font-medium">AI AGENTS</div>
            <div className="space-y-3">
              {agentStatus.map((agent) => (
                <div key={agent.id} className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-200">{agent.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-1">
                      {agent.currentTask}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {agent.lastActivity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-[#2A2A2E]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Developer</div>
                <div className="text-xs text-gray-400">Free Plan</div>
              </div>
              <Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </aside>

        {/* Column 2: Main Content (Enhanced) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {children}
            </div>
          </div>
        </main>

        {/* Column 3: Contextual Panel (Enhanced Vibe Chat) */}
        <aside className="w-80 flex-shrink-0 bg-[#161618] border-l border-[#2A2A2E] flex flex-col">
          <DualClaudeChat />
        </aside>
      </div>
    </>
  );
} 