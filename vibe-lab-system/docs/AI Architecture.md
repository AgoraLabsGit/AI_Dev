# AI Architecture Reference - Vibe Lab

## Overview
This document defines the AI architecture for Vibe Lab, including model selection, role definitions, context management, and integration strategies for optimal performance and cost efficiency.

## Core AI Stack

### Recommended Architecture (Claude-Only)

```typescript
const vibeLabAIStack = {
  // 3 Essential Roles
  developer: {
    model: "claude-3-opus-20240229",
    purpose: "Primary development, AVCA pipeline, DIAS features",
    contextAccess: "full",
    monthlyVolume: "~800K tokens/day"
  },
  
  auditor: {
    model: "claude-3-opus-20240229",
    purpose: "Code review, quality assurance, security",
    contextAccess: "isolated",  // Fresh perspective critical
    monthlyVolume: "~150K tokens/day"
  },
  
  router: {
    model: "claude-3-haiku-20240307",  // 50x cheaper
    purpose: "Intent classification, request routing",
    contextAccess: "minimal",
    monthlyVolume: "~50K tokens/day"
  }
}
```

### Why Claude-Only?

```typescript
const decisionMatrix = {
  benefits: {
    consistency: "Single AI behavior model",
    simplicity: "One API, one integration",
    quality: "Claude excels at code tasks",
    cost: "Simpler = fewer engineering hours",
    maintenance: "Single point of updates"
  },
  
  tradeoffs: {
    contextWindow: "200K vs Gemini's 2M",  // Rarely need >200K
    speed: "~20% slower than Gemini",       // Acceptable
    multimodal: "No image processing"       // Not needed
  },
  
  verdict: "95% of benefits with 50% less complexity"
}
```

## Base API Settings

### Developer AI Settings

```typescript
const developerSettings = {
  // Model selection
  model: "claude-3-opus-20240229",
  
  // Generation parameters
  max_tokens: 4096,                      // Long code generation
  temperature: 0.2,                      // Low - consistent code
  top_p: 0.9,                           // Slightly focused
  top_k: 0,                             // Not used in Claude
  
  // Stop sequences
  stop_sequences: ["```\n\n", "Human:", "Assistant:"],
  
  // System prompt
  system: `You are the Vibe Lab Developer AI responsible for:
    - Following AVCA component standards strictly
    - Generating TypeScript + React + Tailwind CSS code
    - Writing comprehensive tests with >80% coverage
    - Implementing DIAS intelligence features
    - Making architectural decisions aligned with project blueprints
    - Creating clean, maintainable, production-ready code
    - Including proper error handling and accessibility
    
    Output format: Clean code with minimal explanation unless asked.`,
  
  // API configuration
  apiVersion: "2023-06-01",
  betaHeaders: ["messages-2023-12-15"],
  timeout: 30000,                        // 30 second timeout
  retries: 3
};
```

### Auditor AI Settings

```typescript
const auditorSettings = {
  // Model selection
  model: "claude-3-opus-20240229",
  
  // Generation parameters
  max_tokens: 2048,                      // Focused reviews
  temperature: 0.1,                      // Very low - consistent analysis
  top_p: 0.95,                          // Standard focus
  top_k: 0,                             // Not used in Claude
  
  // Stop sequences
  stop_sequences: ["```\n\n", "Human:", "Assistant:"],
  
  // System prompt
  system: `You are the Vibe Lab Auditor AI providing independent code review:
    - Review code with fresh perspective (no implementation context)
    - Check against AVCA quality gates (80% coverage, security, performance)
    - Identify bugs, vulnerabilities, and improvement opportunities
    - Verify TypeScript types and error handling
    - Ensure accessibility compliance (WCAG AA)
    - Check for performance issues and optimization opportunities
    
    Provide structured feedback:
    - Overall Score: X/10
    - Security: X/10
    - Performance: X/10
    - Maintainability: X/10
    - Issues Found: [list]
    - Recommendations: [list]`,
  
  // API configuration
  apiVersion: "2023-06-01",
  betaHeaders: ["messages-2023-12-15"],
  timeout: 20000,                        // 20 second timeout
  retries: 2
};
```

### Router AI Settings

```typescript
const routerSettings = {
  // Model selection - Cost optimized
  model: "claude-3-haiku-20240307",       // 50x cheaper than Opus
  
  // Generation parameters
  max_tokens: 150,                        // Just for classification
  temperature: 0,                         // Completely deterministic
  top_p: 1.0,                            // No sampling
  top_k: 0,                              // Not used in Claude
  
  // Stop sequences
  stop_sequences: ["\n\n", "}"],
  
  // System prompt
  system: `Classify the user's message into EXACTLY ONE of these intents:
    ${Object.values(IntentType).join(', ')}
    
    Respond with ONLY valid JSON in this format:
    {
      "intent": "intent_type",
      "confidence": 0.95,
      "entities": [
        {"type": "component", "value": "SearchBar"},
        {"type": "action", "value": "add"}
      ],
      "priority": "medium"
    }
    
    No explanation. No markdown. Just JSON.`,
  
  // API configuration
  apiVersion: "2023-06-01",
  betaHeaders: ["messages-2023-12-15"],
  timeout: 5000,                          // 5 second timeout
  retries: 1                              // Fast fail for routing
};
```

### Environment Configuration

```bash
# .env.local
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
ANTHROPIC_API_VERSION=2023-06-01
ANTHROPIC_BETA=messages-2023-12-15

