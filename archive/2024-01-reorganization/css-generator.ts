/**
 * CSS Generation Utility
 * Exports template configurations as CSS variables and classes
 */

import { AdvancedThemeTemplate } from '@/lib/design-system/templates/advanced-templates';

interface CSSExportOptions {
  format: 'css-variables' | 'scss-variables' | 'tailwind-config' | 'js-object';
  includeComponents?: boolean;
  prefix?: string;
}

export class CSSGenerator {
  /**
   * Generate CSS variables from template
   */
  generateCSSVariables(template: AdvancedThemeTemplate, prefix = 'vibe'): string {
    const variables: string[] = [];
    
    // Color variables
    variables.push('  /* Colors */');
    variables.push(`  --${prefix}-color-primary: ${template.colors.primary};`);
    variables.push(`  --${prefix}-color-secondary: ${template.colors.secondary};`);
    variables.push(`  --${prefix}-color-accent: ${template.colors.accent};`);
    variables.push(`  --${prefix}-color-success: ${template.colors.success};`);
    variables.push(`  --${prefix}-color-warning: ${template.colors.warning};`);
    variables.push(`  --${prefix}-color-error: ${template.colors.error};`);
    
    variables.push('');
    variables.push('  /* Background Colors */');
    variables.push(`  --${prefix}-bg-primary: ${template.colors.background.primary};`);
    variables.push(`  --${prefix}-bg-secondary: ${template.colors.background.secondary};`);
    variables.push(`  --${prefix}-bg-tertiary: ${template.colors.background.tertiary};`);
    
    variables.push('');
    variables.push('  /* Text Colors */');
    variables.push(`  --${prefix}-text-primary: ${template.colors.text.primary};`);
    variables.push(`  --${prefix}-text-secondary: ${template.colors.text.secondary};`);
    
    // Typography variables
    variables.push('');
    variables.push('  /* Typography */');
    variables.push(`  --${prefix}-font-primary: "${template.typography.primaryFont.family}", ${template.typography.primaryFont.fallback};`);
    variables.push(`  --${prefix}-font-heading: "${template.typography.headingFont.family}", ${template.typography.headingFont.fallback};`);
    variables.push(`  --${prefix}-font-code: "${template.typography.codeFont.family}", ${template.typography.codeFont.fallback};`);
    
    variables.push('');
    variables.push('  /* Font Sizes */');
    Object.entries(template.typography.scale).forEach(([size, value]) => {
      variables.push(`  --${prefix}-text-${size}: ${value};`);
    });
    
    variables.push('');
    variables.push('  /* Line Heights */');
    Object.entries(template.typography.lineHeight).forEach(([size, value]) => {
      variables.push(`  --${prefix}-leading-${size}: ${value};`);
    });
    
    variables.push('');
    variables.push('  /* Letter Spacing */');
    Object.entries(template.typography.letterSpacing).forEach(([size, value]) => {
      variables.push(`  --${prefix}-tracking-${size}: ${value};`);
    });
    
    // Border variables
    variables.push('');
    variables.push('  /* Border Radius */');
    Object.entries(template.borders.radius).forEach(([size, value]) => {
      variables.push(`  --${prefix}-radius-${size}: ${value};`);
    });
    
    variables.push('');
    variables.push('  /* Border Width */');
    Object.entries(template.borders.width).forEach(([size, value]) => {
      variables.push(`  --${prefix}-border-${size}: ${value};`);
    });
    
    variables.push(`  --${prefix}-border-style: ${template.borders.style};`);
    
    // Spacing variables
    variables.push('');
    variables.push('  /* Spacing */');
    variables.push(`  --${prefix}-spacing-scale: ${template.spacing.scale};`);
    variables.push(`  --${prefix}-spacing-base: ${template.spacing.baseUnit}rem;`);
    
    // Animation variables
    variables.push('');
    variables.push('  /* Animations */');
    Object.entries(template.animations.duration).forEach(([speed, value]) => {
      variables.push(`  --${prefix}-duration-${speed}: ${value};`);
    });
    
    Object.entries(template.animations.easing).forEach(([type, value]) => {
      variables.push(`  --${prefix}-ease-${type}: ${value};`);
    });
    
    return `:root {\n${variables.join('\n')}\n}`;
  }

