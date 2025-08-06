# Implementation Execution Plan - WHO/WHAT/WHERE Separation

**Document Type**: Detailed Technical Implementation Plan  
**Status**: Action Plan  
**Created**: 2025-01-05  
**Purpose**: Step-by-step technical implementation guide for achieving clean WHO/WHAT/WHERE separation and fixing critical system disconnections

---

## Overview

This plan implements the WHO/WHAT/WHERE separation by **connecting existing systems** rather than rebuilding. The foundation is already excellent - we need targeted integration work to unlock the sophisticated capabilities already built.

**Core Strategy**: Incremental connection of disconnected systems with validation at each step.

---

## Phase 1: Critical Fixes (1-2 weeks)

### **Task 1.1: Connect Knowledge Storage to APIs**
**Priority**: 🚨 CRITICAL - Fix fundamental knowledge persistence failure

#### **Problem Statement**
The onboarding API generates rich project data but never saves it to the comprehensive Zustand store, causing complete knowledge loss between sessions.

#### **Current State**
```typescript
// /app/api/onboarding/chat/route.ts (Lines 198-199)
if (sanitizedHistory.length >= 3 && extractedInfo.projectType) {
  projectOverview = generateProjectOverview(extractedInfo, projectName, sanitizedHistory);
  buildSpecifications = generateBuildSpecifications(extractedInfo, projectOverview);
  // ❌ RETURNED but never saved to persistent store!
}
```

#### **Target State**
```typescript
// Enhanced API with Zustand store integration
const store = useOnboardingStore.getState();

if (sanitizedHistory.length >= 3 && extractedInfo.projectType) {
  const projectOverview = generateProjectOverview(extractedInfo, projectName, sanitizedHistory);
  const buildSpecifications = generateBuildSpecifications(extractedInfo, projectOverview);
  
  // ✅ SAVE to persistent store
  store.updateProjectOverview(projectOverview);
  store.updateBuildSpecs(buildSpecifications);
  store.saveProgress();
}
```

#### **Implementation Steps**

**Step 1.1.1: Add Zustand Store Integration to Onboarding API**
```typescript
// File: /app/api/onboarding/chat/route.ts
// Add imports
import { useOnboardingStore } from '@/lib/stores/onboarding-store';

// Add store integration function
function persistKnowledgeToStore(
  extractedInfo: any, 
  projectOverview: any, 
  buildSpecifications: any,
  sessionId: string
) {
  const store = useOnboardingStore.getState();
  
  // Initialize session if needed
  if (!store.sessionId) {
    store.initializeSession();
  }
  
  // Update project data
  if (projectOverview) {
    store.updateProjectOverview(projectOverview);
  }
  
  if (buildSpecifications) {
    store.updateBuildSpecs(buildSpecifications);
  }
  
  // Update extracted info context
  if (extractedInfo) {
    // Map extractedInfo to store structure
    const mappedInfo = mapExtractedInfoToStore(extractedInfo);
    store.updateProjectOverview(mappedInfo);
  }
  
  // Save progress
  store.saveProgress();
  
  return store;
}
```

**Step 1.1.2: Create Knowledge Accumulation System**
```typescript
// File: /lib/knowledge/accumulator.ts (NEW)
export class KnowledgeAccumulator {
  static accumulateFromConversation(
    message: string,
    conversationHistory: any[],
    currentKnowledge: any
  ): any {
    const newInfo = extractBasicInfo(message);
    
    // Merge with existing knowledge, not replace
    return {
      ...currentKnowledge,
      ...newInfo,
      // Handle arrays by merging, not replacing
      mentionedFeatures: [
        ...(currentKnowledge.mentionedFeatures || []),
        ...(newInfo.mentionedFeatures || [])
      ].filter((item, index, arr) => arr.indexOf(item) === index)
    };
  }
}
```

**Step 1.1.3: Update All Onboarding Endpoints**
- `/app/api/onboarding/chat-basic/route.ts`
- `/app/api/onboarding/chat-staged/route.ts` 
- `/app/api/onboarding/chat-simple/route.ts`

Apply same pattern to all endpoints for consistency.

