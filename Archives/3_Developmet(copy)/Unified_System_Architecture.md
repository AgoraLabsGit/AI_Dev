# Vibe Lab Unified System Architecture

**Document Type**: Core System Architecture  
**Status**: Authoritative  
**Created**: 2025-01-05  
**Purpose**: Complete architectural overview of the Vibe Lab AI-powered development platform using the WHO/WHAT/HOW/WHERE framework

---

## Executive Summary

Vibe Lab's architecture is built on four foundational pillars that work in constant communication to transform user ideas into production-ready applications. This unified system ensures clean separation of concerns while maintaining tight integration for optimal performance.

---

## Core Architecture Framework

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VIBE LAB UNIFIED ARCHITECTURE                     │
├─────────────┬─────────────┬─────────────┬─────────────────────────────────────┤
│     WHO     │  WHAT/WHY   │     HOW     │              WHERE                  │
│ Intelligence│ Instructions│  Execution  │         Storage & Knowledge         │
│  Modules    │  & Intent   │  Pipeline   │                                     │
└─────────────┴─────────────┴─────────────┴─────────────────────────────────────┘
       ▲             ▲             ▲                       ▲
       │             │             │                       │
   ┌───┴───┐    ┌────┴────┐   ┌────┴────┐            ┌────┴────┐
   │ AVCA  │    │  Page   │   │  Code   │            │Project  │
   │ DIAS  │◄──►│Context  │◄─►│Generator│◄──────────►│Documents│
   │SuperC │    │ Intent  │   │Document │            │ Memory  │
   └───────┘    │ Router  │   │Updater  │            │ State   │
                └─────────┘   │UI Render│            └─────────┘
                              │API Calls│
                              └─────────┘
```

---

## 1. WHO - Intelligence Modules

The "WHO" represents the AI decision-makers that determine responses and actions.

### 1.1 AVCA (AI-Verified Component Architecture)
**Role**: Execution engine for structured development tasks
**Components**:
- AI Client with 4 core roles (Developer, Auditor, Router, Analyzer)
- Blueprint Service for project planning
- Quality Assurance Service for validation
- Document Generator for project artifacts

**Current Implementation**: `lib/avca/services/`
**Status**: ✅ Functional but needs integration

### 1.2 DIAS (Dynamic Intelligence & Adaptation System)
**Role**: Orchestrator and intelligent routing system
**Components**:
- AI Orchestrator Service
- Task Master Service
- Context Manager Service
- MCP Server Integration

**Current Implementation**: `lib/dias/services/`
**Status**: ⚠️ Built but not connected to onboarding

### 1.3 SuperClaude Framework
**Role**: Specialized persona system with 11 domain experts
**Personas**:
- **Technical**: architect, frontend, backend, security, performance
- **Process**: analyzer, qa, refactorer, devops
- **Communication**: mentor, scribe

**Current Implementation**: `lib/integration/persona-mapper.ts`
**Status**: ⚠️ Mapping exists but not actively used

### 1.4 Integration Status
```typescript
// Current Problem: Disconnected Systems
AVCA ────┐
         ├──── No unified interface
DIAS ────┤
         ├──── Each has own entry points
SuperC ──┘

// Required Solution: Unified Intelligence Router
User Input → Intelligence Router → Best Available AI → Response
```

---

## 2. WHAT/WHY - Instructions & Intent

The "WHAT/WHY" represents the decision logic that determines which AI to use and how to instruct it.

### 2.1 Page Context System
**Role**: Determine AI behavior based on current page/stage

**Context Types**:
```typescript
interface PageContext {
  stage: 'onboarding' | 'iteration' | 'building' | 'deployment';
  page: string;
  userGoals: string[];
  constraints: ProjectConstraints;
  availableActions: Action[];
}
```

**Examples**:
- **Onboarding Page**: Use conversation-focused AI with document generation
- **Design Page**: Use frontend persona with Magic MCP server
- **Build Page**: Use architect persona with technical focus

### 2.2 Intent Recognition System
**Role**: Understand user goals from chat interactions

**Intent Categories**:
```typescript
type UserIntent = 
  | 'create_project'      // Initial project setup
  | 'modify_features'     // Change existing functionality
  | 'technical_question'  // Need guidance/explanation
  | 'fix_issue'          // Problem solving
  | 'optimize_code'      // Performance/quality improvement
  | 'deploy_project'     // Production deployment
```

**Current Implementation**: ❌ **Missing entirely**
**Required**: Intent classification service with confidence scoring

### 2.3 Instruction Generation
**Role**: Convert context + intent into specific AI instructions

**Instruction Components**:
```typescript
interface AIInstruction {
  persona: SuperClaudePersona;
  mcpServers: MCPServerType[];
  flags: string[];
  prompt: string;
  maxTokens: number;
  temperature: number;
  constraints: string[];
}
```

### 2.4 Routing Logic
**Current Problem**: No intelligent routing
```typescript
// What happens now:
User → Hardcoded API → Basic AI Response

