# Chat Integration Architecture Reference

## Overview
This document defines how user chat messages are processed, classified, and routed to appropriate AVCA and DIAS systems, creating an intelligent conversational interface for Vibe Lab.

## Core Components

### 1. Chat Processor
```typescript
interface ChatProcessor {
  // Main entry point for all chat messages
  processMessage(message: UserMessage): Promise<ProcessedIntent>;
  
  // Intent classification
  classifyIntent(message: string): Promise<Intent>;
  
  // Context enhancement
  enhanceWithContext(message: string, context: ProjectContext): EnhancedMessage;
  
  // Response generation
  generateResponse(intent: ProcessedIntent): Promise<ChatResponse>;
}
```

### 2. Intent Classification

```typescript
enum IntentType {
  // AVCA Pipeline Triggers
  BLUEPRINT_CREATION = 'blueprint.create',
  COMPONENT_REQUEST = 'component.request',
  STYLE_CHANGE = 'style.change',
  
  // DIAS Module Triggers
  FEATURE_REQUEST = 'feature.add',
  ERROR_REPORT = 'error.report',
  DESIGN_CHANGE = 'design.modify',
  QUESTION = 'context.query',
  
  // Code Auditing
  CODE_REVIEW = 'code.review',
  DEBUG_HELP = 'debug.assist',
  OPTIMIZATION = 'optimize.request',
  
  // Project Management
  STATUS_CHECK = 'status.query',
  ROADMAP_UPDATE = 'roadmap.modify',
  TASK_MANAGEMENT = 'task.update',
  
  // Open-Ended Conversations
  GENERAL_QUESTION = 'general.question',
  CLARIFICATION_REQUEST = 'clarify.request',
  SUGGESTION_REQUEST = 'suggest.request',
  FEEDBACK = 'feedback.provide',
  
  // Preference Management
  PREFERENCE_UPDATE = 'preference.update',
  COMMUNICATION_STYLE = 'preference.style',
  TECHNICAL_CHOICE = 'preference.technical',
  
  // Meta Conversations
  CAPABILITIES_QUERY = 'meta.capabilities',
  HELP_REQUEST = 'meta.help',
  UNRELATED_QUERY = 'meta.unrelated'
}

interface Intent {
  type: IntentType;
  confidence: number;
  entities: Entity[];
  context: IntentContext;
}
```

### 3. Chat Mapper

```typescript
class ChatMapper {
  // Maps user messages to system actions
  async mapToSystems(message: UserMessage): Promise<SystemMapping> {
    const analysis = await this.analyzeMessage(message);
    
    return {
      // AVCA Pipeline triggers
      pipeline: this.extractPipelineTriggers(analysis),
      
      // DIAS events to emit
      diasEvents: this.extractDIASEvents(analysis),
      
      // Components needed
      components: this.extractComponentNeeds(analysis),
      
      // Context updates
      context: this.extractContextUpdates(analysis),
      
      // Priority level
      priority: this.determinePriority(analysis)
    };
  }
}

interface SystemMapping {
  pipeline: PipelineTrigger | null;
  diasEvents: DIASEvent[];
  components: ComponentRequest[];
  context: ContextUpdate;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
```

## Intent to System Mapping

### AVCA Pipeline Triggers

```typescript
const pipelineTriggers = {
  // Stage 1: Ideation → Blueprints
  "create a new [type] app": {
    stage: 'ideation',
    action: 'start',
    params: { projectType: '[type]' }
  },
  
  // Stage 2: Blueprints → Styling
  "let's design the UI": {
    stage: 'styling',
    action: 'configure',
    params: { needsTheme: true }
  },
  
  // Component Generation
  "generate the components": {
    stage: 'generation',
    action: 'execute',
    params: { source: 'approved_specs' }
  }
};
```

### DIAS Event Mappings

```typescript
const diasEventMappings = {
  // Feature Integration
  "add [feature] to [page]": {
    module: 'featureIntegrator',
    event: 'feature.requested',
    params: { feature: '[feature]', target: '[page]' }
  },
  
  // Error Intelligence
  "[component] is broken": {
    module: 'errorIntelligence',
    event: 'error.reported',
    params: { component: '[component]', severity: 'high' }
  },
  
  // Context Queries
  "what have we built so far": {
    module: 'contextKeeper',
    event: 'context.query',
    params: { scope: 'project.summary' }
  }
};
```

## Code Auditor Module

### Real-Time Development Assistance

```typescript
interface CodeAuditor extends DIASModule {
  // Proactive analysis
  analyzeAsYouType(code: string, context: CodeContext): {
    suggestions: Suggestion[];
    warnings: Warning[];
    optimizations: Optimization[];
  };
  
  // Pattern detection
  detectPatterns(code: string): {
    antiPatterns: AntiPattern[];
    bestPractices: BestPractice[];
    securityIssues: SecurityIssue[];
  };
  
  // Troubleshooting
  diagnoseIssue(error: Error, context: ErrorContext): {
    rootCause: string;
    suggestedFix: CodeFix;
    preventionStrategy: Prevention;
  };
  
  // Learning from resolutions
  recordResolution(issue: Issue, fix: AppliedFix): void;
}
```

