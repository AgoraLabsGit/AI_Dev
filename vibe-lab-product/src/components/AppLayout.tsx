'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import CommandPalette from './CommandPalette';
import DualClaudeChat from './DualClaudeChat';
import HorizontalNav from './HorizontalNav';
import MainSidebar from './navigation/MainSidebar';
import EnhancedHorizontalNav from './navigation/EnhancedHorizontalNav';
import ResponsiveNavigation from './navigation/ResponsiveNavigation';
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

  // Determine if we're in project context
  const isProjectContext = pathname.startsWith('/project/');
  const projectIdMatch = pathname.match(/\/project\/([^\/]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : undefined;

  return (
    <>
      <CommandPalette />
      <ResponsiveNavigation 
        isProjectContext={isProjectContext}
        projectId={projectId}
      />
      <div className="flex h-screen bg-[#0D0D0D] text-white">
        {/* Column 1: Enhanced Main Navigation */}
        <MainSidebar 
          isCollapsed={isSidebarCollapsed}
          onCollapse={setIsSidebarCollapsed}
          width={sidebarWidth || undefined}
          onWidthChange={setSidebarWidth}
        />

        {/* Main Content and Chat Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Column 2: Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
                <EnhancedHorizontalNav projectId="proj_001" />
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