  /**
   * Generate component CSS classes
   */
  generateComponentClasses(template: AdvancedThemeTemplate, prefix = 'vibe'): string {
    const classes: string[] = [];
    
    // Button classes
    classes.push(`/* Button Styles */`);
    classes.push(`.${prefix}-btn {`);
    classes.push(`  font-family: var(--${prefix}-font-primary);`);
    classes.push(`  font-weight: 500;`);
    classes.push(`  padding: 0.5rem 1rem;`);
    classes.push(`  border: var(--${prefix}-border-base) var(--${prefix}-border-style) var(--${prefix}-color-primary);`);
    classes.push(`  transition: all var(--${prefix}-duration-base) var(--${prefix}-ease-ease);`);
    
    const buttonRadius = template.components.buttons.style === 'pill' ? '9999px' : 
                        template.components.buttons.style === 'sharp' ? '0' :
                        template.components.buttons.style === 'cut-corners' ? '0 8px 0 8px' :
                        `var(--${prefix}-radius-base)`;
    classes.push(`  border-radius: ${buttonRadius};`);
    classes.push(`}`);
    
    classes.push('');
    classes.push(`.${prefix}-btn-primary {`);
    classes.push(`  background-color: var(--${prefix}-color-primary);`);
    classes.push(`  color: var(--${prefix}-bg-primary);`);
    classes.push(`}`);
    
    classes.push('');
    classes.push(`.${prefix}-btn-secondary {`);
    classes.push(`  background-color: transparent;`);
    classes.push(`  color: var(--${prefix}-text-primary);`);
    classes.push(`}`);
    
    // Input classes
    classes.push('');
    classes.push(`/* Input Styles */`);
    classes.push(`.${prefix}-input {`);
    classes.push(`  font-family: var(--${prefix}-font-primary);`);
    classes.push(`  padding: 0.5rem 0.75rem;`);
    classes.push(`  color: var(--${prefix}-text-primary);`);
    classes.push(`  transition: all var(--${prefix}-duration-base) var(--${prefix}-ease-ease);`);
    
    if (template.components.inputs.style === 'filled') {
      classes.push(`  background-color: var(--${prefix}-bg-tertiary);`);
      classes.push(`  border: none;`);
    } else if (template.components.inputs.style === 'underlined') {
      classes.push(`  background-color: transparent;`);
      classes.push(`  border: none;`);
      classes.push(`  border-bottom: var(--${prefix}-border-base) var(--${prefix}-border-style) var(--${prefix}-text-secondary);`);
    } else {
      classes.push(`  background-color: transparent;`);
      classes.push(`  border: var(--${prefix}-border-base) var(--${prefix}-border-style) var(--${prefix}-text-secondary);`);
    }
    
    classes.push(`  border-radius: var(--${prefix}-radius-base);`);
    classes.push(`}`);
    
    // Card classes
    classes.push('');
    classes.push(`/* Card Styles */`);
    classes.push(`.${prefix}-card {`);
    classes.push(`  background-color: var(--${prefix}-bg-secondary);`);
    classes.push(`  border-radius: var(--${prefix}-radius-lg);`);
    classes.push(`  padding: 1.5rem;`);
    
    if (template.components.cards.style === 'outlined') {
      classes.push(`  border: var(--${prefix}-border-base) var(--${prefix}-border-style) var(--${prefix}-text-secondary);`);
    } else if (template.components.cards.style === 'elevated') {
      classes.push(`  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);`);
    }
    
    classes.push(`}`);
    
    return classes.join('\n');
  }

  /**
   * Generate Tailwind config
   */
  generateTailwindConfig(template: AdvancedThemeTemplate): string {
    const config = {
      theme: {
        extend: {
          colors: {
            primary: template.colors.primary,
            secondary: template.colors.secondary,
            accent: template.colors.accent,
            success: template.colors.success,
            warning: template.colors.warning,
            error: template.colors.error,
            background: template.colors.background,
            text: template.colors.text
          },
          fontFamily: {
            primary: [template.typography.primaryFont.family, ...template.typography.primaryFont.fallback.split(', ')],
            heading: [template.typography.headingFont.family, ...template.typography.headingFont.fallback.split(', ')],
            code: [template.typography.codeFont.family, ...template.typography.codeFont.fallback.split(', ')],
          },
          fontSize: template.typography.scale,
          lineHeight: template.typography.lineHeight,
          letterSpacing: template.typography.letterSpacing,
          borderRadius: template.borders.radius,
          borderWidth: template.borders.width,
          transitionDuration: template.animations.duration,
          transitionTimingFunction: template.animations.easing,
        }
      }
    };
    
    return `module.exports = ${JSON.stringify(config, null, 2)};`;
  }

  /**
   * Export template in specified format
   */
  exportTemplate(
    template: AdvancedThemeTemplate, 
    options: CSSExportOptions = { format: 'css-variables' }
  ): string {
    const { format, includeComponents = true, prefix = 'vibe' } = options;
    
    switch (format) {
      case 'css-variables':
        const variables = this.generateCSSVariables(template, prefix);
        const components = includeComponents ? this.generateComponentClasses(template, prefix) : '';
        return `${variables}\n\n${components}`;
        
      case 'tailwind-config':
        return this.generateTailwindConfig(template);
        
      case 'js-object':
        return `export const theme = ${JSON.stringify(template, null, 2)};`;
        
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Download template as file
   */
  downloadTemplate(
    template: AdvancedThemeTemplate,
    options: CSSExportOptions = { format: 'css-variables' }
  ): void {
    const content = this.exportTemplate(template, options);
    const fileName = `${template.id}-theme.${this.getFileExtension(options.format)}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'css-variables':
      case 'scss-variables':
        return 'css';
      case 'tailwind-config':
        return 'js';
      case 'js-object':
        return 'js';
      default:
        return 'txt';
    }
  }
}

export const cssGenerator = new CSSGenerator();