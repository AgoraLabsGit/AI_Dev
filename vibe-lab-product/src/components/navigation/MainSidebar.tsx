'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  FolderOpen, 
  Settings, 
  User, 
  PanelLeftClose,
  PanelRightClose,
  Search,
  ArrowLeft
} from 'lucide-react';
import MenuSwitcher from './MenuSwitcher';
import { NavigationMode } from './types';
import { navConfig } from '@/config/navigation';

interface MainSidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  width?: number;
  onWidthChange?: (width: number) => void;
}

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

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-[#0A0A0B] border-r border-[#1F1F23] flex flex-col">
        <div className="p-2">
          <button 
            onClick={() => onCollapse(false)}
            className={cn(
              "p-2 rounded-lg w-full",
              "text-[#9CA3AF] hover:text-white",
              "hover:bg-[#1A1A1C]",
              "transition-colors"
            )}
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
      className="bg-[#0A0A0B] border-r border-[#1F1F23] flex flex-col transition-all duration-200"
      style={{ width: width || 320 }}
    >
      {/* Header */}
      <div className="p-3 border-b border-[#1F1F23]">
        {/* Logo and Collapse */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <img 
              src="/assets/brand/largeLogo.svg" 
              alt="Vibe Lab Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <button 
            onClick={() => onCollapse(true)}
            className={cn(
              "p-1.5 rounded-lg",
              "text-[#9CA3AF] hover:text-white",
              "hover:bg-[#1A1A1C]",
              "transition-colors"
            )}
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
              <div className="text-xs text-[#9CA3AF]">Current Project</div>
              <a 
                href="/"
                className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-white"
              >
                <ArrowLeft className="w-3 h-3" />
                All Projects
              </a>
            </div>
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              "bg-[#111113] border border-[#1F1F23]"
            )}>
              <FolderOpen className="w-4 h-4 text-[#9CA3AF]" />
              <span className="text-sm font-normal text-white truncate">
                {currentProject}
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2 text-sm",
                "bg-[#111113] border border-[#1F1F23]",
                "text-white placeholder-[#6B7280]",
                "rounded-lg",
                "focus:outline-none focus:border-[#374151]",
                "transition-colors"
              )}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationMode === 'main' && navConfig.map(item => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg",
                "transition-colors duration-200",
                isActive 
                  ? "text-white bg-[#1A1A1C]" 
                  : "text-[#9CA3AF] hover:text-white hover:bg-[#111113]"
              )}
              title={item.description}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "text-[#6B7280]"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-normal truncate">{item.label}</span>
                </div>
                {isActive && (
                  <div className="text-xs text-[#6B7280] mt-0.5 truncate">
                    {item.description}
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#1F1F23]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1C] flex items-center justify-center">
            <User className="w-5 h-5 text-[#9CA3AF]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-normal text-white">Developer</div>
            <div className="text-xs text-[#9CA3AF]">Free Plan</div>
          </div>
          <Settings className="w-5 h-5 text-[#9CA3AF] hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}