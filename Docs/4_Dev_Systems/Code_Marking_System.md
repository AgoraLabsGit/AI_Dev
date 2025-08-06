# Vibe Lab Code Marking System

**Document Type**: Development Standard
**Status**: Active Implementation
**Purpose**: Define a commenting system to distinguish core Vibe Lab product code from development/build infrastructure code.

---

## Overview

This system uses special comments to mark code segments, files, and entire directories as either **core product code** (shipped to users) or **build/development code** (internal infrastructure). This enables automated extraction tools and clear developer understanding.

---

## Marking System

### File-Level Markers (Top of File)

#### Core Product Code
```typescript
// @vibe-lab/core - Essential product functionality
// This file is part of the core Vibe Lab product distributed to users

import { useState } from 'react';
// ... rest of file
```

#### Build/Development Code  
```typescript
// @vibe-lab/build - Development infrastructure
// This file is used for building/testing Vibe Lab but not shipped to users

import { logicMonitor } from '@/lib/monitoring/logic-monitor';
// ... rest of file
```

#### Conditional/Optional Code
```typescript
// @vibe-lab/optional - Feature-dependent code
// This file may be included based on feature flags or user configuration

export function GitHubConnector() {
// ... rest of file
```

### Block-Level Markers

#### Core Product Block
```typescript
// @vibe-lab/core:start
export function OnboardingChat() {
  const [messages, setMessages] = useState([]);
  // Core AI chat functionality
  return <ChatInterface messages={messages} />;
}
// @vibe-lab/core:end
```

#### Build/Development Block
```typescript
export function ProductionComponent() {
  const [data, setData] = useState(null);
  
  // @vibe-lab/build:start
  if (process.env.NODE_ENV === 'development') {
    console.log('Development monitoring active');
    logicMonitor.track('component-render', { component: 'ProductionComponent' });
  }
  // @vibe-lab/build:end
  
  return <div>{data}</div>;
}
```

#### Conditional Block
```typescript
// @vibe-lab/optional:start:github-integration
if (features.githubIntegration) {
  return <GitHubConnector />;
}
// @vibe-lab/optional:end:github-integration
```

### Directory-Level Markers

#### Directory Marker Files
Create `.vibe-lab-marker` files in directories:

**For Core Directories:**
```yaml
# .vibe-lab-marker
type: core
description: "Core AVCA system components"
include: "**/*"
exclude: ["**/*.test.ts", "**/*.spec.ts"]
```

**For Build Directories:**
```yaml
# .vibe-lab-marker  
type: build
description: "Development monitoring and testing infrastructure"
include: "**/*"
note: "Entire directory excluded from product builds"
```

**For Mixed Directories:**
```yaml
# .vibe-lab-marker
type: mixed
description: "Contains both core and build code - check individual files"
core_patterns: ["*.service.ts", "components/*.tsx"]
build_patterns: ["*.test.ts", "monitoring/**/*", "scripts/**/*"]
```

---

## Implementation Examples

### API Route Marking
```typescript
// @vibe-lab/core - Core API endpoint
// Production endpoint for AI-powered onboarding

import { NextResponse } from 'next/server';
import { enhancedAIClient } from '@/lib/integration/enhanced-ai-client';

export async function POST(request: Request) {
  const { message } = await request.json();
  
  // @vibe-lab/build:start
  const pageContext = capturePageContext(); // Development monitoring
  logicMonitor.trackModule('AVCA', 'ONBOARDING_CHAT', 'process-message', 
    { message }, 'Processing user onboarding message', pageContext);
  // @vibe-lab/build:end
  
  const response = await enhancedAIClient.processOnboardingMessage(message);
  
  return NextResponse.json(response);
}
```

### Component Marking
```typescript
// @vibe-lab/core - Main onboarding interface component
'use client';

import React, { useState } from 'react';

export function OnboardingPage() {
  const [messages, setMessages] = useState([]);
  
  // @vibe-lab/build:start
  useEffect(() => {
    // Development-only performance monitoring
    if (process.env.NODE_ENV === 'development') {
      logicMonitor.trackComponentRender('OnboardingPage');
    }
  }, []);
  // @vibe-lab/build:end
  
  return (
    <div className="onboarding-container">
      {/* @vibe-lab/core - Essential chat interface */}
      <DualClaudeChat messages={messages} onMessage={handleMessage} />
      
      {/* @vibe-lab/build - Development debugging panel */}
      {/* @vibe-lab/build:start */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel events={monitoringEvents} />
      )}
      {/* @vibe-lab/build:end */}
    </div>
  );
}
```