# Model Selection
DEVELOPER_MODEL=claude-3-opus-20240229
AUDITOR_MODEL=claude-3-opus-20240229
ROUTER_MODEL=claude-3-haiku-20240307

# Performance Settings
AI_TIMEOUT_MS=30000
AI_MAX_RETRIES=3
AI_RETRY_DELAY_MS=1000
AI_CACHE_TTL_SECONDS=3600

# Token Limits
DEVELOPER_MAX_TOKENS=4096
AUDITOR_MAX_TOKENS=2048
ROUTER_MAX_TOKENS=150

# Temperature Settings
DEVELOPER_TEMPERATURE=0.2
AUDITOR_TEMPERATURE=0.1
ROUTER_TEMPERATURE=0
```

### Dynamic Settings Adjustment

```typescript
class DynamicSettingsManager {
  // Adjust based on task type
  adjustForTask(baseSettings: AISettings, task: TaskType): AISettings {
    const adjusted = { ...baseSettings };
    
    switch(task) {
      case 'bug_fix':
        adjusted.temperature = 0.1;  // More deterministic
        adjusted.max_tokens = 2048;  // Focused changes
        break;
        
      case 'creative_ui':
        adjusted.temperature = 0.4;  // More creative
        adjusted.top_p = 0.85;      // More variety
        break;
        
      case 'refactoring':
        adjusted.temperature = 0.15; // Consistent style
        adjusted.max_tokens = 8192;  // Large changes
        break;
    }
    
    return adjusted;
  }
  
  // Adjust based on user preferences
  adjustForUser(baseSettings: AISettings, prefs: UserPreferences): AISettings {
    const adjusted = { ...baseSettings };
    
    if (prefs.communicationStyle === 'concise') {
      adjusted.max_tokens = Math.min(adjusted.max_tokens * 0.6, 1000);
      adjusted.system += '\nBe concise. No explanations unless asked.';
    }
    
    if (prefs.codeStyle === 'verbose') {
      adjusted.system += '\nInclude detailed comments explaining logic.';
    }
    
    if (prefs.framework === 'vue') {
      adjusted.system = adjusted.system.replace('React', 'Vue 3');
    }
    
    return adjusted;
  }
}
```

### Rate Limiting & Quotas

```typescript
interface RateLimits {
  developer: {
    requestsPerMinute: 10,
    tokensPerMinute: 40000,
    concurrentRequests: 3
  },
  
  auditor: {
    requestsPerMinute: 20,
    tokensPerMinute: 40000,
    concurrentRequests: 5
  },
  
  router: {
    requestsPerMinute: 100,      // Higher for cheap model
    tokensPerMinute: 15000,
    concurrentRequests: 10
  }
}
```

## AI Role Definitions

### 1. Developer AI

```typescript
interface DeveloperAI {
  model: "claude-3-opus-20240229";
  
  responsibilities: [
    "Blueprint analysis and interpretation",
    "Component generation (all 8 atomic types)",
    "AVCA pipeline execution",
    "DIAS feature integration",
    "Design and styling decisions",
    "Technical architecture choices"
  ];
  
  settings: {
    temperature: 0.2,      // Consistent code
    max_tokens: 4096,      // Long generations
    top_p: 0.9,
    system: `You are the Vibe Lab Developer AI responsible for:
    - Following AVCA component standards
    - Generating TypeScript + React + Tailwind code
    - Implementing DIAS intelligence features
    - Making architectural decisions
    - Creating comprehensive tests`
  };
  
