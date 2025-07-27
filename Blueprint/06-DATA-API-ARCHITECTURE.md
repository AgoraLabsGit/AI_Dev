# 04 - Data & API Architecture
**Database Schema, API Contracts, and System Communication**
<!-- AI Genesis Guide: After defining core features, use this document to architect the data and communication backbone of the application. -->

---

## 1. Database Architecture (MVP)

### 1.1. Data Models & Schemas
- **User Model**
    - `id`: UUID (Primary Key)
    - `email`: Varchar(255) (Unique, Indexed)
    - `name`: Varchar(255)
    - `github_handle`: Varchar(255)
    - `avatar_url`: Text
    - `created_at`: Timestamp
    - `updated_at`: Timestamp
    - *Note*: No password field, as we will use GitHub OAuth for the MVP.

- **Project Model**
    - `id`: UUID (Primary Key)
    - `name`: Varchar(255)
    - `user_id`: UUID (Foreign Key to User.id, Indexed)
    - `status`: Varchar(50) (e.g., "Blueprint", "Foundation", "Complete")
    - `github_repo_url`: Text (nullable)
    - `created_at`: Timestamp
    - `updated_at`: Timestamp

- **Blueprint Model**
    - `id`: UUID (Primary Key)
    - `project_id`: UUID (Foreign Key to Project.id, Unique, Indexed)
    - `content`: JSONB (A single JSON object to hold all blueprint documents)
    - `created_at`: Timestamp
    - `updated_at`: Timestamp

- **Roadmap Model**
    - `id`: UUID (Primary Key)
    - `project_id`: UUID (Foreign Key to Project.id, Unique, Indexed)
    - `content`: JSONB (The generated component roadmap)
    - `created_at`: Timestamp
    - `updated_at`: Timestamp

- **Tasks Model (Task Master Enhanced)**
    - `id`: UUID (Primary Key)
    - `project_id`: UUID (Foreign Key to Project.id, Indexed)
    - `roadmap_id`: UUID (Foreign Key to Roadmap.id, Indexed)
    - `task_matrix`: JSONB (Enhanced task analysis with complexity scores, dependencies, MCP assignments)
    - `critical_path`: JSONB (Critical path analysis and timeline data)
    - `risk_assessment`: JSONB (Risk factors, mitigation strategies, fallback plans)
    - `resource_allocation`: JSONB (Parallel work streams and developer assignments)
    - `wave_strategy`: JSONB (Wave orchestration plan and validation gates)
    - `confidence_score`: Float (Task Master confidence level 0-1)
    - `created_at`: Timestamp
    - `updated_at`: Timestamp

---

## 2. API Architecture (MVP)

### 2.1. API Design Philosophy
- A standard RESTful API will be used, served via Next.js API routes.
- **Versioning Strategy**: `/api/v1/...`

### 2.2. Endpoint Definitions & Contracts

- **Authentication**
    - `GET /api/auth/signin`: Initiates GitHub OAuth flow.
    - `GET /api/auth/callback`: Handles the OAuth callback from GitHub.
    - `GET /api/auth/signout`: Logs the user out.

- **Projects**
    - `GET /api/v1/projects`: Get all projects for the authenticated user.
    - `POST /api/v1/projects`: Create a new project.

- **Blueprints**
    - `GET /api/v1/projects/{projectId}/blueprint`: Get the blueprint for a project.
    - `PUT /api/v1/projects/{projectId}/blueprint`: Save/update the blueprint.

- **Roadmap & Task Generation**
    - `POST /api/v1/projects/{projectId}/roadmap`: Triggers the AI to generate the component roadmap from the blueprint.
    - `GET /api/v1/projects/{projectId}/roadmap`: Get the generated roadmap for a project.
    - `POST /api/v1/projects/{projectId}/tasks/analyze`: Triggers Task Master to generate enhanced task analysis from the roadmap.
    - `GET /api/v1/projects/{projectId}/tasks`: Get the Task Master enhanced analysis with complexity scores, dependencies, and orchestration strategy.
    - `GET /api/v1/projects/{projectId}/tasks/critical-path`: Get critical path analysis and timeline visualization.
    - `GET /api/v1/projects/{projectId}/tasks/dependencies`: Get task dependency graph data.
    - `POST /api/v1/projects/{projectId}/generate`: The final step. Triggers the AI to generate the foundation, scaffold, and push the entire project to a new GitHub repository. This will initiate an asynchronous background job.

### 2.3. Authentication & Authorization
- **Flow**: Authentication will be handled exclusively through GitHub OAuth using NextAuth.js. All protected API routes will require a valid session.
- **Permissions**: Users can only access and modify their own projects, blueprints, and roadmaps. This will be enforced by checking the `user_id` on all database queries.

### 2.4. Security & CORS Policy
- **Rate Limiting**: Implement rate limiting on sensitive endpoints, especially the generation endpoints, to prevent abuse.
- **CORS**: Allow requests only from the official Vibe Lab web application's domain. 

---

## 3. Blueprint Content Schema & Validation
While the `content` field on the Blueprint model is a flexible JSONB field, it must adhere to a specific schema to be considered valid for generation. This schema will be enforced by the backend using Zod before any generation job is initiated.

