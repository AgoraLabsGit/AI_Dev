# Vibe Lab Multi-Path Onboarding System - Implementation Guide V2

> **Document Location**: `vibe-lab-meta/development/onboarding/onboarding-implementation-guide-v2.md`  
> **Related Documents**: All onboarding documentation is located in the same directory

## 🎯 Overview

This guide provides developers with a complete blueprint for implementing Vibe Lab's AI-powered multi-path onboarding system. The system transforms various inputs (ideas, existing code, or documentation) into fully-specified applications through intelligent analysis and visual builders.

**Entry Points**:
1. **Fresh Start** (8-step flow, ~20 minutes)
2. **GitHub Import** (5-step flow, ~15 minutes)
3. **Code Migration** (6-step flow, ~18 minutes)
4. **Documentation Import** (4-step flow, ~12 minutes)

**End Result** (regardless of entry point):
- Project Overview document
- Build Specifications document
- Complete application structure
- Visual design system
- Migration plan (if applicable)

---

## 📚 Documentation Structure

All documentation is located at: `vibe-lab-meta/development/onboarding/`

### 1. **Multi-Path Implementation Roadmap** 
`multi-path-onboarding-specification.md`
*Start here for the big picture*
- Entry point architecture
- Integration points
- Implementation details
- Success metrics

### 2. **AVCA-DIAS Precursor Roadmap**
`avca-dias-precursor-roadmap.md`
*System preparation guide*
- Core system updates
- Integration layer
- UI components
- Implementation timeline

### 3. **AI Onboarding System**
`ai-onboarding-system-technical-specification.md`
*Core intelligence*
- Multi-source analysis
- Document generation
- Pattern matching
- Quick Actions

### 4. **Extended Onboarding Steps** 
`extended-onboarding-steps-technical-specification.md`
*Visual builders*
- Pages builder
- Sub-pages hierarchy
- Navigation designer
- Components builder
- Style system

### 5. **Real-Time Document Crafting**
`real-time-document-crafting-ui-technical-specification.md`
*Live generation interface*
- Split-screen layout
- Typewriter effect
- Section controls
- Master actions

### 6. **Quick Action System**
`quick-action-system-technical-specification.md`
*Universal interactions*
- Context-aware actions
- Multi-select patterns
- Keyboard shortcuts

---

## 🏗️ Architecture Overview

### Layout Structure
```
┌─────────────────────────────────────────────┐
│          Onboarding Header (Progress)        │
├─────────────────────────────────────────────┤
│                                             │
│  Entry Selection     OR    Active Flow      │
│  ┌─────────┐              ┌─────────────┐   │
│  │ Fresh   │              │Builder/Chat │   │
│  │ GitHub  │      →       │(60%/40%)    │   │
│  │ Code    │              │             │   │
│  │ Docs    │              │             │   │
│  └─────────┘              └─────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Flow Paths
```typescript
1. Fresh Start Flow
   GitHub Sign In → Project Overview → Build Specs → Pages → Sub-Pages → Navigation → Components → Styling

2. GitHub Import Flow
   GitHub Sign In → Repository Analysis → Generated Docs → Review → Pages → Navigation → Styling

3. Code Migration Flow
   GitHub Sign In → Code Upload → Analysis → Generated Docs → Review → Migration Plan → Styling

4. Documentation Import Flow
   GitHub Sign In → Doc Import → Mapping → Review → Pages → Components → Styling
```

---

## 🚀 Implementation Quick Start

### Phase 1: Entry System (Week 1)
```bash
# Core components
components/
├── onboarding/
│   ├── EntrySelection.tsx       # Entry point UI
│   ├── OnboardingLayout.tsx     # Adaptive layout
│   ├── ImportHandlers/          # Source handlers
│   └── AnalysisPipeline/       # Multi-source analysis
└── ui/
    └── QuickActionButton.tsx    # Universal actions
```

### Phase 2: Analysis System (Week 2)
```bash
# Analysis components
lib/
├── avca/
│   ├── analyzers/              # Source-specific analysis
│   ├── generators/             # Document generation
│   └── migration/              # Migration planning
└── dias/
    ├── intelligence/           # Pattern recognition
    ├── mapping/                # Structure mapping
    └── optimization/           # Migration optimization
