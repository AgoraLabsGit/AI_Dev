# Code Generation Pipeline

This document describes the end-to-end, user-driven pipeline for generating a project's core documents and code. This pipeline follows a strict, sequential, four-phase order to ensure a well-structured and high-quality project output.

## The Workflow

The pipeline is a series of distinct jobs, where each phase must be completed before the next can begin.

### **Phase 1: Project Roadmap Generation**

*   **Trigger**: User completes the Onboarding Blueprint and clicks "Generate Roadmap".
*   **Job Type**: `ROADMAP`
*   **Worker**: **Developer AI**
*   **Steps**:
    1.  The AI Orchestrator sends the completed blueprint to the Developer AI.
    2.  The AI's prompt is to analyze the blueprint and generate a strategic, high-level project roadmap.
    3.  The generated roadmap is saved to the database.
    4.  The project status is updated to "Roadmap Complete".

### **Phase 2: Task List Generation**

*   **Trigger**: Automatic, upon successful completion of the Roadmap generation.
*   **Job Type**: `TASK_GENERATION`
*   **Worker**: **DIAS Task Master System**
*   **Steps**:
    1.  The AI Orchestrator retrieves the newly generated roadmap.
    2.  It sends the roadmap to the DIAS Task Master for comprehensive analysis.
    3.  Task Master performs its analysis, which includes complexity scoring, dependency mapping, resource allocation, and "Wave Orchestration."
    4.  The enhanced task list is saved to the database with full metadata.
    5.  A visual dependency graph and project timeline can optionally be generated.

### **Phase 3: Foundation Generation (Tier 1 Docs)**

*   **Trigger**: User reviews and approves the Roadmap & Tasks, then clicks "Generate Foundation".
*   **Job Type**: `FOUNDATION`
*   **Worker**: **Developer AI** (Generation) & **Auditor AI** (Review)
*   **Steps**:
    1.  The Orchestrator sends the blueprint and roadmap to the Developer AI with a prompt to generate comprehensive Tier 1 documentation.
    2.  The output is reviewed by the Auditor AI for quality and completeness.
    3.  The approved documentation is saved to the project's storage.
    4.  The project status is updated to "Foundation Complete".

### **Phase 4: Scaffold Generation (Code, Patterns, & Logs)**

*   **Trigger**: User approves the Foundation, then clicks "Generate Scaffold".
*   **Job Type**: `SCAFFOLD`
*   **Worker**: **Developer AI** (Generation) & **Auditor AI** (Review)
*   **Steps**:
    1.  The Orchestrator uses the blueprint, roadmap, and foundation docs to prompt the Developer AI to generate the full application scaffold (Tier 2/3 docs, boilerplate code, etc.).
    2.  As part of this process, the agent also generates a `Development_Log.md` file, summarizing key decisions and milestones.
    3.  All generated code is reviewed by the Auditor AI.
    4.  After final approval, the entire project structure is pushed to a new GitHub repository.
    5.  The project is marked as "Scaffold Complete".
