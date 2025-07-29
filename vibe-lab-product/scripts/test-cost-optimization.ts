#!/usr/bin/env ts-node

/**
 * Test Cost Optimization
 * Validates that the new model configuration achieves < $0.50 per feature
 */

import { projectFeatureCost, getTotalProjectedCost, MODEL_PRICING } from '../lib/avca/model-config';

console.log('=== AVCA Cost Optimization Validation ===\n');

// Show model pricing
console.log('Model Pricing (per 1K tokens):');
console.log('┌─────────────────────┬─────────────┬──────────────────┐');
console.log('│ Model               │ Prompt Cost │ Completion Cost  │');
console.log('├─────────────────────┼─────────────┼──────────────────┤');
for (const [model, pricing] of Object.entries(MODEL_PRICING)) {
  console.log(`│ ${model.padEnd(19)} │ $${pricing.promptCost.toFixed(5).padStart(9)} │ $${pricing.completionCost.toFixed(5).padStart(14)} │`);
}
console.log('└─────────────────────┴─────────────┴──────────────────┘\n');

// Show cost breakdown by stage
const projections = projectFeatureCost();
console.log('Cost Breakdown by Stage:');
console.log('┌─────────────────────┬─────────────────────┬──────────────┐');
console.log('│ Stage               │ Model               │ Cost         │');
console.log('├─────────────────────┼─────────────────────┼──────────────┤');

let opusCost = 0;
let sonnetCost = 0;
let haikuCost = 0;

for (const { stage, model, estimatedCost } of projections) {
  console.log(`│ ${stage.padEnd(19)} │ ${model.padEnd(19)} │ $${estimatedCost.toFixed(4).padStart(10)} │`);
  
  // Track costs by model
  if (model === 'claude-3-opus') opusCost += estimatedCost;
  else if (model === 'claude-3-5-sonnet') sonnetCost += estimatedCost;
  else if (model === 'claude-3-haiku') haikuCost += estimatedCost;
}

const totalCost = getTotalProjectedCost();
console.log('├─────────────────────┼─────────────────────┼──────────────┤');
console.log(`│ TOTAL               │                     │ $${totalCost.toFixed(4).padStart(10)} │`);
console.log('└─────────────────────┴─────────────────────┴──────────────┘\n');

// Show cost by model type
console.log('Cost by Model Type:');
console.log(`- Opus (verification only):  $${opusCost.toFixed(4)} (${((opusCost/totalCost)*100).toFixed(1)}%)`);
console.log(`- Sonnet (complex tasks):    $${sonnetCost.toFixed(4)} (${((sonnetCost/totalCost)*100).toFixed(1)}%)`);
console.log(`- Haiku (simple tasks):      $${haikuCost.toFixed(4)} (${((haikuCost/totalCost)*100).toFixed(1)}%)\n`);

// Compare with original
const originalCost = 2.84;
const savings = originalCost - totalCost;
const savingsPercent = (savings / originalCost) * 100;

console.log('Optimization Results:');
console.log(`- Original Cost:    $${originalCost.toFixed(2)}`);
console.log(`- Optimized Cost:   $${totalCost.toFixed(2)}`);
console.log(`- Savings:          $${savings.toFixed(2)} (${savingsPercent.toFixed(1)}%)`);
console.log(`- Target:           $0.50`);
console.log(`- Status:           ${totalCost < 0.50 ? '✅ PASS' : '❌ FAIL'}\n`);

// Recommendations if still over budget
if (totalCost >= 0.50) {
  console.log('Additional Optimization Recommendations:');
  console.log('1. Further reduce max tokens for each stage');
  console.log('2. Implement caching for common patterns');
  console.log('3. Use batch processing to reduce overhead');
  console.log('4. Consider using Haiku for verification of simple components');
} else {
  console.log('🎉 Cost optimization successful! Feature cost is under $0.50 target.');
}

// Show per-request metrics
console.log('\nPer-Request Efficiency:');
console.log(`- Average tokens per stage: ${Math.round(55700 / 9)} tokens`);
console.log(`- Average cost per stage: $${(totalCost / 9).toFixed(4)}`);
console.log(`- Cost per 1K tokens: $${((totalCost / 55.7)).toFixed(4)}`);

process.exit(totalCost < 0.50 ? 0 : 1); 