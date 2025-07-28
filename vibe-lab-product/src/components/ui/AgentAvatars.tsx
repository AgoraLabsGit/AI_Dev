'use client';

import { Bot } from 'lucide-react';

interface AgentStatus {
  status: 'active' | 'thinking' | 'idle';
  lastSeen: string;
}

interface AgentAvatarsProps {
  developer: AgentStatus;
  auditor: AgentStatus;
  className?: string;
}

/**
 * Agent avatar group component
 * - Consistent sizing and spacing
 * - Clear visual hierarchy
 * - Accessible status indicators
 */
export default function AgentAvatars({ 
  developer, 
  auditor, 
  className = '' 
}: AgentAvatarsProps) {
  const getAvatarClasses = (agent: 'developer' | 'auditor', status: AgentStatus['status']) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#161618] relative";
    
    if (agent === 'developer') {
      switch (status) {
        case 'thinking': return `${baseClasses} bg-emerald-400`;
        case 'active': return `${baseClasses} bg-emerald-500`;
        case 'idle': return `${baseClasses} bg-emerald-600`;
      }
    } else {
      switch (status) {
        case 'thinking': return `${baseClasses} bg-purple-400`;
        case 'active': return `${baseClasses} bg-purple-500`;
        case 'idle': return `${baseClasses} bg-purple-600`;
      }
    }
  };

  return (
    <div className={`flex -space-x-2 ${className}`} role="group" aria-label="Agent status">
      {/* Developer Avatar */}
      <div 
        className={getAvatarClasses('developer', developer.status)}
        aria-label={`Claude Developer - ${developer.status}`}
        title={`Developer Agent (${developer.status})`}
      >
        <Bot className="w-4 h-4 text-white" aria-hidden="true" />
        {developer.status === 'thinking' && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
            aria-label="Thinking indicator"
          />
        )}
      </div>

      {/* Auditor Avatar */}
      <div 
        className={getAvatarClasses('auditor', auditor.status)}
        aria-label={`Claude Auditor - ${auditor.status}`}
        title={`Auditor Agent (${auditor.status})`}
      >
        <Bot className="w-4 h-4 text-white" aria-hidden="true" />
        {auditor.status === 'thinking' && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
            aria-label="Thinking indicator"
          />
        )}
      </div>
    </div>
  );
}