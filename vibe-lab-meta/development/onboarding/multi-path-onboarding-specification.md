# Multi-Path Onboarding System Specification
## Enhanced Entry Points & Migration Support

## Overview

This specification extends our onboarding system to support multiple entry points while maintaining the core goal: transforming any input (idea, code, or docs) into a professional application blueprint in under 20 minutes.

## Entry Points Architecture

### 1. Universal Entry Controller
```typescript
// lib/avca/pipeline/entry-controller.ts
interface EntryController {
  paths: {
    fresh: FreshStartPath;
    github: GitHubImportPath;
    codebase: CodebaseImportPath;
    documentation: DocumentationImportPath;
  };

  // Unified context regardless of entry point
  context: OnboardingContext & {
    entryType: 'fresh' | 'github' | 'codebase' | 'documentation';
    migrationData?: MigrationData;
    importedDocs?: ImportedDocs;
    analysisResults?: AnalysisResults;
  };
}
```

### 2. AVCA Integration Points
```typescript
// lib/avca/services/migration-analyzer.ts
interface MigrationAnalyzer {
  // Code Analysis
  analyzeRepository: (url: string) => Promise<RepositoryAnalysis>;
  analyzeCodebase: (files: CodebaseFiles) => Promise<CodebaseAnalysis>;
  analyzeDocs: (docs: ImportedDocs) => Promise<DocsAnalysis>;

  // Blueprint Generation
  generateFromAnalysis: (
    analysis: Analysis,
    options: GenerationOptions
  ) => Promise<{
    projectOverview: Document;
    buildSpecs: Document;
    suggestedStructure: ProjectStructure;
  }>;
}
```

### 3. DIAS Enhancement
```typescript
// lib/dias/intelligence/migration-intelligence.ts
interface MigrationIntelligence {
  // Pattern Recognition
  detectFramework: (codebase: Codebase) => Framework;
  inferArchitecture: (codebase: Codebase) => Architecture;
  mapDocumentation: (docs: ImportedDocs) => DocumentMap;

  // Learning & Optimization
  learnFromMigrations: (migration: MigrationData) => void;
  optimizeMigrationPath: (stats: MigrationStats) => void;
  suggestImprovements: (analysis: Analysis) => Suggestions;
}
```

## Implementation Details

### 1. GitHub Import Path
```typescript
interface GitHubImportFlow {
  // Analysis Phase
  analysis: {
    repository: {
      structure: DirectoryTree;
      dependencies: PackageAnalysis;
      components: ComponentMap;
      apis: APIMap;
      tests: TestCoverage;
    };
    
    intelligence: {
      framework: FrameworkDetection;
      patterns: ArchitecturalPatterns;
      quality: CodeQualityMetrics;
      suggestions: ImprovementSuggestions;
    };
  };

  // Document Generation
  documentation: {
    projectOverview: {
      description: string;
      architecture: string;
      features: Feature[];
      techStack: TechStack;
    };
    
    buildSpecs: {
      components: ComponentSpec[];
      apis: APISpec[];
      dataModel: DataModelSpec;
      deployment: DeploymentSpec;
    };
  };

  // Visual Builder Pre-fill
  visualBuilder: {
    pages: PageStructure;
    navigation: NavigationStructure;
    components: ComponentLibrary;
    styling: TailwindConfig;
  };
}
```

### 2. Code Migration Path
```typescript
interface CodeMigrationFlow {
  // Upload Handling
  upload: {
    maxSize: number; // 100MB
    supportedFormats: ['zip', 'tar', 'directory'];
    validation: {
      sizeCheck: () => boolean;
      virusCheck: () => boolean;
      structureCheck: () => boolean;
    };
  };

  // Processing Pipeline
  processing: {
    extraction: () => ExtractedFiles;
    cleanup: () => CleanedFiles;
    analysis: () => CodebaseAnalysis;
    optimization: () => OptimizationSuggestions;
  };

  // Migration Assistant
  assistant: {
    suggestRefactoring: () => RefactoringSuggestions;
    identifyTechnicalDebt: () => TechnicalDebtReport;
    proposeModernization: () => ModernizationPlan;
  };
}
```

