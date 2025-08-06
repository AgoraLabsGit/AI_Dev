'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import AppHeader from './ui/AppHeader';
import AgentAvatars from './ui/AgentAvatars';
import ActionButton from './ui/ActionButton';
import StatusIndicator from './ui/StatusIndicator';
import SuperClaudeAIChat from './chat/SuperClaudeAIChat';
import { useFeatureFlag } from '@/lib/config/feature-flags';
import { Send, Sparkles, Bot, RotateCcw, Copy, Check, Shield } from 'lucide-react';

interface Message {
  id: string;
  agent: 'user' | 'developer' | 'auditor';
  message: string;
  timestamp: string;
  status?: 'thinking' | 'complete' | 'error';
}

export default function DualClaudeChat() {
  const useSuperClaude = useFeatureFlag('useSuperClaude');
  
  // If SuperClaude is enabled, use the new component
  if (useSuperClaude) {
    return <SuperClaudeAIChat />;
  }
  
  // Otherwise, use legacy dual-chat with single AI approach
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      agent: 'developer',
      message: '👋 Hello! I\'m your **AI Assistant**. I\'ll adapt my expertise based on what you\'re working on - whether it\'s design, development, or quality assurance. What would you like to create today?',
      timestamp: '2 min ago',
      status: 'complete'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<'developer' | 'auditor' | null>(null);
  const [currentPersona, setCurrentPersona] = useState<'developer' | 'auditor'>('developer');
  const [agentActivity, setAgentActivity] = useState({
    developer: { status: 'idle' as 'active' | 'thinking' | 'idle', lastSeen: '2 min ago' }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect appropriate persona based on message content
  const detectPersona = (message: string): 'developer' | 'auditor' => {
    const msgLower = message.toLowerCase();
    
    // QA/Audit keywords trigger auditor
    if (msgLower.includes('review') || msgLower.includes('audit') || 
        msgLower.includes('security') || msgLower.includes('test') ||
        msgLower.includes('quality') || msgLower.includes('vulnerability')) {
      return 'auditor';
    }
    
    // Default to developer for building/creating
    return 'developer';
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      agent: 'user',
      message: input,
      timestamp: 'Just now',
      status: 'complete'
    };

    const userInput = input;
    const detectedPersona = detectPersona(userInput);
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setActiveAgent(detectedPersona);
    setCurrentPersona(detectedPersona);
    
    // Update agent activity
    setAgentActivity(prev => ({
      developer: { status: 'thinking', lastSeen: 'now' }
    }));

    try {
      // Get AI response using detected persona
      const aiResponse = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages
              .filter(msg => msg.agent === 'user' || msg.agent === 'developer' || msg.agent === 'auditor')
              .slice(-6) // Keep last 6 messages for context
              .map(msg => ({
                role: msg.agent === 'user' ? 'user' : 'assistant',
                content: msg.message
              })),
            // Always include the current user message
            {
              role: 'user',
              content: userInput
            }
          ],
          agent: detectedPersona,
          projectContext: {
            name: 'Vibe Lab Project',
            description: 'AI-powered development environment with intelligent persona routing',
            techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Anthropic Claude'],
            complexity: 0.7,
            phase: detectedPersona === 'auditor' ? 'qa' : 'development'
          }
        })
      });

      if (!aiResponse.ok) {
        throw new Error('AI API call failed');
      }

      const aiData = await aiResponse.json();
      
      if (!aiData.success) {
        // Handle insufficient credits gracefully
        if (aiData.error === 'INSUFFICIENT_CREDITS') {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            agent: detectedPersona,
            message: aiData.message.content,
            timestamp: 'Just now',
            status: 'complete'
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setIsThinking(false);
          setActiveAgent(null);
          setAgentActivity(prev => ({
            developer: { status: 'idle', lastSeen: 'now' }
          }));
          return;
        }
        throw new Error(aiData.error || 'AI response failed');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        agent: detectedPersona,
        message: aiData.message.content,
        timestamp: 'Just now',
        status: 'complete'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        agent: detectedPersona,
        message: '⚠️ I encountered an issue connecting to the AI service. Please check your API configuration and try again.',
        timestamp: 'Just now',
        status: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setActiveAgent(null);
      setAgentActivity(prev => ({
        developer: { status: 'idle', lastSeen: 'now' }
      }));
    }
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

  const callAuditor = async () => {
    if (isThinking || messages.length === 0) return;

    // Get the last few messages for context
    const recentMessages = messages.slice(-4);
    const lastUserMessage = recentMessages.findLast(msg => msg.agent === 'user');
    const lastAIMessage = recentMessages.findLast(msg => msg.agent === 'developer' || msg.agent === 'auditor');

    if (!lastUserMessage || !lastAIMessage) {
      alert('Need both user request and AI response to call auditor for review');
      return;
    }

    // Force auditor review by sending as auditor request
    const auditorPrompt = `Please review this development solution:

User Request: ${lastUserMessage.message}

AI Solution: ${lastAIMessage.message}

Provide your quality assurance review and recommendations.`;

    // Trigger a new message with auditor persona
    setInput(auditorPrompt);
    setCurrentPersona('auditor');
    
    // Let the regular handleSend process it
    setTimeout(() => {
      const syntheticEvent = new KeyboardEvent('keypress', { key: 'Enter' });
      handleSend();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        title="AI Assistant"
        subtitle={
          activeAgent === 'developer' ? '🚀 Development mode active...' :
          activeAgent === 'auditor' ? '🔍 Quality review mode active...' :
          `${currentPersona === 'developer' ? '🚀 Development' : '🔍 QA'} Assistant Ready`
        }
        startContent={
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${currentPersona === 'developer' ? 'bg-blue-400' : 'bg-purple-400'}`} />
            <span className="text-sm text-gray-400">
              {currentPersona === 'developer' ? 'Developer' : 'QA Auditor'} Mode
            </span>
          </div>
        }
        endContent={
          <>
            <StatusIndicator isThinking={isThinking} />
            <ActionButton
              onClick={callAuditor}
              disabled={isThinking || messages.length === 0}
              title="Request quality review of last response"
              size="md"
            >
              <Shield className="w-4 h-4" />
            </ActionButton>
            <ActionButton
              onClick={clearChat}
              title="Clear chat"
              size="md"
            >
              <RotateCcw className="w-4 h-4" />
            </ActionButton>
          </>
        }
      />

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
              activeAgent === 'developer' ? 'bg-blue-500' : 'bg-purple-500'
            }`}>
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-200">
                  AI Assistant ({activeAgent === 'developer' ? 'Developer' : 'QA Auditor'} mode)
                </span>
                <span className="text-xs text-gray-500">is thinking...</span>
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
          <span>Intelligent AI adapts to development and QA needs</span>
          <span>•</span>
          <span>Use Shield button for manual quality reviews</span>
        </div>
      </div>
    </div>
  );
}