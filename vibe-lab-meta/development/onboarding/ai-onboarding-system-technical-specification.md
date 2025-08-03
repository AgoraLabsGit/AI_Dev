# Vibe Lab AI Onboarding System
## Technical Specification & Implementation Guide

## Overview

The Vibe Lab AI Onboarding System transforms a conversational interview into a complete application blueprint. The system guides users through project definition, technical specifications, page structure, and visual design using intelligent inference and interactive builders.

**Complete Flow**:
1. GitHub Sign In
2. Project Overview (what & why)
3. Build Specifications (technical how)
4. Pages (main sections)
5. Sub-Pages (nested structure)
6. Navigation (how users move)
7. Components (page contents)
8. Styling (visual design)

**Goal**: Complete blueprint in 15-20 minutes with minimal typing through Quick Actions and visual builders.

---

## Core System Architecture

### 1. Conversation Intelligence Engine

```typescript
interface OnboardingAI {
  // Core capabilities
  capabilities: {
    patternRecognition: "Identify project type from initial description",
    inferenceEngine: "Extract 3-5 insights from each user response",
    smartDefaults: "Apply best practices based on project type",
    conversationFlow: "Dynamic question routing based on context"
  };
  
  // Optimization targets
  targets: {
    totalQuestions: "4-6 maximum",
    completionTime: "3-5 minutes",
    documentCompleteness: "95% without follow-up",
    userSatisfaction: "Feel heard and understood"
  };
}
```

### 2. Information Extraction Strategy

```typescript
class InformationExtractor {
  // Multi-layered extraction from single response
  extractFromResponse(userInput: string): ExtractedInfo {
    return {
      explicit: this.parseDirectStatements(userInput),
      implicit: this.inferFromContext(userInput),
      patterns: this.matchKnownPatterns(userInput),
      sentiment: this.analyzeToneAndExpertise(userInput),
      gaps: this.identifyMissingCriticalInfo(userInput)
    };
  }
  
  // Pattern library for common project types
  projectPatterns = {
    "like [X] but for [Y]": {
      type: "familiar-model-new-market",
      inferences: ["feature-set", "user-base", "core-mechanics"],
      followUp: "unique-value-proposition"
    },
    "help [USERS] to [ACTION]": {
      type: "problem-solving-tool",
      inferences: ["target-audience", "core-feature", "success-metric"],
      followUp: "scale-and-growth"
    },
    "marketplace for [CATEGORY]": {
      type: "two-sided-platform",
      inferences: ["buyer-persona", "seller-persona", "transaction-type"],
      followUp: "monetization-model"
    },
    "AI-powered [FUNCTION]": {
      type: "ai-enhancement-tool",
      inferences: ["automation-target", "data-requirements", "accuracy-needs"],
      followUp: "ai-interaction-model"
    }
  };
}
```

---

## Conversation Flow Architecture

### Opening Strategy

```yaml
AI: "Hello! What are you building today?"

# This single open question reveals:
# 1. Project type (app, website, tool, game)
# 2. Domain (social, productivity, entertainment)
# 3. Technical sophistication (how they describe it)
# 4. Excitement level (passion indicators)
# 5. Scope awareness (feature creep risk)
```

### Dynamic Question Routing

```typescript
class ConversationRouter {
  getNextQuestion(context: ConversationContext): Question {
    // Priority hierarchy
    const priorities = [
      { gap: "core-value", question: this.askAboutUniqueness },
      { gap: "target-users", question: this.askAboutAudience },
      { gap: "technical-needs", question: this.askAboutRequirements },
      { gap: "scale-vision", question: this.askAboutGrowth }
    ];
    
    // Skip if already inferred
    const unansweredPriorities = priorities.filter(p => 
      !this.hasInferredAnswer(context, p.gap)
    );
    
    // Return highest priority question or move to confirmation
    return unansweredPriorities[0]?.question || this.generateConfirmation;
  }
  
  // Question formulation based on user sophistication
  formulateQuestion(topic: string, userLevel: "technical" | "non-technical"): string {
    const questionBank = {
      uniqueness: {
        technical: "What's your unique technical approach or architecture?",
        nonTechnical: "What makes this special compared to existing options?"
      },
      scale: {
        technical: "What's your scaling strategy and expected load?",
        nonTechnical: "Is this for a small group or hoping to go big?"
      }
    };
    
    return questionBank[topic][userLevel];
  }
}
```