**Step 1.1.4: Add Knowledge Retrieval to Frontend**
```typescript
// File: /app/onboarding/page.tsx
// Connect to persistent store instead of local state
const {
  projectOverview,
  buildSpecs,
  sessionId,
  conversationHistory // Add to store
} = useOnboardingStore();
```

**Validation Criteria**:
- ✅ All onboarding API calls persist to Zustand store
- ✅ Knowledge accumulates across conversations
- ✅ Frontend retrieves data from persistent store
- ✅ Session data survives browser refresh

---

### **Task 1.2: Create Unified Intelligence Router**
**Priority**: 🔥 HIGH - Enable intelligent AI system coordination

#### **Problem Statement**
AVCA, DIAS, and SuperClaude systems operate independently with no unified entry point or intelligent routing.

#### **Target Architecture**
```
User Request → Unified Intelligence Router → Best Available AI System → Response
```

#### **Implementation Steps**

**Step 1.2.1: Create Unified Intelligence Router**
```typescript
// File: /lib/intelligence/router/unified-intelligence-router.ts (NEW)
import { AIClientService } from '@/lib/avca/services/ai-client';
import { EventHandlingSystem } from '@/lib/dias/events/event-handlers';
import { PersonaMapper } from '@/lib/integration/persona-mapper';
import { ServiceManager } from '@/lib/core/service-manager';

export interface IntelligenceRequest {
  message: string;
  context: RequestContext;
  intent?: UserIntent;
  preferredSystem?: 'avca' | 'dias' | 'superclaude';
}

export interface RequestContext {
  stage: string;
  projectData: any;
  conversationHistory: any[];
  pageContext: string;
}

export interface IntelligenceResponse {
  content: string;
  confidence: number;
  systemUsed: 'avca' | 'dias' | 'superclaude';
  metadata: any;
  suggestedNextActions?: string[];
}

export class UnifiedIntelligenceRouter {
  private serviceManager: ServiceManager;
  private intentClassifier: IntentClassifier;
  
  constructor(serviceManager: ServiceManager) {
    this.serviceManager = serviceManager;
    this.intentClassifier = new IntentClassifier();
  }
  
  async process(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    // 1. Classify intent if not provided
    const intent = request.intent || await this.classifyIntent(request);
    
    // 2. Route to appropriate system
    const selectedSystem = this.selectSystem(intent, request.context);
    
    // 3. Process through selected system
    const response = await this.processWithSystem(selectedSystem, request, intent);
    
    // 4. Post-process and return
    return this.enhanceResponse(response, selectedSystem, intent);
  }
  
  private selectSystem(intent: UserIntent, context: RequestContext): 'avca' | 'dias' | 'superclaude' {
    // Simple routing logic - can be enhanced
    if (context.stage === 'planning' || intent.category === 'architecture') {
      return 'dias'; // DIAS for orchestration and planning
    }
    
    if (intent.category === 'code_generation' || context.stage === 'implementation') {
      return 'avca'; // AVCA for code generation
    }
    
    // Default to AVCA with SuperClaude persona
    return 'avca';
  }
  
  private async processWithSystem(
    system: 'avca' | 'dias' | 'superclaude',
    request: IntelligenceRequest,
    intent: UserIntent
  ): Promise<any> {
    switch (system) {
      case 'avca':
        return this.processWithAVCA(request, intent);
      case 'dias':
        return this.processWithDIAS(request, intent);
      case 'superclaude':
        return this.processWithSuperClaude(request, intent);
    }
  }
  
  private async processWithAVCA(request: IntelligenceRequest, intent: UserIntent): Promise<any> {
    const avcaClient = this.serviceManager.getService<AIClientService>('avca-client');
    
    // Apply SuperClaude persona if appropriate
    const persona = PersonaMapper.getPersonaForIntent(intent);
    
    return avcaClient.process({
      role: intent.aiRole || 'ANALYZER',
      prompt: this.buildPrompt(request, intent, persona),
      context: JSON.stringify(request.context),
      entryPath: this.determineEntryPath(request.context),
      temperature: 0.7,
      maxTokens: 200
    });
  }
}
```

