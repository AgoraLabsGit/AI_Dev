// Mock data layer for navigation components - enables independent UI development

import { Project, AgentStatus, RepositoryFile, ComponentMetadata } from '../../components/navigation/types';

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    name: 'E-commerce Dashboard',
    status: 'active',
    lastAccessed: '2025-01-27T10:30:00Z',
    progress: 78,
    componentCount: 34,
    githubRepo: 'user/ecommerce-dashboard',
    stage0Complete: true
  },
  {
    id: 'proj_002', 
    name: 'Legacy PHP Migration',
    status: 'migrating',
    lastAccessed: '2025-01-26T15:45:00Z',
    progress: 23,
    componentCount: 12,
    githubRepo: 'user/legacy-php-app',
    stage0Complete: false
  },
  {
    id: 'proj_003',
    name: 'SaaS Analytics Platform',
    status: 'active',
    lastAccessed: '2025-01-25T09:15:00Z',
    progress: 92,
    componentCount: 67,
    githubRepo: 'user/saas-analytics',
    stage0Complete: true
  },
  {
    id: 'proj_004',
    name: 'Mobile App Backend',
    status: 'archived',
    lastAccessed: '2025-01-20T14:22:00Z',
    progress: 100,
    componentCount: 28,
    githubRepo: 'user/mobile-backend',
    stage0Complete: true
  }
];

// Mock Agent Status
export const mockAgentStatus: AgentStatus[] = [
  {
    id: 'developer',
    name: 'Claude Developer',
    status: 'active',
    currentTask: 'Analyzing component dependencies',
    lastActivity: '30 seconds ago',
    confidence: 0.94
  },
  {
    id: 'auditor',
    name: 'Claude Auditor',
    status: 'idle',
    currentTask: 'Ready for code review',
    lastActivity: '2 minutes ago',
    confidence: 0.87
  }
];

