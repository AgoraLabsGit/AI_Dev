# Vibe Lab Design System Rules

## Core Principles

### 1. **Tailwind CSS Only**
- Use ONLY Tailwind CSS for all styling
- NO custom CSS frameworks or design systems
- NO separate CSS files for components
- All styling must use Tailwind utility classes

### 2. **Never Create These Files**
- ❌ `@/lib/design-system/*` (any design system files)
- ❌ `component.module.css` (no CSS modules)
- ❌ `styles/components/*` (no component-specific stylesheets)
- ❌ Additional CSS frameworks or libraries

### 3. **Template System**
- 15 style templates (Linear, Apple, Spotify, etc.) implemented as Tailwind class variations
- Templates use conditional classes, NOT separate CSS files
- Template variations achieved through Tailwind theme configuration
- Example: `className={template === 'linear' ? 'bg-black text-white' : 'bg-white text-black'}`

### 4. **Component Styling**
```typescript
// ✅ CORRECT - Pure Tailwind
export function Button({ variant }) {
  return (
    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
      Click me
    </button>
  );
}

// ❌ WRONG - Custom CSS system
import { Button } from '@/lib/design-system';
import styles from './button.module.css';
```

### 5. **File Modification Rules**
- ✅ Create new components with Tailwind classes
- ✅ Use `cn()` utility from `@/lib/utils` for conditional classes
- ❌ NEVER modify `globals.css` (except for adding Tailwind directives)
- ❌ NEVER modify `tailwind.config.js` (except for extending theme)
- ❌ NEVER create new CSS files

### 6. **Available Utilities**
```typescript
// Use these existing utilities
import { cn } from '@/lib/utils'; // For conditional classes

// Available color classes from your theme
bg-background, text-foreground
bg-card, text-card-foreground
bg-primary, text-primary-foreground
bg-muted, text-muted-foreground
border, ring, border-input
```

## Implementation Checklist

Before creating ANY component:
- [ ] Uses only Tailwind utility classes
- [ ] No custom CSS imports
- [ ] No design system imports
- [ ] Works with existing color theme
- [ ] Follows template variation pattern

## AI Assistant Instructions

When building components for Vibe Lab:
1. Use pure Tailwind CSS classes exclusively
2. Never create custom design system files
3. Follow the existing patterns in the codebase
4. Template variations = different Tailwind classes, not different CSS files