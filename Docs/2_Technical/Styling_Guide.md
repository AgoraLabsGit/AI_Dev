# Vibe Lab Styling Guide

**Document Type**: Technical Standard & Creative Framework
**Status**: Authoritative
**Purpose**: This document is the single source of truth for all styling in the Vibe Lab ecosystem. It defines both the strict technical architecture that all code must follow and the creative templates that guide our visual design.

---

## 1. Core Architecture: The "Pure Tailwind" Policy

Our styling architecture is built on one simple, non-negotiable rule: **we use Tailwind CSS exclusively.** This ensures consistency, maintainability, and a highly efficient development workflow.

### **1.1. Prohibited Files & Patterns**
The following are **strictly prohibited** and will be blocked by our CI/CD pipeline:
-   NO custom CSS files (`*.css`, `*.scss`) except for `globals.css`.
-   NO CSS-in-JS solutions (e.g., Styled Components, Emotion).
-   NO external design system frameworks or component libraries.
-   NO component-specific stylesheets (e.g., `Card.module.css`).

### **1.2. Allowed Files & Modifications**

#### **`globals.css`**
This is the **only** CSS file allowed outside of the Tailwind configuration. Its use is restricted to:
-   ✅ Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`).
-   ✅ CSS variables for theming (e.g., `--background`, `--foreground`).
-   ❌ **NO** custom CSS classes or component styles.

#### **`tailwind.config.js`**
This file is used to:
-   ✅ Extend the theme (e.g., defining colors, fonts, spacing).
-   ✅ Configure Tailwind plugins.
-   ❌ **NO** custom CSS classes.

### **1.3. Component Implementation Rules**
All components **must** be styled using only Tailwind utility classes.
-   Use the `cn` utility for merging conditional classes.
-   Implement all variations (e.g., `variant`, `size`) as conditional classes within the component itself.

**✅ Correct Pattern:**
```typescript
// A self-contained component using pure Tailwind for all styling.
export function Button({ variant = 'default' }) {
  return (
    <button
      className={cn(
        // Base styles
        "px-4 py-2 rounded-md transition-colors",
        // Variant styles
        variant === 'primary' && "bg-blue-500 text-white hover:bg-blue-600",
        variant === 'secondary' && "bg-gray-200 text-gray-800 hover:bg-gray-300"
      )}
    >
      Click me
    </button>
  );
}
```

---

## 2. Template System: Inspiration & Creative Framework

While our implementation is strict, our creative framework is flexible. We use a template system inspired by best-in-class web applications to define the aesthetic for a generated project. The following templates provide the high-level visual direction.

### **2.1. "Linear Style" - Modern SaaS Professional**
-   **Inspiration:** Linear.app, Vercel
-   **Characteristics:** Dark mode, clean typography, angular gradients, glassmorphism.
-   **Perfect For:** Developer tools, SaaS platforms, productivity apps.

### **2.2. "Apple Minimalism" - Clean & Premium**
-   **Inspiration:** Apple.com, Tesla.com
-   **Characteristics:** Abundant whitespace, large headlines, high-quality product imagery.
-   **Perfect For:** E-commerce, luxury brands, product showcases.

### **2.3. "Spotify Vibrant" - Colorful & Dynamic**
-   **Inspiration:** Spotify.com, Discord.com
-   **Characteristics:** Vibrant accent colors, heavy use of border-radius, playful animations.
-   **Perfect For:** Entertainment, creative tools, social platforms.

### **2.4. "Mailchimp Friendly" - Approachable & Human**
-   **Inspiration:** Mailchimp.com, Slack.com
-   **Characteristics:** Soft corners, quirky illustrations, a mix of serif and sans-serif fonts.
-   **Perfect For:** Marketing tools, small business software, educational platforms.

### **2.5. "Corporate Professional" - Trustworthy & Established**
-   **Inspiration:** IBM.com, Microsoft.com
-   **Characteristics:** Rigid grid systems, conservative layouts, professional fonts (Arial, Helvetica).
-   **Perfect For:** Enterprise software, financial services, B2B platforms.

---

## 3. Implementation Checklist

Before committing any component, ensure it meets these criteria:
-   [ ] Uses only Tailwind utility classes.
-   [ ] Contains no custom CSS, SCSS, or CSS-in-JS.
-   [ ] Implements all template variations via conditional classes.
-   [ ] Is fully self-contained and does not rely on external stylesheets.
-   [ ] Follows the visual direction of the chosen template.
