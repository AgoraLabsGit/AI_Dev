# Continuity of Context

**Last Updated**: [Date]
**Purpose**: This is the master context file for this project. Its purpose is to allow any AI assistant to quickly understand the project's current state, goals, and your role, ensuring seamless and context-aware collaboration across multiple sessions.

---

### **High-Level Project Goal**
> Describe the primary objective of this project in one or two sentences. What are you trying to build or achieve?

---

### **Current Task or Focus**
> What is the immediate goal for this development session? What specific feature, bug, or task are you working on right now?

---

### **System State & Key Files**
> List any key files, schemas, or documents that are central to the current task. This helps the AI know where to look first.
>
> - **Status**: [e.g., `IN_PROGRESS`, `AWAITING_REVIEW`, `BLOCKED`]
> - **Primary Rulebook**: [e.g., `docs/project_guidelines.md`]
> - **Relevant Files**:
>   - `src/core/feature.ts`
>   - `docs/feature_spec.md`

---

### **Session Log & Key Decisions**
> Briefly summarize the progress from the last session or any critical decisions that have been made. This avoids repeating work and keeps the AI aligned with your thought process.
>
> - [ ] **Task 1**: Implemented the user authentication service.
> - [ ] **Decision**: Decided to use JWT for session management instead of cookies.
> - [ ] **Next**: Need to build the frontend login form.

---

### **Next Actions**
> What are the immediate next steps? Be specific.
>
> 1.  Create the UI for the login page in `src/pages/login.tsx`.
> 2.  Connect the form to the authentication endpoint.
> 3.  Write unit tests for the login functionality. 