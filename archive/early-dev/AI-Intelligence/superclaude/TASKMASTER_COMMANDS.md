# TaskMaster SuperClaude Integration

SuperClaude `/task` command integration for TaskMaster functionality.

## Commands

### `/task analyze [project] [flags]`
**Purpose**: Generate comprehensive task breakdown from roadmap
**Auto-Persona**: Architect, Analyzer  
**MCP Integration**: Sequential (primary), Context7 (patterns)

**Usage**:
```bash
/task analyze "Vibe Lab MVP" --complexity high --team-size 4 --timeline 7w
/task analyze @docs/Documentation/Project_Roadmap.md --wave-mode --validate
/task analyze --update-existing --confidence-threshold 0.8
```

**Flags**:
- `--complexity [low|moderate|high|enterprise]`: Project complexity level
- `--team-size [n]`: Number of developers (affects resource allocation)
- `--timeline [Nw|Nd]`: Project timeline (weeks/days)
- `--framework [next|react|vue|angular]`: Primary framework for task optimization
- `--update-existing`: Update existing tasks.md file
- `--confidence-threshold [0.0-1.0]`: Minimum confidence for task estimates
- `--wave-mode`: Enable wave orchestration planning
- `--validate`: Include validation gates and quality checks

### `/task status [project] [flags]`
**Purpose**: Display current task status and progress
**Auto-Persona**: Analyzer, QA  
**MCP Integration**: Sequential (analysis), Playwright (testing metrics)

**Usage**:
```bash
/task status --critical-path --bottlenecks
/task status "P1.2" --dependencies --blockers  
/task status --dashboard --live-metrics
```

**Flags**:
- `--critical-path`: Show critical path analysis
- `--bottlenecks`: Identify current bottlenecks
- `--dependencies`: Show task dependencies
- `--blockers`: Identify blocking issues
- `--dashboard`: Generate status dashboard
- `--live-metrics`: Include real-time progress metrics

### `/task update [task-id] [flags]`
**Purpose**: Update task status, estimates, or details
**Auto-Persona**: Analyzer, DevOps  
**MCP Integration**: Sequential (validation), Context7 (patterns)

**Usage**:
```bash
/task update "P1.2" --status completed --hours-actual 14
/task update "P3.1" --complexity 5 --risk high --blockers "API integration"
/task update --bulk-status --from-git-commits
```

**Flags**:
- `--status [pending|in_progress|completed|blocked]`: Update task status
- `--hours-actual [n]`: Record actual hours spent
- `--complexity [1-5]`: Update complexity rating
- `--risk [low|medium|high]`: Update risk assessment
- `--blockers "description"`: Add blocking issues
- `--bulk-status`: Update multiple tasks from git history
- `--from-git-commits`: Auto-update based on commit messages

### `/task roadmap [action] [flags]`
**Purpose**: Roadmap generation and synchronization
**Auto-Persona**: Architect, Scribe  
**MCP Integration**: Sequential (planning), Context7 (patterns)

**Usage**:
```bash
/task roadmap generate --from-blueprint --wave-strategy systematic
/task roadmap sync --auto-update --git-hooks
/task roadmap validate --dependencies --timeline --resources
```

**Flags**:
- `--from-blueprint`: Generate from blueprint documents
- `--wave-strategy [progressive|systematic|adaptive|enterprise]`: Wave orchestration strategy
- `--auto-update`: Enable automatic updates
- `--git-hooks`: Install git hook automation
- `--validate`: Validate roadmap consistency

### `/task optimize [focus] [flags]`
**Purpose**: Task optimization and resource allocation
**Auto-Persona**: Performance, Architect  
**MCP Integration**: Sequential (optimization), Context7 (patterns)

**Usage**:
```bash
/task optimize --parallel-streams --mcp-distribution
/task optimize critical-path --reduce-dependencies --bottlenecks
/task optimize resources --balance-workload --skill-matching
```

**Flags**:
- `--parallel-streams`: Optimize for parallel execution
- `--mcp-distribution`: Optimize MCP server usage
- `--reduce-dependencies`: Minimize task dependencies
- `--bottlenecks`: Focus on bottleneck elimination
- `--balance-workload`: Balance team workload
- `--skill-matching`: Match tasks to team skills

## Integration Examples

### Automated Workflow
```bash
# Generate initial task analysis
/task analyze "Vibe Lab MVP" --complexity high --team-size 4 --wave-mode --validate

# Monitor progress
/task status --dashboard --live-metrics --critical-path

# Update as development progresses
/task update --bulk-status --from-git-commits

# Optimize when bottlenecks emerge
/task optimize critical-path --reduce-dependencies --parallel-streams
```

### Wave Orchestration Integration
```bash
# Enable wave mode for complex projects
/task analyze --wave-mode --wave-strategy systematic --validate

# Status with wave-specific metrics
/task status --wave-progress --validation-gates --checkpoint-status

# Wave-specific optimization
/task optimize --wave-delegation --compound-intelligence --checkpoint-validation
```

### Git Integration
```bash
# Set up automated updates
/task roadmap sync --auto-update --git-hooks

# Manual sync after major changes
/task roadmap sync --validate --update-estimates

# Status from git history
/task status --from-commits --velocity-metrics --completion-prediction
```

## API Integration

### Command → API Mapping
- `/task analyze` → `POST /api/v1/projects/{id}/tasks/analyze`
- `/task status` → `GET /api/v1/projects/{id}/tasks`
- `/task update` → `PUT /api/v1/projects/{id}/tasks`
- `/task roadmap` → `GET/POST /api/v1/projects/{id}/roadmap`
- `/task optimize` → `POST /api/v1/projects/{id}/tasks/optimize`

### Response Integration
Commands return structured data that integrates with:
- TodoWrite for progress tracking
- SuperClaude wave orchestration
- MCP server optimization
- Quality gate validation

## Error Handling

### Common Issues
- **TaskMaster API unavailable**: Fallback to cached analysis
- **Invalid project ID**: Auto-detect from git context
- **Dependency conflicts**: Suggest resolution strategies
- **Resource overallocation**: Rebalance recommendations

### Recovery Strategies
- Graceful degradation to manual task management
- Local task storage when API unavailable
- Alternative estimation methods for complex projects
- Fallback to simplified task structures

---

*TaskMaster SuperClaude integration provides intelligent project management with automated task analysis, resource optimization, and progress tracking.*