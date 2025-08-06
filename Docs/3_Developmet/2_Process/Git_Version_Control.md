# Git Version Control & GitHub Integration

**Document Type**: Process & Standards  
**Status**: Authoritative  
**Created**: 2025-01-05  
**Updated**: Current  
**Purpose**: Define Git workflows, version control standards, and GitHub integration protocols for Vibe Lab development

---

## Executive Summary

This document establishes the version control standards and Git workflows for Vibe Lab development. It covers branching strategies, commit conventions, GitHub integration, and the "Run Updates and Push" protocol that ensures consistent project state management.

---

## 1. Git Workflow Standards

### 1.1 GitHub Flow

**Core Principle**: `main` is the source of truth; all work is done in feature branches.

```
main (protected)
├── feature/user-authentication
├── feature/payment-integration
├── fix/login-validation
└── docs/update-readme
```

### 1.2 Branch Naming Conventions

```bash
# Feature branches
feature/descriptive-feature-name
feature/issue-123-user-authentication

# Bug fix branches
fix/descriptive-bug-fix
fix/issue-456-login-validation

# Documentation branches
docs/update-component-guide
docs/api-documentation

# Refactor branches
refactor/optimize-database-queries
refactor/component-structure

# Experimental branches
experiment/new-ai-model
experiment/performance-optimization
```

### 1.3 Protected Branches

- **main**: Production-ready code only
- **develop** (optional): Integration branch for larger teams
- Requires pull request reviews before merging
- Automated CI/CD checks must pass

---

## 2. Commit Standards

### 2.1 Conventional Commits

All commit messages MUST follow the Conventional Commits specification:

```bash
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 2.2 Commit Types

```bash
# Features
feat(auth): add JWT authentication
feat(ui): implement dark mode toggle

# Bug fixes
fix(api): resolve null pointer in user endpoint
fix(validation): correct email regex pattern

# Documentation
docs(readme): update installation instructions
docs(api): add endpoint examples

# Style changes
style(components): format button styles
style(global): update color variables

# Refactoring
refactor(auth): simplify token validation
refactor(database): optimize query performance

# Performance
perf(api): reduce response time by caching
perf(ui): lazy load images

# Tests
test(auth): add unit tests for login
test(e2e): add checkout flow tests

# Build/CI
build(deps): update dependencies
ci(github): add automated testing workflow

# Chores
chore(deps): update package versions
chore(scripts): add deployment script
```

### 2.3 Commit Message Examples

```bash
# Simple feature
feat(onboarding): add progress indicator

# With description
fix(validation): prevent XSS in user input

Sanitize all user inputs before rendering to prevent
cross-site scripting attacks. This affects all form
inputs across the application.

# With breaking change
feat(api)!: change authentication endpoint

BREAKING CHANGE: The /auth endpoint is now /api/v2/auth.
Update all client applications to use the new endpoint.

# With issue reference
fix(payment): resolve checkout timeout

Increase timeout from 30s to 60s to handle slow
payment provider responses.

Fixes #789
```

---

## 3. Documentation Synchronization Protocol

### 3.1 "Run Updates and Push" Protocol

**Purpose**: Maintain consistency across all project tracking documents and ensure GitHub repository reflects current state.

### 3.2 When to Execute

- After completing major features or development phases
- Before closing a work session
- When transitioning between development contexts
- After resolving critical issues
- Before handing off to another developer/AI agent

### 3.3 Required Steps

```bash
# Step 1: Update all tracking documents in sync
1. Update Docs/2_Logs/Continuity_of_Context.md
   - Current status and achievements
   - Next actions and priorities
   - Key references and context

2. Update vibe-lab-system/dev_logs.md (if present)
   - Development progress entries
   - Technical decisions made
   - Issues resolved

3. Update vibe-lab-system/comprehensive_taskmaster.md (if present)
   - Task completion status
   - New tasks identified
   - Priority adjustments

4. Update vibe-lab-system/roadmap_status.md (if present)
   - Phase completion status
   - Timeline adjustments
   - Milestone achievements

# Step 2: Stage all changes
git add .

# Step 3: Commit with clear, structured message
git commit -m "type(scope): description

- Bullet point summary of changes
- Key achievements
- Next steps identified"