  contextAccess: {
    blueprints: true,
    projectHistory: true,
    codebase: true,
    userPreferences: true,
    componentRegistry: true
  };
}
```

### 2. Auditor AI

```typescript
interface AuditorAI {
  model: "claude-3-opus-20240229";
  
  responsibilities: [
    "Independent code review",
    "Security vulnerability detection",
    "Performance analysis",
    "Architecture compliance",
    "Quality gate enforcement"
  ];
  
  settings: {
    temperature: 0.1,      // Deterministic analysis
    max_tokens: 2048,      // Focused reviews
    top_p: 0.95,
    system: `You are the Vibe Lab Auditor AI providing:
    - Independent code review (no implementation context)
    - Security analysis against OWASP standards
    - Performance optimization suggestions
    - AVCA compliance verification
    - Quality scores and recommendations`
  };
  
  contextAccess: {
    blueprints: false,     // No implementation details
    projectHistory: false, // Fresh perspective
    codebase: false,       // Only sees generated code
    requirements: true,    // What to validate against
    standards: true        // Quality criteria
  };
}
```

### 3. Router AI

```typescript
interface RouterAI {
  model: "claude-3-haiku-20240307";  // Cost optimized
  
  responsibilities: [
    "Intent classification",
    "Request routing to AVCA/DIAS",
    "Preference detection",
    "Priority assessment"
  ];
  
  settings: {
    temperature: 0,        // Deterministic routing
    max_tokens: 150,       // Just classification
    top_p: 1.0,
    system: `Classify user input into one of these intents:
    ${Object.values(IntentType).join(', ')}
    
    Output format: { intent: string, confidence: number, entities: [] }`
  };
  
  contextAccess: {
    currentMessage: true,
    intentHistory: true,   // Recent classifications
    projectState: false,   // Not needed
    codebase: false        // Not needed
  };
}
```

## Context Management Strategy

### Context Isolation Architecture

```typescript
class AIContextManager {
  // Complete isolation between roles
  prepareContext(role: AIRole, request: Request): Context {
    switch(role) {
      case 'developer':
        return this.prepareDeveloperContext(request);
      
      case 'auditor':
        return this.prepareAuditorContext(request);
      
      case 'router':
        return this.prepareRouterContext(request);
    }
  }
  
  private prepareDeveloperContext(request: Request): DeveloperContext {
    return {
      // Full project awareness
      blueprints: this.loadBlueprints(request.projectId),
      currentCode: this.loadCodebase(request.projectId),
      projectHistory: this.loadHistory(request.projectId),
      userPreferences: this.loadPreferences(request.userId),
      componentRegistry: this.loadRegistry(),
      recentDecisions: this.loadDecisions(request.projectId),
      
      // AVCA/DIAS specific
      pipelineStage: this.getCurrentStage(request.projectId),
      diasModules: this.getActiveModules(request.projectId)
    };
  }
  
  private prepareAuditorContext(request: Request): AuditorContext {
    return {
      // Only what's needed for review
      codeToReview: request.generatedCode,
      requirements: this.extractRequirements(request.blueprint),
      qualityStandards: this.loadQualityGates(),
      securityPolicies: this.loadSecurityRules(),
      
      // No implementation details
      projectHistory: null,
      developerContext: null,
      previousCode: null
    };
  }
  
  private prepareRouterContext(request: Request): RouterContext {
    return {
      // Minimal for classification
      message: request.message,
      recentIntents: this.getRecentIntents(request.sessionId),
      availableIntents: Object.values(IntentType)
    };
  }
}
```

### Context Window Management

```typescript
interface ContextWindowStrategy {
  // Claude's 200K token window allocation
  developer: {
    maxTokens: 180000,  // 90% of window
    allocation: {
      systemPrompt: 1000,
      blueprints: 20000,
      currentCode: 50000,
      history: 20000,
      conversation: 89000
    }
  },
  
  auditor: {
    maxTokens: 100000,  // 50% of window
    allocation: {
      systemPrompt: 1000,
      codeToReview: 50000,
      requirements: 10000,
      standards: 5000,
      analysis: 34000
    }
  },
  
