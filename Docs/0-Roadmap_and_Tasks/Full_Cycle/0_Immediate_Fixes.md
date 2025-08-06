# Week 0: Immediate Fixes & Critical Preparations

**Timeline**: Before Week 1 (3-5 days)  
**Priority**: 🔴 CRITICAL - Must complete before starting Roadmap 1  
**Version**: 1.0.0  
**Last Updated**: 2025-01-08

---

## Overview

Critical fixes and preparations that must be completed before beginning the main development roadmaps. These address showstopper issues and establish essential foundations.

**WHO**: DevOps + Senior Developer  
**WHAT**: Emergency fixes and setup  
**WHERE**: Core infrastructure and tooling

---

## Critical Issues to Address

### 1. Knowledge Persistence Hotfix
**Priority**: 🚨 SHOWSTOPPER  
**Time**: 4-6 hours

```typescript
// Current: Data generated but lost
// Target: Minimal persistence until proper fix in Roadmap 1

// Quick fix for /app/api/onboarding/chat/route.ts
import { writeFileSync } from 'fs';

// Add after generating projectOverview
if (projectOverview) {
  // Temporary file-based persistence
  const tempPath = `/tmp/vibe-lab-session-${sessionId}.json`;
  writeFileSync(tempPath, JSON.stringify({
    projectOverview,
    buildSpecifications,
    timestamp: new Date()
  }));
}
```

**Tasks**:
- [ ] VL-W0-001: Add temporary session persistence
- [ ] VL-W0-002: Create session recovery mechanism
- [ ] VL-W0-003: Add error handling for failed saves

**See Also**: 
- `/Docs/3_Developmet/1_Architecture/Knowledge_Architecture.md` - 5-level taxonomy
- `/Docs/3_Developmet/2_Process/Single_Source_of_Truth_Implementation.md`

---

### 2. Git Configuration & Standards
**Priority**: 🔴 HIGH  
**Time**: 2-3 hours

**Tasks**:
- [ ] VL-W0-004: Set up .gitmessage template
- [ ] VL-W0-005: Configure pre-commit hooks
- [ ] VL-W0-006: Create branch protection rules
- [ ] VL-W0-007: Document Git workflow

**Implementation**:
```bash
# .gitmessage
# [Type] Brief description (50 chars max)
# |<----  Using a maximum of 50 characters  ---->|

# Explain why this change is being made
# |<----   Try to limit each line to 72 characters   ---->|

# Type can be:
#   feat     (new feature)
#   fix      (bug fix)
#   docs     (changes to documentation)
#   style    (formatting, missing semicolons, etc.)
#   refactor (refactoring production code)
#   test     (adding tests, refactoring tests)
#   chore    (updating tasks, configs, etc.)
```

**See Also**: `/Docs/3_Developmet/2_Process/Git_Version_Control.md`

---

### 3. Development Environment Setup
**Priority**: 🔴 HIGH  
**Time**: 2-3 hours

**Tasks**:
- [ ] VL-W0-008: Create .env.example with all required vars
- [ ] VL-W0-009: Set up local development database
- [ ] VL-W0-010: Configure ESLint and Prettier
- [ ] VL-W0-011: Create development setup script

**Setup Script** (`scripts/setup-dev.sh`):
```bash
#!/bin/bash
# Development environment setup

echo "🚀 Setting up Vibe Lab development environment..."

# Check Node version
required_node="18.0.0"
current_node=$(node -v | cut -d'v' -f2)
if [ "$(printf '%s\n' "$required_node" "$current_node" | sort -V | head -n1)" != "$required_node" ]; then
    echo "❌ Node.js $required_node or higher required"
    exit 1
fi

# Install dependencies
npm install

# Copy environment files
cp .env.example .env.local

# Set up database
npm run db:setup

# Configure git hooks
npm run prepare

echo "✅ Development environment ready!"
```

---

### 4. Migration Strategy Documentation
**Priority**: 🟡 MEDIUM  
**Time**: 2 hours

**Tasks**:
- [ ] VL-W0-012: Catalog all experimental code
- [ ] VL-W0-013: Create migration checklist
- [ ] VL-W0-014: Document deprecation strategy

**Migration Plan**:
```markdown
## Experimental Code Migration

### Phase 1: Catalog (Week 0)
- List all `/app/experimental/*` pages
- Identify which have production equivalents
- Mark for: KEEP, MIGRATE, or DELETE

### Phase 2: Migrate (Week 1)
- Extract useful code from experimental
- Update imports in dependent files
- Add deprecation notices

### Phase 3: Archive (Week 2)
- Move to `/archived/experimental-YYYY-MM-DD/`
- Update documentation
- Remove from build
```

---

### 5. Basic Monitoring Setup
**Priority**: 🟡 MEDIUM  
**Time**: 3-4 hours

**Tasks**:
- [ ] VL-W0-015: Add basic error logging
- [ ] VL-W0-016: Set up health check endpoint
- [ ] VL-W0-017: Create performance baseline

**Health Check Implementation**:
```typescript
// /app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      ai: await checkAIService(),
      storage: await checkStorage()
    }
  };
  
  const allHealthy = Object.values(health.services)
    .every(s => s.status === 'healthy');
  
  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503
  });
}
```

**See Also**: `/Docs/3_Developmet/3_Execution/Development_Execution_Systems.md`

---

## Success Criteria

### Must Complete ✅
- [ ] Session data persists (even temporarily)
- [ ] Git workflow configured and documented
- [ ] Development environment reproducible
- [ ] Migration strategy documented
- [ ] Basic monitoring operational

### Nice to Have 🎯
- [ ] Automated setup script working
- [ ] Performance baseline established
- [ ] Team onboarding guide created

---

## Validation Checklist

Before proceeding to Roadmap 1:

1. **Knowledge Persistence**
   - [ ] Can save session data
   - [ ] Can recover from refresh
   - [ ] Error handling works

2. **Development Standards**
   - [ ] Git hooks active
   - [ ] ESLint running
   - [ ] Branch protection enabled

3. **Environment**
   - [ ] New developer can set up in <30 min
   - [ ] All dependencies documented
   - [ ] Database migrations work

4. **Monitoring**
   - [ ] Health endpoint responds
   - [ ] Errors are logged
   - [ ] Performance metrics captured

---

## Team Assignments

| Task Range | Assignee | Role |
|------------|----------|------|
| VL-W0-001 to 003 | Senior Dev | Knowledge persistence |
| VL-W0-004 to 007 | DevOps | Git configuration |
| VL-W0-008 to 011 | Full Stack | Environment setup |
| VL-W0-012 to 014 | Tech Lead | Migration strategy |
| VL-W0-015 to 017 | DevOps | Monitoring |

---

## Risk Mitigation

### If Session Persistence Fails
- Use browser localStorage as backup
- Implement manual export/import
- Document data recovery process

### If Git Hooks Cause Issues
- Make hooks optional initially
- Provide override instructions
- Phase in enforcement gradually

### If Setup Script Fails
- Provide manual setup steps
- Create platform-specific guides
- Add troubleshooting section

---

## Next Steps

After completing Week 0:
1. Team standup to confirm all items complete
2. Knowledge transfer on temporary fixes
3. Begin Roadmap 1: Foundation Stabilization
4. Schedule Week 1 sprint planning

---

## Change Log

### Version 1.0.0 (2025-01-08)
- Initial version
- Added knowledge persistence hotfix
- Included Git standards setup
- Added migration strategy
- Included basic monitoring