# Step 4: Push to GitHub
git push origin main
```

### 3.4 Commit Message Format for Updates

```bash
feat(phase-X): Complete [feature/milestone name]

- ✅ [Achievement 1]
- ✅ [Achievement 2]
- 🔧 [Fix or improvement]
- 📋 Next: [Upcoming priority]
```

---

## 4. GitHub Integration

### 4.1 Repository Creation

Vibe Lab automatically creates GitHub repositories for generated projects:

```typescript
interface GitHubIntegration {
  // Repository creation
  createRepository(projectName: string): Promise<Repository>;
  
  // Initial setup
  initializeRepository(localPath: string): Promise<void>;
  addRemote(repoUrl: string): Promise<void>;
  
  // Code push
  pushInitialCode(branch: string = 'main'): Promise<void>;
  
  // Configuration
  setupBranchProtection(branch: string): Promise<void>;
  addWebhooks(webhooks: Webhook[]): Promise<void>;
}
```

### 4.2 GitHub Workflow Integration

- **One-click deployment**: Push generated code directly to GitHub
- **Branch protection**: Automatic setup of protection rules
- **CI/CD templates**: Include GitHub Actions workflows
- **Issue templates**: Bug reports, feature requests, etc.
- **PR templates**: Standardized pull request format

### 4.3 Repository Structure

```
project-name/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── src/
├── docs/
├── tests/
├── .gitignore
├── README.md
└── LICENSE
```

---

## 5. Version Control Best Practices

### 5.1 Atomic Commits

- Each commit should represent one logical change
- Commits should be self-contained and buildable
- Avoid mixing unrelated changes in one commit

### 5.2 Commit Frequency

- Commit early and often during development
- Don't wait until feature is complete
- Use WIP (Work In Progress) commits if needed

```bash
# WIP commit (to be squashed later)
git commit -m "WIP: partial implementation of auth flow"

# Squash before merging
git rebase -i HEAD~3
```

### 5.3 Code Review Process

1. **Create feature branch** from main
2. **Make changes** following coding standards
3. **Test locally** including unit and integration tests
4. **Push branch** to remote repository
5. **Create Pull Request** with description
6. **Code review** by team members
7. **Address feedback** with new commits
8. **Squash and merge** when approved

### 5.4 Handling Merge Conflicts

```bash
# Update your branch with latest main
git checkout main
git pull origin main
git checkout feature/your-branch
git rebase main

# Resolve conflicts
# Edit conflicted files
git add .
git rebase --continue

# Force push if needed (only on feature branches)
git push --force-with-lease origin feature/your-branch
```

---

## 6. Git Hooks & Automation

### 6.1 Pre-commit Hooks

```bash
# .git/hooks/pre-commit
#!/bin/sh

# Run linting
npm run lint

# Run tests
npm run test:unit

# Check commit message format
npm run commitlint
```

### 6.2 Commit Message Validation

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore']
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100]
  }
};
```

---

## 7. Emergency Procedures

### 7.1 Reverting Changes

```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Revert merge commit
git revert -m 1 <merge-commit-hash>
```

### 7.2 Recovery from Mistakes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Recover deleted branch
git reflog
git checkout -b recovered-branch <commit-hash>
```

### 7.3 Force Push Protection

Never force push to main or shared branches:

```bash
# Safe force push (checks remote hasn't changed)
git push --force-with-lease

# Dangerous (avoid on shared branches)
git push --force
```

---

## 8. Integration with Vibe Lab Systems

### 8.1 Automatic Git Operations

Vibe Lab handles Git operations automatically during:
- Project initialization
- Code generation completion
- Documentation updates
- Deployment preparation

### 8.2 Version Tracking

All generated code includes:
- Version metadata in package.json
- Generation timestamp
- Vibe Lab version used
- Source document versions

### 8.3 Rollback Support

```typescript
interface VersionControl {
  // Track generation history
  saveGenerationSnapshot(snapshot: GenerationSnapshot): void;
  
  // Rollback capabilities
  listSnapshots(): GenerationSnapshot[];
  rollbackToSnapshot(snapshotId: string): void;
  
  // Diff generation
  compareSnapshots(id1: string, id2: string): Diff;
}
```

---

## Conclusion

This Git version control system ensures consistent, traceable, and professional development practices across all Vibe Lab projects. By following these standards, teams can collaborate effectively while maintaining code quality and project history.