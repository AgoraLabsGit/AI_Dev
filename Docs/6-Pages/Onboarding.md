# Onboarding Page Documentation

## Overview

The Onboarding page (`/onboarding`) is the primary entry point for users to transform their project ideas into production-ready applications using Vibe Lab's AI-powered AVCA/DIAS pipeline. It combines conversational AI interaction with real-time document generation to create the Single Source of Truth documents that drive all subsequent development.

## Architecture

### UI/UX Flow

The onboarding experience follows a progressive disclosure pattern with two distinct modes:

#### 1. Single Panel Mode (Initial State)
- **Purpose**: Gather initial project information through conversational interface
- **Components**:
  - Project name input field
  - AI chat interface with quick actions
  - Upload options for GitHub, code, or documentation imports
  - SuperClaude integration for enhanced guidance

#### 2. Split Panel Mode (Document Generation)
- **Triggers**: Activates when sufficient project information is gathered
- **Layout**:
  - Left Panel (40%): Live document preview with real-time generation
  - Right Panel (60%): Continued chat interface for refinement
- **Documents Generated**:
  - Project Overview: Defines WHAT to build
  - Build Specifications: Defines HOW to build it

### Backend Architecture

#### Core Services

1. **AI Client Service** (`/lib/avca/services/ai-client.ts`)
   - Manages AI interactions with role-based personas
   - Handles Anthropic API integration
   - Supports Developer, Auditor, and Router AI roles

2. **Document Generator Service** (`/lib/avca/services/document-generator.ts`)
   - Template-based document generation
   - Section-by-section content creation
   - Confidence scoring and metadata tracking

3. **Event Bus** (`/lib/avca/services/event-bus.ts`)
   - Pub/sub messaging for service coordination
   - Event-driven architecture for loose coupling
   - Dead letter queue for failed messages

4. **DIAS Event Handler** (`/lib/dias/events/event-handlers.ts`)
   - Pattern recognition for intelligent routing
   - Context-aware processing
   - Learning system integration

#### API Endpoints

1. **`/api/onboarding/chat`** (Primary)
   - Main conversational endpoint
   - Integrates AVCA/DIAS services
   - Generates quick actions and suggestions
   - Extracts project information progressively

2. **`/api/onboarding/chat-staged`** (Enhanced)
   - Staged initialization for better performance
   - Health-aware routing between services
   - Fallback mechanisms for resilience

3. **SuperClaude Endpoints** (When enabled)
   - `/api/plan`: Strategic planning with architect persona
   - `/api/review`: Code review with QA persona
   - `/api/help`: Guidance with mentor persona

### State Management

The onboarding flow uses Zustand for state management (`/lib/stores/onboarding-store.ts`):

```typescript
interface OnboardingStore {
  // Document sections
  overviewSections: DocumentSection[]
  specsSections: DocumentSection[]
  
  // Generation state
  isGeneratingDocument: boolean
  currentGeneratingDocument: 'overview' | 'specs' | null
  
  // Actions
  generateDocumentSection(document, sectionId): Promise<void>
  updateDocumentSection(document, sectionId, content): void
  approveDocumentSection(document, sectionId): void
  regenerateDocumentSection(document, sectionId, feedback): Promise<void>
}
```

## AI Intelligence Integration

### AVCA Pipeline Integration

The onboarding page serves as **Stage 0** of the AVCA pipeline:

1. **User Conversation** → Natural language project description
2. **Information Extraction** → Structured data from conversation
3. **Document Generation** → Project Overview & Build Specifications
4. **Blueprint Creation** → Foundation for all subsequent stages

### DIAS Intelligence Features

1. **Pattern Recognition**
   - Identifies project type from conversation
   - Suggests relevant features and technologies
   - Adapts quick actions based on context

2. **Intelligent Routing**
   - Routes to appropriate AI personas
   - Selects optimal processing path
   - Falls back gracefully on service unavailability

3. **Context Management**
   - Maintains conversation history
   - Tracks extracted information
   - Progressive refinement of understanding

### SuperClaude Enhancement

When SuperClaude features are enabled:

1. **Persona-Based Responses**
   - **Architect**: Strategic planning, system design
   - **Mentor**: Best practices, guidance
   - **Frontend/Backend**: Technical recommendations

2. **Enhanced UI Indicators**
   - Persona badges showing active AI specialist
   - SuperClaude lightning bolt indicators
   - Token usage and confidence metrics

3. **MCP Server Integration**
   - **Context7**: Library documentation and patterns
   - **Sequential**: Complex analysis (planned)
   - **Magic**: UI component generation (planned)
   - **Playwright**: Testing scenarios (planned)

## Document Generation System

### Project Overview Sections

1. **What is this application?** - Core purpose and vision
2. **Target Users** - Primary audience and use cases
3. **Key Features** - Essential functionality
4. **Problem Solved** - Value proposition
5. **Success Metrics** - Measurable outcomes

### Build Specifications Sections

1. **Architecture** - High-level system design
2. **Technology Stack** - Frameworks and tools
3. **Data Model** - Entity relationships
4. **Integrations** - Third-party services
5. **Performance** - Scalability requirements
6. **Security** - Authentication and protection

### Generation Flow

