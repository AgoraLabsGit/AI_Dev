# AVCA (AI-Verified Component Architecture)

## 1. Overview

AVCA is the structured, AI-powered pipeline that transforms project requirements into high-quality, production-ready code. It is a repeatable and verifiable process that ensures every component of an application is built to the same high standard. The entire system is designed around a core philosophy of "everything is a component," from a UI button to a piece of infrastructure.

## 2. The AVCA-DIAS Interaction

AVCA and DIAS are deeply intertwined. While AVCA is the **pipeline for building components**, DIAS is the **intelligence layer that observes and enhances** that pipeline.

*   **AVCA emits events**: As components move through the pipeline (e.g., `component.generated`, `quality.passed`), it emits events.
*   **DIAS consumes events**: DIAS listens to these events to learn patterns, detect anomalies, and provide real-time feedback.
*   **DIAS triggers AVCA**: Based on its analysis, DIAS can request actions from AVCA, such as regenerating a component that has a newly discovered security flaw.

## 3. The Onboarding Blueprint: The Key to AVCA

The entire AVCA pipeline is driven by a comprehensive set of specifications gathered during the user onboarding flow. This is the critical human-in-the-loop step that provides the AI with the necessary context to build the application. This process results in two key outputs:

*   **Project Overview**: A high-level document outlining the project's goals, user stories, and key features.
*   **Build Specifications**: A detailed technical document that specifies the pages, components, data models, and styling for the application.

## 4. Component Atomic Types

AVCA classifies all parts of an application into eight "atomic" component types. This granular classification allows for a highly structured and predictable development process.

*   **UI Components**: The visual elements of the application (e.g., `Button`, `Card`).
*   **Logic Modules**: Reusable business logic (e.g., `useAuth`, `apiClient`).
*   **Data Patterns**: Database models and validation schemas (e.g., `UserModel`, `ProjectSchema`).
*   **Infrastructure**: Configuration files and deployment scripts (e.g., `next.config.js`, `Dockerfile`).
*   **Integration Patterns**: Connectors to external services (e.g., `StripePayments`, `AuthProvider`).
*   **Workflow Patterns**: Multi-step processes (e.g., `OnboardingSequence`, `PaymentFlow`).
*   **Cross-Cutting Patterns**: System-wide concerns (e.g., `ErrorBoundary`, `Logger`).
*   **Capability Providers**: Libraries and frameworks that provide specific functionality (e.g., `date-fns`, `zustand`).

<details>
<summary>View Technical Interfaces</summary>

```typescript
// 1. UI Components
interface UIComponent {
  name: string;
  props: TypedProps;
  render: () => JSX.Element;
  styles: TailwindClasses;
  accessibility: A11yRequirements;
}

// 2. Logic Modules
interface LogicModule {
  name: string;
  dependencies: string[];
  exports: Function | Object;
  sideEffects: boolean;
}

// 3. Data Patterns
interface DataPattern {
  model: PrismaModel;
  schema: ZodSchema;
  migrations: Migration[];
  seeds?: SeedData;
}

// 4. Infrastructure
interface Infrastructure {
  config: EnvironmentConfig;
  scripts: DeploymentScript[];
  monitoring: HealthCheck[];
}

// 5. Integration Patterns
interface IntegrationPattern {
  service: ExternalService;
  wrapper: AbstractionLayer;
  fallback: ErrorStrategy;
  testing: MockStrategy;
}

// 6. Workflow Patterns
interface WorkflowPattern {
  steps: WorkflowStep[];
  transitions: StateTransition[];
  rollback: RollbackStrategy;
}

// 7. Cross-Cutting Patterns
interface CrossCuttingPattern {
  targets: ComponentType[];
  implementation: Middleware | HOC | Hook;
  configuration: Config;
}

// 8. Capability Providers
interface CapabilityProvider {
  need: string;
  preferred: Library;
  alternatives: Library[];
  selectionCriteria: Criteria;
}
```
</details>

## 5. The AVCA Pipeline Stages

The AVCA pipeline is a series of nine distinct stages that take a project from concept to completion. The process is orchestrated by the AI system, with different agents and models being used at different stages to balance quality and cost.

1.  **Ideation → Blueprints**: The user's input is transformed into the Project Overview and Build Specifications.
2.  **Blueprints → Styling**: The visual identity of the application is established.
3.  **Styling → Page Designs**: The overall layout and structure of each page are designed.
4.  **Page Designs → Navigation Design**: The application's navigation system, menus, and user flows are defined.
5.  **Navigation Design → Component Specs**: The required components for each page and the navigation systems are identified and specified.
6.  **Component Specs → Code Generation**: The Developer AI generates the code for each component.
7.  **Code → Verification**: The Auditor AI reviews the generated code against quality gates.
8.  **Verification → Registry**: The verified component is published to a central registry for reuse.
9.  **Registry → Assembly**: All the generated components are assembled into a complete, running application.

<details>
<summary>View Stage Details & AI Integration</summary>

| Stage | Input | Output | Worker / AI Model | Duration |
| :--- | :--- | :--- | :--- | :--- |
| **1. Blueprints** | User Chat | 15 Blueprint Docs | **Developer AI (Opus)** | 5-10 min |
| **2. Styling** | Blueprints | style-config.json | **Developer AI (Sonnet)** | 2-3 min |
| **3. Page Designs** | Style Config | Page Layouts | **Developer AI (Sonnet)** | 10-15 min |
| **4. Navigation** | Page Designs | Navigation Map | **Developer AI (Sonnet)** | 2-3 min |
| **5. Component Specs**| Page Designs | component_reqs.json | **Developer AI (Haiku)**| 1-2 min |
| **6. Code Generation**| Component Specs | Component Code | **Developer AI (Sonnet)** | 30s / comp |
| **7. Verification**| Generated Code | Quality Report | **Auditor AI (Opus)**| 1-2 min / comp |
| **8. Registry** | Verified Code | Registry Entry | **System (Haiku)** | 10s |
| **9. Assembly** | All Components| Complete App | **Developer AI (Haiku)** | 2-5 min |

*Note: The AI model is dynamically selected based on the complexity of the stage. This is a key cost-optimization strategy, reducing the overall pipeline cost by over 80% by using less expensive models for less complex tasks.*

</details>

## 6. The Component Registry

At the heart of AVCA is a component registry. This is a database that stores every version of every component generated by the pipeline, enabling versioning, reuse, and dependency tracking.

<details>
<summary>View Registry SQL Schema</summary>

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
</details>

## 7. Quality Gates

At Stage 7 (Verification), every component is automatically checked against a set of quality gates. The build will fail if these minimums are not met.

<details>
<summary>View Quality Gate Configuration</summary>

```typescript
interface QualityGate {
  coverage: { min: 80 }; // Minimum 80% test coverage
  security: { min: 9.0 }; // Minimum 9/10 security score
  performance: { min: 90 }; // Minimum 90/100 performance score
  accessibility: { standard: 'WCAG_AA' }; // Must meet WCAG AA standard
  typing: { strict: true }; // Must pass TypeScript strict mode
}
```
</details>
