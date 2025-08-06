# Task Master Plan: Onboarding System Rebuild

**Document Type**: Task Master Analysis & Implementation Plan  
**Status**: Active Development  
**Priority**: Critical  
**Created**: 2025-01-05  
**Estimated Duration**: 4-6 hours focused development  

---

## Executive Summary

The current onboarding system at http://localhost:3000/onboarding is fundamentally broken despite recent patches. This Task Master plan provides a systematic rebuild approach to create the intelligent conversation system described in the development documentation.

## Problem Analysis (Current State)

### Critical Issues Identified:
1. **AI responses still too long** - 600+ tokens instead of 150 max
2. **Wrong quick action buttons** - Generic buttons instead of project-specific features
3. **No project type detection** - "todo app" not triggering correct feature sets
4. **Broken conversation flow** - Not progressing through documented stages
5. **Missing document generation** - Only partial Project Overview, no Build Specifications

### Root Cause:
Patchwork development approach has created disconnected components. Frontend and backend are not properly communicating project type and conversation state.

---

## PHASE 1: FOUNDATION AUDIT & REBUILD
**Duration**: 2-3 hours  
**Objective**: Build solid foundation instead of patches  
**Dependencies**: None  
**Risk Level**: Low  

### Task 1.1: Complete System Audit
**Estimated Time**: 45 minutes  
**Assignee**: Development Team  
**Priority**: Critical  

**Scope**:
- [ ] Trace full request flow: frontend → API → response
- [ ] Identify where project type detection breaks  
- [ ] Document current vs expected behavior for each component
- [ ] Map conversation history handling issues
- [ ] Verify API endpoint receives correct data structure

**Acceptance Criteria**:
- Complete flow diagram of current system
- List of all broken integration points
- Gap analysis between current and documented behavior

### Task 1.2: Fix Project Type Detection  
**Estimated Time**: 60 minutes  
**Assignee**: Development Team  
**Priority**: Critical  
**Dependencies**: Task 1.1  

**Scope**:
- [ ] Ensure "todo app" input sets `extractedInfo.projectType = 'web application'`
- [ ] Verify conversation stage detection works correctly
- [ ] Test quick action generation logic in isolation
- [ ] Fix pattern matching for project type extraction

**Technical Requirements**:
- Pattern matching: "todo", "task management" → "web application"
- Pattern matching: "marketplace", "e-commerce" → "marketplace"  
- Pattern matching: "social", "community" → "social platform"

**Acceptance Criteria**:
- Input "I want to build a todo app" correctly identifies project type
- Conversation stage transitions work (initial → requirements → features)
- extractedInfo object properly populated with project context

### Task 1.3: Fix Conversation Flow Management
**Estimated Time**: 75 minutes  
**Assignee**: Development Team  
**Priority**: Critical  
**Dependencies**: Task 1.2  

**Scope**:
- [ ] Implement proper stage transitions based on gathered information
- [ ] Ensure conversation history maintains context across requests
- [ ] Enforce 150 token response limit in API prompts
- [ ] Fix stage-specific prompt generation

**Technical Implementation**:
```typescript
// Stage transition logic
const determineNextStage = (history: Message[], extractedInfo: any) => {
  if (!extractedInfo.projectType) return 'initial';
  if (!extractedInfo.features?.length) return 'requirements'; 
  if (!extractedInfo.techStack) return 'architecture';
  return 'complete';
};

// Response length enforcement
const analysisRequest: AnalysisRequest = {
  role: AIRole.ANALYZER,
  prompt: getStageSpecificPrompt(stage, message, extractedInfo),
  maxTokens: 150, // ENFORCE THIS LIMIT
  temperature: 0.7
};
```

**Acceptance Criteria**:
- AI responses never exceed 150 tokens
- Conversation progresses logically through stages
- Context maintained across multiple interactions
- Stage-specific prompts generate appropriate responses

---

## PHASE 2: FEATURE-SPECIFIC BUTTON SYSTEM
**Duration**: 1-2 hours  
**Objective**: Dynamic button generation based on project type  
**Dependencies**: Phase 1 complete  
**Risk Level**: Medium  

### Task 2.1: Todo App Feature Buttons
**Estimated Time**: 30 minutes  
**Assignee**: Development Team  
**Priority**: High  
**Dependencies**: Task 1.2 (project type detection)  

**Feature Categories**:

**Core Features (Primary buttons)**:
- [ ] "Task Management" - Add, edit, delete tasks
- [ ] "Due Dates & Priority" - Task scheduling and prioritization
- [ ] "Mark Complete" - Task completion system

**Standard Features (Suggest buttons)**:
- [ ] "Categories & Lists" - Organize tasks into groups
- [ ] "Search & Filter" - Find tasks easily  
- [ ] "Save Data" - Persistent storage
- [ ] "Task Descriptions" - Detailed task information

**Advanced Features (Secondary buttons)**:
- [ ] "Subtasks" - Break down complex tasks
- [ ] "Reminders" - Notification system
- [ ] "Dark/Light Theme" - UI customization
- [ ] "Drag & Drop" - Reorder tasks

