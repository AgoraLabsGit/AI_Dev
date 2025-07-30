# AVCA-DIAS API Reference

## Overview
This document provides a comprehensive reference for all APIs in the AVCA-DIAS system, including service interfaces, event schemas, and integration points.

## Table of Contents
1. [Core Services](#core-services)
2. [Event System](#event-system)
3. [Integration Layer](#integration-layer)
4. [REST API Endpoints](#rest-api-endpoints)
5. [WebSocket Events](#websocket-events)

---

## Core Services

### BaseService
All services extend from BaseService, providing consistent lifecycle management.

```typescript
abstract class BaseService {
  constructor(config: ServiceConfig)
  
  // Lifecycle methods
  async start(): Promise<void>
  async stop(): Promise<void>
  async restart(): Promise<void>
  
  // Health monitoring
  async healthCheck(): Promise<boolean>
  getMetrics(): ServiceMetrics
  
  // Event emission
  emit(event: string, data: any): void
  
  // Logging
  log(level: 'info' | 'warn' | 'error', message: string, meta?: any): void
}
```

### EventBus
Central message broker for all system events.

```typescript
class EventBus {
  // Publishing
  async publish(
    category: EventCategory,
    source: string,
    data: any
  ): Promise<void>
  
  // Subscription
  subscribe(
    category: EventCategory,
    subscriberId: string,
    handler: (message: Message) => Promise<void>
  ): void
  
  // Unsubscription
  unsubscribe(category: EventCategory, subscriberId: string): void
  
  // Dead Letter Queue
  getDeadLetters(): Message[]
  retryDeadLetter(messageId: string): Promise<void>
}
```

### ServiceRegistry
Service discovery and health monitoring.

```typescript
class ServiceRegistry {
  // Registration
  async register(service: BaseService): Promise<void>
  async deregister(serviceId: string): Promise<void>
  
  // Discovery
  getService(serviceId: string): BaseService | undefined
  getAllServices(): Map<string, BaseService>
  
  // Health checks
  async checkHealth(): Promise<HealthReport>
}
```

---

## Event System

### Event Categories
```typescript
enum EventCategory {
  COMPONENT = 'component',
  PIPELINE = 'pipeline',
  QUALITY = 'quality',
  USER = 'user',
  SYSTEM = 'system',
  INTEGRATION = 'integration'
}
```

### Event Schema
```typescript
interface DIASEvent {
  id: string
  type: string
  category: EventCategory
  source: string
  projectId: string
  timestamp: Date
  data: any
  metadata?: {
    correlationId?: string
    causationId?: string
    version?: string
  }
}
```

### Component Events
```typescript
enum ComponentEventType {
  CREATED = 'component.created',
  UPDATED = 'component.updated',
  REGISTERED = 'component.registered',
  DEPLOYED = 'component.deployed'
}

interface ComponentEvent extends DIASEvent {
  category: EventCategory.COMPONENT
  type: ComponentEventType
  data: {
    componentId: string
    componentName: string
    componentType: 'ui' | 'logic' | 'data' | 'integration'
    version: string
    dependencies?: string[]
    metadata?: Record<string, any>
  }
}
```

### Pipeline Events
```typescript
enum PipelineEventType {
  STARTED = 'pipeline.started',
  STAGE_STARTED = 'pipeline.stage.started',
  STAGE_COMPLETED = 'pipeline.stage.completed',
  COMPLETED = 'pipeline.completed',
  FAILED = 'pipeline.failed',
  BLOCKED = 'pipeline.blocked'
}

interface PipelineEvent extends DIASEvent {
  category: EventCategory.PIPELINE
  type: PipelineEventType
  data: {
    pipelineId: string
    stage?: string
    stageNumber?: number
    duration?: number
    result?: any
    error?: any
  }
}
```

---

## Integration Layer

### IntegrationService
Main orchestration point for AVCA-DIAS integration.

```typescript
class IntegrationService {
  // Worker execution
  async executeWorker(jobRequest: {
    workerType: string
    input: WorkerInput
    context?: WorkerContext
    priority?: number
  }): Promise<WorkerOutput>
  
  // State management
  getProjectState(projectId: string): ProjectState | undefined
  updateProjectState(
    projectId: string,
    updates: Partial<ProjectState>,
    source: 'avca' | 'dias'
  ): void
  
  // State synchronization
  async syncState(projectId: string): Promise<void>
  
  // Subscriptions
  subscribeToState(
    projectId: string,
    callback: (state: ProjectState) => void
  ): () => void
  
  // Statistics
  getStats(): IntegrationStats
}
```

### Worker Types
```typescript
interface WorkerInput {
  id: string
  projectId: string
  type: string
  data: any
  context?: any
  metadata?: Record<string, any>
}

interface WorkerOutput {
  id: string
  workerId: string
  status: 'success' | 'failed' | 'partial'
  data?: any
  error?: {
    code: string
    message: string
    details?: any
  }
  duration: number
  metadata?: Record<string, any>
}
```

---

## REST API Endpoints

### Project Management
```http
# Create project
POST /api/v1/projects
{
  "name": "string",
  "description": "string",
  "blueprints": []
}

# Get project
GET /api/v1/projects/:projectId

# Update project
PUT /api/v1/projects/:projectId
{
  "name": "string",
  "description": "string"
}

# Get project roadmap
GET /api/v1/projects/:projectId/roadmap
```

### Task Management
```http
# Get tasks
GET /api/v1/projects/:projectId/tasks

# Create task
POST /api/v1/projects/:projectId/tasks
{
  "title": "string",
  "description": "string",
  "type": "feature|bug|improvement",
  "priority": "low|medium|high|critical"
}

# Update task status
PUT /api/v1/projects/:projectId/tasks/:taskId/status
{
  "status": "pending|in_progress|completed|blocked"
}

# Analyze tasks
POST /api/v1/projects/:projectId/tasks/analyze
{
  "taskIds": ["string"]
}
```

### Pipeline Operations
```http
# Test pipeline
POST /api/v1/pipeline/test
{
  "blueprint": {},
  "options": {}
}
```

### Chat Coordination
```http
# Coordinate chat
POST /api/v1/chat/coordinate
{
  "messages": [],
  "context": {}
}
```

### Monitoring
```http
# Get cost metrics
GET /api/v1/monitoring/costs

# Get agent status
GET /api/v1/agents/status
```

---

## WebSocket Events

### Connection
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-auth-token'
}));
```

### Event Subscriptions
```javascript
// Subscribe to events
ws.send(JSON.stringify({
  type: 'subscribe',
  categories: ['component', 'pipeline', 'quality']
}));

// Receive events
ws.on('message', (data) => {
  const event = JSON.parse(data);
  switch(event.category) {
    case 'component':
      handleComponentEvent(event);
      break;
    case 'pipeline':
      handlePipelineEvent(event);
      break;
  }
});
```

### Real-time Updates
```javascript
// Project state updates
{
  type: 'state.update',
  projectId: 'string',
  changes: {},
  version: 1
}

// Progress updates
{
  type: 'progress.update',
  projectId: 'string',
  stage: 'string',
  progress: 0.75
}

// Error notifications
{
  type: 'error',
  severity: 'warning|error|critical',
  message: 'string',
  details: {}
}
```

---

## Error Codes

### Client Errors (4xx)
- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource doesn't exist
- `409` - Conflict: State conflict or duplicate resource
- `429` - Too Many Requests: Rate limit exceeded

### Server Errors (5xx)
- `500` - Internal Server Error: Unexpected error
- `502` - Bad Gateway: Service communication error
- `503` - Service Unavailable: Service temporarily down
- `504` - Gateway Timeout: Request timeout

### Custom Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "timestamp": "2025-01-28T10:00:00Z"
  }
}
```

---

## Rate Limiting

### Default Limits
- **API Calls**: 1000 requests per minute
- **WebSocket Messages**: 100 messages per minute
- **AI Operations**: 100 tokens per second

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1706437260
```

---

## Authentication

### API Key Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

### JWT Authentication
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### WebSocket Authentication
```json
{
  "type": "auth",
  "method": "jwt|apikey",
  "credentials": "YOUR_CREDENTIALS"
}
```

---

## Versioning

The API uses URL versioning:
- Current version: `v1`
- Base URL: `/api/v1`
- Deprecated endpoints include `Deprecation` header

---

## SDK Examples

### TypeScript/JavaScript
```typescript
import { VibeLabClient } from '@vibe-lab/sdk';

const client = new VibeLabClient({
  apiKey: process.env.VIBE_LAB_API_KEY,
  baseUrl: 'https://api.vibe-lab.com'
});

// Create project
const project = await client.projects.create({
  name: 'My Project',
  blueprints: []
});

// Subscribe to events
client.events.subscribe(['component', 'pipeline'], (event) => {
  console.log('Event received:', event);
});
```

### Python
```python
from vibe_lab import VibeLabClient

client = VibeLabClient(
    api_key=os.environ['VIBE_LAB_API_KEY'],
    base_url='https://api.vibe-lab.com'
)

# Create project
project = client.projects.create(
    name='My Project',
    blueprints=[]
)

# Subscribe to events
@client.events.on(['component', 'pipeline'])
def handle_event(event):
    print(f'Event received: {event}')
```

---

## Support

For API support:
- Documentation: https://docs.vibe-lab.com
- Status: https://status.vibe-lab.com
- Support: support@vibe-lab.com 