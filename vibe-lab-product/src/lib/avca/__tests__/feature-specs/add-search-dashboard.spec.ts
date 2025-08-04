/**
 * Minimal Feature Specification: Add Search to Dashboard
 * Phase 0 - Vertical Slice Test
 * 
 * This spec validates the complete AVCA-DIAS pipeline from ideation to production
 * for a simple but realistic feature addition.
 */

import type { FeatureSpecification, ComponentRequirement, QualityGates } from '../avca/types';

export const addSearchToDashboardSpec: FeatureSpecification = {
  id: 'feature-search-dashboard-001',
  title: 'Add Search to Dashboard',
  description: 'Add a search bar component to the main dashboard that allows users to search through projects, tasks, and recent activities',
  
  // User Intent (from chat)
  userIntent: {
    originalMessage: "Add a search bar to the dashboard where users can search for projects and tasks",
    classifiedIntent: 'FEATURE_REQUEST',
    confidence: 0.95,
    entities: [
      { type: 'component', value: 'search bar' },
      { type: 'page', value: 'dashboard' },
      { type: 'functionality', value: 'search projects and tasks' }
    ]
  },

  // Blueprint Requirements (Stage 1 output)
  blueprintRequirements: {
    functionalRequirements: [
      'Search bar visible on dashboard header',
      'Real-time search as user types (debounced)',
      'Search across projects by name and description',
      'Search across tasks by title and status',
      'Display results in dropdown with categories',
      'Keyboard navigation support (arrow keys + enter)',
      'Click result to navigate to item',
      'Show "No results" message when appropriate',
      'Escape key closes results'
    ],
    
    nonFunctionalRequirements: [
      'Search response time < 200ms',
      'Debounce delay of 300ms',
      'Maximum 10 results shown',
      'Accessible with screen readers (ARIA)',
      'Mobile responsive design',
      'Smooth animations'
    ],

    designRequirements: [
      'Consistent with existing UI components',
      'Uses system color palette',
      'Search icon on left of input',
      'Clear/close button on right when text present',
      'Results dropdown with subtle shadow',
      'Category headers in results'
    ]
  },

  // Component Specifications (Stage 4 output)
  componentRequirements: [
    {
      name: 'SearchBar',
      type: 'ui-component',
      atomic: 'UI Components',
      description: 'Main search bar component with dropdown results',
      props: {
        placeholder: 'string',
        onSearch: '(query: string) => void',
        onResultSelect: '(result: SearchResult) => void',
        isLoading: 'boolean'
      },
      dependencies: ['SearchInput', 'SearchResults', 'useSearch']
    },
    {
      name: 'SearchInput', 
      type: 'ui-component',
      atomic: 'UI Components',
      description: 'Input field with search icon and clear button',
      props: {
        value: 'string',
        onChange: '(value: string) => void',
        onClear: '() => void',
        placeholder: 'string'
      },
      dependencies: []
    },
    {
      name: 'SearchResults',
      type: 'ui-component', 
      atomic: 'UI Components',
      description: 'Dropdown results list with categories',
      props: {
        results: 'SearchResult[]',
        isLoading: 'boolean',
        onSelect: '(result: SearchResult) => void'
      },
      dependencies: ['SearchResultItem']
    },
    {
      name: 'useSearch',
      type: 'logic-module',
      atomic: 'Logic Modules',
      description: 'Hook for search functionality with debouncing',
      exports: {
        searchQuery: 'string',
        searchResults: 'SearchResult[]',
        isSearching: 'boolean',
        setSearchQuery: '(query: string) => void'
      },
      dependencies: ['useDebounce', 'searchAPI']
    },
    {
      name: 'SearchResult',
      type: 'data-pattern',
      atomic: 'Data Patterns',
      description: 'Type definition for search results',
      schema: {
        id: 'string',
        type: "'project' | 'task'",
        title: 'string',
        description: 'string?',
        url: 'string',
        icon: 'string?',
        metadata: 'Record<string, any>?'
      },
      dependencies: []
    }
  ],

  // Quality Gates (Stage 6 requirements)
  qualityGates: {
    coverage: {
      unit: 90,
      integration: 80,
      e2e: 70
    },
    performance: {
      responseTime: 200, // ms
      renderTime: 50,    // ms
      bundleSize: 15     // KB
    },
    accessibility: {
      standard: 'WCAG_AA',
      keyboardNav: true,
      screenReader: true
    },
    security: {
      inputSanitization: true,
      xssProtection: true,
      apiValidation: true
    }
  },

  // Test Scenarios
  testScenarios: [
    {
      name: 'Basic search functionality',
      steps: [
        'User clicks on search bar',
        'User types "project alpha"',
        'System shows matching projects',
        'User clicks on result',
        'System navigates to project'
      ]
    },
    {
      name: 'No results handling',
      steps: [
        'User searches for "xyzabc123"',
        'System shows "No results found"',
        'User clears search',
        'Search results disappear'
      ]
    },
    {
      name: 'Keyboard navigation',
      steps: [
        'User focuses search with Tab',
        'User types query',
        'User navigates results with arrows',
        'User selects with Enter',
        'User cancels with Escape'
      ]
    }
  ],

  // Success Metrics
  successMetrics: {
    pipelineExecution: {
      totalTime: 30,        // minutes max
      manualIntervention: 20, // percentage max
      aiTokenCost: 0.50     // USD max
    },
    generatedCode: {
      testCoverage: 90,     // percentage min
      lintErrors: 0,
      typeErrors: 0,
      securityIssues: 0
    },
    userExperience: {
      searchSpeed: 200,     // ms max
      relevance: 90,        // percentage min
      usability: 'intuitive'
    }
  }
};

// Validation function for Phase 0
export function validateFeatureSpec(spec: FeatureSpecification): boolean {
  // Check all required fields
  const hasRequiredFields = !!(
    spec.id &&
    spec.title &&
    spec.userIntent &&
    spec.blueprintRequirements &&
    spec.componentRequirements?.length > 0 &&
    spec.qualityGates &&
    spec.successMetrics
  );

  // Validate component atomic types
  const validAtomicTypes = [
    'UI Components',
    'Logic Modules', 
    'Data Patterns',
    'Infrastructure',
    'Integration Patterns',
    'Workflow Patterns',
    'Cross-Cutting Patterns',
    'Capability Providers'
  ];

  const hasValidComponents = spec.componentRequirements.every((comp: ComponentRequirement) => 
    validAtomicTypes.includes(comp.atomic)
  );

  // Validate quality gates
  const hasValidQualityGates = 
    spec.qualityGates.coverage.unit >= 80 &&
    spec.qualityGates.accessibility.standard === 'WCAG_AA';

  return hasRequiredFields && hasValidComponents && hasValidQualityGates;
} 