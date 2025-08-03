'use client';

import { useState, useEffect } from 'react';
import { Bot, ArrowRight, Beaker, FlaskConical, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { QuickActionBar, QuickAction } from '@/components/chat/QuickActionButton';
import { formatTime, safeToISOString } from '@/utils/date';
import LiveDocumentPreview from '@/components/onboarding/LiveDocumentPreview';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { VibeLabLogo } from '@/components/ui/vibe-lab-logo';

export default function EnhancedOnboardingPage() {
  const [projectName, setProjectName] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [hasEnoughInfo, setHasEnoughInfo] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>({});
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [uploadType, setUploadType] = useState<'github' | 'code' | 'docs' | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  
  // Zustand store for document sections
  const {
    overviewSections,
    specsSections,
    isGeneratingDocument,
    currentGeneratingDocument,
    generateDocumentSection,
    updateDocumentSection,
    approveDocumentSection,
    regenerateDocumentSection,
    expandDocumentSection,
  } = useOnboardingStore();

  type MessageType = {
    id: string;
    content: string;
    sender: 'assistant' | 'user';
    timestamp: Date;
    quickActions?: QuickAction[];
  };

  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      content: "Welcome to Vibe Lab! In just a few minutes, I'll help you create a Project Overview that captures your vision and Build Specifications that show exactly how to build it. You can start fresh or import from GitHub, upload existing code, or bring in documentation. What are you envisioning?",
      sender: 'assistant',
      timestamp: new Date(),
      quickActions: [] // Will be populated after component initialization
    }
  ]);

  // Initialize quick actions after component mounts
  useEffect(() => {
    setMessages(prev => prev.map(msg => 
      msg.id === '1' ? {
        ...msg,
        quickActions: [
                  {
          id: 'fresh-start',
          label: 'New Project',
          type: 'primary' as const,
          action: () => handleQuickAction({ id: 'fresh-start', label: 'New Project' }),
          metadata: {
            icon: 'Sparkles',
            description: 'Start from scratch with AI guidance'
          }
        },
        {
          id: 'github-import',
          label: 'GitHub Import',
          type: 'secondary' as const,
          action: () => handleQuickAction({ id: 'github-import', label: 'GitHub Import' }),
          metadata: {
            icon: 'GitBranch',
            description: 'Import existing repository'
          }
        },
        {
          id: 'code-upload',
          label: 'Upload Code',
          type: 'secondary' as const,
          action: () => handleQuickAction({ id: 'code-upload', label: 'Upload Code' }),
          metadata: {
            icon: 'Upload',
            description: 'Upload local codebase'
          }
        },
        {
          id: 'docs-import',
          label: 'Import Docs',
          type: 'secondary' as const,
          action: () => handleQuickAction({ id: 'docs-import', label: 'Import Docs' }),
          metadata: {
            icon: 'FileText',
            description: 'Import from documentation'
          }
        }
        ]
      } : msg
    ));
  }, []);

  const handleQuickAction = async (action: any) => {
    console.log('Quick action clicked:', action);
    
    switch (action.id) {
      case 'fresh-start':
        // Clear upload state when returning to fresh start
        setShowUploadInput(false);
        setUploadType(null);
        setGithubUrl('');
        setUploadFiles([]);
        
        const message = "I want to start a fresh project with AI guidance";
        setChatMessage(message);
        await handleSendMessage();
        break;
      
      case 'github-import':
        // Clear other upload states
        setUploadFiles([]);
        setUploadType('github');
        setShowUploadInput(true);
        setChatMessage('');
        break;
      
      case 'code-upload':
        // Clear other upload states
        setGithubUrl('');
        setUploadType('code');
        setShowUploadInput(true);
        setChatMessage('');
        break;
      
      case 'docs-import':
        // Clear other upload states  
        setGithubUrl('');
        setUploadFiles([]);
        setUploadType('docs');
        setShowUploadInput(true);
        setChatMessage('');
        break;
      
      default:
        // Clear upload state for any other action
        setShowUploadInput(false);
        setUploadType(null);
        setGithubUrl('');
        setUploadFiles([]);
        
        const defaultMessage = action.label || "I want to continue with my project";
        setChatMessage(defaultMessage);
        await handleSendMessage();
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: chatMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatMessage('');

    // Show typing indicator
    const typingMessage = {
      id: 'typing',
      content: '...',
      sender: 'assistant' as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage,
          projectName,
          conversationHistory: messages.filter(m => m.id !== 'typing').map(m => ({
            role: m.sender === 'assistant' ? 'assistant' : 'user',
            content: m.content,
            timestamp: safeToISOString(m.timestamp)
          })),
          context: {
            stage: 'initial',
            extractedInfo: {}
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process message');
      }

      const data = await response.json();
      
      // Check if we have enough info to switch to split-screen
      if (data.extractedInfo && Object.keys(data.extractedInfo).length > 1) {
        setHasEnoughInfo(true);
        setExtractedInfo(data.extractedInfo);
        
        // Start generating the first document section
        setTimeout(() => {
          generateDocumentSection('overview', 'description');
        }, 1000);
      }
      
      // Convert quick actions
      const quickActions: QuickAction[] = (data.quickActions || []).map((action: any) => ({
        ...action,
        action: () => handleQuickAction(action)
      }));
      
      const aiResponse = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'assistant' as const,
        timestamp: new Date(),
        quickActions
      };
      
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(aiResponse));
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat({
        id: Date.now().toString(),
        content: "I apologize, but I'm having trouble processing your message right now. Please try again.",
        sender: 'assistant' as const,
        timestamp: new Date()
      }));
    }
  };

  // Single Panel Layout (Initial)
  if (!hasEnoughInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-white">
        {/* Persistent Header Bar */}
        <div className="flex-shrink-0 bg-[#0A0A0B] border-b border-[#1F1F23]">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <VibeLabLogo size={36} />
            </div>
            
            {/* Right: User Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => signOut({ callbackUrl: '/sign-in' })}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-[#6B7280] hover:text-white transition-colors rounded-lg hover:bg-[#1A1A1C]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col px-4 py-8">
          <div className="max-w-4xl mx-auto w-full space-y-8">

          {/* Project Name Field */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., My Awesome Project"
              className={cn(
                "w-full px-4 py-3 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg",
                "text-white placeholder-[#6B7280]",
                "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]",
                "transition-colors duration-200"
              )}
            />
          </div>

          {/* Chat Interface */}
          <div data-testid="onboarding-chat" className="bg-[#111113] rounded-lg border border-[#1F1F23] flex flex-col h-[600px] w-full">
            {/* Chat Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-[#1F1F23]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Project Set-Up</h3>
                  <p className="text-xs text-[#6B7280]">Phase 1: Foundation & Context</p>
                </div>
              </div>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex space-x-3",
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    message.sender === 'user' ? 'bg-[#374151]' : 'bg-[#2563EB]'
                  )}>
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className={cn(
                    "flex-1 max-w-[85%]",
                    message.sender === 'user' ? 'flex flex-col items-end' : ''
                  )}>
                    <div className={cn(
                      "px-3 py-2 rounded-lg text-sm",
                      message.sender === 'user'
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#1A1A1C] text-[#E5E7EB] border border-[#2F2F33]'
                    )}>
                      {message.content}
                    </div>
                    
                    {/* Quick Actions */}
                    {message.quickActions && message.quickActions.length > 0 && (
                      <div className="mt-2">
                        <QuickActionBar 
                          actions={message.quickActions}
                          onActionClick={handleQuickAction}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Input */}
            {showUploadInput && (
              <div className="flex-shrink-0 p-4 border-t border-[#1F1F23]">
                <div className="space-y-3">
                  {uploadType === 'github' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">GitHub Repository URL</label>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username/repository"
                          className={cn(
                            "flex-1 px-3 py-2 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg",
                            "text-white placeholder-[#6B7280] text-sm",
                            "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]"
                          )}
                        />
                        <button
                          data-testid="github-import-button"
                          onClick={() => {
                            if (githubUrl.trim()) {
                              setChatMessage(`Import GitHub repository: ${githubUrl}`);
                              setShowUploadInput(false);
                              setUploadType(null);
                              setGithubUrl('');
                              handleSendMessage();
                            }
                          }}
                          disabled={!githubUrl.trim()}
                          className={cn(
                            "px-4 py-2 rounded-lg transition-colors",
                            githubUrl.trim()
                              ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                              : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                          )}
                        >
                          Import
                        </button>
                        <button
                          onClick={() => {
                            setShowUploadInput(false);
                            setUploadType(null);
                            setGithubUrl('');
                          }}
                          className="px-4 py-2 rounded-lg bg-[#374151] text-[#6B7280] hover:bg-[#4B5563] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {uploadType === 'code' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Upload Code Files</label>
                      <div className="flex space-x-2">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setUploadFiles(files);
                          }}
                          className="flex-1 px-3 py-2 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg text-white text-sm"
                        />
                        <button
                          data-testid="code-upload-button"
                          onClick={() => {
                            if (uploadFiles.length > 0) {
                              setChatMessage(`Upload ${uploadFiles.length} code files`);
                              setShowUploadInput(false);
                              setUploadType(null);
                              setUploadFiles([]);
                              handleSendMessage();
                            }
                          }}
                          disabled={uploadFiles.length === 0}
                          className={cn(
                            "px-4 py-2 rounded-lg transition-colors",
                            uploadFiles.length > 0
                              ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                              : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                          )}
                        >
                          Upload
                        </button>
                        <button
                          onClick={() => {
                            setShowUploadInput(false);
                            setUploadType(null);
                            setUploadFiles([]);
                          }}
                          className="px-4 py-2 rounded-lg bg-[#374151] text-[#6B7280] hover:bg-[#4B5563] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {uploadType === 'docs' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Import Documentation</label>
                      <div className="flex space-x-2">
                        <input
                          type="file"
                          multiple
                          accept=".md,.txt,.pdf,.doc,.docx"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setUploadFiles(files);
                          }}
                          className="flex-1 px-3 py-2 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg text-white text-sm"
                        />
                        <button
                          data-testid="docs-import-button"
                          onClick={() => {
                            if (uploadFiles.length > 0) {
                              setChatMessage(`Import ${uploadFiles.length} documentation files`);
                              setShowUploadInput(false);
                              setUploadType(null);
                              setUploadFiles([]);
                              handleSendMessage();
                            }
                          }}
                          disabled={uploadFiles.length === 0}
                          className={cn(
                            "px-4 py-2 rounded-lg transition-colors",
                            uploadFiles.length > 0
                              ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                              : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                          )}
                        >
                          Import
                        </button>
                        <button
                          onClick={() => {
                            setShowUploadInput(false);
                            setUploadType(null);
                            setUploadFiles([]);
                          }}
                          className="px-4 py-2 rounded-lg bg-[#374151] text-[#6B7280] hover:bg-[#4B5563] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat Input */}
            {!showUploadInput && (
              <div className="flex-shrink-0 p-4 border-t border-[#1F1F23]">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder=""
                    className={cn(
                      "flex-1 px-3 py-2 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg",
                      "text-white placeholder-[#6B7280] text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]"
                    )}
                  />
                  <button
                    data-testid="send-message-button"
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className={cn(
                      "px-3 py-2 rounded-lg transition-colors",
                      chatMessage.trim()
                        ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                        : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                    )}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Split Panel Layout (After enough info gathered)
  return (
    <div className="h-screen bg-[#0A0A0B] text-white flex">
      {/* Left: LiveDocumentPreview (40%) */}
      <LiveDocumentPreview
        documentType="overview"
        sections={overviewSections}
        isGenerating={isGeneratingDocument && currentGeneratingDocument === 'overview'}
        onSectionApprove={(sectionId) => approveDocumentSection('overview', sectionId)}
        onSectionRegenerate={(sectionId, feedback) => regenerateDocumentSection('overview', sectionId, feedback)}
        onSectionEdit={(sectionId, content) => updateDocumentSection('overview', sectionId, content)}
        onSectionExpand={(sectionId) => expandDocumentSection('overview', sectionId)}
        className="w-[40%]"
      />

      {/* Right: Chat (60%) */}
      <div className="w-[60%] flex flex-col">
        <div className="flex-shrink-0 px-6 py-4 border-b border-[#1F1F23]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-light">Continue Building Your Project</h1>
              <p className="text-[#6B7280] text-sm mt-1">Keep chatting to refine your project details</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs text-[#6B7280] hover:text-white transition-colors rounded-lg hover:bg-[#1A1A1C]"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.slice(-4).map((message) => (
            <div key={message.id} className="bg-[#1A1B1E] rounded-lg border border-[#2F2F33] p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  message.sender === 'assistant' ? 'bg-[#8B5CF6]' : 'bg-[#374151]'
                )}>
                  {message.sender === 'assistant' ? (
                    <Beaker className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-white font-medium">
                  {message.sender === 'assistant' ? 'AI Assistant' : 'You'}
                </span>
              </div>
              <p className="text-[#E5E7EB] text-sm">{message.content}</p>
              
              {message.quickActions && message.quickActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#2F2F33]">
                  <QuickActionBar 
                    actions={message.quickActions}
                    onActionClick={handleQuickAction}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

          {/* Upload Input */}
          {showUploadInput && (
            <div className="flex-shrink-0 px-6 py-4 border-t border-[#1F1F23]">
            <div className="space-y-3">
              {uploadType === 'github' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">GitHub Repository URL</label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className={cn(
                        "flex-1 px-4 py-3 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg",
                        "text-white placeholder-[#6B7280] text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]"
                      )}
                    />
                    <button
                      onClick={() => {
                        if (githubUrl.trim()) {
                          setChatMessage(`Import GitHub repository: ${githubUrl}`);
                          setShowUploadInput(false);
                          setUploadType(null);
                          setGithubUrl('');
                          handleSendMessage();
                        }
                      }}
                      disabled={!githubUrl.trim()}
                      className={cn(
                        "px-4 py-3 rounded-lg transition-colors",
                        githubUrl.trim()
                          ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                          : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                      )}
                    >
                      Import
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadInput(false);
                        setUploadType(null);
                        setGithubUrl('');
                      }}
                      className="px-4 py-3 rounded-lg bg-[#374151] text-[#6B7280] hover:bg-[#4B5563] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {uploadType === 'code' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Upload Code Files</label>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setUploadFiles(files);
                      }}
                      className="flex-1 px-4 py-3 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        if (uploadFiles.length > 0) {
                          setChatMessage(`Upload ${uploadFiles.length} code files`);
                          setShowUploadInput(false);
                          setUploadType(null);
                          setUploadFiles([]);
                          handleSendMessage();
                        }
                      }}
                      disabled={uploadFiles.length === 0}
                      className={cn(
                        "px-4 py-3 rounded-lg transition-colors",
                        uploadFiles.length > 0
                          ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                          : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                      )}
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadInput(false);
                        setUploadType(null);
                        setUploadFiles([]);
                      }}
                      className="px-4 py-3 rounded-lg bg-[#374151] text-[#6B7280] hover:bg-[#4B5563] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {uploadType === 'docs' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Import Documentation</label>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      multiple
                      accept=".md,.txt,.pdf,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setUploadFiles(files);
                      }}
                      className="flex-1 px-4 py-3 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        if (uploadFiles.length > 0) {
                          setChatMessage(`Import ${uploadFiles.length} documentation files`);
                          setShowUploadInput(false);
                          setUploadType(null);
                          setUploadFiles([]);
                          handleSendMessage();
                        }
                      }}
                      disabled={uploadFiles.length === 0}
                      className={cn(
                        "px-4 py-3 rounded-lg transition-colors",
                        uploadFiles.length > 0
                          ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                          : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                      )}
                    >
                      Import
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadInput(false);
                        setUploadType(null);
                        setUploadFiles([]);
                      }}
                      className="px-4 py-3 rounded-lg bg-[#374151] text-[#6B7280] hover:bg-[#4B5563] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

          {/* Chat Input */}
          {!showUploadInput && (
            <div className="flex-shrink-0 px-6 py-4 border-t border-[#1F1F23]">
            <div className="flex space-x-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder=""
                className={cn(
                  "flex-1 px-4 py-3 bg-[#1A1A1C] border border-[#2F2F33] rounded-lg",
                  "text-white placeholder-[#6B7280] text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]"
                )}
              />
              <button
                data-testid="send-message-button"
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className={cn(
                  "px-4 py-3 rounded-lg transition-colors",
                  chatMessage.trim()
                    ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                    : "bg-[#374151] text-[#6B7280] cursor-not-allowed"
                )}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}