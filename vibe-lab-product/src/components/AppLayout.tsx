'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import CommandPalette from './CommandPalette';
import DualClaudeChat from './DualClaudeChat';
import HorizontalNav from './HorizontalNav';
import { 
  FolderOpen, 
  GitBranch, 
  Settings, 
  User, 
  Bot, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Activity,
  PanelLeftClose,
  PanelRightClose,
  Home,
  LayoutDashboard,
  FileText,
  GanttChart,
  Github,
  Play,
  Terminal,
  FileCode,
  FlaskConical,
  Ship,
  Wrench,
  Lightbulb,
  BookOpen,
  ChevronDown, ChevronRight,
  ClipboardList, Wrench as TechStackIcon, Files as PagesIcon,
  GitPullRequest, MessageSquare, StickyNote,
  Bug, TestTube2, BarChart, Server, KeyRound, Settings2
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

// New, hierarchical data structure for navigation
const navConfig = [
  {
    category: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    category: 'Plan',
    icon: FileText,
    href: '/plan/blueprints',
    items: [
      { href: '/plan/blueprints', label: 'Blueprints', icon: FileText },
      { href: '/plan/tech-stack', label: 'Tech Stack', icon: TechStackIcon },
      { href: '/plan/pages', label: 'Pages', icon: PagesIcon },
    ]
  },
  {
    category: 'Build',
    icon: GanttChart,
    href: '/build/roadmap',
    items: [
      { href: '/build/roadmap', label: 'Roadmap', icon: GanttChart },
      { href: '/build/tasklist', label: 'Tasklist', icon: ClipboardList },
      { href: '/build/logs', label: 'Logs', icon: Terminal },
      { href: '/build/push-to-github', label: 'Push to GitHub', icon: Github },
    ]
  },
  {
    category: 'Preview',
    icon: Play,
    href: '/preview',
    items: [
      { href: '/preview', label: 'Live Preview', icon: Play },
    ]
  },
  {
    category: 'Iterate',
    icon: Lightbulb,
    href: '/iterate/features',
    items: [
      { href: '/iterate/features', label: 'New Features', icon: Lightbulb },
      { href: '/iterate/notes', label: 'Notes', icon: StickyNote },
    ]
  },
  {
    category: 'Test',
    icon: FlaskConical,
    href: '/test/e2e',
    items: [
      { href: '/test/e2e', label: 'E2E', icon: Bug },
      { href: '/test/backend', label: 'Backend', icon: Server },
      { href: '/test/reports', label: 'Reports', icon: BarChart },
    ]
  },
  {
    category: 'Deploy',
    icon: Ship,
    href: '/deploy/vercel',
    items: [
      { href: '/deploy/vercel', label: 'Vercel', icon: Ship },
      { href: '/deploy/credentials', label: 'Credentials', icon: KeyRound },
    ]
  },
  {
    category: 'Codebase',
    icon: FileCode,
    href: '/codebase',
    items: [
      { href: '/codebase', label: 'Source Code', icon: FileCode },
    ]
  },
  {
    category: 'Settings',
    icon: Wrench,
    href: '/settings/ai',
    items: [
      { href: '/settings/ai', label: 'AI Settings', icon: Settings2 },
    ]
  }
];

// Agent status type for dual-Claude coordination
interface AgentStatus {
  id: 'developer' | 'auditor';
  name: string;
  status: 'active' | 'idle' | 'thinking' | 'blocked';
  currentTask?: string;
  lastActivity?: string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [selectedProject] = useState('Vibe Lab v1.0');

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    'Build': false,
    'Test': true,
    'Deploy': true
  });

  // Effect to set the active category based on the current URL
  useEffect(() => {
    const currentCategory = navConfig.find(group => 
      group.items.some(item => pathname.startsWith(item.href))
    )?.category;
    setActiveCategory(currentCategory || null);
  }, [pathname]);

  const toggleCategory = (category: string) => {
    // This function can now be simplified or removed if collapsing is no longer needed
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Mock dual-Claude agent status - will be real-time in production
  const [agentStatus] = useState<AgentStatus[]>([
    {
      id: 'developer',
      name: 'Claude Developer',
      status: 'active',
      currentTask: 'Implementing P1.2 Layout',
      lastActivity: '2 min ago'
    },
    {
      id: 'auditor',
      name: 'Claude Auditor',
      status: 'idle',
      currentTask: 'Ready for review',
      lastActivity: '5 min ago'
    }
  ]);

  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [chatPanelWidth, setChatPanelWidth] = useState(450);
  const isResizingChat = useRef(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  const isResizingSidebar = useRef(false);

  const handleChatMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingChat.current = true;
  };

  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingSidebar.current = true;
  };

  const handleMouseUp = useCallback(() => {
    isResizingChat.current = false;
    isResizingSidebar.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingChat.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 320 && newWidth < 960) {
        setChatPanelWidth(newWidth);
      }
    }
    if (isResizingSidebar.current) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 500) {
        setSidebarWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    setSidebarWidth(256);
  }, []);

  // Add and remove listeners correctly on the client-side
  useEffect(() => {
    const handleUp = () => handleMouseUp();
    const handleMove = (e: MouseEvent) => handleMouseMove(e);

    window.addEventListener('mouseup', handleUp);
    window.addEventListener('mousemove', handleMove);

    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mousemove', handleMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  const activeGroup = navConfig.find(group => group.category === activeCategory) || null;

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'thinking': return 'text-yellow-400 bg-yellow-400/10';
      case 'blocked': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return <Zap className="w-3 h-3" />;
      case 'thinking': return <Clock className="w-3 h-3" />;
      case 'blocked': return <AlertCircle className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  return (
    <>
      <CommandPalette />
      <div className="flex h-screen bg-[#0D0D0D] text-white">
        {/* Column 1: Resizable Main Navigation (Fixed) */}
        <aside 
          className={`relative flex-shrink-0 bg-[#161618] border-r border-[#2A2A2E] flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-12' : 'w-64'}`}
          style={sidebarWidth ? { width: isSidebarCollapsed ? '48px' : `${sidebarWidth}px` } : {}}
        >
           {/* Collapse/Expand Button */}
           <div className={`absolute top-2 z-10 ${isSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-2'}`}>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <PanelRightClose className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <>
              {/* Resizer Handle */}
              <div 
                className="w-1.5 cursor-col-resize absolute top-0 right-0 h-full bg-transparent hover:bg-blue-500/50 transition-colors duration-200"
                onMouseDown={handleSidebarMouseDown}
              />
              
              {/* Header */}
              <div className="p-4 border-b border-[#2A2A2E] mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="text-sm font-bold">VL</span>
                  </div>
                  <span className="font-semibold text-lg">Vibe Lab</span>
                </div>
                
                {/* Project Selector */}
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-400">Current Project</div>
                  <a href="/projects" className="text-sm text-blue-400 hover:underline">All Projects</a>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-[#1C1C1E] border border-[#2A2A2E] hover:border-[#404040] transition-colors cursor-pointer">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium truncate">{selectedProject}</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navConfig.map((group) => {
                  const isActive = activeCategory === group.category;
                  
                  return (
                    <div key={group.category}>
                      <a
                        href={group.href}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-[#1C1C1E] transition-colors group ${isActive ? 'bg-[#1C1C1E] text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        <div className="flex items-center gap-3">
                          <group.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                          <span className="font-medium">{group.category}</span>
                        </div>
                      </a>
                    </div>
                  );
                })}
              </nav>

              {/* Agent Status Panel */}
              <div className="p-4 border-t border-[#2A2A2E]">
                <div className="text-xs text-gray-400 mb-3 font-medium">AI AGENTS</div>
                <div className="space-y-3">
                  {agentStatus.map((agent) => (
                    <div key={agent.id} className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${getStatusColor(agent.status)}`}>
                        {getStatusIcon(agent.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Bot className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-200">{agent.name}</span>
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-1">
                          {agent.currentTask}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {agent.lastActivity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Profile */}
              <div className="p-4 border-t border-[#2A2A2E]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Developer</div>
                    <div className="text-xs text-gray-400">Free Plan</div>
                  </div>
                  <Settings className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Main Content and Chat Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Column 2: Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                <HorizontalNav activeGroup={activeGroup} />
                {children}
            </div>
          </main>

          {/* Column 3: Resizable Chat Panel */}
          <aside 
            className={`relative flex-shrink-0 bg-[#161618] border-l border-[#2A2A2E] flex flex-col transition-all duration-300 ${isChatCollapsed ? 'w-12' : ''}`}
            style={{ width: isChatCollapsed ? '48px' : `${chatPanelWidth}px` }}
          >
            {/* Collapse/Expand Button */}
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                title={isChatCollapsed ? 'Expand Chat' : 'Collapse Chat'}
              >
                {isChatCollapsed ? <PanelLeftClose className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Resizer Handle */}
            {!isChatCollapsed && (
              <div 
                className="w-1.5 cursor-col-resize absolute top-0 left-0 h-full bg-transparent hover:bg-blue-500/50 transition-colors duration-200"
                onMouseDown={handleChatMouseDown}
              />
            )}

            {/* Chat Content */}
            {!isChatCollapsed && (
              <div className="flex-1 flex flex-col min-h-0">
                <DualClaudeChat />
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
} 