  router: {
    maxTokens: 5000,    // 2.5% of window
    allocation: {
      systemPrompt: 500,
      message: 1000,
      intents: 500,
      response: 3000
    }
  }
}
```

### Stage-Based Model Selection (Phase 0 Learning)

```typescript
interface EnhancedAIStack {
  // Existing role-based selection
  developer: {
    model: "claude-3-opus-20240229", // Default for complex tasks
    stageOverrides: {
      // Cost-optimized model selection per pipeline stage
      [PipelineStage.CODE_GENERATION]: "claude-3-sonnet-20240229",  // -80% cost, maintains quality
      [PipelineStage.PAGE_DESIGNS]: "claude-3-sonnet-20240229",     // -80% cost
      [PipelineStage.IDEATION]: "claude-3-sonnet-20240229",         // -80% cost
      [PipelineStage.REGISTRY]: "claude-3-haiku-20240307",          // -95% cost
      [PipelineStage.ASSEMBLY]: "claude-3-haiku-20240307",          // -95% cost
      // Keep Opus for quality-critical stages
      [PipelineStage.VERIFICATION]: "claude-3-opus-20240229"        // Quality critical
    },
    costOptimization: {
      projectedSavings: "83% cost reduction",
      targetCost: "$0.48 per pipeline run",
      validatedInPhase0: true,
      confidenceLevel: "High - based on actual token usage"
    }
  },
  
  auditor: {
    model: "claude-3-opus-20240229", // Keep Opus for independent review
    purpose: "Quality assurance requires highest capability"
  },
  
  router: {
    model: "claude-3-haiku-20240307", // Already optimized
    purpose: "Intent classification"
  }
}
```

### Cost Optimization Implementation

```typescript
class OptimizedAIClient {
  selectModel(role: AIRole, stage?: PipelineStage, complexity?: TaskComplexity): string {
    if (role === 'auditor' || role === 'router') {
      return this.roleBasedSelection[role].model;
    }
    
    // Developer role: stage-based selection
    if (stage && this.stageOverrides[stage]) {
      return this.stageOverrides[stage];
    }
    
    // Fallback to complexity-based selection
    return complexity === 'simple' ? 'claude-3-haiku-20240307' :
           complexity === 'medium' ? 'claude-3-sonnet-20240229' :
           'claude-3-opus-20240229';
  }
}
```

## Cost Optimization Strategies

### Token Usage Optimization

```typescript
class TokenOptimizer {
  // Compress context intelligently
  optimizeContext(context: Context, role: AIRole): OptimizedContext {
    switch(role) {
      case 'developer':
        return {
          ...context,
          currentCode: this.extractRelevantCode(context.currentCode),
          history: this.summarizeHistory(context.history)
        };
      
      case 'auditor':
        return {
          ...context,
          codeToReview: this.focusOnChanges(context.codeToReview)
        };
      
      case 'router':
        return context; // Already minimal
    }
  }
  
  // Cache strategies
  cacheStrategy = {
    router: {
      ttl: 3600,        // 1 hour
      hitRate: "~80%"   // Most intents repeat
    },
    developer: {
      ttl: 300,         // 5 minutes
      hitRate: "~30%"   // Some component patterns repeat
    },
    auditor: {
      ttl: 0,           // No caching - fresh review needed
      hitRate: "0%"
    }
  };
}
```

### Cost Projections

```typescript
const monthlyProjections = {
  // Assume 100 active users, 50 requests/day each
  usage: {
    developer: 800000 * 30,   // 24M tokens/month
    auditor: 150000 * 30,     // 4.5M tokens/month
    router: 50000 * 30        // 1.5M tokens/month
  },
  
  costs: {
    developer: 24 * (15 + 75),     // $2,160/month
    auditor: 4.5 * (15 + 75),      // $405/month
    router: 1.5 * (0.25 + 1.25),   // $2.25/month
    total: "$2,567.25/month"
  },
  
  perUser: "$25.67/user/month"
}
```

## Integration Architecture

### API Client Design

```typescript
class VibeLab AIClient {
  private clients = {
    developer: new ClaudeClient({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-opus-20240229",
      defaultSettings: developerSettings
    }),
    
    auditor: new ClaudeClient({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-opus-20240229",
      defaultSettings: auditorSettings
    }),
    
    router: new ClaudeClient({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-haiku-20240307",
      defaultSettings: routerSettings
    })
  };
  
