# Sub-System: Context Manager

## 1. Overview

The Context Manager is a critical sub-system of AVCA responsible for preparing and optimizing the context that is sent to the AI agents. Its primary goal is to provide the AI with the most relevant information possible while adhering to strict token limits, ensuring both high-quality responses and cost-effective operation.

## 2. Core Features

*   **LRU Cache**: An in-memory cache stores recently prepared contexts, dramatically reducing preparation time for repeated or similar requests.
*   **Content Compression**: Implements strategies to compress long text content, although this is an area for future optimization.
*   **Sliding Window Management**: A priority-based sliding window ensures that the most critical information is always included in the context, even when the total context size exceeds the token limit.
*   **Accurate Token Counting**: Utilizes the `tiktoken` library to provide precise token counts, preventing context overflow errors and enabling accurate cost tracking.
*   **Contextual Statistics**: Provides monitoring data on cache hit/miss rates, preparation times, and token efficiency.

## 3. Context Prioritization

To manage the context window effectively, the manager divides information into priority tiers. If the context needs to be truncated, lower-priority sections are dropped first.

*   **Critical Priority**: Always included (e.g., project name, description).
*   **High Priority**: Included whenever possible (e.g., tech stack, current project phase).
*   **Medium Priority**: Included if space allows (e.g., recent file changes).
*   **Low Priority**: Included only if there is ample space (e.g., general metadata).

## 4. Integration Points

The Context Manager is deeply integrated with several other services:

*   **AI Client Service**: Automatically prepares the context for every AI request.
*   **Rate Limiter / Token Tracker**: Provides the accurate token counts needed for effective rate limiting and cost calculation.
*   **Event Bus**: Emits events related to context preparation, caching, and performance.
