# AI Orchestrator: Intelligent Routing System

The Orchestrator is the intelligent routing system for the Vibe Lab AI framework. It analyzes user requests, assesses complexity, and determines the optimal combination of AI personas, tools, and MCP servers to achieve the goal efficiently and safely.

---

## 1. The Detection Engine

Before any operation, the Orchestrator performs a series of validation checks and pattern recognition routines.

### Pre-Operation Validation
*   **Resource Validation**: Predicts token usage, memory requirements, and checks for MCP server availability.
*   **Compatibility Validation**: Detects conflicting flags (e.g., `--no-mcp` and `--seq`) and ensures the selected AI persona is appropriate for the command.
*   **Risk Assessment**: Scores the operation's complexity, probability of failure, and potential for cascading errors. Operations with a risk score above 0.8 will trigger a suggestion to use "safe mode."

### Pattern Recognition
The Orchestrator uses a series of matrices to classify requests based on complexity, domain, and operation type.

*   **Complexity**: Requests are classified as `simple`, `moderate`, or `complex` based on scope and the number of steps.
*   **Domain**: Keywords and file patterns are used to identify the domain (e.g., `frontend`, `backend`, `security`, `documentation`).
*   **Operation Type**: Verbs in the prompt are used to classify the operation (e.g., `analysis`, `creation`, `modification`, `debugging`).

---

## 2. Routing Intelligence

Based on the initial analysis, the Orchestrator uses a master routing table and a series of decision trees to select the most effective execution strategy.

### Master Routing Table
A comprehensive table maps common user requests and patterns to a pre-defined combination of AI personas, flags, and MCP servers with a confidence score.

| Pattern | Complexity | Domain | Auto-Activates | Confidence |
|---|---|---|---|---|
| "analyze architecture" | complex | infrastructure | architect persona, --ultrathink, Sequential | 95% |
| "create component" | simple | frontend | frontend persona, Magic, --uc | 90% |
| "fix bug" | moderate | any | analyzer persona, --think, Sequential | 85% |
| "optimize performance" | complex | backend | performance persona, --think-hard, Playwright | 90% |
| "write documentation" | moderate | documentation | scribe persona, --persona-scribe=en, Context7 | 95% |

### Tool & Persona Selection
*   **Tool Selection**: The Orchestrator selects the right tool for the job (e.g., `grep` for specific patterns, "Sequential" for complex analysis, "Magic" for UI generation).
*   **Persona Auto-Activation**: A multi-factor scoring system (keywords, context, user history) automatically activates the most appropriate AI persona for the task. For example, a request to fix a performance bottleneck will automatically activate the "Performance" persona.

---

## 3. Quality Gates & Validation

The Orchestrator enforces a mandatory, 8-step validation cycle for all significant operations to ensure quality and safety.

### 8-Step Validation Cycle
1.  **Syntax & Type Checking**: Code is validated for correctness.
2.  **Linting**: Code is checked against style and quality rules.
3.  **Security Scan**: Code is scanned for common vulnerabilities.
4.  **Testing**: Unit and integration tests are run.
5.  **Performance Benchmarking**: Performance is measured against established budgets.
6.  **Documentation Review**: Documentation is checked for accuracy and completeness.
7.  **Integration Testing**: The full feature is tested in a simulated environment.
8.  **Final Validation**: All gates must pass before a task is marked complete.

---

## 4. Emergency Protocols

The Orchestrator is designed with a series of emergency protocols to handle resource constraints and failures gracefully.

*   **Resource Management**: A threshold-based system monitors resource usage. As usage increases, the system will automatically enable token-saving features, defer non-critical operations, and eventually block resource-intensive commands to prevent system failure.
*   **Graceful Degradation**: If a specialized MCP server is unavailable, the Orchestrator will fall back to a less-specialized tool or a backup server, allowing the system to continue functioning with slightly reduced capabilities.
*   **Error Recovery**: The system has pre-defined recovery patterns for common errors, such as retrying a command with exponential backoff or requesting clarification from the user if a command is ambiguous.