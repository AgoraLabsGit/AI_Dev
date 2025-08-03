# MCP Server Architecture

MCP (Model Context Protocol) is the server integration and orchestration system for the Vibe Lab AI framework. It allows the AI to intelligently select and combine the capabilities of multiple specialized backend services to accomplish complex tasks.

## Server Selection Algorithm

The AI uses a multi-factor algorithm to determine the best MCP server (or combination of servers) for a given task.

**Priority Matrix**:
1.  **Task-Server Affinity**: Match tasks to optimal servers based on their capabilities.
2.  **Performance Metrics**: Consider server response time, success rate, and resource utilization.
3.  **Context Awareness**: Factor in the current AI persona, command depth, and session state.
4.  **Load Distribution**: Prevent server overload through intelligent queuing.
5.  **Fallback Readiness**: Maintain backup servers for critical operations.

**Selection Process**: Task Analysis → Server Capability Match → Performance Check → Load Assessment → Final Selection

---

## The MCP Servers

### 1. Context7 (Documentation & Research)

*   **Purpose**: Provides access to official library documentation, code examples, best practices, and localization standards.
*   **Activation**: Automatically triggered by external library imports, framework-specific questions, or the "Scribe" AI persona. Can be manually invoked with the `--c7` flag.
*   **Use Cases**: Resolving library usage questions, finding official code patterns, generating documentation, and ensuring version compatibility.

### 2. Sequential (Complex Analysis & Thinking)

*   **Purpose**: Enables multi-step problem solving, deep architectural analysis, and systematic debugging. This is the AI's "deep thought" engine.
*   **Activation**: Automatically triggered by complex debugging scenarios, system design questions, or the `--think` family of flags. Can be manually invoked with the `--seq` flag.
*   **Use Cases**: Root cause analysis, performance bottleneck identification, architecture reviews, security threat modeling, and planning complex, multi-stage tasks.

### 3. Magic (UI Components & Design)

*   **Purpose**: Handles modern UI component generation, design system integration, and responsive design.
*   **Activation**: Automatically triggered by requests for UI components or design system queries. Can be manually invoked with the `--magic` flag.
*   **Use Cases**: Generating new React/Vue/Angular components, ensuring accessibility compliance, implementing mobile-first responsive patterns, and integrating with existing design tokens and styles.

### 4. Playwright (Browser Automation & Testing)

*   **Purpose**: Powers cross-browser E2E testing, performance monitoring, visual testing, and general browser automation.
*   **Activation**: Automatically triggered by testing workflows, performance monitoring requests, or when the "QA" persona is active. Can be manually invoked with the `--play` flag.
*   **Use Cases**: Generating E2E tests, measuring Core Web Vitals, performing visual regression testing, and simulating real user interaction patterns.

---

## Server Orchestration Patterns

The true power of the MCP system lies in its ability to coordinate these servers.

*   **Multi-Server Coordination**: The AI can distribute tasks across multiple servers (e.g., using "Sequential" to plan a new component, "Context7" to get library patterns, and "Magic" to generate the final code).
*   **Caching Strategies**: Each server has its own caching layer to optimize performance and reduce redundant work (e.g., caching documentation lookups, analysis results, and component patterns).
*   **Error Handling and Recovery**: The system is designed with robust fallback mechanisms. If a primary server fails, it can fall back to a less-specialized tool (like WebSearch) or a backup server instance, ensuring graceful degradation of service rather than outright failure.