- **Comprehensive Zod Schema:**
```typescript
// --- Core Data Structures ---
const userStorySchema = z.string().min(1, "User story cannot be empty.");
const featureEpicSchema = z.object({
  epic: z.string().min(1, "Epic title cannot be empty."),
  stories: z.array(userStorySchema).min(1, "An epic must have at least one user story."),
});

const pageComponentSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().min(1),
});

// --- Main Blueprint Documents ---
const projectVisionSchema = z.object({
  core_problem: z.string().min(1),
  solution: z.string().min(1),
  target_audience: z.object({
    coders: z.string().min(1),
    creators: z.string().min(1),
  }),
  non_goals: z.array(z.string()).optional(),
});

const coreFeaturesSchema = z.object({
  epics: z.array(featureEpicSchema).min(1, "Must define at least one core feature epic."),
});

const pageArchitectureSchema = z.object({
  pages: z.array(z.object({
    name: z.string().min(1),
    route: z.string().min(1),
    purpose: z.string().min(1),
    scope: z.enum(["MVP", "Post-MVP"]),
    components: z.array(pageComponentSchema).optional(),
  })).min(1, "Must define at least one page."),
});

// --- The Master Blueprint Schema ---
export const masterBlueprintSchema = z.object({
  project_vision: projectVisionSchema,
  core_features: coreFeaturesSchema,
  page_architecture: pageArchitectureSchema,
  // ... other top-level documents like tech_stack, ui_ux_blueprint etc. can be added here
});
```

---

## 4. Component Roadmap Generation Logic
The process of generating the component roadmap from the completed blueprints is a core AI function.

1.  **Input**: The full, validated JSON content of the project's blueprint.
2.  **Process**: The backend sends the blueprint content to the SuperClaude/ClaudeCode service with a specialized system prompt.
    - **System Prompt Example**: "You are an expert software architect. Analyze the following project blueprint, including the UI/UX design, page architecture, and data models. Based on this analysis, generate a list of all necessary, reusable UI components and backend modules. For each component, provide a name, a brief description, and categorize it (e.g., 'UI Component', 'Backend Module', 'API Service'). Output the result as a structured JSON array."
3.  **Output**: The AI returns a JSON array of component objects.
    - **Example Output**:
    ```json
    [
      { "name": "<Button />", "description": "A reusable button for primary and secondary actions.", "category": "UI Component" },
      { "name": "useAuth()", "description": "A hook for managing user authentication state.", "category": "Backend Module" }
    ]
    ```
4.  **Storage**: This JSON array is saved to the `content` field of the `Roadmap` model in the database.

---

## 5. AI Integration Architecture

### 3.1. Core Technologies
- **AI Model**: Gemini 2.5 Pro will be the primary model for conversation, analysis, and code generation.
- **Integration Layer**: A dedicated backend service, "SuperClaude/ClaudeCode," will manage all interactions with the Gemini API. This service acts as an abstraction layer, handling prompt engineering, conversation history, state management, and token optimization.

### 3.2. Data Flow for AI Chat
1.  The Next.js frontend sends a user's message to the SuperClaude/ClaudeCode API.
2.  The API retrieves the relevant conversation history from the database.
3.  It constructs a detailed prompt for the Gemini 2.5 Pro model, including the history, user message, and current project context (e.g., the active blueprint document).
4.  The response from Gemini is streamed back through the integration layer to the frontend UI for a real-time chat experience.
5.  The full conversation turn (user message + AI response) is persisted in the database.

---

## 4. Code Generation & GitHub Pipeline

### 4.1. Asynchronous Workflow
The entire code generation process is asynchronous and managed by a background job queue (e.g., Inngest, BullMQ).

1.  The user clicks "Generate" in the frontend.
2.  An API call is made to the backend, which creates a new `generation_job` in the queue and immediately returns a `job_id` to the client.
3.  The client now polls a `GET /api/v1/jobs/{jobId}/status` endpoint every few seconds to get progress updates (e.g., "Analyzing blueprints...", "Generating components...", "Pushing to GitHub...").

### 4.2. Generation Job Steps
A background worker picks up the job and executes the following steps:
1.  **Fetch Data**: Retrieve the project's blueprint and roadmap from the database.
2.  **Generate Code**: Make a series of calls to the Gemini/SuperClaude service to generate the file contents based on the blueprint.
3.  **Assemble In-Memory**: Create the full project structure (directories and files) in memory or on temporary storage.
4.  **Connect to GitHub**: Use the user's OAuth token to create a new repository on their GitHub account.
5.  **Commit & Push**: Commit the generated files to the new repository and push them.
6.  **Update Database**: Update the `project` record in our database with the new GitHub repo URL and set its status to "Complete."
7.  **Final Status**: Update the job status to "Success." The polling frontend will see this and can then provide the user with a link to their new repository.

---

## 5. Security & Privacy Framework

### 5.1. Authentication & Authorization
- **Flow**: Authentication is handled exclusively through GitHub OAuth via NextAuth.js.
- **Data Access**: All API endpoints and database queries are strictly scoped to the authenticated `user_id`. A user can **never** see or access another user's data. This will be enforced at the database level using Row-Level Security (RLS) policies in PostgreSQL.

### 5.2. GitHub Integration Security
- **OAuth Scopes**: We will request the minimum necessary GitHub OAuth scopes. Initially, this will be `repo` (to create and write to repositories) and `user:email` (to read the user's primary email). The user will be clearly informed why these permissions are needed.
- **Token Management**: User OAuth tokens are encrypted at rest in the database and are only ever used by the background generation service for the brief period needed to create and push to a repository. They are never exposed to the client-side or logged.

### 5.3. API Security
- **Rate Limiting**: All API endpoints will have strict rate limiting to prevent abuse. The generation endpoints will have a particularly low limit (e.g., a user can only start a few generation jobs per hour).
- **CORS**: The API will only accept requests from the official Vibe Lab frontend domain. 