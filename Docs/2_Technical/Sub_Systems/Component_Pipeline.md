# Sub-System: Component Pipeline

## 1. Overview

The Component Pipeline is a fully implemented, four-stage sub-system within AVCA that is responsible for the end-to-end process of transforming a high-level component idea into production-ready code. It is the primary engine for automated code generation in Vibe Lab. Each stage is a distinct, event-driven service that takes the output of the previous stage, enriches it, and passes it to the next.

## 2. The Four Stages

The pipeline ensures a structured and predictable flow from concept to code.

### Stage 1: Blueprint Parser
*   **Input**: Raw, high-level blueprint data from the user onboarding process.
*   **Process**: This stage parses the raw data into a structured format. It analyzes the requirements (functional, technical, design), identifies dependencies (internal and external), plans the necessary file structure, and calculates the component's complexity and an estimated development time.
*   **Output**: A `Structured Blueprint` object that is ready for the next stage.

### Stage 2: Component Planner
*   **Input**: The `Structured Blueprint` from Stage 1.
*   **Process**: The planner takes the structured requirements and creates a detailed implementation plan. This includes selecting the appropriate architectural patterns, designing the TypeScript interfaces, generating a test plan, and—most importantly—planning the component's integration into the wider system.
*   **Output**: A `Detailed Plan` object that contains all the information needed to generate the code.

<details>
<summary>View Advanced Component Configuration Details</summary>

A key feature of the Component Planner is the **Advanced Component Configuration** wizard. This is an intelligent, multi-step process that goes beyond code structure to define a component's relationship with the rest of the application.

*   **Data Binding Wizard**: This tool can automatically analyze a user's database schema, intelligently map database fields to component props (e.g., `user_id` to `userId`), and infer relationships between tables to suggest connections between components.
*   **API Integration**: The wizard can auto-generate the necessary CRUD API endpoints for the component, configure authentication and permission requirements, and apply consistent error handling patterns.
*   **Behavior Customization**: Users can configure component-specific business logic, connect components to external services (e.g., Stripe, SendGrid), and enable analytics tracking.

This configuration step ensures that when a component's code is generated in Stage 3, it is not just a dumb UI element but a fully integrated piece of the application.
</details>

### Stage 3: Code Generator
*   **Input**: The `Detailed Plan` from Stage 2.
*   **Process**: This stage generates the actual code files. It creates not only the main component file (`.tsx`) but also the corresponding test files (`.test.tsx`), Storybook stories (`.stories.tsx`), and type definitions. It generates skeleton code with `TODOs`, focusing on establishing the correct architecture and boilerplate.
*   **Output**: A set of `Working Code` files.

### Stage 4: Quality Assurance
*   **Input**: The `Working Code` files from Stage 3.
*   **Process**: The final stage validates, optimizes, and enhances the generated code. It performs TypeScript validation, removes unused imports, applies performance optimizations like `React.memo`, auto-fixes safe and deterministic issues (like removing `console.log`), formats the code, and calculates a final quality score.
*   **Output**: `Production-Ready Code` that is clean, optimized, and adheres to best practices.

## 3. The "Magic Component Pipeline" (MCP) Automation Strategy

The heart of the **Stage 3: Code Generator** is a powerful automation strategy known as the "Magic Component Pipeline" or MCP. This is an AI-powered component factory designed to generate a vast library of component variations at scale, ensuring quality and consistency.

*   **Core Concept**: The MCP uses a set of predefined AI prompt templates to generate the same component with different visual styles (e.g., "Linear", "Apple", "Spotify"). This allows us to create thousands of component variations automatically, rather than manually.
*   **Tiered Generation**: To manage this process, components are organized into tiers based on their demand and importance (e.g., Tier 1 includes high-demand components like Buttons, Inputs, and Cards). The MCP prioritizes generating Tier 1 components first to maximize impact.
*   **Quality Assurance**: The MCP doesn't just generate code; it also generates the necessary Storybook files, unit tests, and documentation for each component, which are then validated in Stage 4.

<details>
<summary>View MCP AI Prompt Template Example (Linear Style)</summary>

The MCP uses detailed system prompts to guide the AI in generating components that adhere to a specific design system's principles.

```typescript
const linearStyleMCP = {
  systemPrompt: `
    You are an expert React component developer specializing in modern SaaS design.
    Generate a \${componentType} component following Linear.app's design principles:
    
    Style Guidelines:
    - Dark theme primary (#000000 background, #111111 surfaces)
    - Angular gradients with blur effects
    - Inter font family, clean typography hierarchy
    - Subtle micro-animations and hover states
    
    Technical Requirements:
    - TypeScript with full type definitions
    - Pure Tailwind CSS v4 exclusively for styling
    - Accessible ARIA labels and keyboard navigation
    - Mobile-first responsive design
    
    Component Specifications:
    \${componentSpecifications}
  `
}
```
</details>

## 4. Integration

The Component Pipeline is a core part of the AVCA system. It is triggered by the main AVCA orchestrator after the "Onboarding Blueprint" phase is complete. It makes heavy use of the **Event Bus** to emit events at the start and end of each stage, allowing the DIAS system and the **Internal Monitoring System** to track its progress in real-time.
