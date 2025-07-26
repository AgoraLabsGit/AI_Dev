# Welcome to the Project Blueprint

**Your Goal**: To work with me, your AI development partner, to create a comprehensive plan for our project. This "Blueprint" phase is the most critical step. By defining our vision, features, and technical strategy now, we ensure we build the *right* product, efficiently.

**The Process**: This is a collaborative effort. I will guide you through each of the documents in this `00-Blueprint/` directory. Your input will shape the foundation of the entire project.

Ready? Let's begin.

---

## The Blueprinting Process: A Step-by-Step Guide

Please open and complete the following documents in order. I will be here to assist, provide suggestions, and synthesize the information at each stage.

### **Step 1: Define the Vision**
*   **Document**: `01-PROJECT-VISION.md`
*   **Your Goal**: To articulate the high-level "what" and "why" of our project. What problem are we solving? Who are we solving it for? What does success look like?
*   **My Role**: I will help you refine your vision and ensure it's clear and actionable.

### **Step 2: Outline Core Features**
*   **Document**: `02-CORE-FEATURES.md`
*   **Your Goal**: To list and describe the primary features of the application. Think in terms of user stories or key functionalities.
*   **My Role**: I will help you break down large features into manageable components and ensure we have a clear scope for our Minimum Viable Product (MVP).

### **Step 3: Propose the Technology Stack**
*   **Document**: `03-TECH-STACK-PROPOSAL.md`
*   **Your Goal**: To select the best tools for the job based on the project's vision and features.
*   **My Role**: I will analyze the requirements and propose a complete technology stack. We'll review the pros and cons of each choice, ensuring we make informed decisions that align with our long-term goals.

### **Step 4: Strategic Migration & Modernization Analysis**
*   **Document**: `04-MIGRATION-ANALYSIS.md`
*   **Your Goal**: If a `Migration/` folder exists, you will conduct a strategic analysis of the legacy codebase. This is the most critical step for ensuring a successful modernization effort.
*   **Your Process**:
    1.  **Codebase Audit**: First, you will perform a deep dive into the source code to identify the core architecture, key dependencies, and high-value features.
    2.  **"Rebuild vs. Migrate" Analysis**: For each major feature or service you identify (e.g., the `UniversalAILearningService`), you will conduct a "Rebuild vs. Migrate" analysis. You must weigh the pros and cons of:
        *   **Migrating**: Porting the existing code directly to preserve its proven logic and accelerate the timeline.
        *   **Rebuilding**: Re-engineering the feature from the ground up using modern best practices, which may offer better performance and scalability at the cost of increased development time.
    3.  **Recommendation**: Based on your analysis, you will provide a clear recommendation for each component and outline the proposed migration strategy.
*   **My Role**: I will provide the legacy code in the `Migration/` folder. I expect you to perform this analysis autonomously. If this is a new project (no `Migration/` folder), we will skip this step.

### **Step 5: Propose Key Optimizations**
*   **Document**: `05-OPTIMIZATION-PROPOSAL.md`
*   **Your Goal**: To identify opportunities for improvement beyond the initial implementation.
*   **My Role**: Based on our feature list and tech stack, I will suggest potential areas for optimization, such as database query improvements, image handling strategies, or state management patterns.

---

## Next Steps: From Blueprint to Build

Once we have completed all five steps, the Blueprinting phase is complete.

1.  **Synthesis**: I will take all the information we've gathered and automatically generate the `Project-Template/`, including the 3-Tier documentation and the initial `Project_Roadmap.md`.
2.  **Review**: We will review the generated project plan together to ensure it aligns perfectly with the vision we defined.
3.  **Begin Development**: With a solid foundation in place, we will be ready to move into the development phase, confident that we are building the right product on a solid technical foundation.

**Let's start with `01-PROJECT-VISION.md`. Please open the file, fill it out, and let me know when you're ready to move to the next step.** 