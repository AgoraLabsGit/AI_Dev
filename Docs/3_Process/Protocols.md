# Vibe Lab Development Protocols

## 1. Core Philosophy

Our development process is guided by a set of core principles that prioritize efficiency, quality, and maintainability.

*   **Evidence over Assumptions**: All decisions should be based on verifiable data, whether from documentation, tests, or performance metrics.
*   **Systematic Execution**: We follow a "Task-First" approach: fully understand the requirements, plan the implementation, execute the plan, and validate the result.
*   **Simplicity and Focus (KISS & YAGNI)**: We prefer simplicity over complexity and will only implement what is required now, avoiding speculative features.
*   **Composition over Inheritance**: We favor a flexible, compositional approach to building our software.

## 2. The Meta-Process Protocol

Vibe Lab is a self-building system. Our primary development protocol is to **use the system to build the system.** This "meta-process" is not an abstract goal; it is our core, practical methodology.

*   **Continuous Learning Loop**: Our process is a feedback loop. We execute a task, the system analyzes its own performance and our actions, identifies patterns, and extracts knowledge. This knowledge is then used to refine and improve the system and its processes for the next task.
*   **Automated Documentation**: The system is responsible for generating and updating its own documentation based on an analysis of the live codebase. A key part of our work is to ensure this auto-documentation is accurate and to provide the necessary context for it.
*   **Recursive Improvement**: We actively look for opportunities to automate and optimize our own workflows. The system is designed to detect bottlenecks and technical debt, generate recommendations, and, where possible, auto-apply improvements.

## 3. Code Standards & Automated Enforcement

To ensure consistency, quality, and stability, all code contributed to the `vibe-lab-product` must adhere to the following standards. These are not guidelines; they are strict, non-negotiable rules that are enforced automatically.

### Required Practices (Non-Negotiable)

*   **PWA Compliance**:
    *   **44px Minimum Touch Targets**: All interactive elements must meet PWA standards for accessibility.
    *   **Semantic HTML**: Use proper HTML elements (`<header>`, `<nav>`, `<button>`).
    *   **Mobile-First Design**: Design for mobile first and use progressive enhancement.
    *   **ARIA Labels & Keyboard Navigation**: Ensure full accessibility for all components.
*   **Component Architecture**:
    *   **TypeScript Interfaces**: All components must define proper prop interfaces.
    *   **Composition over Monoliths**: Prefer composing smaller components. Components should not exceed 200 lines.
    *   **Systematic Spacing**: Use the design token scale (e.g., `gap-4`) instead of arbitrary values.
*   **Layout & Styling**:
    *   **Pure Tailwind CSS**: No custom CSS files, CSS-in-JS, or external design systems.
    *   **CSS Grid for Structure**: Use CSS Grid for complex page layouts, not nested flexbox hacks.
    *   **Systematic Breakpoints**: Follow the mobile (`sm`), tablet (`md`), and desktop (`lg`) strategy.

### Prohibited Practices (Blocked by CI)
*   **Touch Targets < 44px**.
*   **Complex Nested Flexbox**: Patterns like `justify-between` + `flex-1` + `min-w-0`.
*   **Content Hiding for Responsive**: Using `hidden sm:block` instead of a proper responsive reflow.
*   **Hardcoded Colors or Spacing**: Using hex codes or arbitrary pixels instead of design tokens.
*   **`any` Type Usage**: The TypeScript `any` type is strictly forbidden.

### Automated Enforcement
These standards are enforced at multiple levels to prevent violations from ever reaching the `main` branch.

*   **Pre-Commit Validation**: Every commit is automatically validated by Git hooks. Commits will be **blocked** if violations are detected.
    *   `npm run check:pwa`
    *   `npm run check:architecture`
*   **Real-Time Feedback**: VS Code extensions provide immediate feedback on violations as you type.
*   **CI/CD Pipeline**: The pipeline runs a full validation suite and will fail the build if any violations are found.

<details>
<summary>View Layout Decision Framework</summary>

Before implementing any layout, ask these questions:
1.  Is this mobile-first and PWA compliant?
2.  Can I use CSS Grid instead of complex flexbox?
3.  Are all touch targets at least 44px?
4.  Does this follow our systematic spacing tokens?

**Red Flags (Stop and Rebuild, Don't Patch):**
*   Multiple failed attempts to fix a layout issue with spacing patches. This indicates a deeper architectural problem.
*   The need for conflicting CSS properties (e.g., `flexbox` + `justify-between` + `gaps` + `margins`).
*   Interactive elements that are smaller than 44px.
</details>

## 4. The Standard Development Cycle

All development work, from a small bug fix to a major new feature, must follow this five-step cycle. This process is the practical application of our Meta-Process protocol.

### Step 1: Consult the Documentation & Learnings
*   **Action**: Before writing any code, review the relevant documents in the `/Docs` directory.
*   **Checklist**:
    *   **Review the `Docs/4_Logs/Learning_Log.md` for any critical issue resolutions or patterns relevant to the current task.**
    *   Does your proposed change align with the `Vision.md`?
    *   Does it fit within the `Architecture_Overview.md`?
    *   Are there existing patterns in the `Sub_Systems` documentation that you should follow?
    *   Is this task part of the current `High_Level_Roadmap.md`?

### Step 2: Implement
*   **Action**: Write the code, adhering strictly to the Code Standards and any relevant best practices from the Learning Log.
*   **Checklist**:
    *   Follow all naming and file organization conventions.
    *   Ensure all new code is covered by appropriate tests.

### Step 3: Validate
*   **Action**: Thoroughly test your implementation.
*   **Checklist**:
    *   Run all relevant unit and integration tests.
    *   Run the E2E test suite if the change affects user-facing flows.
    *   Manually test the changes in a development environment.

### Step 4: Update Logs & Learnings
*   **Action**: After your changes are complete and tested, update the project logs and capture learnings.
*   **Checklist**:
    *   Add a concise entry to `Docs/4_Logs/Development_Log.md`.
    *   Update `Docs/4_Logs/Continuity_of_Context.md` with the current status and next steps.
    *   **Add any new insights, patterns, or critical issue resolutions to `Docs/4_Logs/Learning_Log.md`**. This step is crucial for the Continuous Learning Loop.

### Step 5: Update Roadmap & Tasks
*   **Action**: Finally, update the project management documents.
*   **Checklist**:
    *   Mark the relevant task as "complete" in the `03_Task_Master.md`.
    *   Update the status of the current phase in the `02_Current_Focus_Roadmap.md`.

By following this cycle, we ensure that our documentation is a living, useful resource that evolves with the project, not a static artifact that becomes outdated.
