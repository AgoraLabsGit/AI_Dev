import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
}

/**
 * Platform Card Component
 * Follows Strike's minimal, dark card design
 */
export function Card({ 
  children, 
  className,
  variant = 'default'
}: CardProps) {
  return (
    <div 
      className={cn(
        // Base styles - Strike's dark theme
        "rounded-lg border transition-all duration-200",
        
        // Variant styles
        variant === 'default' && [
          "bg-[#111113]",
          "border-[#1F1F23]"
        ],
        
        variant === 'elevated' && [
          "bg-[#1A1A1C]",
          "border-[#1F1F23]"
        ],
        
        variant === 'interactive' && [
          "bg-[#111113]",
          "border-[#1F1F23]",
          "hover:bg-[#1A1A1C]",
          "hover:border-[#374151]",
          "cursor-pointer"
        ],
        
        className
      )}
    >
      {children}
    </div>
  );
}