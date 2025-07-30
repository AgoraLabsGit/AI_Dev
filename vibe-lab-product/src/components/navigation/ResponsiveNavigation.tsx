'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  LayoutDashboard, 
  Palette, 
  Wrench, 
  Import,
  MessageSquare,
  Search,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface ResponsiveNavigationProps {
  isProjectContext?: boolean;
  projectId?: string;
}

const navigationItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    mobileOrder: 1
  },
  {
    id: 'import',
    label: 'Import',
    icon: Import,
    href: '/project/[id]/import',
    projectOnly: true,
    mobileOrder: 2,
    badge: 'BETA'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/project/[id]/dashboard',
    projectOnly: true,
    mobileOrder: 3
  },
  {
    id: 'design',
    label: 'Design',
    icon: Palette,
    href: '/project/[id]/design',
    projectOnly: true,
    mobileOrder: 4,
    subItems: [
      { id: 'blueprints', label: 'Blueprints', href: '/project/[id]/design/blueprints' },
      { id: 'styling', label: 'Styling', href: '/project/[id]/design/styling' },
      { id: 'pages', label: 'Pages', href: '/project/[id]/design/pages' },
      { id: 'components', label: 'Components', href: '/project/[id]/design/components' }
    ]
  },
  {
    id: 'build',
    label: 'Build',
    icon: Wrench,
    href: '/project/[id]/build',
    projectOnly: true,
    mobileOrder: 5,
    subItems: [
      { id: 'generate', label: 'Generate', href: '/project/[id]/build/generate' },
      { id: 'quality', label: 'Quality', href: '/project/[id]/build/quality' },
      { id: 'registry', label: 'Registry', href: '/project/[id]/build/registry' },
      { id: 'preview', label: 'Preview', href: '/project/[id]/build/preview' }
    ]
  }
];

export default function ResponsiveNavigation({ isProjectContext, projectId }: ResponsiveNavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const filteredItems = navigationItems.filter(item => 
    !item.projectOnly || isProjectContext
  );

  const activeItem = filteredItems.find(item => 
    pathname === item.href.replace('[id]', projectId || '') ||
    item.subItems?.some(subItem => 
      pathname === subItem.href.replace('[id]', projectId || '')
    )
  );

  if (!isMobile) {
    return null; // Desktop uses MainSidebar and EnhancedHorizontalNav
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-[#161618] border-b border-[#2A2A2E] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">VL</span>
            </div>
            <span className="font-semibold text-white">Vibe Lab</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#161618] border-r border-[#2A2A2E] overflow-y-auto">
            {/* Menu Header */}
            <div className="p-4 border-b border-[#2A2A2E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">VL</span>
                </div>
                <span className="font-semibold text-white">Vibe Lab</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project Context */}
            {isProjectContext && projectId && (
              <div className="p-4 border-b border-[#2A2A2E]">
                <div className="text-xs text-gray-400 mb-2">Current Project</div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1C1C1E] border border-[#2A2A2E]">
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Project {projectId}</span>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem?.id === item.id;
                const isExpanded = expandedItems.has(item.id);
                const hasSubItems = item.subItems && item.subItems.length > 0;

                return (
                  <div key={item.id}>
                    <div className="flex items-center">
                      <a
                        href={item.href.replace('[id]', projectId || '')}
                        className={`flex-1 flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded font-medium">
                            {item.badge}
                          </span>
                        )}
                      </a>
                      
                      {hasSubItems && (
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Sub Items */}
                    {hasSubItems && isExpanded && (
                      <div className="mt-2 ml-6 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const isSubActive = pathname === subItem.href.replace('[id]', projectId || '');
                          
                          return (
                            <a
                              key={subItem.id}
                              href={subItem.href.replace('[id]', projectId || '')}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isSubActive 
                                  ? 'bg-blue-500/10 text-blue-400' 
                                  : 'text-gray-400 hover:text-white hover:bg-[#1C1C1E]'
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {subItem.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="mt-auto p-4 border-t border-[#2A2A2E]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Developer</div>
                  <div className="text-xs text-gray-400">Free Plan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (for primary actions) */}
      {isProjectContext && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161618] border-t border-[#2A2A2E] px-4 py-2 z-30">
          <div className="flex items-center justify-around">
            {filteredItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeItem?.id === item.id;
              
              return (
                <a
                  key={item.id}
                  href={item.href.replace('[id]', projectId || '')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-blue-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Chat Toggle */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <button className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}