---

## Proactive AI Features

### Project Naming Intelligence

```typescript
interface ProjectNamingAI {
  async generateNames(context: OnboardingContext): Promise<ProjectNameSuggestions> {
    const suggestions = await this.analyzeContext(context);
    
    return {
      names: [
        {
          name: "RecipeGram",
          reasoning: "Combines recipe + Instagram model",
          available: true,
          brandStrength: 0.85
        },
        {
          name: "CookShare",
          reasoning: "Clear, descriptive brand",
          available: true,
          brandStrength: 0.75
        }
      ],
      quickActions: [
        { label: suggestions[0].name, action: () => selectName(suggestions[0]) },
        { label: suggestions[1].name, action: () => selectName(suggestions[1]) },
        { label: "I have my own name", action: () => openNameInput() }
      ]
    };
  }
}
```

### Interactive Quick Actions Integration

```typescript
interface OnboardingMessage {
  type: 'ai' | 'user' | 'interactive';
  content: string;
  quickActions?: QuickAction[];
  documentPreview?: DocumentPreview;
}

interface QuickAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'suggest' | 'multi-select';
  action: () => void;
  selected?: boolean;
  icon?: string;
}
```

## Example Interactive Conversation Flow

### Flow 1: Social Platform with Quick Actions

```yaml
AI: "Welcome to Vibe Lab! In just a few minutes, I'll help you create a 
     Project Overview that captures your vision and Build Specifications 
     that show exactly how to build it. What are you imagining?"

User: "I want to build Instagram for dog owners"

AI: "Love it! A social platform for dog lovers. Let me suggest some names:"
QuickActions: [
  "🐕 BarkBook" (suggest),
  "📸 PawPics" (suggest),
  "🐾 Pawstagram" (suggest),
  "Type my own..." (secondary)
]

User: [Clicks "BarkBook"]

AI: "BarkBook - perfect! What features would make this special for dog owners?"
QuickActions: [
  "🏥 Vet Records" (multi-select),
  "🗺️ Dog Parks Map" (multi-select),
  "👥 Playdate Scheduler" (multi-select),
  "🏆 Cute Contests" (multi-select),
  "💊 Medicine Reminders" (multi-select),
  "Keep it simple" (secondary)
]

User: [Selects "Dog Parks Map" and "Playdate Scheduler"]

AI: "Great choices! Is this starting local or going global from day one?"
QuickActions: [
  "🏘️ Start local, expand later" (suggest),
  "🌍 Global from day one" (suggest),
  "🏙️ Major cities only" (suggest)
]

User: [Clicks "Start local, expand later"]

AI: "Perfect! Based on our chat, here's what I've created for BarkBook:"
DocumentPreview: [Shows Project Overview and Build Specs]
QuickActions: [
  "✅ Looks perfect! Let's build" (primary),
  "✏️ Make some edits" (secondary),
  "🔄 Start over" (secondary)
]
```

### Flow 2: Business Tool

```yaml
User: "I need a tool to help contractors manage their projects better"

AI Infers:
  - B2B application
  - Project management focus
  - Mobile-likely (on-site use)
  - Multiple user types

AI Asks: "Got it - project management for contractors. Are we talking about 
          general contractors managing subs and schedules, or specialized 
          contractors tracking their own work?"

User: "General contractors, they have so many subs to coordinate"

AI Infers:
  - Complex user hierarchy
  - Scheduling critical
  - Communication features
  - Payment tracking likely

AI Asks: "Makes sense - coordinating subs is chaos. Would they use this mainly 
          on job sites from phones, or back in the office on computers?"

User: "Both, but mobile is super important on site"

AI Infers:
  - Mobile-first design
  - Offline capability important
  - Sync requirements
  - Simple UI for field use

AI Confirms: "I'll create ContractorHub - a mobile-first project management 
             platform for general contractors to coordinate subcontractors, 
             schedules, and job progress. Works offline on job sites and 
             syncs to the office. Ready to build?"
```

