'use client';

import { useState } from 'react';
import { 
  Eye, 
  Check, 
  X, 
  Menu, 
  Monitor, 
  Smartphone, 
  Tablet,
  ChevronRight,
  TestTube
} from 'lucide-react';

export default function NavigationTest() {
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentContext, setCurrentContext] = useState<'home' | 'project'>('home');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const testCases = [
    {
      id: 'main-sidebar',
      name: 'Main Sidebar',
      description: 'Left sidebar with menu switcher and navigation',
      contexts: ['home', 'project'],
      viewports: ['desktop', 'tablet']
    },
    {
      id: 'enhanced-horizontal-nav',
      name: 'Enhanced Horizontal Nav',
      description: 'Top navigation with AVCA stages and component counters',
      contexts: ['project'],
      viewports: ['desktop', 'tablet']
    },
    {
      id: 'responsive-mobile-header',
      name: 'Mobile Header',
      description: 'Mobile header with hamburger menu and search',
      contexts: ['home', 'project'],
      viewports: ['mobile']
    },
    {
      id: 'mobile-menu-overlay',
      name: 'Mobile Menu Overlay',
      description: 'Slide-out mobile menu with navigation items',
      contexts: ['home', 'project'],
      viewports: ['mobile']
    },
    {
      id: 'mobile-bottom-nav',
      name: 'Mobile Bottom Navigation',
      description: 'Bottom navigation bar for primary actions',
      contexts: ['project'],
      viewports: ['mobile']
    },
    {
      id: 'menu-switcher',
      name: 'Menu Switcher',
      description: 'Toggle between Main Menu and Code Directory',
      contexts: ['home', 'project'],
      viewports: ['desktop', 'tablet']
    },
    {
      id: 'github-connector',
      name: 'GitHub Connector',
      description: 'Stage 0 Import GitHub repository browser',
      contexts: ['project'],
      viewports: ['desktop', 'tablet', 'mobile']
    },
    {
      id: 'smart-ai-chat',
      name: 'Smart AI Chat',
      description: 'Cost-optimized AI chat with dual agents',
      contexts: ['home', 'project'],
      viewports: ['desktop', 'tablet']
    }
  ];

  const getViewportIcon = (viewport: string) => {
    switch (viewport) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getViewportClasses = () => {
    switch (viewportSize) {
      case 'mobile': return 'max-w-sm mx-auto border-2 border-gray-600 rounded-lg overflow-hidden';
      case 'tablet': return 'max-w-3xl mx-auto border-2 border-gray-600 rounded-lg overflow-hidden';
      default: return 'w-full';
    }
  };

  const toggleTestResult = (testId: string) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const getPassedTests = () => Object.values(testResults).filter(Boolean).length;
  const getTotalTests = () => testCases.filter(test => 
    test.contexts.includes(currentContext) && 
    test.viewports.includes(viewportSize)
  ).length;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Test Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Navigation System Test</h1>
              <p className="text-gray-400">Test all navigation components with mock data</p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Viewport Size Selector */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Viewport Size</label>
                <div className="flex gap-2">
                  {['desktop', 'tablet', 'mobile'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setViewportSize(size as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        viewportSize === size 
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                          : 'border-[#2A2A2E] bg-[#0F0F11] text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {getViewportIcon(size)}
                      <span className="capitalize">{size}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Selector */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Context</label>
                <div className="flex gap-2">
                  {['home', 'project'].map((context) => (
                    <button
                      key={context}
                      onClick={() => setCurrentContext(context as any)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        currentContext === context 
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                          : 'border-[#2A2A2E] bg-[#0F0F11] text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      <span className="capitalize">{context}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Progress */}
            <div className="mt-6 p-4 bg-[#0F0F11] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Test Progress</span>
                <span className="text-sm text-gray-400">{getPassedTests()} / {getTotalTests()} tests passed</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getTotalTests() > 0 ? (getPassedTests() / getTotalTests()) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Checklist */}
          <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Checklist</h2>
            <div className="space-y-3">
              {testCases
                .filter(test => 
                  test.contexts.includes(currentContext) && 
                  test.viewports.includes(viewportSize)
                )
                .map((test) => (
                <div key={test.id} className="flex items-start gap-3 p-3 bg-[#0F0F11] rounded-lg">
                  <button
                    onClick={() => toggleTestResult(test.id)}
                    className={`mt-0.5 p-1 rounded border-2 transition-colors ${
                      testResults[test.id] 
                        ? 'border-green-500 bg-green-500/10 text-green-400' 
                        : 'border-gray-500 bg-transparent text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {testResults[test.id] ? <Check className="w-3 h-3" /> : <div className="w-3 h-3" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">{test.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{test.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Context:</span>
                      <span className="text-xs text-blue-400 capitalize">{currentContext}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">Viewport:</span>
                      <span className="text-xs text-purple-400 capitalize">{viewportSize}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Instructions */}
          <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Instructions</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Visual Inspection</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Check component visibility and layout</li>
                  <li>• Verify responsive behavior at different screen sizes</li>
                  <li>• Test interactive elements (buttons, dropdowns, etc.)</li>
                  <li>• Validate context switching (home ↔ project)</li>
                </ul>
              </div>

              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Mock Data Validation</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Verify mock projects appear in navigation</li>
                  <li>• Check AI agent status indicators</li>
                  <li>• Test 224-component counters</li>
                  <li>• Validate cost optimization metrics</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Menu className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Interactive Testing</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Toggle menu switcher (Main Menu ↔ Code Directory)</li>
                  <li>• Open/close mobile menu overlay</li>
                  <li>• Test GitHub repository selection</li>
                  <li>• Verify Smart AI Chat functionality</li>
                </ul>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="mt-6 space-y-2">
              <div className="text-sm font-medium text-white mb-2">Quick Navigation:</div>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0F0F11] border border-[#2A2A2E] rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Home (Main Context)
                </a>
                <a
                  href="/project/proj_001/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0F0F11] border border-[#2A2A2E] rounded-lg hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Project Dashboard
                </a>
                <a
                  href="/project/proj_001/import"
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#0F0F11] border border-[#2A2A2E] rounded-lg hover:border-green-500/50 hover:bg-green-500/5 transition-colors"
                >
                  <ChevronRight className="w-3 h-3" />
                  Stage 0 Import
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Summary */}
        {getTotalTests() > 0 && (
          <div className="mt-8 bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Results Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#0F0F11] rounded-lg">
                <div className="text-2xl font-bold text-green-400">{getPassedTests()}</div>
                <div className="text-sm text-gray-400">Tests Passed</div>
              </div>
              <div className="text-center p-4 bg-[#0F0F11] rounded-lg">
                <div className="text-2xl font-bold text-red-400">{getTotalTests() - getPassedTests()}</div>
                <div className="text-sm text-gray-400">Tests Failed</div>
              </div>
              <div className="text-center p-4 bg-[#0F0F11] rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{getTotalTests()}</div>
                <div className="text-sm text-gray-400">Total Tests</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}