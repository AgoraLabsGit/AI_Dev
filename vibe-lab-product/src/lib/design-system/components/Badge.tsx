'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-gray-800/50',
          'text-gray-300',
          'border border-gray-700/50',
        ],
        primary: [
          'bg-indigo-500/10',
          'text-indigo-400',
          'border border-indigo-500/20',
        ],
        success: [
          'bg-emerald-500/10',
          'text-emerald-400',
          'border border-emerald-500/20',
        ],
        warning: [
          'bg-amber-500/10',
          'text-amber-400',
          'border border-amber-500/20',
        ],
        danger: [
          'bg-red-500/10',
          'text-red-400',
          'border border-red-500/20',
        ],
        purple: [
          'bg-purple-500/10',
          'text-purple-400',
          'border border-purple-500/20',
        ],
        gradient: [
          'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
          'text-purple-300',
          'border border-purple-500/20',
          'shadow-sm shadow-purple-500/10',
        ],
        glow: [
          'bg-indigo-500/20',
          'text-indigo-300',
          'border border-indigo-500/30',
          'shadow-md shadow-indigo-500/20',
        ],
      },
      size: {
        xs: 'text-xs px-2 py-0.5 rounded',
        sm: 'text-xs px-2.5 py-1 rounded-md',
        md: 'text-sm px-3 py-1 rounded-md',
        lg: 'text-sm px-4 py-1.5 rounded-lg',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-105 active:scale-95',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size,
    interactive,
    dot,
    leftIcon,
    rightIcon,
    children,
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, interactive, className }))}
        {...props}
      >
        {dot && (
          <span className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'primary' && 'bg-indigo-400',
            variant === 'success' && 'bg-emerald-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'purple' && 'bg-purple-400',
            (!variant || variant === 'default') && 'bg-gray-400',
            (variant === 'gradient' || variant === 'glow') && 'bg-indigo-400'
          )} />
        )}
        {leftIcon && <span className="mr-1.5">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Animated Badge Component
interface AnimatedBadgeProps extends BadgeProps {
  pulse?: boolean;
}

export const AnimatedBadge = forwardRef<HTMLSpanElement, AnimatedBadgeProps>(
  ({ pulse, className, ...props }, ref) => {
    return (
      <span className="relative inline-flex">
        {pulse && (
          <span className={cn(
            'absolute inset-0 rounded-full opacity-75 animate-ping',
            props.variant === 'primary' && 'bg-indigo-400',
            props.variant === 'success' && 'bg-emerald-400',
            props.variant === 'warning' && 'bg-amber-400',
            props.variant === 'danger' && 'bg-red-400',
            props.variant === 'purple' && 'bg-purple-400',
            (!props.variant || props.variant === 'default') && 'bg-gray-400',
            (props.variant === 'gradient' || props.variant === 'glow') && 'bg-indigo-400'
          )} />
        )}
        <Badge ref={ref} className={cn('relative', className)} {...props} />
      </span>
    );
  }
);

AnimatedBadge.displayName = 'AnimatedBadge';

export { Badge, badgeVariants };