**Acceptance Criteria**:
- Input "todo app" generates correct button set
- Buttons properly categorized by priority (primary/suggest/secondary)
- Button clicks update conversation state appropriately

### Task 2.2: Other Project Types  
**Estimated Time**: 45 minutes  
**Assignee**: Development Team  
**Priority**: High  
**Dependencies**: Task 2.1  

**Marketplace Features**:
- Core: Product Listings, User Accounts, Payment Processing
- Standard: Search & Browse, Reviews & Ratings, Order Tracking
- Advanced: Vendor Dashboard, Buyer-Seller Chat

**Social Platform Features**:
- Core: User Profiles, Activity Feed, Social Interactions
- Standard: Direct Messages, Follow/Friends, Content Creation  
- Advanced: Groups/Communities, Live Streaming

**Generic App Features** (fallback):
- Core: User Accounts, Data Storage
- Standard: Admin Dashboard, Search, Notifications

**Acceptance Criteria**:
- Each project type generates distinct, relevant button sets
- Feature selection accumulates properly
- Fallback to generic features when project type unclear

### Task 2.3: Button Interaction System
**Estimated Time**: 45 minutes  
**Assignee**: Development Team  
**Priority**: High  
**Dependencies**: Task 2.1, 2.2  

**Scope**:
- [ ] Handle button clicks to update extractedInfo.selectedFeatures
- [ ] Generate appropriate follow-up responses based on selections
- [ ] Build feature accumulation system (multiple selections)
- [ ] Provide selection feedback to user

**Technical Implementation**:
```typescript
interface FeatureSelection {
  id: string;
  label: string;
  category: 'core' | 'standard' | 'advanced';
  selected: boolean;
  description: string;
}

const handleFeatureSelection = (featureId: string, extractedInfo: any) => {
  const updatedFeatures = [...(extractedInfo.selectedFeatures || []), featureId];
  return {
    ...extractedInfo,
    selectedFeatures: updatedFeatures,
    stage: updatedFeatures.length >= 3 ? 'architecture' : 'requirements'
  };
};
```

**Acceptance Criteria**:
- Button clicks properly register feature selections
- Multiple features can be selected without conflict  
- Conversation progresses based on selection count
- User receives confirmation of selections

---

## PHASE 3: DOCUMENT GENERATION PIPELINE
**Duration**: 1 hour  
**Objective**: Proper Project Overview + Build Specifications generation  
**Dependencies**: Phase 2 complete  
**Risk Level**: Low  

### Task 3.1: Single Source of Truth Implementation
**Estimated Time**: 40 minutes  
**Assignee**: Development Team  
**Priority**: High  
**Dependencies**: Task 2.3 (feature selection)  

**Scope**:
- [ ] Generate Project Overview from selected features and conversation context
- [ ] Generate Build Specifications from technical requirements
- [ ] Ensure both documents update simultaneously
- [ ] Implement document versioning and history

**Document Structure**:

**Project Overview**:
```typescript
interface ProjectOverview {
  name: string;
  description: string;
  targetUsers: string;
  keyFeatures: string[];
  problemSolved: string;
  successMetrics: string[];
  userJourneys: string[];
}
```

**Build Specifications**:
```typescript
interface BuildSpecifications {
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    styling: string;
    authentication: string;
    deployment: string;
  };
  architecture: {
    pattern: string;
    description: string;
  };
  dataModels: string[];
  integrations: string[];
  securityRequirements: string[];
  performanceTargets: {
    pageLoadTime: string;
    apiResponseTime: string;
    uptime: string;
    concurrentUsers: string;
  };
}
```

**Acceptance Criteria**:
- Both documents generated when sufficient information gathered
- Documents reflect selected features accurately
- Technical specifications match project complexity
- Documents maintain consistency with each other

### Task 3.2: Visual Document Preview
**Estimated Time**: 20 minutes  
**Assignee**: Development Team  
**Priority**: Medium  
**Dependencies**: Task 3.1  

**Scope**:
- [ ] Update LiveDocumentPreview to display both documents
- [ ] Real-time updates as features are selected
- [ ] Progressive disclosure of document sections
- [ ] Export/download functionality

**Technical Requirements**:
- Support for dual-document view (Overview + Specifications)
- Live updates without page refresh
- Section-by-section completion indicators
- Document export in multiple formats

**Acceptance Criteria**:
- Both documents visible in left panel
- Documents update in real-time during conversation
- Clear progress indicators for document completion
- Professional document formatting and structure

---

## PHASE 4: COMPREHENSIVE TESTING & VALIDATION
**Duration**: 30 minutes  
**Objective**: Validate complete flow works end-to-end  
**Dependencies**: Phase 3 complete  
**Risk Level**: Low  

### Task 4.1: End-to-End Test Scenarios
**Estimated Time**: 30 minutes  
**Assignee**: QA Team  
**Priority**: High  
**Dependencies**: All previous phases  

