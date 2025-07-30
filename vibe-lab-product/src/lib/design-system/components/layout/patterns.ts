/**
 * Common Layout Patterns
 * Pre-built component combinations for common layout needs
 */

import React from 'react';
import { Container } from './Container';
import { Stack } from './Stack';
import { Grid } from './Grid';
import { Flex } from './Flex';

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface HeaderContentFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Standard page layout with centered content container
 */
export const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ children, maxWidth = 'default', padding = 'default', className, ...props }, ref) => (
    <Container
      ref={ref}
      size={maxWidth}
      padding={padding}
      className={className}
      {...props}
    >
      {children}
    </Container>
  )
);

/**
 * Two-column layout with sidebar and main content
 */
export const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ sidebar, children, sidebarWidth = 'md', gap = 'lg', className, ...props }, ref) => {
    const sidebarWidths = {
      sm: 'w-48',  // 192px
      md: 'w-64',  // 256px
      lg: 'w-80'   // 320px
    };

    return (
      <Flex
        ref={ref}
        direction="row"
        gap={gap}
        align="start"
        className={className}
        {...props}
      >
        <div className={`flex-shrink-0 ${sidebarWidths[sidebarWidth]}`}>
          {sidebar}
        </div>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </Flex>
    );
  }
);

/**
 * Three-section vertical layout (header, content, footer)
 */
export const HeaderContentFooter = React.forwardRef<HTMLDivElement, HeaderContentFooterProps>(
  ({ header, children, footer, className, ...props }, ref) => (
    <Stack
      ref={ref}
      direction="vertical"
      fill
      className={className}
      {...props}
    >
      {header && (
        <div className="flex-shrink-0">
          {header}
        </div>
      )}
      <div className="flex-1 min-h-0">
        {children}
      </div>
      {footer && (
        <div className="flex-shrink-0">
          {footer}
        </div>
      )}
    </Stack>
  )
);

/**
 * Responsive card grid layout
 */
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minCardWidth?: number;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const CardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  ({ children, minCardWidth = 300, gap = 'md', className, ...props }, ref) => (
    <Grid
      ref={ref}
      cols="auto"
      gap={gap}
      className={className}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`
      }}
      {...props}
    >
      {children}
    </Grid>
  )
);

PageLayout.displayName = 'PageLayout';
SidebarLayout.displayName = 'SidebarLayout';
HeaderContentFooter.displayName = 'HeaderContentFooter';
CardGrid.displayName = 'CardGrid';