  async process(request: AIRequest): Promise<AIResponse> {
    // Select appropriate AI
    const client = this.clients[request.role];
    
    // Prepare isolated context
    const context = this.contextManager.prepare(request.role, request);
    
    // Optimize tokens
    const optimized = this.tokenOptimizer.optimize(context, request.role);
    
    // Make request with retry logic
    return this.withRetry(() => 
      client.complete({
        ...request,
        context: optimized
      })
    );
  }
}
```

### AVCA Integration Points

```typescript
interface AVCAIntegration {
  // Pipeline stages use Developer AI
  pipeline: {
    ideation: 'developer',
    blueprints: 'developer',
    styling: 'developer',
    components: 'developer',
    generation: 'developer',
    verification: 'auditor',  // Switch to auditor
    registry: 'system',       // No AI needed
    assembly: 'developer'
  },
  
  // Component generation flow
  componentFlow: async (spec: ComponentSpec) => {
    // Developer generates
    const code = await ai.developer.generate(spec);
    
    // Auditor reviews
    const review = await ai.auditor.review(code);
    
    // Developer fixes if needed
    if (review.requiresChanges) {
      const fixed = await ai.developer.fix(code, review.feedback);
      return fixed;
    }
    
    return code;
  }
}
```

### DIAS Integration Points

```typescript
interface DIASIntegration {
  // All DIAS modules use Developer AI
  modules: {
    featureIntegrator: 'developer',
    systemSync: 'developer',
    contextKeeper: 'developer',
    predictor: 'developer',
    learner: 'system',        // ML model, not LLM
    qualityMonitor: 'auditor', // For objectivity
    errorAnalyzer: 'developer'
  },
  
  // Chat flow
  chatFlow: async (message: string) => {
    // Router classifies
    const intent = await ai.router.classify(message);
    
    // Developer handles request
    const response = await ai.developer.process(intent);
    
    // Return to user
    return response;
  }
}
```

## Error Handling & Fallbacks

```typescript
class AIErrorHandler {
  async handle(error: AIError, request: AIRequest): Promise<AIResponse> {
    // Retry with exponential backoff
    if (error.type === 'RATE_LIMIT') {
      return this.retryWithBackoff(request);
    }
    
    // Fall back to cached response
    if (error.type === 'TIMEOUT') {
      return this.getCachedSimilar(request);
    }
    
    // Degrade gracefully
    if (error.type === 'MODEL_ERROR') {
      return this.degradeGracefully(request);
    }
    
    // Human escalation
    return this.escalateToHuman(request);
  }
  
  private degradeGracefully(request: AIRequest): AIResponse {
    // Use simpler model or return partial result
    if (request.role === 'developer') {
      // Try with Sonnet instead of Opus
      return this.retryWithModel(request, 'claude-3-sonnet');
    }
    
    if (request.role === 'auditor') {
      // Return basic checks only
      return this.basicQualityChecks(request);
    }
  }
}
```

## Performance Monitoring

```typescript
interface AIMetrics {
  // Track per role
  latency: {
    developer: { p50: 2000, p95: 5000, p99: 8000 }, // ms
    auditor: { p50: 1500, p95: 3000, p99: 5000 },
    router: { p50: 200, p95: 400, p99: 600 }
  },
  
  // Token usage
  usage: {
    developer: { avg: 3000, max: 8000 },
    auditor: { avg: 2000, max: 4000 },
    router: { avg: 100, max: 150 }
  },
  
  // Success rates
  success: {
    developer: 0.98,  // 98% successful generations
    auditor: 0.99,    // 99% complete reviews
    router: 0.999     // 99.9% correct routing
  }
}
```

## Best Practices

### 1. Context Isolation
- **Always** keep Auditor context separate from Developer
- Never share implementation details with Auditor
- Router should be stateless where possible

### 2. Token Optimization
- Summarize history before including in context
- Extract only relevant code sections
- Use caching aggressively for Router

### 3. Error Handling
- Implement retry logic with backoff
- Have fallback models ready
- Monitor for degradation

### 4. Cost Management
- Use Haiku for all classification tasks
- Cache Router responses aggressively
- Monitor token usage per user

### 5. Quality Assurance
- Never skip Auditor review for production code
- Maintain strict context isolation
- Track quality metrics over time

## Migration Path

### From Current System
```typescript
const migrationSteps = {
  week1: "Implement Router AI for chat classification",
  week2: "Separate Developer and Auditor contexts",
  week3: "Remove Gemini dependencies",
  week4: "Optimize token usage and caching",
  week5: "Full production rollout"
}
```

This architecture provides optimal balance of quality, cost, and complexity for Vibe Lab's needs.