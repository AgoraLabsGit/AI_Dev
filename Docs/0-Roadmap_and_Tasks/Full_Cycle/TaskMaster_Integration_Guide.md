# TaskMaster Integration Guide for Vibe Lab Roadmaps

**Document Type**: Technical Integration Guide  
**Created**: 2025-01-08  
**Purpose**: Detailed guide for converting roadmaps into TaskMaster-compatible task structures

---

## Overview

This guide provides specific instructions for breaking down the Vibe Lab staged roadmaps into TaskMaster-compatible tasks, including task hierarchies, dependencies, and tracking mechanisms.

---

## TaskMaster Task Structure

### Hierarchy Levels

```
Project: Vibe Lab Development
└── Epic: Roadmap X
    └── Story: Phase XY
        └── Task: Specific Action
            └── Sub-task: Atomic Unit
```

### Task Template

```yaml
task:
  id: "VL-{roadmap}-{phase}-{number}"
  title: "Clear, action-oriented title"
  description: "Detailed description with context"
  type: "feature|bug|chore|spike"
  priority: "critical|high|medium|low"
  estimate: "hours (1-8)"
  assignee: "role or person"
  dependencies: ["task-id-1", "task-id-2"]
  acceptance_criteria:
    - "Specific measurable outcome"
    - "Test or validation method"
  tags: ["roadmap-1", "integration", "ai"]
```

---

## Roadmap 1: Foundation Stabilization Tasks

### Epic: VL-R1-FOUNDATION
**Description**: Fix critical disconnections and establish stable foundation

#### Story: VL-R1-P1A-CLEANUP
**Phase 1A**: Codebase Cleanup & Organization

```yaml
tasks:
  - id: "VL-R1-P1A-001"
    title: "Audit and remove experimental pages"
    description: "Identify and remove all unused pages in /app/experimental/"
    type: "chore"
    priority: "high"
    estimate: 4
    acceptance_criteria:
      - "All duplicate experimental pages removed"
      - "No broken imports remain"
      - "Git history preserved for reference"
    
  - id: "VL-R1-P1A-002"
    title: "Consolidate API endpoints"
    description: "Merge chat-basic, chat-simple, chat-staged into single endpoint"
    type: "chore"
    priority: "high"
    estimate: 6
    dependencies: ["VL-R1-P1A-001"]
    acceptance_criteria:
      - "Single /api/onboarding/chat endpoint"
      - "All features preserved"
      - "Backwards compatibility maintained"
    
  - id: "VL-R1-P1A-003"
    title: "Fix BaseService implementations"
    description: "Resolve BaseService type errors across all services"
    type: "bug"
    priority: "critical"
    estimate: 8
    acceptance_criteria:
      - "No TypeScript errors in service files"
      - "Consistent BaseService usage"
      - "All services properly typed"
```

#### Story: VL-R1-P1B-INTEGRATION
**Phase 1B**: Critical Integration Fixes

```yaml
tasks:
  - id: "VL-R1-P1B-001"
    title: "Connect Zustand store to onboarding API"
    description: "Integrate onboarding-store.ts with API endpoints"
    type: "feature"
    priority: "critical"
    estimate: 8
    dependencies: ["VL-R1-P1A-002"]
    acceptance_criteria:
      - "Project data persists to store"
      - "Knowledge accumulates across sessions"
      - "Store state survives refresh"
    sub_tasks:
      - "Create store integration helper"
      - "Update API to use store"
      - "Add store persistence logic"
      - "Test session continuity"
    
  - id: "VL-R1-P1B-002"
    title: "Build unified intelligence router"
    description: "Create system to route between AVCA, DIAS, and SuperClaude"
    type: "feature"
    priority: "critical"
    estimate: 12
    acceptance_criteria:
      - "Single entry point for all AI requests"
      - "Intelligent routing based on context"
      - "Fallback mechanisms work"
      - "Performance metrics tracked"
```

---

## Roadmap 2: Feature Activation Tasks

### Epic: VL-R2-FEATURES
**Description**: Activate and connect sophisticated unused features

#### Story: VL-R2-P2A-DIAS
**Phase 2A**: DIAS System Activation

```yaml
tasks:
  - id: "VL-R2-P2A-001"
    title: "Connect DIAS orchestrator to onboarding"
    description: "Enable DIAS AI orchestration in user flows"
    type: "feature"
    priority: "high"
    estimate: 6
    dependencies: ["VL-R1-P1B-002"]
    acceptance_criteria:
      - "DIAS responds to onboarding requests"
      - "Orchestrator properly initialized"
      - "Event system connected"
    
  - id: "VL-R2-P2A-002"
    title: "Enable pattern recognition engine"
    description: "Activate DIAS pattern recognition for code analysis"
    type: "feature"
    priority: "medium"
    estimate: 8
    acceptance_criteria:
      - "Patterns detected from codebase"
      - "Framework detection working"
      - "Results stored in knowledge base"
```

---

## Roadmap 3: UX Enhancement Tasks

### Epic: VL-R3-UX
**Description**: Transform UI/UX into professional platform

#### Story: VL-R3-P3A-NAVIGATION
**Phase 3A**: Navigation & Information Architecture

```yaml
tasks:
  - id: "VL-R3-P3A-001"
    title: "Implement all navigation routes"
    description: "Build out all routes defined in navConfig"
    type: "feature"
    priority: "high"
    estimate: 8
    acceptance_criteria:
      - "All 9 main routes functional"
      - "Proper route guards in place"
      - "Navigation state persisted"
    sub_tasks:
      - "Dashboard route implementation"
      - "Plan section with sub-routes"
      - "Build section with stages"
      - "Preview environment setup"
      - "Test suite navigation"
```

---

## TaskMaster Configuration

