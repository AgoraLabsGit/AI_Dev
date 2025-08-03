# Onboarding Page

**Location**: `/onboarding`

## 1. Overview

The Onboarding page is the primary entry point into the Vibe Lab ecosystem. It's a multi-path, AI-driven system designed to transform a user's initial input—whether a simple idea, an existing GitHub repository, a local codebase, or project documentation—into a complete application blueprint.

## 2. User Flow & Entry Points

The user journey begins after authentication. The user is presented with four distinct entry paths:

1.  **✨ Start Fresh**: For users with a new idea. This triggers the full 8-step guided onboarding flow.
2.  **🐙 Import from GitHub**: For users with an existing GitHub repository. This initiates an automated analysis and a tailored, 5-step migration flow.
3.  **📁 Upload Code**: For users with a local codebase. This allows for a ZIP/TAR upload and a guided 6-step migration.
4.  **📄 Import Documentation**: For users with existing project docs. This uses AI to extract structure and generate a blueprint in a 4-step flow.

## 3. Core Interaction Model

Regardless of the entry point, the onboarding experience is built on two core principles:

*   **Split Interface**: The screen is divided between a **Visual Builder** on the left (60%) and a **Conversational Chat Interface** on the right (40%). The Visual Builder provides a real-time preview of what the AI is constructing (e.g., live document previews, page layouts), while the Chat provides the interaction layer.
*   **Quick Actions**: To minimize typing and streamline decision-making, the user interacts primarily through context-aware buttons ("Quick Actions") that the AI generates based on the current step and user input.

## 4. Technical Implementation: The "Start Fresh" Journey

This table maps each step of the "Start Fresh" user journey to its key UI components and the backend AVCA/DIAS services that power it. This provides a clear technical link between frontend actions and backend processing.

| Step | Phase                       | Key UI Components                                  | Backend AVCA/DIAS Service(s) Invoked                     |
| :--- | :-------------------------- | :------------------------------------------------- | :------------------------------------------------------- |
| 1-2  | **Context & Blueprints**    | `OnboardingChat.tsx`, `QuickActionButton.tsx`      | `OnboardingAIService` (for conversational intelligence)  |
| 3    | **Live Document Crafting**  | `LiveDocumentPreview.tsx`, `DocumentSection.tsx`   | `DocumentGeneratorService` (to generate specs in real-time) |
| 4    | **Pages & Layout**          | `PagesStep.tsx` (with Draggable Grid)              | `BlueprintService` (to update the application structure)   |
| 5    | **Sub-Pages & Hierarchy**   | `SubPagesStep.tsx` (with Tree Interface)           | `BlueprintService`                                       |
| 6    | **Navigation**              | `NavigationStep.tsx`                               | `BlueprintService`                                       |
| 7    | **Component Scaffolding**   | `ComponentsStep.tsx` (with Wireframe Canvas)       | `BlueprintService`                                       |
| 8    | **Styling & Theme**         | `StylingStep.tsx` (with Template Gallery)          | `StylingService`                                         |