// What should happen:
User → Context Analysis → Intent Recognition → AI Selection → Optimized Response
```

---

## 3. HOW - Execution Pipeline

The "HOW" represents the action layer that executes decisions and applies changes.

**Reference**: See `Development_Execution_Systems.md` for complete implementation details.

### 3.1 Code Generation Pipeline
**Role**: Transform AI decisions into actual code

**Pipeline Stages**:
1. **Blueprint Parsing**: AI decisions → Structured plans
2. **Code Generation**: Plans → Source code files
3. **Quality Validation**: Code → Tested, validated output
4. **Integration**: Code → Project structure

**Current Implementation**: `lib/avca/pipeline/`
**Status**: ✅ Partially built, needs completion

### 3.2 Quality Assurance System
**Role**: Multi-level QA with automated quality gates

**QA Components**:
- Code Quality Analyzer
- Architecture Auditor  
- Performance Auditor
- Security Auditor
- Automated Quality Gates

### 3.3 Testing System
**Role**: Comprehensive automated testing

**Testing Components**:
- Unit Test Generator
- Integration Test Generator
- E2E Test Generator
- Performance Test Generator
- Test Quality Analyzer

### 3.4 Logging & Monitoring
**Role**: Complete traceability and system monitoring

**Logging Components**:
- Development Log (Chain of Custody)
- Error & Bug Resolution Log
- Compliance & Audit Log
- Quality & Performance Logs

### 3.2 Document Update Engine
**Role**: Maintain living documents (Project Overview, Build Specifications)

**Update Process**:
```typescript
// Document Update Lifecycle
User Change → Impact Analysis → Document Updates → Cascade Effects → Validation
```

**Current Implementation**: ❌ **Missing cascade logic**
**Required**: Version-controlled document management

### 3.3 UI Rendering System
**Role**: Display generated content and system state

**Rendering Components**:
- LiveDocumentPreview for real-time updates
- Chat interface with AI responses
- Quick action buttons based on context
- Progress indicators and status displays

**Current Implementation**: ✅ Components exist
**Status**: ⚠️ Not connected to unified system

### 3.4 API Integration Layer
**Role**: Handle external service interactions

**Integration Types**:
- GitHub repository import
- Code file upload/analysis  
- External service APIs
- Export/backup operations

**Current Implementation**: ✅ Individual services exist
**Status**: ⚠️ Not orchestrated

---

## 4. WHERE - Storage & Knowledge

The "WHERE" represents all persistent information and system state.

### 4.1 Project Documents (Single Source of Truth)
**Role**: Authoritative project information

**Document Types**:
```typescript
interface ProjectDocuments {
  projectOverview: {
    name: string;
    description: string;
    targetUsers: string[];
    keyFeatures: string[];
    problemSolved: string;
    successMetrics: string[];
  };
  buildSpecifications: {
    techStack: TechStack;
    architecture: Architecture;
    dataModels: string[];
    integrations: string[];
    performanceTargets: PerformanceMetrics;
  };
  versionHistory: DocumentVersion[];
}
```

**Current Implementation**: ✅ `lib/stores/onboarding-store.ts`
**Status**: ❌ **Not connected to onboarding API**

### 4.2 Conversation Memory
**Role**: Maintain context across interactions

**Memory Types**:
- **Short-term**: Current conversation thread
- **Medium-term**: Recent project interactions  
- **Long-term**: User preferences and patterns

**Current Implementation**: ❌ **Missing entirely**
**Required**: Multi-layered memory system

### 4.3 System State Management
**Role**: Track system configuration and user preferences

**State Components**:
```typescript
interface SystemState {
  activeProject: string;
  userPreferences: UserPreferences;
  featureFlags: FeatureFlags;
  aiConfiguration: AIConfig;
  performance: PerformanceMetrics;
}
```

### 4.4 Knowledge Artifacts
**Role**: All generated and derived information

**Artifact Categories**:
- Generated code files
- Documentation 
- Test files
- Configuration files
- Deployment scripts
- Analytics data

---

## System Integration Patterns

### 4.1 Communication Flow
```
User Input
    ↓
WHAT/WHY (Context + Intent Analysis)
    ↓
WHO (AI Selection & Instruction)
    ↓
HOW (Execution & Generation)
    ↓
WHERE (Persistence & State Update)
    ↓
User Response
```

### 4.2 Feedback Loops
```
WHERE (Historical Data) → WHAT/WHY (Better Context)
HOW (Execution Results) → WHO (AI Learning)
User Behavior → ALL (System Optimization)
```

### 4.3 Error Handling
```
Component Failure → Graceful Degradation → Fallback → Recovery → Learning
```

---

## Current Implementation Gaps

### Critical Issues
1. **No Unified Entry Point**: Systems work in isolation
2. **Missing Intent Recognition**: No intelligent routing
3. **Storage Disconnection**: Zustand store unused
4. **No Memory System**: Each request is stateless
5. **Fragmented AI Systems**: AVCA/DIAS/SuperClaude don't communicate

### Required Implementations
1. **Unified Intelligence Router**
2. **Intent Classification Service**
3. **Storage Integration Layer**
4. **Multi-layered Memory System**
5. **System Orchestrator**

---

## Migration Strategy

### Phase 1: Unification (Critical)
- Create unified intelligence router
- Connect storage to all AI systems
- Implement basic intent recognition

### Phase 2: Enhancement
- Add memory systems
- Improve intent classification
- Implement feedback loops

### Phase 3: Optimization
- Add learning systems
- Implement advanced routing
- Performance optimization

---

## Success Metrics

### Technical Metrics
- **Response Time**: <2 seconds for 95% of requests
- **Accuracy**: >90% correct AI selection
- **Persistence**: 100% state preservation
- **Integration**: 0 system disconnections

### User Experience Metrics  
- **Conversation Continuity**: >95% context retention
- **Intent Recognition**: >85% first-try accuracy
- **Document Quality**: >90% user satisfaction
- **System Reliability**: 99.9% uptime

---

## Next Steps

1. **Create Unified Router**: Single entry point for all AI interactions
2. **Connect Storage**: Wire Zustand store to all systems  
3. **Implement Intent Recognition**: AI-powered user goal understanding
4. **Build Memory System**: Multi-layered conversation and project memory
5. **Test Integration**: End-to-end system validation

This architecture provides the foundation for a clean, scalable, and maintainable AI-powered development platform that can evolve with user needs and technological advances.