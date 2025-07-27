'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Send, Sparkles, Bot, RotateCcw, Copy, Check } from 'lucide-react';

interface Message {
  id: string;
  agent: 'user' | 'developer' | 'auditor';
  message: string;
  timestamp: string;
  status?: 'thinking' | 'complete' | 'error';
}

export default function DualClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      agent: 'developer',
      message: '👋 Hello! I\'m **Claude Developer**. I\'m here to help you build your project efficiently and follow best practices. What would you like to create today?',
      timestamp: '2 min ago',
      status: 'complete'
    },
    {
      id: '2',
      agent: 'auditor',
      message: '🔍 I\'m **Claude Auditor**. I\'ll review all code for security vulnerabilities, performance optimization, and industry best practices. Let\'s build something production-ready together!',
      timestamp: '2 min ago',
      status: 'complete'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<'developer' | 'auditor' | null>(null);
  const [agentActivity, setAgentActivity] = useState({
    developer: { status: 'idle' as 'active' | 'thinking' | 'idle', lastSeen: '2 min ago' },
    auditor: { status: 'idle' as 'active' | 'thinking' | 'idle', lastSeen: '2 min ago' }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      agent: 'user',
      message: input,
      timestamp: 'Just now',
      status: 'complete'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setActiveAgent('developer');
    
    // Update agent activity
    setAgentActivity(prev => ({
      ...prev,
      developer: { status: 'thinking', lastSeen: 'now' }
    }));

    // Simulate developer response
    setTimeout(() => {
      const developerMessage: Message = {
        id: (Date.now() + 1).toString(),
        agent: 'developer',
        message: `🚀 I'll help you implement that efficiently. Here's my approach:\n\n\`\`\`typescript\n// Clean, type-safe implementation\nconst ${input.toLowerCase().includes('component') ? 'YourComponent' : 'solution'} = () => {\n  // Following React best practices\n  return (\n    <div className="implementation">\n      {/* Your implementation here */}\n    </div>\n  );\n};\n\nexport default ${input.toLowerCase().includes('component') ? 'YourComponent' : 'solution'};\n\`\`\`\n\n✅ **Key Features:**\n- TypeScript types for safety\n- Clean component structure\n- Performance optimized\n- Accessible by default`,
        timestamp: 'Just now',
        status: 'thinking'
      };
      
      setMessages(prev => [...prev, developerMessage]);
      setActiveAgent('auditor');
      setAgentActivity(prev => ({
        ...prev,
        developer: { status: 'active', lastSeen: 'now' },
        auditor: { status: 'thinking', lastSeen: 'now' }
      }));
      
      // Simulate thinking time
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === developerMessage.id 
              ? { ...msg, status: 'complete' as const }
              : msg
          )
        );
        
        // Auditor response
        setTimeout(() => {
          const auditorMessage: Message = {
            id: (Date.now() + 2).toString(),
            agent: 'auditor',
            message: '🔍 **Security & Quality Review Complete**\n\n✅ **Approved** - The implementation follows security best practices\n\n**Recommendations:**\n• Add error boundaries for production resilience\n• Consider memoization for performance optimization\n• Implement proper loading states\n• Add comprehensive TypeScript interfaces\n\n🛡️ **Security Score:** 9.2/10\n⚡ **Performance Score:** 8.8/10',
            timestamp: 'Just now',
            status: 'complete'
          };
          
          setMessages(prev => [...prev, auditorMessage]);
          setIsThinking(false);
          setActiveAgent(null);
          setAgentActivity(prev => ({
            ...prev,
            auditor: { status: 'idle', lastSeen: 'now' }
          }));
        }, 1500);
      }, 2000);
    }, 800);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        agent: 'developer',
        message: 'Chat cleared. How can I help you with your next task?',
        timestamp: 'Just now',
        status: 'complete'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2E]">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#161618] relative ${
              agentActivity.developer.status === 'thinking' ? 'bg-emerald-400' : 
              agentActivity.developer.status === 'active' ? 'bg-emerald-500' : 'bg-emerald-600'
            }`}>
              <Bot className="w-4 h-4 text-white" />
              {agentActivity.developer.status === 'thinking' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#161618] relative ${
              agentActivity.auditor.status === 'thinking' ? 'bg-purple-400' : 
              agentActivity.auditor.status === 'active' ? 'bg-purple-500' : 'bg-purple-600'
            }`}>
              <Bot className="w-4 h-4 text-white" />
              {agentActivity.auditor.status === 'thinking' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Dual-Claude Chat</h3>
            <p className="text-xs text-gray-400">
              {activeAgent === 'developer' ? '🚀 Developer thinking...' :
               activeAgent === 'auditor' ? '🔍 Auditor reviewing...' :
               'Developer + Auditor Mode'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">
            {isThinking ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Ready
              </span>
            )}
          </div>
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-[#1C1C1E] transition-colors text-gray-400 hover:text-white"
            title="Clear chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="group relative">
            <ChatMessage
              agent={message.agent}
              message={message.message}
              status={message.status}
              timestamp={message.timestamp}
            />
            {message.agent !== 'user' && (
              <button
                onClick={() => copyMessage(message.id, message.message)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-[#1C1C1E] border border-[#2A2A2E] opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy message"
              >
                {copiedId === message.id ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            )}
          </div>
        ))}
        
        {/* Typing Indicators */}
        {activeAgent && (
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              activeAgent === 'developer' ? 'bg-emerald-500' : 'bg-purple-500'
            }`}>
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-200">
                  {activeAgent === 'developer' ? 'Claude Developer' : 'Claude Auditor'}
                </span>
                <span className="text-xs text-gray-500">is typing...</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2A2A2E]">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isThinking ? "Claude is thinking..." : "Ask anything..."}
              disabled={isThinking}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2E] rounded-lg px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {isThinking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>Shift+Enter for new line</span>
          <span>•</span>
          <span>Dual-Claude analyzes & validates in real-time</span>
        </div>
      </div>
    </div>
  );
}