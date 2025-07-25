### **Test Session 1: New Project Onboarding**

**Goal**: To validate the experience of a "fresh" AI and user starting a new project from scratch using the `HUMAN_START_HERE.md` guide.

**Observations & Findings**:
*   **Observation 1**: The test AI successfully read the initial `00_START_HERE.md` file and understood the 5-step blueprinting process.
*   **Issue 1**: When the user provided a second, more specific prompt (`I would like to migrate...`), the AI ignored the new instruction and continued with its previous plan.
*   **Root Cause**: "AI Tunnel Vision." The AI did not re-evaluate its plan against the user's latest input.
*   **Solution 1**: Updated the `primary_ai_memory_bank.md` with a new "Prime Directive" that forces the AI to always prioritize the user's most recent request over any existing plan. This enhances cognitive flexibility.
*   [We will populate this section with our notes as we conduct the test.] 