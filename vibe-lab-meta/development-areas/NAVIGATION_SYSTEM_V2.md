# Vibe Lab Navigation System V2

## Current Implementation Structure

### Core Navigation Flow
```
/project/[projectId]/
├── dashboard/           # Project overview & metrics
│   ├── Progress tracking
│   ├── AI agent status
│   └── Quick actions
│
├── import/ (Stage 0)    # Initial project setup
│   ├── Repository analysis
│   ├── Code import
│   └── Initial setup
│
├── design/             # Design workspace (Stages 1-4)
│   ├── blueprints/    # Stage 1: Project requirements
│   ├── styling/       # Stage 2: Theme & design system
│   ├── pages/         # Stage 3: Layout & flows
│   └── components/    # Stage 4: 224 component system
│
└── build/             # Build workspace (Stages 5-8)
    ├── generate/      # Stage 5: Code generation
    ├── quality/       # Stage 6: Quality gates
    ├── registry/      # Stage 7: Component registry
    └── preview/       # Stage 8: Live preview

```

### Navigation Principles

1. **Stage-Based Organization**
   - Clear progression through AVCA pipeline stages
   - Each stage builds on previous work
   - Visual progress indicators
   - Stage dependencies enforced

2. **Context Awareness**
   - Project-specific navigation
   - Stage-appropriate tools and actions
   - AI agent status visibility
   - Progress tracking at all levels

3. **Quick Actions**
   - Stage-specific actions
   - Common operations readily available
   - AI assistance accessible
   - Direct stage navigation

4. **Visual Hierarchy**
   - Clear stage progression
   - Active stage highlighting
   - Progress visualization
   - Status indicators

## Implementation Details

### Project Dashboard
```typescript
interface DashboardFeatures {
  overview: {
    progress: "Overall project status",
    metrics: "Key performance indicators",
    activity: "Recent actions & updates"
  },
  quickActions: {
    import: "Stage 0 entry point",
    design: "Design workspace access",
    build: "Build pipeline entry"
  },
  aiStatus: {
    developer: "Code generation status",
    auditor: "Quality review status",
    dias: "System intelligence status"
  }
}
```

### Stage Navigation
```typescript
interface StageNavigation {
  status: "pending" | "in_progress" | "completed",
  access: {
    enabled: boolean,
    requirementsMet: boolean
  },
  actions: {
    primary: "Main stage action",
    secondary: string[],
    ai: "Available AI operations"
  },
  progress: {
    current: number,
    total: number,
    metrics: StageMetrics
  }
}
```

### UI Components
- Pure Tailwind implementation
- Template-based styling
- Responsive design
- Keyboard navigation support

## Stage-Specific Features

### Import (Stage 0)
- Repository analysis
- Code import tools
- Initial setup wizards
- Technology stack detection

### Design (Stages 1-4)
- Blueprint creation & management
- Theme configuration
- Page builder interface
- Component system management

### Build (Stages 5-8)
- Code generation controls
- Quality gate monitoring
- Registry management
- Preview environment

## Navigation States

### 1. Project Context
```typescript
interface ProjectContext {
  id: string,
  name: string,
  currentStage: PipelineStage,
  progress: {
    overall: number,
    stageProgress: Record<PipelineStage, number>
  }
}
```

### 2. Stage Access Control
```typescript
interface StageAccess {
  isAccessible: boolean,
  requirements: {
    previousStageComplete: boolean,
    dependenciesMet: boolean,
    aiReady: boolean
  },
  restrictions: string[]
}
```

### 3. AI Integration
```typescript
interface AINavigation {
  availableAgents: {
    developer: boolean,
    auditor: boolean,
    dias: boolean
  },
  suggestedActions: string[],
  stageSpecificHelp: string[]
}
```

## Future Considerations

1. **Stage Extensions**
   - Additional workspace types
   - Custom stage definitions
   - Plugin integration points

2. **AI Enhancement**
   - Predictive navigation
   - Context-aware suggestions
   - Workflow optimization

3. **Team Features**
   - Collaboration tools
   - Role-based navigation
   - Shared workspaces

Note: This navigation system will evolve as we build out Vibe Lab using AVCA and DIAS. The structure is designed to be flexible and adaptable to emerging requirements and patterns discovered during development.