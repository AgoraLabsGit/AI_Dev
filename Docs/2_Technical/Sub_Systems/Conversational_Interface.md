# DIAS Sub-System: Conversational Interface

## 1. Overview

This document defines the architecture for Vibe Lab's intelligent conversational interface. It details how user chat messages are processed, classified, and routed to the appropriate AVCA and DIAS systems, enabling a seamless and intelligent user experience.

## 2. Core Components

The interface is built on three core components: the Chat Processor, the Intent Classification system, and the Chat Mapper.

*   **Chat Processor**: The main entry point for all chat messages, orchestrating the process from classification to response generation.
*   **Intent Classification**: A comprehensive system that categorizes user messages into a wide range of `IntentType` enums, from pipeline triggers (`component.request`) to DIAS events (`feature.add`) and meta-conversations (`meta.help`).
*   **Chat Mapper**: Maps the classified intent to specific system actions, such as triggering a pipeline stage, emitting a DIAS event, or updating project context.

## 3. Intent-to-System Mapping

The system maintains explicit mappings between user intents and actions within the AVCA and DIAS.

*   **AVCA Pipeline Triggers**: User messages like "create a new app" are mapped directly to starting the `ideation` stage of the AVCA pipeline.
*   **DIAS Event Mappings**: Messages like "add a feature" or "this component is broken" are mapped to events that are consumed by the appropriate DIAS intelligence modules (e.g., `featureIntegrator`, `errorIntelligence`).

## 4. Specialized DIAS Modules for Chat

Several DIAS modules are specialized for handling conversational input.

*   **Code Auditor Module**: Provides real-time development assistance by analyzing code as the user types, detecting anti-patterns, diagnosing issues from terminal output, and suggesting fixes directly in the chat.
*   **Design DIAS System**: A set of services focused on UI/UX, including a `StyleCoordinator` to enforce visual consistency and a `ComponentPredictor` to analyze designs and suggest components from the registry.

## 5. Context & Memory

To provide a personalized and intelligent experience, the chat system is deeply integrated with the DIAS Context Keeper and Memory System.

*   **Context Keeper Integration**: Every message is enhanced with the full project context, including the current pipeline stage, recent decisions, and open issues, allowing the AI to have a complete awareness of the project's state.
*   **Memory & Preference System**: The system learns from every interaction.
    *   **User Preferences**: Remembers communication style ("be more concise"), technical choices ("use Supabase for auth"), and code style.
    *   **Project Decisions**: Persists key architectural and technical decisions made during the conversation.
    *   These learned preferences are then synced across all DIAS modules to tailor the AI's behavior.

<details>
<summary>View Technical Details & Example Flows</summary>

### API Endpoints

*   `POST /api/chat/process`: The main endpoint for processing a user message.
*   `POST /api/chat/analyze`: A specific endpoint for analyzing intent without executing actions.
*   `POST /api/chat/audit`: An endpoint for the Code Auditor to analyze a piece of code.

### React Hook Integration

A `useIntelligentChat` React hook abstracts the complexity of the chat system, providing a simple `processMessage` function to the UI.

### Performance & Cost Optimization

The system is heavily optimized for both speed and cost:
*   **Performance**: Utilizes parallel processing and aggressive caching (LRU for intents, TTL for responses) to keep p95 latency under 3 seconds.
*   **Cost**: Employs a lightweight model for initial intent classification and relies on structured data, reducing the need for expensive clarification messages and saving 60-80% on costs compared to a traditional approach.

### Example Flow: Feature Request

1.  **User**: "Add a search bar to the dashboard"
2.  **Intent Classification**: `{ type: 'FEATURE_REQUEST', entities: ['search bar', 'dashboard'] }`
3.  **Chat Mapping**: The system maps this to a `feature.integration.requested` DIAS event and identifies that the `SearchBar` component will be needed.
4.  **Action**: The DIAS Feature Integrator is triggered, which then coordinates with the AVCA pipeline to generate the new component and update the dashboard.

</details>
