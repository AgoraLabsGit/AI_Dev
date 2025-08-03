# Vibe Lab Development Methodology

## 1. Core Principles

Our development methodology is built on a set of core principles that guide our architectural and process decisions. It is designed to ensure we build a robust, maintainable, and scalable system while moving quickly.

*   **Build Product-First, Extract System Later**: We build features directly in the `vibe-lab-product` to ensure they are validated against real-world use cases. The generic, core-system components are then extracted into `vibe-lab-system` only after they have been proven effective.
*   **Event-Driven Architecture**: The system is built on an event-driven model. This provides loose coupling between services, allows for easy addition of monitoring and debugging, and creates a highly observable system.
*   **Modular by Default**: Every component and service is designed to be independently testable and deployable. We enforce clean interfaces between components to enable parallel development and reduce system complexity.
*   **Conservative Defaults**: We begin with safe, conservative configurations (e.g., API rate limits) and only increase them based on observed, real-world usage data. This approach prevents production issues and ensures stability.

## 2. Meta-Process & Efficiency

Our methodology embraces the use of AI as a core part of the development process itself. This "meta-process" is a key part of our strategy.

*   **AI-Assisted Development is Standard**: We leverage AI for everything from code generation to documentation and testing. This has consistently proven to be 3-5x faster than traditional methods while maintaining high quality.
*   **Cost is a Feature**: We treat the operational cost of our AI systems as a primary metric. Cost-optimization is not an afterthought; it is a continuous part of the development and review process.
*   **Evolve Architecture, Don't Over-Engineer**: We start with the simplest viable solution and add complexity only when a clear need arises. Our event-driven architecture provides the flexibility to evolve without requiring major rewrites.
*   **Human Override is Mandatory**: The system is designed to augment, not replace, human developers. We always maintain the ability for human oversight, intervention, and final approval.
*   **Version Everything**: Every change, from a line of code to a piece of documentation, is tracked in version control. This provides a complete history and ensures we can always roll back to a known good state.

## 3. Testing Philosophy

Our approach to testing is integrated throughout the development lifecycle, not as a final step.

*   **Test Early, Test Often**: Every new piece of functionality is accompanied by a suite of tests.
*   **Simulate Production**: Our tests are designed to simulate production conditions wherever possible, including load and error-injection.
*   **Measure Everything That Matters**: We have a strong focus on metrics. Performance, cost, and quality are tracked from day one and are used to inform our development decisions.

## 4. Key Architectural Patterns

These are proven, battle-tested patterns that should be reused wherever applicable. They represent the "Vibe Lab way" of building software.

*   **Staged Initialization for APIs**: To prevent API route hanging due to complex service initializations, we use a three-stage loading pattern. This is the permanent solution for API performance. (See `Staged_Initialization_System.md` for details).
*   **Health-Aware Routing**: Our router intelligently sends requests to the best available service based on its current health and initialization status, providing graceful fallbacks instead of errors.
*   **Consistent Service Base Class**: All backend services should extend our `BaseService` class, which provides standardized lifecycle management, monitoring, health checks, and event bus integration.
*   **Comprehensive State Management**: For complex client-side state, we use Zustand stores with a "design-first" approach, defining the complete TypeScript interface before implementation.
*   **Type-Safe, Flexible API Contracts**: All API requests and responses are defined with clear, strongly-typed TypeScript interfaces.

## 5. Phase 1.5: UI/UX Discovery & Prototyping

This phase bridges the gap between the project's conceptual blueprint and its technical implementation. It ensures that the User Interface (UI) and User Experience (UX) are intentionally designed before full-scale development begins.

### Step 1: UI/UX Requirements Gathering
*   **AI Action**: Initiate a dialogue with the user to understand the desired look, feel, and interaction model for the application.
*   **User Input**: The user provides preferences, goals, and keywords (e.g., "clean," "minimalist," "data-rich," "developer-focused").

### Step 2: Inspiration & Mood Boarding
*   **AI Action**: Based on user input, search for 2-3 best-in-class web applications that exemplify the desired UI/UX. Present these to the user with links and a brief analysis of why they are relevant (e.g., "Linear.app for its developer-centric, high-efficiency interface," "Stripe for its clean, trustworthy payment flows").
*   **User Input**: The user selects or approves a primary source of inspiration.

### Step 3: Visual Scaffolding (Automated)
*   **AI Action**: Use an automated tool (e.g., a "HTML to Figma" converter or similar web scraper) to capture the structural layout and core components of the inspirational website. This is for structural analysis, not asset theft.
*   **Output**: A JSON or similar structured representation of the target UI (e.g., `Vibe Lab/page.figma.json`).

### Step 4: UI/UX Blueprint & Skeleton Generation
*   **AI Action**:
    1.  Analyze the captured UI structure.
    2.  Create a `UI_UX_Blueprint.md` document that outlines the application's layout, key components, and user flow, referencing the inspirational source.
    3.  Generate a basic, non-functional skeleton of the UI using standard web technologies (e.g., React/Vite, TypeScript, Tailwind CSS).
    4.  The skeleton will include placeholder components that mirror the structure of the inspirational UI.
