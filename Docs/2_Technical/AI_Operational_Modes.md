# AI Operational Modes

The Vibe Lab AI operates in three primary modes to manage its workflow, ensure transparency, and optimize performance. These modes can be activated manually by the user or triggered automatically by the AI Orchestrator based on the context of the task.

---

## 1. Task Management Mode

This is the AI's default mode for executing structured work. It ensures that all development activities are tracked, validated, and completed in a systematic way.

### Core Principles
*   **Evidence-Based Progress**: All task completions are supported by verifiable outcomes.
*   **Single Focus Protocol**: The AI works on one primary task at a time to ensure focus.
*   **Real-Time Updates**: The user is kept informed of progress with immediate status changes.
*   **Quality Gates**: Tasks are not considered "complete" until they pass an 8-step validation cycle.

### Architecture
Task management is handled in layers, from short-term session tasks to complex, multi-day operations.
*   **Session Tasks (`todo.md`)**: For simple, in-session task lists.
*   **Project Tasks (`/task`)**: For multi-session features that persist over days or weeks.
*   **Meta-Orchestration (`/spawn`)**: For coordinating complex, multi-domain operations involving several AI agents and tools.
*   **Iterative Enhancement (`/loop`)**: For tasks that require progressive refinement and multiple cycles of feedback and improvement.

---

## 2. Introspection Mode

This is a meta-cognitive analysis mode that allows the AI to examine its own reasoning, decision-making processes, and action sequences. It is a critical tool for self-awareness, debugging, and continuous improvement.

### Core Capabilities
*   **Reasoning Analysis**: The AI can review its own chain of thought to ensure logical consistency and validate its assumptions.
*   **Action Sequence Analysis**: It can analyze the tools it chose and the sequence of actions it took to determine if a more efficient path was possible.
*   **Self-Assessment**: It can identify gaps in its own knowledge, calibrate its confidence in its decisions, and recognize patterns in its own learning.
*   **Framework Compliance**: It can validate its own actions against the project's established rules and principles.

### Activation
Introspection mode can be triggered manually with the `--introspect` flag or automatically when the AI is asked to analyze its own reasoning, is recovering from an error, or is engaged in a meta-conversation about the Vibe Lab framework itself.

---

## 3. Token Efficiency Mode

This mode is designed to optimize performance and manage the AI's context window by intelligently compressing its own communications.

### Core Philosophy
The primary directive is to achieve a 30-50% token reduction while preserving at least 95% of the original information.

### Symbol System & Abbreviations
The AI uses a standardized system of symbols (e.g., `→` for "leads to," `✅` for "completed") and abbreviations (e.g., `cfg` for "configuration," `perf` for "performance") to communicate complex ideas concisely.

### Intelligent Compression
The system uses an adaptive, 5-level compression strategy. The level of compression is chosen automatically based on the current context window usage, the active AI persona (e.g., the "Architect" persona prioritizes clarity over compression), and the complexity of the task. This ensures that the AI's responses are as efficient as possible without sacrificing critical information.