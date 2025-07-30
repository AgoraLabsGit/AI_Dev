# Legacy Analysis & Migration Reference - AVCA-DIAS Extension

## Overview
This document defines the brownfield development capabilities for AVCA-DIAS, enabling analysis and modernization of existing software systems. This is a **Version 2.0 capability** to be implemented after the core greenfield system is complete.

## Core Concept
Extend AVCA-DIAS from "greenfield-only" to comprehensive **Software Evolution Platform** using the same 8 atomic unit types as universal classification system for both legacy and modern components.

## Reverse AVCA Pipeline

### R1: Code → Component Analysis
```typescript
interface CodeAnalysisStage {
  input: "Legacy codebase (any language/framework)";
  output: "Component inventory + dependency graph";
  worker: "Static Analysis AI + AST Parser";
  duration: "5-10 minutes per 1000 LOC";
  
  process: {
    parseMultiLanguage: "AST generation for JS/TS/Python/Java/C#";
    detectPatterns: "UI/Logic/Data/Infrastructure pattern recognition";
    mapDependencies: "Import/export relationship mapping";
    assessComplexity: "Cyclomatic complexity + technical debt scoring";
  };
}
```

### R2: Components → Atomic Classification
```typescript
interface AtomicClassificationStage {
  input: "Component inventory with metadata";
  output: "8 atomic unit type mappings";
  worker: "Pattern Recognition AI (Claude Developer)";
  duration: "2-3 minutes";
  
  mappings: {
    'ui-component': {
      legacy: ['jQuery widgets', 'Angular 1.x directives', 'Vanilla DOM'];
      modern: 'React functional component';
      strategy: 'component-wrapper → gradual-replacement';
    };
    'logic-module': {
      legacy: ['Class services', 'Global utilities', 'Mixed concerns'];
      modern: 'Pure functions with dependencies';
      strategy: 'extract-pure → test-wrap → refactor';
    };
    'data-pattern': {
      legacy: ['Raw SQL', 'ORM models', 'Untyped objects'];
      modern: 'Typed schemas with validation';
      strategy: 'schema-inference → type-generation → validation-layer';
    };
    // ... other 5 types with legacy variants
  };
}
```

### R3: Architecture → Blueprint Reconstruction
```typescript
interface BlueprintReconstructionStage {
  input: "Classified components + relationships";
  output: "Inferred blueprints + design decisions";
  worker: "Architecture Analysis AI (Claude Developer)";
  duration: "10-15 minutes";
  
  reconstruction: {
    businessLogic: "Extract domain rules from implementation";
    dataFlow: "Map information flow through system";
    userJourneys: "Reconstruct user interaction patterns";
    integrationPoints: "Identify external system dependencies";
  };
}
```

### R4: Legacy → Modern Migration Plan
```typescript
interface MigrationPlanningStage {
  input: "Current vs target architecture comparison";
  output: "Incremental migration roadmap";
  worker: "DIAS Migration Planner";
  duration: "5 minutes";
  
  planning: {
    riskAssessment: "Identify high-risk migration components";
    dependencyOrdering: "Sequence migrations by dependency graph";
    compatibilityStrategy: "Plan adapter components for gradual transition";
    rollbackPlan: "Define rollback points and procedures";
  };
}
```

## Extended DIAS Modules

### Legacy Analyzer
```typescript
interface LegacyAnalyzer extends DIASModule {
  identifyPatterns(codebase: Codebase): Promise<ArchitecturalPattern[]>;
  extractBusinessLogic(components: Component[]): Promise<BusinessRule[]>;
  mapDataFlow(files: CodeFile[]): Promise<DataFlowDiagram>;
  detectTechnicalDebt(analysis: CodeAnalysis): Promise<DebtReport>;
  
  // Usage example
  analyze: async (codebase: string) => {
    const patterns = await this.identifyPatterns(codebase);
    const business = await this.extractBusinessLogic(patterns.components);
    const debt = await this.detectTechnicalDebt({ patterns, business });
    
    return {
      migrationComplexity: this.calculateComplexity(patterns, debt),
      recommendedApproach: this.suggestApproach(debt, patterns),
      estimatedEffort: this.estimateHours(patterns.length, debt.severity)
    };
  };
}
```

