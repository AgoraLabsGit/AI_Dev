# Human Interaction Guide
**A Practical Manual for the Human Operator**

**Last Updated**: July 25, 2025  
**Status**: V2

---

## 🎯 **YOUR ROLE: THE STRATEGIST, APPROVER, AND TEACHER**

This AI-First Development System is designed to handle the majority of the coding, but your role is the most critical. You are the strategic mind guiding the system. Your responsibilities are focused on three high-impact areas:

1.  **Strategist (Set the Direction)**: You define **what** to build during the Genesis Session and by updating the PRD.
2.  **Approver (Ensure Quality)**: You are the final quality gate for all AI-generated work.
3.  **Teacher (Make the System Smarter)**: You teach the system what good patterns look like.

---

##  workflow: The 4 Key Interaction Points

### **1. The Project Genesis Session**
- **Your Role**: The primary interviewee. Your first interaction with a new project will be to answer the AI's questions during the Genesis Interview. This session is what builds the foundational documentation.

### **2. Review & Approve the AI's Work**
- **Your Role**: The Approver. Review the AI's pull requests, focusing on high-level correctness and whether it meets your strategic goals.

### **3. Teach the System by Tagging Patterns**
- **Your Role**: The Teacher. When you approve work that contains a new, valuable pattern, add `pattern:new` to the pull request description to trigger the Automated Learning Loop.

### **4. Initiate a Pivot (Change Course)**
- **Your Role**: The Strategist. When a core decision needs to change, you will use the Pivot Protocol.
- **The Protocol**:
    1.  Issue a high-level command to the AI: `task-master pivot "[Your proposed change, e.g., Switch from Tailwind to CSS Modules]"`
    2.  The AI will perform an impact analysis across all documentation (Tiers 1-3, Pages Architecture, Roadmap).
    3.  The AI will present you with a "Pivot Plan" for your approval.
    4.  Once you approve, the system's core documentation will be updated, and new tasks will be generated to implement the change.

### **5. Invoke the AI Auditor**
- **Your Role**: The Quality Assurance lead.
- **The Protocol**:
    -   When a major feature is complete, or if you encounter a stubborn bug, you can instruct the AI to act as a second opinion.
    -   Issue the command: `task-master audit "[Describe the code to review, e.g., the user-login-flow]"`
    -   The AI will then perform a detailed review focusing on optimization, security, and best practices, and will deliver a report with its findings and suggestions.

---

## COMMAND-LINE WORKFLOW & SHORTCUTS

### **Essential Commands**

| Command | Description |
| --- | --- |
| `task-master status` | Get a high-level overview of the current project status. |
| `task-master list` | See a list of all pending, active, and completed tasks. |
| `task-master show [id]`| Get the detailed context for a specific task. |
| `task-master update-roadmap` | Instructs the AI to update the Project Roadmap with the latest progress. |
| `task-master pivot "[change]"` | Initiates the Pivot Protocol to make a significant change to the project. |

### **Using AI with Files (`@` symbol)**

To quickly focus the AI's attention on specific files or symbols, use the `@` symbol in your chat prompt. This is the most efficient way to ask questions about or request changes to specific parts of the codebase.
- **Example**: `"@docs/tier-3-comprehensive/02-ARCHITECTURE-MASTER.md Can you summarize our decision on state management?"`
- **Example**: `"@src/components/Button.tsx Please add a new 'destructive' variant to this component."`

### **GitHub Integration**

For the system to work best, connect your GitHub account in **Settings > Tools & Integrations**. This gives the AI better context about the entire codebase, history, and issues.

### **Suggested Shortcuts (Shell Aliases)**

```bash
# AI-First Development System Shortcuts
alias tm-status="task-master status"
alias tm-list="task-master list"
alias tm-show="task-master show"
alias tm-pivot="task-master pivot"
alias tm-roadmap="task-master update-roadmap"
```

---
*This guide contains everything you need to effectively operate the AI-First Development System. Your strategic input is the key to its success.* 