**Step 1.2.2: Create Intent Classification System**
```typescript
// File: /lib/intelligence/intent/intent-classifier.ts (NEW)
export interface UserIntent {
  category: 'planning' | 'implementation' | 'modification' | 'question' | 'clarification';
  confidence: number;
  aiRole: 'DEVELOPER' | 'ANALYZER' | 'AUDITOR' | 'ROUTER';
  complexity: 'simple' | 'moderate' | 'complex';
  domains: string[];
}

export class IntentClassifier {
  async classifyIntent(request: IntelligenceRequest): Promise<UserIntent> {
    const message = request.message.toLowerCase();
    
    // Simple pattern-based classification (can be enhanced with ML)
    if (this.isPlanningIntent(message)) {
      return {
        category: 'planning',
        confidence: 0.8,
        aiRole: 'ANALYZER',
        complexity: 'moderate',
        domains: ['architecture', 'planning']
      };
    }
    
    if (this.isImplementationIntent(message)) {
      return {
        category: 'implementation',
        confidence: 0.9,
        aiRole: 'DEVELOPER',
        complexity: 'simple',
        domains: ['coding', 'generation']
      };
    }
    
    // Default classification
    return {
      category: 'question',
      confidence: 0.6,
      aiRole: 'ANALYZER',
      complexity: 'simple',
      domains: ['general']
    };
  }
  
  private isPlanningIntent(message: string): boolean {
    const planningKeywords = ['plan', 'architecture', 'design', 'structure', 'organize'];
    return planningKeywords.some(keyword => message.includes(keyword));
  }
  
  private isImplementationIntent(message: string): boolean {
    const implementationKeywords = ['create', 'build', 'implement', 'generate', 'code'];
    return implementationKeywords.some(keyword => message.includes(keyword));
  }
}
```

**Step 1.2.3: Update APIs to Use Unified Router**
```typescript
// File: /app/api/onboarding/chat/route.ts
// Replace direct AVCA/DIAS calls with unified router

import { UnifiedIntelligenceRouter } from '@/lib/intelligence/router/unified-intelligence-router';

// Initialize router with service manager
const serviceManager = new ServiceManager(eventBus);
const intelligenceRouter = new UnifiedIntelligenceRouter(serviceManager);

// Replace AI processing
const aiResponse = await intelligenceRouter.process({
  message,
  context: {
    stage: conversationStage,
    projectData: extractedInfo,
    conversationHistory: sanitizedHistory,
    pageContext: 'onboarding'
  }
});
```

**Validation Criteria**:
- ✅ Single entry point for all AI interactions
- ✅ Intelligent routing based on intent classification
- ✅ All AI systems accessible through unified interface
- ✅ Intent classification >70% accuracy

---

### **Task 1.3: Enable ServiceManager Orchestration**
**Priority**: 🔥 HIGH - Eliminate per-request service initialization

#### **Problem Statement**
APIs initialize AVCA/DIAS services per request instead of using the sophisticated ServiceManager orchestration system.

#### **Implementation Steps**

**Step 1.3.1: Create Global Service Registry**
```typescript
// File: /lib/core/global-service-registry.ts (NEW)
import { ServiceManager } from './service-manager';
import { EventBus } from '@/lib/avca/services/event-bus';
import { AIClientService } from '@/lib/avca/services/ai-client';
import { EventHandlingSystem } from '@/lib/dias/events/event-handlers';

class GlobalServiceRegistry {
  private static instance: GlobalServiceRegistry;
  private serviceManager: ServiceManager;
  private initialized = false;
  
  private constructor() {
    const eventBus = new EventBus();
    this.serviceManager = new ServiceManager(eventBus);
  }
  
  static getInstance(): GlobalServiceRegistry {
    if (!GlobalServiceRegistry.instance) {
      GlobalServiceRegistry.instance = new GlobalServiceRegistry();
    }
    return GlobalServiceRegistry.instance;
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Register all services
    this.serviceManager.registerService('avca-client', () => new AIClientService(this.getEventBus()));
    this.serviceManager.registerService('dias-handler', () => new EventHandlingSystem({ eventBus: this.getEventBus() }));
    
    this.initialized = true;
  }
  
  getServiceManager(): ServiceManager {
    return this.serviceManager;
  }
  
  private getEventBus(): EventBus {
    // Return singleton EventBus
    return new EventBus();
  }
}

export const globalServiceRegistry = GlobalServiceRegistry.getInstance();
```