### Migration Intelligence
```typescript
interface MigrationIntelligence extends DIASModule {
  planIncrementalMigration(current: Architecture, target: Architecture): Promise<MigrationPlan>;
  identifyRiskyComponents(components: Component[]): Promise<RiskAssessment[]>;
  suggestMigrationOrder(plan: MigrationPlan): Promise<PrioritizedSteps[]>;
  validateMigrationStep(step: MigrationStep): Promise<ValidationResult>;
  
  // Risk assessment example
  assessRisk: (component: Component) => ({
    complexity: this.calculateComplexity(component),
    dependencies: this.countDependencies(component),
    businessCriticality: this.assessBusinessImpact(component),
    testCoverage: this.measureTestCoverage(component),
    overallRisk: 'low' | 'medium' | 'high' | 'critical'
  });
}
```

### Compatibility Engine
```typescript
interface CompatibilityEngine extends DIASModule {
  analyzeAPICompatibility(old: API, new: API): Promise<CompatibilityReport>;
  generateAdapterComponents(incompatibilities: Incompatibility[]): Promise<AdapterSpec[]>;
  validateBackwardsCompatibility(changes: Change[]): Promise<CompatibilityCheck>;
  
  // Adapter generation example
  generateAdapter: async (legacyAPI: LegacyAPI, modernComponent: AVCAComponent) => ({
    name: `${legacyAPI.name}Adapter`,
    type: 'integration-pattern',
    legacyInterface: legacyAPI,
    modernImplementation: modernComponent,
    transformer: await this.generateTransformer(legacyAPI, modernComponent),
    tests: await this.generateCompatibilityTests(legacyAPI, modernComponent)
  });
}
```

## Code Archaeology System

### Static Analysis Engine
```typescript
class CodeArchaeologist {
  // Multi-language parsing
  async parseMultiLanguage(codebase: string): Promise<AST> {
    const parsers = {
      '.js/.ts': this.parseJavaScript,
      '.py': this.parsePython,
      '.java': this.parseJava,
      '.cs': this.parseCSharp,
      '.php': this.parsePHP
    };
    
    return this.combineASTs(await this.parseByExtension(codebase, parsers));
  }
  
  // Pattern detection
  async detectUIPatterns(ast: AST): Promise<UIPattern[]> {
    return [
      ...await this.detectReactComponents(ast),
      ...await this.detectVueComponents(ast),
      ...await this.detectAngularComponents(ast),
      ...await this.detectVanillaDOMManipulation(ast),
      ...await this.detectjQueryUsage(ast)
    ];
  }
  
  // Business logic extraction
  private async extractBusinessLogic(ast: AST): Promise<BusinessRule[]> {
    // Look for: validation rules, business calculations, decision trees
    const validators = await this.findValidationPatterns(ast);
    const calculations = await this.findBusinessCalculations(ast);
    const workflows = await this.findWorkflowPatterns(ast);
    
    return this.classifyBusinessRules([...validators, ...calculations, ...workflows]);
  }
}
```

### AI-Powered Pattern Recognition
```typescript
class LegacyAnalysisWorker extends AIWorker {
  async analyzeCodeSection(code: string, context: AnalysisContext): Promise<ComponentSpec> {
    const prompt = `
    Analyze this legacy code and classify according to AVCA atomic unit types:
    
    Code:
    \`\`\`${context.language}
    ${code}
    \`\`\`
    
    Context: Framework: ${context.framework}, Domain: ${context.businessDomain}
    
    Identify:
    1. Primary atomic unit type (UI/Logic/Data/Infrastructure/Integration/Workflow/CrossCutting/Capability)
    2. Dependencies and external integrations
    3. Business logic vs technical implementation
    4. Migration complexity: Low (<1 day), Medium (1-3 days), High (>3 days)
    5. Modern AVCA equivalent component specification 
    6. Required adapter components for compatibility
    
    Output ComponentSpec with migration metadata:
    {
      "name": "string",
      "type": "AtomicUnitType", 
      "migrationComplexity": "low|medium|high",
      "dependencies": ["string"],
      "businessLogic": "extracted business rules",
      "modernEquivalent": "ComponentSpec",
      "requiredAdapters": ["AdapterSpec"]
    }
    `;
    
    return this.process(prompt);
  }
}
```

## Migration Workflow System

### Four-Phase Migration Strategy
```typescript
interface MigrationWorkflow {
  // Phase 1: Discovery (1-2 weeks)
  discovery: {
    tasks: [
      'Run code archaeology on entire codebase',
      'Generate component inventory and dependency graph', 
      'Classify all components by atomic unit type',
      'Assess technical debt and migration risks',
      'Create detailed migration roadmap with effort estimates'
    ];
    deliverables: ['Migration roadmap', 'Risk assessment', 'Effort estimates'];
    success: 'Complete understanding of legacy system architecture';
  };
  
