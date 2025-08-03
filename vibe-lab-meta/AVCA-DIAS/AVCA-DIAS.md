# AVCA & DIAS System Overview

## Core Systems

### AVCA (AI-Verified Component Architecture)
- Takes project requirements and generates production-ready code
- Ensures consistent quality through automated verification
- Handles everything from importing existing code to final deployment
- Uses pure Tailwind CSS for all styling with multiple template options

**Core Functions:**
1. **AI Agents**
   - Developer: Full context code generation (150k tokens)
   - Auditor: Isolated review context (50k tokens)
   - Router: Intent classification (5k tokens)

2. **Pipeline Stages**
   - Import & Analysis
   - Blueprint Creation
   - Style Configuration
   - Page Design
   - Component Generation
   - Quality Validation
   - Registry Management
   - Application Assembly

3. **Testing & Quality**
   - E2E pipeline validation
   - Component system testing
   - Load testing capabilities
   - Performance benchmarking
   - Quality metrics tracking
   - Automated reporting

4. **Service Architecture**
   - Event-driven microservices
   - Health monitoring
   - Token tracking
   - Cost optimization
   - Concurrent request handling

### DIAS (Dynamic Intelligence & Adaptation System)
- Continuously learns from and improves your codebase
- Provides real-time suggestions and optimizations
- Monitors quality and performance
- Adapts to your project's patterns and preferences

**Core Functions:**
1. **Intelligence Engines**
   - Pattern Recognition Engine
   - Quality Analysis System
   - Performance Monitoring
   - Predictive Analytics

2. **Event System**
   - Real-time event processing
   - Audit trail tracking
   - Error handling & recovery
   - Event-based learning

3. **Adaptation Features**
   - Continuous learning
   - Pattern-based suggestions
   - Quality score optimization
   - Performance enhancement

4. **Integration Points**
   - AVCA pipeline monitoring
   - Component quality tracking
   - User feedback processing
   - System health metrics

## System Memory & Evolution

### Storage Types
1. **Short-term Memory**
   - In-memory caching (5 minutes)
   - Active session data
   - Current project context

2. **Medium-term Memory**
   - Redis cache (1 hour)
   - Recent patterns
   - Active project data

3. **Long-term Memory**
   - Database storage
   - Component registry
   - Usage patterns
   - Quality scores
   - Blueprint history

### Code Evolution
- Core implementation in `vibe-lab-product/lib/`
- Changes tracked through component registry
- Version control maintains history
- Future extraction to `vibe-lab-system` planned

## User Interaction & Pipeline Stages

### 1. Blueprint Creation
- **Interface**: Chat-based
- Uses DualClaudeChat
- Natural language requirements
- Developer creates, Auditor validates

### 2. Style Configuration
- **Interface**: UI-based
- Visual template selection
- Color scheme customization
- Component variant previews
- Real-time changes

### 3. Page Design
- **Interface**: Hybrid (UI + Chat)
- Visual page builder
- Layout discussions
- Best practices review

### 4. Component Generation
- **Interface**: Hybrid (UI + Chat)
- Component browser
- Visual previews
- Customization through chat

### 5. Quality Validation
- **Interface**: UI-based
- Quality dashboard
- Automated checks
- Performance metrics
- Security audits

### 6. Integration
- **Interface**: UI with Chat support
- Deployment dashboard
- Build monitoring
- Integration metrics

## Initial Setup Requirements

### Environment Configuration
```env
Required API Keys:
- ANTHROPIC_API_KEY
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
```

### Project Initialization
```typescript
Required Information:
- Project name & description
- Tech stack selection
- Functional requirements
- Design requirements
- Style preferences
```

### DIAS Configuration
```typescript
Settings:
- Audit trail enablement
- Learning system activation
- Suggestion system configuration
```

## Cost Optimization

### Model Selection
- Generation tasks: Claude-3-Sonnet
- Simple operations: Claude-3-Haiku
- Critical verification: Claude-3-Opus

### Results
- Original cost: $2.84 per pipeline run
- Optimized cost: $0.48 per pipeline run
- 83% cost reduction
- Maintained 90%+ quality coverage

## System Location

### Current Implementation
```
vibe-lab-product/
├── lib/
│   ├── avca/          - Core AVCA services
│   ├── dias/          - DIAS implementation
│   └── integration/   - Integration layer
```

### Future Location
```
vibe-lab-system/      - Clean, reusable core
├── avca-core/        - Pure AVCA implementation
└── dias-core/        - Pure DIAS implementation
```