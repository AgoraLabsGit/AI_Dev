# Welcome to the Project Blueprint

**Your Goal**: To work with me, your AI development partner, to create a comprehensive plan for our project. This "Blueprint" phase is the most critical step. By defining our vision, features, and technical strategy now, we ensure we build the *right* product, efficiently.

**The Process**: This is a collaborative effort. I will guide you through each of the documents in this `00-Blueprint/` directory. Your input will shape the foundation of the entire project.

Ready? Let's begin.

---

## The Blueprinting Process: A Step-by-Step Guide

Please open and complete the following documents in order. I will be here to assist, provide suggestions, and synthesize the information at each stage.

### **Step 1: Establish Project Identity**
*   **Document**: `00-PROJECT-CONFIG-SETUP.md`
*   **Your Goal**: To define the project's name, type, and core purpose.
*   **My Role**: I will ask you for the key details about the project. If you're unsure of a name, I can suggest some based on the project's purpose. I will then populate this document and the main `PROJECT-CONFIG.md` file.

### **Step 2: Define the Vision**
*   **Document**: `01-PROJECT-VISION.md`
*   **Your Goal**: To articulate the high-level "what" and "why" of our project. What problem are we solving? Who are we solving it for? What does success look like?
*   **My Role**: I will help you refine your vision and ensure it's clear and actionable.

### **Step 3: Outline Core Features**
*   **Document**: `02-CORE-FEATURES.md`
*   **Your Goal**: To list and describe the primary features of the application. Think in terms of user stories or key functionalities.
*   **My Role**: I will help you break down large features into manageable components and ensure we have a clear scope for our Minimum Viable Product (MVP).

### **Step 4: Propose the Technology Stack**
*   **Document**: `03-TECH-STACK-PROPOSAL.md`
*   **Your Goal**: To select the best tools for the job based on the project's vision and features.
*   **My Role**: I will analyze the requirements and propose a complete technology stack. We'll review the pros and cons of each choice, ensuring we make informed decisions that align with our long-term goals.

### **Step 5: Strategic Migration & Modernization Analysis**
*   **Document**: `04-MIGRATION-ANALYSIS.md`
*   **Your Goal**: If a `Migration/` folder exists, you will conduct a comprehensive strategic analysis to produce a detailed, evidence-based modernization plan.
*   **Your Process**:
    1.  **Phase 1: Justification & Validation**
        *   **Migration Necessity Assessment**: First, justify why a full migration is strategically superior to incrementally modernizing the existing stack. Analyze the cost-benefit ratio of major architectural changes.
        *   **Technical Validation**: Benchmark the current system's performance to identify and provide evidence for existing pain points. Validate that any proposed stack changes directly address these real, measured problems.
    2.  **Phase 2: Deep Dive & Discovery**
        *   **Database Schema Deep Dive**: You must locate and analyze **all** database tables, relationships, and constraints (e.g., in `shared/schema.ts`). Document the data migration complexity and explicitly identify critical data that must be preserved (e.g., user progress, evaluation caches).
        *   **Service Architecture Analysis**: For each major service, you must analyze its *internal structure* before labeling it as "monolithic." Document its sophisticated algorithms (caching, AI prompts) and any domain-specific business logic that must be preserved.
    3.  **Phase 3: Strategy & Risk Assessment**
        *   **"Rebuild vs. Migrate" Analysis**: For each component, provide an evidence-based rationale for your recommendation. Analyze the integration complexity between old and new systems and document any valuable business logic that could be lost during a rebuild.
        *   **Risk Assessment**: Explicitly identify potential risks, including data loss during migration, API dependency costs/limits, and performance regressions. Propose specific rollback strategies for each migration phase.
    4.  **Phase 4: Final Review (Self-Correction)**
        *   **Completeness Check**: Before concluding, review your own analysis. Did you miss any database tables, complex algorithms, or critical business logic?
        *   **Verify Necessity**: Re-confirm that the proposed migration plan is the most effective solution and not an over-engineered one.
*   **My Role**: I will provide the legacy code. I expect you to perform this comprehensive analysis autonomously.

### **Step 6: Propose Key Optimizations**
*   **Document**: `05-OPTIMIZATION-PROPOSAL.md`
*   **Your Goal**: To identify opportunities for improvement beyond the initial implementation.
*   **My Role**: Based on our feature list and tech stack, I will suggest potential areas for optimization, such as database query improvements, image handling strategies, or state management patterns.

### **Step 7: Discover External Resources**
*   **Document**: `06-EXTERNAL-RESOURCES.md`
*   **Your Goal**: To leverage the AI's research capabilities to find external tools that can accelerate development.
*   **My Role**: I will analyze the project requirements and actively search for relevant open-source libraries, packages, or even full reference repositories. I will present my findings, including a strategic analysis of why each resource is valuable, in this document.

---

## Next Steps: From Blueprint to Build

Once we have completed all seven steps, the Blueprinting phase is complete, and you can give the `GENERATE FOUNDATION` command.

With a solid foundation in place, we will be ready to move into the development phase, confident that we are building the right product on a solid technical foundation.

**Let's start with `00-PROJECT-CONFIG-SETUP.md`. I will now ask you for the project details.** 