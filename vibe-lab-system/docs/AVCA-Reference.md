# AVCA (AI-Verified Component Architecture) Reference

## Component Atomic Types

### 1. UI Components
```typescript
interface UIComponent {
  name: string;
  props: TypedProps;
  render: () => JSX.Element;
  styles: TailwindClasses;
  accessibility: A11yRequirements;
}
// Examples: Button, Card, Modal, CommandPalette, DualChatInterface
```

### 2. Logic Modules
```typescript
interface LogicModule {
  name: string;
  dependencies: string[];
  exports: Function | Object;
  sideEffects: boolean;
}
// Examples: useAuth, useProject, apiClient, validators
```

### 3. Data Patterns
```typescript
interface DataPattern {
  model: PrismaModel;
  schema: ZodSchema;
  migrations: Migration[];
  seeds?: SeedData;
}
// Examples: UserModel, ProjectSchema, TaskValidator
```

### 4. Infrastructure
```typescript
interface Infrastructure {
  config: EnvironmentConfig;
  scripts: DeploymentScript[];
  monitoring: HealthCheck[];
}
// Examples: next.config.js, docker-compose.yml, .env.example
```

### 5. Integration Patterns
```typescript
interface IntegrationPattern {
  service: ExternalService;
  wrapper: AbstractionLayer;
  fallback: ErrorStrategy;
  testing: MockStrategy;
}
// Examples: StripePayments, AuthProvider, EmailService
```

### 6. Workflow Patterns
```typescript
interface WorkflowPattern {
  steps: WorkflowStep[];
  transitions: StateTransition[];
  rollback: RollbackStrategy;
}
// Examples: PaymentFlow, OnboardingSequence, FileUploadPipeline
```

### 7. Cross-Cutting Patterns
```typescript
interface CrossCuttingPattern {
  targets: ComponentType[];
  implementation: Middleware | HOC | Hook;
  configuration: Config;
}
// Examples: ErrorBoundary, Logger, CacheProvider, SecurityWrapper
```

### 8. Capability Providers
```typescript
interface CapabilityProvider {
  need: string;
  preferred: Library;
  alternatives: Library[];
  selectionCriteria: Criteria;
}
// Examples: date-formatting → date-fns, state → zustand
```

## Pipeline Stages

### Stage 1: Ideation → Blueprints
- **Input**: User chat messages
- **Output**: 15 blueprint documents
- **Worker**: Claude Chat
- **Duration**: 5-10 minutes
- **Validation**: Blueprint completeness check

### Stage 2: Blueprints → Styling  
- **Input**: Blueprint documents
- **Output**: style-config.json, design-tokens.js
- **Worker**: Theme UI + AI
- **Duration**: 2-3 minutes
- **Validation**: Accessibility compliance

### Stage 3: Styling → Page Designs
- **Input**: Style config + blueprints
- **Output**: Page layouts with component mapping
- **Worker**: Claude Designer
- **Duration**: 10-15 minutes
- **Validation**: Component coverage check

### Stage 4: Page Designs → Component Specs
- **Input**: Page designs
- **Output**: component_requirements.json
- **Worker**: Python Analyzer
- **Duration**: 1-2 minutes
- **Validation**: Dependency resolution

### Stage 5: Component Specs → Code Generation
- **Input**: Component specifications
- **Output**: Component code + tests
- **Worker**: Gemini + Magic MCP
- **Duration**: 30 seconds per component
- **Validation**: Type checking, linting

### Stage 6: Code → Verification
- **Input**: Generated code
- **Output**: Quality report
- **Worker**: Jest + Claude Auditor
- **Duration**: 1-2 minutes per component
- **Validation**: 80% coverage, security scan

### Stage 7: Verification → Registry
- **Input**: Verified components
- **Output**: Registry entries
- **Worker**: Python Manager
- **Duration**: 10 seconds
- **Validation**: Version conflicts

### Stage 8: Registry → Assembly
- **Input**: All components
- **Output**: Complete application
- **Worker**: Task Master
- **Duration**: 2-5 minutes
- **Validation**: Build success, performance

## Quality Gates

```typescript
interface QualityGate {
  coverage: { min: 80 };
  security: { min: 9.0 };
  performance: { min: 90 };
  accessibility: { standard: 'WCAG_AA' };
  typing: { strict: true };
}
```

## Registry Schema

```sql
CREATE TABLE component_registry (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- atomic unit type
  version VARCHAR(20) NOT NULL,
  props_schema JSONB NOT NULL,
  dependencies JSONB DEFAULT '[]',
  quality_scores JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_component_type ON component_registry(type);
CREATE INDEX idx_quality_scores ON component_registry((quality_scores->>'overall'));
```

## Component Linking

```typescript
// Component declares needs
interface ComponentNeeds {
  logic: string[];      // ["useAuth", "useProject"]
  data: string[];       // ["UserModel", "ProjectModel"]  
  infrastructure: string[]; // ["API_URL", "AUTH_TOKEN"]
  capabilities: string[];   // ["date-formatting", "validation"]
}

// Auto-wiring at build time
function resolveComponentDependencies(component: Component): ResolvedComponent {
  const logic = needs.logic.map(name => registry.getLogicModule(name));
  const data = needs.data.map(name => registry.getDataPattern(name));
  // ... resolve all needs
  return wireComponent(component, { logic, data, infrastructure, capabilities });
}
```