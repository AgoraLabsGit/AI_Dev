# 02 - Vibe Lab UI/UX Blueprint
**Visual Design and User Experience Specifications**

---

## 1. Design Philosophy & Inspiration

### Primary Inspiration
- **Strike Bitcoin Website**: Ultra-dark aesthetic (#0A0A0B), clean typography, minimal design
- **Cursor/Linear Layout**: Efficient navigation, keyboard-driven workflow, information density
- **Developer-Centric**: Optimized for productivity, not decoration

### Design Principles
1. **Ultra-Dark First**: Strike's sophisticated dark theme as foundation
2. **Information Density**: Maximum functionality in minimum space
3. **Keyboard Efficiency**: Every action accessible via shortcuts
4. **AI-Aware Interface**: Clear status indicators for AVCA/DIAS agents
5. **Pure Tailwind**: Zero custom CSS, component-local styling only

## 2. Color System (Strike-Inspired)

### Core Colors (CSS Variables)
```css
/* Backgrounds - Strike's ultra-dark theme */
--background: #0A0A0B;          /* Primary background */
--surface: #111113;              /* Cards, modals */
--surface-elevated: #1A1A1C;     /* Elevated surfaces */

/* Borders */
--border: #1F1F23;              /* Default borders */
--border-strong: #374151;        /* Emphasized borders */

/* Text - Strike's clean hierarchy */
--foreground: #FFFFFF;           /* Primary text */
--foreground-secondary: #A1A1AA; /* Secondary text */
--foreground-muted: #6B7280;     /* Muted text */
--foreground-disabled: #4B5563;  /* Disabled text */

/* Functional colors */
--success: #10B981;             /* Success states */
--warning: #F59E0B;             /* Warning states */
--error: #EF4444;               /* Error states */
--neutral: #6B7280;             /* Neutral states */
```

### Agent Status Colors
- **Developer Agent**: Blue (#3B82F6) - Active generation
- **Auditor Agent**: Purple (#8B5CF6) - Quality review
- **Task Master**: Green (#10B981) - Progress tracking
- **DIAS Intelligence**: Cyan (#06B6D4) - Pattern analysis

## 3. Layout Architecture

### Primary Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: Project Context + AI Status                    │
├─────────────────────────────────────────────────────────┤
│ Main Content Area (Project-Specific Routes)            │
│ /project/[id]/design/...                               │
│ /project/[id]/build/...                                │
│ /project/[id]/deploy/...                               │
└─────────────────────────────────────────────────────────┘
```

### Navigation Hierarchy
1. **Top Level**: Dashboard, Projects List
2. **Project Context**: Import → Design → Build → Deploy  
3. **Stage-Specific**: Blueprints, Styling, Pages, Components
4. **Build Pipeline**: Generate, Quality, Registry, Preview

### Responsive Behavior
- **Desktop**: Full navigation + content area
- **Tablet**: Collapsible navigation + content
- **Mobile**: Bottom tab bar + slide-out navigation

## 4. Core Component System

### Primary Components (Tailwind-Only)
```tsx
// Button Variants
<Button variant="primary | secondary | destructive | ghost" 
        size="sm | md | lg" />

// Cards (Primary Layout Element)
<Card variant="default | elevated | outline" />

// Navigation Items
<NavItem active={boolean} icon={Icon} badge="text | number" />

// AI Status Indicators  
<AgentStatus agent="developer | auditor | taskmaster | dias"
             status="active | idle | thinking | blocked" />

// Form Elements
<Input variant="default | filled | underlined" />
<Select variant="default | minimal" />
<Textarea autoResize={boolean} />
```

### Layout Components
```tsx
// Project Layout Wrapper
<ProjectLayout projectId={string}>
  <ProjectHeader />
  <ProjectNavigation />
  <ProjectContent />
</ProjectLayout>

// Stage-Specific Layouts
<DesignLayout stage="blueprints | styling | pages | components" />
<BuildLayout stage="generate | quality | registry | preview" />
```

## 5. Typography System

### Font Hierarchy (Strike-Inspired)
```css
/* Typography scale - matching Strike */
h1 { @apply text-2xl font-light tracking-tight; }
h2 { @apply text-xl font-light; }
h3 { @apply text-lg font-normal; }

/* Code/Technical Content */
.code { font-family: system-ui, monospace; }
.amount { font-family: system-ui, monospace; }
```

### Text Patterns
- **Page Titles**: H1, light weight, high contrast
- **Section Headers**: H2, secondary color
- **Component Labels**: H3, normal weight
- **Body Text**: Base size, foreground color
- **Technical Data**: Monospace, tabular formatting

## 6. Interaction Patterns

### Keyboard Navigation (Cursor/Linear Style)
- **Cmd+K**: Global command palette (future feature)
- **Tab/Shift+Tab**: Standard navigation
- **Arrow Keys**: List navigation
- **Enter**: Activate primary action
- **Esc**: Cancel/close modals

### AI Interaction Patterns
- **Real-time Status**: Agent indicators show current activity
- **Progress Feedback**: Visual progress bars for long operations
- **Error States**: Clear error messages with recovery actions
- **Success States**: Confirmation with next step suggestions

### Loading & Feedback
- **Skeleton Screens**: For initial content loading
- **Progress Indicators**: For AI processing
- **Optimistic Updates**: For instant feedback
- **Error Boundaries**: Graceful failure handling

## 7. Page-Specific UI Requirements

### Dashboard
- **Project Cards**: Grid layout with status indicators
- **Statistics**: Real-time metrics display
- **Quick Actions**: Create project, import repository

### Design Stages
- **Blueprints**: Document editor with AI assistance
- **Styling**: Theme selector with live preview
- **Pages**: Visual page builder interface
- **Components**: 224-component grid with filtering

### Build Pipeline
- **Generate**: Code generation with real-time preview
- **Quality**: Audit results with pass/fail indicators
- **Registry**: Component registry with search
- **Preview**: Live application preview

## 8. Responsive Design System

### Breakpoints (Tailwind Standard)
- **sm**: 640px and up
- **md**: 768px and up  
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

### Mobile-Specific Patterns
- **Bottom Navigation**: Primary actions accessible by thumb
- **Slide-out Drawers**: For secondary navigation
- **Touch Targets**: Minimum 44px for touch elements
- **Gesture Support**: Swipe navigation where appropriate

## 9. Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Color Contrast**: 4.5:1 minimum for normal text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader**: Proper ARIA labels and semantic HTML

### Developer Experience
- **Fast Navigation**: Minimal clicks to reach any feature
- **Predictable Patterns**: Consistent behavior across pages
- **Clear Hierarchy**: Visual information architecture
- **Efficient Workflows**: Optimized for repeat usage

## 10. Animation & Transitions

### Micro-Interactions (Subtle, Strike-Style)
- **Hover States**: Gentle color transitions (150ms)
- **Focus States**: Smooth ring animations (100ms)
- **Loading States**: Minimal skeleton animations
- **State Changes**: Fade transitions (200ms)

### Performance Constraints
- **60 FPS**: All animations run smoothly
- **Reduced Motion**: Respect user preferences
- **GPU Acceleration**: Use transform/opacity when possible
- **Minimal Impact**: Animations enhance, never distract

---

## Implementation Validation

### Design System Compliance
✅ **Pure Tailwind Only**: All styling uses Tailwind utility classes
✅ **Strike Aesthetic**: Ultra-dark theme implemented
✅ **Component Isolation**: No global CSS conflicts
✅ **Responsive Design**: Mobile-first approach

### UI/UX Success Metrics
- **Task Completion Time**: <30 seconds for common workflows
- **User Satisfaction**: 8.5/10+ for interface usability
- **Accessibility Score**: 95%+ Lighthouse accessibility
- **Performance**: <100ms interaction response time

---

*This blueprint defines the visual foundation for Vibe Lab's Strike-inspired, developer-centric interface.*