```

### Phase 3: Visual Builders (Week 3)
```bash
# Builder components
components/onboarding/builders/
├── PageBuilder.tsx             # Page structure
├── NavigationBuilder.tsx       # Navigation system
├── ComponentBuilder.tsx        # Component design
└── StyleBuilder.tsx           # Visual styling
```

### Phase 4: Integration (Week 4)
- Connect all paths
- Implement validation
- Add analytics
- Polish UI/UX

---

## 💡 Key Implementation Principles

### 1. **Universal Context**
```typescript
interface OnboardingContext {
  entryType: 'fresh' | 'github' | 'code' | 'docs';
  stage: OnboardingStage;
  data: {
    analysis?: AnalysisResult;
    documents?: GeneratedDocs;
    migration?: MigrationPlan;
  };
}
```

### 2. **Adaptive UI**
```typescript
// Each stage adapts to entry type
const stageConfig = {
  'fresh': { showChat: true, showBuilder: true },
  'github': { showAnalysis: true, showPreview: true },
  'code': { showUpload: true, showAnalysis: true },
  'docs': { showImport: true, showMapping: true }
};
```

### 3. **Smart Defaults**
```typescript
// Pre-fill based on analysis
const defaults = {
  pages: inferPagesFromAnalysis(analysis),
  navigation: suggestNavigationStyle(analysis),
  components: mapExistingComponents(analysis),
  styling: extractCurrentStyle(analysis)
};
```

---

## 🔧 Technical Stack

### Required Dependencies
```json
{
  "dependencies": {
    "@dnd-kit/sortable": "^7.0.0",     // Drag-drop
    "framer-motion": "^10.0.0",        // Animations
    "zustand": "^4.0.0",               // State
    "react-hook-form": "^7.0.0",       // Forms
    "puppeteer": "^21.0.0",            // Analysis
    "@octokit/rest": "^19.0.0",        // GitHub
    "prettier": "^2.8.0"               // Code formatting
  }
}
```

### Database Schema
```prisma
model OnboardingSession {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?
  entryType   String   // fresh, github, code, docs
  stage       String
  context     Json     // Unified context
  analysis    Json?    // Analysis results
  migration   Json?    // Migration plan
  documents   Json?    // Generated docs
  structure   Json?    // App structure
}

model ProjectBlueprint {
  id          String   @id @default(cuid())
  projectId   String   @unique
  entryType   String
  overview    Json     // Project docs
  specs       Json     // Build specs
  structure   Json     // App structure
  migration   Json?    // Migration data
}
```

---

## ⚡ Quick Reference

### Component Hierarchy
```
MultiPathOnboarding
├── EntrySelection (initial)
├── OnboardingHeader (progress)
├── OnboardingLayout (adaptive)
│   ├── AnalysisPipeline (github/code/docs)
│   ├── VisualBuilder (all paths)
│   └── OnboardingChat (fresh path)
└── OnboardingFooter (navigation)
```

### State Management
```typescript
interface OnboardingStore {
  // Core state
  entryType: EntryType;
  currentStage: Stage;
  context: OnboardingContext;
  
  // Path-specific state
  analysis?: AnalysisResult;
  migration?: MigrationPlan;
  documents?: GeneratedDocs;
  
  // Common state
  structure: AppStructure;
  styling: StyleConfig;
  
  // Actions
  setEntryType: (type: EntryType) => void;
  updateStage: (stage: Stage) => void;
  updateContext: (context: Partial<OnboardingContext>) => void;
  generateBlueprint: () => Promise<Blueprint>;
}
```

---

## 🎯 Success Metrics

### Performance
- Entry analysis < 30s
- Document generation < 2s
- Migration planning < 60s
- UI interactions < 100ms

### Quality
- 100% Tailwind compliance
- 95% analysis accuracy
- 90% migration success
- Zero style conflicts

### User Experience
- Clear path selection
- Intuitive progression
- Helpful assistance
- Smooth transitions

---

## 📋 Implementation Checklist

### Week 1: Entry System
- [ ] Build EntrySelection component
- [ ] Create source handlers
- [ ] Implement analysis pipeline
- [ ] Set up unified context

### Week 2: Analysis System
- [ ] Build GitHub analyzer
- [ ] Create code analyzer
- [ ] Implement doc parser
- [ ] Set up migration planner

### Week 3: Visual Builders
- [ ] Enhance page builder
- [ ] Update navigation builder
- [ ] Improve component builder
- [ ] Add style analyzer

### Week 4: Integration
- [ ] Connect all systems
- [ ] Add validation
- [ ] Implement analytics
- [ ] Polish UI/UX

---

## 🚨 Common Pitfalls

1. **Analysis Timeouts** - Handle long-running analysis
2. **Invalid Sources** - Validate all inputs thoroughly
3. **Migration Complexity** - Set clear scope boundaries
4. **Context Loss** - Maintain state across paths
5. **UI Consistency** - Keep experience unified

---

## 📞 Getting Help

- **Architecture**: See Multi-Path Specification
- **AVCA/DIAS**: Check Precursor Roadmap
- **UI Components**: Reference builder specs
- **Migration**: Review migration guides

---

*This onboarding system is the user's first experience with Vibe Lab. Make it magical, intuitive, and empowering. The goal is to transform any input into a professional application blueprint efficiently, regardless of the starting point.*