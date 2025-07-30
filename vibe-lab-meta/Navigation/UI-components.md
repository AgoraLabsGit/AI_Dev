# Vibe Lab UI Components - Comprehensive Audit

## Navigation Structure

### **Main Sidebar Menu**
```typescript
interface MainSidebar {
  // Context-aware navigation
  homeMode: {
    items: ['Home'],
    switcher: 'Main Menu ↔ Code Directory',
    globalActions: ['Analytics', 'Team', 'Settings']
  },
  
  projectMode: {
    items: ['Dashboard', 'Design', 'Build'], 
    projectSelector: 'Current Project Dropdown',
    switcher: 'Main Menu ↔ Code Directory',
    backToHome: '← All Projects'
  }
}
```

**Passive Components:**
- `SidebarLogo` - Vibe Lab branding
- `ProjectNameDisplay` - Current project name
- `NavigationIndicator` - Current page highlight
- `UserAvatar` - Profile picture display

**Active Components:**
- `NavigationButton` - Home/Dashboard/Design/Build buttons  
- `ProjectSelector` - Dropdown to switch projects
- `MenuModeSwitcher` - Toggle between Main Menu ↔ Code Directory
- `BackToHomeButton` - Return to all projects view
- `UserProfileDropdown` - User menu with logout/settings

### **Code Directory Mode (Sidebar Alternative)**
```typescript
interface CodeDirectorySidebar {
  // File explorer view
  structure: {
    generated: 'Generated components',
    registry: 'Component registry browser',
    blueprints: 'Project documentation',
    assets: 'Design assets and files'
  }
}
```

**Passive Components:**
- `DirectoryTree` - File/folder structure display
- `FileIcons` - File type indicators
- `FileSizeIndicator` - File size display
- `LastModifiedTime` - File modification timestamps

**Active Components:**
- `DirectoryExpander` - Expand/collapse folders
- `FileSelector` - Click to open files
- `SearchInput` - Search through directory
- `FilterDropdown` - Filter by file type
- `RefreshButton` - Reload directory structure

### **Horizontal Sub-Navigation**
```typescript
interface SubNavigation {
  // Page-specific tabs
  home: ['Overview', 'Analytics', 'Team', 'Settings'],
  dashboard: ['Overview', 'DIAS Intelligence', 'Activity'],
  design: ['Blueprints', 'Styling', 'Pages', 'Components'],
  build: ['Generate', 'Quality', 'Registry', 'Preview', 'Deploy']
}
```

**Passive Components:**
- `TabIndicator` - Current active tab highlight
- `TabCounter` - Count badges on tabs (e.g., "5 Components")
- `ProgressDots` - Stage completion indicators

**Active Components:**
- `TabButton` - Clickable tab navigation
- `TabCloseButton` - Close tab (if closeable)
- `TabContextMenu` - Right-click tab options

---

## Home Page Components

### **Passive Components (Information Display)**

**Project Overview:**
- `ProjectCard` - Individual project summary display
- `ProjectStatusBadge` - Active/completed/archived status
- `ProjectProgressBar` - Overall completion percentage
- `ProjectThumbnail` - Visual preview of project
- `LastAccessedTime` - When project was last opened
- `TeamMemberAvatars` - Who's working on project

**Global Statistics:**
- `TotalProjectsCounter` - Number of projects
- `MonthlyUsageStats` - Token/cost consumption
- `QualityScoreDisplay` - Overall quality metrics
- `TeamActivityFeed` - Recent team actions
- `CostTrendChart` - Monthly cost visualization
- `UsageHeatmap` - Activity patterns

**System Status:**
- `SystemHealthIndicator` - AVCA-DIAS system status
- `APIStatusDisplay` - External service health
- `PerformanceMetrics` - Response time displays
- `MaintenanceNotifications` - System announcements

### **Active Components (User Interactions)**