**Step 1.3.2: Update API to Use Service Manager**
```typescript
// File: /app/api/onboarding/chat/route.ts
// Replace manual service initialization

// OLD:
let aiClient: AIClientService;
let eventBus: EventBus;
let diasEventHandler: EventHandlingSystem;

async function initializeServices() {
  if (!aiClient) {
    eventBus = new EventBus();
    aiClient = new AIClientService(eventBus);
    await aiClient.start();
    diasEventHandler = new EventHandlingSystem({ eventBus });
    await diasEventHandler.start();
  }
}

// NEW:
import { globalServiceRegistry } from '@/lib/core/global-service-registry';

export async function POST(request: NextRequest) {
  try {
    // Initialize services once globally
    await globalServiceRegistry.initialize();
    const serviceManager = globalServiceRegistry.getServiceManager();
    
    // Get services through manager (lazy loaded, health monitored)
    const aiClient = serviceManager.getService<AIClientService>('avca-client');
    const diasHandler = serviceManager.getService<EventHandlingSystem>('dias-handler');
    
    // Rest of API logic...
  }
}
```

**Step 1.3.3: Enable Service Health Monitoring**
```typescript
// File: /app/api/health/services/route.ts (NEW)
import { globalServiceRegistry } from '@/lib/core/global-service-registry';

export async function GET() {
  const serviceManager = globalServiceRegistry.getServiceManager();
  const statuses = serviceManager.getServiceStatuses();
  
  return NextResponse.json({
    services: statuses,
    readyServices: serviceManager.getReadyServices(),
    timestamp: new Date().toISOString()
  });
}
```

**Validation Criteria**:
- ✅ Services initialized once per application lifecycle
- ✅ Service health monitoring active
- ✅ Graceful fallback mechanisms working
- ✅ 50%+ reduction in initialization overhead

---

### **Task 1.4: Basic Intent Recognition**
**Priority**: 🔶 MEDIUM - Enable intelligent request routing

#### **Implementation Steps**

**Step 1.4.1: Enhance Intent Classification**
```typescript
// File: /lib/intelligence/intent/enhanced-intent-classifier.ts (NEW)
export class EnhancedIntentClassifier extends IntentClassifier {
  private patterns = {
    planning: [
      /plan|planning|strategy|approach/i,
      /architecture|design|structure/i,
      /organize|organize|layout/i
    ],
    implementation: [
      /create|build|make|generate/i,
      /implement|code|develop/i,
      /add|include|integrate/i
    ],
    modification: [
      /change|modify|update|edit/i,
      /fix|correct|improve/i,
      /remove|delete|replace/i
    ],
    question: [
      /what|how|why|when|where/i,
      /explain|describe|tell/i,
      /help|guide|assist/i
    ]
  };
  
  async classifyIntent(request: IntelligenceRequest): Promise<UserIntent> {
    const message = request.message;
    const context = request.context;
    
    // Pattern matching with confidence scoring
    const scores = {
      planning: this.calculatePatternScore(message, this.patterns.planning),
      implementation: this.calculatePatternScore(message, this.patterns.implementation),
      modification: this.calculatePatternScore(message, this.patterns.modification),
      question: this.calculatePatternScore(message, this.patterns.question)
    };
    
    // Context-based adjustment
    this.adjustScoresForContext(scores, context);
    
    // Find highest scoring category
    const category = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    ) as UserIntent['category'];
    
    return {
      category,
      confidence: scores[category],
      aiRole: this.mapCategoryToRole(category),
      complexity: this.assessComplexity(message, context),
      domains: this.extractDomains(message, context)
    };
  }
  
  private calculatePatternScore(message: string, patterns: RegExp[]): number {
    const matches = patterns.filter(pattern => pattern.test(message)).length;
    return Math.min(matches / patterns.length * 0.8 + 0.2, 1.0);
  }
  
  private adjustScoresForContext(scores: any, context: RequestContext): void {
    // Boost planning score in early stages
    if (context.stage === 'initial' || context.stage === 'requirements') {
      scores.planning *= 1.2;
    }
    
    // Boost implementation score in later stages
    if (context.stage === 'features' || context.stage === 'architecture') {
      scores.implementation *= 1.2;
    }
  }
}
```

