# Vibe Lab Technical Reference

**Document Type**: Technical Implementation Guide
**Status**: Authoritative  
**Purpose**: Complete technical reference for Vibe Lab's API endpoints, schemas, architectural patterns, and implementation specifications.

---

## 1. API Reference

### REST API Endpoints

The API is versioned with base URL at `/api/v1`.

#### Project Management
- `POST /api/v1/projects`: Creates a new project
- `GET /api/v1/projects`: Lists all user projects
- `GET /api/v1/projects/:projectId`: Retrieves project details
- `PUT /api/v1/projects/:projectId`: Updates project details
- `DELETE /api/v1/projects/:projectId`: Archives project (soft delete)
- `GET /api/v1/projects/:projectId/roadmap`: Retrieves project roadmap

#### Project Persistence & Documents
- `GET /api/v1/projects/:projectId/documents`: Retrieves project overview and build specs
- `PUT /api/v1/projects/:projectId/documents`: Updates project documents
- `GET /api/v1/projects/:projectId/versions`: Lists document version history
- `POST /api/v1/projects/:projectId/conversations`: Creates new conversation thread
- `GET /api/v1/projects/:projectId/conversations`: Lists all conversation threads
- `POST /api/v1/projects/:projectId/import`: Imports codebase or external data
- `GET /api/v1/projects/:projectId/export`: Exports project in various formats

#### Task Management  
- `GET /api/v1/projects/:projectId/tasks`: Retrieves all project tasks
- `POST /api/v1/projects/:projectId/tasks`: Creates a new task
- `PUT /api/v1/projects/:projectId/tasks/:taskId/status`: Updates task status
- `POST /api/v1/projects/:projectId/tasks/analyze`: Triggers Task Master analysis

#### Chat & AI Coordination
- `POST /api/v1/chat/coordinate`: Primary endpoint for processing user chat messages and coordinating AI actions

#### Monitoring & Analytics
- `GET /api/v1/monitoring/costs`: Retrieves AI usage cost metrics
- `GET /api/v1/agents/status`: Retrieves current AI agent status

### WebSocket Events

**Connection**: `ws://localhost:3000/ws`
**Authentication**: Send `auth` message with valid token upon connection
**Subscriptions**: Subscribe to event categories (component, pipeline, quality, etc.)

#### Key WebSocket Messages
- `state.update`: Project state change notifications
- `progress.update`: Real-time progress updates for long-running operations
- `error`: Error notifications to client

### Event System Schemas

All events follow standardized `DIASEvent` schema:

```typescript
interface DIASEvent {
  id: string;
  timestamp: Date;
  category: 'Component' | 'Pipeline' | 'Quality' | 'User' | 'System' | 'Integration';
  type: string;
  data: Record<string, unknown>;
  metadata?: {
    source: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
  };
}
```

---

## 2. Onboarding System Technical Specifications

### Conversation Intelligence Engine

Complete 8-step onboarding flow transforming user conversations into application blueprints:

1. **GitHub Sign In** - Authentication and repository access
2. **Project Overview** - Vision, users, features, problem definition  
3. **Build Specifications** - Technical architecture and requirements
4. **Pages** - Main application sections and structure
5. **Sub-Pages** - Nested page hierarchy and navigation
6. **Navigation** - User flow and routing patterns
7. **Components** - Page content and interactive elements
8. **Styling** - Visual design and theming system

**Target**: Complete blueprint in 15-20 minutes with minimal typing through Quick Actions and visual builders.

#### Core Capabilities
```typescript
interface OnboardingAI {
  capabilities: {
    patternRecognition: "Identify project type from initial description";
    inferenceEngine: "Extract 3-5 insights from each user response";
    smartDefaults: "Apply best practices based on project type";
    conversationFlow: "Dynamic question routing based on context";
  };
  
  targets: {
    totalQuestions: "4-6 maximum";
    completionTime: "3-5 minutes";  
    documentCompleteness: "95% without follow-up";
    userSatisfaction: "Feel heard and understood";
  };
}
```

#### Information Extraction Strategy
Multi-layered extraction from single response:
- **Explicit**: Direct statements and requirements
- **Implicit**: Inferred context and assumptions
- **Patterns**: Known project type patterns and templates
- **Sentiment**: User expertise level and confidence
- **Gaps**: Missing critical information identification

#### Project Pattern Library
```typescript
const projectPatterns = {
  "like [X] but for [Y]": {
    type: "familiar-model-new-market",
    inferences: ["feature-set", "user-base", "core-mechanics"],
    followUp: "unique-value-proposition"
  },
  "help [USERS] to [ACTION]": {
    type: "problem-solving-tool", 
    inferences: ["target-audience", "core-feature", "success-metric"],
    followUp: "scale-and-growth"
  },
  "marketplace for [CATEGORY]": {
    type: "two-sided-platform",
    inferences: ["buyer-persona", "seller-persona", "transaction-type"],
    followUp: "monetization-model"
  },
  "AI-powered [FUNCTION]": {
    type: "ai-enhancement-tool",
    inferences: ["automation-target", "data-requirements", "accuracy-needs"],
    followUp: "ai-interaction-model"
  }
};
```