// Mock Repository Structure
export const mockRepositoryStructure: RepositoryFile[] = [
  {
    path: 'src',
    type: 'directory',
    children: [
      {
        path: 'src/components',
        type: 'directory',
        children: [
          {
            path: 'src/components/ui',
            type: 'directory',
            children: [
              { 
                path: 'src/components/ui/Button.tsx', 
                type: 'file', 
                size: 2456, 
                language: 'typescript',
                lastModified: '2025-01-27T08:15:00Z'
              },
              { 
                path: 'src/components/ui/Card.tsx', 
                type: 'file', 
                size: 1834, 
                language: 'typescript',
                lastModified: '2025-01-26T16:30:00Z'
              },
              { 
                path: 'src/components/ui/Modal.tsx', 
                type: 'file', 
                size: 3721, 
                language: 'typescript',
                lastModified: '2025-01-27T10:45:00Z'
              },
              { 
                path: 'src/components/ui/Input.tsx', 
                type: 'file', 
                size: 2189, 
                language: 'typescript',
                lastModified: '2025-01-25T14:20:00Z'
              }
            ]
          },
          {
            path: 'src/components/navigation',
            type: 'directory',
            children: [
              { 
                path: 'src/components/navigation/MainSidebar.tsx', 
                type: 'file', 
                size: 5432, 
                language: 'typescript',
                lastModified: '2025-01-27T11:00:00Z'
              },
              { 
                path: 'src/components/navigation/MenuSwitcher.tsx', 
                type: 'file', 
                size: 2156, 
                language: 'typescript',
                lastModified: '2025-01-27T10:30:00Z'
              },
              { 
                path: 'src/components/navigation/CodeDirectory.tsx', 
                type: 'file', 
                size: 4321, 
                language: 'typescript',
                lastModified: '2025-01-27T09:45:00Z'
              }
            ]
          },
          {
            path: 'src/components/stage0',
            type: 'directory',
            children: [
              { 
                path: 'src/components/stage0/GitHubConnector.tsx', 
                type: 'file', 
                size: 6789, 
                language: 'typescript',
                lastModified: '2025-01-27T11:15:00Z'
              },
              { 
                path: 'src/components/stage0/RepositoryAnalyzer.tsx', 
                type: 'file', 
                size: 4567, 
                language: 'typescript',
                lastModified: '2025-01-26T17:00:00Z'
              }
            ]
          }
        ]
      },
      {
        path: 'src/pages',
        type: 'directory',
        children: [
          { 
            path: 'src/pages/dashboard.tsx', 
            type: 'file', 
            size: 4567, 
            language: 'typescript',
            lastModified: '2025-01-27T09:30:00Z'
          },
          { 
            path: 'src/pages/design.tsx', 
            type: 'file', 
            size: 3892, 
            language: 'typescript',
            lastModified: '2025-01-26T13:45:00Z'
          },
          { 
            path: 'src/pages/build.tsx', 
            type: 'file', 
            size: 5234, 
            language: 'typescript',
            lastModified: '2025-01-27T08:50:00Z'
          }
        ]
      },
      {
        path: 'src/lib',
        type: 'directory',
        children: [
          { 
            path: 'src/lib/utils.ts', 
            type: 'file', 
            size: 1234, 
            language: 'typescript',
            lastModified: '2025-01-25T12:00:00Z'
          },
          { 
            path: 'src/lib/api.ts', 
            type: 'file', 
            size: 3456, 
            language: 'typescript',
            lastModified: '2025-01-26T14:30:00Z'
          }
        ]
      }
    ]
  },
  {
    path: 'generated',
    type: 'directory',
    children: [
      {
        path: 'generated/components',
        type: 'directory',
        children: [
          { 
            path: 'generated/components/HeaderComponent.tsx', 
            type: 'file', 
            size: 2134, 
            language: 'typescript',
            lastModified: '2025-01-27T07:20:00Z'
          },
          { 
            path: 'generated/components/FooterComponent.tsx', 
            type: 'file', 
            size: 1567, 
            language: 'typescript',
            lastModified: '2025-01-27T07:25:00Z'
          },
          { 
            path: 'generated/components/NavigationComponent.tsx', 
            type: 'file', 
            size: 3456, 
            language: 'typescript',
            lastModified: '2025-01-27T08:00:00Z'
          }
        ]
      }
    ]
  },
  {
    path: 'registry',
    type: 'directory',
    children: [
      { 
        path: 'registry/components.json', 
        type: 'file', 
        size: 8765, 
        language: 'json',
        lastModified: '2025-01-27T10:00:00Z'
      },
      { 
        path: 'registry/patterns.json', 
        type: 'file', 
        size: 4321, 
        language: 'json',
        lastModified: '2025-01-26T16:45:00Z'
      },
      { 
        path: 'registry/dependencies.json', 
        type: 'file', 
        size: 2890, 
        language: 'json',
        lastModified: '2025-01-27T09:15:00Z'
      }
    ]
  },
  {
    path: 'blueprints',
    type: 'directory',
    children: [
      { 
        path: 'blueprints/project-requirements.md', 
        type: 'file', 
        size: 5678, 
        language: 'markdown',
        lastModified: '2025-01-26T11:30:00Z'
      },
      { 
        path: 'blueprints/technical-specs.md', 
        type: 'file', 
        size: 3456, 
        language: 'markdown',
        lastModified: '2025-01-26T12:15:00Z'
      },
      { 
        path: 'blueprints/ui-wireframes.md', 
        type: 'file', 
        size: 4567, 
        language: 'markdown',
        lastModified: '2025-01-27T09:00:00Z'
      }
    ]
  },
  {
    path: 'assets',
    type: 'directory',
    children: [
      { 
        path: 'assets/logo.svg', 
        type: 'file', 
        size: 1234, 
        language: 'svg',
        lastModified: '2025-01-20T10:00:00Z'
      },
      { 
        path: 'assets/styles.css', 
        type: 'file', 
        size: 2345, 
        language: 'css',
        lastModified: '2025-01-27T08:30:00Z'
      },
      { 
        path: 'assets/fonts.css', 
        type: 'file', 
        size: 1567, 
        language: 'css',
        lastModified: '2025-01-25T15:00:00Z'
      }
    ]
  }
];

