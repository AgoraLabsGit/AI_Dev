/**
 * Example of how to instrument AVCA and DIAS services with logic monitoring
 */

import { MonitorAVCA, MonitorDIAS, MonitorIntegration } from './logic-monitor-integration';
import { logicMonitor } from './logic-monitor';

// Example: Instrumented AVCA AI Client
export class InstrumentedAIClient {
  private tokenUsage: number = 0;
  private cacheHit: boolean = false;

  @MonitorAVCA('AI_CLIENT')
  async analyzeInput(input: {
    type: 'fresh' | 'github' | 'code' | 'docs';
    content: any;
  }) {
    // Simulate AI analysis with decision logging
    logicMonitor.trackDecision(
      'current-flow-id',
      `Analyzing ${input.type} input with ${Object.keys(input.content).length} fields`,
      85,
      ['direct-analysis', 'pattern-matching', 'ml-inference']
    );

    this.tokenUsage = Math.floor(Math.random() * 1000) + 500;
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      projectType: 'e-commerce',
      features: ['authentication', 'shopping-cart', 'payment'],
      complexity: { score: 0.7, level: 'medium' },
      confidence: 85
    };
  }

  @MonitorAVCA('AI_CLIENT')
  async generateCode(prompt: string, context: any) {
    logicMonitor.trackDecision(
      'current-flow-id',
      'Selecting code generation strategy',
      92,
      ['template-based', 'ai-generation', 'hybrid']
    );

    this.tokenUsage = Math.floor(Math.random() * 2000) + 1000;
    
    // Simulate code generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      code: '// Generated code...',
      language: 'typescript',
      framework: 'react',
      tokens: this.tokenUsage
    };
  }

  get lastTokenUsage() {
    return this.tokenUsage;
  }
}

// Example: Instrumented DIAS Pattern Recognition
export class InstrumentedPatternRecognition {
  private learningApplied: boolean = false;

  @MonitorDIAS('PATTERN_RECOGNITION')
  async analyzeSource(input: {
    type: 'fresh' | 'github' | 'code' | 'docs';
    content: any;
  }) {
    logicMonitor.trackDecision(
      'current-flow-id',
      'Selecting pattern analysis strategy',
      78,
      ['signature-matching', 'structure-analysis', 'content-inference']
    );

    // Simulate pattern analysis
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      projectType: 'SaaS Platform',
      features: ['multi-tenant', 'api-driven', 'real-time'],
      complexity: { score: 0.8, factors: ['scale', 'integrations'] },
      patterns: ['mvc', 'microservices', 'event-driven'],
      learningApplied: true
    };
  }

  @MonitorDIAS('PATTERN_RECOGNITION')
  async detectMigrationPatterns(source: any) {
    logicMonitor.trackDecision(
      'current-flow-id',
      'Analyzing migration complexity',
      65,
      ['direct-mapping', 'transformation-required', 'manual-intervention']
    );

    // Simulate migration analysis
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      patterns: [
        { type: 'component-mapping', confidence: 0.9 },
        { type: 'state-management', confidence: 0.7 },
        { type: 'routing-structure', confidence: 0.85 }
      ],
      recommendations: ['gradual-migration', 'feature-parity-first'],
      risks: ['breaking-changes', 'performance-impact'],
      confidence: 75
    };
  }
}

// Example: Instrumented System Integrator
export class InstrumentedSystemIntegrator {
  private avca: InstrumentedAIClient;
  private dias: InstrumentedPatternRecognition;

  constructor() {
    this.avca = new InstrumentedAIClient();
    this.dias = new InstrumentedPatternRecognition();
  }

  @MonitorIntegration('SYSTEM_INTEGRATOR')
  async orchestrateAnalysis(input: {
    type: 'fresh' | 'github' | 'code' | 'docs';
    content: any;
  }) {
    // First, DIAS analyzes patterns
    const patterns = await this.dias.analyzeSource(input);
    
    // Then AVCA analyzes with pattern context
    const analysis = await this.avca.analyzeInput({
      ...input,
      content: { ...input.content, patterns }
    });

    // Combine results
    return {
      analysis,
      patterns,
      services: ['AVCA', 'DIAS'],
      orchestrationTime: Date.now()
    };
  }

