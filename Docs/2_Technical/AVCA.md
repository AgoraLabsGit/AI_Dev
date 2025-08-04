# AVCA (AI-Verified Component Architecture)

**Document Type**: Technical Standard
**Status**: Authoritative
**Purpose**: This document provides a comprehensive overview of the AVCA system, the structured, AI-powered pipeline that transforms project requirements into high-quality, production-ready code.

---

## 1. Overview

AVCA is a repeatable and verifiable process that ensures every component of an application is built to the same high standard. The entire system is designed around a core philosophy of "everything is a component," from a UI button to a piece of infrastructure.

### The AVCA-DIAS Interaction
AVCA and DIAS are deeply intertwined.
*   **AVCA emits events**: As components move through the pipeline (e.g., `component.generated`, `quality.passed`), it emits events.
*   **DIAS consumes events**: DIAS listens to these events to learn patterns, detect anomalies, and provide real-time feedback.
*   **DIAS triggers AVCA**: Based on its analysis, DIAS can request actions from AVCA, such as regenerating a component that has a newly discovered security flaw.

---

## 2. Core Sub-System: The Component Pipeline

The Component Pipeline is the engine of AVCA, responsible for the end-to-end process of transforming a high-level component idea into production-ready code.

### Stage 1: Blueprint Parser
*   **Input**: Raw, high-level blueprint data.
*   **Process**: Parses the raw data into a structured format, analyzes requirements, identifies dependencies, and plans the file structure.
*   **Output**: A `Structured Blueprint` object.

### Stage 2: Component Planner
*   **Input**: The `Structured Blueprint`.
*   **Process**: Creates a detailed implementation plan, including architectural patterns, TypeScript interfaces, and a test plan. This stage includes an **Advanced Component Configuration** wizard for defining data bindings, API integrations, and business logic.
*   **Output**: A `Detailed Plan` object.

### Stage 3: Code Generator
*   **Input**: The `Detailed Plan`.
*   **Process**: Generates the actual code files (`.tsx`, `.test.tsx`, `.stories.tsx`) with skeleton code and `TODOs`, focusing on establishing the correct architecture. This stage uses a "Magic Component Pipeline" (MCP) automation strategy to generate component variations at scale.
*   **Output**: A set of `Working Code` files.

### Stage 4: Quality Assurance
*   **Input**: The `Working Code` files.
*   **Process**: Validates, optimizes, and enhances the generated code by running TypeScript validation, removing unused imports, applying performance optimizations, and calculating a final quality score.
*   **Output**: `Production-Ready Code`.

---

## 3. Core Sub-System: Staged Initialization

To ensure the Vibe Lab API is always fast and responsive, AVCA uses a staged initialization system that loads services progressively.

*   **`ServiceManager`**: Manages the lifecycle of all services with circuit breaker protection and a 5-second timeout to prevent API hanging.
*   **`HealthAwareRouter`**: Intelligently routes requests to the best available primary or fallback service, ensuring graceful degradation.
*   **Service Loading Stages**:
    1.  **Stage 1: Immediate (0-1s)**: Loads the EventBus for basic connectivity.
    2.  **Stage 2: Fast Enhancement (1-5s)**: Loads the AI Client and Blueprint Service for core AVCA functionality.
    3.  **Stage 3: Background Intelligence (5-30s)**: Loads the full DIAS intelligence engines.

---

## 4. Core Sub-System: Integration Layer

The Integration Layer defines the patterns and contracts that allow the AVCA and DIAS systems to communicate and work together effectively.

### Worker Architecture
The system utilizes a combination of AI-driven, script-based, and hybrid workers to execute tasks.
*   **AI Workers**: For tasks requiring complex reasoning, like code generation.
*   **Script Workers**: For deterministic tasks, like running linters.
*   **Hybrid Workers**: For multi-step tasks that combine script and AI workers.

### Data Flow & API Contracts
*   **Pipeline Data Flow**: A central `PipelineData` object is passed through all stages of the AVCA pipeline.
*   **Event Flow**: A bidirectional event system allows AVCA and DIAS to communicate in real-time.
*   **API Contracts**: A formalized set of API contracts for the Component Registry and the DIAS Intelligence APIs.

### Resilience & Performance
*   **Graceful Degradation**: If a pipeline stage fails, the system attempts to recover using fallback mechanisms or escalates to DIAS.
*   **Error Recovery**: Configurable strategies including retries, fallbacks, and rollbacks.
*   **Performance Patterns**: An intelligent caching strategy and parallel processing of tasks ensure a responsive system.

---

## 5. Component & Pipeline Architecture

### The Onboarding Blueprint
The entire AVCA pipeline is driven by a comprehensive set of specifications gathered during user onboarding, resulting in a **Project Overview** and **Build Specifications**.

### Component Atomic Types
AVCA classifies all parts of an application into eight "atomic" types, such as `UI Components`, `Logic Modules`, `Data Patterns`, and `Infrastructure`.

### The AVCA Pipeline Stages
The pipeline is a series of nine distinct stages that take a project from concept to completion:
1.  Ideation → Blueprints
2.  Blueprints → Styling
3.  Styling → Page Designs
4.  Page Designs → Navigation Design
5.  Navigation Design → Component Specs
6.  Component Specs → Code Generation
7.  Code → Verification
8.  Verification → Registry
9.  Registry → Assembly

### The Component Registry
At the heart of AVCA is a database that stores every version of every component, enabling versioning, reuse, and dependency tracking.

### Quality Gates
At the Verification stage, every component is automatically checked against a set of quality gates, including test coverage, security score, performance score, accessibility, and TypeScript strictness. The build will fail if these minimums are not met.
