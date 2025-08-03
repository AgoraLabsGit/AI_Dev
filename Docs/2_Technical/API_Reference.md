# Vibe Lab API Reference

This document provides a technical reference for the core Vibe Lab APIs, including REST endpoints, WebSocket events, and authentication mechanisms.

## 1. REST API Endpoints

The API is versioned, with the current base URL at `/api/v1`.

### Project Management
*   `POST /api/v1/projects`: Creates a new project.
*   `GET /api/v1/projects/:projectId`: Retrieves a project's details.
*   `PUT /api/v1/projects/:projectId`: Updates a project's details.
*   `GET /api/v1/projects/:projectId/roadmap`: Retrieves a project's roadmap.

### Task Management
*   `GET /api/v1/projects/:projectId/tasks`: Retrieves all tasks for a project.
*   `POST /api/v1/projects/:projectId/tasks`: Creates a new task.
*   `PUT /api/v1/projects/:projectId/tasks/:taskId/status`: Updates a task's status.
*   `POST /api/v1/projects/:projectId/tasks/analyze`: Triggers a Task Master analysis for a set of tasks.

### Chat & AI Coordination
*   `POST /api/v1/chat/coordinate`: The primary endpoint for processing user chat messages and coordinating AI actions.

### Monitoring
*   `GET /api/v1/monitoring/costs`: Retrieves cost metrics for AI usage.
*   `GET /api/v1/agents/status`: Retrieves the current status of the AI agents.

## 2. WebSocket Events

The system uses WebSockets for real-time, bidirectional communication between the client and the server.

*   **Connection URL**: `ws://localhost:3000/ws`
*   **Authentication**: The client must send an `auth` message with a valid token upon connection.
*   **Subscriptions**: Clients can subscribe to one or more event categories (`component`, `pipeline`, `quality`, etc.) to receive relevant real-time updates.

### Key WebSocket Messages
*   `state.update`: Notifies clients of changes to the project state.
*   `progress.update`: Provides real-time progress updates for long-running operations like pipeline stages.
*   `error`: Sends error notifications to the client.

## 3. Event System Schemas

All events in the system follow a standardized `DIASEvent` schema.

<details>
<summary>View Core Event Schemas</summary>

### Base Event Schema
```typescript
interface DIASEvent {
  id: string;
  type: string; // e.g., 'component.created'
  category: EventCategory;
  source: string; // The service that emitted the event
  projectId: string;
  timestamp: Date;
  data: any;
  metadata?: {
    correlationId?: string;
    causationId?: string;
  }
}
```

### Component Event
```typescript
interface ComponentEvent extends DIASEvent {
  category: EventCategory.COMPONENT;
  type: 'component.created' | 'component.updated' | 'component.registered';
  data: {
    componentId: string;
    componentName: string;
    version: string;
    dependencies?: string[];
  }
}
```

### Pipeline Event
```typescript
interface PipelineEvent extends DIASEvent {
  category: EventCategory.PIPELINE;
  type: 'pipeline.started' | 'pipeline.stage.completed' | 'pipeline.failed';
  data: {
    pipelineId: string;
    stage?: string;
    duration?: number;
    error?: any;
  }
}
```
</details>

## 4. Authentication

The API supports both API Key and JWT authentication.

*   **Method**: The token should be included in the `Authorization` header as a Bearer token.
    *   `Authorization: Bearer YOUR_API_KEY_OR_JWT`

## 5. Error Handling

The API uses standard HTTP status codes and provides a consistent error format.

<details>
<summary>View Error Format</summary>

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A human-readable error message.",
    "details": {
      "field": "Additional context about the error."
    },
    "timestamp": "2025-01-28T10:00:00Z"
  }
}
```
</details>
