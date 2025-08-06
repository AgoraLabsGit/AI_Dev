# Vibe Lab User Interface Guide

**Document Type**: User Experience & Interface Standard
**Status**: Authoritative  
**Purpose**: This document defines the user experience flows, interface patterns, and interaction models for Vibe Lab's AI-powered development platform.

---

## 1. Core User Experience Philosophy

### 1.1. The User Journey: Design → Build → Iterate
The user experience is structured around a clear, iterative framework:

1. **Design**: Users start with an idea, repository, or document. The AI-driven onboarding process (`/onboarding`) helps them craft a high-level **Project Overview**. They then use the Blueprint Editor (`/plan`) to define the detailed **Build Specifications**.

2. **Build**: The system, guided by the AVCA pipeline and DIAS intelligence, uses the completed blueprint to generate the application code and a detailed roadmap and task list.

3. **Iterate**: The user can then iterate on the generated code, with the AI providing continuous support for refactoring, adding features, and ensuring quality.

### 1.2. Dynamic AI Partnership
The entire system is designed to be a dynamic, intelligent partner that:
- Continuously learns from user interactions
- Synchronizes all project documents automatically
- Uses AI agents to provide proactive assistance
- Suggests optimizations and identifies potential issues
- Maintains clear status indicators for all AI agents

### 1.3. Core Interface Principles
- **Information Density**: Maximize functionality in minimum space
- **Keyboard Efficiency**: Every action accessible via shortcuts
- **AI-Aware Interface**: Clear status indicators for all AI agents
- **Context-Aware Assistance**: Interface adapts based on current development stage

---

## 2. Navigation & Interaction Systems

### 2.1. Navigation Architecture
The navigation is divided into four main categories:

1. **Platform Features**: Dashboard, Auth, Teams, Monitoring
2. **AVCA Pipeline Stages**: Blueprints, Styling, Pages, Components, Preview  
3. **Build System**: Generation, Quality, Registry, Assembly
4. **AI Intelligence (DIAS)**: Smart Chat, Intent Routing, Learning System

**Primary Navigation**: `MainSidebar` component with specialized `CodeDirectory` mode for browsing file structures.

### 2.2. Keyboard-Driven Workflow
Inspired by Linear.app, the entire interface is optimized for keyboard use:

- **`Cmd+K`**: Opens global command palette for chat, commands, search, and navigation
- **`Tab`, `Arrow Keys`, `Enter`, `Esc`**: Standard, predictable navigation patterns
- **Context-Specific Shortcuts**: Each page provides relevant keyboard shortcuts

### 2.3. Quick Action System
**Purpose**: Accelerate workflows by reducing typing and decision fatigue.

**Implementation**: AI chat interface generates context-aware buttons (`QuickActions`) that allow users to:
- Approve AI suggestions with single click
- Make complex decisions through guided options
- Execute multi-step commands instantly
- Navigate between related tasks seamlessly

**Behavior**: QuickActions adapt based on:
- Current development stage
- User's previous choices
- Project type and complexity
- Available system capabilities

**🔌 API Connection Requirements** (Gap to Address):
The Quick Action system components exist but need to be wired to functional endpoints:

```typescript
interface QuickActionConnection {
  // Required API endpoints
  endpoints: {
    '/api/plan': 'Generate project plan',
    '/api/help': 'Get contextual assistance',
    '/api/review': 'Review and validate changes',
    '/api/generate': 'Generate code/components'
  };
  
  // Connection implementation
  implementation: {
    1. "Wire QuickAction component to API client",
    2. "Pass context (projectId, stage, userPrefs) with each call",
    3. "Handle streaming responses for real-time feedback",
    4. "Update UI state based on API responses"
  };
  
  // Integration points
  integration: {
    onboardingFlow: "Connect to onboarding context",
    projectContext: "Access current project state",
    userSession: "Maintain user preferences",
    aiContext: "Pass conversation history"
  };
}
```

**Implementation Priority**: HIGH - Quick Actions are designed but disconnected from the working API infrastructure.

---

## 3. Critical Page Flows & Interface Specifications

### 3.1. Onboarding Interface (`/onboarding`) ⭐ **PRODUCTION-READY**

**Purpose**: Multi-path entry point to transform any user input (idea, repo, codebase, docs) into a complete application blueprint.

**Interface Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                     Vibe Lab Header                         │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                       │
│   Visual Builder    │        Conversational Chat           │
│                     │                                       │
│ • Project Overview  │  AI: "What are you building today?"  │
│ • Build Specs       │                                       │
│ • Live Updates      │  User: "A task management app..."    │
│ • Progress Track    │                                       │
│                     │  AI: "Great! Let me suggest..."      │
│                     │  [Quick Action Buttons]              │
│                     │                                       │
│                     │  [Chat Input with AI Assistance]     │
└─────────────────────┴───────────────────────────────────────┘
```

**Left Pane - Visual Builder**:
- Real-time Project Overview generation
- Build Specifications development  
- Progress tracking with completion indicators
- Document preview with live updates
- Navigation between document sections

**Right Pane - Conversational Chat**:
- AI-powered conversation interface
- Context-aware QuickActions generated dynamically
- Stage-specific prompts and guidance
- Chat history with document correlation
- Input field with AI assistance and suggestions

**Interaction Model**:
- **Primary**: User interacts via QuickActions generated by AI
- **Secondary**: Direct text input when needed
- **Adaptive**: Interface evolves based on information gathered
- **Synchronized**: Both panes update simultaneously

**User Flow States**:
1. **Initial**: Welcome message with project type detection
2. **Requirements Gathering**: AI asks targeted questions with QuickActions
3. **Specification Building**: Technical requirements with template suggestions  
4. **Review & Refinement**: Final document review with edit capabilities
5. **Completion**: Transition to main application with generated documents

### 3.2. Visualize Page (`/project/[projectId]/visualize`)

**MVP Focus**: GitHub-first workflow for code deployment.

**Interface Components**:
- **In-App Code Preview**: Read-only interface to inspect complete generated codebase
- **GitHub Integration**: One-click action to create new repository and push code
- **File Explorer**: Navigate through generated project structure
- **Code Viewer**: Syntax-highlighted code display with copy functionality

**Post-MVP Vision**: Live, shareable application preview with real-time updates.

---

## 4. Application Preview Strategy

### 4.1. Progressive Preview System
The preview system evolves across the AVCA pipeline stages:

**Stage 0 (Import)**: 
- Preview analysis of existing codebase
- Show conversion to Tailwind CSS
- Highlight structural improvements

**Stage 2 (Styling)**:
- Live preview of different style template variations
- Real-time template switching without rebuilds
- Visual comparison between design systems

**Stage 8 (Assembly)**:
- Full, shareable preview of final application (Post-MVP)
- Interactive prototype with all functionality
- Performance metrics and optimization suggestions

### 4.2. Template Variation System
**Architecture**: Different visual styles (Apple, Linear, Strike) applied by swapping Tailwind class sets.

**Benefits**:
- No CSS rebuilds required
- Zero style conflicts
- Instant theme switching
- Consistent component behavior across templates
- Easy A/B testing of design systems

---

## 5. Responsive Design Strategy

### 5.1. Layout Adaptation
- **Desktop**: Full three-column view with maximum information density
- **Tablet**: Two-column layout with collapsible sidebar
- **Mobile**: Tab-based interface with swipe navigation
- **Breakpoints**: Standard Tailwind responsive breakpoints

### 5.2. Primary Structure
- **Header**: Project context and AI status indicators
- **Main Content**: Stage-specific routes and workflows
- **Sidebar**: Context-sensitive navigation and tools
- **Chat Interface**: Always accessible AI assistance

---

## 6. Interface Component Standards

### 6.1. AI Status Indicators
Clear visual feedback for all AI agent activities:
- **Thinking**: Animated indicators during processing
- **Active**: Which AI agents are currently engaged
- **Results**: Completion status and confidence levels
- **Errors**: Clear error states with recovery options

### 6.2. Progress Tracking
Throughout all workflows:
- **Stage Indicators**: Show current position in AVCA pipeline
- **Completion Metrics**: Percentage complete with time estimates
- **Quality Gates**: Visual feedback on validation status
- **Document Status**: Real-time sync status of all project documents

### 6.3. Context-Aware Help
- **Tooltips**: Contextual help for complex features
- **Onboarding Hints**: Progressive disclosure of advanced features
- **Keyboard Shortcuts**: Always visible for current context
- **AI Assistance**: Always available through global command palette

---

This interface guide ensures Vibe Lab provides an intuitive, efficient, and intelligent user experience that scales from simple projects to complex enterprise applications.