# Phase 0: Blueprint - Tech Stack Proposal

**Last Updated**: 2024-07-23

---

## 1. Proposed Technology Stack (Post-Audit)
> This stack has been updated based on the audit report and new directives.

| Category           | Technology / Service      | Rationale                                                              |
| ------------------ | ------------------------- | ---------------------------------------------------------------------- |
| **Frontend**       | Next.js (with TypeScript) | The premier React framework for building the user-facing web application. It will handle the entire client-side experience. |
| **Styling**        | Tailwind CSS & shadcn/ui  | Provides a proven, efficient workflow for building a high-quality, consistent, and accessible user interface. |
| **Developer Agent**| **Gemini 2.5 Pro**        | The core AI for all generative tasks: code generation, feature implementation, and blueprint analysis. |
| **Auditor Agent**  | **Claude 3 Opus**         | The core AI for all review tasks: code quality analysis, security audits, and architecture compliance checking. |
| **AI Orchestrator**| **SuperClaude/ClaudeCode**| A dedicated backend service that manages the multi-agent system. It routes requests, orchestrates workflows (e.g., generation followed by review), and aggregates results from both agents. |
| **Task Master**    | **SuperClaude Task System**| An intelligent project management component within SuperClaude that generates detailed task breakdowns with complexity scoring, dependency analysis, MCP server utilization planning, and risk assessment for development workflows. |
| **Database**       | PostgreSQL                | A powerful and reliable database for storing user data, project configurations, and blueprint content. To be hosted on a managed provider (e.g., Neon). |
| **Authentication** | NextAuth.js (GitHub Provider) | Securely handles user authentication via GitHub, which is essential for the developer audience and the core "Push-to-GitHub" feature. |
| **Deployment**     | Vercel                    | Offers the most seamless deployment experience for the Next.js frontend. The AI backend will have a separate deployment strategy. |
| **Background Jobs**| **Inngest or BullMQ**     | A dedicated queue and background job system is required to handle long-running processes like code generation and pushing to GitHub without timing out. |

---

## 2. Key Architectural Decisions

*   **Decoupled Architecture**: The frontend (Next.js on Vercel) is now fully decoupled from the backend (Gemini/SuperClaude), communicating via a well-defined API. This is a more scalable and robust model than the previous monolith.
*   **AI Abstraction**: The SuperClaude/ClaudeCode layer is critical. It prevents the frontend from having direct, complex dependencies on the Gemini model, allowing for better management, versioning, and potential future integration of other AI models.
*   **Asynchronous Operations**: All long-running tasks (code generation, repo creation) **must** be handled asynchronously using a background job system to ensure a responsive UI. The frontend will poll for status updates.

## 3. Post-MVP Architecture Considerations

*   **Local Agent (Model B)**: The decoupled architecture using a dedicated AI integration layer is the correct prerequisite for the post-MVP Local Agent. The agent will communicate with the same SuperClaude/ClaudeCode backend, receiving commands via a message queue (e.g., WebSockets or polling). 