1. **Trigger**: Chat accumulates sufficient information
2. **Section Generation**: AI generates content with typewriter effect
3. **User Actions**:
   - ✓ Approve: Lock section as complete
   - ↻ Regenerate: Request alternative content
   - ✏️ Edit: Manual content modification
   - ⌄ Expand: View full content

## Key Features

### 1. Progressive Information Gathering
- Starts with open-ended conversation
- Gradually structures information
- Adapts questions based on responses

### 2. Real-Time Document Generation
- Live typewriter effect for AI writing
- Section-by-section progress tracking
- Visual indicators for generation status

### 3. Multiple Entry Paths
- **Fresh Start**: Build from scratch
- **GitHub Import**: Enhance existing repository
- **Code Upload**: Improve existing codebase
- **Documentation Import**: Build from requirements

### 4. Quick Actions System
- Context-aware suggestions
- Stage-specific actions
- Keyboard shortcuts (planned)

### 5. Document Iteration Support
- Edit generated content
- Regenerate sections with feedback
- Maintain document versions

## Technical Implementation Details

### Feature Flags

```typescript
// Key feature flags for onboarding
{
  useSuperClaude: boolean      // Enable SuperClaude features
  showPersonaInfo: boolean      // Display AI persona indicators
  enableContext7: boolean       // Use Context7 for documentation
  showSuperClaudeIndicators: boolean  // UI enhancement indicators
}
```

### Monitoring Integration

The onboarding flow integrates with the logic monitoring system:

```typescript
logicMonitor.trackModule(
  'INTEGRATION',
  'ONBOARDING_CHAT',
  'process_message',
  { projectName, messageLength, stage }
)
```

### Error Handling

1. **Service Unavailability**: Falls back to basic AI processing
2. **Generation Failures**: Allows retry with user feedback
3. **Validation Errors**: Clear user messaging
4. **Timeout Protection**: 3-second initialization timeout

## Future Enhancements

### Planned Features

1. **Build Specifications Panel**
   - Currently only Project Overview is shown
   - Add second document preview for Build Specs
   - Synchronized generation between documents

2. **Enhanced SuperClaude Integration**
   - Wave orchestration for complex projects
   - Multi-agent collaboration
   - Parallel document generation

3. **Document Export**
   - Download as Markdown
   - Direct GitHub commit
   - API endpoint for programmatic access

4. **Template System**
   - Pre-built project templates
   - Industry-specific configurations
   - Custom template creation

5. **Validation & Scoring**
   - Document completeness scoring
   - Requirement validation
   - Conflict detection

### API Enhancements

1. **Document Generation Endpoint**
   ```typescript
   POST /api/onboarding/generate-document
   {
     documentType: 'overview' | 'specs',
     sectionId: string,
     context: ExtractedInfo,
     feedback?: string
   }
   ```

2. **Document Export Endpoint**
   ```typescript
   GET /api/onboarding/export/:sessionId
   Response: {
     projectOverview: Document,
     buildSpecifications: Document,
     blueprint: Blueprint
   }
   ```

## Configuration

### Environment Variables

```bash
# SuperClaude Features
NEXT_PUBLIC_USE_SUPERCLAUDE=true
NEXT_PUBLIC_SHOW_PERSONA_INFO=true
NEXT_PUBLIC_SHOW_SUPERCLAUDE_INDICATORS=true

# MCP Servers
NEXT_PUBLIC_ENABLE_CONTEXT7=true
NEXT_PUBLIC_ENABLE_SEQUENTIAL=false
NEXT_PUBLIC_ENABLE_MAGIC=false

# API Configuration
ANTHROPIC_API_KEY=your-key-here
```

### Deployment Considerations

1. **Performance**
   - Staged service initialization
   - Health-aware routing
   - Response time target: <1.5s

2. **Scalability**
   - Stateless API design
   - Session-based storage
   - Horizontal scaling ready

3. **Security**
   - Input validation
   - Rate limiting
   - API key protection

## Testing

### E2E Test Coverage

1. **Conversation Flow** (`/tests/e2e/onboarding-flow.spec.ts`)
   - Project information extraction
   - Document generation trigger
   - Quick action interactions

2. **API Integration** (`/tests/e2e/onboarding-api.spec.ts`)
   - Chat endpoint responses
   - Error handling
   - SuperClaude integration

### Manual Testing Checklist

- [ ] Fresh project creation flow
- [ ] GitHub import functionality
- [ ] Document generation accuracy
- [ ] Edit/regenerate actions
- [ ] SuperClaude persona responses
- [ ] Error recovery scenarios
- [ ] Performance under load

## Troubleshooting

### Common Issues

1. **Document Generation Not Starting**
   - Check if sufficient information extracted
   - Verify API key configuration
   - Check browser console for errors

2. **SuperClaude Not Working**
   - Verify feature flags enabled
   - Check ANTHROPIC_API_KEY
   - Confirm persona endpoints responding

3. **Slow Response Times**
   - Check service initialization status
   - Monitor API response times
   - Verify no rate limiting

### Debug Mode

Enable verbose logging:
```typescript
NEXT_PUBLIC_VERBOSE_LOGGING=true
```

Check monitoring dashboard at `/experimental/dev/monitor` for:
- AI module activation
- Token usage
- Response times
- Error patterns