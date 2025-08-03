# Automated Task Status Updating

This document describes the automated workflow for keeping the Task Master's task list synchronized with development progress by analyzing Git commits.

## 1. Overview

The system uses an automated process, originally designed for an AI agent, to parse Git commit messages, identify task IDs and status changes, and update the authoritative task-tracking document. This ensures that the project status is always up-to-date without manual intervention.

## 2. The Workflow

The process can be triggered automatically (e.g., via a `post-commit` Git hook) or manually.

1.  **Analyze Recent Commits**: The system fetches recent Git commits, filtering for keywords that indicate task progress (e.g., `feat:`, `complete`, `fix:`).
2.  **Extract Task Information**: For each commit message, it uses regex to extract a Task ID (e.g., `P1.1`) and infers the new status (`completed`, `in_progress`, `blocked`) based on keywords.
3.  **Update Task Document Safely**:
    *   A backup of the current task document is created.
    *   The system reads the content and uses regex to find the line corresponding to the Task ID.
    *   It replaces the old status with the new, inferred status.
    *   The updated content is written to the file.
4.  **Auto-Commit Changes**: The system then automatically commits the updated task document, attributing the change to the automation.

<details>
<summary>View Technical Implementation Details</summary>

### Task & Status Detection

The system uses a combination of regex patterns and keyword matching to achieve a 90-95% accuracy rate.

*   **Task ID Patterns**: `P(\d+)\.(\d+)`, `Task (\d+)\.(\d+)`
*   **Status Keywords**:
    *   `completed`: ['complete', 'implement', 'feat:', 'finish', 'done']
    *   `in_progress`: ['wip:', 'working', 'fix:', 'partial', 'started']
    *   `blocked`: ['block', 'issue', 'error', 'fail', 'stuck']

*Example Commit Analysis*:
`"feat: complete P1.1 Project Scaffolding"` → Task: `P1.1`, Status: `completed`

### Safety Protocols

To prevent data loss, the process follows strict safety protocols:
*   **Backups**: A timestamped backup is created before every modification.
*   **Validation**: The system validates that the target file exists and is readable before attempting to write.
*   **Atomic Operations**: It writes changes to a temporary file first, then replaces the original file to prevent corruption in case of an interruption.
*   **Attribution**: All automated commits are clearly marked as such, often with a `Co-Authored-By` trailer for the automation system.

</details>
