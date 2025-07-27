# Vibe Lab - UX Flow & User Journey

This document translates the procedural steps from the `Human_Operating_Manual.md` into a user-centric flow for the Vibe Lab SaaS application.

---

## 1. User Onboarding

1.  **Sign Up / Sign In**: User creates an account or logs in using standard authentication (e.g., email/password, Google/GitHub OAuth).
2.  **Welcome & Setup**:
    *   A brief, interactive tour highlights the core concepts: Blueprint -> Foundation -> Scaffold -> Vibe Code.
    *   **Crucial Step**: The user is prompted to download and install the **Vibe Lab Local Agent**.
    *   The web app provides a unique authentication token for the user to paste into the local agent, securely linking their local machine to their Vibe Lab account.
    *   A success message confirms the connection is active.
3.  **Dashboard Introduction**: The user is directed to their main project dashboard.

---

## 2. The Project Dashboard (Home Base)

The dashboard is the central hub for managing all projects.

*   **View**: A grid or list of project cards.
*   **Each Project Card Shows**:
    *   Project Name
    *   Current Phase (e.g., "Blueprint," "Foundation Review," "Scaffold Complete," "Vibe Coding")
    *   Last Modified Date
    *   Key Technologies
*   **Primary Action**: A prominent "**+ New Project**" button.

---

## 3. The Main Application View (The Workspace)

Once a project is opened, the user enters the main workspace. This view is centered around a dynamic task list, with clear navigation to different work modes.

*   **A. Current Tasks (Center Panel)**:
    *   This is the default view, powered by the AI's internal taskmaster.
    *   It displays a list of active, pending, and completed tasks.
    *   **Phase Identification**: Each task or group of tasks will be visually associated with its corresponding project phase using a color-coded bar.
        *   <span style="color: #3B82F6;">**Blue**</span>: Blueprinting
        *   <span style="color: #A855F7;">**Purple**</span>: Foundation/Scaffolding
        *   <span style="color: #16A34A;">**Green**</span>: Vibe Coding (Feature Development)
        *   <span style="color: #F97316;">**Orange**</span>: System Testing & Optimization
    *   This provides a clear, at-a-glance understanding of the current work's context.

*   **B. Mode Selector (Left Sidebar)**:
    *   A simple, clear navigation menu that allows the user to switch between different work contexts.
    *   **1. Project Lifecycle**: Guides the user through the main phases.
        *   `Blueprint`
        *   `Foundation Review`
        *   `Scaffold Review`
    *   **2. Vibe Coding**: An open-ended, creative coding environment. This is where the user and AI build and iterate on features.
    *   **3. System Testing**: A dedicated area for running tests on the Vibe Lab system itself, following the protocols in `TESTING_AND_OPTIMIZATION_PROTOCOLS.md`.

*   **C. Vibe Chat (Right Panel)**:
    *   The persistent chat interface is always present, allowing the user to interact with the AI regardless of the current mode.

---

## 4. Intelligent Mode Switching

A key feature of the Vibe Lab AI is its ability to understand context and suggest the appropriate action or mode. This makes the UX fluid and intuitive.

*   **Example 1: From Lifecycle to Vibe Coding**
    *   **User**: "The Foundation documents look good. Let's start building the authentication."
    *   **AI Response**: "Great. I will now mark the 'Foundation Review' task as complete. Let's move to the **Vibe Coding** environment to begin work on the auth service. Here is the first task..."
    *   *The UI automatically switches to the Vibe Coding view.*

*   **Example 2: Proactive System Test Suggestion**
    *   **User**: "The AI seems a bit slow at generating components today."
    *   **AI Response**: "I understand. Performance is key. Would you like to switch to the **System Testing** environment to run a performance benchmark? We can analyze the results and see if an optimization is needed."
    *   *The AI presents a button to switch modes directly in the chat.*

---

## 5. Creating a New Project (The "Bootup Protocol" Wizard)

Clicking "**+ New Project**" launches a simple, full-screen wizard that mirrors our defined bootup protocol.

1.  **"How would you like to start?"**
    *   **Option 1: From Scratch**
        *   User gives the project a name.
    *   **Option 2: From a Concept Document**
        *   An upload area appears. The user drags and drops their `CONCEPT.md` or other document.
    *   **Option 3: From an Existing Project**
        *   Prompts the user to select a local folder on their machine that contains the legacy code. The Local Agent handles the file discovery.
    *   **Option 4: From a GitHub Repository**
        *   Prompts the user for a GitHub URL to clone. The Local Agent handles the `git clone` into a user-selected local directory.

2.  **Confirmation**: The user confirms their choice. The web app now displays the project's dedicated "Blueprint View," and the user is ready to begin the blueprinting process with the AI.

---

## 6. The Development Lifecycle (Staged UI)

The Vibe Lab UI will have distinct "views" or "modes" corresponding to our development phases.

### **Phase I: Blueprint View**

*   This is an interactive editor where the user and the AI collaborate on the `00-Blueprint/` documents.
*   The UI shows the list of blueprint files, their status (pending, complete), and a chat interface for interaction.
*   When all documents are complete, a prominent button appears: **`[GENERATE FOUNDATION]`**.

### **Phase II: Foundation Review View**

*   After the user clicks the button, the AI generates the Tier 1 docs.
*   The UI now displays the generated master documentation for review.
*   The user can review the documents and provide feedback to the AI for revisions.
*   Once satisfied, the user clicks the **`[APPROVE & GENERATE SCAFFOLD]`** button.

### **Phase III: Vibe Coding View**

*   After the user clicks the button, the AI generates the remaining Tiers and the project roadmap.
*   The UI transitions to its final state:
    *   A "Project Roadmap" panel displays the tasks from `Project_Roadmap.md` as a checklist.
    *   A "Vibe Chat" panel is the primary interface for iterative development. The user gives natural language commands to the AI to build features, refactor code, etc.
    *   The Local Agent works in the background, making real-time changes to the local files.

This user flow provides a clear, guided, and powerful experience that makes the complex process of software architecture feel intuitive and manageable. 