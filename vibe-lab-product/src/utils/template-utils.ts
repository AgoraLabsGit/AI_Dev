/**
 * Template Utilities
 * Pure Tailwind CSS implementation for template management
 */

import { type TailwindTemplate } from '@/services/styling-service';
import { cn } from '@/lib/utils';

interface ComponentClassOptions {
  template: TailwindTemplate;
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  state?: {
    isActive?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
  };
}

/**
 * Get component classes based on template and variants
 */
export function getComponentClasses(
  component: keyof TailwindTemplate['classVariants'],
  options: ComponentClassOptions
): string {
  const { template, variant = 'default', size = 'md', state } = options;
  const variants = template.classVariants[component];

  if (!variants) return '';

  // Base classes
  const classes = [variants.base];

  // Add variant classes
  if (variant in variants) {
    classes.push(variants[variant as keyof typeof variants]);
  }

  // Add size classes
  const sizeClasses = {
    button: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    },
    input: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2',
      lg: 'px-4 py-3 text-lg'
    },
    card: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    }
  };

  if (component in sizeClasses) {
    classes.push(sizeClasses[component as keyof typeof sizeClasses][size]);
  }

  // Add state classes
  if (state) {
    if (state.isDisabled) {
      classes.push('opacity-50 cursor-not-allowed');
    }
    if (state.isActive) {
      classes.push('ring-2 ring-primary ring-offset-2');
    }
    if (state.isLoading) {
      classes.push('animate-pulse');
    }
  }

  return cn(...classes);
}

/**
 * Get typography classes based on template
 */
export function getTypographyClasses(
  template: TailwindTemplate,
  type: 'body' | 'heading' | 'code'
): string {
  const fontMapping = {
    body: template.typography.fonts.primary,
    heading: template.typography.fonts.heading,
    code: template.typography.fonts.mono
  };

  const baseClasses = {
    body: 'text-foreground',
    heading: 'text-foreground font-bold tracking-tight',
    code: 'font-mono text-sm bg-muted rounded px-1'
  };

  return cn(
    `font-${fontMapping[type].toLowerCase()}`,
    baseClasses[type]
  );
}

/**
 * Get layout classes based on template
 */
export function getLayoutClasses(
  template: TailwindTemplate,
  type: 'container' | 'section' | 'grid'
): string {
  const layoutClasses = {
    container: 'mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
    section: 'py-12 sm:py-16',
    grid: 'grid gap-4 sm:gap-6 lg:gap-8'
  };

  return layoutClasses[type];
}

/**
 * Example usage:
 * 
 * ```tsx
 * function Button({ template, variant, size, disabled, loading, children }) {
 *   return (
 *     <button
 *       className={getComponentClasses('button', {
 *         template,
 *         variant,
 *         size,
 *         state: {
 *           isDisabled: disabled,
 *           isLoading: loading
 *         }
 *       })}
 *       disabled={disabled}
 *     >
 *       {children}
 *     </button>
 *   );
 * }
 * ```
 */