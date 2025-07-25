# AI-First System: Command & Interaction Cheat Sheet

**Purpose**: This is your quick-reference guide for interacting with the AI-First Development System. Use these commands in the chat to direct the AI with precision and speed.

---

## Cursor Commands

| Command | Action |
|---------|--------|
| `dev` | Start development workflow (load task, find patterns, show plan) |
| `update` | Provide user with an update of what the current development focus is |
| `patterns [type]` | Find reusable code in tier-2-patterns/ |
| `implement [name]` | Build with patterns from tier-2 + tier-1 guidance |
| `newFeature [desc]` | Create new feature from scratch with patterns |
| `newFunction [name]` | Build new function/module following patterns |
| `upgrade [feature]` | Enhance existing feature with better patterns |
| `optimize [code]` | Improve performance using optimization patterns |
| `validate` | Check quality against tier-3 standards |
| `debug` | Fix issues using intelligence/learning-log |
| `extract` | Create new patterns from current code |

## Task Master Commands (Terminal)

| Command | Action |
|---------|--------|
| `task-master next` | Get next task with AI suggestions |
| `task-master update --id=[id]` | Update progress with notes |
| `task-master complete --id=[id]` | Mark done & trigger learning |
| `task-master research "[topic]"` | Research implementation approaches |
| `task-master expand --id=[id]` | Break complex task into subtasks |

## **Part 1: Core Project Management**

These commands are your daily drivers for managing the development workflow.

| Your Command | Underlying Action | Description & Workflow Integration |
| :--- | :--- | :--- |
| `tmStatus` | `task-master status` | **"What's the current state of the project?"** Use this for a high-level overview of active tasks and roadmap progress. |
| `tmList` | `task-master list` | **"Show me everything on our plate."** Provides a detailed list of all tasks, sorted by status. |
| `tmShow(id)` | `task-master show [id]` | **"Give me the details on this specific task."** Use this to load the full context of a single task into the AI's memory. |
| `tmNew` | `task-master parse-prd`| **"Let's kick off a new feature."** The command to run after you've updated the `prd.txt` with a new feature. |
| `tmUpgrade` | (PRD Update) | **"Let's improve this feature."** A directive to enhance an existing feature. The AI will ask for details to add to the PRD. <br> *Example: `tmUpgrade the login page with biometric auth`* |

---

## **Part 2: Strategic Direction & Review**

These are high-level commands for steering the project and ensuring quality.

| Your Command | Underlying Action | Description & Workflow Integration |
| :--- | :--- | :--- |
| `tmPivot` | `task-master pivot` | **"We need to change course."** Initiates a major architectural change. The AI will analyze the impact and propose a full migration plan. <br> *Example: `tmPivot to a new database solution`* |
| `tmAudit` | `task-master audit` | **"Put on your auditor hat and review this."** Instructs the AI to review code for optimizations, security, and best practices. <br> *Example: `tmAudit the checkout flow for performance bottlenecks`* |
| `tmExplain`| (Documentation Query)| **"Explain this concept to me."** Asks the AI to read relevant documentation (`@` files) and explain a specific part of the system. <br> *Example: `tmExplain how the AI grading module works`* |

---

## **Part 3: Chat-Based Interaction (`@` Commands)**

Use the `@` symbol to focus the AI's attention on specific files or documents.

| Command / Pattern | Description & Workflow Integration |
| :--- | :--- |
| `@` symbol | **"Look at this specific thing."** The primary tool for focusing the AI's context. It's like pointing a flashlight. <br> *Example: `"@src/components/Button.tsx Please add a 'destructive' variant to this component."`* |
| `>DebugThis` | **"We're stuck. Find the root cause."** Use this with an `@` file when you have an error. The AI will stop other work and focus exclusively on identifying the root cause and proposing a fix. <br> *Example: `@src/lib/data-fetcher.ts >DebugThis`* |

*This cheat sheet is your primary interface for expertly guiding the AI-First Development System.* 