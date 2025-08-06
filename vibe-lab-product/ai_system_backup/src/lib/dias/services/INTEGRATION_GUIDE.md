# DIAS Services Integration Guide

**Version**: 1.0  
**Created**: 2025-08-04  
**Purpose**: Complete guide for integrating SuperClaude and TaskMaster into Vibe Lab DIAS

---

## Overview

This guide documents the integration of SuperClaude and TaskMaster as permanent features of the Vibe Lab DIAS (Dynamic Intelligence & Adaptation System). The integration provides native AI capabilities and intelligent task management through TypeScript service wrappers.

## Architecture

### Service Architecture

```
DIAS Services
├── ai-orchestrator/           # SuperClaude AI routing and persona management
│   └── ai-orchestrator-service.ts
├── task-master/              # TaskMaster CLI wrapper
│   └── task-master-service.ts
├── context-manager/          # Context preparation and LRU caching
│   └── context-manager-service.ts
├── mcp-servers/             # MCP server interfaces
│   └── mcp-interfaces.ts
├── database/                # Persistence layer
│   ├── schema.sql
│   └── database-service.ts
├── types/                   # TypeScript definitions
│   └── index.ts
└── dias-service-integrator.ts # Main orchestrator
```

### Integration Points

1. **AI Orchestrator** → SuperClaude framework wrapper
2. **TaskMaster Service** → task-master-ai CLI wrapper  
3. **Context Manager** → LRU cache with intelligent compression
4. **MCP Interfaces** → Context7, Sequential, Magic, Playwright
5. **Database Service** → PostgreSQL persistence layer
6. **API Routes** → REST endpoints for frontend integration

## Service Descriptions

### 1. AI Orchestrator Service

**Purpose**: Intelligent routing system for SuperClaude commands with resilience patterns.

**Key Features**:
- 11 specialized personas (architect, frontend, backend, etc.)
- Intelligent model selection (Haiku/Sonnet/Opus)
- Circuit breaker and token bucket rate limiting
- Automatic MCP server selection
- Context-aware persona selection

**Usage**:
```typescript
const aiOrchestrator = new AIOrchestratorService(config);
const result = await aiOrchestrator.execute({
  command: '/analyze',
  args: ['codebase'],
  flags: { think: true, seq: true },
  context: 'Performance optimization needed',
  sessionId: 'user-session-123'
});
```

### 2. TaskMaster Service

**Purpose**: TypeScript wrapper for the task-master-ai CLI providing project management capabilities.

**Key Features**:
- Task parsing from roadmap documents
- Complexity analysis and task expansion
- Dependency management
- Status tracking and updates
- Git integration for automated updates

**Usage**:
```typescript
const taskMaster = new TaskMasterService(config);
await taskMaster.parseRoadmap('/path/to/roadmap.md', 10);
const nextTask = await taskMaster.getNextTask();
await taskMaster.setTaskStatus('task-1', 'in-progress');
```

### 3. Context Manager Service

**Purpose**: LRU cache and context preparation with intelligent compression.

**Key Features**:
- LRU cache with TTL support
- Intelligent content compression using LLM-based summarization
- Priority-based sliding window
- Multi-layer cache (in-memory → Redis → Database)
- Context aggregation from files, docs, and history

**Usage**:
```typescript
const contextManager = new ContextManagerService(config);
const context = await contextManager.prepareContext(
  'project-id', 
  ['src/app.ts', 'src/utils.ts'],
  true // include history
);
```

### 4. MCP Server Interfaces

**Purpose**: TypeScript interfaces for interacting with MCP servers via the task-master CLI.

**Supported Servers**:
- **Context7**: Documentation and research lookup
- **Sequential**: Complex analysis and multi-step reasoning  
- **Magic**: UI component generation and design systems
- **Playwright**: Browser automation and E2E testing

**Usage**:
```typescript
const context7 = new Context7Server(config);
const libraryId = await context7.resolveLibraryId('react');
const docs = await context7.getLibraryDocs(libraryId, 'hooks');

const magic = new MagicServer(config);
const component = await magic.buildComponent(
  'Create a login form',
  'login form',
  '/path/to/file',
  '/path/to/project',
  'Responsive login form with validation'
);
```

