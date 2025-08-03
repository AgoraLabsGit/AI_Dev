# 07 - Vibe Lab Patterns Master Blueprint
**Component Patterns, API Patterns, and Reusable Implementations**

---

## 1. Component Pattern Architecture

### Pure Tailwind Component Patterns
```typescript
interface ComponentPatterns {
  architecture: "Pure Tailwind utility classes only";
  templates: "Template-based styling variations";
  isolation: "Component-local styling with no global dependencies";
  validation: "Automated Tailwind compliance checking";
}
```

### Core Component Categories

#### 1. UI Foundation Components
```typescript
interface UIFoundationComponents {
  button: {
    variants: ["primary", "secondary", "destructive", "ghost", "outline"];
    sizes: ["sm", "md", "lg", "xl"];
    templates: ["strike", "linear", "apple", "material"];
    implementation: `
      const Button = ({ template = 'strike', variant = 'primary', size = 'md' }) => {
        const templateStyles = {
          strike: {
            primary: 'bg-surface hover:bg-surface-elevated text-foreground border border-border',
            secondary: 'bg-transparent hover:bg-surface text-foreground-secondary',
            destructive: 'bg-red-600 hover:bg-red-700 text-white'
          },
          linear: {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900'
          }
        };
        // Pure Tailwind implementation only
      };
    `;
  };
  
  input: {
    variants: ["default", "filled", "outlined"];
    states: ["default", "error", "disabled", "focused"];
    types: ["text", "email", "password", "number", "textarea"];
  };
  
  card: {
    variants: ["default", "elevated", "outlined", "glass"];
    templates: "Consistent with overall theme templates";
    usage: "Primary layout component for all content sections";
  };
}
```

#### 2. Navigation Components
```typescript
interface NavigationComponents {
  mainSidebar: {
    features: ["Collapsible", "Responsive", "Project context switching"];
    implementation: "Pure Tailwind with state management";
    patterns: "Consistent navigation across all project contexts";
  };
  
  projectNavigation: {
    structure: "Import → Design → Build → Deploy";
    subNavigation: "Stage-specific navigation (Blueprints, Styling, Pages, Components)";
    activeStates: "Clear visual indicators for current stage/page";
  };
  
  breadcrumbs: {
    pattern: "Project / Stage / Sub-stage";
    implementation: "Dynamic breadcrumb generation based on route";
    accessibility: "ARIA navigation landmarks";
  };
}
```

#### 3. Data Display Components
```typescript
interface DataDisplayComponents {
  projectCard: {
    data: "Project metadata, progress, status, tech stack";
    actions: "Quick access to project stages";
    states: "Active, completed, on-hold, archived";
    template: "Strike-inspired dark theme with status indicators";
  };
  
  statusIndicator: {
    types: ["AI agent status", "Build status", "Deployment status"];
    variants: ["active", "idle", "thinking", "blocked", "success", "error"];
    animation: "Subtle pulse animations for active states";
  };
  
  progressTracker: {
    usage: "AVCA pipeline progress, task completion";
    visualization: "Progress bars, step indicators, completion percentages";
    realtime: "Live updates via Server-Sent Events";
  };
}
```

#### 4. Form Components
```typescript
interface FormComponents {
  formField: {
    structure: "Label + Input + Error/Help text";
    validation: "Real-time validation with error states";
    accessibility: "Proper ARIA labeling and error association";
  };
  
  blueprintEditor: {
    features: ["Markdown editing", "AI assistance", "Auto-save"];
    implementation: "CodeMirror with Tailwind styling";
    integration: "AVCA/DIAS suggestions and validation";
  };
  
  componentSelector: {
    usage: "224-component selection interface";
    features: ["Search", "Category filtering", "Template preview"];
    performance: "Virtualized scrolling for large component lists";
  };
}
```

## 2. API Pattern Architecture

### RESTful API Patterns

