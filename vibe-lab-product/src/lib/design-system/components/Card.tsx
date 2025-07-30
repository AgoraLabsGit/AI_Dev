'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  // Base styles
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-gray-900/50',
          'border border-gray-800/50',
          'backdrop-blur-sm',
        ],
        elevated: [
          'bg-gray-900/80',
          'shadow-xl shadow-black/20',
          'backdrop-blur-md',
        ],
        outline: [
          'bg-transparent',
          'border border-gray-700/50',
          'hover:border-gray-600/50',
        ],
        glow: [
          'bg-gray-900/50',
          'border border-indigo-500/20',
          'shadow-lg shadow-indigo-500/10',
          'hover:border-indigo-500/30',
          'hover:shadow-xl hover:shadow-indigo-500/20',
          'backdrop-blur-sm',
        ],
        gradient: [
          'bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-purple-900/20',
          'border border-purple-500/20',
          'shadow-xl shadow-purple-500/10',
          'backdrop-blur-md',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    padding,
    interactive,
    header,
    footer,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive, className }))}
        {...props}
      >
        {header && (
          <div className={cn(
            'border-b border-gray-800/50',
            padding === 'none' ? 'px-6 py-4' : '-mx-6 -mt-6 px-6 py-4 mb-6'
          )}>
            {header}
          </div>
        )}
        
        {children}
        
        {footer && (
          <div className={cn(
            'border-t border-gray-800/50',
            padding === 'none' ? 'px-6 py-4' : '-mx-6 -mb-6 px-6 py-4 mt-6'
          )}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Title Component
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('text-lg font-semibold text-white', className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-400 mt-1', className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

export { Card, CardTitle, CardDescription, cardVariants };