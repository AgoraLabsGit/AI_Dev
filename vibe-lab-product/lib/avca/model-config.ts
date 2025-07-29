/**
 * Model Configuration for Cost-Optimized AVCA Pipeline
 * 
 * Strategy:
 * - Claude Opus: Only for critical verification (high accuracy needed)
 * - Claude Sonnet: For code generation (good balance of quality/cost)
 * - Claude Haiku: For simple operations (fast and cheap)
 */

export type ModelType = 'claude-3-opus' | 'claude-3-5-sonnet' | 'claude-3-haiku';

export interface ModelConfig {
  model: ModelType;
  temperature: number;
  maxTokens: number;
  topP?: number;
  systemPrompt?: string;
}

export interface ModelPricing {
  promptCost: number;  // per 1K tokens
  completionCost: number;  // per 1K tokens
}

// Pricing as of January 2025 (per 1K tokens)
export const MODEL_PRICING: Record<ModelType, ModelPricing> = {
  'claude-3-opus': {
    promptCost: 0.015,
    completionCost: 0.075
  },
  'claude-3-5-sonnet': {
    promptCost: 0.003,
    completionCost: 0.015
  },
  'claude-3-haiku': {
    promptCost: 0.00025,
    completionCost: 0.00125
  }
};

// Model selection by pipeline stage
export const STAGE_MODEL_CONFIG: Record<string, ModelConfig> = {
  // Stage 1: Ideation - Use Haiku (simple intent parsing)
  'ideation': {
    model: 'claude-3-haiku',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: 'Parse user intent and extract key requirements. Be concise.'
  },

  // Stage 2: Blueprints - Use Haiku (structured output)
  'blueprints': {
    model: 'claude-3-haiku',
    temperature: 0.2,
    maxTokens: 3000,
    systemPrompt: 'Generate blueprint following exact schema. Output valid JSON only.'
  },

  // Stage 3: Styling - Use Haiku (design tokens)
  'styling': {
    model: 'claude-3-haiku',
    temperature: 0.4,
    maxTokens: 2000,
    systemPrompt: 'Generate consistent design tokens and styling rules.'
  },

  // Stage 4: Page Designs - Use Sonnet (more complex)
  'page-designs': {
    model: 'claude-3-5-sonnet',
    temperature: 0.3,
    maxTokens: 4000,
    systemPrompt: 'Design page layouts and component hierarchy. Consider UX best practices.'
  },

  // Stage 5: Component Specs - Use Sonnet (detailed specs)
  'component-specs': {
    model: 'claude-3-5-sonnet',
    temperature: 0.2,
    maxTokens: 5000,
    systemPrompt: 'Generate detailed component specifications with props, types, and behavior.'
  },

  // Stage 6: Code Generation - Use Sonnet (main cost driver)
  'code-generation': {
    model: 'claude-3-5-sonnet',
    temperature: 0.1,
    maxTokens: 8000,
    systemPrompt: 'Generate production-ready React/TypeScript code. Follow AVCA standards.'
  },

  // Stage 7: Verification - Use Sonnet (balanced quality/cost)
  'verification': {
    model: 'claude-3-5-sonnet',
    temperature: 0.1,
    maxTokens: 4000,
    systemPrompt: 'Verify code quality, security, and compliance. Be thorough and critical. Focus on security vulnerabilities, type safety, and AVCA compliance.'
  },
  
  // Stage 7b: Critical Verification - Use Opus only for security-critical components
  'verification-critical': {
    model: 'claude-3-opus',
    temperature: 0.1,
    maxTokens: 2000,
    systemPrompt: 'Perform deep security audit on authentication and data handling components only.'
  },

  // Stage 8: Registry - Use Haiku (simple storage)
  'registry': {
    model: 'claude-3-haiku',
    temperature: 0.1,
    maxTokens: 1000,
    systemPrompt: 'Format component for registry storage. Output clean JSON.'
  },

  // Stage 9: Assembly - Use Haiku (orchestration)
  'assembly': {
    model: 'claude-3-haiku',
    temperature: 0.2,
    maxTokens: 2000,
    systemPrompt: 'Assemble components into final feature. Resolve dependencies.'
  }
};

// Helper functions
export function getModelForStage(stage: string): ModelConfig {
  return STAGE_MODEL_CONFIG[stage] || STAGE_MODEL_CONFIG['code-generation'];
}

export function calculateCost(
  model: ModelType,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  const promptCost = (promptTokens / 1000) * pricing.promptCost;
  const completionCost = (completionTokens / 1000) * pricing.completionCost;
  return promptCost + completionCost;
}

// Cost projection for "Add Search to Dashboard" feature
export function projectFeatureCost(): { stage: string; model: ModelType; estimatedCost: number }[] {
  const projections = [
    { stage: 'ideation', promptTokens: 1000, completionTokens: 500 },
    { stage: 'blueprints', promptTokens: 1500, completionTokens: 1000 },
    { stage: 'styling', promptTokens: 1000, completionTokens: 800 },
    { stage: 'page-designs', promptTokens: 2000, completionTokens: 1500 },
    { stage: 'component-specs', promptTokens: 3000, completionTokens: 2500 },
    { stage: 'code-generation', promptTokens: 5000, completionTokens: 8000 },
    { stage: 'verification', promptTokens: 4000, completionTokens: 2000 },
    { stage: 'registry', promptTokens: 500, completionTokens: 300 },
    { stage: 'assembly', promptTokens: 1000, completionTokens: 500 }
  ];

  return projections.map(({ stage, promptTokens, completionTokens }) => {
    const config = getModelForStage(stage);
    const cost = calculateCost(config.model, promptTokens, completionTokens);
    return { stage, model: config.model, estimatedCost: cost };
  });
}

// Calculate total projected cost
export function getTotalProjectedCost(): number {
  return projectFeatureCost().reduce((total, { estimatedCost }) => total + estimatedCost, 0);
} 