---

## 3. Architectural Patterns Quick Reference

### Staged Initialization Pattern
Three-stage loading system preventing API route hanging:

**Stage 1 (0-1s)**: EventBus for basic connectivity
**Stage 2 (1-5s)**: AI Client and Blueprint Service for core functionality  
**Stage 3 (5-30s)**: Full DIAS intelligence engines with circuit breaker protection

```typescript
class ServiceManager {
  async initializeStaged() {
    // Stage 1: Immediate
    this.eventBus = new EventBus();
    
    // Stage 2: Fast Enhancement  
    this.aiClient = new AIClientService(this.eventBus);
    this.blueprintService = new BlueprintService();
    
    // Stage 3: Background Intelligence
    this.diasEngine = new DIASEngine();
  }
}
```

### Health-Aware Routing
Intelligent request routing to best available service:

```typescript
class HealthAwareRouter {
  route(request: Request): ServiceEndpoint {
    const healthyServices = this.getHealthyServices();
    return this.selectOptimalService(healthyServices, request);
  }
}
```

### Component Registry Pattern
Versioned component storage with dependency tracking:

```typescript
interface ComponentRegistryEntry {
  id: string;
  version: string;
  component: ComponentDefinition;
  dependencies: string[];
  metadata: {
    quality_score: number;
    test_coverage: number;
    performance_metrics: PerformanceData;
  };
}
```

---

## 4. Styling System Reference

### Pure Tailwind Implementation
Zero custom CSS approach with systematic design tokens:

#### Template Variation System
```typescript
interface TailwindTemplate {
  name: string;
  classVariants: {
    button: {
      base: string;
      primary: string;
      secondary: string;
      danger: string;
    };
    input: {
      base: string;
      default: string;
      error: string;
    };
    card: {
      base: string;
      elevated: string;
      outlined: string;
    };
  };
  typography: {
    fonts: {
      primary: string;
      heading: string;
      mono: string;
    };
  };
}
```

#### Component Class Generation
```typescript
function getComponentClasses(
  component: keyof TailwindTemplate['classVariants'],
  options: {
    template: TailwindTemplate;
    variant?: string;
    size?: 'sm' | 'md' | 'lg';
    state?: {
      isActive?: boolean;
      isDisabled?: boolean;
      isLoading?: boolean;
    };
  }
): string {
  // Intelligent class combination with state management
}
```

---

## 5. Preview System Architecture

### Multi-Stage Preview Evolution
Preview system evolving across AVCA pipeline stages:

**Stage 0 (Import)**: Analysis preview of existing codebase conversion to Tailwind
**Stage 2 (Styling)**: Live preview of style template variations  
**Stage 8 (Assembly)**: Full shareable application preview (Post-MVP)

### Template Variation Benefits
- No CSS rebuilds required
- Zero style conflicts
- Instant theme switching
- Consistent component behavior across templates

---

## 6. Future System Capabilities

### Advanced Analytics Integration
- **ML-Powered Optimization**: 30% UX improvement through usage pattern analysis
- **Predictive Quality**: 85% accuracy in quality issue prediction
- **Performance Intelligence**: 25% response time reduction through automated optimization

### Enterprise Scale Features
- **Zero-Downtime Deployment**: Complete deployment without service interruption
- **Advanced Monitoring**: Real-time system health and performance tracking
- **Automated Scaling**: Dynamic resource allocation based on load patterns

### Professional-Grade Capabilities
- **Comprehensive Testing**: >95% test coverage with automated validation
- **Security Compliance**: OWASP Top 10 adherence with automated vulnerability scanning
- **Documentation Generation**: Automated technical documentation with accuracy verification

---

## 7. Implementation Checklists

### SuperClaude Integration Checklist
- [✅] PersonaMapper Service: 11 personas mapped with confidence scoring
- [✅] Enhanced AI Client: Graceful fallback and API integration
- [✅] Context7 MCP Service: Documentation lookup with CLI fallback
- [❌] Sequential MCP: Deep analysis engine (pending implementation)
- [❌] Magic MCP: UI component generation (pending implementation)  
- [❌] Playwright MCP: E2E testing automation (pending implementation)

### Quality Gates Validation
1. **Syntax + AI**: Language parsers + Context7 validation + intelligent suggestions
2. **Type + AI**: Sequential analysis + type compatibility + context-aware suggestions  
3. **Lint + AI**: Context7 rules + quality analysis + refactoring suggestions
4. **Security + AI**: Sequential analysis + vulnerability assessment + OWASP compliance
5. **Test + AI**: Playwright E2E + coverage analysis (≥80% unit, ≥70% integration)
6. **Performance + AI**: Sequential analysis + benchmarking + optimization suggestions
7. **Documentation + AI**: Context7 patterns + completeness validation + accuracy verification
8. **Integration + AI**: Playwright testing + deployment validation + compatibility verification

---

This technical reference consolidates all implementation-specific details, API specifications, and architectural patterns required for Vibe Lab development and integration.