# Vibe Lab Styling Architecture - Definitive Guide

## Core Architecture

### 1. Tailwind CSS Only Policy
- ✅ Use ONLY Tailwind CSS utility classes for styling
- ❌ NO custom CSS files or modules
- ❌ NO design system frameworks
- ❌ NO CSS-in-JS solutions
- ❌ NO separate component stylesheets

### 2. Prohibited Files & Patterns
The following are strictly prohibited:
- ❌ `@/lib/design-system/*` - No design system files
- ❌ `*.module.css` - No CSS modules
- ❌ `styles/components/*` - No component-specific stylesheets
- ❌ Custom CSS frameworks or libraries
- ❌ Styled-components or Emotion
- ❌ Custom SCSS/SASS files

### 3. Template System Implementation
Templates (e.g., Linear, Apple, Spotify) must be implemented as:
- ✅ Tailwind class conditionals
- ✅ Theme configuration extensions
- ❌ NO separate CSS files per template

Example:
```typescript
// ✅ CORRECT - Template Variation
function Button({ template = 'default' }) {
  return (
    <button
      className={cn(
        // Base styles
        "px-4 py-2 rounded-md transition-colors",
        // Template variations
        template === 'linear' && "bg-black text-white hover:bg-gray-900",
        template === 'apple' && "bg-white text-black hover:bg-gray-50",
        template === 'spotify' && "bg-green-500 text-white hover:bg-green-600"
      )}
    >
      Click me
    </button>
  );
}
```

### 4. Allowed Files & Modifications

#### globals.css
- ✅ Tailwind directives (@tailwind base, components, utilities)
- ✅ CSS variables for theming
- ❌ NO custom CSS classes
- ❌ NO component styles

```css
/* ✅ CORRECT - globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #020817;
  /* Other theme variables */
}
```

#### tailwind.config.js
- ✅ Theme extensions
- ✅ Color palette definitions
- ✅ Plugin configurations
- ❌ NO custom CSS classes

### 5. Component Implementation Rules

#### Correct Pattern
```typescript
// ✅ CORRECT - Pure Tailwind
export function Card({ variant = 'default' }) {
  return (
    <div className={cn(
      "rounded-lg p-4", // Base styles
      variant === 'elevated' && "shadow-lg",
      variant === 'outlined' && "border border-gray-200"
    )}>
      {children}
    </div>
  );
}
```

#### Incorrect Patterns
```typescript
// ❌ WRONG - Design System Import
import { Card } from '@/lib/design-system';

// ❌ WRONG - CSS Module
import styles from './Card.module.css';

// ❌ WRONG - Styled Components
const StyledCard = styled.div`
  padding: 1rem;
`;
```

### 6. Utility Functions

#### Allowed
```typescript
// ✅ CORRECT - Tailwind class merging utility
import { cn } from '@/lib/utils';

// ✅ CORRECT - Template configuration
const getTemplateClasses = (template: string) => {
  switch(template) {
    case 'linear': return 'bg-black text-white';
    case 'apple': return 'bg-white text-black';
    default: return 'bg-gray-100 text-gray-900';
  }
};
```

## Implementation Checklist

Before committing any component:
- [ ] Uses only Tailwind utility classes
- [ ] No CSS/SCSS imports
- [ ] No design system imports
- [ ] Implements template variations via class conditionals
- [ ] Uses cn() utility for class merging
- [ ] Follows existing color theme
- [ ] Component is self-contained with Tailwind

## Enforcement & Tooling

### Linting Rules
- ESLint rules prohibit CSS/SCSS imports
- Stylelint configured for Tailwind-only
- Git hooks check for prohibited file types

### CI/CD Checks
- Automated checks for prohibited imports
- Style pattern validation in PR reviews
- Component library audit tools

## Migration Guide

When converting components to pure Tailwind:
1. Remove all CSS/design system imports
2. Convert all styles to Tailwind classes
3. Implement template variations using cn()
4. Test across all templates
5. Remove any CSS/design system files

## Questions & Support

For questions about styling implementation:
1. Refer to this document first
2. Check existing components for patterns
3. Use Tailwind documentation
4. Never create custom CSS solutions
