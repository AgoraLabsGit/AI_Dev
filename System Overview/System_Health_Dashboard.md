# System Health Dashboard

**Last Updated**: {{DATE}}  
**Status**: Automatically Generated

---

## 🎯 **OVERVIEW**

This dashboard provides a real-time overview of the AI-First Development System's performance and health. The metrics below are generated automatically by the `automation/scripts/generate_dashboard.py` script, which runs on a nightly basis.

---

## 🚀 **DEVELOPMENT VELOCITY**

| Metric | Current Week | Previous Week | Change |
| --- | :---: | :---: | :---: |
| **Tasks Completed** | `{{tasks_completed_current}}` | `{{tasks_completed_previous}}` | `{{tasks_completed_change}}` |
| **Avg. Time to Completion** | `{{avg_task_time_current}}` | `{{avg_task_time_previous}}` | `{{avg_task_time_change}}` |
| **Human Interventions** | `{{human_interventions_current}}` | `{{human_interventions_previous}}` | `{{human_interventions_change}}`|

---

## 🧠 **PATTERN INTELLIGENCE**

| Metric | Total | This Week |
| --- | :---: | :---: |
| **Total Patterns in Tier-2** | `{{total_patterns}}` | `{{new_patterns_week}}` |
| **Pattern Reuse Rate** | `{{pattern_reuse_rate}}%` | `{{pattern_reuse_rate_week}}%` |
| **Patterns Learned (Automated)** | `{{patterns_learned_total}}` | `{{patterns_learned_week}}` |

* **Pattern Reuse Rate**: Percentage of completed tasks that utilized at least one existing Tier-2 pattern.
* **Patterns Learned**: Number of new patterns successfully processed by the Automated Learning Loop.

### Newest Patterns This Week
- `{{newest_pattern_1}}`
- `{{newest_pattern_2}}`
- `{{newest_pattern_3}}`

---

## ✅ **SYSTEM QUALITY & HEALTH**

| Metric | Current Status |
| --- | :---: |
| **Automated Test Pass Rate** | `{{test_pass_rate}}%` |
| **Code Quality Score (Avg)** | `{{code_quality_score}}` |
| **Documentation Health** | `{{documentation_health}}%` |

* **Code Quality Score**: Average score from automated analysis tools (e.g., SonarQube, Qodo).
* **Documentation Health**: Percentage of Tier-2 patterns that have complete, up-to-date `.md` documentation files.

---

## 🤖 **AUTOMATION SPECIFICATION**

### **`generate_dashboard.py` Script**

This script is responsible for populating the dashboard. It should be run as a scheduled task (e.g., a nightly cron job or CI/CD pipeline).

**Data Sources:**
- **Task Master API / `tasks.json`**: To calculate task completion rates and times.
- **Git Repository History**: To analyze commit messages for human interventions (e.g., commits with a `fixup!` or `revert!` message that follow an AI-generated commit).
- **`intelligence/pattern-index.json`**: To count total patterns and identify new ones.
- **`logs/dev_log.md`**: To analyze task completion notes and calculate the pattern reuse rate.
- **`intelligence/learning-log.md`**: To count the number of patterns processed by the learning loop.
- **Automated Testing & Quality Tools**: To fetch the latest test pass rates and code quality scores.

**Workflow:**
1.  **Initialize**: Fetch the data from the previous week's dashboard for comparison.
2.  **Calculate Velocity Metrics**:
    -   Query the Task Master system for tasks completed in the current and previous week.
    -   Calculate the average completion time for each period.
    -   Analyze git history to count human interventions.
3.  **Calculate Intelligence Metrics**:
    -   Count the total number of entries in `intelligence/pattern-index.json`.
    -   Parse `logs/dev_log.md` to identify how many of this week's tasks referenced a Tier-2 pattern.
    -   Count new entries in `intelligence/learning-log.md`.
4.  **Calculate Quality Metrics**:
    -   Integrate with testing and quality analysis tools to fetch the latest scores.
    -   Scan the `tier-2-living-examples` directory to ensure every pattern has a corresponding `.md` file.
5.  **Generate Report**:
    -   Use a template engine (like Jinja2) to populate a new `System_Health_Dashboard.md` with the calculated metrics.
    -   The `{{VARIABLE}}` placeholders will be replaced with the actual data.
6.  **Commit and Push**: The script will automatically commit and push the updated dashboard to the repository.

---

*This dashboard is crucial for ensuring the AI-First Development System is achieving its goals of increased velocity, quality, and intelligence. Regular monitoring will enable continuous improvement of the overall system.* 