# DIAS (Dynamic Intelligence & Adaptation System)

**Document Type**: Technical Standard
**Status**: Authoritative
**Purpose**: This document provides a comprehensive overview of the DIAS, the intelligence layer of Vibe Lab. It details the system's architecture, its core modules, and how it learns from and adapts to the development process.

---

## 1. Overview

While AVCA provides the structured pipeline for *building* software, DIAS provides the intelligence for *understanding, adapting, and improving* it. It is a collection of event-driven services that run in the background, continuously monitoring the development process and providing real-time insights.

### The DIAS-AVCA Interaction
DIAS is not a standalone system; it is deeply integrated with the AVCA pipeline. It consumes a stream of events from AVCA to build a comprehensive picture of the project's health and can trigger actions back to the AVCA pipeline, such as regenerating a component that has a newly discovered flaw.

---

## 2. Core Architecture

### DIAS Event System
The Event System is the central nervous system of DIAS. It is a robust, event-driven architecture that allows the various DIAS modules to communicate asynchronously and react to events happening within the AVCA pipeline. It defines six categories of events: Component, Pipeline, Quality, User, System, and Integration. This loose coupling is key to the system's extensibility.

### AI Orchestrator & Specialized Servers
The Orchestrator is the intelligent routing system for DIAS. It analyzes user requests and internal events and determines the optimal combination of AI agents and specialized servers to achieve a goal.
*   **Specialized Intelligence Servers**: The Orchestrator leverages a suite of backend services to perform complex tasks:
    *   **Context7**: For documentation, research, and best practice lookups.
    *   **Sequential**: The "deep thought" engine for complex analysis, debugging, and planning.
    *   **Magic**: For UI component generation and design system integration.
    *   **Playwright**: For browser automation, E2E testing, and performance monitoring.

### Context Manager
The Context Manager is a critical sub-system that prepares and optimizes the context sent to the AI agents. It uses an LRU cache, content compression, and a priority-based sliding window to provide the most relevant information possible while adhering to strict token limits, ensuring both high-quality responses and cost-effective operation.

---

## 3. Core Intelligence Modules

DIAS is composed of several specialized intelligence modules, each responsible for a different aspect of the system's "brain".

### Conversational Interface
The gateway to all Vibe Lab functionality. It uses a fast, lightweight AI to classify user intent from chat messages and route it to the appropriate service in AVCA or DIAS. It is deeply integrated with the Context Keeper and Memory System to provide a personalized and context-aware experience, remembering user preferences and key project decisions.

### Task Master System
The intelligent project management component of DIAS. It transforms high-level roadmaps into comprehensive, actionable development plans with sophisticated analysis capabilities, including:
*   **Task Complexity Analysis**: Scores technical complexity and provides time estimates.
*   **Dependency Management**: Maps all task interdependencies and identifies the project's critical path.
*   **Resource & Wave Planning**: Recommends team structures and groups tasks into logical waves for progressive development.

### Other Key Modules
*   **Feature Integration Engine**: Analyzes user requests and determines their impact on the existing codebase.
*   **System Synchronizer**: Keeps all parts of the project (blueprints, code, documentation) in sync.
*   **Predictive Analytics**: Suggests next steps, predicts potential issues, and recommends optimizations.
*   **Learning System**: Learns from user decisions and feedback to personalize the development experience.
*   **Quality Intelligence**: Continuously monitors code quality, enforces standards, and detects regressions.
*   **Error Intelligence**: Analyzes errors, suggests fixes, and helps prevent them from happening again.

---

## 4. System Memory & Adaptation

### Multi-Layered Memory
To learn and adapt, DIAS relies on a multi-layered memory system:
*   **Short-Term Memory (In-Memory)**: Caches active session data.
*   **Medium-Term Memory (Redis)**: Stores recent patterns and project data.
*   **Long-Term Memory (Database)**: The permanent home for the component registry, usage patterns, quality scores, and blueprint history.

### Adaptation Workflows
DIAS employs different workflows to handle various situations:
*   **Sequential Enhancement (Default)**: A standard, step-by-step process for analyzing and implementing changes.
*   **Parallel Consultation (Complex)**: For complex issues, multiple AI agents can be consulted in parallel to arrive at a consensus.
*   **Proactive Optimization (Background)**: The system continuously looks for optimization opportunities during idle time.
*   **Emergency Response (Critical)**: A high-priority workflow for identifying and fixing critical issues.
