# Vibe Lab Quick Action System
## Universal Chat Integration for Intelligent Interactions

## Overview

The Quick Action System transforms Vibe Lab's AI chat from a text-only interface into an intelligent, interactive experience. Quick Actions appear contextually throughout the application, allowing users to make decisions, approve suggestions, and navigate complex workflows with single clicks.

**Core Principle**: Every AI response can include actionable buttons that execute immediate actions, reducing typing and accelerating workflows.

---

## System Architecture

### Core Components

```typescript
interface QuickActionSystem {
  // Base quick action structure
  interface QuickAction {
    id: string;
    label: string;
    type: QuickActionType;
    action: () => void | Promise<void>;
    metadata?: {
      icon?: string;
      description?: string;
      keyboard?: string; // Keyboard shortcut
      dangerous?: boolean;
      requiresConfirm?: boolean;
    };
    state?: {
      selected?: boolean;
      disabled?: boolean;
      loading?: boolean;
    };
  }
  
  // Action types for different contexts
  type QuickActionType = 
    | 'primary'      // Main action (green/blue)
    | 'secondary'    // Alternative action (gray)
    | 'suggest'      // AI suggestion (outlined)
    | 'multi-select' // Can select multiple
    | 'danger'       // Destructive action (red)
    | 'info'         // Informational (blue)
    | 'warning'      // Caution needed (yellow);
}
```

### Context-Aware Action Generator

```typescript
class QuickActionGenerator {
  generateActions(context: ChatContext): QuickAction[] {
    const { currentPage, lastMessage, projectState, userIntent } = context;
    
    switch (currentPage) {
      case 'design':
        return this.generateDesignActions(context);
      case 'build':
        return this.generateBuildActions(context);
      case 'dashboard':
        return this.generateDashboardActions(context);
      default:
        return this.generateGenericActions(context);
    }
  }
  
  private generateDesignActions(context: ChatContext): QuickAction[] {
    if (context.lastMessage.includes('component')) {
      return [
        {
          id: 'create-component',
          label: '🎨 Create Component',
          type: 'primary',
          action: () => this.triggerComponentCreation()
        },
        {
          id: 'browse-registry',
          label: '📚 Browse Registry',
          type: 'secondary',
          action: () => this.openComponentRegistry()
        },
        {
          id: 'suggest-similar',
          label: '💡 Suggest Similar',
          type: 'suggest',
          action: () => this.suggestSimilarComponents()
        }
      ];
    }
    // ... more contextual actions
  }
}
```

---

## Integration Patterns

### 1. Chat Message Integration

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  quickActions?: QuickAction[];
  timestamp: Date;
  metadata?: {
    model?: string;
    tokenCount?: number;
    context?: string;
  };
}

// Example message with quick actions
const exampleMessage: ChatMessage = {
  id: 'msg_123',
  role: 'assistant',
  content: 'I found 3 similar components in your registry:',
  quickActions: [
    {
      id: 'use-searchbar',
      label: 'Use SearchBar',
      type: 'primary',
      action: () => implementComponent('SearchBar')
    },
    {
      id: 'use-filterinput',
      label: 'Use FilterInput',
      type: 'secondary',
      action: () => implementComponent('FilterInput')
    },
    {
      id: 'create-custom',
      label: 'Create Custom',
      type: 'suggest',
      action: () => startComponentCreation()
    }
  ]
};
```

### 2. Multi-Select Pattern

```typescript
interface MultiSelectActions {
  options: QuickAction[];
  minSelection?: number;
  maxSelection?: number;
  onSelectionChange?: (selected: string[]) => void;
  confirmButton?: {
    label: string;
    action: (selected: string[]) => void;
  };
}

