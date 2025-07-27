# UI/UX Blueprint
<!-- 
AI Genesis Guide: This document is generated during "Phase 1.5: UI/UX Discovery & Prototyping". It captures the analysis of the chosen inspirational UI and defines the visual and structural foundation for the project's front end.
-->

---

## 1. Primary UI/UX Inspiration
- **Source Application**: **Linear** (linear.app)
- **Rationale for Selection**: Linear's UI is the gold standard for high-efficiency, developer-centric tools. Its information-dense, keyboard-driven interface, three-column layout, and powerful command palette (`Cmd+K`) are perfectly aligned with the vision for Vibe Lab as a productive, AI-powered workspace.

## 2. Structural Analysis
- **Key Layout Patterns**:
    - **Three-Column Layout**:
        - **Column 1 (Fixed)**: Main navigation sidebar for top-level pages (`Dashboard`, `Plan`, `Build`, `Test`, `Visualize`).
        - **Column 2 (Flexible)**: The primary content area, for lists of tasks, blueprint documents, roadmaps, etc.
        - **Column 3 (Contextual)**: A panel that shows details for the selected item in Column 2, or serves as the AI Chat/Command Palette.
    - **Command Palette (`Vibe Chat`)**: The primary interaction model will be a powerful command palette, always accessible via a shortcut (`Cmd+K`), allowing users to navigate, create, and interact with the AI without leaving the keyboard.

## 3. Core Component & Style Analysis
- **Visual Language**: Minimalist, dark theme (with a light theme option post-MVP). High contrast, clear typography, and subtle, meaningful animations. The focus is on density and readability, not ornamentation.
- **Identified Core Components**:
    - `<Card />`: The fundamental building block for displaying information sections.
    - `<Button />`: With variants for primary, secondary, and destructive actions.
    - `<Input />` / `<Select />` / `<Textarea />`: For all form-based interactions in the blueprinting phase.
    - `<Table />`: For displaying lists of projects, tasks, etc.
    - `<Tabs />`: To switch between sub-views within a main page (e.g., on the `Visualize` page).
    - `<Avatar />`: To display user profile pictures.

## 4. Actionable Design & Prototyping Plan
- **Layout Implementation**:
    - **`<AppLayout />`**: The root three-column layout component with fixed sidebar, flexible content area, and contextual panel.
    - **`<CommandPalette />`**: The core Vibe Chat interface accessible via `Cmd+K`, supporting multi-agent conversations with visual indicators for Developer Agent (Gemini) and Auditor Agent (Claude).
    - **`<ContextualPanel />`**: Column 3 component that can display item details or embed the Command Palette for AI interactions.
- **Keyboard Navigation**: Full keyboard accessibility following Linear's model, with shortcuts for all major actions and navigation.
- **Next Steps**: Begin by building the three-column `AppLayout` and implementing the `CommandPalette` component. This will establish the core interaction model and visual foundation. 