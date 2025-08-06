# Task Master: Onboarding System Rebuild - Detailed Task Matrix

**Document Type**: Task Master Implementation Matrix  
**Status**: Active Planning  
**Priority**: Critical  
**Created**: 2025-01-05  
**Wave Strategy**: Systematic Waves with Validation Gates  
**Complexity Score**: 0.85 (High Complexity - Multi-domain, System Integration)  

---

## Task Master Configuration

**Wave Mode**: `--wave-mode systematic --wave-validation`  
**MCP Servers**: `--c7 --seq --magic --no-play`  
**Personas**: `--persona-architect --persona-frontend --persona-backend`  
**Delegation**: `--delegate folders --concurrency 3`  
**Flags**: `--think-hard --validate --uc`  

---

## PHASE 1: FOUNDATION AUDIT & REBUILD

| Task ID | Task Name | Status | Priority | Complexity | Dependencies | MCP Resources | Persona | Duration | Acceptance Criteria |
|---------|-----------|--------|----------|------------|--------------|---------------|---------|----------|-------------------|
| **1.1.1** | API Request Flow Analysis | 🔄 READY | Critical | 0.6 | None | Sequential + Context7 | Analyzer | 30m | Complete flow diagram with bottlenecks identified |
| **1.1.2** | Frontend State Management Audit | 📋 PENDING | Critical | 0.7 | 1.1.1 | Sequential | Frontend | 20m | Zustand store inconsistencies documented |
| **1.1.3** | Conversation History Tracking | 📋 PENDING | High | 0.5 | 1.1.1 | Sequential | Frontend | 15m | Message persistence validated end-to-end |
| **1.1.4** | Project Type Detection Debug | 📋 PENDING | Critical | 0.8 | 1.1.1, 1.1.2 | Sequential + Context7 | Backend + Analyzer | 25m | Pattern matching works for all project types |
| **1.2.1** | Pattern Matching Engine Fix | 📋 PENDING | Critical | 0.7 | 1.1.4 | Context7 | Backend | 30m | "todo app" → web application mapping works |
| **1.2.2** | Stage Transition Logic | 📋 PENDING | Critical | 0.6 | 1.1.2, 1.2.1 | Sequential | Architect | 20m | Proper stage progression with validation |
| **1.2.3** | ExtractedInfo Object Validation | 📋 PENDING | High | 0.4 | 1.2.1 | Sequential | Backend | 15m | All required fields populated correctly |
| **1.3.1** | Response Length Enforcement | 📋 PENDING | Critical | 0.3 | None | Context7 | Backend | 10m | 150 token limit enforced consistently |
| **1.3.2** | Stage-Specific Prompt Engineering | 📋 PENDING | High | 0.8 | 1.2.2 | Context7 + Sequential | Backend + Mentor | 45m | Concise, targeted prompts for each stage |
| **1.3.3** | Conversation Context Preservation | 📋 PENDING | High | 0.6 | 1.1.3, 1.3.1 | Sequential | Backend | 20m | Context maintained across multiple turns |

## PHASE 2: FEATURE-SPECIFIC BUTTON SYSTEM