*   **Output**: A runnable local development server for previewing the skeleton UI.

### Step 5: User Review & Approval
*   **AI Action**: Present the `UI_UX_Blueprint.md` and the link to the local preview server to the user.
*   **User Input**: The user reviews the skeleton, provides feedback, and grants approval to proceed to the full TIER-1 documentation and subsequent development phases.

## 5. The Meta-Process Lifecycle

Our use of the meta-process is not a binary state but an evolutionary journey. We are progressing through a series of phases, each bringing more of the system into the self-building loop.

*   **Phase 1: Manual Bootstrap**: Building the foundational AVCA-DIAS components using traditional development methods.
*   **Phase 2: Assisted Development**: Using the completed AVCA-DIAS components to assist in building new features (e.g., using AI for code generation with human review).
*   **Phase 3: Partial Automation**: Allowing the AVCA-DIAS pipeline to handle the generation of simple, well-defined features from end to end.
*   **Phase 4: Full Automation**: Most new features are generated via the pipeline, with humans acting primarily as architects and reviewers.
*   **Phase 5: Self-Improvement**: The DIAS begins to analyze its own performance, suggest improvements to its own architecture, and implement approved changes.

## 6. Development Workflow & Conventions

To ensure consistency and collaboration, we adhere to the following standard development practices.

*   **Branching Strategy**: We follow the **GitHub Flow**, which uses the `main` branch as the definitive source of truth and `feature branches` for all new development. Pull requests are used to merge changes back into `main` after review.
*   **Commit Convention**: We adhere to the **Conventional Commits** specification. This provides a clear and structured commit history, which is essential for our automated changelog generation and versioning.
*   **Code Formatting**: We use **Prettier** with its default settings to automatically format all code. This ensures a consistent style across the entire codebase without manual effort.
*   **CI/CD**: We use **GitHub Actions** for all continuous integration and continuous deployment tasks, including running tests, checking code quality, and deploying to Vercel.

## 7. Code Style & Common Patterns

To maintain consistency and quality, all code should adhere to the following style guides and patterns.

<details>
<summary>View Code Style Guidelines</summary>

### TypeScript
*   **Interfaces for Data Structures**: Use `interface` for defining the shape of objects.
*   **Classes for Workers/Services**: Use `class` for stateful services, workers, and managers.
*   **Enums for Constants**: Use `enum` for sets of named constants.

```typescript
// Use interfaces for data structures
interface ComponentSpec {
  name: string;
  type: AtomicUnitType;
}

// Use classes for workers
class ComponentGenerator extends AIWorker {
  async generate(spec: ComponentSpec): Promise<Component> {
    // Implementation
  }
}
```

### React Components
*   **Functional Components**: Exclusively use functional components with hooks.
*   **TypeScript Props**: All components must have strongly-typed props using an `interface`.
*   **Hook-Based Logic**: All business logic, state management, and data fetching should be handled by hooks.

```typescript
// Functional components with TypeScript
interface ProjectCardProps {
  project: Project;
  onUpdate?: (project: Project) => void;
}

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const { user } = useAuth(); // All logic in hooks
  return (
    <Card>{/* Component content */}</Card>
  );
}
```
</details>

<details>
<summary>View Common Integration Patterns</summary>

### Registry Integration
*   **Check First**: Always check the component registry for an existing component before creating a new one.
*   **Extend, Don't Duplicate**: If a similar component exists, extend it to meet the new requirements.
*   **Register New Components**: All new, verified components must be registered with the appropriate metadata.

### DIAS Integration
*   **Report for Learning**: Report key actions (e.g., `component.created`) to the `dias.learningSystem` to improve future suggestions.
*   **Get Suggestions**: Leverage the `dias.predictor` to get intelligent suggestions for next steps or component choices.

</details>

## 8. UI Recreation from Reference

A powerful technique we use for rapid prototyping is to recreate UI/UX from existing, high-quality websites. The goal is **inspiration, not imitation**. We use the web as an infinite library of design ideas and translate them into our own high-quality, standardized component library.

### Procedure

1.  **Provide the Target**: The developer provides the AI with a URL and a specific element to recreate.
    > **Prompt Example**: "I want to build a product card component. Use the design of the cards on `https://example.com/products` as a reference for the layout, styling, and hover effects."

2.  **AI Performs "Digital Reconnaissance"**: The AI uses browser integration tools to analyze the target website's DOM structure and computed CSS to understand the design.

3.  **AI Performs "Pattern Translation"**: The AI takes the conceptual information and implements it **using Vibe Lab's strict coding standards**.
    *   It builds a new React component using pure Tailwind CSS utility classes.
    *   It implements any required functionality using our project's standard hooks and state management patterns.
    *   It ensures the new component is fully responsive and PWA-compliant.
    *   It generates a `Tier-2` documentation file for the new component, making it a reusable pattern.
