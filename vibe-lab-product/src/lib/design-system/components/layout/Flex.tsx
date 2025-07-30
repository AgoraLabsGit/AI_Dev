import React from 'react';
import { cn } from '@/lib/utils';

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Flex direction
   * @default 'row'
   */
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  
  /**
   * How items are aligned along the cross axis
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  
  /**
   * How items are distributed along the main axis
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  /**
   * Whether items can wrap to new lines
   * @default 'nowrap'
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  
  /**
   * Gap between items
   * @default 'none'
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether the flex container should fill available space
   * @default false
   */
  fill?: boolean;
  
  /**
   * Whether items should grow to fill available space
   * @default false
   */
  grow?: boolean;
  
  /**
   * Whether items should shrink if needed
   * @default true
   */
  shrink?: boolean;
}

const flexDirection = {
  'row': 'flex-row',
  'row-reverse': 'flex-row-reverse',
  'col': 'flex-col',
  'col-reverse': 'flex-col-reverse'
};

const alignItems = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline'
};

const justifyContent = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
};

const flexWrap = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse'
};

const gapSizes = {
  none: 'gap-0',
  xs: 'gap-1',    // 4px
  sm: 'gap-2',    // 8px
  md: 'gap-4',    // 16px
  lg: 'gap-6',    // 24px
  xl: 'gap-8'     // 32px
};

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    className,
    direction = 'row',
    align = 'stretch',
    justify = 'start',
    wrap = 'nowrap',
    gap = 'none',
    fill = false,
    grow = false,
    shrink = true,
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
          flexDirection[direction],
          
          // Alignment
          alignItems[align],
          
          // Justification
          justifyContent[justify],
          
          // Wrap
          flexWrap[wrap],
          
          // Gap
          gapSizes[gap],
          
          // Fill available space
          fill && (direction.includes('col') ? 'h-full' : 'w-full'),
          
          // Item behavior
          grow && '[&>*]:flex-grow',
          !shrink && '[&>*]:flex-shrink-0',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';