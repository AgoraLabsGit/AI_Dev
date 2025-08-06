# Vibe Lab Visual Design System

**Document Type**: Design & Styling Standard
**Status**: Authoritative  
**Purpose**: This document defines the visual design system, styling standards, and aesthetic specifications for Vibe Lab's AI-powered development platform.

---

## 1. Design Philosophy & Aesthetic Foundation

### 1.1. Core Design Principles
- **Primary Inspiration**: Strike Bitcoin (ultra-dark aesthetic) and Linear.app (keyboard-driven efficiency)
- **Ultra-Dark First**: A sophisticated dark theme is the foundation
- **Information Density**: Maximize functionality in minimum space
- **Pure Tailwind**: Zero custom CSS; all styling is component-local
- **Performance-Focused**: Subtle animations that enhance without distraction

### 1.2. Visual Identity
The visual identity balances sophisticated darkness with functional clarity, creating an environment that supports extended development sessions while maintaining visual hierarchy and clarity.

---

## 2. Color System (Strike-Inspired)

### 2.1. Primary Color Variables
The color system uses CSS variables for easy management and consistency:

**Background Colors**:
- `--background: #0A0A0B` - Primary background
- `--surface: #111113` - Elevated surfaces and cards

**Text Colors**:
- `--foreground: #FFFFFF` - Primary text color
- `--foreground-secondary: #A1A1AA` - Secondary/muted text

**Border Colors**:
- `--border: #1F1F23` - Default border color for subtle separation

### 2.2. Functional Color System
Specific colors defined for different functional states:

**Status Colors**:
- **Complete**: `#10B981` (Green) - For completed actions and positive feedback
- **In Progress**: `#F97316` (Orange) - For active processes and pending actions
- **Error**: `#EF4444` (Red) - For error states and critical feedback
- **Inactive**: `#6B7280` (Gray) - For disabled or inactive states

**AI Agent Status Colors**:
- Distinct colors for different AI agent states (thinking, active, complete, error)
- Consistent across all interface components
- Clear visual differentiation for multiple concurrent agents

### 2.3. CSS Variables Implementation
```css
:root {
  --background: #0A0A0B;
  --surface: #111113;
  --foreground: #FFFFFF;
  --foreground-secondary: #A1A1AA;
  --border: #1F1F23;
  
  /* Status colors */
  --status-complete: #10B981;
  --status-progress: #F97316;
  --status-error: #EF4444;
  --status-inactive: #6B7280;
}
```

---

## 3. Typography System

### 3.1. Font Hierarchy
Following Strike's clean, lightweight typography style:

**Heading Styles**:
- Clear hierarchy for H1-H6 headings
- Consistent spacing and weight progression
- Optimized for dark backgrounds

**Body Text Styles**:
- Primary body text for general content
- Secondary text for supporting information
- Muted text for less important details

**Technical/Code Content**:
- Monospace font family for code display
- Syntax highlighting compatible colors
- Consistent formatting for technical content

### 3.2. Typography Guidelines
- Maintain high contrast ratios for accessibility
- Use consistent line heights for readability
- Ensure scalability across different screen sizes
- Optimize for extended reading sessions

---

## 4. Layout Architecture

### 4.1. Primary Structure Components
**Header System**:
- Project context display
- AI status indicators
- Global navigation elements

**Main Content Areas**:
- Stage-specific route displays
- Flexible content layouts
- Context-sensitive toolbars

**Sidebar Systems**:
- Navigation sidebar with collapsible sections
- Context-sensitive tool panels
- File browser and directory views

### 4.2. Responsive Behavior
**Desktop Layout**:
- Full three-column view with maximum information density
- Optimized for development workflows
- Multi-panel interfaces for complex tasks

**Tablet Layout**:
- Two-column layout with collapsible sidebar
- Touch-optimized interaction elements
- Adaptive content prioritization

**Mobile Layout**:
- Tab-based interface with swipe navigation
- Simplified interaction patterns
- Essential functionality preservation

**Breakpoint System**:
- Standard Tailwind responsive breakpoints
- Consistent behavior across components
- Progressive enhancement approach

---

## 5. Animation & Transitions

### 5.1. Animation Principles
**Performance-Focused**:
- GPU-accelerated animations where possible
- Minimal impact on page performance
- Consistent timing functions

**Subtle Enhancement**:
- Animations enhance without distraction
- Support user understanding of state changes
- Provide immediate feedback for interactions