  // Phase 2: Foundation (1 week)
  modernFoundation: {
    tasks: [
      'Set up AVCA registry for hybrid components',
      'Create compatibility bridge system',
      'Establish quality gates for migrated components',
      'Set up A/B testing infrastructure',
      'Create rollback procedures'
    ];
    deliverables: ['Hybrid architecture', 'Testing framework', 'Rollback plan'];
    success: 'Legacy and modern systems can coexist safely';
  };
  
  // Phase 3: Incremental Migration (2-8 weeks per component)
  componentMigration: {
    tasks: [
      'Migrate components in dependency order',
      'Generate adapter components for API compatibility',
      'A/B test each migration with real traffic',
      'Monitor performance and error rates',
      'Rollback if quality gates fail'
    ];
    deliverables: ['Modernized components', 'Compatibility adapters', 'Quality reports'];
    success: 'Each component meets AVCA quality standards';
  };
  
  // Phase 4: Legacy Cleanup (1-2 weeks)
  legacyCleanup: {
    tasks: [
      'Remove adapter components once migration complete',
      'Optimize new architecture for performance',
      'Remove legacy code and dependencies',
      'Update documentation and team knowledge',
      'Performance tuning and final validation'
    ];
    deliverables: ['Fully modernized system', 'Performance report', 'Updated docs'];
    success: 'System runs entirely on AVCA-DIAS architecture';
  };
}
```

### Compatibility Bridge System
```typescript
class CompatibilityBridge {
  // Generate adapters for gradual migration
  async generateAdapter(
    legacyInterface: LegacyAPI, 
    modernComponent: AVCAComponent
  ): Promise<AdapterComponent> {
    return {
      name: `${legacyInterface.name}Adapter`,
      type: 'integration-pattern',
      
      // Maintains exact legacy API surface
      legacyInterface: {
        methods: legacyInterface.methods,
        parameters: legacyInterface.parameters,
        returnTypes: legacyInterface.returnTypes,
        sideEffects: legacyInterface.sideEffects
      },
      
      // Delegates to modern AVCA implementation
      modernImplementation: modernComponent,
      
      // Handles data transformation between legacy/modern formats
      transformer: await this.generateTransformer(legacyInterface, modernComponent),
      
      // Comprehensive compatibility testing
      tests: await this.generateCompatibilityTests(legacyInterface, modernComponent),
      
      // Quality gates still apply to adapters
      qualityGates: {
        testCoverage: '>90%', // Higher for adapters due to risk
        performanceImpact: '<5%', // Minimal overhead
        errorRate: '<0.1%' // Very reliable
      }
    };
  }
}
```

## Enhanced Registry for Hybrid Systems

### Migration-Aware Component Registry
```typescript
interface HybridRegistry extends ComponentRegistry {
  // Enhanced metadata for migration tracking
  components: Map<string, HybridComponent>;
  
  // Migration state tracking
  migrationStatus: Map<string, {
    phase: 'discovered' | 'planned' | 'migrating' | 'completed' | 'failed';
    progress: number; // 0-100%
    startDate: Date;
    estimatedCompletion: Date;
    blockers: Issue[];
  }>;
  
  // Legacy component variants
  legacyVariants: Map<string, {
    originalComponent: LegacyComponent;
    modernEquivalent: AVCAComponent;
    adapter: AdapterComponent;
    migrationNotes: string;
  }>;
  
  // API compatibility tracking
  compatibilityMap: Map<string, {
    breaking: BreakingChange[];
    deprecated: DeprecatedFeature[];
    adapters: AdapterComponent[];
    migrationDate: Date;
  }>;
  
