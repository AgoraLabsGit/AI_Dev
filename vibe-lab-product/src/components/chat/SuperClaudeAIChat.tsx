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
  User,
  Crown,
  Shield,
  Code,
  Layers,
  Target,
  BookOpen,
  Wrench,
  GitBranch,
  Users,
  FileText,
  Star,
  HelpCircle,
  Search,
  ClipboardCheck
} from 'lucide-react';
import { featureFlags, useFeatureFlag } from '@/lib/config/feature-flags';

interface Message {
  id: string;
  role: 'user' | 'developer' | 'auditor' | 'assistant';
  content: string;
  timestamp: string;
  tokenUsage?: number;
  cost?: number;
  confidence?: number;
  persona?: SuperClaudePersona;
  superClaudeUsed?: boolean;
  reasoning?: string;
}

type SuperClaudePersona = 
  | 'architect' | 'frontend' | 'backend' | 'security' | 'performance'
  | 'analyzer' | 'qa' | 'refactorer' | 'mentor' | 'scribe' | 'devops';

interface PersonaInfo {
  id: SuperClaudePersona;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  specialties: string[];
}

const SUPERCLAUDE_PERSONAS: Record<SuperClaudePersona, PersonaInfo> = {
  architect: {
    id: 'architect',
    name: 'Architect',
    description: 'System design and long-term architecture planning',
    icon: Layers,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    specialties: ['System Design', 'Scalability', 'Architecture Patterns']
  },
  frontend: {
    id: 'frontend',
    name: 'Frontend',
    description: 'UI/UX development and React components',
    icon: Code,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    specialties: ['React', 'UI Components', 'Accessibility']
  },
  backend: {
    id: 'backend',
    name: 'Backend',
    description: 'Server-side development and API design',
    icon: GitBranch,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20',
    specialties: ['APIs', 'Databases', 'Security']
  },
  security: {
    id: 'security',
    name: 'Security',
    description: 'Security analysis and vulnerability assessment',
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
    specialties: ['Vulnerability Analysis', 'Threat Modeling', 'Compliance']
  },
  performance: {
    id: 'performance',
    name: 'Performance',
    description: 'Optimization and bottleneck elimination',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
    specialties: ['Optimization', 'Benchmarking', 'Monitoring']
  },
  analyzer: {
    id: 'analyzer',
    name: 'Analyzer',
    description: 'Root cause analysis and investigation',
    icon: Target,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    specialties: ['Debugging', 'Root Cause Analysis', 'Investigation']
  },
  qa: {
    id: 'qa',
    name: 'QA',
    description: 'Quality assurance and testing',
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    specialties: ['Testing', 'Quality Gates', 'Validation']
  },
  refactorer: {
    id: 'refactorer',
    name: 'Refactorer',
    description: 'Code quality improvement and technical debt',
    icon: Wrench,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    specialties: ['Code Quality', 'Refactoring', 'Technical Debt']
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Knowledge transfer and guidance',
    icon: BookOpen,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    specialties: ['Learning', 'Best Practices', 'Guidance']
  },
  scribe: {
    id: 'scribe',
    name: 'Scribe',
    description: 'Documentation and technical writing',
    icon: FileText,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10 border-slate-500/20',
    specialties: ['Documentation', 'Technical Writing', 'Guides']
  },
  devops: {
    id: 'devops',
    name: 'DevOps',
    description: 'Infrastructure and deployment automation',
    icon: Users,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    specialties: ['Infrastructure', 'CI/CD', 'Monitoring']
  }
};

interface SuperClaudeAIChatProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  width?: number;
}

