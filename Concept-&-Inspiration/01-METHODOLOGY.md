# Vibe Lab SaaS - Product Methodology & Architecture

**Purpose**: This document defines the core product methodology, user experience model, and technical architecture for the Vibe Lab SaaS platform.

---

## 1. Core Philosophy: Guided Architecture
Vibe Lab is not just an IDE or a code generator. It is a **Guided Architecture Platform**. Its primary goal is to steer developers and teams through a structured, best-practice development lifecycle, from initial concept to scalable architecture, preventing common pitfalls and ensuring a high-quality foundation for any new software project.

---

## 2. The Vibe Lab Interface Model: Plan / Build / Visualize

The application is designed as a "mission control" for software projects. The user experience is centered around a persistent AI chat panel and a clear, three-stage workflow embodied by four core pages.

### 2.1. The Vibe Chat (Persistent AI Panel)
-   **Role**: The central nervous system and primary user interface of the application. It is a persistent, collapsible panel (inspired by Cursor) that is always available.
-   **Function**: Users issue natural language commands to drive the entire development process, from "Create a new project blueprint" to "Refactor this component for performance."

### 2.2. Core Pages
-   **PLAN: The `Blueprints` Page**: The starting point for all projects. This page guides the user through the critical early-stage documentation (Project Vision, Data & API Architecture, UI/UX Design). It later holds the living, code-backed TIER-1 documentation.
-   **BUILD: The `Build` Page**: The project management hub. This is where the user tracks the `Roadmap`, manages `Tasks` for the current phase, and jots down `Notes/Ideas`.
-   **VISUALIZE: The `Visualize` Page**: The interactive output center. It provides two distinct views:
    -   **Component Lab**: An isolated, Storybook-like environment where developers build, test, and view individual UI components and modules.
    -   **Live Preview**: A direct view of the running `localhost` application, showing the assembled product in real-time.
-   **TOOL: The `Directory` Page**: A utility page that supports the `Build` phase. It features two modes:
    -   **Focus View (Default)**: Intelligently displays only the files relevant to the current blueprint or task.
    -   **Full Tree View**: A traditional, unfiltered file explorer for power users.

---

## 3. The Vibe Lab Development Flow: A Component-First Scaffold

Our methodology bridges the gap between high-level planning and tangible code by focusing on building a library of reusable "Lego blocks" before assembling the final application.

1.  **Phase 1: Blueprinting**: The user, guided by the AI, completes the high-level `00-Blueprint`, `01-Design`, and `04-DATA-API-ARCHITECTURE` documents. This establishes the project's North Star.

2.  **Phase 2: Component Roadmap Generation**: The AI analyzes the completed blueprints and generates the initial project Roadmap. Phase 1 of this roadmap is focused *exclusively* on creating the core, reusable components of the system (e.g., UI components like `<Button />`, backend modules like `useAuth`).

3.  **Phase 3: Component Construction**: The user works through the "Lego block" tasks on the `Build` page. They build and test these components visually and functionally in the `Component Lab` page, ensuring each piece is robust and correct in isolation.

4.  **Phase 4: Foundation Synthesis (`GENERATE FOUNDATION`)**: This is the critical bridge. The user triggers this command after the core component library is built. The AI:
    -   Scans the actual, working code from the `Component Lab` phase.
    -   Merges this real-world code with the high-level plans from the Blueprints.
    -   Generates the comprehensive, code-backed `TIER-1` documentation, creating a "living" design system and architecture guide.

5.  **Phase 5: Application Assembly**: With a library of well-documented, pre-built components at their disposal, the subsequent phases of the Roadmap focus on assembling these blocks into full features and application pages.

---

## 4. MVP (Minimum Viable Product) Strategy
To de-risk the project and focus on core value, the MVP will be streamlined:

-   **Core Feature**: The `Blueprint` -> `Component Roadmap` -> `GENERATE FOUNDATION` workflow.
-   **Integration Model**: **Model A: Push-to-GitHub**. We will bypass the complexity of the Local Agent for the MVP.
-   **MVP Pages**: `Blueprints` page for planning, and a simplified `Build` page to display the AI-generated Component Roadmap.
-   **Excluded from MVP**: Real-time local file sync (the Local Agent), `Directory` Page, `Component Lab` Page, and complex task management features. The initial "build" will be done by the user locally after the project is generated and cloned.

---

## 5. Key Challenges & Considerations
-   **Security**: Building and securing the Local Agent for the post-MVP versions is the single greatest technical challenge. It requires a deep focus on authentication, permissions, and encrypted communication.
-   **State Synchronization**: Maintaining a consistent state between the web UI and the local filesystem is a complex engineering problem that must be solved for real-time "Vibe Coding."
-   **Cross-Platform Agent**: The Local Agent must be compatible with Windows, macOS (Intel/ARM), and Linux. 