### 5. Database Service

**Purpose**: Persistence layer for all DIAS data with comprehensive schema.

**Key Tables**:
- `superclaude_sessions` - AI session data
- `task_master_config` - TaskMaster configuration per project
- `tasks` - Enhanced task management
- `context_cache` - LRU cache persistence
- `ai_command_history` - Complete AI command audit trail
- `dias_events` - Event bus for system communication

**Usage**:
```typescript
const db = new DatabaseService();
await db.createSession(userId, projectId, sessionId, 'architect');
await db.saveTasks(tasks, projectId);
await db.saveContextCache(cacheKey, projectId, data, 'code', filePaths, 3600000);
```

## API Endpoints

### AI Operations

```http
# Execute SuperClaude command
POST /api/dias/ai
{
  "command": "/analyze",
  "args": ["performance"],
  "flags": { "think": true, "seq": true },
  "context": "System is running slowly",
  "sessionId": "session-123"
}

# AI health check
GET /api/dias/ai/health
```

### Task Management

```http
# List tasks
GET /api/dias/tasks?status=pending&withSubtasks=true

# Create tasks from roadmap
POST /api/dias/tasks
{
  "action": "create-from-roadmap",
  "filePath": "/path/to/roadmap.md",
  "numTasks": 10
}

# Update task status
PUT /api/dias/tasks
{
  "taskId": "task-1",
  "status": "in-progress"
}

# Get next task
GET /api/dias/tasks/next
```

## Configuration

### Default Configuration

```typescript
const config: DIASServiceConfig = {
  taskMasterCLI: {
    command: 'task-master',
    configPath: './.taskmasterconfig',
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  superClaude: {
    defaultPersona: 'architect',
    defaultFlags: { think: false, uc: false, validate: true }
  },
  mcpServers: {
    context7: { enabled: true, timeout: 30000, retries: 3 },
    sequential: { enabled: true, timeout: 60000, retries: 3 },
    magic: { enabled: true, timeout: 45000, retries: 3 },
    playwright: { enabled: true, timeout: 120000, retries: 2 }
  },
  resilience: {
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 30000
    },
    tokenBucket: {
      capacity: 100,
      refillRate: 10, 
      refillPeriod: 1000
    },
    retryAttempts: 3,
    retryDelay: 1000
  },
  cache: {
    maxSize: 1000,
    defaultTTL: 3600000, // 1 hour
    compressionThreshold: 10000 // 10KB
  },
  memory: {
    layers: ['in-memory', 'redis', 'database'],
    syncInterval: 300000 // 5 minutes
  }
};
```

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional MCP server endpoints
CONTEXT7_ENDPOINT=http://localhost:3001
SEQUENTIAL_ENDPOINT=http://localhost:3002
MAGIC_ENDPOINT=http://localhost:3003
PLAYWRIGHT_ENDPOINT=http://localhost:3004

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vibe_lab
```

## Integration Steps

### 1. Database Setup

```sql
-- Run the schema migration
\i src/lib/dias/services/database/schema.sql
```

### 2. Initialize Services

```typescript
import { DIASServiceIntegrator, createDefaultDIASConfig } from '@/lib/dias/services/dias-service-integrator';

// Initialize DIAS services
const config = createDefaultDIASConfig();
const diasServices = new DIASServiceIntegrator(config);

