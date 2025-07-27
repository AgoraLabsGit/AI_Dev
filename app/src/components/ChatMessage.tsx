'use client';

import { Bot, User, Shield, Sparkles, Code2, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  agent: 'user' | 'developer' | 'auditor';
  message: string;
  status?: 'thinking' | 'complete' | 'error';
  timestamp?: string;
}

const agentConfig = {
  user: {
    name: 'You',
    icon: User,
    color: 'bg-blue-500',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-100',
    align: 'ml-auto',
    bgPattern: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
  },
  developer: {
    name: 'Claude Developer',
    icon: Code2,
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-100',
    align: 'mr-auto',
    bgPattern: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10',
  },
  auditor: {
    name: 'Claude Auditor',
    icon: Shield,
    color: 'bg-purple-500',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-100',
    align: 'mr-auto',
    bgPattern: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10',
  },
};

export default function ChatMessage({ agent, message, status = 'complete', timestamp }: ChatMessageProps) {
  const config = agentConfig[agent];
  const Icon = config.icon;

  return (
    <div className={`flex ${agent === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[85%] ${config.align}`}>
        {/* Avatar */}
        {agent !== 'user' && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        
        {/* Message Container */}
        <div className="flex-1">
          {/* Agent Name & Status */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400">{config.name}</span>
            {status === 'thinking' && (
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                <span className="text-xs text-yellow-400">Thinking...</span>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">Error</span>
              </div>
            )}
            {timestamp && (
              <span className="text-xs text-gray-500 ml-auto">{timestamp}</span>
            )}
          </div>
          
          {/* Message Content */}
          <div className={`relative rounded-xl p-4 ${config.bgPattern} border ${config.borderColor} backdrop-blur-sm`}>
            {/* Code block detection - will enhance this later */}
            {message.includes('```') ? (
              <div className="space-y-2">
                {message.split('```').map((part, index) => (
                  index % 2 === 0 ? (
                    <p key={index} className="text-sm text-gray-200 leading-relaxed">{part}</p>
                  ) : (
                    <pre key={index} className="bg-[#0D0D0D] border border-[#2A2A2E] rounded-lg p-3 overflow-x-auto">
                      <code className="text-xs text-gray-300 font-mono">{part}</code>
                    </pre>
                  )
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{message}</p>
            )}
            
            {/* Dual-Claude Indicator for AI messages */}
            {agent !== 'user' && (
              <div className="absolute -top-2 -right-2">
                <Bot className={`w-4 h-4 ${config.textColor} ${config.color} rounded-full p-0.5`} />
              </div>
            )}
          </div>
        </div>
        
        {/* User Avatar */}
        {agent === 'user' && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
} 