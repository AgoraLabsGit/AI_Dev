# Task Reorganization: Original → Integrated Roadmap

## How Original Tasks Map to New Phases

### Phase 0: Minimal Vertical Slice (Week 1)
**New Phase - No Original Tasks**
```yaml
New Tasks:
  - Single feature implementation ("Add search to dashboard")
  - End-to-end pipeline measurement
  - Cost/quality/time validation
  - Go/No-Go decision documentation
```

### Phase 1: Event-Driven Architecture (Week 2)
**Uses Tasks From:**
- Original Phase 2.1 (AI Client Implementation)
- Original Phase 2.2 (Context Manager)
- Original Phase 1.3 (Base Configuration)

```yaml
Original Tasks to Use:
  ✅ Create lib/config/ai.config.ts (Original 1.3)
  ✅ Implement VibeLab AIClient.ts (Original 2.1)
  ✅ Create ContextManager.ts (Original 2.2)
  
New Event Architecture:
  🆕 Set up Redis/NATS event bus
  🆕 Create service skeletons
  🆕 Refactor chat → event publisher
```

### Phase 2: Quality Gates & Safety Nets (Week 3)
**Uses Tasks From:**
- Original Phase 1.1 (Database Schema Extension)
- Original Phase 1.2 (Project Structure Setup)
- Original Phase 3.4 (Quality Gates)

```yaml
Original Tasks to Use:
  ✅ Extend Prisma schema with AVCA tables (Original 1.1)
  ✅ Create lib/ directory structure (Original 1.2)
  ✅ Implement quality gate system (Original 3.4)
  
Enhanced with Safety:
  🆕 Static analysis pipeline
  🆕 Auto-fix loops
  🆕 Typed contracts with Zod
```

### Phase 3: Service Implementation (Week 4)
**Uses Tasks From:**
- Original Phase 3.1 (Component Registry)
- Original Phase 3.2-3.3 (Pipeline Stages)
- Original Phase 2.3 (Chat Integration Enhancement)

```yaml
Original Tasks to Use:
  ✅ Implement ComponentRegistry.ts (Original 3.1)
  ✅ Implement pipeline stages 1-8 (Original 3.2-3.3)
  ✅ Enhance dual-Claude chat (Original 2.3)
  
Reorganized as Services:
  🔄 Blueprint Service (stages 1-3)
  🔄 Generation Service (stages 4-5)
  🔄 Audit Service (stage 6)
  🔄 Assembly Service (stages 7-8)
```

### Phase 4: Cost & Performance Controls (Week 5)
**New Phase - Uses Concepts From:**
- Original performance considerations
- Token optimization strategies

```yaml
New Tasks Based on Hardening Plan:
  🆕 Token budget manager
  🆕 Context summarization service
  🆕 Cost monitoring dashboard
  🆕 Emergency mode controls
```

### Phase 5: Testing Infrastructure (Week 6)
**Uses Tasks From:**
- Original Phase 6.1 (Component Testing)
- Original Phase 6.2 (Integration Testing)
- Original Phase 6.3 (Performance Optimization)

```yaml
Original Tasks to Use:
  ✅ Write component tests (Original 6.1)
  ✅ Test pipeline workflows (Original 6.2)
  ✅ Performance optimization (Original 6.3)
  
Enhanced with Infrastructure:
  🆕 Parallel test generation
  🆕 Container test farm
  🆕 Golden test repository
```

### Phase 6: Integration & Migration (Week 7)
**Uses Tasks From:**
- Original Phase 5.1 (Design Hub Implementation)
- Original Phase 5.2 (AVCA-DIAS Integration)
- Original Phase 5.3 (Approval Flow Widget)

```yaml
Original Tasks to Use:
  ✅ Create Design Hub pages (Original 5.1)
  ✅ Implement integration layer (Original 5.2)
  ✅ Create ApprovalWidget component (Original 5.3)
  
Migration Focus:
  🔄 Connect services with UI
  🔄 Migrate from direct calls to events
```

### Phase 7: DIAS Gradual Rollout (Week 8)
**Uses Tasks From:**
- Original Phase 4.1-4.3 (DIAS Implementation)
- But with gradual approach

```yaml
Original Tasks to Use (Modified):
  ✅ Core DIAS Modules (Original 4.1) → Observation mode only
  ✅ Adaptation Workflows (Original 4.2) → Offline experiments
  ✅ Memory System (Original 4.3) → Pattern collection
  
Gradual Approach:
  🔄 Start with metrics collection
  🔄 Offline suggestions via PRs
  🔄 No auto-application initially
```

---

## What This Means Practically

### 1. Keep Original Task Details
```typescript
// Example: Original Phase 2.1 AI Client Implementation
// Still use the exact code examples and specifications
const vibeLabAIStack = {
  developer: {
    model: "claude-3-opus-20240229",
    // ... exact settings from original plan
  }
};

// But implement it within Phase 1: Event Architecture
```

### 2. Reorganize the Sequence
```yaml
Original Sequence: Database → AI → AVCA → DIAS → UI → Testing
New Sequence:     Validation → Events → Safety → Services → Testing → UI → DIAS
```

### 3. Enhanced with Safety
```typescript
// Original task: "Implement ComponentRegistry.ts"
// Enhanced: "Implement ComponentRegistry.ts with event publishing"

class ComponentRegistry {
  async register(component: Component) {
    // Original functionality
    const registered = await this.database.save(component);
    
    // Enhanced with events
    await eventBus.publish({
      type: 'component.registered',
      component: registered
    });
    
    return registered;
  }
}
```

---

## Decision Framework

### Use Original Tasks When:
- ✅ They fit the new phase structure
- ✅ Implementation details are solid
- ✅ Documentation references are complete

### Enhance Tasks When:
- 🔄 They need event-driven architecture
- 🔄 They need better error handling
- 🔄 They need cost controls

### Create New Tasks When:
- 🆕 Validation is needed (Phase 0)
- 🆕 Safety nets are required
- 🆕 Performance controls are missing

---

## Immediate Action Plan

1. **Start Phase 0** (new tasks)
2. **Reorganize original detailed tasks** under new phase structure
3. **Keep all original documentation** as implementation reference
4. **Enhance tasks** with event architecture and safety nets
5. **Maintain same level of detail** but in new sequence

The original roadmap becomes our **implementation library** - we just reorganize when and how we use those tasks based on the hardening plan's safer approach.