---

## Document Generation Engine

### Project Overview Generator

```typescript
class ProjectOverviewGenerator {
  generate(conversation: Conversation): ProjectOverview {
    const extractor = new ConversationDataExtractor(conversation);
    
    return {
      // One compelling sentence
      description: this.craftDescription(
        extractor.getProjectType(),
        extractor.getUniqueValue()
      ),
      
      // Specific but concise
      targetUsers: this.identifyPrimaryUsers(
        extractor.getAllUserMentions()
      ),
      
      // Prioritized feature list
      keyFeatures: this.selectTopFeatures(
        extractor.getAllFeatures(),
        { max: 5, priorityWeighted: true }
      ),
      
      // Inferred from solution
      problemSolved: this.articulateProblem(
        extractor.getSolutionStatement()
      ),
      
      // Relevant metrics only
      successMetrics: this.generateMetrics(
        extractor.getProjectType(),
        extractor.getScaleAmbition()
      )
    };
  }
  
  // Example output formatter
  formatDescription(type: string, uniqueValue: string): string {
    const templates = {
      'social-platform': `${uniqueValue}-focused social platform for ${target}`,
      'marketplace': `${transaction} marketplace connecting ${buyers} with ${sellers}`,
      'productivity-tool': `${workflow} automation platform for ${industry}`,
      'ai-application': `AI-powered ${function} assistant for ${users}`
    };
    
    return fillTemplate(templates[type], extractedData);
  }
}
```

### Build Specifications Generator

```typescript
class BuildSpecsGenerator {
  generate(conversation: Conversation, projectOverview: ProjectOverview): BuildSpecs {
    const analyzer = new TechnicalRequirementsAnalyzer(conversation);
    const projectType = analyzer.getProjectType();
    
    return {
      // Optimal architecture for project type
      architecture: this.selectArchitecture({
        projectType,
        scalingNeeds: analyzer.getScalingRequirements(),
        performanceNeeds: analyzer.getPerformanceRequirements(),
        costSensitivity: analyzer.inferCostSensitivity()
      }),
      
      // Smart framework selection
      techStack: {
        framework: this.selectFramework(projectType, analyzer.getFeatures()),
        database: this.selectDatabase(analyzer.getDataPatterns()),
        authentication: this.selectAuth(analyzer.getUserTypes()),
        storage: this.selectStorage(analyzer.getMediaRequirements())
      },
      
      // Inferred from features
      coreComponents: this.identifyCoreComponents(
        projectOverview.keyFeatures
      ),
      
      // Best practices for type
      integrations: this.recommendIntegrations(
        projectType,
        analyzer.getExplicitRequirements()
      ),
      
      // Sensible defaults
      performance: this.setPerformanceTargets(
        projectType,
        analyzer.getScaleAmbition()
      ),
      
      // Security by project type
      security: this.configureSecuritya(
        analyzer.getDataSensitivity(),
        analyzer.getComplianceNeeds()
      )
    };
  }
}
```

---

## Intelligence Patterns

### Feature Inference Engine

```typescript
const featureInference = {
  // If user mentions "social", infer these features
  'social': ['user-profiles', 'follow-system', 'content-feed', 'notifications'],
  
  // If user mentions "marketplace", infer these
  'marketplace': ['listings', 'search', 'messaging', 'payments', 'reviews'],
  
  // If user mentions "AI", infer these needs
  'ai-powered': ['model-integration', 'training-data', 'feedback-loop', 'api-costs'],
  
  // If user mentions "team", infer these
  'team-collaboration': ['workspaces', 'permissions', 'real-time-sync', 'audit-trail']
};
```

### Technical Decision Matrix

