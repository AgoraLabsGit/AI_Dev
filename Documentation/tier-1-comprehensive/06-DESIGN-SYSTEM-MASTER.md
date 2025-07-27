# 06 - Design System Master
**UI/UX, Components, and Brand Consistency**
<!-- AI Genesis Guide: Ask the user for their design preferences. If they don't have any, propose a clean, modern default. -->

---

## 1. Color Palette
- [AI: Ask the user for their primary, secondary, and accent colors. If none, propose a default palette (e.g., a modern blue and neutral grays).]

## 2. Typography
- [AI: Ask for their preferred font for headings and body text. If none, propose a default (e.g., Inter or a standard sans-serif).]

## 3. Spacing & Layout
- [AI: Propose a standard 8-point grid system for consistent spacing.]

## 4. Component Library Philosophy
- [AI: State that all components will be built with accessibility (WCAG 2.1 AA) as a primary requirement.]

## 5. Phase 1.5: UI/UX Discovery & Prototyping

This phase bridges the gap between the project's conceptual blueprint and its technical implementation. It ensures that the User Interface (UI) and User Experience (UX) are intentionally designed before full-scale development begins.

### Step 1: UI/UX Requirements Gathering
*   **AI Action**: Initiate a dialogue with the user to understand the desired look, feel, and interaction model for the application.
*   **User Input**: The user provides preferences, goals, and keywords (e.g., "clean," "minimalist," "data-rich," "developer-focused").

### Step 2: Inspiration & Mood Boarding
*   **AI Action**: Based on user input, search for 2-3 best-in-class web applications that exemplify the desired UI/UX. Present these to the user with links and a brief analysis of why they are relevant (e.g., "Linear.app for its developer-centric, high-efficiency interface," "Stripe for its clean, trustworthy payment flows").
*   **User Input**: The user selects or approves a primary source of inspiration.

### Step 3: Visual Scaffolding (Automated)
*   **AI Action**: Use an automated tool (e.g., a "HTML to Figma" converter or similar web scraper) to capture the structural layout and core components of the inspirational website. This is for structural analysis, not asset theft.
*   **Output**: A JSON or similar structured representation of the target UI (e.g., `Vibe Lab/page.figma.json`).

### Step 4: UI/UX Blueprint & Skeleton Generation
*   **AI Action**:
    1.  Analyze the captured UI structure.
    2.  Create a `UI_UX_Blueprint.md` document that outlines the application's layout, key components, and user flow, referencing the inspirational source.
    3.  Generate a basic, non-functional skeleton of the UI using standard web technologies (e.g., React/Vite, TypeScript, Tailwind CSS).
    4.  The skeleton will include placeholder components that mirror the structure of the inspirational UI.
*   **Output**: A runnable local development server for previewing the skeleton UI.

### Step 5: User Review & Approval
*   **AI Action**: Present the `UI_UX_Blueprint.md` and the link to the local preview server to the user.
*   **User Input**: The user reviews the skeleton, provides feedback, and grants approval to proceed to the full TIER-1 documentation and subsequent development phases. 