| Task ID | Task Name | Status | Priority | Complexity | Dependencies | MCP Resources | Persona | Duration | Acceptance Criteria |
|---------|-----------|--------|----------|------------|--------------|---------------|---------|----------|-------------------|
| **2.1.1** | Todo App Button Matrix | 📋 PENDING | Critical | 0.5 | 1.2.1 | Magic + Context7 | Frontend | 20m | Correct buttons for todo apps generated |
| **2.1.2** | Feature Category System | 📋 PENDING | High | 0.6 | 2.1.1 | Sequential | Architect | 15m | Primary/Suggest/Secondary categorization works |
| **2.1.3** | Button Click Handler System | 📋 PENDING | High | 0.7 | 2.1.1 | Magic | Frontend | 25m | Selections update conversation state |
| **2.2.1** | Marketplace Feature Set | 📋 PENDING | High | 0.5 | 2.1.2 | Context7 | Frontend | 15m | E-commerce specific buttons generated |
| **2.2.2** | Social Platform Feature Set | 📋 PENDING | High | 0.5 | 2.1.2 | Context7 | Frontend | 15m | Social media buttons with descriptions |
| **2.2.3** | Generic App Fallback | 📋 PENDING | Medium | 0.4 | 2.2.1, 2.2.2 | Context7 | Frontend | 10m | Safe fallback when project type unclear |
| **2.3.1** | Feature Selection Accumulator | 📋 PENDING | High | 0.6 | 2.1.3 | Sequential | Backend | 20m | Multiple selections tracked properly |
| **2.3.2** | Selection Feedback System | 📋 PENDING | Medium | 0.4 | 2.3.1 | Magic | Frontend | 15m | Visual feedback for user selections |
| **2.3.3** | Progress-Based Stage Transitions | 📋 PENDING | High | 0.7 | 2.3.1, 1.2.2 | Sequential | Architect | 20m | Stage changes based on selection count |

## PHASE 3: DOCUMENT GENERATION PIPELINE

| Task ID | Task Name | Status | Priority | Complexity | Dependencies | MCP Resources | Persona | Duration | Acceptance Criteria |
|---------|-----------|--------|----------|------------|--------------|---------------|---------|----------|-------------------|
| **3.1.1** | Project Overview Generator | 📋 PENDING | Critical | 0.8 | 2.3.1 | Context7 + Sequential | Architect + Scribe | 25m | Complete overview from selected features |
| **3.1.2** | Build Specifications Generator | 📋 PENDING | Critical | 0.9 | 3.1.1 | Context7 + Sequential | Backend + Architect | 30m | Technical specs match project complexity |
| **3.1.3** | Document Synchronization Logic | 📋 PENDING | High | 0.7 | 3.1.1, 3.1.2 | Sequential | Architect | 15m | Both documents update simultaneously |
| **3.1.4** | Tech Stack Recommendation Engine | 📋 PENDING | High | 0.8 | 3.1.2 | Context7 | Backend + Performance | 20m | Appropriate tech choices for project type |
| **3.2.1** | Dual Document Preview UI | 📋 PENDING | High | 0.6 | 3.1.3 | Magic | Frontend | 20m | Both documents visible in left panel |
| **3.2.2** | Real-time Document Updates | 📋 PENDING | High | 0.7 | 3.2.1, 3.1.3 | Magic + Sequential | Frontend | 25m | Live updates without page refresh |
| **3.2.3** | Document Export Functionality | 📋 PENDING | Medium | 0.5 | 3.2.1 | Context7 | Frontend | 15m | Export in PDF/Markdown formats |

## PHASE 4: COMPREHENSIVE TESTING & VALIDATION

| Task ID | Task Name | Status | Priority | Complexity | Dependencies | MCP Resources | Persona | Duration | Acceptance Criteria |
|---------|-----------|--------|----------|------------|--------------|---------------|---------|----------|-------------------|
| **4.1.1** | Todo App End-to-End Test | 📋 PENDING | Critical | 0.4 | All Phase 3 | Sequential | QA | 10m | Complete flow works without errors |
| **4.1.2** | Marketplace Flow Validation | 📋 PENDING | Critical | 0.4 | All Phase 3 | Sequential | QA | 10m | E-commerce features properly handled |
| **4.1.3** | Social Platform Test Scenario | 📋 PENDING | Critical | 0.4 | All Phase 3 | Sequential | QA | 10m | Social features generate correct docs |
| **4.1.4** | Performance Benchmarking | 📋 PENDING | High | 0.5 | 4.1.1-4.1.3 | Sequential | Performance | 15m | All response times under 3 seconds |
| **4.1.5** | Mobile Responsiveness Test | 📋 PENDING | Medium | 0.3 | 4.1.4 | Magic | Frontend | 10m | Works correctly on mobile devices |
| **4.2.1** | Error Handling Validation | 📋 PENDING | High | 0.6 | 4.1.1-4.1.3 | Sequential | QA | 20m | Graceful degradation for edge cases |
| **4.2.2** | Token Usage Analysis | 📋 PENDING | Medium | 0.4 | 4.1.4 | Sequential | Analyzer | 10m | Consistent 150 token limit compliance |
| **4.2.3** | User Experience Review | 📋 PENDING | High | 0.5 | 4.1.5, 4.2.1 | Sequential | Frontend + Mentor | 15m | Intuitive, smooth user journey |

