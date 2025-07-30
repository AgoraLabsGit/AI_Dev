'use client';

import { usePathname } from 'next/navigation';
import { 
  Import, 
  LayoutDashboard, 
  Palette, 
  Wrench,
  FileText,
  Layers,
  Layout,
  Component,
  Sparkles,
  TestTube,
  Package,
  Eye,
  Rocket,
  ChevronDown,
  Badge,
  Search
} from 'lucide-react';
import { useState } from 'react';

interface SubNavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  description?: string;
  badge?: string;
  count?: number;
}

interface NavGroup {
  id: string;
  label: string;
  icon: any;
  href: string;
  description: string;
  items: SubNavItem[];
}

// Enhanced navigation configuration with Stage 0 and 224-component support
const navigationConfig: NavGroup[] = [
  {
    id: 'import',
    label: 'Import',
    icon: Import,
    href: '/project/[id]/import',
    description: 'Stage 0: Repository analysis and migration planning',
    items: [
      {
        id: 'repository',
        label: 'Repository',
        icon: Import,
        href: '/project/[id]/import/repository',
        description: 'Connect and analyze GitHub repository'
      },
      {
        id: 'analysis',
        label: 'Analysis',
        icon: Search,
        href: '/project/[id]/import/analysis',
        description: 'Codebase analysis and dependency mapping'
      },
      {
        id: 'migration',
        label: 'Migration Plan',
        icon: FileText,
        href: '/project/[id]/import/migration',
        description: 'Generate migration roadmap'
      }
    ]
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/project/[id]/dashboard',
    description: 'Project overview and intelligence',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        href: '/project/[id]/dashboard',
        description: 'Project metrics and status'
      },
      {
        id: 'intelligence',
        label: 'DIAS Intelligence',
        icon: Sparkles,
        href: '/project/[id]/dashboard/intelligence',
        description: 'AI insights and predictions',
        badge: 'AI'
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: Badge,
        href: '/project/[id]/dashboard/activity', 
        description: 'Team activity and progress'
      }
    ]
  },
  {
    id: 'design',
    label: 'Design',
    icon: Palette,
    href: '/project/[id]/design',
    description: 'AVCA Stages 1-4: Visual creation workspace',
    items: [
      {
        id: 'blueprints',
        label: 'Blueprints',
        icon: FileText,
        href: '/project/[id]/design/blueprints',
        description: 'Stage 1: Project requirements and user stories'
      },
      {
        id: 'styling',
        label: 'Styling',
        icon: Palette,
        href: '/project/[id]/design/styling',
        description: 'Stage 2: Theme and design system'
      },
      {
        id: 'pages',
        label: 'Pages',
        icon: Layout,
        href: '/project/[id]/design/pages',
        description: 'Stage 3: Page layouts and user flows'
      },
      {
        id: 'components',
        label: 'Components',
        icon: Component,
        href: '/project/[id]/design/components',
        description: 'Stage 4: Component specifications',
        count: 224
      }
    ]
  },
  {
    id: 'build',
    label: 'Build',
    icon: Wrench,
    href: '/project/[id]/build',
    description: 'AVCA Stages 5-8: Development workspace',
    items: [
      {
        id: 'generate',
        label: 'Generate',
        icon: Sparkles,
        href: '/project/[id]/build/generate',
        description: 'Stage 5: Component generation'
      },
      {
        id: 'quality',
        label: 'Quality',
        icon: TestTube,
        href: '/project/[id]/build/quality',
        description: 'Stage 6: Quality gates and testing'
      },
      {
        id: 'registry',
        label: 'Registry',
        icon: Package,
        href: '/project/[id]/build/registry',
        description: 'Stage 7: Component registry management',
        count: 156
      },
      {
        id: 'preview',
        label: 'Preview',
        icon: Eye,
        href: '/project/[id]/build/preview',
        description: 'Stage 8: Application preview and assembly'
      },
      {
        id: 'deploy',
        label: 'Deploy',
        icon: Rocket,
        href: '/project/[id]/build/deploy',
        description: 'Deployment pipeline integration'
      }
    ]
  }
];

interface EnhancedHorizontalNavProps {
  projectId?: string;
}

export default function EnhancedHorizontalNav({ projectId }: EnhancedHorizontalNavProps) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Find the active group based on current path
  const activeGroup = navigationConfig.find(group => 
    pathname.includes(group.id) || group.items.some(item => pathname === item.href.replace('[id]', projectId || ''))
  );

  // If no group matches or only one item, don't render
  if (!activeGroup || activeGroup.items.length <= 1) {
    return null;
  }

  const handleDropdownToggle = (groupId: string) => {
    setActiveDropdown(activeDropdown === groupId ? null : groupId);
  };

  return (
    <div className="border-b border-[#2A2A2E] mb-6">
      <div className="flex items-center justify-between mb-4">
        {/* Group Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <activeGroup.icon className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">{activeGroup.label}</h2>
          </div>
          <div className="text-sm text-gray-400">
            {activeGroup.description}
          </div>
        </div>

        {/* 224-Component Counter */}
        {activeGroup.id === 'design' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Component className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">224 Components</span>
          </div>
        )}
      </div>

      {/* Sub Navigation */}
      <nav className="flex items-center gap-1">
        {activeGroup.items.map((item) => {
          const isActive = pathname === item.href.replace('[id]', projectId || '');
          const Icon = item.icon;
          
          return (
            <a
              key={item.id}
              href={item.href.replace('[id]', projectId || '')}
              className={`group flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 relative ${
                isActive
                  ? 'border-blue-500 text-white bg-blue-500/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1A1A1C]'
              }`}
              title={item.description}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span>{item.label}</span>
              
              {/* Badge */}
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded font-medium">
                  {item.badge}
                </span>
              )}
              
              {/* Count */}
              {item.count && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded font-medium">
                  {item.count}
                </span>
              )}
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </a>
          );
        })}

        {/* Component Search for Design/Build stages */}
        {(activeGroup.id === 'design' || activeGroup.id === 'build') && (
          <div className="ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search components..."
                className="pl-9 pr-3 py-2 text-sm bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors w-48"
              />
            </div>
          </div>
        )}
      </nav>

      {/* Progress Indicators for AVCA Stages */}
      {(activeGroup.id === 'design' || activeGroup.id === 'build') && (
        <div className="mt-3 flex items-center gap-2">
          <div className="text-xs text-gray-400">Stage Progress:</div>
          <div className="flex items-center gap-1">
            {activeGroup.items.map((item, index) => {
              const isCompleted = index < 2; // Mock completion status
              const isActive = pathname === item.href.replace('[id]', projectId || '');
              
              return (
                <div
                  key={item.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isCompleted 
                      ? 'bg-green-400' 
                      : isActive 
                        ? 'bg-blue-400' 
                        : 'bg-gray-600'
                  }`}
                  title={`${item.label} - ${isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}`}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-400">
            2 of {activeGroup.items.length} stages complete
          </div>
        </div>
      )}
    </div>
  );
}