// Mock 224-Component Registry
export const mock224ComponentRegistry: ComponentMetadata[] = [
  // Navigation Components (15)
  { id: 'nav-001', name: 'MainSidebar', type: 'navigation', category: 'core', complexity: 'complex', dependencies: ['MenuSwitcher'], usageCount: 1, lastUpdated: '2025-01-27T11:00:00Z' },
  { id: 'nav-002', name: 'MenuSwitcher', type: 'navigation', category: 'core', complexity: 'moderate', dependencies: [], usageCount: 1, lastUpdated: '2025-01-27T10:30:00Z' },
  { id: 'nav-003', name: 'CodeDirectory', type: 'navigation', category: 'core', complexity: 'complex', dependencies: ['SearchInput'], usageCount: 1, lastUpdated: '2025-01-27T09:45:00Z' },
  { id: 'nav-004', name: 'HorizontalNav', type: 'navigation', category: 'core', complexity: 'moderate', dependencies: [], usageCount: 3, lastUpdated: '2025-01-27T11:15:00Z' },
  { id: 'nav-005', name: 'BreadcrumbNav', type: 'navigation', category: 'shared', complexity: 'simple', dependencies: [], usageCount: 12, lastUpdated: '2025-01-26T14:20:00Z' },
  
  // UI Components (32)
  { id: 'ui-001', name: 'Button', type: 'ui', category: 'core', complexity: 'simple', dependencies: [], usageCount: 45, lastUpdated: '2025-01-27T08:15:00Z' },
  { id: 'ui-002', name: 'Card', type: 'ui', category: 'core', complexity: 'simple', dependencies: [], usageCount: 23, lastUpdated: '2025-01-26T16:30:00Z' },
  { id: 'ui-003', name: 'Modal', type: 'ui', category: 'shared', complexity: 'moderate', dependencies: ['Button'], usageCount: 8, lastUpdated: '2025-01-27T10:45:00Z' },
  { id: 'ui-004', name: 'Input', type: 'ui', category: 'core', complexity: 'simple', dependencies: [], usageCount: 34, lastUpdated: '2025-01-25T14:20:00Z' },
  { id: 'ui-005', name: 'SearchInput', type: 'ui', category: 'shared', complexity: 'moderate', dependencies: ['Input'], usageCount: 12, lastUpdated: '2025-01-27T09:30:00Z' },
  
  // Stage 0 Components (15)
  { id: 'stage0-001', name: 'GitHubConnector', type: 'integration', category: 'stage0', complexity: 'complex', dependencies: ['Button', 'SearchInput'], usageCount: 1, lastUpdated: '2025-01-27T11:15:00Z' },
  { id: 'stage0-002', name: 'RepositoryAnalyzer', type: 'integration', category: 'stage0', complexity: 'complex', dependencies: ['Card'], usageCount: 1, lastUpdated: '2025-01-26T17:00:00Z' },
  { id: 'stage0-003', name: 'MigrationPlanner', type: 'integration', category: 'stage0', complexity: 'complex', dependencies: ['Modal', 'Button'], usageCount: 1, lastUpdated: '2025-01-26T15:30:00Z' },
  
  // Dashboard Components (31)
  { id: 'dash-001', name: 'MetricsCard', type: 'dashboard', category: 'feature', complexity: 'moderate', dependencies: ['Card'], usageCount: 6, lastUpdated: '2025-01-27T09:30:00Z' },
  { id: 'dash-002', name: 'ProgressChart', type: 'dashboard', category: 'feature', complexity: 'complex', dependencies: [], usageCount: 4, lastUpdated: '2025-01-26T13:45:00Z' },
  { id: 'dash-003', name: 'ActivityFeed', type: 'dashboard', category: 'feature', complexity: 'moderate', dependencies: ['Card'], usageCount: 2, lastUpdated: '2025-01-27T08:50:00Z' },
  
  // Design Components (48)
  { id: 'design-001', name: 'BlueprintEditor', type: 'design', category: 'feature', complexity: 'complex', dependencies: ['Input', 'Button'], usageCount: 1, lastUpdated: '2025-01-26T11:30:00Z' },
  { id: 'design-002', name: 'ThemeCustomizer', type: 'design', category: 'feature', complexity: 'complex', dependencies: ['Card', 'Input'], usageCount: 1, lastUpdated: '2025-01-26T12:15:00Z' },
  { id: 'design-003', name: 'LayoutBuilder', type: 'design', category: 'feature', complexity: 'complex', dependencies: ['Modal'], usageCount: 1, lastUpdated: '2025-01-27T09:00:00Z' },
  
  // Build Components (54)
  { id: 'build-001', name: 'CodeGenerator', type: 'build', category: 'feature', complexity: 'complex', dependencies: [], usageCount: 1, lastUpdated: '2025-01-27T07:00:00Z' },
  { id: 'build-002', name: 'QualityGate', type: 'build', category: 'feature', complexity: 'moderate', dependencies: ['Card'], usageCount: 3, lastUpdated: '2025-01-26T18:00:00Z' },
  { id: 'build-003', name: 'PreviewPanel', type: 'build', category: 'feature', complexity: 'complex', dependencies: ['Modal'], usageCount: 1, lastUpdated: '2025-01-27T08:00:00Z' },
  
  // AI Chat Components (30)
  { id: 'chat-001', name: 'ChatInterface', type: 'ai', category: 'core', complexity: 'complex', dependencies: ['Input', 'Button'], usageCount: 2, lastUpdated: '2025-01-27T10:00:00Z' },
  { id: 'chat-002', name: 'MessageBubble', type: 'ai', category: 'shared', complexity: 'simple', dependencies: [], usageCount: 15, lastUpdated: '2025-01-27T09:15:00Z' },
  { id: 'chat-003', name: 'CostMonitor', type: 'ai', category: 'feature', complexity: 'moderate', dependencies: ['Card'], usageCount: 1, lastUpdated: '2025-01-26T16:45:00Z' }
];