### Project Setup

```bash
# Initialize TaskMaster project
taskmaster init vibe-lab-development

# Import roadmap structure
taskmaster import roadmaps/staged-development-roadmaps.yaml

# Configure project settings
taskmaster config set project.stages "planning,in-progress,review,done"
taskmaster config set project.priorities "critical,high,medium,low"
taskmaster config set project.task-types "feature,bug,chore,spike"
```

### Sprint Planning

```yaml
# Sprint 1: Foundation Critical Path
sprint:
  number: 1
  duration: 2 weeks
  goals:
    - "Complete codebase cleanup"
    - "Fix critical integrations"
  tasks:
    - "VL-R1-P1A-001"
    - "VL-R1-P1A-002"
    - "VL-R1-P1A-003"
    - "VL-R1-P1B-001"
  capacity:
    developers: 2
    hours_per_dev: 80
    total_capacity: 160
```

### Dependency Management

```yaml
# Critical path dependencies
dependencies:
  # Nothing can start until cleanup is done
  - from: "VL-R1-P1A-*"
    to: "VL-R1-P1B-*"
    type: "finish-to-start"
  
  # DIAS needs intelligence router
  - from: "VL-R1-P1B-002"
    to: "VL-R2-P2A-*"
    type: "finish-to-start"
  
  # UI work can start after navigation
  - from: "VL-R3-P3A-001"
    to: "VL-R3-P3B-*"
    type: "finish-to-start"
```

---

## Task Estimation Guidelines

### Complexity Factors

```yaml
simple_task: # 1-2 hours
  - "Update configuration"
  - "Fix simple bug"
  - "Add single test"

medium_task: # 3-4 hours
  - "Implement single feature"
  - "Refactor module"
  - "Create documentation"

complex_task: # 5-8 hours
  - "Build new service"
  - "Major integration"
  - "System architecture change"

spike_task: # Time-boxed research
  - "Investigate technology"
  - "Prototype solution"
  - "Performance analysis"
```

### Estimation Formula

```
Base Estimate = Complexity Hours
+ Integration Factor (0-2 hours)
+ Testing Factor (25% of base)
+ Documentation Factor (1 hour)
= Total Estimate
```

---

## Progress Tracking

### Daily Standup Template

```markdown
## Date: YYYY-MM-DD

### Yesterday
- Completed: [task IDs]
- Progress: [task IDs and %]

### Today
- Starting: [task IDs]
- Continuing: [task IDs]
- Blockers: [issues]

### Metrics
- Sprint burndown: X/Y hours
- Roadmap progress: X%
- Blockers: N
```

### Weekly Reporting

```yaml
weekly_report:
  week_number: X
  roadmap: "Roadmap 1"
  phase: "Phase 1A"
  metrics:
    tasks_completed: 15
    tasks_in_progress: 5
    tasks_blocked: 2
    hours_spent: 120
    hours_remaining: 280
  highlights:
    - "Major integration completed"
    - "Performance improved by 50%"
  risks:
    - "Resource availability next week"
    - "Dependency on external service"
```

---

## Automation Scripts

### Task Generation Script

```python
# generate_tasks.py
import yaml
import json

def generate_tasks_from_roadmap(roadmap_file, output_format='taskmaster'):
    """Convert roadmap markdown to TaskMaster tasks"""
    
    with open(roadmap_file, 'r') as f:
        roadmap_content = f.read()
    
    # Parse roadmap structure
    tasks = []
    current_epic = None
    current_story = None
    
    for line in roadmap_content.split('\n'):
        if line.startswith('## Roadmap'):
            current_epic = extract_epic(line)
        elif line.startswith('### Phase'):
            current_story = extract_story(line)
        elif line.startswith('- '):
            task = extract_task(line, current_epic, current_story)
            tasks.append(task)
    
    if output_format == 'taskmaster':
        return format_for_taskmaster(tasks)
    else:
        return format_as_yaml(tasks)
```

### Import Command

```bash
# Import all roadmap tasks
python generate_tasks.py \
  --roadmap ./Staged_Development_Roadmaps.md \
  --output ./taskmaster-import.yaml

# Import to TaskMaster
taskmaster import ./taskmaster-import.yaml \
  --project vibe-lab \
  --create-epics \
  --create-stories \
  --assign-ids
```

---

## Best Practices

### Task Creation
1. **Atomic Tasks**: Each task should be completable in one day or less
2. **Clear Outcomes**: Acceptance criteria must be measurable
3. **Dependencies**: Explicitly state all dependencies
4. **Documentation**: Include links to relevant docs in task description

### Sprint Planning
1. **Capacity Planning**: Account for meetings, reviews, and context switching
2. **Buffer Time**: Add 20% buffer for unknowns
3. **Priority Focus**: Complete critical path items first
4. **Daily Check-ins**: Quick sync to identify blockers early

### Progress Tracking
1. **Update Daily**: Keep task status current
2. **Track Time**: Log actual vs estimated hours
3. **Document Blockers**: Record and escalate impediments
4. **Celebrate Wins**: Acknowledge completed milestones

---

## Integration Checklist

- [ ] TaskMaster installed and configured
- [ ] Project structure created
- [ ] All roadmaps imported as epics
- [ ] Tasks broken down to atomic level
- [ ] Dependencies mapped
- [ ] Team members assigned
- [ ] Sprint 1 planned
- [ ] Tracking dashboards set up
- [ ] Automation scripts deployed
- [ ] Team trained on process

---

## Support Resources

- **TaskMaster Documentation**: [link]
- **Vibe Lab Architecture**: `/Docs/3_Developmet/`
- **Sprint Planning Template**: `/templates/sprint-planning.yaml`
- **Task Examples**: `/examples/taskmaster-tasks/`