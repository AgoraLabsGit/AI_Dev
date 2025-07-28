'use client';

import { useEffect, useState, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import { 
  MessageSquare, 
  Terminal, 
  Search, 
  Navigation,
  Bot,
  Zap,
  FolderOpen,
  GitBranch,
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';

type TabType = 'chat' | 'commands' | 'search' | 'navigation';

interface Command {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  icon: any;
  category: string;
}

interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: any;
  description: string;
}

// Mock data for demonstration
const mockCommands: Command[] = [
  { id: '1', name: 'Create Component', description: 'Generate a new React component', shortcut: '⌘+G', icon: Zap, category: 'Generate' },
  { id: '2', name: 'Analyze Code', description: 'Run code analysis with dual-Claude', shortcut: '⌘+A', icon: Bot, category: 'AI' },
  { id: '3', name: 'Git Status', description: 'Check repository status', shortcut: '⌘+G', icon: GitBranch, category: 'Git' },
  { id: '4', name: 'Build Project', description: 'Start development build', shortcut: '⌘+B', icon: Settings, category: 'Build' },
];

const mockNavigation: NavigationItem[] = [
  { id: '1', name: 'Dashboard', path: '/dashboard', icon: FolderOpen, description: 'Project overview and management' },
  { id: '2', name: 'Plan', path: '/plan', icon: Clock, description: 'Blueprint creation and roadmap' },
  { id: '3', name: 'Build', path: '/build', icon: Terminal, description: 'Task management and development' },
  { id: '4', name: 'Test', path: '/test', icon: CheckCircle, description: 'Quality assurance and validation' },
  { id: '5', name: 'Visualize', path: '/visualize', icon: Zap, description: 'Code preview and deployment' },
];

const mockConversation = [
  { agent: 'user', message: 'Generate a login button component for me.' },
  { agent: 'developer', message: 'Of course. Here is a basic implementation of a React component for a login button.' },
  { agent: 'auditor', message: 'Security Review: The generated component is safe, but consider adding rate-limiting to the login endpoint it calls.' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      setIsOpen((prev) => !prev);
      setQuery('');
      setSelectedIndex(0);
    }
    
    if (isOpen) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        const tabs: TabType[] = ['chat', 'commands', 'search', 'navigation'];
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
        setSelectedIndex(0);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const items = getCurrentTabItems();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const items = getCurrentTabItems();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleItemSelect();
      }
    }
  }, [isOpen, activeTab, selectedIndex, query]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const filterItems = (items: any[], query: string) => {
    if (!query) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getCurrentTabItems = () => {
    switch (activeTab) {
      case 'commands':
        return filterItems(mockCommands, query);
      case 'navigation':
        return filterItems(mockNavigation, query);
      case 'search':
        return []; // Search results would go here
      case 'chat':
      default:
        return []; // Chat doesn't have selectable items
    }
  };

  const handleItemSelect = () => {
    const items = getCurrentTabItems();
    if (items.length === 0) return;
    
    const selectedItem = items[selectedIndex];
    if (!selectedItem) return;

    if (activeTab === 'navigation') {
      // Navigate to the selected page
      window.location.href = selectedItem.path;
      setIsOpen(false);
    } else if (activeTab === 'commands') {
      // Execute the selected command
      console.log('Executing command:', selectedItem.name);
      setIsOpen(false);
      // In the future, this will trigger actual command execution
    }
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
  ] as const;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16">
      <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl w-full max-w-3xl text-white shadow-2xl overflow-hidden">
        {/* Header with Tabs */}
        <div className="border-b border-[#2A2A2E]">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-white bg-[#1C1C1E]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#2A2A2E]">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={`${activeTab === 'chat' ? 'Ask the AI anything...' : 
              activeTab === 'commands' ? 'Search commands...' :
              activeTab === 'search' ? 'Search files and content...' :
              'Navigate to...'}`}
            className="w-full bg-[#0D0D0D] border border-[#2A2A2E] placeholder-gray-500 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Content Area */}
        <div className="h-96 overflow-y-auto">
          {activeTab === 'chat' && (
            <div className="p-4 space-y-4">
              {mockConversation.map((msg, index) => (
                <ChatMessage key={index} agent={msg.agent as any} message={msg.message} />
              ))}
              {query && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1C1C1E] border border-[#2A2A2E]">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">U</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">{query}</div>
                    <div className="text-xs text-gray-500 mt-1">Press Enter to send</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="p-2">
              {filterItems(mockCommands, query).map((command, index) => {
                const Icon = command.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={command.id}
                    onClick={() => {
                      setSelectedIndex(index);
                      handleItemSelect();
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-500/10 border border-blue-500/30 ring-1 ring-blue-500/20' 
                        : 'hover:bg-[#1A1A1A] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-300' : 'text-blue-400'}`} />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${isSelected ? 'text-blue-200' : 'text-white'}`}>
                        {command.name}
                      </div>
                      <div className="text-xs text-gray-400">{command.description}</div>
                    </div>
                    {command.shortcut && (
                      <div className="text-xs text-gray-500 bg-[#2A2A2E] px-2 py-1 rounded">
                        {command.shortcut}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 bg-[#2A2A2E] px-2 py-1 rounded">
                      {command.category}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="p-4">
              <div className="text-center text-gray-400 py-8">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <div className="text-sm">File and content search coming in P2.3</div>
                <div className="text-xs text-gray-500 mt-1">Blueprint Editor Integration</div>
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="p-2">
              {filterItems(mockNavigation, query).map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <a
                    key={item.id}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedIndex(index);
                      handleItemSelect();
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors block ${
                      isSelected 
                        ? 'bg-green-500/10 border border-green-500/30 ring-1 ring-green-500/20' 
                        : 'hover:bg-[#1A1A1A] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-green-300' : 'text-green-400'}`} />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${isSelected ? 'text-green-200' : 'text-white'}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                    <div className="text-xs text-gray-500">{item.path}</div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#2A2A2E] px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>⌘K to toggle</span>
              <span>Tab to switch tabs</span>
              <span>↑↓ to navigate</span>
              <span>Enter to select</span>
              <span>Esc to close</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span>Dual-Claude Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 