### Integration with Development Tools

```typescript
class DevelopmentMonitor {
  sources = {
    // Terminal integration
    terminal: new TerminalWatcher(),
    
    // Browser console
    browser: new BrowserConsoleWatcher(),
    
    // Cursor problems panel
    problems: new ProblemsWatcher(),
    
    // Build output
    build: new BuildWatcher()
  };
  
  async monitor(): Promise<void> {
    // Aggregate all error sources
    const errors = await this.aggregateErrors();
    
    // Send to Code Auditor
    const diagnosis = await codeAuditor.diagnoseIssue(errors);
    
    // Suggest fixes in chat
    await chat.suggest(diagnosis.suggestedFix);
  }
}
```

## Design DIAS System

### Design-Specific Intelligence

```typescript
interface DesignDIAS {
  // Style Coordinator
  styleCoordinator: {
    enforceConsistency(designs: PageDesign[]): StyleReport;
    suggestTheme(brand: BrandInfo): ThemeConfig;
    validateAccessibility(design: Design): A11yReport;
  };
  
  // Component Predictor
  componentPredictor: {
    analyzeDesign(page: PageDesign): RequiredComponents[];
    matchToRegistry(need: ComponentNeed): RegistryComponent[];
    suggestAlternatives(unavailable: Component): Alternative[];
  };
  
  // Design Optimizer
  optimizer: {
    improvePerformance(design: Design): OptimizedDesign;
    enhanceResponsiveness(desktop: Design): ResponsiveDesign;
    reducecomplexity(complex: Design): SimplifiedDesign;
  };
}
```

## Context Management

### Context Keeper Integration

```typescript
interface ChatContext {
  // Current state
  currentProject: Project;
  activePipeline: PipelineStage | null;
  recentDecisions: Decision[];
  openIssues: Issue[];
  
  // History
  chatHistory: ChatMessage[];
  completedTasks: Task[];
  appliedChanges: Change[];
  
  // Preferences
  userPreferences: Preferences;
  teamPatterns: Pattern[];
}

class ContextEnhancedChat {
  async processWithContext(message: string): Promise<Response> {
    // Load full context
    const context = await contextKeeper.load(projectId);
    
    // Enhance message understanding
    const enhanced = context.enhance(message);
    
    // Process with full awareness
    const result = await processor.process(enhanced);
    
    // Update context
    await contextKeeper.update({
      message,
      result,
      timestamp: new Date()
    });
    
    return result;
  }
}
```

## Memory & Preference System

### User Preference Management

```typescript
interface MemorySystem {
  // User preferences (persists across projects)
  userPreferences: {
    communicationStyle: 'concise' | 'detailed' | 'balanced';
    responseFormat: 'technical' | 'simple' | 'educational';
    codeStyle: CodeStylePreferences;
    favoriteTools: string[];
  };
  
  // Project decisions (project-specific)
  projectDecisions: {
    techStack: TechStackChoices;
    designSystem: DesignSystemChoice;
    architecturePatterns: Pattern[];
    apiPreferences: APIStyle;
  };
  
  // Conversation memory (session + persistent)
  conversationMemory: {
    recentTopics: Topic[];
    clarifiedTerms: Map<string, string>;
    userCorrections: Correction[];
    contextualKnowledge: Knowledge[];
  };
}

class PreferenceManager {
  async updatePreference(intent: PreferenceIntent): Promise<void> {
    switch (intent.category) {
      case 'communication_style':
        // "Please be more concise"
        await this.updateUserPref('communicationStyle', 'concise');
        break;
        
      case 'technical_choice':
        // "I want to use Supabase for auth"
        await this.updateProjectDecision('auth', {
          provider: 'supabase',
          reason: intent.reason,
          timestamp: new Date()
        });
        break;
        
      case 'code_style':
        // "Always use function components"
        await this.updateCodeStyle({
          componentStyle: 'functional',
          mandatory: true
        });
        break;
    }
  }
}
```

### Handling Open-Ended Queries

