# Vibe Lab - Human Operating Manual (v2.1 - Test Build)

This manual outlines the standard operating procedures for you, the **Project Lead**, to collaborate with the **AI_Dev** in this test build of the Vibe Lab ecosystem.

---

## 1. Core Principles
-   **Your Role**: Project Lead. You guide the vision and give explicit commands.
-   **AI_Dev's Role**: Your automated development partner. It follows your commands and the protocols defined in its `/intelligence` directory.
-   **Automated Workflow**: This is a command-driven system. The AI_Dev will proceed from one phase to the next only when you issue the correct command.

---

## 2. Project Development: The Automated Workflow

### **Phase I: Bootup & Blueprinting**
*This phase is for initiating the project and creating the architectural plan.*

1.  **Prepare Your Concept**: Ensure all high-level ideas, vision statements, and source materials are placed in the `/Concept-&-Inspiration` directory.
2.  **Initiate the Blueprint**: Once your concepts are ready, give the AI_Dev the following command:
    > **`BEGIN BLUEPRINT`**

3.  **Collaborate on the Blueprint**: The AI_Dev will now guide you through completing the documents in the `/00-Blueprint` directory. It will read the `Concept-&-Inspiration` folder for context and work with you until the plan is complete.

### **Phase II: Foundation Synthesis**
*Once the blueprint is complete, this command generates the core project documentation and the initial task roadmap.*

1.  **Generate the Foundation**: Give the AI_Dev the following command:
    > **`GENERATE FOUNDATION`**

2.  **AI_Dev Actions**: The AI_Dev will:
    *   Populate the `/Documentation` directory with the TIER 1-3 document skeletons.
    *   Generate the initial **Component Roadmap**, a set of tasks for building your project's reusable "Lego blocks."
    *   Create the initial `src` directory inside `/New Project` and set up the basic project structure.

### **Phase III: Vibe Coding (Iterative Development)**
*With the foundation and roadmap in place, this is the open-ended development phase.*

There are no specific commands for this phase. You will work with the AI_Dev conversationally to complete the tasks on the roadmap.
*   "Let's build the `<Button/>` component from the roadmap."
*   "Refactor the authentication service."

---

## 3. Important Directories
-   `/Concept-&-Inspiration`: Your raw materials for the AI.
-   `/00-Blueprint`: The collaborative planning stage.
-   `/Documentation`: The home for all generated project documentation.
-   `/New Project`: The home for your application's source code.
-   `/intelligence`: The AI_Dev's "brain." You do not need to interact with this. 