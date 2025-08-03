# Quick Action System

## 1. Overview

The Quick Action System is a core architectural pattern that transforms Vibe Lab's AI chat from a text-only interface into an intelligent, interactive experience. Quick Actions are context-aware buttons that appear throughout the application, allowing users to make decisions, approve suggestions, and navigate complex workflows with single clicks.

**Core Principle**: Every AI response can include actionable buttons that execute immediate actions, reducing typing and accelerating workflows.

## 2. System Architecture

The system is defined by a core `QuickAction` interface and a generator that creates context-specific actions.

### Core Interface (`QuickAction`)
```typescript
interface QuickAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'suggest' | 'multi-select' | 'danger' | 'info' | 'warning';
  action: () => void | Promise<void>;
  metadata?: {
    icon?: string;
    description?: string;
    keyboard?: string;
    dangerous?: boolean;
    requiresConfirm?: boolean;
  };
  state?: {
    selected?: boolean;
    disabled?: boolean;
    loading?: boolean;
  };
}
```

### Context-Aware Generation
A `QuickActionGenerator` service is responsible for creating actions based on the current application context (e.g., the current page, the last AI message, the user's intent). This ensures that only relevant actions are presented to the user.

## 3. Key Integration Patterns

*   **Chat Message Integration**: The `ChatMessage` interface can optionally include an array of `QuickAction` objects, which are then rendered in the UI.
*   **Multi-Select Pattern**: For scenarios where a user can select multiple options (e.g., selecting features to add to a project), a special multi-select pattern is used, which includes a confirmation button.
*   **Progressive Actions**: Actions can trigger follow-up actions, creating a guided, step-by-step workflow. For example, after a successful action, a "View Result" action might appear. After a failed action, "View Errors" and "Retry" actions might appear.

## 4. UI/UX Implementation

*   **Component**: The primary component is `QuickActionButton.tsx`, which handles all UI logic, including loading states, selection states, and confirmation dialogs for dangerous actions.
*   **Styling**: A comprehensive styling system using Tailwind CSS provides distinct visual treatments for different action types (primary, secondary, danger, etc.) and states (selected, loading, disabled).

## 5. Advanced Features

*   **Keyboard Shortcuts**: The system includes a manager that can automatically assign and handle keyboard shortcuts (e.g., number keys 1-9) for the first nine actions displayed.
*   **Conditional Actions**: Actions can be configured with a condition that must be met before they are available or executed. If the condition is not met, a fallback action can be displayed instead.
*   **Analytics**: All Quick Action clicks are tracked to gather data on usage patterns, which can be used to improve the AI's suggestions over time.