```typescript
const technicalDecisions = {
  'high-media-content': {
    storage: 'cloudinary',
    cdn: 'required',
    database: 'postgresql-with-s3'
  },
  
  'real-time-features': {
    framework: 'nextjs-with-socketio',
    infrastructure: 'websocket-support',
    hosting: 'railway-or-render'
  },
  
  'enterprise-b2b': {
    auth: 'auth0-with-sso',
    security: 'sox-compliant',
    features: ['audit-logs', 'role-based-access', 'data-export']
  },
  
  'consumer-mobile': {
    framework: 'react-native-or-flutter',
    auth: 'social-login-priority',
    features: ['offline-mode', 'push-notifications']
  }
};
```

---

## Example Output Documents

### Minimal Input → Complete Documentation

**User Input Total**: ~50 words across 3 responses

**Generated Project Overview**: (100 words)
```markdown
# ContractorHub

**Description:** Mobile-first project management platform for general contractors coordinating subcontractors

**Target Users:** General contractors and their subcontractor teams

**Key Features:**
1. Subcontractor scheduling and coordination
2. Mobile-offline job site access  
3. Progress tracking with photos
4. Payment milestone management
5. Team communication hub

**Problem Solved:** Contractors lose time and money due to poor subcontractor coordination and lack of real-time project visibility

**Success Metrics:** 500 contractor companies, 90% daily active usage, 30% reduction in project delays
```

**Generated Build Specifications**: (150 words)
```yaml
# Build Specifications

architecture: progressive-web-app
framework: nextjs-14-with-pwa
database: postgresql-with-redis-cache

tech_stack:
  frontend: react-with-material-ui
  backend: nodejs-api-routes  
  mobile: pwa-with-offline-support
  storage: aws-s3-for-photos

data_model:
  - companies (contractors, subs)
  - projects (timelines, milestones)
  - tasks (assignments, status)
  - communications (messages, notifications)
  - payments (milestones, approvals)

authentication:
  provider: auth0
  features: [invite-only, role-based, sso-ready]

core_integrations:
  - twilio (sms-notifications)
  - stripe (payment-processing)
  - aws-s3 (photo-storage)
  - sendgrid (email)

performance:
  offline_capability: full-feature-offline
  sync_strategy: conflict-resolution
  mobile_optimization: aggressive

security:
  data_isolation: company-level
  compliance: contractor-regulations
  backups: automated-daily

deployment:
  platform: vercel
  environments: [dev, staging, production]
  ci_cd: github-actions
```

---

## Implementation Roadmap

### Phase 1: Core Infrastructure (3-4 days)
```yaml
Day 1-2:
  - Create OnboardingChat component with message handling
  - Build QuickAction component system
  - Set up onboarding route and navigation
  - Create message type definitions
  - Implement split-screen layout (chat + documents)

Day 3-4:
  - Implement OnboardingAIService
  - Create pattern matching for project types
  - Build information extraction logic
  - Set up context management
  - Create LiveDocumentPreview component
```

### Phase 2: Interactive Features (3-4 days)
```yaml
Day 5-6:
  - Implement project name generation
  - Create feature suggestion engine
  - Build multi-select quick actions
  - Add progress indicators
  - Implement typewriter effect for document generation

Day 7-8:
  - Create real-time document building with sections
  - Implement section-level approval/regenerate/edit
  - Add inline editing functionality
  - Build document master controls
  - Create mobile swipeable view
```

### Phase 3: Integration & Polish (2-3 days)
```yaml
Day 9-10:
  - Connect to AVCA pipeline
  - Update database schema
  - Implement project creation flow
  - Add error handling
  - Build AI-assisted editing features

Day 11:
  - Polish UI/UX and animations
  - Add loading states
  - Implement analytics
  - Testing and refinement
  - Add keyboard shortcuts
```

### Component Dependencies
```yaml
Required Components:
  - OnboardingChat (main container)
  - QuickActionButton (from Quick Action System)
  - LiveDocumentPreview (real-time document UI)
  - TypewriterEffect (text animation)
  - EditableSection (inline editing)
  - DocumentMasterControls (approve all/regenerate)
  - MessageList (chat messages)
  - ChatInput (user input)
  
See Also:
  - "Vibe Lab Real-Time Document Crafting UI" specification
  - "Vibe Lab Quick Action System" specification
```