export default function SuperClaudeAIChat({ isCollapsed, onToggleCollapse, width }: SuperClaudeAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [currentPersona, setCurrentPersona] = useState<SuperClaudePersona>('frontend');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Feature flags
  const useSuperClaude = useFeatureFlag('useSuperClaude');
  const showPersonaInfo = useFeatureFlag('showPersonaInfo');
  const showSuperClaudeIndicators = useFeatureFlag('showSuperClaudeIndicators');
  const enhancedResponseFormatting = useFeatureFlag('enhancedResponseFormatting');
  const personaAvatars = useFeatureFlag('personaAvatars');
  const enablePerformanceMonitoring = useFeatureFlag('enablePerformanceMonitoring');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectPersonaFromMessage = (message: string): SuperClaudePersona => {
    const messageLower = message.toLowerCase();
    
    // Security context
    if (messageLower.includes('security') || messageLower.includes('vulnerability') || 
        messageLower.includes('auth') || messageLower.includes('encryption')) {
      return 'security';
    }
    
    // Performance context
    if (messageLower.includes('performance') || messageLower.includes('optimize') || 
        messageLower.includes('slow') || messageLower.includes('bottleneck')) {
      return 'performance';
    }
    
    // Backend context
    if (messageLower.includes('api') || messageLower.includes('database') || 
        messageLower.includes('server') || messageLower.includes('backend')) {
      return 'backend';
    }
    
    // Architecture context
    if (messageLower.includes('architecture') || messageLower.includes('system') || 
        messageLower.includes('design') || messageLower.includes('plan')) {
      return 'architect';
    }
    
    // QA context
    if (messageLower.includes('test') || messageLower.includes('quality') || 
        messageLower.includes('review') || messageLower.includes('audit')) {
      return 'qa';
    }
    
    // Documentation context
    if (messageLower.includes('document') || messageLower.includes('write') || 
        messageLower.includes('guide') || messageLower.includes('explain')) {
      return 'scribe';
    }
    
    // DevOps context
    if (messageLower.includes('deploy') || messageLower.includes('infrastructure') || 
        messageLower.includes('ci/cd') || messageLower.includes('docker')) {
      return 'devops';
    }
    
    // Default to frontend for UI/component work
    return 'frontend';
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
    const originalInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Detect appropriate persona
    const detectedPersona = detectPersonaFromMessage(originalInput);
    setCurrentPersona(detectedPersona);

    try {
      let response;
      
      if (useSuperClaude) {
        // Use SuperClaude API endpoints based on message type
        let endpoint = '/api/chat/process'; // Default endpoint
        
        if (originalInput.toLowerCase().includes('plan') || originalInput.toLowerCase().includes('architecture')) {
          endpoint = '/api/plan';
        } else if (originalInput.toLowerCase().includes('review') || originalInput.toLowerCase().includes('audit')) {
          endpoint = '/api/review';
        } else if (originalInput.toLowerCase().includes('help') || originalInput.toLowerCase().includes('guide')) {
          endpoint = '/api/help';
        }

        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: originalInput,
            context: `Previous messages: ${messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}`,
            metadata: {
              detectedPersona,
              timestamp: new Date().toISOString(),
              sessionContext: 'chat'
            }
          })
        });

        const data = await response.json();
        
        if (data.success) {
          const aiMessage: Message = {
            id: `msg_${Date.now() + 1}`,
            role: 'assistant',
            content: data.data.plan || data.data.review || data.data.guidance || data.data.response || 'Response received',
            timestamp: new Date().toISOString(),
            tokenUsage: data.data.metadata?.tokensUsed || 0,
            cost: data.data.metadata?.cost || 0,
            confidence: data.data.metadata?.confidence || 0.9,
            persona: data.data.persona || detectedPersona,
            superClaudeUsed: data.data.superClaudeUsed || true,
            reasoning: data.data.reasoning || `Routed to ${detectedPersona} persona`
          };

          setMessages(prev => [...prev, aiMessage]);
          setSessionCost(prev => prev + (aiMessage.cost || 0));
          setSessionTokens(prev => prev + (aiMessage.tokenUsage || 0));
        } else {
          throw new Error(data.error || 'API request failed');
        }
      } else {
        // Fallback to mock response
        const mockResponses = [
          `I'll help you with that! Based on your request, I'm using my ${SUPERCLAUDE_PERSONAS[detectedPersona].name.toLowerCase()} expertise to provide the best guidance.`,
          `Great question! As your ${SUPERCLAUDE_PERSONAS[detectedPersona].name} assistant, I can help you with ${SUPERCLAUDE_PERSONAS[detectedPersona].specialties.join(', ').toLowerCase()}.`,
          `I understand you need help with this topic. Let me apply my ${SUPERCLAUDE_PERSONAS[detectedPersona].name.toLowerCase()} knowledge to give you a comprehensive answer.`
        ];

        const aiMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
          timestamp: new Date().toISOString(),
          tokenUsage: Math.floor(Math.random() * 100) + 50,
          cost: Math.random() * 0.02 + 0.005,
          confidence: 0.85 + Math.random() * 0.1,
          persona: detectedPersona,
          superClaudeUsed: false,
          reasoning: `Persona detected based on message content analysis`
        };

        setMessages(prev => [...prev, aiMessage]);
        setSessionCost(prev => prev + aiMessage.cost!);
        setSessionTokens(prev => prev + aiMessage.tokenUsage!);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        persona: detectedPersona,
        superClaudeUsed: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick Action handlers for new endpoints
  const handleQuickAction = async (action: 'plan' | 'review' | 'help', prompt?: string) => {
    const actionPrompts = {
      plan: prompt || "I need help with strategic planning and system architecture. Please provide guidance on best practices and design patterns.",
      review: prompt || "Please review my current approach and provide quality feedback with improvement suggestions.",
      help: prompt || "I need guidance and documentation about development best practices. Can you help me understand key concepts?"
    };

    const selectedPrompt = actionPrompts[action];
    
    // Set the input to the action prompt
    setInputValue(selectedPrompt);
    
    // Auto-detect and set persona based on action
    const actionPersonas = {
      plan: 'architect' as SuperClaudePersona,
      review: 'qa' as SuperClaudePersona,
      help: 'mentor' as SuperClaudePersona
    };
    
    setCurrentPersona(actionPersonas[action]);
    
    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: selectedPrompt,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const endpoint = `/api/${action}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: selectedPrompt,
          context: `Quick action: ${action}. Previous messages: ${messages.slice(-2).map(m => `${m.role}: ${m.content}`).join('\n')}`,
          metadata: {
            quickAction: action,
            persona: actionPersonas[action],
            timestamp: new Date().toISOString(),
            sessionContext: 'quick-action'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const responseContent = data.data.plan || data.data.review || data.data.guidance || data.data.response || 'Quick action completed';
        
        const aiMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
          tokenUsage: data.data.metadata?.tokensUsed || 0,
          cost: data.data.metadata?.cost || 0,
          confidence: data.data.metadata?.confidence || 0.95,
          persona: data.data.persona || actionPersonas[action],
          superClaudeUsed: data.data.superClaudeUsed || true,
          reasoning: data.data.reasoning || `${action.charAt(0).toUpperCase() + action.slice(1)} quick action executed`
        };

        setMessages(prev => [...prev, aiMessage]);
        setSessionCost(prev => prev + (aiMessage.cost || 0));
        setSessionTokens(prev => prev + (aiMessage.tokenUsage || 0));
      } else {
        throw new Error(data.error || `${action} quick action failed`);
      }
    } catch (error) {
      console.error(`Quick action ${action} error:`, error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `I apologize, but I encountered an error with the ${action} action. Please try again or contact support if the issue persists.`,
        timestamp: new Date().toISOString(),
        persona: actionPersonas[action],
        superClaudeUsed: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getPersonaIcon = (persona?: SuperClaudePersona) => {
    if (!persona) return <Bot className="w-4 h-4 text-gray-400" />;
    const PersonaIcon = SUPERCLAUDE_PERSONAS[persona].icon;
    return <PersonaIcon className={`w-4 h-4 ${SUPERCLAUDE_PERSONAS[persona].color}`} />;
  };

  const getPersonaColor = (persona?: SuperClaudePersona) => {
    if (!persona) return 'text-gray-400';
    return SUPERCLAUDE_PERSONAS[persona].color;
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[#161618] border-l border-[#2A2A2E] flex flex-col">
        <div className="p-2">
          <button 
            onClick={onToggleCollapse}
            className="p-2 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors w-full relative"
            title="Expand SuperClaude Chat"
          >
            <MessageSquare className="w-5 h-5" />
            {showSuperClaudeIndicators && useSuperClaude && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            )}
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
            <h3 className="font-semibold text-white">
              {showSuperClaudeIndicators && useSuperClaude ? (
                <div className="flex items-center gap-2">
                  SuperClaude Chat
                  <Crown className="w-4 h-4 text-purple-400" />
                </div>
              ) : (
                'AI Chat'
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {showSuperClaudeIndicators && (
              <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                useSuperClaude 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {useSuperClaude ? 'Enhanced' : 'Standard'}
              </div>
            )}
            <button 
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              title="Collapse Chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Persona Display */}
        {showPersonaInfo && useSuperClaude && (
          <div className={`p-3 rounded-lg border mb-3 ${SUPERCLAUDE_PERSONAS[currentPersona].bgColor}`}>
            <div className="flex items-center gap-3">
              {personaAvatars && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  {getPersonaIcon(currentPersona)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${SUPERCLAUDE_PERSONAS[currentPersona].color}`}>
                    {SUPERCLAUDE_PERSONAS[currentPersona].name}
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {SUPERCLAUDE_PERSONAS[currentPersona].description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {SUPERCLAUDE_PERSONAS[currentPersona].specialties.slice(0, 2).map((specialty) => (
                    <span 
                      key={specialty}
                      className="px-2 py-0.5 bg-gray-700/50 text-xs text-gray-300 rounded-md"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Monitoring */}
        {enablePerformanceMonitoring && (
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
                <span className="text-gray-400">Mode:</span>
                <span className={useSuperClaude ? 'text-purple-400' : 'text-blue-400'}>
                  {useSuperClaude ? 'SuperClaude' : 'Standard'}
                </span>
              </div>
            </div>

            {useSuperClaude && (
              <div className="mt-2 p-2 bg-purple-500/5 border border-purple-500/20 rounded-md">
                <div className="flex items-center gap-2">
                  <Crown className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-400">Enhanced AI active</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {useSuperClaude ? (
                <Crown className="w-8 h-8 text-white" />
              ) : (
                <Bot className="w-8 h-8 text-white" />
              )}
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              {useSuperClaude ? 'SuperClaude Ready' : 'AI Assistant Ready'}
            </h4>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              {useSuperClaude 
                ? 'Enhanced AI with specialized personas ready to assist with architecture, development, security, and more.'
                : 'AI assistant ready to help with your development questions.'
              }
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role !== 'user' && (
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.persona && personaAvatars
                    ? 'bg-gradient-to-br from-gray-600 to-gray-800'
                    : 'bg-gray-600'
                }`}>
                  {message.persona ? getPersonaIcon(message.persona) : <Bot className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
              <div className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : enhancedResponseFormatting && message.persona
                    ? `${SUPERCLAUDE_PERSONAS[message.persona].bgColor} text-gray-100`
                    : 'bg-[#1A1A1C] border border-[#2A2A2E] text-gray-100'
              }`}>
                {message.role !== 'user' && showPersonaInfo && message.persona && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${getPersonaColor(message.persona)}`}>
                      {SUPERCLAUDE_PERSONAS[message.persona].name}
                    </span>
                    {message.confidence && (
                      <span className="text-xs text-gray-400">
                        {Math.round(message.confidence * 100)}%
                      </span>
                    )}
                    {message.superClaudeUsed && showSuperClaudeIndicators && (
                      <Crown className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                )}
                
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.reasoning && showPersonaInfo && (
                  <div className="mt-2 pt-2 border-t border-gray-600/50">
                    <p className="text-xs text-gray-400 italic">{message.reasoning}</p>
                  </div>
                )}
                
                {message.role !== 'user' && enablePerformanceMonitoring && (message.tokenUsage || message.cost) && (
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                {getPersonaIcon(currentPersona)}
              </div>
            </div>
            <div className={`rounded-lg p-3 ${
              enhancedResponseFormatting 
                ? `${SUPERCLAUDE_PERSONAS[currentPersona].bgColor}`
                : 'bg-[#1A1A1C] border border-[#2A2A2E]'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-gray-400">
                    {SUPERCLAUDE_PERSONAS[currentPersona].name} is thinking...
                  </span>
                  {useSuperClaude && showSuperClaudeIndicators && (
                    <Crown className="w-3 h-3 text-purple-400" />
                  )}
                </div>
                
                {useSuperClaude && (
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Enhanced AI processing may take 8-15 seconds</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#2A2A2E]">
        {/* Quick Action Buttons */}
        {useSuperClaude && messages.length === 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Quick Actions</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickAction('plan')}
                disabled={isTyping}
                className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="font-medium text-sm">Plan</span>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-gray-300">
                  Strategic planning & architecture
                </p>
              </button>
              
              <button
                onClick={() => handleQuickAction('review')}
                disabled={isTyping}
                className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardCheck className="w-4 h-4" />
                  <span className="font-medium text-sm">Review</span>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-gray-300">
                  Code review & quality check
                </p>
              </button>
              
              <button
                onClick={() => handleQuickAction('help')}
                disabled={isTyping}
                className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">Help</span>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-gray-300">
                  Guidance & documentation
                </p>
              </button>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Or type your own message below to get started
              </p>
            </div>
          </div>
        )}

        {/* Persona Preview */}
        {inputValue && showPersonaInfo && useSuperClaude && (
          <div className="mb-3 p-2 bg-[#0F0F11] rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400">Will route to:</span>
                <span className={getPersonaColor(detectPersonaFromMessage(inputValue))}>
                  {SUPERCLAUDE_PERSONAS[detectPersonaFromMessage(inputValue)].name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400">SuperClaude</span>
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
              placeholder={useSuperClaude 
                ? "Ask about architecture, security, performance, or any development topic..."
                : "Ask about your development needs..."
              }
              className="w-full px-3 py-2 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              rows={inputValue.split('\n').length}
              maxLength={1000}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {inputValue.length}/1000
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              useSuperClaude
                ? 'bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600'
            } disabled:cursor-not-allowed text-white`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          {useSuperClaude 
            ? '11 specialized AI personas • Enhanced reasoning • Shift+Enter for new line'
            : 'AI assistant ready • Shift+Enter for new line'
          }
        </div>
      </div>
    </div>
  );
}