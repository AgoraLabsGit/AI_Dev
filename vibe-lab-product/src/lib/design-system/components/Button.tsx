'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
  {
    variants: {
      variant: {
        primary: [
          'text-white',
          'bg-gradient-to-r from-indigo-500 to-purple-600',
          'hover:from-indigo-600 hover:to-purple-700',
          'shadow-lg shadow-indigo-500/20',
          'hover:shadow-xl hover:shadow-indigo-500/30',
          'focus:ring-indigo-500',
        ],
        secondary: [
          'text-gray-300',
          'bg-gray-800/50',
          'border border-gray-700/50',
          'hover:bg-gray-700/50',
          'hover:border-gray-600/50',
          'hover:text-white',
          'focus:ring-gray-500',
        ],
        ghost: [
          'text-gray-400',
          'hover:text-white',
          'hover:bg-gray-800/30',
          'focus:ring-gray-500',
        ],
        outline: [
          'text-indigo-400',
          'border border-indigo-500/50',
          'hover:bg-indigo-500/10',
          'hover:border-indigo-500',
          'hover:text-indigo-300',
          'focus:ring-indigo-500',
        ],
        danger: [
          'text-white',
          'bg-red-500',
          'hover:bg-red-600',
          'shadow-lg shadow-red-500/20',
          'hover:shadow-xl hover:shadow-red-500/30',
          'focus:ring-red-500',
        ],
        glow: [
          'text-white',
          'bg-gradient-to-r from-indigo-500 to-purple-600',
          'hover:from-indigo-600 hover:to-purple-700',
          'shadow-lg shadow-indigo-500/30',
          'hover:shadow-xl hover:shadow-indigo-500/40',
          'focus:ring-indigo-500',
          'relative overflow-hidden',
          'before:absolute before:inset-0',
          'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
          'before:translate-x-[-200%] hover:before:translate-x-[200%]',
          'before:transition-transform before:duration-700',
        ],
      },
      size: {
        xs: 'text-xs px-2 py-1 rounded-md',
        sm: 'text-sm px-3 py-1.5 rounded-md',
        md: 'text-sm px-4 py-2 rounded-lg',
        lg: 'text-base px-6 py-3 rounded-lg',
        xl: 'text-lg px-8 py-4 rounded-xl',
        icon: 'p-2 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };