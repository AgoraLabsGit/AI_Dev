# 02 - Page Architecture
**Application Structure, User Flow, and Component Mapping**
<!-- AI Genesis Guide: Use this document to define the high-level page structure of the application. Map out each page, its purpose, and the core components it will require. -->

---

## 1. High-Level User Flow (Complete Vision)
- `Unauthenticated User` -> `Login Page` -> `Onboarding Wizard` (First time only)
- `Authenticated User` -> `Dashboard` -> `Select or Create Project` -> `Workspace`
- **Workspace Navigation**: Following the **Plan / Build / Test / Visualize** framework via Linear-inspired three-column layout.
    - `Plan` (Blueprint creation and roadmap generation)
    - `Build` (Task management and development)
    - `Test` (Quality assurance and validation)
    - `Visualize` (Project output and review)
- **Command Palette**: Primary interaction via `Cmd+K` Vibe Chat accessible from any page

---

## 2. Core Application Layout
Magic-enhanced Linear-inspired three-column layout optimized for keyboard-driven productivity with professional-grade UI components.

- **`<AppLayout />`** (Magic-Enhanced Three-Column Layout)
    - **Column 1 - Navigation (`<MainNavigation />`)**: Fixed sidebar with Magic navigation components, project switching, and status indicators
    - **Column 2 - Content (`<MainContent />`)**: Primary content area with Magic data visualization, interactive components, and Monaco Editor integration
    - **Column 3 - Context (`<ContextualPanel />`)**: Magic-enhanced details panel with AI agent status, real-time updates, and contextual actions
    - **`<CommandPalette />`**: Magic multi-tab interface accessible via `Cmd+K` - Chat, Commands, Search, Navigation tabs with fuzzy search and AI coordination

---

## 2.1. Magic MCP Component Integration Strategy

Magic MCP provides production-ready UI components through AI-powered generation and the 21st.dev component library. This integration elevates Vibe Lab from basic UI to professional-grade developer tool experience.

### Core Magic Integration Principles
- **Production-Ready Components**: Copy-paste components with full customization, no vendor lock-in
- **AI-Powered Generation**: Natural language descriptions generate professional UI components
- **21st.dev Library**: Access to curated, tested component patterns from the community
- **Seamless Integration**: Automatic styling integration with Vibe Lab design system

### Magic Component Categories for Vibe Lab
- **Data Visualization**: Interactive charts, graphs, dependency visualizers, architecture diagrams
- **Developer Tools**: Monaco Editor integration, file browsers, Git visualizers, terminal interfaces
- **AI Coordination**: Agent status displays, context visualization, real-time collaboration indicators
- **Command Interfaces**: Advanced command palette, multi-tab interfaces, keyboard shortcut overlays
- **Project Management**: Task boards, progress tracking, resource allocation dashboards

### Magic Integration Workflow
1. **Component Discovery**: Use Magic MCP to search 21st.dev library for relevant patterns
2. **AI Generation**: Describe component requirements in natural language
3. **Customization**: Apply Vibe Lab design system and specific functionality requirements
4. **Integration**: Copy-paste generated component with full TypeScript support
5. **Enhancement**: Add Vibe Lab-specific features and AI integration capabilities

---

## 3. Page Definitions

### 3.1. Onboarding Wizard **(MVP - Step 1)**
- **Route**: `/welcome`
- **Purpose**: A one-time setup wizard for new users.
- **Steps**:
    - 1. Welcome message and brief tour of the Vibe Lab concept.
    - 2. Connect GitHub account (critical for MVP's "Push-to-GitHub" feature).
    - 3. Confirmation and redirection to the Dashboard.
    - *Note*: The Local Agent setup mentioned in `UX_FLOW.md` is a Post-MVP feature and will not be included here initially.

### 3.2. Login Page **(MVP)**
- **Route**: `/login`
- **Purpose**: Authenticate the user, primarily via GitHub OAuth.

### 3.3. Dashboard Page **(MVP + Magic Enhanced)**
- **Route**: `/dashboard`
- **Purpose**: User's home base to see all their projects and create new ones. Enhanced with Magic components for professional project management experience.
- **Magic Components**: Interactive project cards with hover states, drag-drop reordering, quick action buttons, progress visualization, recent activity feed with AI agent actions

### 3.4. New Project Wizard **(MVP + Enhanced)**
- **Route**: `/new` (Likely presented as a modal over the dashboard)
- **Purpose**: To guide the user through creating a new project or enhancing an existing one.
- **Steps (Enhanced with 4 pathways)**:
    - 1. **"How would you like to start?"**
        - **Option 1: Fresh Project** - Start from scratch with AI-guided blueprint creation
        - **Option 2: Migration** - Convert existing code or documentation to structured project
        - **Option 3: GitHub Import** - Import and enhance existing repository
        - **Option 4: Targeted Enhancement** **(NEW)** - Fix, improve, or add features to specific parts of existing project
    - 2. **Targeted Enhancement Sub-Options** (if Option 4 selected):
        - Bug Fix: Fix specific bugs or issues
        - Feature Addition: Add new functionality to existing codebase
        - Refactoring: Improve code quality/structure
        - Modernization: Update dependencies/patterns
        - Performance: Optimize performance bottlenecks
        - Security: Fix security vulnerabilities
        - Documentation: Add/improve documentation
        - Testing: Add test coverage
    - 3. Confirmation, project creation, and redirection to appropriate workflow (Plan page or Codebase Analysis)

### 3.5. Plan Page **(MVP + Magic Enhanced)**
- **Route**: `/project/{projectId}/plan`
- **Purpose**: **PLAN phase** - Blueprint creation, roadmap generation, and codebase analysis. Interactive editor for AI-guided blueprint documents with multi-agent analysis capabilities.
- **Core Magic Components**: Enhanced form components, real-time collaboration indicators, dual-Claude chat interface with sophisticated agent status displays
- **Magic Data Visualization**: Auto-generated architecture diagrams, interactive dependency graphs, code quality metrics dashboards
- **Enhanced Features for Existing Projects**:
  - **Codebase Overview**: Magic-powered architecture diagrams, dependency visualization, code metrics with interactive charts
  - **Enhancement Strategy**: Magic workflow components for target definition, success criteria visualization, constraint management
  - **Risk Assessment**: Magic-enhanced impact analysis matrices, technical debt heatmaps, security vulnerability dashboards
  - **Agent Coordination**: Magic status indicators for Codebase Analyst and Legacy Modernizer integration with real-time progress tracking

### 3.6. Build Page **(MVP + Magic Enhanced)**
- **Route**: `/project/{projectId}/build`
- **Purpose**: **BUILD phase** - Task management and development tracking. Displays enhanced task analysis generated by Task Master (SuperClaude) from the approved roadmap.
- **Magic Data Visualization Features**: 
  - **Interactive Task Complexity Heatmap**: Magic-enhanced visualization with color-coded complexity scores, sortable columns, filtering capabilities
  - **Dependency Graph Visualizer**: Magic force-directed graph with zoom/pan controls, node clustering, critical path highlighting
  - **Resource Allocation Dashboard**: Magic charts showing parallel work streams, developer assignments, and capacity planning
  - **Progress Tracking Interface**: Magic progress indicators, real-time status updates, completion animations
  - **Wave Orchestration Display**: Magic timeline components showing multi-stage execution with validation gate indicators

### 3.7. Test Page **(MVP)**
- **Route**: `/project/{projectId}/test`
- **Purpose**: **TEST phase** - Quality assurance and validation. Foundation review and code quality assessment using multi-agent system.
- **Features**: Foundation review, audit results from Claude, quality gates

### 3.8. Visualize Page **(MVP + Magic Enhanced)**
- **Route**: `/project/{projectId}/visualize`
- **Purpose**: **VISUALIZE phase** - Complete project review and delivery. View generated code within Vibe Lab, then create GitHub repository for local development.
- **Magic-Enhanced Features**:
  - **Advanced Code Preview**: 
    - Monaco Editor integration with Magic styling for professional code editing experience
    - Magic file tree navigation with search, filtering, and advanced interactions
    - AI-generated code highlighting and modification indicators
    - Multi-file tabbed interface with split-view capabilities
    - Code folding, minimap, and advanced editor features
  - **Interactive Documentation**: 
    - Magic layout components for README and project documentation
    - Magic-enhanced architecture diagrams with interactive exploration
    - Project structure visualization with Magic chart components
  - **GitHub Integration Interface**:
    - Magic status indicators for repository creation workflow
    - Magic progress components for automated setup instruction generation
    - Magic notification components for deployment status and success indicators
  - **Development Log Visualization**: Magic timeline components for project decision history and AI collaboration tracking
- **Application Preview (Approach)**:
  - **MVP**: GitHub repository → Local development workflow with Magic-enhanced guidance interface
  - **Post-MVP Enhancement**: Optional live preview deployment with Magic monitoring dashboard

### 3.9. Directory Page **(Post-MVP)**
- **Route**: `/project/{projectId}/directory`
- **Purpose**: File structure exploration utility.
- **Sub-Views / Components**:
    - **`<FocusView />`**: Intelligently displays only files relevant to current task
    - **`<FullTreeView />`**: Traditional file explorer

### 3.10. Component Lab **(Post-MVP)**
- **Route**: `/project/{projectId}/components`
- **Purpose**: Storybook-like environment for viewing individual UI components in isolation. 