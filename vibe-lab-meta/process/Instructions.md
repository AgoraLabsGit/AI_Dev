x# Cursor AI Instructions - Vibe Lab Project

## Project Context
You are working on Vibe Lab, an AI-powered development platform that uses AVCA (AI-Verified Component Architecture) for component management and DIAS (Dynamic Intelligence & Adaptation System) for intelligent system behavior.

## Key Principles

### 1. Always Follow AVCA Standards
- Every component must belong to one of 8 atomic unit types
- All components must pass quality gates before registry admission
- Minimum 80% test coverage required
- Components must declare their dependencies explicitly

### 2. Use Existing Patterns
- Check component registry before creating new components
- Extend existing components rather than duplicating
- Follow established naming conventions
- Reuse tested patterns from the registry

### 3. Pipeline Awareness
- Know which pipeline stage you're implementing
- Respect input/output contracts between stages
- Include AI recommendations and feedback at each stage
- Implement approval flow (approve/refine/reject/bookmark)

### 4. Error Handling
- Log all errors to ErrorCollector for DIAS analysis
- Implement graceful degradation
- Provide meaningful error messages
- Include recovery strategies

## Code Style Guidelines

### TypeScript
```typescript
// Use interfaces for data structures
interface ComponentSpec {
  name: string;
  type: AtomicUnitType;
  dependencies: ComponentNeeds;
}

// Use classes for workers
class ComponentGenerator extends AIWorker {
  async generate(spec: ComponentSpec): Promise<Component> {
    // Implementation
  }
}

// Use enums for constants
enum PipelineStage {
  IDEATION = 'ideation',
  BLUEPRINTS = 'blueprints',
  // ...
}
```

### React Components
```typescript
// Functional components with TypeScript
interface ProjectCardProps {
  project: Project;
  onUpdate?: (project: Project) => void;
}

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  // Always use hooks from registry
  const { user } = useAuth();
  const { updateProject } = useProject(project.id);
  
  return (
    <Card className="project-card">
      {/* Component content */}
    </Card>
  );
}
```

### Testing
```typescript
// Test file naming: ComponentName.test.tsx
describe('ProjectCard', () => {
  it('should render project information', () => {
    // Arrange
    const mockProject = createMockProject();
    
    // Act
    render(<ProjectCard project={mockProject} />);
    
    // Assert
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
  });
  
  it('should handle updates when onUpdate provided', async () => {
    // Test interaction
  });
});
```

## Common Patterns

### Registry Integration
```typescript
// Always check registry first
const existing = await registry.find('ProjectCard');
if (existing) {
  return existing.extend(newRequirements);
}

// Register new components
await registry.register({
  name: 'ProjectCard',
  type: 'ui-component',
  props: schema,
  quality: testResults
});
```

### DIAS Integration
```typescript
// Report to DIAS for learning
dias.learningSystem.track({
  action: 'component.created',
  component: 'ProjectCard',
  context: currentContext
});

// Get intelligent suggestions
const suggestions = await dias.predictor.suggestNext(currentComponents);
```

### Pipeline Stage Implementation
```typescript
class BlueprintStage implements PipelineStage {
  async execute(input: StageInput): Promise<StageOutput> {
    // 1. Process input
    const processed = await this.process(input);
    
    // 2. Get AI recommendations
    const recommendations = await this.getRecommendations(processed);
    
    // 3. Apply and get feedback
    const result = await this.applyWithFeedback(processed, recommendations);
    
    // 4. Approval flow
    const approved = await this.approvalFlow(result);
    
    return approved;
  }
}
```

## File Organization

```
vibe-lab/
├── lib/
│   ├── avca/              # AVCA system
│   │   ├── registry/      # Component registry
│   │   ├── templates/     # Atomic unit templates
│   │   └── pipeline/      # Pipeline stages
│   ├── dias/              # DIAS system
│   │   ├── modules/       # Intelligence modules
│   │   ├── workflows/     # Adaptation workflows
│   │   └── events/        # Event handlers
│   └── integration/       # AVCA-DIAS integration
├── components/
│   ├── ui/               # UI atomic units
│   ├── logic/            # Logic modules
│   └── workflows/        # Workflow patterns
├── app/                  # Next.js app directory
└── docs/
    └── reference/        # Reference documentation
```

## Performance Considerations

1. **Use React.memo() for expensive components**
2. **Implement virtual scrolling for long lists**
3. **Lazy load components not needed on initial render**
4. **Cache API responses appropriately**
5. **Use optimistic updates for better UX**

## Security Requirements

1. **Validate all inputs (especially from AI)**
2. **Sanitize user-generated content**
3. **Use environment variables for secrets**
4. **Implement proper authentication checks**
5. **Follow OWASP guidelines**

## AI-Specific Instructions

When implementing AI workers:
1. **Always enhance prompts with context**
2. **Validate AI responses before using**
3. **Implement retry logic for AI calls**
4. **Log AI interactions for debugging**
5. **Provide fallbacks for AI failures**

## Testing Requirements

Every PR must include:
1. **Unit tests for new functions**
2. **Integration tests for API endpoints**
3. **Component tests for UI elements**
4. **E2E tests for critical workflows**
5. **Performance benchmarks for slow operations**

## Documentation

Always update:
1. **TypeScript interfaces when adding props**
2. **README when adding new features**
3. **API docs when adding endpoints**
4. **Architecture docs when changing patterns**