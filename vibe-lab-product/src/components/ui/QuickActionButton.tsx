'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Loader2, CheckCircle } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
  className?: string;
}

export function QuickActionButton({
  icon: Icon,
  title,
  description,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className
}: QuickActionButtonProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleClick = async () => {
    if (disabled || isExecuting || !onClick) return;

    try {
      setIsExecuting(true);
      await onClick();
      setIsCompleted(true);
      setTimeout(() => setIsCompleted(false), 2000); // Reset after 2s
    } catch (error) {
      console.error('Quick action failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const isLoading = loading || isExecuting;
  const buttonSize = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  }[size];

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const getVariantStyles = () => {
    if (isCompleted) {
      return 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20';
    }

    switch (variant) {
      case 'primary':
        return 'bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] hover:bg-[#2563EB]/20 hover:border-[#2563EB]/30';
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20';
      case 'danger':
        return 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20';
      default:
        return 'bg-[#111113] border-[#2F2F33] text-[#9CA3AF] hover:bg-[#1A1A1C] hover:border-[#374151] hover:text-white';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        "relative flex items-center space-x-3 rounded-lg border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0B]",
        buttonSize,
        getVariantStyles(),
        disabled && "opacity-50 cursor-not-allowed",
        isLoading && "cursor-wait",
        description ? "flex-col items-start space-x-0 space-y-2" : "",
        className
      )}
    >
      {/* Icon and Loading State */}
      <div className={cn("flex items-center", description ? "w-full" : "")}>
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className={cn(iconSize, "text-green-400")} />
          ) : isLoading ? (
            <Loader2 className={cn(iconSize, "animate-spin")} />
          ) : (
            <Icon className={iconSize} />
          )}
        </div>
        
        {/* Title */}
        <span className={cn(
          "font-medium",
          textSize,
          description ? "ml-2" : ""
        )}>
          {isCompleted ? 'Completed!' : title}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className={cn(
          "text-left text-xs text-[#6B7280] w-full",
          isCompleted && "text-green-400/70"
        )}>
          {isCompleted ? 'Action completed successfully' : description}
        </p>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 rounded-lg" />
      )}
    </button>
  );
}