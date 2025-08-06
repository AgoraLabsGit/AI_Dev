# Vibe Lab Design Decisions

**Document Type**: Architectural Decisions Record (ADR)  
**Status**: Active  
**Created**: 2025-01-05  
**Purpose**: Document key design decisions, rationale, and trade-offs for the Vibe Lab platform

---

## 1. Persistence Model: Projects, Not Sessions

### Decision
Use a **project-based persistence model** with indefinite storage, not temporary sessions.

### Rationale
- Users build real projects that need permanent storage
- Supports iterative development over months/years
- Aligns with "living documents" philosophy
- Enables full history tracking and rollback

### Implementation
```typescript
interface VibeLabProject {
  projectId: string;          // Permanent identifier
  documents: {                // Living, versioned documents
    projectOverview: ProjectOverview;
    buildSpecifications: BuildSpecifications;
    versionHistory: DocumentVersion[];
  };
  conversations: Thread[];    // All interactions preserved
  createdAt: Date;           // Never expires
}
```

### Trade-offs
- ✅ Complete history preservation
- ✅ True Single Source of Truth
- ❌ Higher storage costs
- ❌ Privacy considerations

---

## 2. Storage Duration: Indefinite with User Control

### Decision
Projects persist **indefinitely** with user-controlled archiving and deletion.

### Rationale
- Software projects have long lifecycles
- Users need to return after months
- Data sovereignty - users own their data
- Storage is cheap compared to lost work

### Implementation
- Soft delete with 30-day recovery
- Archive for inactive projects (1 year)
- Export before hard delete
- GDPR-compliant data controls

---

## 3. Import/Export Capabilities: Full Support

### Decision
Support comprehensive import/export for all data formats.

### Rationale
- Users work with existing codebases
- Platform independence
- Backup and migration needs
- Integration with external tools

### Supported Formats
```typescript
// Import
- GitHub repositories (via API)
- Local codebases (ZIP upload, up to 500MB)
- Individual files (drag & drop)
- Requirements docs (PDF, MD, DOCX)

// Export  
- JSON (complete project state)
- Markdown (documentation)
- Code (generated files)
- PDF (reports)
```

---

## 4. Server-Side Persistence: Hybrid Approach

### Decision
Use **hybrid persistence** with local-first, server-sync architecture.

### Rationale
- Local: Fast, offline-capable, privacy-preserving
- Server: Backup, sync, collaboration, recovery
- Best of both worlds

### Architecture
```
┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  PostgreSQL  │
│ (Primary)   │     │  (Backup)    │
│  Zustand    │◀────│   Sync API   │
└─────────────┘     └──────────────┘
```

### Sync Strategy
- Real-time sync when online
- Conflict resolution: Last-write-wins
- Offline queue for changes
- Periodic consistency checks

---

## 5. Concurrent Projects: Multiple Active Projects

### Decision
Support **multiple active projects** with quick switching.

### Rationale
- Developers work on multiple projects
- Agencies manage client projects
- Comparison between approaches
- Portfolio management

### UI/UX Design
```
┌──────────────────────────┐
│ Projects (⌘K)           │
├──────────────────────────┤
│ ▶ Active: Todo App MVP   │
│ ○ E-commerce Platform    │
│ ○ Social Network         │
│ ─────────────────────    │
│ + New Project            │
└──────────────────────────┘
```

---

## 6. AI Extraction Confidence: Explicit Uncertainty

### Decision
Implement **confidence scoring** for all AI extractions with user confirmation for low-confidence items.

### Rationale
- Prevents incorrect assumptions
- Builds user trust
- Allows corrections early
- Improves over time

### Implementation
```typescript
interface ExtractedData {
  value: any;
  confidence: number;      // 0.0 - 1.0
  source: 'explicit' | 'inferred' | 'default';
  needsConfirmation: boolean;  // if confidence < 0.7
}

// UI shows uncertainty
"Project Type: Web App (90% confident) ✓"
"Framework: Next.js (60% confident) ?"
```

### Thresholds
- **>0.9**: Auto-accept
- **0.7-0.9**: Show confidence
- **<0.7**: Require confirmation

---

## 7. Document Change Cascades: Controlled Re-evaluation

### Decision
Document updates trigger **controlled re-evaluation** with user approval for major changes.

### Rationale
- Maintains consistency
- Prevents cascade loops
- Preserves user intent
- Enables safe iteration

### Implementation
```typescript
interface DocumentChange {
  type: 'minor' | 'major' | 'breaking';
  impacts: string[];       // Affected components
  requiresReview: boolean;
}

// Change Queue System
- Batch changes (30 second window)
- Impact analysis before execution
- User approval for breaking changes
- Rollback capability
```

### Re-evaluation Rules
- **Auto**: Typos, formatting
- **Suggested**: Feature additions
- **Required Approval**: Architecture changes

---

## 8. Session Branching: Future Enhancement

### Decision
Implement **session branching** in Phase 4 to support non-linear exploration.

### Rationale
- Prevents premature commitment
- Enables "what-if" scenarios
- Preserves all exploration
- Natural for iterative development

### Concept
```
Project Main
├── Branch: MVP Version
├── Branch: Enterprise Version
└── Branch: Mobile-First Approach
```

### Implementation Deferred
- Focus on core persistence first
- Design for branching compatibility
- User research before building

---

## 9. Codebase Analysis Depth

### Decision
Support **full codebase upload and analysis** without artificial limits.

### Rationale
- Complete understanding needed
- Modern tools handle large codebases
- Users expect comprehensive analysis
- Competitive advantage

### Technical Approach
- Stream processing for large files
- Ignore generated files (node_modules)
- Progressive analysis with quick results
- Background deep analysis

---

## Cross-References

- **Single Source of Truth Implementation**: Technical details of persistence
- **Development Process**: How decisions align with core philosophy
- **Technical Reference**: Implementation specifications
- **Task Master Plans**: Implementation priorities

---

## Decision Log

| Date | Decision | Rationale | Status |
|------|----------|-----------|---------|
| 2025-01-05 | Projects not sessions | Permanent storage needed | Approved |
| 2025-01-05 | Indefinite persistence | Long project lifecycles | Approved |
| 2025-01-05 | Confidence scoring | Prevent AI over-commitment | Approved |
| 2025-01-05 | Controlled cascades | Consistency with safety | Approved |

---

This document is living and will be updated as new design decisions are made.