  @MonitorIntegration('SYSTEM_INTEGRATOR')
  async generateWithMigration(projectData: any, migrationSource?: any) {
    let migrationPatterns = null;

    if (migrationSource) {
      // Detect migration patterns if source provided
      migrationPatterns = await this.dias.detectMigrationPatterns(migrationSource);
    }

    // Generate code with migration context
    const code = await this.avca.generateCode(
      'Generate project structure',
      { projectData, migrationPatterns }
    );

    return {
      code,
      migrationApplied: !!migrationPatterns,
      services: ['AVCA', migrationPatterns ? 'DIAS' : null].filter(Boolean)
    };
  }
}

// Example usage and monitoring display
export async function demonstrateMonitoring() {
  console.log('🚀 Starting AVCA/DIAS Logic Monitoring Demo...\n');

  const integrator = new InstrumentedSystemIntegrator();

  // Subscribe to real-time events for dashboard
  logicMonitor.on('module:start', (event) => {
    console.log(`\n📍 Module Starting: ${event.system}:${event.module}`);
  });

  logicMonitor.on('decision', (event) => {
    console.log(`\n🤔 Decision Point: ${event.decision}`);
    if (event.alternatives) {
      console.log(`   Alternatives: ${event.alternatives.join(', ')}`);
    }
  });

  logicMonitor.on('flow:complete', (flow) => {
    console.log(`\n✅ Flow Completed: ${flow.id}`);
    console.log(`   Total modules: ${flow.modules.length}`);
    console.log(`   Duration: ${Date.now() - flow.startTime}ms`);
  });

  try {
    // Test 1: Fresh project analysis
    console.log('\n=== Test 1: Fresh Project Analysis ===');
    await integrator.orchestrateAnalysis({
      type: 'fresh',
      content: {
        name: 'My SaaS Project',
        description: 'Multi-tenant SaaS platform with real-time features',
        features: ['auth', 'billing', 'analytics']
      }
    });

    // Test 2: GitHub migration analysis
    console.log('\n\n=== Test 2: GitHub Migration Analysis ===');
    await integrator.generateWithMigration(
      { name: 'Migrated Project', type: 'e-commerce' },
      { 
        repo: 'user/old-project',
        framework: 'vue',
        components: 50
      }
    );

    // Display statistics
    console.log('\n\n=== Module Statistics ===');
    const stats = logicMonitor.getModuleStats();
    stats.forEach(stat => {
      console.log(`${stat.module}: ${stat.count} calls, avg ${stat.avgDuration}ms`);
    });

  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Missing Module Detection Helper
export function detectMissingModules() {
  const expectedAVCAModules = [
    'AI_CLIENT',
    'SOURCE_ANALYZER', 
    'DOCUMENT_GENERATOR',
    'BLUEPRINT_SERVICE',
    'MIGRATION_SERVICE',
    'PIPELINE',
    'VALIDATOR'
  ];

  const expectedDIASModules = [
    'PATTERN_RECOGNITION',
    'FRAMEWORK_DETECTOR',
    'ARCHITECTURE_ANALYZER',
    'COMPONENT_MAPPER',
    'LEARNING_SYSTEM',
    'EVENT_HANDLER',
    'INTELLIGENCE_ENGINE'
  ];

  const stats = logicMonitor.getModuleStats();
  const activeModules = new Set(stats.map(s => s.module));

  console.log('\n🔍 Missing Module Detection:');
  
  console.log('\nAVCA Modules:');
  expectedAVCAModules.forEach(module => {
    if (!activeModules.has(module)) {
      console.log(`  ❌ ${module} - Not implemented or not triggered`);
    } else {
      console.log(`  ✅ ${module} - Active`);
    }
  });

  console.log('\nDIAS Modules:');
  expectedDIASModules.forEach(module => {
    if (!activeModules.has(module)) {
      console.log(`  ❌ ${module} - Not implemented or not triggered`);
    } else {
      console.log(`  ✅ ${module} - Active`);
    }
  });
}