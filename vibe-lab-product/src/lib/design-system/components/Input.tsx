'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  // Base styles
  'w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: [
          'hover:border-gray-600/50',
          'focus:bg-gray-800/70',
        ],
        filled: [
          'bg-gray-800',
          'border-transparent',
          'hover:bg-gray-700',
          'focus:bg-gray-700',
        ],
        ghost: [
          'bg-transparent',
          'border-transparent',
          'hover:bg-gray-800/30',
          'focus:bg-gray-800/50',
        ],
        glow: [
          'border-indigo-500/30',
          'hover:border-indigo-500/50',
          'focus:shadow-lg focus:shadow-indigo-500/20',
          'focus:border-indigo-500',
        ],
      },
      size: {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-5 py-3',
      },
      error: {
        true: 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helper?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size,
    error,
    label,
    helper,
    errorMessage,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = error || !!errorMessage;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, error: hasError }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helper || errorMessage) && (
          <p className={cn(
            'mt-1.5 text-sm',
            hasError ? 'text-red-400' : 'text-gray-500'
          )}>
            {errorMessage || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };