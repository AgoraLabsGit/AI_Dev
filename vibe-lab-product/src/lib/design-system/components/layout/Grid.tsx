import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns
   * @default 'auto'
   */
  cols?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 12;
  
  /**
   * Responsive column configuration
   */
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
  
  /**
   * Gap between grid items
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
  justify?: 'start' | 'center' | 'end' | 'stretch';
  
  /**
   * Whether items should have equal height
   * @default false
   */
  equalHeight?: boolean;
}

const gridCols = {
  auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
};

const responsiveCols = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12'
  }
};

const gapSizes = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2', 
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
};

const alignItems = {
  start: 'items-start',
  center: 'items-center', 
  end: 'items-end',
  stretch: 'items-stretch'
};

const justifyItems = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end', 
  stretch: 'justify-items-stretch'
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className,
    cols = 'auto',
    responsive,
    gap = 'md',
    align = 'stretch',
    justify = 'start',
    equalHeight = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base grid
          'grid',
          
          // Columns
          gridCols[cols],
          
          // Responsive columns
          responsive?.sm && responsiveCols.sm[responsive.sm],
          responsive?.md && responsiveCols.md[responsive.md],
          responsive?.lg && responsiveCols.lg[responsive.lg],
          responsive?.xl && responsiveCols.xl[responsive.xl],
          
          // Gap
          gapSizes[gap],
          
          // Alignment
          alignItems[align],
          
          // Justification
          justifyItems[justify],
          
          // Equal height
          equalHeight && 'grid-rows-[repeat(auto,1fr)]',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';