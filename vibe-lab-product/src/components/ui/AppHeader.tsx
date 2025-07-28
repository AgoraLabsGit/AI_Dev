'use client';

import { ReactNode } from 'react';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  className?: string;
}

/**
 * PWA-compliant app header component
 * - Mobile-first responsive design
 * - 44px minimum touch targets
 * - CSS Grid for predictable layout
 * - Semantic HTML structure
 */
export default function AppHeader({ 
  title, 
  subtitle, 
  startContent, 
  endContent, 
  className = '' 
}: AppHeaderProps) {
  return (
    <header 
      className={`
        bg-[#161618] border-b border-[#2A2A2E]
        min-h-[72px] px-4 py-3
        grid grid-cols-[1fr_auto] items-center gap-4
        ${className}
      `}
      role="banner"
    >
      {/* Start Section: Avatars + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {startContent}
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-medium text-white truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* End Section: Status + Actions */}
      {endContent && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {endContent}
        </div>
      )}
    </header>
  );
}