'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import CommandPalette from './CommandPalette';
import DualClaudeChat from './DualClaudeChat';
import MainSidebar from './navigation/MainSidebar';
import EnhancedHorizontalNav from './navigation/EnhancedHorizontalNav';
import ResponsiveNavigation from './navigation/ResponsiveNavigation';
import { 
  FolderOpen, 
  Settings, 
  User, 
  Bot, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  PanelLeftClose,
  PanelRightClose,
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
  ClipboardList,
  Files as PagesIcon,
  StickyNote,
  Bug, 
  Server, 
  BarChart, 
  KeyRound, 
  Settings2
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Navigation configuration
const navConfig = [
  {
    category: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  // ... rest of navConfig remains the same
];

// Agent status type
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
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [chatPanelWidth, setChatPanelWidth] = useState(450);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  
  const isResizingChat = useRef(false);
  const isResizingSidebar = useRef(false);

  // Effect to set active category
  useEffect(() => {
    const currentCategory = navConfig.find(group => 
      group.items.some(item => pathname.startsWith(item.href))
    )?.category;
    setActiveCategory(currentCategory || null);
  }, [pathname]);

  // Mouse handlers for resizing
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

  // Set initial sidebar width
  useEffect(() => {
    setSidebarWidth(256);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  // Project context
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
      <div className="flex h-screen bg-[#0A0A0B] text-[#FFFFFF]">
        {/* Main Sidebar - Strike style */}
        <MainSidebar 
          isCollapsed={isSidebarCollapsed}
          onCollapse={setIsSidebarCollapsed}
          width={sidebarWidth || undefined}
          onWidthChange={setSidebarWidth}
        />

        {/* Main Content and Chat Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
              <EnhancedHorizontalNav projectId={projectId} />
              {children}
            </div>
          </main>

          {/* Chat Panel - Strike style */}
          <aside 
            className={cn(
              "relative flex-shrink-0 bg-[#111113] border-l border-[#1F1F23]",
              "flex flex-col transition-all duration-200",
              isChatCollapsed ? 'w-12' : ''
            )}
            style={{ width: isChatCollapsed ? '48px' : `${chatPanelWidth}px` }}
          >
            {/* Collapse/Expand Button */}
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                className={cn(
                  "p-1.5 rounded-lg",
                  "text-[#9CA3AF] hover:text-white",
                  "hover:bg-[#1A1A1C]",
                  "transition-colors"
                )}
                title={isChatCollapsed ? 'Expand Chat' : 'Collapse Chat'}
              >
                {isChatCollapsed ? 
                  <PanelLeftClose className="w-5 h-5" /> : 
                  <PanelRightClose className="w-5 h-5" />
                }
              </button>
            </div>
            
            {/* Resizer Handle */}
            {!isChatCollapsed && (
              <div 
                className={cn(
                  "w-1.5 cursor-col-resize absolute top-0 left-0 h-full",
                  "bg-transparent hover:bg-[#374151]",
                  "transition-colors duration-200"
                )}
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