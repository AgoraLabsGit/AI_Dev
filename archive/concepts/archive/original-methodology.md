# Vibe Lab SaaS - Product Methodology & Architecture

**Purpose**: This document defines the core product methodology, user experience model, and technical architecture for the Vibe Lab SaaS platform.

---

## 1. Core Philosophy: Guided Architecture
Vibe Lab is not just an IDE or a code generator. It is a **Guided Architecture Platform**. Its primary goal is to steer developers through a structured, best-practice development lifecycle, preventing common pitfalls and ensuring a high-quality foundation for any new software project.

---

## 2. The Vibe Lab Interface Model: Plan / Build / Test / Visualize

The application is designed as a "mission control" for software projects. The user experience is centered around a **Linear-inspired UI** and a clear, four-stage workflow embodied by our core pages.

*   **PLAN**: The strategic starting point for all projects (`Blueprint` & `Roadmap`).
*   **BUILD**: The task management hub where the project backlog is worked on (`Task Lists`).
*   **TEST**: The quality assurance gate for reviewing all generated artifacts (`Foundation` & Code).
*   **VISUALIZE**: The interactive output center for reviewing the final product (`Code`, `Docs`, `Dev Log`).

---

## 3. The Vibe Lab Development Flow: A Corrected, Strategic Sequence

Our methodology ensures that strategic planning precedes detailed documentation and implementation.

1.  **Phase 1: Blueprinting**: The user, guided by the AI, completes the high-level `00-Blueprint` documents. This establishes the project's North Star.

2.  **Phase 2: Roadmap Generation**: The AI analyzes the completed blueprints and generates the initial `Project_Roadmap.md`.

3.  **Phase 3: Foundation Generation**: The user triggers the `GENERATE FOUNDATION` command. The AI generates the comprehensive, code-backed `TIER-1` documentation.

4.  **Phase 4: Scaffold Generation**: The AI generates the `TIER-2` and `TIER-3` documentation, along with initial code patterns and project structure.

5.  **Phase 5: Vibe Coding**: With a library of well-documented, pre-built components at their disposal, the subsequent phases of the Roadmap focus on assembling these blocks into full features and application pages.

---

## 4. Automated Intelligence Features

Vibe Lab's methodology is enhanced by two key automated systems:

*   **The SuperClaude Task Master**: Following Roadmap Generation (Phase 2), a specialist agent named "SuperClaude" is automatically invoked. It parses the high-level roadmap and generates a detailed, actionable task list, which becomes the project's primary backlog on the `Build` page.
*   **The Automated Development Log**: During the Scaffold Generation (Phase 4), the system creates a `Development_Log.md` at the project root. This log is automatically updated as the project progresses through major milestones, providing a transparent, chronological history of the development process.

---

## 5. MVP (Minimum Viable Product) Strategy
To de-risk the project and focus on core value, the MVP will be streamlined:

-   **Core Feature**: The `Blueprint` -> `Roadmap` -> `GENERATE FOUNDATION` workflow.
-   **Integration Model**: **Model B: Local Agent**. This is a core differentiator and must be included in the MVP to validate the "vibe coding" concept.
-   **MVP Pages**: `Plan`, `Build`, `Test`, and `Visualize` pages are all required to deliver the core workflow.

---

## 6. Key Challenges & Considerations
-   **Security**: Building and securing the Local Agent is the single greatest technical challenge.
-   **State Synchronization**: Maintaining a consistent state between the web UI and the local filesystem is a complex engineering problem.
-   **Multi-Agent Orchestration**: Designing and building the `SuperClaude/ClaudeCode` orchestrator to reliably manage workflows between different AI models is a core challenge. 