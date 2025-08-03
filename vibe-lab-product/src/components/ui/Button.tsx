import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
}

/**
 * Platform Button Component
 * Follows Strike's minimal, gray-based design
 */
export function Button({ 
  children, 
  variant = 'default',
  size = 'md',
  className,
  onClick,
  disabled,
  type = 'button',
  isLoading
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center font-normal rounded-lg transition-all duration-200",
        "disabled:opacity-50 disabled:pointer-events-none",
        
        // Size variations
        size === 'sm' && "px-3 py-1.5 text-sm",
        size === 'md' && "px-4 py-2",
        size === 'lg' && "px-6 py-3 text-lg",
        
        // Variant styles - using Strike's gray palette
        variant === 'default' && [
          "bg-[#374151]",
          "text-white",
          "border border-[#4B5563]",
          "hover:bg-[#4B5563]",
          "hover:border-[#6B7280]"
        ],
        
        variant === 'primary' && [
          "bg-[#374151]",
          "text-white",
          "border border-[#4B5563]",
          "hover:bg-[#4B5563]",
          "hover:border-[#6B7280]"
        ],
        
        variant === 'secondary' && [
          "bg-[#1F2937]",
          "text-[#D1D5DB]",
          "border border-[#374151]",
          "hover:bg-[#374151]",
          "hover:text-white"
        ],
        
        variant === 'ghost' && [
          "text-[#9CA3AF]",
          "hover:text-white",
          "hover:bg-transparent"
        ],
        
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
}