#### 1. Authentication Patterns
```typescript
interface AuthenticationPatterns {
  oauth: {
    endpoint: "POST /api/v1/auth/github";
    implementation: `
      // GitHub OAuth flow
      export async function POST(request: Request) {
        try {
          const { code } = await request.json();
          const tokenResponse = await exchangeCodeForToken(code);
          const userProfile = await fetchGitHubProfile(tokenResponse.access_token);
          
          const session = await createUserSession(userProfile);
          return NextResponse.json({ success: true, session });
        } catch (error) {
          return handleAuthError(error);
        }
      }
    `;
  };
  
  sessionValidation: {
    middleware: "Session validation middleware for protected routes";
    implementation: "JWT validation with NextAuth.js integration";
    errorHandling: "Consistent error responses for auth failures";
  };
  
  logout: {
    endpoint: "POST /api/v1/auth/logout";
    implementation: "Session invalidation and cleanup";
    security: "Secure token revocation";
  };
}
```

#### 2. Project Management Patterns
```typescript
interface ProjectManagementPatterns {
  crud: {
    create: {
      endpoint: "POST /api/v1/projects";
      validation: "Zod schema validation for project data";
      implementation: `
        export async function POST(request: Request) {
          const session = await getServerSession();
          if (!session) return unauthorized();
          
          const projectData = await validateProjectInput(request);
          const project = await createProject({
            ...projectData,
            userId: session.user.id,
            status: 'active'
          });
          
          return NextResponse.json({ project });
        }
      `;
    };
    
    read: {
      endpoint: "GET /api/v1/projects/[id]";
      authorization: "User must have access to project";
      response: "Complete project data with related entities";
    };
    
    update: {
      endpoint: "PUT /api/v1/projects/[id]";
      validation: "Partial update validation";
      optimisticLocking: "Prevent concurrent update conflicts";
    };
  };
}
```

#### 3. AVCA Pipeline Patterns
```typescript
interface AVCAPipelinePatterns {
  stageExecution: {
    pattern: "Async job pattern with status tracking";
    implementation: `
      // Stage 1: Blueprint Processing
      export async function POST(request: Request) {
        const { projectId, blueprintData } = await request.json();
        
        // Validate access
        await validateProjectAccess(projectId, session.user.id);
        
        // Create job
        const job = await createAVCAJob({
          projectId,
          stage: 1,
          status: 'processing',
          input: blueprintData
        });
        
        // Queue for processing
        await queueAVCAStage1Processing(job.id);
        
        return NextResponse.json({ 
          jobId: job.id, 
          status: 'queued' 
        });
      }
    `;
  };
  
  statusTracking: {
    endpoint: "GET /api/v1/projects/[id]/avca/status";
    realtime: "Server-Sent Events for live updates";
    implementation: "Job status polling with WebSocket fallback";
  };
  
  stageResults: {
    endpoint: "GET /api/v1/projects/[id]/avca/[stage]/results";
    caching: "Cache stage results for performance";
    pagination: "Paginated results for large outputs";
  };
}
```

#### 4. AI Integration Patterns
```typescript
interface AIIntegrationPatterns {
  agentCoordination: {
    pattern: "Multi-agent workflow coordination";
    implementation: `
      export async function coordinateAgents(task: AITask) {
        // Developer Agent: Generate code
        const generationResult = await callDeveloperAgent({
          prompt: task.prompt,
          context: task.context,
          requirements: task.requirements
        });
        
        // Auditor Agent: Review code
        const auditResult = await callAuditorAgent({
          code: generationResult.code,
          requirements: task.requirements,
          securityChecks: true
        });
        
        // DIAS: Analyze patterns and quality
        const diasAnalysis = await callDIASAnalysis({
          code: generationResult.code,
          audit: auditResult,
          projectContext: task.projectId
        });
        
        return {
          generation: generationResult,
          audit: auditResult,
          analysis: diasAnalysis,
          status: auditResult.approved ? 'approved' : 'needs_revision'
        };
      }
    `;
  };
  
  costTracking: {
    pattern: "AI usage cost monitoring and limits";
    implementation: "Track token usage and costs per user/project";
    limits: "Enforce usage limits to prevent abuse";
  };
  
  contextManagement: {
    pattern: "Secure context isolation between users/projects";
    implementation: "Context-aware AI interactions with data isolation";
    privacy: "No cross-user data leakage in AI contexts";
  };
}
```

## 3. Database Pattern Architecture

### Data Access Patterns

