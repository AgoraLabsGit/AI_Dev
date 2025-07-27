# 11 - Code Generation Pipeline

**Last Updated**: 2024-07-23

## 1. Overview
This document describes the end-to-end asynchronous pipeline for generating a project's core documents and code. This pipeline follows a strict, sequential order to ensure a well-structured project.

## 2. The Workflow
The pipeline is a series of distinct, user-triggered jobs. Each phase must be completed before the next can begin.

### **Phase 1: Project Roadmap Generation**
- **Trigger**: User completes the Blueprint and clicks "Generate Roadmap".
- **Job Type**: `ROADMAP`
- **Steps**:
    1. The AI Orchestrator sends the completed blueprint to the **Developer Agent (Gemini)**.
    2. The agent's prompt is to analyze the blueprint and generate a strategic, high-level project roadmap.
    3. The generated roadmap (e.g., in Markdown or JSON format) is saved to the `Roadmap` model in the database.
    4. **Status Update**: The project status is updated to "Roadmap Complete".

### **Phase 2: Task List Generation (Task Master)**
- **Trigger**: Automatic, upon successful completion of the Roadmap generation.
- **Job Type**: `TASK_GENERATION`
- **Steps**:
    1. The AI Orchestrator retrieves the newly generated roadmap.
    2. It sends the roadmap to the **Task Master (SuperClaude Task System)**.
    3. Task Master performs comprehensive analysis:
       - **Complexity Scoring**: Technical complexity (1-5), time estimates (hours), risk assessment
       - **Dependency Analysis**: Task interdependencies and critical path identification
       - **MCP Server Planning**: Optimal MCP server utilization for each task
       - **Resource Allocation**: Parallel work stream recommendations
       - **Wave Orchestration**: Multi-stage execution strategy
    4. The generated enhanced task analysis is saved to the `Tasks` model with full metadata.
    5. **Optional**: Generate visual dependency graph and project timeline.

### **Phase 3: Foundation Generation (Tier 1 Docs)**
- **Trigger**: User reviews and approves the Roadmap & Tasks, then clicks "Generate Foundation".
- **Job Type**: `FOUNDATION`
- **Steps**:
    1. The Orchestrator sends the blueprint and roadmap to the **Developer Agent (Gemini)** with a prompt to generate the comprehensive Tier 1 documentation.
    2. The output is reviewed by the **Auditor Agent (Claude)** for quality and completeness.
    3. The approved documentation is saved to the project's storage.
    4. **Status Update**: The project status is updated to "Foundation Complete".

### **Phase 4: Scaffold Generation (Code, Patterns, & Logs)**
- **Trigger**: User approves the Foundation, then clicks "Generate Scaffold".
- **Job Type**: `SCAFFOLD`
- **Steps**:
    1. The Orchestrator uses the blueprint, roadmap, and foundation docs to prompt the **Developer Agent (Gemini)** to generate the full application scaffold (Tier 2/3 docs, boilerplate code, etc.).
    2. As part of this process, the agent is also prompted to generate a `Development_Log.md` file for the user, summarizing the key decisions and milestones from the process so far.
    3. All generated code is reviewed by the **Auditor Agent (Claude)**.
    4. After final approval, the entire project structure (code, docs, and the new dev log) is pushed to a new GitHub repository.
    5. **Status Update**: The project is marked as "Scaffold Complete". 