**Validation Criteria**:
- ✅ Intent classification accuracy >70%
- ✅ Context-aware classification adjustments
- ✅ Confidence scoring implemented
- ✅ Domain extraction functional

---

## Phase 2: System Integration (2-3 weeks)

### **Task 2.1: Knowledge-Code Bridge**
**Priority**: 🔥 HIGH - Connect knowledge to code generation

#### **Implementation Steps**

**Step 2.1.1: Create Knowledge-Code Bridge**
```typescript
// File: /lib/execution/bridge/knowledge-code-bridge.ts (NEW)
import { useOnboardingStore } from '@/lib/stores/onboarding-store';

export interface KnowledgeCodeMapping {
  projectOverview: CodeRequirement[];
  buildSpecifications: ArchitectureBlueprint;
  userJourneys: TestScenario[];
  features: ComponentBlueprint[];
}

export class KnowledgeCodeBridge {
  static mapKnowledgeToCodeRequirements(
    projectData: any
  ): KnowledgeCodeMapping {
    return {
      projectOverview: this.mapOverviewToRequirements(projectData.projectOverview),
      buildSpecifications: this.mapSpecsToArchitecture(projectData.buildSpecs),
      userJourneys: this.mapJourneysToTests(projectData.userJourneys),
      features: this.mapFeaturesToComponents(projectData.features)
    };
  }
  
  static validateKnowledgeCodeAlignment(
    knowledge: any,
    generatedCode: any
  ): ValidationReport {
    // Validate that generated code aligns with knowledge
    return {
      overallScore: 0.95,
      issues: [],
      recommendations: []
    };
  }
}
```

### **Task 2.2: Enhanced Memory System**
**Priority**: 🔶 MEDIUM - Multi-layered memory implementation

### **Task 2.3: Advanced Routing & Personas**
**Priority**: 🔶 MEDIUM - SuperClaude persona integration

### **Task 2.4: Quality & Monitoring Integration**
**Priority**: 🔶 MEDIUM - Comprehensive system monitoring

---

## Phase 3: Architecture Optimization (1-2 weeks)

### **Task 3.1: Performance Optimization**
### **Task 3.2: Advanced Features**  
### **Task 3.3: Directory Restructuring**

---

## Implementation Guidelines

### **Development Principles**
1. **Incremental Integration**: Connect existing systems, don't rebuild
2. **Validation at Each Step**: Ensure each task works before proceeding
3. **Backward Compatibility**: Maintain existing functionality during transition
4. **Performance Monitoring**: Track overhead and optimize continuously

### **Testing Strategy**
1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test system connections
3. **End-to-End Tests**: Test complete user workflows
4. **Performance Tests**: Monitor coordination overhead

### **Quality Gates**
1. **Phase 1**: All critical disconnections fixed
2. **Phase 2**: Full system integration working
3. **Phase 3**: Performance and advanced features optimized

---

## Success Metrics

### **Quantitative Metrics**
- Knowledge persistence: 100% (from 0%)
- Service initialization efficiency: +300% (once vs per-request)
- Intent classification accuracy: >70%
- System response time: <500ms
- Context retention: >95%

### **Qualitative Metrics**
- Clean architectural separation maintained
- All existing capabilities preserved and enhanced
- Developer experience improved
- System maintainability increased

---

## Risk Mitigation

### **Technical Risks**
- **Integration Complexity**: Phased approach with validation
- **Performance Overhead**: Continuous monitoring and optimization
- **State Synchronization**: Leverage existing Zustand persistence
- **Service Dependencies**: Use ServiceManager fallback mechanisms

### **Project Risks**
- **Scope Creep**: Strict adherence to connection work, not rebuilding
- **Timeline Pressure**: Focus on critical fixes first
- **Quality Regression**: Comprehensive testing at each phase

---

## Conclusion

This implementation plan leverages the excellent existing architecture to achieve clean WHO/WHAT/WHERE separation through targeted connection work. The phased approach ensures system stability while unlocking the sophisticated capabilities already built into the Vibe Lab platform.

**Key Success Factor**: Focus on connecting existing systems rather than building new ones - the foundation is already exceptional.