### 3. Documentation Import Path
```typescript
interface DocImportFlow {
  // Source Handling
  sources: {
    chatgpt: ChatGPTImporter;
    claude: ClaudeImporter;
    notion: NotionImporter;
    markdown: MarkdownImporter;
    plaintext: PlainTextImporter;
  };

  // Mapping Engine
  mapping: {
    detectFormat: (content: string) => DocumentFormat;
    extractStructure: (content: string) => DocumentStructure;
    mapToSchema: (structure: DocumentStructure) => VibeBlueprintSchema;
  };

  // Validation & Enhancement
  enhancement: {
    validateCompleteness: () => ValidationReport;
    suggestImprovements: () => ImprovementSuggestions;
    fillGaps: () => GapFillingSuggestions;
  };
}
```

## UI Components (Tailwind-Only)

### 1. Entry Selection Screen
```tsx
function EntrySelection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome to Vibe Lab
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fresh Start */}
          <EntryCard
            icon="✨"
            title="Start Fresh"
            description="Build from your idea"
            onClick={() => startFresh()}
          />
          
          {/* GitHub Import */}
          <EntryCard
            icon="🐙"
            title="Import from GitHub"
            description="Analyze existing repository"
            onClick={() => startGitHubImport()}
          />
          
          {/* Code Upload */}
          <EntryCard
            icon="📁"
            title="Upload Code"
            description="Migrate local codebase"
            onClick={() => startCodeUpload()}
          />
          
          {/* Documentation Import */}
          <EntryCard
            icon="📄"
            title="Import Documentation"
            description="From any documentation source"
            onClick={() => startDocImport()}
          />
        </div>
      </div>
    </div>
  );
}
```

### 2. Progress Tracking
```tsx
function MigrationProgress({ 
  stage, 
  progress 
}: MigrationProgressProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {stage.title}
            </h3>
            <p className="text-sm text-gray-500">
              {stage.description}
            </p>
          </div>
          
          <div className="w-64">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Integration Strategy

### 1. Analysis Pipeline
```typescript
interface AnalysisPipeline {
  // Common analysis regardless of source
  analyze: (
    input: GitHubRepo | CodebaseFiles | DocumentationSource
  ) => Promise<Analysis>;

  // Source-specific enhancements
  enhance: (
    analysis: Analysis,
    source: SourceType
  ) => Promise<EnhancedAnalysis>;

  // Blueprint generation
  generateBlueprint: (
    analysis: EnhancedAnalysis
  ) => Promise<VibeBlueprintSchema>;
}
```

### 2. Unified State Management
```typescript
interface OnboardingState {
  // Core state shared across all paths
  core: {
    currentStep: number;
    progress: number;
    blueprint: VibeBlueprintSchema;
  };

  // Path-specific state
  pathState: {
    github?: GitHubImportState;
    codebase?: CodebaseMigrationState;
    docs?: DocumentationImportState;
  };

  // Shared context
  context: {
    projectType: ProjectType;
    complexity: ComplexityScore;
    suggestions: Suggestion[];
  };
}
```

## Success Metrics

### Performance Targets
- GitHub Analysis: < 30 seconds
- Code Upload Processing: < 45 seconds
- Documentation Import: < 15 seconds
- Blueprint Generation: < 60 seconds

### Quality Metrics
- 95% Code Analysis Accuracy
- 90% Documentation Mapping Accuracy
- 85% Suggestion Relevance
- 100% Tailwind Compliance

### User Experience
- Clear Progress Indication
- Intuitive Error Handling
- Smart Defaults
- Interactive Previews

## Next Steps

1. **Technical Implementation**
- Build analysis pipelines
- Create import handlers
- Implement mapping engine
- Set up validation system

2. **UI Development**
- Design entry screens
- Build progress indicators
- Create preview components
- Implement error states

3. **Testing & Validation**
- Unit test analysis
- Integration test pipelines
- User test interactions
- Performance test imports

*This specification extends our onboarding system to handle multiple entry points while maintaining our core principles of speed, quality, and user experience. Each path leads to the same high-quality blueprint output, regardless of the input source.*