```typescript
class OpenEndedHandler {
  async process(message: string, intent: Intent): Promise<Response> {
    switch (intent.type) {
      case 'GENERAL_QUESTION':
        // "What is the capital of Kenya?"
        return this.handleGeneralKnowledge(message);
        
      case 'CLARIFICATION_REQUEST':
        // "What do you mean by atomic units?"
        return this.provideClarification(intent.entities);
        
      case 'SUGGESTION_REQUEST':
        // "What would you recommend for state management?"
        return this.generateSuggestion(intent.context);
        
      case 'PREFERENCE_UPDATE':
        // "Be more concise" / "Use Supabase"
        await this.updatePreferences(intent);
        return this.confirmPreferenceUpdate(intent);
        
      case 'UNRELATED_QUERY':
        // Handle gracefully but guide back
        return this.handleUnrelated(message);
    }
  }
  
  private async handleGeneralKnowledge(query: string): Promise<Response> {
    // Answer briefly, then redirect to project
    const answer = await this.getGeneralAnswer(query);
    return {
      answer,
      redirect: "Now, back to your project - would you like to continue with the dashboard design?"
    };
  }
}
```

### Memory Integration with DIAS

```typescript
interface MemoryDIASIntegration {
  // Sync preferences to all modules
  syncPreferences(): {
    featureIntegrator: { defaultPatterns: Pattern[] };
    codeAuditor: { styleRules: StyleRule[] };
    contextKeeper: { userContext: UserContext };
  };
  
  // Learn from interactions
  learnFromDecision(decision: Decision): void;
  learnFromCorrection(correction: Correction): void;
  learnFromFeedback(feedback: Feedback): void;
  
  // Apply memory to responses
  enhanceResponse(base: Response): EnhancedResponse;
}
```

### Persistent Storage Schema

```sql
-- User preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  communication_style VARCHAR(20),
  response_format VARCHAR(20),
  code_style JSONB,
  favorite_tools TEXT[],
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project decisions table  
CREATE TABLE project_decisions (
  project_id UUID,
  decision_type VARCHAR(50),
  decision_value JSONB,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, decision_type)
);

-- Conversation memory table
CREATE TABLE conversation_memory (
  id UUID PRIMARY KEY,
  user_id UUID,
  project_id UUID,
  memory_type VARCHAR(50),
  content JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Example Memory Flows

```typescript
// Example 1: Style Preference
// User: "Please be more concise in your responses"
{
  intent: 'PREFERENCE_UPDATE',
  action: async () => {
    await memory.updateUserPreference('communicationStyle', 'concise');
    await dias.syncAllModules({ communicationStyle: 'concise' });
    return "I'll keep my responses brief and to the point.";
  }
}

// Example 2: Technical Decision
// User: "Let's use Supabase for authentication"
{
  intent: 'TECHNICAL_CHOICE',
  action: async () => {
    await memory.updateProjectDecision('auth', {
      provider: 'supabase',
      integrations: ['@supabase/auth-helpers-nextjs']
    });
    await avca.updateCapabilityProvider('auth', 'supabase');
    return "Supabase authentication configured. I'll use it for all auth components.";
  }
}

// Example 3: General Knowledge
// User: "What is the capital of Kenya?"
{
  intent: 'UNRELATED_QUERY',
  action: async () => {
    const answer = "Nairobi is the capital of Kenya.";
    const redirect = "Would you like to continue working on your project?";
    return `${answer}\n\n${redirect}`;
  }
}
```

### Example 1: Feature Request
```typescript
// User: "Add a search bar to the dashboard"
{
  intent: {
    type: 'FEATURE_REQUEST',
    confidence: 0.95,
    entities: [
      { type: 'component', value: 'search bar' },
      { type: 'page', value: 'dashboard' }
    ]
  },
  
  mapping: {
    pipeline: null, // Not starting new pipeline
    diasEvents: [
      'feature.integration.requested',
      'component.discovery.needed'
    ],
    components: ['SearchBar', 'SearchInput', 'SearchResults'],
    context: { 
      targetPage: 'dashboard',
      featureType: 'search',
      complexity: 'medium'
    }
  },
  
  actions: [
    'Update dashboard design',
    'Generate SearchBar component',
    'Update component dependencies',
    'Regenerate dashboard with search'
  ]
}
```

### Example 2: Error Report
```typescript
// User: "The payment form crashes when submitting"
{
  intent: {
    type: 'ERROR_REPORT',
    confidence: 0.98,
    entities: [
      { type: 'component', value: 'payment form' },
      { type: 'action', value: 'submitting' },
      { type: 'error', value: 'crashes' }
    ]
  },
  
  mapping: {
    pipeline: null,
    diasEvents: [
      'error.reported',
      'code.audit.requested',
      'fix.priority.high'
    ],
    components: ['PaymentForm', 'PaymentSubmitHandler'],
    context: {
      severity: 'critical',
      userImpact: 'high',
      needsImmediate: true
    }
  },
  
  codeAuditor: {
    analyze: ['PaymentForm.tsx', 'api/payments.ts'],
    checkFor: ['null checks', 'error handling', 'validation'],
    suggestFixes: true
  }
}
```

### Example 3: Design Change
```typescript
// User: "Make the dashboard more modern and minimalist"
{
  intent: {
    type: 'DESIGN_CHANGE',
    confidence: 0.87,
    entities: [
      { type: 'page', value: 'dashboard' },
      { type: 'style', value: 'modern minimalist' }
    ]
  },
  
  mapping: {
    pipeline: 'styling', // May need style regeneration
    diasEvents: [
      'design.style.change',
      'theme.update.requested'
    ],
    components: [], // All dashboard components affected
    context: {
      scope: 'page-wide',
      styleDirection: 'modern minimalist'
    }
  },
  
  designDIAS: {
    styleCoordinator: {
      generateTheme: 'modern-minimal',
      updateComponents: 'all-dashboard',
      validateConsistency: true
    }
  }
}
```

## Integration Hooks

### React Hook Integration
```typescript
// hooks/useIntelligentChat.ts
export function useIntelligentChat() {
  const { pipeline } = useAVCA();
  const { modules } = useDIAS();
  const { context } = useProjectContext();
  
  const processMessage = useCallback(async (message: string) => {
    // Process through intelligent system
    const result = await chatProcessor.processMessage({
      message,
      context,
      pipeline: pipeline.currentStage,
      activeModules: modules.active
    });
    
    // Execute mapped actions
    await executeSystemActions(result.mapping);
    
    // Return contextualized response
    return result.response;
  }, [context, pipeline, modules]);
  
  return { processMessage };
}
```

### API Endpoints
```typescript
// Chat Processing API
POST /api/chat/process
{
  message: string;
  projectId: string;
  context?: ChatContext;
}

