# Tier-3 Master: Git & Version Control

**Last Updated**: [Date]
**Status**: Active

---

## 1. **Philosophy**

We use Git for everything. It is the history of our project, our safety net, and our collaboration backbone. Every significant change is tracked. We use a feature-branch workflow with Pull Requests to ensure quality and maintain a clean `main` branch.

## 2. **The GitHub Integration Protocol**

For the AI-First Development System to function at maximum capacity, it must be connected to a GitHub repository.

**Human Operator Instructions:**
1.  **Create a Repository**: Create a new, empty repository on GitHub.
2.  **Connect Locally**: Follow the instructions from GitHub to push the existing local repository to the remote.
    ```bash
    git remote add origin [YOUR_REPOSITORY_URL]
    git branch -M main
    git push -u origin main
    ```
3.  **Connect Cursor to GitHub**: In Cursor's settings (`Tools & Integrations`), connect your GitHub account. This gives the AI enhanced context of the entire repository.
4.  **Enable Background Agents (Recommended)**: For larger projects, enabling Background Agents in Cursor's settings can improve performance.

## 3. **Branching Strategy**

-   **`main`**: This branch is considered production-ready. All changes must come through an approved Pull Request. Direct pushes are disabled.
-   **Feature Branches**: All new work (features, fixes, chores) must be done on a dedicated feature branch.
    -   **Naming Convention**: `[type]/[short-description]`
    -   **Examples**:
        -   `feat/user-login-page`
        -   `fix/header-layout-bug`
        -   `docs/update-readme`

## 4. **Commit Protocol: AI-Powered by SuperClaude**

**AI Developer Instructions:**
All commits will be generated using the `SuperClaude Framework` to ensure consistency, clarity, and quality.

1.  **Staging Changes**: Ensure all intended changes for the commit are staged using `git add .` or by selecting them in the source control panel.

2.  **Generating the Commit**:
    *   Execute the command: `/sc:commit`
    *   This command analyzes your staged changes, understands their intent, and generates a perfect, Conventional Commits-compliant message.

3.  **Submission**: After the commit is created, you will push the feature branch and create a Pull Request for the human Strategist to review.

---
*This protocol ensures our project history is clean, understandable, and that we leverage the full power of AI to maintain quality and accelerate our workflow.* 