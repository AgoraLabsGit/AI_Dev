# Vibe Lab Development Process

**Document Type**: Process & Standards
**Status**: Authoritative
**Purpose**: This document is the single source of truth for the Vibe Lab development process. It outlines our core principles, architectural patterns, engineering standards, and the standardized workflows that all team members and AI agents must follow.

---

## 1. Core Philosophy & Principles

Our methodology is built on a set of core principles that guide all our decisions.

*   **Build Product-First, Extract System Later**: We validate features in `vibe-lab-product` against real-world use cases before extracting proven, generic components into the `vibe-lab-system`.
*   **Systematic Execution**: We follow a "Task-First" approach: fully understand requirements, plan the implementation, execute the plan, and validate the result.
*   **Simplicity and Focus (KISS & YAGNI)**: We implement only what is required now, preferring simplicity over complexity and avoiding speculative features.
*   **Event-Driven & Modular Architecture**: Our system is built on an event-driven model with modular components. This provides loose coupling, high observability, and allows for independent testing and deployment.
*   **Composition over Inheritance**: We favor a flexible, compositional approach to building software.
*   **Conservative Defaults & Evidence-Based Decisions**: We start with safe, conservative configurations and make all decisions based on verifiable data from documentation, tests, or metrics.

---

## 2. The Meta-Process: Using the System to Build Itself

Our primary development protocol is the "meta-process"—we use Vibe Lab to build and improve Vibe Lab itself. This creates a powerful, continuous learning loop.

*   **AI-Assisted Development is Standard**: We leverage our three-agent AI system (Architect, Engineer, Auditor) for all aspects of development, which is consistently 3-5x faster while maintaining high quality.
*   **Continuous Learning Loop**: The system executes a task, analyzes its own performance, identifies patterns, and extracts knowledge into the `Learning_Log.md`. This knowledge is used to refine the system and its processes for the next task.
*   **Cost is a Feature**: We treat the operational cost of our AI systems as a primary metric. Cost-optimization is a continuous part of the development and review process.
*   **Human Override is Mandatory**: The system is designed to augment, not replace, human developers. We always maintain the ability for human oversight, intervention, and final approval.
*   **Version Everything**: Every change, from code to documentation, is tracked in version control for a complete history and rollback capability.

---

## 3. The Standard Development Cycle

All development work, from a small bug fix to a major new feature, **must** follow this five-step cycle. This is the practical application of our meta-process.

1.  **Consult Docs & Learnings**: Before writing code, review `Docs/4_Logs/Learning_Log.md` and all relevant architectural documents.
2.  **Implement**: Write code that strictly adheres to the project's code standards and architectural patterns.
3.  **Validate**: Thoroughly test the implementation with unit, integration, and E2E tests.
4.  **Update Logs & Learnings**: After completion, add a concise entry to `Development_Log.md`, update `Continuity_of_Context.md`, and—most importantly—**add any new insights or patterns to `Learning_Log.md`**.
5.  **Update Roadmap & Tasks**: Mark the relevant task as complete in the `Task_Master.md` and update the project roadmap.

---

## 4. Blueprint-Driven Development Strategy

To safely and effectively use our own system to build itself, we will follow a "Validation-First" and "Sandbox" development strategy.

### 4.1. Validation-First Integration
Before using the AVCA/DIAS system to generate new code, we will first use it to validate our existing codebase against the newly created blueprints.
*   **Goal**: Ensure the blueprints accurately reflect the current implementation.
*   **Process**: Feed the blueprints to the DIAS for a compliance analysis.
*   **Success Criteria**: A compliance score of >90%, with only minor gaps identified.

### 4.2. Sandbox-First Development
All new feature development that uses the AVCA/DIAS system will be done in a sandboxed environment to protect the main codebase.
*   **Goal**: Safely test and validate the blueprint-driven generation process.
*   **Process**:
    1.  Create a sandboxed directory within the project.
    2.  Use the AVCA/DIAS system to generate new features into the sandbox.
    3.  Thoroughly test and validate the generated code in the sandbox.
    4.  Once validated, manually integrate the new feature into the main codebase.
*   **Benefits**: This approach allows for risk-free experimentation, provides real-world validation of our system, and accelerates development by generating features we actually need.

---

## 5. Engineering Standards & Quality Gates

These are the non-negotiable quality standards for the Vibe Lab platform. They are enforced automatically by our CI/CD pipeline and the Auditor AI.

### **Performance SLAs**
*   **API Response Time (p95)**: < 200ms
*   **AI First Token Time (p95)**: < 1.5 seconds
*   **Platform Uptime**: 99.9%

### **Quality Gates (Enforced by CI/CD)**
*   **Test Coverage**: Minimum 80%
*   **Security Score**: Minimum 9/10 (per Auditor AI)
*   **Accessibility**: Must meet WCAG AA standards.
*   **Typing**: Must pass TypeScript strict mode. The `any` type is strictly forbidden.

### **Security Requirements**
*   **OWASP Guidelines**: Adhere to the OWASP Top 10 security best practices.
*   **Validate All Inputs**: Especially data coming from AI model responses.
*   **Use Environment Variables**: No secrets may be hardcoded.

---

## 6. Architectural Patterns & Code Standards

To ensure a consistent, stable, and maintainable codebase, all code **must** adhere to the following patterns and standards.

### **Required Architectural Patterns**
*   **Staged Initialization for APIs**: Use the three-stage loading pattern to prevent API route hanging.
*   **Health-Aware Routing**: The router must intelligently send requests to the best available service.
*   **Consistent Service Base Class**: All backend services must extend the `BaseService` class.

### **Required Code Standards (Enforced by CI/CD)**
*   **PWA Compliance**:
    *   **44px Minimum Touch Targets**: All interactive elements must be accessible.
    *   **Semantic HTML**: Use proper HTML elements (`<header>`, `<nav>`, `<button>`).
    *   **Mobile-First & Responsive Design**: Design for mobile first and ensure proper reflow.
*   **Component Architecture**:
    *   **TypeScript Interfaces**: All components must define proper prop interfaces.
    *   **Composition over Monoliths**: Components should not exceed 200 lines.
    *   **Systematic Spacing & Theming**: Use design tokens from the theme for all colors and spacing.
*   **Layout & Styling**:
    *   **Pure Tailwind CSS**: No custom CSS files, CSS-in-JS, or external design systems.
    *   **CSS Grid for Structure**: Use CSS Grid for complex page layouts.
*   **Branching & Commits**:
    *   **GitHub Flow**: `main` is the source of truth; all work is done in `feature branches`.
    *   **Conventional Commits**: All commit messages must follow the Conventional Commits specification.
    *   **Prettier Formatting**: All code is automatically formatted by Prettier.

### **Prohibited Practices (Blocked by CI)**
*   Touch targets smaller than 44px.
*   Complex nested flexbox where CSS Grid is appropriate.
*   Using `hidden sm:block` for responsive design instead of proper reflow.
*   Hardcoding colors or spacing values.
*   Use of the TypeScript `any` type.