## Database Schema Updates

```prisma
// Add to schema.prisma
model OnboardingSession {
  id            String   @id @default(cuid())
  userId        String
  projectId     String?  @unique
  messages      Json     // Conversation history
  context       Json     // Extracted information
  stage         String   // Current onboarding stage
  completed     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
  project       Project? @relation(fields: [projectId], references: [id])
}

model ProjectOverview {
  id            String   @id @default(cuid())
  projectId     String   @unique
  name          String   // Project name
  description   String
  targetUsers   String
  keyFeatures   Json     // Array of features
  problemSolved String
  successMetrics Json    // Array of metrics
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  project       Project  @relation(fields: [projectId], references: [id])
}

model BuildSpecifications {
  id            String   @id @default(cuid())
  projectId     String   @unique
  architecture  String
  techStack     Json     // Detailed tech choices
  dataModel     Json     // Data structure
  integrations  Json     // Third-party services
  performance   Json     // Performance targets
  security      Json     // Security requirements
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  project       Project  @relation(fields: [projectId], references: [id])
}
```

## Key Integration Points

### 1. Router Updates
```typescript
// app/(app)/onboarding/page.tsx
export default function OnboardingPage() {
  return <OnboardingChat />;
}

// app/(app)/projects/page.tsx
export default function ProjectsPage() {
  const { data: projects } = api.project.list.useQuery();
  
  if (!projects || projects.length === 0) {
    redirect('/onboarding');
  }
  
  return <ProjectsList projects={projects} />;
}
```

### 2. API Endpoints
```typescript
// server/api/routers/onboarding.ts
export const onboardingRouter = createTRPCRouter({
  saveSession: protectedProcedure
    .input(z.object({
      messages: z.array(messageSchema),
      context: z.record(z.any()),
      stage: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.onboardingSession.upsert({
        where: { userId: ctx.session.user.id },
        update: input,
        create: {
          userId: ctx.session.user.id,
          ...input
        }
      });
    }),
    
  createProject: protectedProcedure
    .input(z.object({
      projectOverview: projectOverviewSchema,
      buildSpecifications: buildSpecsSchema
    }))
    .mutation(async ({ ctx, input }) => {
      // Create project with documents
      const project = await ctx.db.project.create({
        data: {
          name: input.projectOverview.name,
          description: input.projectOverview.description,
          userId: ctx.session.user.id,
          projectOverview: {
            create: input.projectOverview
          },
          buildSpecifications: {
            create: input.buildSpecifications
          }
        }
      });
      
      // Initialize AVCA pipeline
      await initializeAVCAPipeline(project.id);
      
      return project;
    })
});
```

## Testing Strategy

```typescript
// __tests__/onboarding.test.tsx
describe('Onboarding Flow', () => {
  it('completes full onboarding in 4-6 questions', async () => {
    const { user } = renderOnboarding();
    
    // Initial message
    expect(screen.getByText(/Welcome to Vibe Lab/)).toBeInTheDocument();
    
    // User describes project
    await user.type('I want to build Instagram for dogs');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    
    // Should show name suggestions
    expect(screen.getByText(/suggest some names/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /BarkBook/ })).toBeInTheDocument();
    
    // Select name
    await user.click(screen.getByRole('button', { name: 'BarkBook' }));
    
    // Continue through flow...
  });
});
```

---

## Success Metrics

1. **Efficiency**: Average 2-3 interactions per step (mostly Quick Actions)
2. **Speed**: 15-20 minute total completion time
3. **Completeness**: 100% of application structure defined before code generation
4. **Quality**: Generated blueprint passes all AVCA validation
5. **Satisfaction**: Users feel in control with visual builders and previews
6. **Accessibility**: Non-technical users complete without confusion

---

*This system transforms the daunting task of application planning into an intuitive, visual experience, making professional software development accessible to everyone regardless of technical expertise.*