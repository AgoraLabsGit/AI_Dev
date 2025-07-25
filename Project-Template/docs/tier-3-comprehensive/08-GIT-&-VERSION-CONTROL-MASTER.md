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

## 4. **Commit Protocol**

**AI Developer Instructions:**
When you have completed a logical unit of work that is ready for review, you will be asked to commit the changes.

1.  **Conventional Commits**: Your commit messages **must** follow the Conventional Commits specification. This allows for automated versioning and clearer history.
    -   **Format**: `type(scope): subject`
    -   **Common Types**:
        -   `feat`: A new feature
        -   `fix`: A bug fix
        -   `docs`: Documentation only changes
        -   `style`: Code style changes (formatting, etc.)
        -   `refactor`: A code change that neither fixes a bug nor adds a feature
        -   `test`: Adding missing tests or correcting existing tests
        -   `chore`: Changes to the build process or auxiliary tools

2.  **Commit Message Body**: The body should provide more context about the change, explaining the "what" and "why".

3.  **Submission**: After committing, you will push the feature branch and create a Pull Request for the human Strategist to review.

---
*This protocol ensures our project history is clean, understandable, and that we leverage GitHub's full potential for collaboration and quality control.* 