**Test Scenarios**:

**Scenario A: Todo App Flow**:
1. [ ] User input: "I want to build a todo app"
2. [ ] System identifies project type correctly
3. [ ] Displays todo-specific feature buttons
4. [ ] User selects 3-4 core features
5. [ ] System generates both Project Overview and Build Specifications
6. [ ] Documents contain relevant todo app information
7. [ ] Tech stack recommendations appropriate for todo app

**Scenario B: Marketplace Flow**:
1. [ ] User input: "Build a marketplace for handmade goods"
2. [ ] System identifies marketplace project type
3. [ ] Displays marketplace-specific features (payments, reviews, etc.)
4. [ ] User selects mix of core and advanced features
5. [ ] Documents generated with marketplace-specific content
6. [ ] Build specs include e-commerce integrations

**Scenario C: Social Platform Flow**:
1. [ ] User input: "Social media app for developers"
2. [ ] System identifies social platform type
3. [ ] Displays social features (profiles, feeds, messaging)
4. [ ] User selects developer-focused features
5. [ ] Documents reflect social platform architecture
6. [ ] Tech stack includes real-time capabilities

**Performance Requirements**:
- [ ] Each conversation turn completes within 3 seconds
- [ ] AI responses under 150 tokens consistently
- [ ] Document generation within 5 seconds
- [ ] No JavaScript errors in browser console
- [ ] Mobile responsive design works correctly

**Acceptance Criteria**:
- All three test scenarios pass without manual intervention
- Performance requirements met consistently  
- No critical bugs or user experience issues
- System handles edge cases gracefully

---

## Success Metrics & Validation

### Quantitative Metrics:
- **Response Time**: API responses < 3 seconds (target: < 1 second)
- **Token Usage**: AI responses ≤ 150 tokens (target: 100-120 tokens)
- **Completion Rate**: 90% of users complete onboarding flow
- **Feature Selection**: Average 4-6 features selected per project
- **Document Quality**: Both documents generated 100% of time when flow completed

### Qualitative Validation:
- [ ] Conversation feels natural and guided
- [ ] Feature buttons are relevant and helpful
- [ ] Generated documents are professional quality
- [ ] System matches documented AVCA pipeline behavior
- [ ] User can complete onboarding in 15-20 minutes as specified

### Technical Validation:
- [ ] No patchwork code - clean, maintainable implementation
- [ ] All components properly integrated
- [ ] Error handling for edge cases
- [ ] Proper logging and monitoring
- [ ] Code follows established patterns and conventions

---

## Risk Assessment & Mitigation

### High Risk Items:
1. **AI Response Quality** - Risk: Responses still too long or irrelevant
   - Mitigation: Implement strict token limits and test prompts extensively
   - Fallback: Manual prompt tuning with specific examples

2. **Feature Button Logic** - Risk: Wrong buttons generated for project types
   - Mitigation: Comprehensive test coverage for all project types
   - Fallback: Generic feature set as safe default

### Medium Risk Items:
1. **Document Generation** - Risk: Documents missing key information
   - Mitigation: Template-based generation with validation
   - Fallback: Partial documents better than no documents

2. **Integration Issues** - Risk: Frontend-backend communication breaks
   - Mitigation: API contract testing and validation
   - Fallback: Graceful degradation to basic functionality

### Low Risk Items:
1. **UI/UX Polish** - Risk: Interface not perfectly polished
   - Mitigation: Focus on core functionality first
   - Fallback: Basic functional interface acceptable for MVP

---

## Implementation Timeline

### Day 1 (4 hours):
- **Hours 1-2**: Phase 1 (Foundation Audit & Rebuild)
- **Hours 3-4**: Phase 2 (Feature-Specific Button System)

### Day 2 (2 hours):
- **Hour 1**: Phase 3 (Document Generation Pipeline)  
- **Hour 2**: Phase 4 (Comprehensive Testing & Validation)

### Milestone Checkpoints:
- **End of Hour 2**: Project type detection working correctly
- **End of Hour 4**: Feature buttons generating properly for all project types
- **End of Hour 5**: Both documents generating with real content
- **End of Hour 6**: Full end-to-end testing complete

---

## Post-Implementation Tasks

### Immediate (Week 1):
- [ ] Monitor user behavior and completion rates
- [ ] Collect feedback on generated documents quality
- [ ] Fine-tune AI prompts based on real usage
- [ ] Fix any critical bugs discovered in production

### Short Term (Month 1):
- [ ] Add more project types and feature sets
- [ ] Implement advanced document customization
- [ ] Add export/sharing functionality
- [ ] Integrate with next AVCA pipeline stages

### Long Term (Quarter 1):
- [ ] Machine learning for better project type detection
- [ ] Advanced conversation intelligence
- [ ] Multi-language support
- [ ] Enterprise-grade document generation

---

This Task Master plan provides a systematic approach to rebuild the onboarding system correctly, moving away from patchwork development to create a robust, maintainable solution that matches the documented vision.