**Project Management:**
- `NewProjectButton` - Create new project
- `ProjectCardActions` - Edit/duplicate/delete menu
- `ProjectSearchInput` - Search through projects
- `ProjectFilterDropdown` - Filter by status/team/date
- `ProjectSortSelector` - Sort options
- `BulkProjectActions` - Multi-select operations

**Quick Actions:**
- `TemplateSelector` - Choose project template
- `ImportProjectButton` - Import from GitHub/etc
- `TeamInviteButton` - Invite team members
- `SettingsShortcut` - Quick access to settings

---

## Project Dashboard Components

### **Passive Components**

**Project Overview:**
- `ProjectMetricsGrid` - Key project statistics
- `PipelineStatusDisplay` - Current AVCA stage
- `ComponentCountDisplay` - Generated components count
- `QualityScoreCard` - Project quality metrics
- `CostTrackingDisplay` - Project-specific costs
- `DeploymentStatusCard` - Current deployment state

**DIAS Intelligence:**
- `PredictiveInsightsPanel` - AI predictions display
- `LearningProgressChart` - System learning visualization
- `PatternDetectionResults` - Identified patterns
- `OptimizationSuggestions` - System recommendations
- `IntelligenceMetrics` - DIAS module performance

**Activity Tracking:**
- `ActivityTimeline` - Chronological activity feed
- `TeamMemberActivity` - Who did what when
- `AIInteractionLog` - Chat and AI decisions
- `ChangeHistory` - Project modifications log
- `ErrorLog` - Recent errors and resolutions

### **Active Components**

**Project Controls:**
- `PipelineControlButtons` - Start/pause/reset pipeline
- `StageJumpSelector` - Navigate to specific stage
- `ProjectSettingsButton` - Edit project configuration
- `ExportProjectButton` - Export project data
- `ArchiveProjectButton` - Archive/delete project

**DIAS Interactions:**
- `IntelligenceToggle` - Enable/disable DIAS modules
- `PredictionRefreshButton` - Update predictions
- `LearningFeedbackForm` - Rate AI suggestions
- `OptimizationApprovalButton` - Approve/reject suggestions

---

## Design Workspace Components

### **Passive Components**

**Blueprint Stage (Stage 1):**
- `RequirementsDisplay` - Project requirements text
- `UserStoryCards` - User story visualization
- `FeatureListDisplay` - Feature breakdown
- `TechnicalRequirements` - Tech stack display
- `ProjectScopeIndicator` - Scope visualization

**Styling Stage (Stage 2):**
- `ThemePreview` - Current theme visualization
- `ColorPaletteDisplay` - Color scheme preview
- `TypographyPreview` - Font and text styles
- `ComponentStyleGuide` - Style system preview
- `DesignTokensDisplay` - Design token values

**Pages Stage (Stage 3):**
- `PageLayoutPreview` - Wireframe/layout display
- `UserFlowDiagram` - User journey visualization
- `ResponsiveBreakpoints` - Mobile/tablet/desktop views
- `NavigationStructure` - Site map display
- `InteractionAnnotations` - UI interaction notes

**Components Stage (Stage 4):**
- `ComponentSpecDisplay` - Component requirements
- `DependencyGraph` - Component relationships
- `PropsDefinition` - Component props display
- `UsageExamples` - Component usage examples
- `DesignPatternGuide` - Pattern documentation

### **Active Components**

**Blueprint Tools:**
- `RequirementsEditor` - Edit project requirements
- `UserStoryBuilder` - Create/edit user stories
- `FeatureToggler` - Enable/disable features
- `ScopeAdjuster` - Modify project scope
- `AIRequirementsHelper` - AI-assisted requirement generation

**Styling Tools:**
- `ThemeSelector` - Choose from theme options
- `ColorPicker` - Custom color selection
- `FontSelector` - Typography choices
- `StyleCustomizer` - Custom style adjustments
- `ThemeExporter` - Export theme configuration

**Page Design Tools:**
- `LayoutBuilder` - Drag-and-drop layout creation
- `ComponentPlacer` - Place components on pages
- `ResponsiveEditor` - Edit responsive breakpoints
- `FlowConnector` - Connect user flows
- `AnnotationTool` - Add interaction notes

