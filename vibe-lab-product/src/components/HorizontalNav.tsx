'use client';

import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  category: string;
  icon: LucideIcon;
  items: NavItem[];
}

interface HorizontalNavProps {
  activeGroup: NavGroup | null;
}

export default function HorizontalNav({ activeGroup }: HorizontalNavProps) {
  const pathname = usePathname();

  if (!activeGroup || activeGroup.items.length <= 1) {
    return null; // Don't render for single-item categories
  }

  return (
    <div className="border-b border-[#2A2A2E] mb-6">
      <nav className="flex items-center gap-4">
        {activeGroup.items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
} 