// Initialize TaskMaster for project
await diasServices.initializeProject('Vibe Lab', 'AI-driven development platform');
```

### 3. Frontend Integration

```typescript
// Example React hook for AI operations
const useAICommand = () => {
  const executeCommand = async (request: AIRequest) => {
    const response = await fetch('/api/dias/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  };
  
  return { executeCommand };
};

// Example task management
const useTaskManager = () => {
  const listTasks = async (status?: string) => {
    const response = await fetch(`/api/dias/tasks?status=${status || ''}`);
    return response.json();
  };
  
  const updateTaskStatus = async (taskId: string, status: string) => {
    const response = await fetch('/api/dias/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status })
    });
    return response.json();
  };
  
  return { listTasks, updateTaskStatus };
};
```

## Monitoring and Observability

### Health Checks

```typescript
// System health check
const health = await diasServices.systemHealthCheck();
console.log('System Health:', health.data);

// Individual service health
const mcpHealth = await diasServices.healthCheckMCPServers();
console.log('MCP Servers:', mcpHealth.data);
```

### Performance Metrics

The system automatically tracks:
- AI command execution times
- Token usage and costs
- MCP server response times
- Cache hit rates
- Task completion rates
- Error rates and patterns

### Event System

```typescript
// Add event listeners for monitoring
diasServices.addEventListener('ai-command-executed', {
  eventType: 'ai-command-executed',
  handler: async (event) => {
    console.log('AI Command:', event.data);
    // Send to monitoring system
  }
});

diasServices.addEventListener('task-status-changed', {
  eventType: 'task-status-changed', 
  handler: async (event) => {
    console.log('Task Status Changed:', event.data);
    // Update UI, send notifications
  }
});
```

## Troubleshooting

### Common Issues

1. **TaskMaster CLI Not Found**
   ```bash
   # Install globally or locally
   npm install -g task-master-ai
   # or
   npm install task-master-ai
   ```

2. **MCP Server Connection Issues**
   ```typescript
   // Check server availability
   const health = await diasServices.healthCheckMCPServers();
   console.log('MCP Status:', health.data);
   ```

3. **Database Connection Issues**
   ```bash
   # Verify database connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

4. **Cache Issues**
   ```typescript
   // Clear cache manually
   await diasServices.clearContextCache();
   ```

### Debugging

Enable debug logging:
```typescript
// Set log level in service configuration
process.env.LOG_LEVEL = 'debug';
```

Check service logs:
```bash
# View service logs
tail -f logs/dias-services.log
```

## Performance Optimization

### Caching Strategy

1. **L1 Cache**: In-memory LRU (fastest, limited size)
2. **L2 Cache**: Redis (fast, shared across instances)  
3. **L3 Cache**: Database (persistent, largest capacity)

### Model Selection Strategy

- **Haiku**: Simple routing, quick responses (cheapest)
- **Sonnet**: Development work, balanced performance (standard)
- **Opus**: Critical analysis, architecture decisions (most capable)

### Resource Management

- Circuit breaker prevents cascade failures
- Token bucket limits request rate
- Context compression reduces token usage
- MCP server pooling for high availability

## Security Considerations

### API Security

- Authentication required for all endpoints
- Rate limiting per user/IP
- Input validation and sanitization
- SQL injection prevention via parameterized queries

### Data Protection

- Sensitive data encryption at rest
- Session data expires automatically
- Context cache TTL enforcement
- Audit trail for all operations

### Access Control

- Role-based permissions for task management
- Project-based data isolation
- API key rotation support
- Service-to-service authentication

## Future Enhancements

### Planned Features

1. **Real-time Collaboration**: WebSocket support for real-time task updates
2. **Advanced Analytics**: ML-based usage pattern analysis
3. **Mobile API**: Mobile-optimized endpoints
4. **Plugin System**: Custom persona and command plugins
5. **Multi-tenant Support**: Enhanced isolation for enterprise usage

### Performance Improvements

1. **Connection Pooling**: Database connection optimization
2. **Caching Layer**: Redis cluster for distributed caching
3. **Async Processing**: Background task processing
4. **Metrics Collection**: Enhanced monitoring and alerting

## Support

### Documentation

- API Reference: `/docs/api`
- TypeScript Definitions: `src/lib/dias/services/types/`
- Database Schema: `src/lib/dias/services/database/schema.sql`

### Getting Help

1. Check the troubleshooting section above
2. Review service logs for error details
3. Verify configuration and environment variables
4. Test individual service components
5. Contact development team with detailed error information

---

**End of Integration Guide**