**Component Design Tools:**
- `ComponentBuilder` - Visual component creation
- `PropsEditor` - Define component properties
- `VariantCreator` - Create component variants
- `PatternSelector` - Choose design patterns
- `ComponentValidator` - Validate component specs

---

## Build Workspace Components

### **Passive Components**

**Generate Stage (Stage 5):**
- `GenerationProgress` - Code generation progress
- `ComponentPreview` - Generated component preview
- `CodeOutput` - Generated code display
- `GenerationLog` - Generation process log
- `TokenUsageDisplay` - AI token consumption

**Quality Stage (Stage 6):**
- `TestResultsDisplay` - Test execution results
- `CoverageReport` - Code coverage visualization
- `SecurityScanResults` - Security audit results
- `PerformanceMetrics` - Performance test results
- `QualityGateStatus` - Pass/fail indicators

**Registry Stage (Stage 7):**
- `ComponentRegistryBrowser` - Browse registered components
- `AtomicTypeFilter` - Filter by 8 atomic types
- `DependencyViewer` - Component dependencies
- `UsageAnalytics` - Component usage stats
- `VersionHistory` - Component version tracking

**Preview Stage (Stage 8):**
- `ApplicationPreview` - Live app preview
- `ResponsivePreview` - Multi-device preview
- `InteractionTester` - Test app interactions
- `PerformanceMonitor` - Preview performance metrics
- `ErrorConsole` - Runtime error display

**Deploy Stage:**
- `DeploymentStatus` - Current deployment state
- `EnvironmentSelector` - Target environment display
- `BuildLogs` - Deployment process logs
- `LiveURLDisplay` - Deployed application URL
- `RollbackHistory` - Previous deployment versions

### **Active Components**

**Generation Controls:**
- `GenerateButton` - Start code generation
- `RegenerateButton` - Regenerate specific components
- `GenerationSettings` - Configure generation options
- `TemplateSelector` - Choose code templates
- `AIModelSelector` - Choose AI model for generation

**Quality Controls:**
- `RunTestsButton` - Execute test suite
- `QualityGateToggle` - Enable/disable specific gates
- `TestConfigEditor` - Edit test configuration
- `CoverageSettings` - Configure coverage requirements
- `ManualReviewButton` - Request human review

**Registry Management:**
- `ComponentUploader` - Upload custom components
- `RegistrySearch` - Search component registry
- `ComponentInstaller` - Install external components
- `VersionSelector` - Choose component versions
- `RegistryFilters` - Filter registry contents

**Preview Controls:**
- `PreviewRefresh` - Refresh preview
- `DeviceSelector` - Switch preview devices
- `InteractionRecorder` - Record user interactions
- `ScreenshotTool` - Capture preview screenshots
- `SharePreview` - Share preview link

**Deployment Controls:**
- `DeployButton` - Deploy to environment
- `EnvironmentSelector` - Choose target environment
- `DeploymentConfigEditor` - Edit deployment settings
- `RollbackButton` - Rollback to previous version
- `DeploymentScheduler` - Schedule deployments

---

## Persistent Chat Components

### **Passive Components**

**Chat Interface:**
- `MessageBubble` - Individual chat messages
- `AIAvatarIndicator` - Developer/Auditor AI indicator
- `TypingIndicator` - AI is responding indicator
- `MessageTimestamp` - Message time display
- `TokenCountDisplay` - Real-time token usage
- `CostMeter` - Current session cost

**AI Status:**
- `AIStatusPanel` - Current AI mode display
- `ContextIndicator` - What AI knows about current page
- `ConfidenceScore` - AI confidence in responses
- `ProcessingStatus` - AI processing indicator
- `AuditorTriggerReason` - Why Auditor was activated

**Context Awareness:**
- `CurrentPageContext` - What page user is on
- `ProjectContext` - Current project information
- `PipelineStageContext` - Current AVCA stage
- `RecentDecisions` - Recent user choices
- `SessionSummary` - Current session overview

