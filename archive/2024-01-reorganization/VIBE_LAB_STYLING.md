# Vibe Lab Platform Styling Guide

## Core Architecture

This document outlines how we build the Vibe Lab platform itself, NOT the component system we provide to users.

### 1. Pure Tailwind Implementation
- ✅ Use ONLY Tailwind utility classes for styling
- ❌ NO custom CSS files or modules
- ❌ NO design system frameworks
- ❌ NO CSS-in-JS solutions
- ❌ NO separate component stylesheets

### 2. Platform Color Scheme
```typescript
// Core platform colors - used throughout Vibe Lab's interface
const platformColors = {
  background: '#0D0D0D',
  surface: '#161618',
  border: '#2A2A2E',
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA'
  },
  accent: {
    blue: '#3B82F6',
    purple: '#8B5CF6'
  }
};
```

### 3. Platform Component Rules
- Components must use direct Tailwind classes
- No template variations in platform components
- Consistent dark theme across the platform
- Focus on performance and maintainability

Example:
```tsx
// ✅ CORRECT - Platform component
function VibeLabHeader() {
  return (
    <header className="bg-[#161618] border-b border-[#2A2A2E] px-6 py-4">
      <h1 className="text-white font-medium">Vibe Lab</h1>
    </header>
  );
}

// ❌ WRONG - Don't use template variations for platform
function VibeLabHeader({ template }) {
  return (
    <header className={template === 'dark' ? '...' : '...'}>
      ...
    </header>
  );
}
```

### 4. File Structure
```
vibe-lab-product/
├── src/
│   ├── components/        # Platform UI components
│   │   ├── ui/           # Core UI elements
│   │   ├── navigation/   # Navigation components
│   │   └── layout/       # Layout components
│   └── styles/
│       └── globals.css   # Only Tailwind directives
```

### 5. Styling Patterns

#### Component Pattern
```tsx
// Use consistent patterns for platform components
export function PlatformComponent({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "bg-[#161618] rounded-lg p-4",
      className
    )}>
      {children}
    </div>
  );
}
```

#### Layout Pattern
```tsx
// Consistent layout structure
export function PlatformLayout() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <nav className="border-b border-[#2A2A2E]">...</nav>
      <main className="flex">
        <aside className="w-64 border-r border-[#2A2A2E]">...</aside>
        <div className="flex-1">...</div>
      </main>
    </div>
  );
}
```

### 6. Prohibited Patterns
- ❌ No CSS/SCSS imports
- ❌ No CSS modules
- ❌ No styled-components or Emotion
- ❌ No dynamic themes for platform UI
- ❌ No custom design system files

### 7. Development Tools
- ESLint rules enforce Tailwind-only
- Prettier formats Tailwind classes
- TypeScript for component props
- Tailwind IntelliSense for autocompletion

## Implementation Checklist

Before committing platform changes:
- [ ] Uses only Tailwind utility classes
- [ ] Follows platform color scheme
- [ ] No custom CSS/design system imports
- [ ] Consistent with existing patterns
- [ ] Maintains dark theme
- [ ] Responsive design implemented
- [ ] Accessibility maintained

## Questions & Support

For questions about platform styling:
1. Refer to this document
2. Check existing platform components
3. Use Tailwind documentation
4. Never create custom CSS solutions