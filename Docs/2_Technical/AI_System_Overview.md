# AI System Overview
**Document Type**: Technical Standard
**Status**: Authoritative
**Purpose**: This document is the single source of truth for the Vibe Lab AI system. It defines the high-level, three-agent architecture and the underlying "SuperClaude" persona framework that powers it.

---

## 1. Core Architecture: The Three-Agent System

Vibe Lab operates on a specialized three-agent AI system, with each agent responsible for a distinct phase of the development lifecycle. This model provides a clear separation of concerns at a high level.

1.  **The Architect**: Responsible for high-level planning, system design, and strategic decision-making.
2.  **The Engineer**: Responsible for the hands-on work of feature implementation, code generation, and unit testing.
3.  **The Auditor**: Responsible for code review, quality assurance, security analysis, and standards enforcement.

---

## 2. Implementation Layer: The SuperClaude Persona Framework

The Three-Agent System is powered by a more granular, underlying framework known as **SuperClaude**. This framework is the technical implementation that brings the high-level agents to life through a set of specialized **Personas**.

**Personas are not visual themes.** They are specialized "modes" or "hats" for the AI, each pre-configured with the specific expertise, tools, and instructions needed for a particular task. The **AI Orchestrator** (the brain of the DIAS) activates the appropriate persona based on the user's request.

### The 11 Core Personas

The SuperClaude framework includes 11 core personas that map to the roles of the three high-level agents:

*   **Architect-Level Personas**:
    *   `architect`: General system design and planning.
    *   `strategist`: Long-term vision and feature roadmapping.
*   **Engineer-Level Personas**:
    *   `full-stack`: General feature implementation.
    *   `frontend`: Specialized UI/UX development.
    *   `backend`: Specialized API, database, and logic development.
    *   `devops`: CI/CD, deployment, and infrastructure tasks.
*   **Auditor-Level Personas**:
    *   `auditor`: General code review and quality checks.
    *   `security-expert`: Focused security analysis and vulnerability scanning.
    *   `performance-analyst`: Performance profiling and optimization.
*   **Cross-Cutting Personas**:
    *   `documenter`: Technical writing and documentation generation.
    *   `tester`: Writing and executing tests.

---

## 3. Agent Roles and Responsibilities

_(This section remains the same, defining the high-level roles.)_

### **The Architect**
The Architect is the strategic planner of the system...

_(...content from existing document...)_

### **The Engineer**
The Engineer is the builder of the system...

_(...content from existing document...)_

### **The Auditor**
The Auditor is the quality gate of the system...

_(...content from existing document...)_

---

## 4. System-Wide Operational Modes & Principles

_(This section remains the same.)_

---

## 5. Core Commands & Persona Activation

The core commands are the user's entry point to the system. The AI Orchestrator maps these commands to the appropriate high-level agent and underlying persona.

*   `/plan [description]`: Engages the **Architect**, typically activating the `architect` or `strategist` persona.
*   `/build [task_id]`: Engages the **Engineer**. The orchestrator will inspect the task and activate the appropriate persona (e.g., `frontend` for a UI task, `backend` for an API task).
*   `/review [commit_id]`: Engages the **Auditor**. The orchestrator will activate the `auditor` persona by default, but may also engage the `security-expert` or `performance-analyst` based on flags or task context.
*   `/help`: Provides information on available commands and their usage.

---

## 6. Command Flags

_(This section remains the same.)_
