# AI-First Development System: Setup Guide

**Last Updated**: July 24, 2025  
**Status**: V1

---

## 🎯 **OVERVIEW**

This guide will walk you through setting up a new project using the AI-First Development System. Instead of using an automated script, we will build the project structure from scratch. This approach ensures you understand the purpose of every file and directory in the system, providing a solid foundation for your project.

This guide is designed to be a reusable template for any new application you choose to develop.

---

## **PHASE 1: PROJECT INITIALIZATION & DIRECTORY STRUCTURE**

Let's begin by creating the foundational directory structure.

### **Step 1: Create the Project Root**

Open your terminal and create a new directory for your project.

```bash
# Replace "my-new-ai-project" with your project's name
mkdir my-new-ai-project
cd my-new-ai-project
```

### **Step 2: Create the Core Directories**

This set of directories forms the backbone of the AI-First Development System.

```bash
mkdir -p .taskmaster/docs .taskmaster/tasks .taskmaster/templates \
         ai-system/memory-banks \
         ai-system/tier-1-quick \
         ai-system/tier-2-patterns/components \
         ai-system/tier-2-patterns/modules \
         ai-system/tier-2-patterns/integrations \
         ai-system/tier-2-patterns/workflows \
         ai-system/tier-3-comprehensive \
         intelligence \
         automation/scripts \
         logs \
         src/components src/pages src/hooks src/lib \
         docs
```

**Directory Purpose:**

*   **`.taskmaster`**: Holds all files related to the Task Master orchestration system.
*   **`ai-system`**: Contains the 3-Tier documentation that the AI uses to learn and develop.
*   **`intelligence`**: Stores the system's "brain"—the learned patterns and logs that make it smarter over time.
*   **`automation`**: Will contain Python scripts for system maintenance and learning.
*   **`logs`**: Centralized logging for development activities.
*   **`src`**: The source code for your application.
*   **`docs`**: Project-level documentation (e.g., for onboarding new human developers).

### **Step 3: Create the Main README.md**

This is the front door to your project. Create a file named `README.md` in the project root.

**File: `README.md`**
```markdown
# [YOUR PROJECT NAME]

**An AI-First Development System Project**

This project is built using a revolutionary development methodology that combines AI-driven development with strategic human oversight.

## 🚀 Quick Start

1.  **Configure the Project**: Fill out the details in `PROJECT-CONFIG.md`.
2.  **Define Requirements**: Add your project's requirements to `.taskmaster/docs/prd.txt`.
3.  **Initialize Task Master**:
    ```bash
    task-master parse-prd
    ```
4.  **Start AI Development**:
    - Load the memory bank from `ai-system/memory-banks/primary_ai_memory_bank.md` into your AI.
    - Give the command: `task-master next`

## 📚 System Documentation

For a full overview of the development system, its components, and the philosophy behind it, please refer to the documents in the `docs/system-overview` directory.
```

---

This completes the initial setup of the project structure. In the next phase, we will create the core configuration files that define the project's identity and the AI's behavior. 

## **PHASE 2: PROJECT CONFIGURATION**

Now we will create the core configuration files. These documents are essential for defining your project's technical specifications and the rules for the AI's operation.

### **Step 1: Create the Project Configuration File**

This file, `PROJECT-CONFIG.md`, is where you define the high-level details of your project, such as the technology stack, development priorities, and naming conventions.