  // Enhanced registry methods
  async findMigrationCandidates(criteria: {
    complexity?: 'low' | 'medium' | 'high';
    businessCriticality?: 'low' | 'medium' | 'high' | 'critical';
    dependencies?: number; // max dependency count
    testCoverage?: number; // minimum test coverage
  }): Promise<Component[]>;
  
  async generateMigrationPlan(
    components: Component[],
    constraints: {
      timeframe: number; // weeks
      teamSize: number;
      riskTolerance: 'low' | 'medium' | 'high';
    }
  ): Promise<MigrationPlan>;
  
  async trackMigrationProgress(
    componentId: string, 
    update: MigrationUpdate
  ): Promise<void>;
}

interface HybridComponent extends AVCAComponent {
  // Standard AVCA fields
  name: string;
  type: AtomicUnitType;
  dependencies: string[];
  
  // Migration-specific metadata
  migration?: {
    source: 'legacy-analyzed' | 'greenfield' | 'hybrid';
    legacyEquivalent?: string;
    migrationComplexity: 'low' | 'medium' | 'high';
    businessCriticality: 'low' | 'medium' | 'high' | 'critical';
    migrationDate?: Date;
    rollbackPlan?: string;
  };
}
```

## Archaeological Dashboard UI

### Legacy Analysis Interface
```typescript
interface ArchaeologyDashboard {
  // Visual codebase analysis
  overview: {
    componentDistribution: {
      type: 'PieChart';
      data: 'Component count by atomic unit type';
      insights: 'Which types dominate the legacy system';
    };
    dependencyGraph: {
      type: 'NetworkDiagram';
      data: 'Component relationships and dependencies';
      insights: 'Critical components and circular dependencies';
    };
    technicalDebtHeatmap: {
      type: 'Heatmap';
      data: 'Code quality metrics by file/component';
      insights: 'Highest priority areas for refactoring';
    };
    migrationProgress: {
      type: 'ProgressBar';
      data: 'Components migrated vs remaining';
      insights: 'Overall migration timeline and bottlenecks';
    };
  };
  
  // Migration planning tools
  planning: {
    riskAssessment: {
      type: 'RiskMatrix';
      axes: ['Migration Complexity', 'Business Impact'];
      data: 'All components plotted by risk level';
      actions: 'Click component for detailed migration plan';
    };
    migrationTimeline: {
      type: 'GanttChart';
      data: 'Migration tasks with dependencies and duration';
      features: ['Drag to reschedule', 'Critical path highlighting'];
    };
    resourceRequirements: {
      type: 'ResourcePlanner';
      data: 'Developer hours by skill type and timeline';
      insights: 'Team capacity vs migration requirements';
    };
  };
  