### 5.2. Standard Animation Patterns
**Hover States**:
- Subtle color transitions
- Consistent timing across components
- Clear indication of interactive elements

**Focus States**:
- Keyboard navigation support
- Clear visual indication of current focus
- Consistent across all interactive elements

**Loading Indicators**:
- AI processing states
- Data loading feedback
- Progress indication for long operations

**State Transitions**:
- Smooth transitions between interface states
- Clear indication of system changes
- Support for user mental models

---

## 6. Component Styling Standards

### 6.1. Button System
**Primary Buttons**:
- High-contrast design for primary actions
- Consistent sizing and spacing
- Clear hover and focus states

**Secondary Buttons**:
- Lower visual weight for secondary actions
- Consistent styling with primary system
- Clear interaction feedback

**Icon Buttons**:
- Minimal design with clear affordances
- Consistent sizing across contexts
- Tooltip support for clarity

### 6.2. Form Elements
**Input Fields**:
- Dark theme optimized
- Clear focus and error states
- Consistent placeholder styling

**Selection Elements**:
- Dropdown and select styling
- Checkbox and radio button design
- Multi-select component styling

### 6.3. Navigation Elements
**Sidebar Navigation**:
- Hierarchical structure support
- Active state indication
- Collapsible section styling

**Tab Systems**:
- Clear active/inactive states
- Consistent spacing and alignment
- Support for icon + text combinations

---

## 7. Template Variation System

### 7.1. Architecture Overview
Different visual styles (Apple, Linear, Strike) applied by swapping Tailwind class sets:

**Benefits**:
- No CSS rebuilds required
- Zero style conflicts
- Instant theme switching
- Consistent component behavior across templates
- Easy A/B testing of design systems

### 7.2. Implementation Strategy
**Class Set Management**:
- Organized class collections for each template
- Consistent component APIs across templates
- Dynamic class application system

**Template Switching**:
- Real-time template switching without rebuilds
- User preference storage
- Seamless transition between styles

---

## 8. Accessibility & Usability Standards

### 8.1. Color Accessibility
- High contrast ratios for all text/background combinations
- Color-blind friendly palette choices
- Alternative indicators beyond color alone

### 8.2. Interaction Accessibility
- Keyboard navigation support for all interfaces
- Screen reader compatible markup
- Clear focus indicators and interaction feedback

### 8.3. Responsive Accessibility
- Touch-friendly interaction targets on mobile
- Readable text sizes across all devices
- Consistent interaction patterns across breakpoints

---

## 9. Component Implementation Examples

### 9.1. Roadmap Component - Strike Bitcoin Ultra-Dark Theme

**Design Principles**:
- Pure Tailwind implementation with zero custom CSS
- Ultra-dark theme using `#0A0A0B` and `#111113` backgrounds
- Strike-inspired minimal borders and subtle shadows
- Information-dense layout maximizing content visibility
- Keyboard-ready expandable sections

**Key Styling Patterns**:

**Phase Cards**:
```tsx
className={cn(
  "relative mb-4 rounded-lg transition-all duration-300",
  "bg-[#111113] border border-[#1F1F23]",
  isActive && "ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
  !isActive && "hover:border-[#2A2A2E]"
)}
```

**Status Bookmarks**:
```tsx
const statusBookmarks = {
  'not-started': 'bg-gray-800 text-gray-500',
  'in-progress': 'bg-orange-600 text-orange-100', 
  'complete': 'bg-green-600 text-green-100',
  'error': 'bg-red-600 text-red-100'
};
```

**Validation Rings**:
```tsx
const rings = {
  'not-started': 'border-[#1F1F23] bg-[#0A0A0B]',
  'in-progress': 'border-orange-500/50 bg-orange-500/10',
  'complete': 'border-green-500/50 bg-green-500/10',
  'error': 'border-red-500/50 bg-red-500/10'
};
```

**Animation States**:
- Error pulse: `animate-pulse` with red indicators
- In-progress: `animate-ping` with orange border
- Hover scaling: `hover:scale-110` for interactive elements
- Smooth transitions: `transition-all duration-300`

**Information Density Features**:
- Collapsible sections with chevron indicators
- Progress bars with gradient backgrounds
- Minimal task items with hover-revealed details
- Compact status indicators with tooltip support

This roadmap implementation exemplifies the Strike-inspired aesthetic with maximum functionality in minimal space, following all established design system principles.

---

This visual design system ensures Vibe Lab maintains a cohesive, professional, and accessible aesthetic while supporting the complex workflows of AI-powered development.