// Mock Global Statistics
export const mockGlobalStats = {
  totalProjects: mockProjects.length,
  activeProjects: mockProjects.filter(p => p.status === 'active').length,
  totalComponents: mock224ComponentRegistry.length,
  monthlyTokenUsage: 45800,
  monthlyCost: 23.45,
  teamMembers: 3,
  overallQuality: 94.2,
  avgProjectProgress: Math.round(mockProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / mockProjects.length)
};

// Mock Stage 0 Analysis Results
export const mockStage0Analysis = {
  repositoryHealth: {
    score: 85,
    factors: {
      codeQuality: 88,
      documentation: 72,
      testCoverage: 91,
      dependencies: 83,
      security: 79
    }
  },
  migrationComplexity: 'moderate',
  estimatedDuration: '6-8 weeks',
  technicalDebt: {
    total: 23,
    critical: 2,
    high: 7,
    medium: 14
  },
  componentOpportunities: [
    { type: 'Header Component', confidence: 0.94, impact: 'high' },
    { type: 'Navigation Menu', confidence: 0.89, impact: 'high' },
    { type: 'Data Table', confidence: 0.87, impact: 'medium' },
    { type: 'Form Components', confidence: 0.92, impact: 'high' }
  ],
  recommendations: [
    'Modernize authentication system',
    'Extract reusable UI components',
    'Implement TypeScript gradually',
    'Add comprehensive testing',
    'Update dependency versions'
  ]
};

// Mock AI Chat Messages
export const mockChatMessages = [
  {
    id: '1',
    role: 'user',
    content: 'Help me understand the navigation structure for the new 224-component system',
    timestamp: '2025-01-27T10:30:00Z'
  },
  {
    id: '2',
    role: 'developer', 
    content: 'I\'ll help you understand the enhanced navigation system. The new structure includes:\n\n1. **Stage 0 Import** - Repository analysis and migration planning\n2. **Main Navigation** - Context-aware sidebar with menu switching\n3. **224-Component Registry** - Comprehensive component library\n4. **Smart AI Chat** - Cost-optimized dual-AI system\n\nWould you like me to explain any specific aspect in detail?',
    timestamp: '2025-01-27T10:30:30Z',
    tokenUsage: 145,
    cost: 0.021
  },
  {
    id: '3',
    role: 'user',
    content: 'Show me how Stage 0 Import works',
    timestamp: '2025-01-27T10:31:00Z'
  },
  {
    id: '4',
    role: 'developer',
    content: 'Stage 0 Import is our GitHub repository analysis system:\n\n**Process:**\n1. Connect GitHub account via OAuth\n2. Select repository for analysis\n3. Scan codebase for structure, dependencies, patterns\n4. Generate migration roadmap with timeline\n5. Identify component extraction opportunities\n\n**Benefits:**\n- Reduces migration risk by 70%\n- Provides accurate effort estimation\n- Identifies reusable components\n- Creates technical debt assessment\n\nWould you like to see the analysis results for your repository?',
    timestamp: '2025-01-27T10:31:25Z',
    tokenUsage: 178,
    cost: 0.026
  }
];

// Export all mocks
export const navigationMocks = {
  projects: mockProjects,
  agentStatus: mockAgentStatus,
  repositoryStructure: mockRepositoryStructure,
  componentRegistry: mock224ComponentRegistry,
  globalStats: mockGlobalStats,
  stage0Analysis: mockStage0Analysis,
  chatMessages: mockChatMessages
};