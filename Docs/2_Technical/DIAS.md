# DIAS (Dynamic Intelligence & Adaptation System)

## 1. Overview

DIAS is the intelligence layer of Vibe Lab. While AVCA provides the structured pipeline for *building* software, DIAS provides the intelligence for *understanding, adapting, and improving* that software. It is a collection of event-driven services that run in the background, continuously monitoring the development process and providing real-time insights.

## 2. The DIAS-AVCA Interaction

DIAS is not a standalone system; it is deeply integrated with the AVCA pipeline. It consumes a stream of events from AVCA to build a comprehensive picture of the project's health and can trigger actions back to the AVCA pipeline, such as regenerating a component that has a newly discovered flaw.

<details>
<summary>View Technical Interfaces</summary>

```typescript
// DIAS → AVCA
interface DIASToAVCA {
  requestComponent(spec: ComponentSpec): Promise<Component>;
  updateComponent(id: string, changes: Change): Promise<Component>;
  queryRegistry(query: Query): Promise<Component[]>;
  reportIssue(component: string, issue: Issue): Promise<void>;
}

// AVCA → DIAS  
interface AVCAToDIAS {
  reportQuality(component: string, metrics: QualityMetrics): void;
  notifyCompletion(stage: PipelineStage, result: Result): void;
  escalateIssue(issue: Issue): Promise<Resolution>;
  requestGuidance(context: Context): Promise<Guidance>;
}
```
</details>

## 3. The Conversational Interface (Intent & Routing Engine)

The gateway to all Vibe Lab functionality is the Conversational Interface. It uses a fast, lightweight **Router AI** to classify user intent from chat messages and extract key entities. This structured output is then intelligently routed to the appropriate service (in AVCA or DIAS), which can engage the more powerful **Developer AI** with the full project context. This two-step process ensures Vibe Lab is both highly responsive and deeply intelligent.

> **[Read the full Conversational Interface Documentation](./Sub_Systems/Conversational_Interface.md)**

## 4. Core Intelligence Modules

DIAS is composed of several specialized intelligence modules, each responsible for a different aspect of the system's "brain".

*   **Feature Integration Engine**: Analyzes user requests and determines their impact on the existing codebase.
*   **System Synchronizer**: Keeps all parts of the project (blueprints, code, documentation) in sync when changes are made.
*   **Context Keeper**: Manages the project's context to provide continuity across development sessions.
*   **Predictive Analytics**: Suggests next steps, predicts potential issues, and recommends optimizations.
*   **Learning System**: Learns from user decisions and feedback to personalize the development experience. This is a critical module that provides ongoing, intelligent support to the user *after* the initial project has been generated.

<details>
<summary>View Ongoing DIAS Support Details</summary>

The Learning System provides continuous, chat-based support by maintaining a deep understanding of the user's project context.

*   **Context-Awareness**: The system knows the user's existing components, their chosen styling template, their database schema, and their development patterns.
*   **Feature Request Analysis**: It can analyze natural language feature requests (e.g., "I want to add user profile management") and map them to existing, style-consistent components from the library.
*   **Intelligent Recommendations**: It can identify gaps (e.g., "You don't have a notification component yet") or optimization opportunities (e.g., "Your table is slow; I recommend upgrading to the `VirtualizedDataTable` component").
*   **Implementation Guidance**: It provides step-by-step guidance for configuring and integrating the recommended components.

This turns the development process into a continuous conversation, where the AI acts as a knowledgeable partner, helping the user evolve their application while maintaining design consistency and architectural integrity.

**Example Chat Interaction:**
*   **User**: "I need real-time notifications for my dashboard."
*   **DIAS Analysis**:
    *   *Context*: Detects the "Linear Style" template and an absence of notification components.
    *   *Gap Analysis*: Identifies a missing capability.
    *   *Recommendation*: Suggests the `NotificationCenter` and `ToastNotifications` components.
*   **DIAS Response**: "Your current dashboard doesn't have notification components yet. I recommend adding the **NotificationCenter** and **ToastNotifications** components. Both are styled for your Linear template. Should I configure these for you?"

</details>
*   **Quality Intelligence**: Continuously monitors code quality, enforces standards, and detects regressions.
*   **Error Intelligence**: Analyzes errors, suggests fixes, and helps prevent them from happening again.
*   **Task Master**: A sophisticated project management engine that handles task decomposition, dependency analysis, resource allocation, and "Wave Orchestration." It is the bridge between high-level roadmaps and the detailed, actionable tasks required for development.

> **[Read the full Task Master System Documentation](./Sub_Systems/Task_Master_System.md)**

<details>
<summary>View Technical Interfaces</summary>

```typescript
interface FeatureIntegrator {
  processRequest(input: string): Promise<SystemUpdate>;
  analyzeImpact(feature: Feature): ImpactAnalysis;
}

interface SystemSync {
  watchers: { /* ... */ };
  cascade(change: Change): ChangeSet;
}

interface ContextKeeper {
  summarize(chats: Chat[]): ContextSummary;
  load(projectId: string): ProjectContext;
}

interface Predictor {
  suggestNextComponent(current: Component[]): Suggestion[];
  predictIssues(architecture: Architecture): PotentialIssue[];
}

interface Learner {
  trackDecision(decision: UserDecision): void;
  updatePreferences(feedback: Feedback): void;
}

interface QualityMonitor {
  enforceStandards(code: Code): ValidationResult;
  detectRegression(changes: Change[]): Regression[];
}

interface ErrorAnalyzer {
  detectPattern(errors: Error[]): ErrorPattern;
  suggestFix(pattern: ErrorPattern): FixSuggestion;
}
```
</details>

## 5. Adaptation Workflows

DIAS employs different workflows to handle various situations, from routine tasks to critical emergencies.

*   **Sequential Enhancement (Default)**: A standard, step-by-step process for analyzing and implementing changes.
*   **Parallel Consultation (Complex)**: For complex issues, multiple AI agents can be consulted in parallel to arrive at a consensus.
*   **Proactive Optimization (Background)**: The system continuously looks for optimization opportunities during idle time.
*   **Emergency Response (Critical)**: A high-priority workflow for identifying and fixing critical issues, bypassing standard approvals if necessary.

## 6. System Memory

To learn and adapt, DIAS relies on a multi-layered memory system:

*   **Short-Term Memory (In-Memory)**: Caches active session data for a few minutes.
*   **Medium-Term Memory (Redis)**: Stores recent patterns and project data for about an hour.
*   **Long-Term Memory (Database)**: The permanent home for the component registry, usage patterns, quality scores, and blueprint history. This long-term memory is the foundation of the system's evolution.
