# AVCA/DIAS Logic Monitoring Guide

## Overview

The Logic Monitoring system provides real-time visibility into AVCA and DIAS operations, showing which modules are triggered and their decision-making processes during development.

## Current Implementation Status

Based on the roadmap review, here's the mapping between monitoring modules and actual implemented services:

### ✅ Fully Implemented Services

#### AVCA Services
- **AI_CLIENT** → `lib/avca/services/ai-client.ts`
  - Multi-path analysis (fresh, github, code, docs)
  - Token tracking and cost monitoring
  - Rate limiting and retry handling
  
- **SOURCE_ANALYZER** → `lib/avca/services/source-analyzer.ts`
  - GitHub repository analysis
  - Code file analysis
  - Documentation analysis
  
- **DOCUMENT_GENERATOR** → `lib/avca/services/document-generator.ts`
  - Overview document generation
  - Technical specs generation
  - Section-based generation
  
- **BLUEPRINT_SERVICE** → `lib/avca/services/blueprint-service.ts`
  - Blueprint generation from analysis
  - Blueprint validation
  - AVCA format conversion
  
- **MIGRATION_SERVICE** → `lib/avca/services/migration-service.ts`
  - Repository migration analysis
  - Code migration planning
  - Documentation migration

#### DIAS Services
- **PATTERN_RECOGNITION** → `lib/dias/intelligence/pattern-recognition-engine.ts`
  - Source pattern analysis
  - Migration pattern detection
  - Page structure inference
  
- **FRAMEWORK_DETECTOR** → `lib/dias/intelligence/framework-detector.ts`
  - Framework signature detection
  - Version identification
  - Confidence scoring
  
- **LEARNING_SYSTEM** → `lib/dias/intelligence/learning-system.ts`
  - Migration learning capabilities
  - Pattern optimization
  - Strategy adjustment
  
- **EVENT_HANDLER** → `lib/dias/events/event-handlers.ts`
  - Event routing and processing
  - Retry mechanisms
  - Processing history

#### Integration Services
- **SYSTEM_INTEGRATOR** → `lib/integration/system-integrator.ts`
  - AVCA/DIAS orchestration
  - Service coordination
  - Resilience patterns
  
- **RESILIENCE_MANAGER** → `lib/integration/resilience/circuit-breaker.ts`
  - Circuit breaker patterns
  - Retry policies
  - Health checks
  
- **PERFORMANCE_MONITOR** → `lib/integration/monitoring/metrics-collector.ts`
  - Service metrics collection
  - Performance tracking
  - Health monitoring

### 🚧 Services from Analysis Pipeline (Week 2)
- **ARCHITECTURE_ANALYZER** → Part of `lib/dias/analysis/unified-pipeline.ts`
- **COMPONENT_MAPPER** → Functionality in pattern recognition
- **INTELLIGENCE_ENGINE** → Core DIAS functionality distributed across services

### 📊 Module Mapping

| Monitor Module | Actual Service | Location | Status |
|----------------|----------------|----------|--------|
| AI_CLIENT | AIClientService | `lib/avca/services/ai-client.ts` | ✅ |
| SOURCE_ANALYZER | SourceAnalyzer | `lib/avca/services/source-analyzer.ts` | ✅ |
| DOCUMENT_GENERATOR | DocumentGenerator | `lib/avca/services/document-generator.ts` | ✅ |
| BLUEPRINT_SERVICE | BlueprintService | `lib/avca/services/blueprint-service.ts` | ✅ |
| MIGRATION_SERVICE | MigrationService | `lib/avca/services/migration-service.ts` | ✅ |
| PIPELINE | Component Pipeline | `lib/avca/pipeline/component-pipeline/` | ✅ |
| VALIDATOR | Quality Assurance | `lib/avca/pipeline/component-pipeline/quality-assurance.ts` | ✅ |
| PATTERN_RECOGNITION | PatternRecognitionEngine | `lib/dias/intelligence/pattern-recognition-engine.ts` | ✅ |
| FRAMEWORK_DETECTOR | FrameworkDetector | `lib/dias/intelligence/framework-detector.ts` | ✅ |
| ARCHITECTURE_ANALYZER | Code/Repo/Doc Analyzers | `lib/dias/analysis/processors/` | ✅ |
| COMPONENT_MAPPER | Part of Pattern Recognition | Integrated | ✅ |
| LEARNING_SYSTEM | LearningSystem | `lib/dias/intelligence/learning-system.ts` | ✅ |
| EVENT_HANDLER | EventHandlingSystem | `lib/dias/events/event-handlers.ts` | ✅ |
| INTELLIGENCE_ENGINE | Unified Pipeline | `lib/dias/analysis/unified-pipeline.ts` | ✅ |

## How to Use the Monitoring System

### 1. Development Dashboard
Navigate to `http://localhost:3000/dev/monitor` to see:
- Real-time module activations
- Decision points and logic flow
- Performance metrics
- System health status

### 2. Console Output
When running in development mode, you'll see color-coded logs:
- 🔷 Blue: AVCA operations
- 🧠 Green: DIAS intelligence
- 🔗 Purple: Integration layer
- 🟨 Yellow: Pipeline events
- 🟥 Red: Errors and warnings

### 3. Test the System
```bash
# Run the monitoring test
npm run test:logic-monitor

# This will demonstrate:
# - Fresh project analysis flow
# - GitHub migration analysis
# - Module statistics
# - Missing module detection
```

### 4. Integration with Services

To add monitoring to a service:

```typescript
import { MonitorAVCA, MonitorDIAS } from '@/lib/monitoring/logic-monitor-integration';

export class YourService {
  @MonitorAVCA('YOUR_MODULE')
  async yourMethod(input: any) {
    // Your logic here
  }
}
```

### 5. Key Events to Monitor

#### AVCA Events
- `ai:request:start/complete` - AI processing
- `blueprint:generation:start/complete` - Blueprint creation
- `document:generation:start/complete` - Document generation
- `migration:analysis:start/complete` - Migration planning
- `source:analysis:start/complete` - Source code analysis

#### DIAS Events
- `pattern:recognition:start/complete` - Pattern detection
- `framework:detection:complete` - Framework identification
- `learning:pattern:stored` - Learning system updates
- `event:processing:start/complete` - Event handling
- `architecture:analysis:complete` - Architecture insights

#### Integration Events
- `integration:orchestration:start/complete` - Service coordination
- `service:routing:complete` - Request routing
- `resilience:circuit:open/close` - Circuit breaker status
- `metrics:collected` - Performance metrics

## Decision Points and Logic Flow

The monitoring system captures:

1. **Module Activation** - Which service/module is handling the request
2. **Input Context** - What data is being processed
3. **Decision Logic** - Why certain paths were chosen
4. **Confidence Levels** - How certain the system is about decisions
5. **Alternative Paths** - Other options that were considered
6. **Performance Metrics** - Duration, token usage, cache hits

## Identifying Missing Logic Modules

Run the monitoring test to see which modules aren't being triggered:

```bash
npm run test:logic-monitor
```

This helps identify:
- Unused services that might be redundant
- Missing integration points
- Incomplete implementation areas
- Optimization opportunities

## Next Steps

1. **Add More Granular Tracking** - Track individual methods within services
2. **Decision Tree Visualization** - Show branching logic visually
3. **Performance Profiling** - Identify bottlenecks
4. **Token Usage Optimization** - Track and optimize AI token usage
5. **Cache Effectiveness** - Monitor cache hit rates

The monitoring system is designed to evolve as the AVCA/DIAS system grows, providing continuous insight into system behavior and helping identify areas for improvement.