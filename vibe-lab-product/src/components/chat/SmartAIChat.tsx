'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  Zap, 
  DollarSign, 
  Clock,
  Settings,
  Minimize2,
  Maximize2,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Activity,
  Sparkles,
  User
} from 'lucide-react';
import { mockChatMessages } from '../../lib/mock-data/navigation-mocks';

interface Message {
  id: string;
  role: 'user' | 'developer' | 'auditor';
  content: string;
  timestamp: string;
  tokenUsage?: number;
  cost?: number;
  confidence?: number;
}

interface AIAgent {
  id: 'developer' | 'auditor';
  name: string;
  status: 'active' | 'idle' | 'thinking';
  confidence: number;
  costPerMessage: number;
  description: string;
}

const aiAgents: AIAgent[] = [
  {
    id: 'developer',
    name: 'Claude Developer',
    status: 'active',
    confidence: 0.94,
    costPerMessage: 0.021,
    description: 'Primary development assistance and code generation'
  },
  {
    id: 'auditor',
    name: 'Claude Auditor',
    status: 'idle',
    confidence: 0.87,
    costPerMessage: 0.035,
    description: 'Code review, security analysis, and quality assurance'
  }
];

interface SmartAIChatProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  width?: number;
}

export default function SmartAIChat({ isCollapsed, onToggleCollapse, width }: SmartAIChatProps) {
  const [messages, setMessages] = useState<Message[]>(mockChatMessages as Message[]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'developer' | 'auditor'>('developer');
  const [sessionCost, setSessionCost] = useState(0.067);
  const [sessionTokens, setSessionTokens] = useState(468);
  const [costOptimizationEnabled, setCostOptimizationEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const estimateMessageCost = (message: string): { tokens: number; cost: number; agent: 'developer' | 'auditor' } => {
    const tokens = Math.ceil(message.length / 4); // Rough token estimation
    
    // Smart routing logic - determine best agent
    const keywords = message.toLowerCase();
    let recommendedAgent: 'developer' | 'auditor' = 'developer';
    
    if (keywords.includes('review') || keywords.includes('security') || keywords.includes('audit') || 
        keywords.includes('best practice') || keywords.includes('vulnerability')) {
      recommendedAgent = 'auditor';
    }

    const agent = aiAgents.find(a => a.id === recommendedAgent)!;
    const cost = (tokens / 1000) * (agent.costPerMessage * 1000 / 150); // Rough cost calculation
    
    return { tokens, cost, agent: recommendedAgent };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Estimate cost and determine agent
    const { tokens, cost, agent } = estimateMessageCost(inputValue);
    setActiveAgent(agent);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `I'll help you with that! Based on the navigation system we're building, here are the key considerations...`,
        `Looking at your 224-component system, I recommend implementing the enhanced navigation patterns we discussed.`,
        `For the Stage 0 Import workflow, the GitHub integration should handle repository analysis automatically.`,
        `The cost optimization in your chat interface is working well - you're saving approximately 75% compared to dual-AI always-active mode.`
      ];

      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: agent,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        tokenUsage: tokens + Math.floor(Math.random() * 50),
        cost: cost + Math.random() * 0.01,
        confidence: aiAgents.find(a => a.id === agent)?.confidence
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionCost(prev => prev + aiMessage.cost!);
      setSessionTokens(prev => prev + aiMessage.tokenUsage!);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentIcon = (role: string) => {
    switch (role) {
      case 'developer': return <Bot className="w-4 h-4 text-blue-400" />;
      case 'auditor': return <Bot className="w-4 h-4 text-purple-400" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAgentColor = (role: string) => {
    switch (role) {
      case 'developer': return 'text-blue-400';
      case 'auditor': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[#161618] border-l border-[#2A2A2E] flex flex-col">
        <div className="p-2">
          <button 
            onClick={onToggleCollapse}
            className="p-2 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors w-full"
            title="Expand Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-[#161618] border-l border-[#2A2A2E] flex flex-col"
      style={{ width: width || 450 }}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-[#2A2A2E]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Smart AI Chat</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCostOptimizationEnabled(!costOptimizationEnabled)}
              className={`p-1.5 rounded-md transition-colors ${
                costOptimizationEnabled 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
              }`}
              title={`Cost Optimization ${costOptimizationEnabled ? 'Enabled' : 'Disabled'}`}
            >
              <TrendingDown className="w-4 h-4" />
            </button>
            <button 
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              title="Collapse Chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Agent Status */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {aiAgents.map((agent) => {
            const isActive = activeAgent === agent.id;
            return (
              <div
                key={agent.id}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  isActive 
                    ? 'border-blue-500/50 bg-blue-500/10' 
                    : 'border-[#2A2A2E] bg-[#1A1A1C]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bot className={`w-3 h-3 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {agent.name.split(' ')[1]}
                  </span>
                  {isActive && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(agent.confidence * 100)}% confidence
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost Monitoring */}
        <div className="bg-[#0F0F11] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Session Cost</span>
            </div>
            <span className="text-sm font-bold text-green-400">${sessionCost.toFixed(3)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Tokens:</span>
              <span className="text-white">{sessionTokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Savings:</span>
              <span className="text-green-400">75%</span>
            </div>
          </div>

          {costOptimizationEnabled && (
            <div className="mt-2 p-2 bg-green-500/5 border border-green-500/20 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Smart routing active</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role !== 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {getAgentIcon(message.role)}
                </div>
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
              <div className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-[#1A1A1C] border border-[#2A2A2E] text-gray-100'
              }`}>
                {message.role !== 'user' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${getAgentColor(message.role)}`}>
                      {aiAgents.find(a => a.id === message.role)?.name || 'AI Assistant'}
                    </span>
                    {message.confidence && (
                      <span className="text-xs text-gray-400">
                        {Math.round(message.confidence * 100)}%
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.role !== 'user' && (message.tokenUsage || message.cost) && (
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
                    {message.tokenUsage && (
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>{message.tokenUsage} tokens</span>
                      </div>
                    )}
                    {message.cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>${message.cost.toFixed(3)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                {getAgentIcon(activeAgent)}
              </div>
            </div>
            <div className="bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-sm text-gray-400">
                  {aiAgents.find(a => a.id === activeAgent)?.name} is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#2A2A2E]">
        {/* Cost Preview */}
        {inputValue && (
          <div className="mb-3 p-2 bg-[#0F0F11] rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400">Will route to:</span>
                <span className={getAgentColor(estimateMessageCost(inputValue).agent)}>
                  {aiAgents.find(a => a.id === estimateMessageCost(inputValue).agent)?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Est. cost:</span>
                <span className="text-green-400">${estimateMessageCost(inputValue).cost.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about navigation, components, or Stage 0 import..."
              className="w-full px-3 py-2 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              rows={inputValue.split('\n').length}
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {inputValue.length}/500
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Smart routing saves ~75% on AI costs • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}