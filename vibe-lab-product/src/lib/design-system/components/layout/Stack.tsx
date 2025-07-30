import React from 'react';
import { cn } from '@/lib/utils';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  
  /**
   * Gap between items
   * @default 'md'
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Alignment of items
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  /**
   * Justification of items
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  /**
   * Whether items can wrap
   * @default false
   */
  wrap?: boolean;
  
  /**
   * Whether to fill available space
   * @default false
   */
  fill?: boolean;
}

const gapSizes = {
  none: 'gap-0',
  xs: 'gap-1',    // 4px
  sm: 'gap-2',    // 8px
  md: 'gap-4',    // 16px
  lg: 'gap-6',    // 24px
  xl: 'gap-8'     // 32px
};

const alignItems = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
};

const justifyContent = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className,
    direction = 'vertical',
    gap = 'md',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    fill = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base flex
          'flex',
          
          // Direction
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          
          // Gap
          gapSizes[gap],
          
          // Alignment
          alignItems[align],
          
          // Justification
          justifyContent[justify],
          
          // Wrap
          wrap && 'flex-wrap',
          
          // Fill available space
          fill && (direction === 'vertical' ? 'h-full' : 'w-full'),
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';