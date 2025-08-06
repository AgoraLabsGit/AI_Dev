# Vibe Lab Code Separation Analysis

**Document Type**: Architecture & Deployment Planning
**Status**: Active Development
**Purpose**: This document analyzes the current codebase structure to identify what constitutes the "Vibe Lab Product" versus "Development Infrastructure", enabling clean product packaging for new users.

---

## Overview

The current Vibe Lab codebase contains two distinct types of code:
1. **Vibe Lab Product Code** - The actual AI-powered development platform that users will receive
2. **Development Infrastructure Code** - Tools, experiments, and infrastructure used to build Vibe Lab itself

This analysis identifies each component to enable clean extraction of the production-ready Vibe Lab product.

---

## Code Classification Analysis

### 🟢 CORE PRODUCT CODE (Must Include)

#### Essential Application Structure
- ✅ `src/app/layout.tsx` - Main application layout
- ✅ `src/app/globals.css` - Core styling
- ✅ `src/app/page.tsx` - Landing page
- ✅ `src/app/onboarding/page.tsx` - Primary onboarding interface
- ✅ `src/middleware.ts` - Application middleware

#### Core API Endpoints
- ✅ `src/app/api/onboarding/chat/route.ts` - AI-powered onboarding chat
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Authentication system
- ✅ `src/app/api/plan/route.ts` - Project planning API
- ✅ `src/app/api/review/route.ts` - Code review API

#### Essential Components
- ✅ `src/components/DualClaudeChat.tsx` - Main AI chat interface
- ✅ `src/components/AuthProvider.tsx` - Authentication provider
- ✅ `src/components/AppLayout.tsx` - Application layout
- ✅ `src/components/onboarding/LiveDocumentPreview.tsx` - Document preview
- ✅ `src/components/navigation/MainSidebar.tsx` - Main navigation
- ✅ `src/components/ui/` - All UI components (buttons, cards, etc.)

#### AVCA System (Core Intelligence)
- ✅ `src/lib/avca/` - **ENTIRE DIRECTORY** - Core AI-powered development system
  - ✅ `services/` - All AI services (ai-client, blueprint-service, etc.)
  - ✅ `pipeline/` - Component generation pipeline
  - ✅ `types/` - Type definitions

#### DIAS System (Intelligence Layer)  
- ✅ `src/lib/dias/` - **ENTIRE DIRECTORY** - Dynamic intelligence system
  - ✅ `intelligence/` - Pattern recognition, framework detection
  - ✅ `analysis/` - Code and project analysis
  - ✅ `events/` - Event handling system

#### Integration Layer
- ✅ `src/lib/integration/` - **SELECTIVE INCLUSION**
  - ✅ `enhanced-ai-client.ts` - Enhanced AI capabilities
  - ✅ `persona-mapper.ts` - AI persona system
  - ✅ `system-integrator.ts` - Service coordination
  - ✅ `resilience/` - Circuit breaker and retry policies
  - ✅ `github/github-service.ts` - GitHub integration
  - ❌ `mcp-context7-service.ts` - Development-specific MCP integration

#### Core Configuration
- ✅ `src/config/navigation.ts` - Navigation configuration
- ✅ `src/lib/config/feature-flags.ts` - Feature flag system
- ✅ `src/lib/utils.ts` - Utility functions
- ✅ `src/types/` - Type definitions

### 🟡 CONDITIONAL PRODUCT CODE (Config-Dependent)

#### Document Management
- 🟡 `src/lib/onboarding/document-version-manager.ts` - Document versioning (essential for AVCA)
- 🟡 `src/lib/stores/onboarding-store.ts` - State management (needed for onboarding)

#### Stage 0 Components
- 🟡 `src/components/stage0/GitHubConnector.tsx` - GitHub integration (if GitHub features enabled)

### 🔴 DEVELOPMENT INFRASTRUCTURE CODE (Exclude from Product)

#### Experimental Pages (Development/Testing)
- ❌ `src/app/experimental/` - **ENTIRE DIRECTORY** - Development experiments
  - ❌ `admin-build/`, `dev/monitor/`, `test/`, `logs/`, etc.
  - ❌ All experimental features and testing interfaces

#### Development APIs
- ❌ `src/app/api/test-env/` - Testing environment
- ❌ `src/app/api/test-monitoring/route.ts` - Development monitoring
- ❌ `src/app/api/monitoring/` - Development monitoring APIs

#### Development-Specific Components
- ❌ `src/components/monitoring/LogicMonitorDashboard.tsx` - Development monitoring
- ❌ `src/components/Roadmap.tsx` - Internal roadmap component

#### Development Monitoring System
- ❌ `src/lib/monitoring/` - **ENTIRE DIRECTORY** - Development monitoring
- ❌ `src/lib/monitoring-init.ts` - Monitoring initialization

#### Development Services  
- ❌ `src/services/` - Development-specific services
- ❌ `src/lib/mock-data/` - Mock data for development

#### Build System Artifacts
- ❌ `src/generated/prisma/` - Generated Prisma client (regenerated on build)

### 🟠 INFRASTRUCTURE CODE (Include with Modifications)

#### Modified Configuration Files
These need modification for clean product distribution:

**Package.json Modifications**:
- Remove development-specific scripts (`test:logic-monitor`, etc.)
- Remove development dependencies not needed in production
- Clean up development-specific environment variables

**Environment Configuration**:
- Provide clean `.env.example` with production variables only
- Remove development monitoring flags
- Include only essential API keys and configuration

---

## Clean Product Extraction Strategy

### Phase 1: Core Product Extraction
1. **Create clean directory structure** with only production code
2. **Copy core product files** identified in green category
3. **Modify configuration files** to remove development dependencies
4. **Update imports** to remove references to excluded components

### Phase 2: Feature Flag Integration
1. **Implement feature flags** for optional components (GitHub integration, etc.)
2. **Create configuration system** for enabling/disabling features
3. **Provide setup guide** for new users

### Phase 3: Documentation & Packaging
1. **Generate clean README** for product installation
2. **Create setup wizard** for first-time configuration  
3. **Package distribution** with minimal dependencies

---

## File Count Analysis

**Total Files Analyzed**: ~200 files
- 🟢 **Core Product**: ~120 files (60%)
- 🟡 **Conditional**: ~15 files (7.5%)
- 🔴 **Development Only**: ~50 files (25%)
- 🟠 **Infrastructure**: ~15 files (7.5%)

**Clean Product Size**: Approximately 135 essential files for full Vibe Lab functionality.

---

## Next Steps

1. **Create extraction script** to automate clean product generation
2. **Test extracted product** in clean environment
3. **Validate all core functionality** works without development infrastructure
4. **Create setup documentation** for new users
5. **Implement feature flag system** for optional components

This analysis ensures new users receive a clean, production-ready Vibe Lab installation without development artifacts or experimental features.