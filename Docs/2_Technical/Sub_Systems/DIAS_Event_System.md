# Sub-System: DIAS Event System

## 1. Overview

The DIAS Event System is the central nervous system of Vibe Lab's intelligence layer. It is a robust, event-driven architecture that allows the various DIAS modules to communicate asynchronously and react to events happening within the AVCA pipeline and other parts of the system. This loose coupling is key to the system's extensibility and resilience.

## 2. Core Features

*   **Comprehensive Event Types**: The system defines six categories of strongly-typed events:
    *   **Component Events**: Track the full lifecycle of a component (created, updated, registered, etc.).
    *   **Pipeline Events**: Monitor the progress and status of the AVCA pipeline stages.
    *   **Quality Events**: Report the results of quality gate checks and manual overrides.
    *   **User Events**: Capture user decisions and feedback.
    *   **System Events**: Track system health, errors, and performance metrics.
    *   **Integration Events**: Facilitate communication between AVCA and DIAS.
*   **Central Event Handler**: A dedicated service subscribes to all event categories, routes them to the appropriate handlers, and manages their lifecycle.
*   **Audit Trail**: Maintains a complete, queryable log of all events for a configurable period (default 30 days), providing essential observability.
*   **Dead Letter Queue**: Automatically handles and retries failed events, ensuring no event is lost.

## 3. Event Flow

The flow of events is designed to be simple and robust:

1.  A **Service** (e.g., a stage in the AVCA pipeline) emits an event.
2.  The event is published to the central **EventBus**.
3.  The **DIAS Event Handler** service, which is subscribed to the EventBus, receives the event.
4.  The handler then routes the event to one or more specialized handlers for processing, such as the **Audit Trail Logger** or the **Metrics Collector**.

## 4. Integration Points

The Event System is the primary integration point for all DIAS modules. It allows new intelligence modules to be added to the system simply by subscribing to the relevant events, without requiring changes to the core AVCA pipeline. It is the foundation upon which the entire learning and adaptation capability of DIAS is built.
