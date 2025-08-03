# Vibe Lab Tailwind-Only Architecture

## Core Principles

1. **Pure Tailwind Only**
- ✅ Use Tailwind utility classes exclusively
- ❌ NO custom CSS files
- ❌ NO CSS modules
- ❌ NO design system frameworks
- ❌ NO styled-components or other CSS-in-JS

2. **Template Variations**
- ✅ Implement through Tailwind class conditionals
- ✅ Keep all styling component-local
- ❌ NO separate CSS files for variations
- ❌ NO design system imports

3. **globals.css Restrictions**
- ✅ Tailwind directives only
- ✅ CSS variables for theming if needed
- ❌ NO custom CSS classes
- ❌ NO component styles

## Validation & Enforcement

### Pre-Commit Checks
```bash
# Check for non-Tailwind CSS usage
npm run check:tailwind-only

# Validate component styling
npm run validate:components
```

### What's Checked
- No `.css` files except `globals.css`
- No `@import` statements
- No CSS modules (`.module.css`)
- No styled-components or other CSS-in-JS
- Proper Tailwind class usage

## Component Architecture

### Platform Components
```tsx
// ✅ CORRECT: Pure Tailwind
const Button = ({ children }) => (
  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
    {children}
  </button>
)

// ❌ WRONG: Custom CSS
const Button = styled.button`
  background: blue;
  color: white;
`
```

### Template Variations
```tsx
// ✅ CORRECT: Tailwind conditional classes
const Button = ({ template = 'default', ...props }) => {
  const styles = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2',
    apple: 'bg-gray-100 hover:bg-gray-200 text-black rounded-lg px-6 py-2',
    material: 'bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3'
  }

  return <button className={styles[template]} {...props} />
}

// ❌ WRONG: Separate CSS files for templates
import './button.css'
import './button.apple.css'
```

## Why This Matters

The December 2024 critical failure occurred because:
1. Mixed styling approaches led to conflicts
2. Custom CSS files corrupted the build
3. Design system imports caused cascading failures

This pure Tailwind approach prevents these issues by:
1. Maintaining strict architectural boundaries
2. Eliminating CSS conflicts
3. Keeping all styling component-local
4. Making templates explicit and traceable

## Automated Enforcement

Every commit is checked for:
1. No custom CSS files
2. No design system imports
3. Valid Tailwind class usage
4. Component-local styling
5. Proper template implementation

## Recovery Process

If you find non-compliant code:
1. Identify all custom CSS files
2. Convert styles to Tailwind classes
3. Remove design system imports
4. Update component templates
5. Run validation suite

Remember: The platform's stability depends on maintaining this pure Tailwind architecture.