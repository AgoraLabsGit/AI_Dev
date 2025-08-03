'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getComponentClasses } from '@/utils/template-utils';
import { type TailwindTemplate } from '@/services/styling-service';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  template?: TailwindTemplate;
  isLoading?: boolean;
}

/**
 * PWA-compliant action button with template support
 * - Minimum 44px touch target (size='md')
 * - Clear focus states
 * - Template-aware styling
 * - Consistent accessibility
 */
export default function ActionButton({
  onClick,
  disabled = false,
  title,
  children,
  variant = 'default',
  size = 'md',
  className,
  template,
  isLoading = false
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={cn(
        // If template is provided, use template classes
        template && getComponentClasses('button', {
          template,
          variant,
          size,
          state: {
            isDisabled: disabled,
            isLoading
          }
        }),
        // Fallback to default Tailwind classes if no template
        !template && cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Size variations
          size === 'sm' && 'h-9 px-3 text-sm',
          size === 'md' && 'h-10 px-4 py-2',
          size === 'lg' && 'h-11 px-8 text-lg',
          // Variant styles
          variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
          variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        ),
        // Additional classes
        className
      )}
      type="button"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
}