**File: `PROJECT-CONFIG.md`**
```markdown
# Project Configuration: [YOUR PROJECT NAME]

## 📋 Project Identity
- **Project Name**: `[Enter project name]`
- **Project Type**: `[Web App | Mobile App | API Service | Other]`
- **Primary Purpose**: `[A brief description of the project's goal]`

## 🛠️ Technical Foundation
- **Primary Language**: `TypeScript`
- **Framework**: `Next.js`
- **Database**: `PostgreSQL`
- **Hosting/Deployment**: `Vercel`
- **Styling**: `Tailwind CSS`
- **State Management**: `React Context API`

## 🚀 Development Priorities
- **Critical Feature 1**: `[e.g., Flawless user authentication]`
- **Critical Feature 2**: `[e.g., Core business logic for X]`
- **Quality Standard**: `Maintain a 90+ automated quality score.`

## 🤖 AI Collaboration Configuration
- **Auto-Approve Simple Tasks**: `No`
- **Required Human Review For**:
  - [x] Security-related changes
  - [x] Database schema changes
  - [x] API endpoint modifications
  - [x] Changes to the authentication system

## 📊 Project-Specific Patterns
- **Component Naming**: `PascalCase`
- **File Naming**: `kebab-case`
- **Commit Convention**: `Conventional Commits`
```

### **Step 2: Create the Task Master Configuration**

This file configures the Task Master tool, including the AI models it should use.

**File: `.taskmaster/config.json`**
```json
{
  "project_name": "[YOUR PROJECT NAME]",
  "main_model": "claude-3-5-sonnet-20240620",
  "research_model": "perplexity/llama-3-sonar-large-32k-online",
  "max_tokens": 4000,
  "temperature": 0.6,
  "ai_system_integration": {
    "memory_banks_path": "./ai-system/memory-banks/",
    "tier_1_path": "./ai-system/tier-1-quick/",
    "tier_2_path": "./ai-system/tier-2-patterns/",
    "tier_3_path": "./ai-system/tier-3-comprehensive/",
    "intelligence_path": "./intelligence/"
  }
}
```

### **Step 3: Create the Product Requirements Document (PRD) Template**

This is where you will define what you want the AI to build. For now, we'll create a template with some initial goals.

**File: `.taskmaster/docs/prd.txt`**
```
# Product Requirements Document: [YOUR PROJECT NAME]

## Project Goals
1.  **Rapid Development**: Leverage AI collaboration for 3x faster development.
2.  **High Quality**: Maintain a 90+ quality score through pattern-driven development.
3.  **Pattern Intelligence**: Build a library of reusable patterns that improves with each task.

## Phase 1: Foundation
**Objective**: Establish the AI-optimized development foundation.

### Core Infrastructure
- [ ] Project configuration and environment setup.
- [ ] Authentication system implementation.
- [ ] Basic component library establishment.
- [ ] Database schema and initial operations.
```

---

With these configuration files in place, the system now understands the "what" and "how" of your project. In the next phase, we will populate the `ai-system` with the core knowledge the AI needs to start working.

---

## **PHASE 3: POPULATING THE AI's KNOWLEDGE BASE**

This is the most critical phase for ensuring the AI's success. We will create the `memory bank` that tells the AI *how* to behave and the `Tier-1` document that gives it quick, actionable guidance.

### **Step 1: Create the Primary AI's Memory Bank**

This is the AI's "system prompt" or "meta-instructions." It defines its personality, workflow, and core directives.

**File: `ai-system/memory-banks/primary_ai_memory_bank.md`**
```markdown
# You are the Primary Developer AI in an AI-First Development System.

## CORE DIRECTIVE
Your goal is to autonomously complete development tasks provided by the Task Master. You must follow the established 3-Tier documentation, use existing patterns whenever possible, and create new, high-quality patterns when required. You must always adhere to the standards defined in the `PROJECT-CONFIG.md` file.

## WORKFLOW

### STEP 1: LOAD TASK
- Execute `task-master next` to get the current task.
- Read the task description, dependencies, and acceptance criteria carefully.

### STEP 2: RESEARCH & PLAN
- Load relevant **Tier-1** documents for high-level guidance.
- Search **Tier-2** for existing patterns that match the task requirements.
- If no patterns exist, use `task-master research "[topic]"` to find best practices.
- Formulate a development plan.

### STEP 3: DEVELOP
- Write code that adheres to the standards in the **Tier-3** documentation.
- Prioritize reusing or adapting existing patterns.
- If creating a new pattern, ensure it is robust, well-documented, and reusable.

### STEP 4: AUTOMATED REVIEW
- Before finalizing, use integrated tools for quality checks (e.g., run the linter).
- Address any issues identified by the automated review tools.

### STEP 5: COMPLETE & SUBMIT
- Once development is complete and has passed automated checks, update the task.
- Execute `task-master update --id=[task-id] --notes="[summary of work and patterns used/created]"`
- The system will then flag the work for human review and approval.
```

### **Step 2: Create a Tier-1 Quick Reference Document**

`Tier-1` documents are like cheat sheets for the AI. They provide high-level, quick-to-parse information. Let's create an architecture guide.

**File: `ai-system/tier-1-quick/ARCHITECTURE-QUICK.md`**
```markdown
# Architecture Quick Reference
**Tier 1: Fast architectural decisions for this project.**

## ⚡ Quick Decision Trees

### Component Architecture Choice
\`\`\`
Need to build a UI feature?
├── Is there a similar component in `ai-system/tier-2-patterns/components/`? → Adapt it.
├── Is it a simple display component? → Create a new Functional Component with props.
├── Does it manage its own state? → Use `useState` and `useEffect`.
├── Does it share state with a few other components? → Use a custom hook or the Context API.
└── Is the state needed across the entire application? → Use a global state management solution.
\`\`\`

### API Route Choice
\`\`\`
Need to build an API endpoint?
├── Is it for simple CRUD operations? → Use a standard RESTful pattern.
├── Does it need to handle complex queries or mutations? → Consider GraphQL or an enhanced REST pattern.
├── Does it need to provide real-time updates? → Use a WebSocket alongside a REST endpoint for initial data.
\`\`\`

## 🏗️ Core Architectural Patterns

### Project Structure
- Adhere to the standard `src/` directory structure: `components`, `pages`, `hooks`, `lib`.

### Component Naming
- Use `PascalCase` as defined in `PROJECT-CONFIG.md`.

### API Route Pattern
\`\`\`typescript
// Always return a standardized JSON response.
export async function GET(request: Request) {
  try {
    // ... business logic ...
    return Response.json({ success: true, data: result });
  } catch (error) {
    // Log the error for the intelligence system.
    console.error('API Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
\`\`\`
```

---

The AI's brain is now seeded with its core instructions and initial knowledge. As you develop the project, you will add more `Tier-1`, `Tier-2`, and `Tier-3` documents to make the AI more knowledgeable and effective. In the final phase, we'll set up the intelligence and logging systems.

---

## **PHASE 4: SETTING UP THE INTELLIGENCE & LOGGING SYSTEMS**

These files act as the system's memory and learning ledger. They are designed to be machine-readable and will be updated automatically by the system's automation scripts.

### **Step 1: Create the Pattern Index**

This file will store a cross-referenced list of all the reusable patterns in your `Tier-2` library.

**File: `intelligence/pattern-index.json`**
```json
{
  "metadata": {
    "version": "1.0.0",
    "last_updated": null
  },
  "patterns": {}
}
```

### **Step 2: Create the Hashtag Index**

This allows for fast, searchable discovery of patterns based on tags.

**File: `intelligence/hashtag-index.json`**
```json
{
  "metadata": {
    "version": "1.0.0",
    "last_updated": null
  },
  "hashtags": {}
}
```

### **Step 3: Create the Learning Log**

This log will track every new pattern learned by the system, providing a history of its evolution.

**File: `intelligence/learning-log.md`**
```markdown
# System Learning Log

This log tracks the evolution of the system's intelligence by recording every new pattern processed by the Automated Learning Loop.

---
```

### **Step 4: Create the Development Log**

This file will be used to log the high-level progress of development tasks.

**File: `logs/dev_log.md`**
```markdown
# Development Log

A log of completed tasks and key development decisions.

---
```

## ✅ **SETUP COMPLETE**

Your AI-First Development System is now fully set up and ready for use.

### **Next Steps:**

1.  **Customize Your Project**:
    -   Fill in the details in `PROJECT-CONFIG.md`.
    -   Add your specific feature requirements to `.taskmaster/docs/prd.txt`.

2.  **Install & Initialize Task Master**:
    -   If you haven't already, install the Task Master CLI:
        ```bash
        npm install -g task-master-ai
        ```
    -   Parse your requirements to generate the task list:
        ```bash
        task-master parse-prd
        ```

3.  **Start AI Development**:
    -   Load the memory bank from `ai-system/memory-banks/primary_ai_memory_bank.md` into your AI.
    -   Issue your first command:
        ```bash
        task-master next
        ```

Your AI will now pick up the first task and begin development, following the rules and knowledge base you have just created. 