---

## Task Master Complexity Analysis

### Complexity Scoring Matrix (0.0 - 1.0):
- **0.0-0.3**: Simple (Single file, basic logic)
- **0.4-0.6**: Moderate (Multi-file, business logic)  
- **0.7-0.8**: Complex (System integration, AI coordination)
- **0.9-1.0**: Critical (Architecture changes, high risk)

### High Complexity Tasks (≥0.7):
1. **Task 1.1.4**: Project Type Detection Debug (0.8) - Core system logic
2. **Task 1.3.2**: Stage-Specific Prompt Engineering (0.8) - AI behavior tuning
3. **Task 2.1.3**: Button Click Handler System (0.7) - State management integration
4. **Task 2.3.3**: Progress-Based Stage Transitions (0.7) - Complex business logic
5. **Task 3.1.1**: Project Overview Generator (0.8) - Document intelligence
6. **Task 3.1.2**: Build Specifications Generator (0.9) - Technical architecture
7. **Task 3.1.4**: Tech Stack Recommendation Engine (0.8) - Decision algorithm
8. **Task 3.2.2**: Real-time Document Updates (0.7) - UI synchronization

---

## MCP Server Resource Allocation

### Context7 Usage (Documentation & Patterns):
- **Primary**: Tasks involving tech stack recommendations, patterns, best practices
- **Tasks**: 1.1.1, 1.1.4, 1.2.1, 1.3.1, 1.3.2, 2.2.1, 2.2.2, 2.2.3, 3.1.1, 3.1.2, 3.1.4, 3.2.3
- **Token Budget**: ~8K tokens across Context7 tasks

### Sequential Usage (Complex Analysis):
- **Primary**: Tasks requiring systematic analysis, multi-step reasoning
- **Tasks**: 1.1.1, 1.1.2, 1.1.3, 1.1.4, 1.2.2, 1.3.2, 1.3.3, 2.1.2, 2.3.1, 2.3.3, 3.1.1, 3.1.2, 3.1.3, 4.1.1-4.2.3
- **Token Budget**: ~12K tokens across Sequential tasks

### Magic Usage (UI Components):
- **Primary**: Tasks involving UI generation, component creation, frontend work
- **Tasks**: 2.1.1, 2.1.3, 2.3.2, 3.2.1, 3.2.2, 4.1.5
- **Token Budget**: ~4K tokens across Magic tasks

### No Playwright:
- **Rationale**: Focus on system rebuild, not E2E testing automation at this phase
- **Alternative**: Manual testing for validation tasks in Phase 4

---

## Persona Assignments & Specializations

### Architect Persona (8 tasks):
- **Focus**: System design, stage transitions, document synchronization
- **Tasks**: 1.2.2, 2.1.2, 2.3.3, 3.1.1, 3.1.2, 3.1.3, 3.1.4
- **Key Responsibility**: Overall system coherence and integration

### Frontend Persona (7 tasks):
- **Focus**: UI components, user experience, button systems
- **Tasks**: 1.1.2, 2.1.1, 2.1.3, 2.2.1, 2.2.2, 2.2.3, 2.3.2, 3.2.1, 3.2.2, 3.2.3, 4.1.5, 4.2.3
- **Key Responsibility**: User interface and interaction design

### Backend Persona (6 tasks):
- **Focus**: API logic, data processing, business rules
- **Tasks**: 1.1.4, 1.2.1, 1.2.3, 1.3.1, 1.3.3, 2.3.1, 3.1.2, 3.1.4
- **Key Responsibility**: Server-side logic and data management

### Analyzer Persona (3 tasks):
- **Focus**: Problem investigation, system analysis
- **Tasks**: 1.1.1, 1.1.4, 4.2.2
- **Key Responsibility**: Root cause analysis and debugging