### **Active Components**

**Chat Controls:**
- `MessageInput` - Type messages to AI
- `SendButton` - Send message button
- `VoiceInputButton` - Voice message input
- `AttachmentButton` - Attach files/images
- `EmojiSelector` - Add emoji reactions

**AI Management:**
- `AIModeToggle` - Switch between Developer/Auditor
- `ForceAuditorButton` - Manually trigger Auditor
- `ContextRefresh` - Refresh AI context
- `ClearConversation` - Start new conversation
- `ExportChatHistory` - Download chat log

**Quick Actions:**
- `SuggestionChips` - Quick action buttons
- `TemplateResponses` - Pre-written common responses
- `PipelineTriggers` - Start AVCA stages from chat
- `ComponentGenerators` - Quick component requests
- `HelpButton` - Show chat help/commands

**Cost Controls:**
- `BudgetAlert` - When approaching limits
- `CostOptimizationButton` - Suggest cost savings
- `TokenLimitSetter` - Set session token limits
- `BillingShortcut` - Quick access to billing

---

## Global Components (Used Across Pages)

### **Passive Components**

**System-wide:**
- `LoadingSpinner` - Loading state indicator
- `ProgressBar` - Task progress indicator
- `StatusBadge` - Success/error/warning indicators
- `Tooltip` - Hover information display
- `Breadcrumbs` - Navigation path display
- `NotificationToast` - Temporary notifications

**Error Handling:**
- `ErrorBoundary` - Error state display
- `ErrorMessage` - Error text display
- `WarningPanel` - Warning messages
- `SuccessMessage` - Success confirmations
- `InfoAlert` - Information announcements

### **Active Components**

**Navigation:**
- `CommandPalette` - Cmd+K search interface
- `GlobalSearch` - Search across all projects
- `NotificationCenter` - Click to view notifications
- `UserMenu` - Profile and settings dropdown
- `ThemeToggle` - Dark/light mode switcher

**Modals & Overlays:**
- `Modal` - General modal container
- `ConfirmDialog` - Confirmation dialogs
- `SettingsModal` - Settings overlay
- `ShareModal` - Sharing options
- `HelpOverlay` - Help and tutorials

**Form Elements:**
- `TextInput` - Text input fields
- `Dropdown` - Selection dropdowns
- `Checkbox` - Boolean selections
- `RadioButton` - Single choice selections
- `FileUploader` - File upload interface
- `DatePicker` - Date selection
- `ColorPicker` - Color selection
- `Slider` - Range selections

---

## Component Count Summary

### **By Category:**
- **Passive Components**: 87 total
  - Home: 15 components
  - Dashboard: 18 components  
  - Design: 22 components
  - Build: 25 components
  - Chat: 12 components
  - Global: 15 components

- **Active Components**: 93 total
  - Home: 12 components
  - Dashboard: 8 components
  - Design: 21 components
  - Build: 24 components
  - Chat: 13 components
  - Global: 15 components

### **Total UI Components: 180**

### **Navigation Components:**
- Main Sidebar: 9 components (5 passive, 4 active)
- Code Directory: 8 components (4 passive, 4 active)  
- Sub-navigation: 6 components (3 passive, 3 active)

### **Grand Total: 203 UI Components**

---

## Implementation Priority

### **Phase 1: Core Navigation & Home (30 components)**
- Main sidebar with menu switcher
- Home page project management
- Basic navigation flows

### **Phase 2: Project Dashboard & Chat (35 components)**
- Project overview and stats
- Smart AI chat interface  
- Basic DIAS intelligence

### **Phase 3: Design Workspace (43 components)**
- All 4 design stages
- Visual design tools
- AVCA pipeline integration

### **Phase 4: Build Workspace (49 components)**
- All 5 build stages
- Quality gates and testing
- Deployment pipeline

### **Phase 5: Advanced Features (46 components)**
- Advanced analytics
- Team collaboration
- Enterprise features