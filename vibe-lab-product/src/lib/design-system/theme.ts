/**
 * Theme System
 * Dynamic theme management with AI/Tech Forward + Modern Minimal aesthetic
 */

import { tokens } from './tokens';

export type Theme = {
  name: 'dark' | 'light';
  colors: {
    // Core background colors
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      overlay: string;
      hover: string;
      active: string;
    };
    
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
    };
    
    // Border colors
    border: {
      primary: string;
      secondary: string;
      focus: string;
      hover: string;
    };
    
    // Component-specific colors
    component: {
      buttonPrimary: string;
      buttonSecondary: string;
      inputBackground: string;
      cardBackground: string;
      badgeBackground: string;
    };
    
    // Semantic colors (same for both themes)
    semantic: typeof tokens.colors.semantic;
    
    // Brand colors and gradients (same for both themes)
    brand: typeof tokens.colors.brand;
    gradient: typeof tokens.colors.gradient;
  };
  
  // Inherit all other tokens
  typography: typeof tokens.typography;
  spacing: typeof tokens.spacing;
  borderRadius: typeof tokens.borderRadius;
  shadows: typeof tokens.shadows;
  transitions: typeof tokens.transitions;
  zIndex: typeof tokens.zIndex;
  breakpoints: typeof tokens.breakpoints;
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      primary: tokens.colors.background.primary,
      secondary: tokens.colors.background.secondary,
      tertiary: tokens.colors.background.tertiary,
      overlay: tokens.colors.background.overlay,
      hover: tokens.colors.background.hover,
      active: tokens.colors.background.active,
    },
    
    text: {
      primary: tokens.colors.gray[50],
      secondary: tokens.colors.gray[300],
      tertiary: tokens.colors.gray[400],
      disabled: tokens.colors.gray[600],
      inverse: tokens.colors.gray[900],
    },
    
    border: {
      primary: 'rgba(148, 163, 184, 0.1)', // gray-400 with opacity
      secondary: 'rgba(148, 163, 184, 0.05)',
      focus: tokens.colors.brand.indigo[500],
      hover: 'rgba(99, 102, 241, 0.3)',
    },
    
    component: {
      buttonPrimary: tokens.colors.gradient.primary,
      buttonSecondary: tokens.colors.background.tertiary,
      inputBackground: tokens.colors.background.secondary,
      cardBackground: tokens.colors.background.secondary,
      badgeBackground: 'rgba(99, 102, 241, 0.1)',
    },
    
    semantic: tokens.colors.semantic,
    brand: tokens.colors.brand,
    gradient: tokens.colors.gradient,
  },
  
  typography: tokens.typography,
  spacing: tokens.spacing,
  borderRadius: tokens.borderRadius,
  shadows: {
    ...tokens.shadows,
    // Enhanced shadows for dark theme
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  },
  transitions: tokens.transitions,
  zIndex: tokens.zIndex,
  breakpoints: tokens.breakpoints,
};

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: {
      primary: tokens.colors.gray[50],
      secondary: '#ffffff',
      tertiary: tokens.colors.gray[100],
      overlay: 'rgba(248, 250, 252, 0.8)',
      hover: 'rgba(99, 102, 241, 0.05)',
      active: 'rgba(99, 102, 241, 0.1)',
    },
    
    text: {
      primary: tokens.colors.gray[900],
      secondary: tokens.colors.gray[700],
      tertiary: tokens.colors.gray[500],
      disabled: tokens.colors.gray[400],
      inverse: tokens.colors.gray[50],
    },
    
    border: {
      primary: tokens.colors.gray[200],
      secondary: tokens.colors.gray[100],
      focus: tokens.colors.brand.indigo[500],
      hover: tokens.colors.brand.indigo[300],
    },
    
    component: {
      buttonPrimary: tokens.colors.gradient.primary,
      buttonSecondary: '#ffffff',
      inputBackground: '#ffffff',
      cardBackground: '#ffffff',
      badgeBackground: tokens.colors.brand.indigo[50],
    },
    
    semantic: tokens.colors.semantic,
    brand: tokens.colors.brand,
    gradient: tokens.colors.gradient,
  },
  
  typography: tokens.typography,
  spacing: tokens.spacing,
  borderRadius: tokens.borderRadius,
  shadows: tokens.shadows,
  transitions: tokens.transitions,
  zIndex: tokens.zIndex,
  breakpoints: tokens.breakpoints,
};

// CSS variables generator
export function generateCSSVariables(theme: Theme): string {
  const cssVars: string[] = [];
  
  // Flatten theme object into CSS variables
  const flatten = (obj: any, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const varName = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, varName);
      } else {
        cssVars.push(`--${varName}: ${value};`);
      }
    });
  };
  
  flatten(theme.colors, 'color');
  flatten(theme.typography, 'typography');
  flatten(theme.spacing, 'spacing');
  flatten(theme.borderRadius, 'radius');
  flatten(theme.shadows, 'shadow');
  flatten(theme.transitions, 'transition');
  flatten(theme.zIndex, 'z');
  
  return cssVars.join('\n  ');
}

// Type-safe theme accessor
export function useThemeValue<T extends keyof Theme>(
  theme: Theme,
  path: T
): Theme[T] {
  return theme[path];
}

// Export default theme
export const defaultTheme = darkTheme;