  // Quality comparison (before/after)
  qualityComparison: {
    metrics: {
      type: 'ComparisonChart';
      data: 'Quality scores before and after migration';
      dimensions: ['Test Coverage', 'Performance', 'Security', 'Maintainability'];
    };
    technicalDebt: {
      type: 'DebtChart';
      data: 'Technical debt reduction over migration timeline';
      insights: 'ROI of migration effort';
    };
  };
}
```

## Implementation Architecture

### Service Extensions
```typescript
// Extend existing AVCA services
const extendedServices = {
  // Keep all existing services
  ...existingAVCAServices,
  
  // Add legacy analysis services
  archaeologyService: {
    responsibility: "Legacy codebase analysis and component discovery";
    queue: "archaeology-queue";
    events: ["codebase.analyzed", "components.discovered", "debt.assessed"];
    dependencies: ["static-analysis-tools", "pattern-recognition-ai"];
  };
  
  migrationService: {
    responsibility: "Migration planning and execution coordination";
    queue: "migration-queue"; 
    events: ["migration.planned", "component.migrated", "adapter.generated"];
    dependencies: ["archaeology-service", "compatibility-service"];
  };
  
  compatibilityService: {
    responsibility: "Adapter generation and API compatibility management";
    queue: "compatibility-queue";
    events: ["adapter.created", "compatibility.validated", "migration.safe"];
    dependencies: ["registry-service", "quality-service"];
  };
};
```

### AI Worker Extensions
```typescript
// New AI workers for legacy capabilities
const legacyAIWorkers = {
  archaeologist: {
    model: "claude-3-opus-20240229"; // Needs full context for analysis
    purpose: "Legacy code analysis and pattern recognition";
    contextNeeds: "Full codebase access, business domain knowledge";
    estimatedTokens: "5000-15000 per analysis session";
  };
  
  migrationPlanner: {
    model: "claude-3-sonnet-20240229"; // Good balance for planning
    purpose: "Migration strategy and risk assessment";
    contextNeeds: "Component analysis, dependency graph, business constraints";
    estimatedTokens: "2000-5000 per planning session";
  };
  
  compatibilityAnalyzer: {
    model: "claude-3-sonnet-20240229"; // API analysis focus
    purpose: "API compatibility analysis and adapter generation";
    contextNeeds: "Legacy and modern API specifications";
    estimatedTokens: "1000-3000 per API comparison";
  };
};
```

## Cost Projections

### Legacy Analysis Cost Estimates
```typescript
const legacyAnalysisCosts = {
  // Per 1000 lines of code analysis
  archaeologyAnalysis: {
    staticAnalysis: '$0.10', // Automated parsing
    aiAnalysis: '$2.50', // Pattern recognition + classification  
    reportGeneration: '$0.50', // Summary and recommendations
    total: '$3.10 per 1000 LOC'
  };
  
  // Per component migration
  componentMigration: {
    migrationPlanning: '$1.50', // AI planning + risk assessment
    codeGeneration: '$3.00', // Generate modern equivalent
    adapterGeneration: '$2.00', // Compatibility bridge
    testing: '$1.50', // Comprehensive test generation
    total: '$8.00 per component'
  };
  
  // Typical project estimates
  projectEstimates: {
    small: '10K LOC, 50 components = $31 + $400 = $431',
    medium: '50K LOC, 200 components = $155 + $1600 = $1755', 
    large: '200K LOC, 800 components = $620 + $6400 = $7020'
  };
};
```

## Integration with Core System

### Prerequisites
- ✅ Core AVCA-DIAS system complete (Phases 1-7)
- ✅ Component registry operational
- ✅ Quality gates proven effective
- ✅ AI workers stable and cost-optimized

### Extension Strategy
```typescript
// Phase L1: Archaeological Tools (2 weeks)
const phase1 = {
  deliverables: [
    'Static analysis engine for multi-language parsing',
    'AI-powered pattern recognition system', 
    'Component classification and inventory generation',
    'Technical debt assessment tools'
  ],
  validation: 'Analyze Vibe Lab\'s own 30% existing codebase'
};

// Phase L2: Migration Intelligence (2 weeks)  
const phase2 = {
  deliverables: [
    'Migration planning AI worker',
    'Risk assessment and effort estimation',
    'Dependency ordering and timeline generation',
    'Rollback strategy planning'
  ],
  validation: 'Create migration plan for one Vibe Lab component'
};

// Phase L3: Compatibility System (3 weeks)
const phase3 = {
  deliverables: [
    'API compatibility analysis',
    'Adapter component generation',
    'Hybrid registry with migration tracking',
    'A/B testing infrastructure for gradual migration'
  ],
  validation: 'Migrate one legacy component with zero downtime'
};

// Phase L4: Archaeological Dashboard (2 weeks)
const phase4 = {
  deliverables: [
    'Visual codebase analysis dashboard',
    'Migration planning and tracking interface',
    'Quality comparison and ROI visualization',
    'Team collaboration tools for migration projects'
  ],
  validation: 'Complete migration of sample legacy application'
};
```

## Success Metrics

### System Capabilities
- **Analysis Speed**: <10 minutes per 1000 LOC
- **Classification Accuracy**: >90% correct atomic unit type assignment
- **Migration Planning**: <5 minutes to generate complete migration roadmap
- **Adapter Generation**: <2 minutes per API compatibility bridge
- **Cost Efficiency**: <$10 total cost per migrated component

### Business Value
- **Migration Time**: 50-80% reduction vs manual migration
- **Risk Reduction**: 90% fewer migration-related production issues
- **Quality Improvement**: Migrated components exceed quality gates
- **Knowledge Capture**: Complete documentation of legacy system architecture
- **Team Velocity**: Developers focus on new features, not legacy maintenance

---

*This extension transforms AVCA-DIAS into a comprehensive Software Evolution Platform, enabling organizations to systematically modernize their existing systems while maintaining the same quality standards as greenfield development.*