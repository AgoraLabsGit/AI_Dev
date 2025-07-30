# AVCA AI Client Services

This directory contains the AI client implementation for the AVCA system, providing intelligent code generation, review, and routing capabilities.

## Components

### 1. AI Client Service (`ai-client.ts`)
The core AI client that integrates with Anthropic's Claude API. Features:
- Three AI roles: Developer, Auditor, and Router
- Concurrent request handling with configurable limits
- Token tracking and cost calculation
- Health checks and metrics collection

### 2. Context Manager (`context-manager.ts`)
Manages context isolation for different AI roles:
- **Developer**: Gets full project context (150k tokens max)
- **Auditor**: Gets isolated context for unbiased review (50k tokens max)
- **Router**: Gets minimal context for intent classification (5k tokens max)

### 3. VibeLab AI (`vibe-lab-ai.ts`)
High-level API that combines AI client with context management:
- Simplified methods for code generation, review, and routing
- Automatic context preparation based on role
- Integrated metrics and monitoring

## Setup

### 1. Environment Configuration
Create a `.env.local` file in the project root with:
```env
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from [Anthropic Console](https://console.anthropic.com/).

### 2. Basic Usage

```typescript
import { VibeLabAI } from './lib/avca/services/vibe-lab-ai';

const ai = new VibeLabAI();
await ai.initialize();

// Generate code
const response = await ai.generateCode(
  'Create a React button component',
  {
    projectId: 'my-project',
    projectName: 'My App',
    techStack: ['React', 'TypeScript']
  }
);

// Review code
const review = await ai.reviewCode(
  codeString,
  projectContext,
  'security' // optional focus area
);

// Classify intent
const intent = await ai.classifyIntent(
  'I want to add authentication to my app'
);
```

## Testing

Run the test script to validate the implementation:
```bash
npm run test:ai-client
# or
npx ts-node scripts/test-ai-client.ts
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   VibeLab AI    │────▶│ Context Manager  │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│   AI Client     │────▶│ Token Tracker    │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Anthropic API   │
└─────────────────┘
```

## Cost Optimization

The system uses different Claude models based on task complexity:
- **Router**: Claude 3 Haiku (fastest, cheapest)
- **Developer**: Claude 3.5 Sonnet (balanced)
- **Auditor**: Claude 3 Opus (highest quality)

## Next Steps

This completes Stage 1 of AVCA-002. The next stages will add:
- Stage 2: Rate limiting and retry logic
- Stage 3: Advanced context management and caching 