### Configuration File Marking
```json
// package.json
{
  "name": "vibe-lab",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    
    "_comment_build_only": "Scripts below are build/development only",
    "test:monitoring": "tsx scripts/test-monitoring-system.ts",
    "dev:monitor": "open http://localhost:3000/experimental/dev/monitor",
    "build:extract-core": "tsx scripts/extract-core-product.ts"
  },
  "dependencies": {
    "_comment": "Core dependencies shipped to users",
    "next": "^14.0.0",
    "react": "^18.0.0"
  },
  "devDependencies": {
    "_comment": "Build/development dependencies not shipped",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

---

## Automated Tools Support

### Extraction Script Pattern
```typescript
// scripts/extract-core-product.ts
// @vibe-lab/build - Core product extraction tool

import { glob } from 'glob';
import { readFile, writeFile, mkdir } from 'fs/promises';

export async function extractCoreProduct() {
  const allFiles = await glob('src/**/*.{ts,tsx,js,jsx}');
  
  for (const file of allFiles) {
    const content = await readFile(file, 'utf-8');
    
    // Check file-level marker
    if (content.includes('// @vibe-lab/core')) {
      await copyToProductBuild(file, content);
    } else if (content.includes('// @vibe-lab/build')) {
      console.log(`Skipping build file: ${file}`);
    } else if (content.includes('@vibe-lab/')) {
      await processMarkedBlocks(file, content);
    }
  }
}

function processMarkedBlocks(file: string, content: string) {
  // Remove build blocks, keep core blocks
  let processed = content;
  
  // Remove build blocks
  processed = processed.replace(
    /\/\/ @vibe-lab\/build:start[\s\S]*?\/\/ @vibe-lab\/build:end/g,
    ''
  );
  
  // Keep core blocks (remove markers only)
  processed = processed.replace(
    /\/\/ @vibe-lab\/core:(start|end)/g,
    ''
  );
  
  return processed;
}
```

### Build Tool Integration
```typescript
// next.config.js additions
const isProductionBuild = process.env.BUILD_TARGET === 'product';

const config = {
  // Standard Next.js config...
  
  webpack: (config, { dev, isServer }) => {
    if (isProductionBuild) {
      // Add plugin to remove build-marked code
      config.plugins.push(new VibLabCodeFilterPlugin());
    }
    return config;
  }
};
```

### Linting Rules
```json
// .eslintrc.js
{
  "rules": {
    "vibe-lab/require-file-marker": "error",
    "vibe-lab/no-unmarked-build-code": "error",
    "vibe-lab/consistent-marker-format": "error"
  }
}
```

---

## Marker Categories

### Primary Categories
- `@vibe-lab/core` - Essential product code shipped to all users
- `@vibe-lab/build` - Development, testing, and build infrastructure  
- `@vibe-lab/optional` - Feature-dependent code (may be included)

### Subcategories
- `@vibe-lab/core:api` - Core API endpoints
- `@vibe-lab/core:ui` - Core user interface components
- `@vibe-lab/core:ai` - Core AI system components
- `@vibe-lab/build:test` - Testing infrastructure
- `@vibe-lab/build:monitor` - Development monitoring
- `@vibe-lab/build:scripts` - Build and deployment scripts
- `@vibe-lab/optional:github` - GitHub integration features
- `@vibe-lab/optional:advanced` - Advanced features for power users

---

## Benefits

### ✅ **Automated Extraction**
- Build tools can automatically identify and separate code
- CI/CD pipelines can create clean product distributions
- Reduces manual maintenance of file lists

### ✅ **Developer Clarity**
- Immediately obvious which code is product vs. infrastructure
- New developers quickly understand codebase organization
- Code reviews can verify proper marking

### ✅ **Maintainable**
- Comments live with the code they describe
- No external documentation to keep in sync
- Git history shows evolution of code categories

### ✅ **Flexible**
- Block-level granularity when needed
- File-level simplicity for obvious cases
- Directory-level organization for large sections

---

## Implementation Strategy

### Phase 1: Mark Existing Code
1. Add file-level markers to all existing files
2. Create directory marker files for obvious build/core directories
3. Use block-level markers for mixed files

### Phase 2: Tooling
1. Create extraction script
2. Add linting rules to enforce consistent marking
3. Integrate with build pipeline

### Phase 3: Automation
1. Automated core product extraction in CI/CD
2. Build verification that all code is properly marked
3. Distribution packaging with clean core code

This system provides a sustainable, automated way to maintain clean product distributions while keeping development infrastructure separate.