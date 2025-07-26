> **Hint**: For the best reading experience, right-click this file in the editor and select "View Preview".

# Vibe Lab - Human Operating Manual

This manual outlines the standard operating procedures for collaborating with your AI partner in the Vibe Lab.

---

## 1. Workflow Rules
*These are core commands to manage your development session.*

| Command/Action | Why?                                                                                           |
|:---------------|:-----------------------------------------------------------------------------------------------|
| `UPDATE COC`   | Updates `Project-Template/CONTINUITY_OF_CONTEXT.md` to ensure the AI has the latest context before starting a new chat session. |

---

## 2. Project Development
*This is the core, staged workflow for building a project from concept to code.*

### Phase I: Bootup Protocol
*This is how you initiate any new project or migration.*

1.  **Start a New Project from Scratch**
    *   **Action**: Leave the `Migration/` folder empty.

2.  **Start a New Project from a Concept Document**
    *   **Action**: Place your concept document (e.g., `CONCEPT.md`) inside the `Migration/` folder.

3.  **Migrate an Existing Project**
    *   **Action**: Place the complete legacy project code (without a `.git` directory) inside the `Migration/` folder.

4.  **Onboard an Existing GitHub Repository**
    *   **Action**: Use `git clone` to place the repository inside the `Migration/` folder.

Once your assets are in place, give the AI the following command:
> **`BEGIN BLUEPRINT`**

The AI will then follow the instructions in `00-Blueprint/00_START_HERE.md` to collaboratively create your project blueprint. This includes a new step for discovering and analyzing external libraries and repositories that can accelerate development.

### Phase II: Generate Foundation
*Once you are satisfied with the completed blueprint, this command builds the core documentation.*

Give the AI the following command:
> **`GENERATE FOUNDATION`**

The AI will generate the **Tier 1 (Comprehensive)** documentation, which serves as the detailed master plan for the project. Review this carefully to ensure it aligns with your vision.

### Phase III: Generate Scaffold
*Once you have approved the Foundation, this command builds the rest of the project structure.*

Give the AI the following command:
> **`GENERATE SCAFFOLD`**

The AI will generate the **Tier 2 (Quick Summaries)** and **Tier 3 (Patterns & Templates)**, along with the initial `Project_Roadmap.md`. The project is now ready for development.

### Phase IV: Vibe Coding (Iterate & Improve)
*This is the open-ended development phase. With the project scaffolded, you can now work with the AI to build, test, and refine features.*

There are no specific commands for this phase. Simply state your goals, such as:
*   "Let's build the login component."
*   "Refactor the user service to be more efficient."
*   "I don't like the color scheme, let's try something new."

---

## 3. System Testing
*This section is for running specific tests on the Vibe Lab system itself.*

Details on this workflow are located in `01-Review_and_Optimization/TESTING_AND_OPTIMIZATION_PROTOCOLS.md`. 