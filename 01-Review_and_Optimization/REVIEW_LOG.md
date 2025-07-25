### **Test Session 1: New Project Onboarding**

**Goal**: To validate the experience of a "fresh" AI and user starting a new project from scratch using the `HUMAN_START_HERE.md` guide.

**Observations & Findings**:
*   **Observation 1**: The test AI successfully read the initial `00_START_HERE.md` file and understood the 5-step blueprinting process.
*   **Issue 1**: When the user provided a second, more specific prompt (`I would like to migrate...`), the AI ignored the new instruction and continued with its previous plan.
*   **Root Cause**: "AI Tunnel Vision." The AI did not re-evaluate its plan against the user's latest input.
*   **Solution 1**: Updated the `primary_ai_memory_bank.md` with a new "Prime Directive" that forces the AI to always prioritize the user's most recent request over any existing plan. This enhances cognitive flexibility.
*   [We will populate this section with our notes as we conduct the test.] 

---
### **Test Session 2: Migration Project Onboarding (Post-Fix)**

**Goal**: To validate that the "Prime Directive" fix successfully corrected the AI's "tunnel vision" issue.

**Observations & Findings**:
*   **Observation 2**: **SUCCESS**. The test AI correctly identified the user's second, overriding prompt about migrating a project.
*   **Analysis 2**: It successfully pivoted its workflow, began the migration analysis as per the instructions, and proactively audited the `Legacy Project/` directory. It correctly identified the tech stack of both the client and server.
*   **Conclusion**: The "Prime Directive" enhancement was a complete success. The AI is now significantly more responsive and can correctly adapt to changing user instructions. The core system design is validated. 