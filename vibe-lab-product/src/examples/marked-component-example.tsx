// @vibe-lab/core - Main onboarding interface component
// This is the primary user-facing onboarding experience

'use client';

import React, { useState, useEffect } from 'react';
import { DualClaudeChat } from '@/components/DualClaudeChat';

// @vibe-lab/build:start
import { logicMonitor } from '@/lib/monitoring/logic-monitor';
// @vibe-lab/build:end

// @vibe-lab/optional:start:github-integration
import { GitHubConnector } from '@/components/stage0/GitHubConnector';
// @vibe-lab/optional:end:github-integration

export function OnboardingPage() {
  const [messages, setMessages] = useState([]);
  const [currentStage, setCurrentStage] = useState('initial');

  // @vibe-lab/build:start
  // Development monitoring - track component renders
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logicMonitor.trackModule(
        'INTEGRATION',
        'ONBOARDING_UI',
        'component-render',
        { stage: currentStage },
        'Onboarding page rendered'
      );
    }
  }, [currentStage]);
  // @vibe-lab/build:end

  const handleMessage = async (message: string) => {
    // Core message handling logic
    const response = await fetch('/api/onboarding/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory: messages })
    });

    const data = await response.json();
    setMessages(prev => [...prev, { user: message, ai: data.response }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* @vibe-lab/core - Essential onboarding header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Vibe Lab
          </h1>
          <p className="text-gray-600 mt-2">
            Let's build your application together
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Core chat interface */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">AI Assistant</h2>
            <DualClaudeChat 
              messages={messages} 
              onMessage={handleMessage}
              stage={currentStage}
            />
          </div>

          {/* Document preview pane */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
            {/* @vibe-lab/optional:start:github-integration */}
            {currentStage === 'github-import' && (
              <GitHubConnector onImport={handleGitHubImport} />
            )}
            {/* @vibe-lab/optional:end:github-integration */}
          </div>
        </div>

        {/* @vibe-lab/build:start */}
        {/* Development debugging panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-900 text-white rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">🔧 Development Panel</h3>
            <div className="text-xs">
              <p>Stage: {currentStage}</p>
              <p>Messages: {messages.length}</p>
              <p>Monitoring: Active</p>
            </div>
          </div>
        )}
        {/* @vibe-lab/build:end */}
      </div>
    </div>
  );
}