### QA Persona (5 tasks):
- **Focus**: Testing, validation, quality assurance
- **Tasks**: 4.1.1, 4.1.2, 4.1.3, 4.2.1
- **Key Responsibility**: System validation and quality gates

### Performance Persona (2 tasks):
- **Focus**: Optimization, benchmarking
- **Tasks**: 3.1.4, 4.1.4
- **Key Responsibility**: System performance and efficiency

### Mentor Persona (2 tasks):
- **Focus**: User experience, guidance systems
- **Tasks**: 1.3.2, 4.2.3
- **Key Responsibility**: User education and experience design

### Scribe Persona (1 task):
- **Focus**: Documentation generation
- **Tasks**: 3.1.1
- **Key Responsibility**: Professional document creation

---

## Dependency Chain Analysis

### Critical Path (Longest chain):
1. **1.1.1** → **1.1.4** → **1.2.1** → **1.2.2** → **2.1.2** → **2.3.3** → **3.1.3** → **3.2.2** → **4.1.1**
2. **Total Duration**: 195 minutes (3.25 hours)
3. **Bottleneck Tasks**: 1.1.4 (25m), 1.3.2 (45m), 3.1.2 (30m)

### Parallel Execution Opportunities:
- **Wave 1**: Tasks 1.1.1, 1.3.1 (independent starts)
- **Wave 2**: Tasks 1.1.2, 1.1.3, 1.2.3 (after 1.1.1)
- **Wave 3**: Tasks 2.2.1, 2.2.2, 2.2.3 (after 2.1.2)
- **Wave 4**: Tasks 3.2.1, 3.2.3 (after 3.1.3)
- **Wave 5**: Tasks 4.1.1, 4.1.2, 4.1.3 (parallel testing)

### Risk Mitigation:
- **High Risk**: Tasks with complexity ≥0.8 get extra review time
- **Dependencies**: Blocked tasks automatically delayed if dependencies fail
- **Fallbacks**: Alternative implementation paths for critical bottlenecks

---

## Success Metrics & Quality Gates

### Wave Completion Gates:
1. **Phase 1 Gate**: Project type detection accuracy ≥95%
2. **Phase 2 Gate**: Feature button relevance score ≥90%
3. **Phase 3 Gate**: Document generation success rate ≥98%
4. **Phase 4 Gate**: End-to-end test pass rate ≥100%

### Performance Targets:
- **API Response Time**: <3 seconds (target: <1 second)
- **Token Usage**: ≤150 tokens per response (target: 100-120)
- **Feature Detection**: ≥95% accuracy for project type classification
- **Document Quality**: Professional grade output, manually validated

### Technical Debt Metrics:
- **Code Complexity**: Maintained below 0.7 per module
- **Test Coverage**: ≥80% for critical path functions
- **Error Handling**: 100% of API endpoints have proper error handling
- **Documentation**: All functions have TSDoc comments

---

## Resource Allocation & Timeline

### Development Team Structure:
- **Lead Developer**: Architecture and system integration (Tasks with Architect persona)
- **Frontend Developer**: UI components and user experience (Frontend persona tasks)
- **Backend Developer**: API logic and data processing (Backend persona tasks)
- **QA Engineer**: Testing and validation (QA persona tasks)

### Timeline Optimization:
- **Parallel Development**: 60% of tasks can be executed in parallel
- **Critical Path**: 3.25 hours sequential, 5-6 hours total with parallel execution
- **Buffer Time**: 20% added for integration issues and edge cases
- **Total Estimate**: 6-7 hours for complete rebuild

### MCP Token Budget:
- **Context7**: 8K tokens (~$0.32 at current rates)
- **Sequential**: 12K tokens (~$0.48 at current rates)  
- **Magic**: 4K tokens (~$0.16 at current rates)
- **Total MCP Cost**: ~$0.96 for complete rebuild

---

This Task Master matrix provides the comprehensive, systematic approach needed to rebuild the onboarding system with full traceability, resource allocation, and quality assurance.