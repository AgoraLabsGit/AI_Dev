'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  Home,
  LayoutDashboard,
  FileText,
  GanttChart,
  GitBranch,
  Palette,
  Wrench,
  MessageSquare,
  ArrowLeft,
  Search,
  Import,
  FileCode2
} from 'lucide-react';
import MenuSwitcher from './MenuSwitcher';
import { NavigationMode } from './types';

interface MainSidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  width?: number;
  onWidthChange?: (width: number) => void;
}

// Enhanced navigation configuration with Stage 0 Import support
const homeNavConfig = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    description: 'All projects overview'
  }
];

const projectNavConfig = [
  {
    id: 'import',
    label: 'Import',
    icon: Import,
    href: '/project/[id]/import',
    description: 'Stage 0: Repository analysis and migration',
    badge: 'BETA'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/project/[id]/dashboard',
    description: 'Project overview and metrics'
  },
  {
    id: 'design',
    label: 'Design',
    icon: Palette,
    href: '/project/[id]/design',
    description: 'AVCA Stages 1-4: Visual creation workspace'
  },
  {
    id: 'build',
    label: 'Build',
    icon: Wrench,
    href: '/project/[id]/build',
    description: 'AVCA Stages 5-8: Development workspace'
  }
];

const globalActions = [
  {
    id: 'analytics',
    label: 'Analytics',
    icon: GanttChart,
    href: '/analytics',
    description: 'Global project analytics'
  },
  {
    id: 'team',
    label: 'Team',
    icon: User,
    href: '/team',
    description: 'Team collaboration'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    description: 'Account and preferences'
  }
];

// Mock agent status - will be real-time in production
interface AgentStatus {
  id: 'developer' | 'auditor';
  name: string;
  status: 'active' | 'idle' | 'thinking' | 'blocked';
  currentTask?: string;
  lastActivity?: string;
}

const mockAgentStatus: AgentStatus[] = [
  {
    id: 'developer',
    name: 'Claude Developer',
    status: 'active',
    currentTask: 'Analyzing navigation structure',
    lastActivity: '1 min ago'
  },
  {
    id: 'auditor',
    name: 'Claude Auditor',
    status: 'idle',
    currentTask: 'Ready for review',
    lastActivity: '3 min ago'
  }
];

export default function MainSidebar({ 
  isCollapsed, 
  onCollapse, 
  width, 
  onWidthChange 
}: MainSidebarProps) {
  const pathname = usePathname();
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('main');
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine if we're in a project context
  const isInProject = pathname.includes('/project/');
  const projectId = isInProject ? pathname.split('/')[2] : null;

  useEffect(() => {
    if (isInProject && projectId) {
      setCurrentProject(`Project ${projectId}`);
    } else {
      setCurrentProject(null);
    }
  }, [isInProject, projectId]);

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

  const renderNavItems = () => {
    const navItems = isInProject ? projectNavConfig : homeNavConfig;
    
    return navItems.map((item) => {
      const isActive = pathname === item.href.replace('[id]', projectId || '');
      const Icon = item.icon;
      
      return (
        <a
          key={item.id}
          href={item.href.replace('[id]', projectId || '')}
          className={`group flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
            isActive 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
          }`}
          title={item.description}
        >
          <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                  {item.badge}
                </span>
              )}
            </div>
            {isActive && (
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                {item.description}
              </div>
            )}
          </div>
        </a>
      );
    });
  };

  const renderGlobalActions = () => {
    if (isInProject) return null;
    
    return (
      <div className="border-t border-[#2A2A2E] pt-4">
        <div className="text-xs font-medium text-gray-400 mb-3 px-3">GLOBAL ACTIONS</div>
        <div className="space-y-1">
          {globalActions.map((action) => {
            const isActive = pathname === action.href;
            const Icon = action.icon;
            
            return (
              <a
                key={action.id}
                href={action.href}
                className={`group flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
                }`}
                title={action.description}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium">{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-[#161618] border-r border-[#2A2A2E] flex flex-col">
        <div className="p-2">
          <button 
            onClick={() => onCollapse(false)}
            className="p-2 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors w-full"
            title="Expand Sidebar"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className="bg-[#161618] border-r border-[#2A2A2E] flex flex-col transition-all duration-300"
      style={{ width: width || 320 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2E]">
        {/* Collapse Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-sm font-bold">VL</span>
            </div>
            <span className="font-semibold text-lg text-white">Vibe Lab</span>
          </div>
          <button 
            onClick={() => onCollapse(true)}
            className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Switcher */}
        <MenuSwitcher 
          mode={navigationMode}
          onModeChange={setNavigationMode}
        />

        {/* Project Context */}
        {isInProject && currentProject && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-400">Current Project</div>
              <a 
                href="/"
                className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
              >
                <ArrowLeft className="w-3 h-3" />
                All Projects
              </a>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-[#1C1C1E] border border-[#2A2A2E]">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white truncate">{currentProject}</span>
            </div>
          </div>
        )}

        {/* Search for 224-component system */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#1C1C1E] border border-[#2A2A2E] rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationMode === 'main' && renderNavItems()}
        {navigationMode === 'main' && renderGlobalActions()}
      </nav>

      {/* AI Agents Status */}
      <div className="p-4 border-t border-[#2A2A2E]">
        <div className="text-xs text-gray-400 mb-3 font-medium">AI AGENTS</div>
        <div className="space-y-3">
          {mockAgentStatus.map((agent) => (
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
            <div className="text-sm font-medium text-white">Developer</div>
            <div className="text-xs text-gray-400">Free Plan</div>
          </div>
          <Settings className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}