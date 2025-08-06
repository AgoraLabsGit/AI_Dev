/**
 * Test script to generate monitoring events for testing the Logic Monitor Dashboard
 */

import { logicMonitor, AVCA_MODULES, DIAS_MODULES, INTEGRATION_MODULES } from './logic-monitor';

export async function runMonitoringTest() {
  console.log('🧪 Starting Logic Monitor Test...');

  // Test AVCA Module Events
  await testAVCAModules();
  
  // Test DIAS Module Events  
  await testDIASModules();
  
  // Test Integration Module Events
  await testIntegrationModules();

  console.log('✅ Logic Monitor Test Complete!');
  
  // Return summary
  return {
    eventsGenerated: logicMonitor.getRecentEvents().length,
    moduleStats: logicMonitor.getModuleStats(),
    activeFlows: logicMonitor.getActiveFlows().length
  };
}

async function testAVCAModules() {
  console.log('🔷 Testing AVCA Modules...');

  // Test AI_CLIENT
  const { flowId: aiFlowId, startTime: aiStartTime } = logicMonitor.trackModule(
    'AVCA',
    AVCA_MODULES.AI_CLIENT,
    'generateCode',
    { type: 'component', name: 'UserProfile' },
    'Generating React component with TypeScript'
  );

  await delay(150); // Simulate processing time

  logicMonitor.completeModule(
    aiFlowId,
    aiStartTime,
    { code: 'component code generated', linesOfCode: 45 },
    { 
      logic: 'Generated UserProfile component successfully',
      confidence: 95,
      alternatives: ['Class component', 'Hook-based component']
    },
    { tokenUsage: 1250, cacheHit: false }
  );

  // Test SOURCE_ANALYZER
  const { flowId: sourceFlowId, startTime: sourceStartTime } = logicMonitor.trackModule(
    'AVCA', 
    AVCA_MODULES.SOURCE_ANALYZER,
    'analyzeRepository',
    { repo: 'user/test-app', branch: 'main' },
    'Analyzing GitHub repository structure and dependencies'
  );

  await delay(200);

  logicMonitor.completeModule(
    sourceFlowId,
    sourceStartTime,
    { files: 23, framework: 'React', dependencies: 15 },
    {
      logic: 'Repository analysis complete - React project detected',
      confidence: 88
    },
    { cacheHit: true }
  );

  // Test DOCUMENT_GENERATOR
  const { flowId: docFlowId, startTime: docStartTime } = logicMonitor.trackModule(
    'AVCA',
    AVCA_MODULES.DOCUMENT_GENERATOR,
    'generateOverview',
    { projectType: 'web-app', features: ['auth', 'dashboard', 'api'] },
    'Generating comprehensive project overview document'
  );

  await delay(300);

  logicMonitor.completeModule(
    docFlowId,
    docStartTime,
    { sections: 8, wordCount: 1200 },
    {
      logic: 'Project overview generated with 8 sections',
      confidence: 92
    },
    { tokenUsage: 2100 }
  );
}

async function testDIASModules() {
  console.log('🧠 Testing DIAS Modules...');

  // Test PATTERN_RECOGNITION
  const { flowId: patternFlowId, startTime: patternStartTime } = logicMonitor.trackModule(
    'DIAS',
    DIAS_MODULES.PATTERN_RECOGNITION,
    'analyzeSource',
    { type: 'codebase', files: 25 },
    'Analyzing codebase patterns for optimization opportunities'
  );

  await delay(180);

  logicMonitor.completeModule(
    patternFlowId,
    patternStartTime,
    { patterns: ['MVC', 'Repository', 'Observer'], risks: [] },
    {
      logic: 'Identified 3 architectural patterns, no risks detected',
      confidence: 87
    },
    { patternsMatched: 3 }
  );

  // Test FRAMEWORK_DETECTOR
  const { flowId: frameworkFlowId, startTime: frameworkStartTime } = logicMonitor.trackModule(
    'DIAS',
    DIAS_MODULES.FRAMEWORK_DETECTOR,
    'detectFramework',
    { packageJson: true, dependencies: ['react', 'next'] },
    'Detecting project framework and version'
  );

  await delay(120);

  logicMonitor.completeModule(
    frameworkFlowId,
    frameworkStartTime,
    { framework: 'Next.js', version: '14.0.0', features: ['App Router', 'TypeScript'] },
    {
      logic: 'Detected Next.js 14.0.0 with App Router',
      confidence: 96,
      alternatives: ['React', 'Vite + React']
    }
  );

  // Test LEARNING_SYSTEM
  const { flowId: learningFlowId, startTime: learningStartTime } = logicMonitor.trackModule(
    'DIAS',
    DIAS_MODULES.LEARNING_SYSTEM,
    'learnFromMigration',
    { source: 'Vue 2', target: 'React', outcome: 'success' },
    'Learning from successful Vue to React migration'
  );

  await delay(90);

  logicMonitor.completeModule(
    learningFlowId,
    learningStartTime,
    { patternsLearned: 2, confidenceImprovement: 0.05 },
    {
      logic: 'Learned 2 new patterns, improved confidence by 5%'
    },
    { learningApplied: true }
  );
}

async function testIntegrationModules() {
  console.log('🔗 Testing Integration Modules...');

  // Test SYSTEM_INTEGRATOR  
  const { flowId: intFlowId, startTime: intStartTime } = logicMonitor.trackModule(
    'INTEGRATION',
    INTEGRATION_MODULES.SYSTEM_INTEGRATOR,
    'orchestrateServices',
    { services: ['AVCA', 'DIAS'], priority: 'high' },
    'Orchestrating AVCA and DIAS services for code generation'
  );

  await delay(250);

  logicMonitor.completeModule(
    intFlowId,
    intStartTime,
    { success: true, servicesCoordinated: 2, totalTime: 250 },
    {
      logic: 'Successfully orchestrated AVCA and DIAS services'
    },
    { services: ['AVCA', 'DIAS'] }
  );

  // Test PERFORMANCE_MONITOR
  const { flowId: perfFlowId, startTime: perfStartTime } = logicMonitor.trackModule(
    'INTEGRATION',
    INTEGRATION_MODULES.PERFORMANCE_MONITOR,
    'trackMetrics',
    { operation: 'code-generation', startTime: Date.now() },
    'Tracking performance metrics for code generation operation'
  );

  await delay(50);

  logicMonitor.completeModule(
    perfFlowId,
    perfStartTime,
    { 
      duration: 250,
      tokensUsed: 3350,
      cacheHitRate: 0.4,
      servicesInvolved: 3
    },
    {
      logic: 'Performance metrics collected successfully'
    }
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-run test in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // This is server-side in development
  runMonitoringTest().then(result => {
    console.log('📊 Test Results:', result);
  }).catch(console.error);
}