// Example: Feature selection
const featureSelection: MultiSelectActions = {
  options: [
    { id: 'auth', label: '🔐 Authentication', type: 'multi-select' },
    { id: 'payments', label: '💳 Payments', type: 'multi-select' },
    { id: 'analytics', label: '📊 Analytics', type: 'multi-select' },
    { id: 'notifications', label: '🔔 Notifications', type: 'multi-select' }
  ],
  minSelection: 1,
  confirmButton: {
    label: 'Add Selected Features',
    action: (selected) => addFeaturesToProject(selected)
  }
};
```

### 3. Progressive Actions

```typescript
class ProgressiveActionFlow {
  // Actions that lead to more actions
  async executeWithFollowUp(action: QuickAction): Promise<QuickAction[]> {
    const result = await action.action();
    
    // Generate follow-up actions based on result
    if (result.success) {
      return [
        {
          id: 'view-result',
          label: '👀 View Result',
          type: 'primary',
          action: () => navigateToResult(result)
        },
        {
          id: 'continue-pipeline',
          label: '➡️ Continue to Next Stage',
          type: 'suggest',
          action: () => proceedToPipeline()
        }
      ];
    } else {
      return [
        {
          id: 'view-errors',
          label: '⚠️ View Errors',
          type: 'warning',
          action: () => showErrorDetails(result.errors)
        },
        {
          id: 'retry',
          label: '🔄 Try Again',
          type: 'secondary',
          action: () => this.retry()
        }
      ];
    }
  }
}
```

---

## UI/UX Implementation

### Quick Action Button Component

```tsx
// components/chat/QuickActionButton.tsx
export function QuickActionButton({ 
  action, 
  onClick,
  multiSelect = false 
}: QuickActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(action.state?.selected || false);
  
  const handleClick = async () => {
    if (action.metadata?.requiresConfirm) {
      const confirmed = await showConfirmDialog({
        title: 'Confirm Action',
        message: `Are you sure you want to ${action.label}?`,
        dangerous: action.metadata.dangerous
      });
      
      if (!confirmed) return;
    }
    
    setIsLoading(true);
    
    try {
      if (multiSelect) {
        setIsSelected(!isSelected);
        onClick?.(action);
      } else {
        await action.action();
        onClick?.(action);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      className={cn(
        'quick-action-btn',
        `quick-action-${action.type}`,
        {
          'quick-action-selected': isSelected,
          'quick-action-loading': isLoading,
          'quick-action-disabled': action.state?.disabled
        }
      )}
      onClick={handleClick}
      disabled={action.state?.disabled || isLoading}
      title={action.metadata?.description}
    >
      {action.metadata?.icon && (
        <span className="quick-action-icon">{action.metadata.icon}</span>
      )}
      <span className="quick-action-label">{action.label}</span>
      {action.metadata?.keyboard && (
        <kbd className="quick-action-shortcut">{action.metadata.keyboard}</kbd>
      )}
      {isLoading && <Spinner className="quick-action-spinner" />}
    </button>
  );
}
```

### Styling System

```css
/* Base quick action styles */
.quick-action-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 rounded-full
         text-sm font-medium transition-all duration-200
         hover:shadow-md active:scale-95;
}

/* Type variants */
.quick-action-primary {
  @apply bg-primary text-white hover:bg-primary-dark;
}

.quick-action-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200
         dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

.quick-action-suggest {
  @apply border-2 border-primary bg-white text-primary
         hover:bg-primary hover:text-white
         dark:bg-gray-900 dark:hover:bg-primary;
}

.quick-action-danger {
  @apply bg-red-500 text-white hover:bg-red-600;
}

.quick-action-warning {
  @apply bg-yellow-500 text-white hover:bg-yellow-600;
}

/* States */
.quick-action-selected {
  @apply bg-primary text-white;
  position: relative;
}

.quick-action-selected::after {
  content: '✓';
  @apply absolute -top-1 -right-1 w-5 h-5 bg-green-500
         rounded-full flex items-center justify-center
         text-white text-xs;
}

.quick-action-loading {
  @apply opacity-75 cursor-not-allowed;
}

/* Keyboard shortcut badge */
.quick-action-shortcut {
  @apply ml-2 px-1.5 py-0.5 text-xs bg-black/10 rounded
         dark:bg-white/10;
}
```

---

## Context-Specific Implementations

### Design Workspace Quick Actions

```typescript
const designWorkspaceActions = {
  componentCreation: [
    { label: '🎨 Create Component', action: createComponent },
    { label: '📋 Copy from Registry', action: copyFromRegistry },
    { label: '🔄 Generate Variants', action: generateVariants }
  ],
  
  styleModification: [
    { label: '🎨 Apply Theme', action: applyTheme },
    { label: '🌈 Customize Colors', action: customizeColors },
    { label: '📐 Adjust Spacing', action: adjustSpacing }
  ],
  
  layoutActions: [
    { label: '📱 Make Responsive', action: makeResponsive },
    { label: '🔲 Add Grid System', action: addGridSystem },
    { label: '↔️ Center Content', action: centerContent }
  ]
};
```

### Build Workspace Quick Actions

```typescript
const buildWorkspaceActions = {
  generation: [
    { label: '⚡ Generate All', action: generateAllComponents },
    { label: '🎯 Generate Selected', action: generateSelected },
    { label: '🔄 Regenerate Failed', action: regenerateFailed }
  ],
  
  testing: [
    { label: '✅ Run Tests', action: runTests },
    { label: '📊 Check Coverage', action: checkCoverage },
    { label: '🔍 Debug Failures', action: debugFailures }
  ],
  
  deployment: [
    { label: '🚀 Deploy to Staging', action: deployStaging },
    { label: '🌍 Deploy to Production', action: deployProduction },
    { label: '↩️ Rollback', action: rollbackDeployment }
  ]
};
```

### Error Recovery Actions

```typescript
const errorRecoveryActions = {
  componentError: [
    { label: '🔧 Auto-fix', type: 'primary', action: autoFix },
    { label: '📝 View Error', type: 'info', action: viewError },
    { label: '🔄 Retry', type: 'secondary', action: retry },
    { label: '❌ Skip', type: 'danger', action: skip }
  ],
  
  pipelineError: [
    { label: '🔍 Diagnose', type: 'primary', action: diagnoseError },
    { label: '⏮️ Restart Stage', type: 'secondary', action: restartStage },
    { label: '📋 Copy Error', type: 'info', action: copyError },
    { label: '🚫 Abort Pipeline', type: 'danger', action: abortPipeline }
  ]
};
```

---

## Advanced Features

### Keyboard Shortcuts

```typescript
class QuickActionKeyboardManager {
  private shortcuts: Map<string, QuickAction> = new Map();
  
  registerShortcuts(actions: QuickAction[]) {
    actions.forEach((action, index) => {
      if (index < 9) {
        // Number keys 1-9
        const shortcut = `${index + 1}`;
        this.shortcuts.set(shortcut, action);
        action.metadata = {
          ...action.metadata,
          keyboard: shortcut
        };
      }
    });
  }
  
  handleKeyPress(event: KeyboardEvent) {
    const key = event.key;
    const action = this.shortcuts.get(key);
    
    if (action && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      action.action();
    }
  }
}
```

### Conditional Actions

```typescript
interface ConditionalAction extends QuickAction {
  condition: () => boolean | Promise<boolean>;
  fallbackAction?: QuickAction;
}

// Example: Show different actions based on state
const conditionalActions: ConditionalAction[] = [
  {
    id: 'deploy',
    label: '🚀 Deploy',
    type: 'primary',
    condition: async () => {
      const tests = await checkTestsPassing();
      const build = await checkBuildSuccess();
      return tests && build;
    },
    action: deployToProduction,
    fallbackAction: {
      id: 'fix-issues',
      label: '🔧 Fix Issues First',
      type: 'warning',
      action: showBlockingIssues
    }
  }
];
```

### Action Analytics

```typescript
class QuickActionAnalytics {
  trackAction(action: QuickAction, context: ChatContext) {
    analytics.track('quick_action_clicked', {
      actionId: action.id,
      actionType: action.type,
      actionLabel: action.label,
      page: context.currentPage,
      projectId: context.projectId,
      timestamp: new Date(),
      sessionId: context.sessionId
    });
  }
  
  getMostUsedActions(timeframe: string): ActionStats[] {
    return analytics.query({
      event: 'quick_action_clicked',
      timeframe,
      groupBy: 'actionId',
      orderBy: 'count desc',
      limit: 10
    });
  }
}
```

---

## Implementation Checklist

### Phase 1: Core System (2-3 days)
- [ ] Create QuickAction type definitions
- [ ] Build QuickActionButton component
- [ ] Implement action execution logic
- [ ] Add loading and error states

### Phase 2: Chat Integration (2-3 days)
- [ ] Update ChatMessage type to include actions
- [ ] Create QuickActionGenerator service
- [ ] Implement context-aware action generation
- [ ] Add keyboard shortcut support

### Phase 3: Feature-Specific Actions (3-4 days)
- [ ] Design workspace actions
- [ ] Build workspace actions
- [ ] Dashboard actions
- [ ] Error recovery actions

### Phase 4: Advanced Features (2-3 days)
- [ ] Multi-select implementation
- [ ] Progressive action flows
- [ ] Conditional actions
- [ ] Analytics integration

---

## Usage Examples

### Basic Implementation

```tsx
// In any chat-enabled component
function DesignChat() {
  const { messages, sendMessage } = useChat();
  const { generateActions } = useQuickActions();
  
  return (
    <ChatContainer>
      {messages.map(message => (
        <ChatMessage key={message.id} message={message}>
          {message.quickActions && (
            <QuickActionBar actions={message.quickActions} />
          )}
        </ChatMessage>
      ))}
    </ChatContainer>
  );
}
```

### Complex Workflow

```tsx
// Multi-step component creation
const componentWorkflow = {
  step1: {
    message: "What type of component do you want to create?",
    actions: [
      { label: "📊 Data Display", action: () => setType('data') },
      { label: "📝 Form Input", action: () => setType('form') },
      { label: "🎨 Layout", action: () => setType('layout') }
    ]
  },
  step2: {
    message: "Choose a starting template:",
    actions: async (type) => {
      const templates = await getTemplatesForType(type);
      return templates.map(t => ({
        label: t.name,
        action: () => selectTemplate(t.id)
      }));
    }
  },
  step3: {
    message: "Customize your component:",
    actions: [
      { label: "✏️ Edit Props", action: editProps },
      { label: "🎨 Style", action: editStyles },
      { label: "✅ Generate", action: generateComponent, type: 'primary' }
    ]
  }
};
```

---

## Best Practices

1. **Contextual Relevance**: Only show actions that make sense in the current context
2. **Clear Labels**: Use concise, action-oriented labels with optional icons
3. **Visual Hierarchy**: Use action types to indicate importance
4. **Keyboard Support**: Provide shortcuts for power users
5. **Loading States**: Always show feedback during async operations
6. **Error Handling**: Gracefully handle action failures
7. **Analytics**: Track usage to improve suggestions

---

*The Quick Action System transforms Vibe Lab's AI chat into an intelligent command center, making complex workflows simple and accelerating development through contextual, one-click actions.*