// Intent Analysis API
POST /api/chat/analyze
{
  message: string;
}

// Code Audit API
POST /api/chat/audit
{
  code: string;
  file: string;
  error?: Error;
}
```

## Performance Optimization

### Message Processing Pipeline
```typescript
class OptimizedChatProcessor {
  private intentCache = new LRUCache<string, Intent>(1000);
  private responseCache = new TTLCache<string, Response>(100);
  
  async process(message: string): Promise<Response> {
    // Check caches
    const cached = this.checkCaches(message);
    if (cached) return cached;
    
    // Parallel processing
    const [intent, context, suggestions] = await Promise.all([
      this.classifyIntent(message),
      this.loadContext(),
      this.generateSuggestions(message)
    ]);
    
    // Process with all data
    const response = await this.generateResponse({
      message,
      intent,
      context,
      suggestions
    });
    
    // Cache results
    this.cacheResults(message, intent, response);
    
    return response;
  }
}
```

## Error Handling

```typescript
class ChatErrorHandler {
  async handle(error: ChatError): Promise<ErrorResponse> {
    // Classify error type
    const errorType = this.classifyError(error);
    
    switch (errorType) {
      case 'intent_unclear':
        return this.requestClarification(error);
        
      case 'system_unavailable':
        return this.provideAlternative(error);
        
      case 'permission_denied':
        return this.explainLimitation(error);
        
      default:
        return this.gracefulFallback(error);
    }
  }
}
```

## Performance & Cost Optimization

### Performance Impact Analysis
```typescript
// Latency breakdown
const performanceMetrics = {
  baseline: {
    simpleChat: 1000-2000,  // ms
  },
  enhanced: {
    intentClassification: 100-200,   // Lightweight model
    systemMapping: 50,               // Local processing
    contextLoading: 100,             // Cached/DB query
    aiResponse: 1000-2000,           // Main work
    systemActions: 100-500,          // Async, non-blocking
    total: 1350-2850                 // Only 35% increase
  }
};

// Optimization strategies
class PerformantChatProcessor {
  private intentCache = new LRUCache(10000);
  private responseCache = new TTLCache(1000);
  
  async process(message: string) {
    // Parallel processing
    const [intent, context] = await Promise.all([
      this.classifyIntent(message),
      this.loadContext()
    ]);
    
    // Non-blocking system updates
    setImmediate(() => {
      this.updateDIASModules(mapping);
      this.logAnalytics(mapping);
    });
  }
}
```

### Cost Reduction Analysis
```typescript
const costComparison = {
  traditional: {
    clarificationMessages: 3-5,      // $0.03-0.05
    totalMessages: 15-20,           // $0.15-0.20
    corrections: 2-3,               // $0.10-0.15
    totalPerFeature: '$0.28-0.40'
  },
  
  intelligent: {
    clarificationMessages: 0-1,      // $0.00-0.01
    totalMessages: 5-8,             // $0.05-0.08
    corrections: 0-1,               // $0.00-0.05
    intentAnalysis: 1,              // $0.001
    totalPerFeature: '$0.05-0.14',
    savings: '60-80%'
  }
};

// Cost optimization strategies
interface CostControl {
  useSmallModels: 'claude-instant' | 'gpt-3.5-turbo';
  cacheAggressively: true;
  batchRequests: true;
  limitTokens: { intent: 100, response: 2000 };
}
```