import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container size variant
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  
  /**
   * Whether to center the container
   * @default true
   */
  center?: boolean;
  
  /**
   * Padding size
   * @default 'default'
   */
  padding?: 'none' | 'sm' | 'default' | 'lg';
  
  /**
   * Whether container should be fluid (full width)
   * @default false
   */
  fluid?: boolean;
}

const containerSizes = {
  sm: 'max-w-sm',     // 384px
  default: 'max-w-4xl', // 896px
  lg: 'max-w-6xl',    // 1152px
  xl: 'max-w-7xl',    // 1280px
  full: 'max-w-full'
};

const containerPadding = {
  none: '',
  sm: 'px-4 py-2',
  default: 'px-6 py-4',
  lg: 'px-8 py-6'
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    size = 'default', 
    center = true, 
    padding = 'default',
    fluid = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'w-full',
          
          // Size variants
          !fluid && containerSizes[size],
          
          // Centering
          center && 'mx-auto',
          
          // Padding
          containerPadding[padding],
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';