#### 1. Project Data Patterns
```typescript
interface ProjectDataPatterns {
  hierarchical: {
    structure: "User → Projects → Stages → Components";
    implementation: `
      // Optimized project query with related data
      const getProjectWithStages = async (projectId: string, userId: string) => {
        return await prisma.project.findFirst({
          where: {
            id: projectId,
            userId: userId
          },
          include: {
            blueprints: true,
            styleConfiguration: true,
            pages: {
              include: {
                components: true
              }
            },
            generationJobs: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        });
      };
    `;
  };
  
  caching: {
    strategy: "Redis caching for frequently accessed project data";
    invalidation: "Cache invalidation on data updates";
    performance: "Sub-100ms query response times";
  };
}
```

#### 2. User Management Patterns
```typescript
interface UserManagementPatterns {
  profile: {
    data: "GitHub profile sync with local preferences";
    updates: "Incremental profile updates";
    privacy: "User data isolation and access control";
  };
  
  preferences: {
    storage: "User preferences and settings storage";
    sync: "Cross-device preference synchronization";
    defaults: "Sensible default preferences for new users";
  };
  
  usage: {
    tracking: "AI usage tracking for billing and limits";
    analytics: "User behavior analytics for product improvement";
    privacy: "Anonymized analytics data";
  };
}
```

## 4. Integration Pattern Architecture

### External Service Patterns

#### 1. GitHub Integration Patterns
```typescript
interface GitHubIntegrationPatterns {
  repository: {
    analysis: {
      pattern: "Repository structure analysis and metadata extraction";
      implementation: "GitHub API integration with rate limiting";
      caching: "Cache repository data to minimize API calls";
    };
    
    deployment: {
      pattern: "Automated repository creation and code push";
      implementation: "GitHub API + Git operations";
      security: "Secure token management and scoped permissions";
    };
  };
  
  webhooks: {
    pattern: "GitHub webhook handling for repository events";
    implementation: "Webhook signature verification and event processing";
    reliability: "Retry logic and error handling for webhook failures";
  };
}
```

#### 2. AI Service Integration Patterns
```typescript
interface AIServicePatterns {
  claude: {
    client: {
      implementation: "Claude API client with retry logic";
      errorHandling: "Graceful degradation for API failures";
      rateLimiting: "Respect Claude API rate limits";
    };
    
    prompting: {
      templates: "Structured prompt templates for consistency";
      context: "Context-aware prompting with project information";
      validation: "Input/output validation for AI interactions";
    };
  };
  
  monitoring: {
    usage: "AI service usage monitoring and alerting";
    performance: "Response time and quality metrics";
    costs: "Cost tracking and budget management";
  };
}
```

## 5. Error Handling & Validation Patterns

### Error Response Patterns
```typescript
interface ErrorPatterns {
  apiErrors: {
    structure: {
      error: {
        code: "ERROR_CODE";
        message: "Human-readable error message";
        details?: "Additional error context";
        timestamp: "ISO timestamp";
        requestId: "Unique request identifier";
      };
    };
    
    statusCodes: {
      400: "Bad Request - Invalid input data";
      401: "Unauthorized - Authentication required";
      403: "Forbidden - Insufficient permissions";
      404: "Not Found - Resource does not exist";
      409: "Conflict - Resource conflict (e.g., duplicate)";
      429: "Too Many Requests - Rate limit exceeded";
      500: "Internal Server Error - Unexpected server error";
    };
  };
  
  validation: {
    input: "Zod schema validation for all API inputs";
    sanitization: "Input sanitization for security";
    errorMessages: "Clear, actionable error messages";
  };
}
```

---

## Pattern Success Metrics

### Component Quality
- **Reusability**: 80%+ component reuse across different pages
- **Tailwind Compliance**: 100% pure Tailwind implementation
- **Performance**: <50ms component render time
- **Accessibility**: WCAG 2.1 AA compliance for all components

### API Performance  
- **Response Time**: <200ms for standard API calls
- **Error Rate**: <1% error rate for API endpoints
- **Uptime**: 99.9% API availability
- **Documentation**: 100% API endpoint documentation coverage

### Integration Reliability
- **GitHub API**: 99%+ successful repository operations
- **AI Services**: 95%+ successful AI agent interactions
- **Database**: <100ms query response time
- **Error Recovery**: <30 second recovery from transient failures

---

*This patterns blueprint provides reusable, tested implementations that ensure consistency and quality across all Vibe Lab components and integrations.*