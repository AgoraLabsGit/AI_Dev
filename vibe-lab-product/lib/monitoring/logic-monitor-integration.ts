/**
 * Logic Monitor Integration for AVCA & DIAS
 * Instruments system modules with monitoring capabilities
 */

import { logicMonitor, AVCA_MODULES, DIAS_MODULES, INTEGRATION_MODULES } from './logic-monitor';

/**
 * Decorator to monitor AVCA module methods
 */
export function MonitorAVCA(module: keyof typeof AVCA_MODULES) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const inputs = extractMethodInputs(propertyName, args);
      const logic = describeAVCALogic(module, propertyName, inputs);

      const { flowId, startTime } = logicMonitor.trackModule(
        'AVCA',
        module,
        propertyName,
        inputs,
        logic
      );

      try {
        const result = await originalMethod.apply(this, args);
        
        const outputs = extractMethodOutputs(result);
        const decision = extractAVCADecision(module, propertyName, result);
        const metadata = extractAVCAMetadata(this, result);

        logicMonitor.completeModule(
          flowId,
          startTime,
          outputs,
          decision,
          metadata
        );

        logicMonitor.completeFlow(flowId, 'completed');
        return result;
      } catch (error) {
        logicMonitor.completeModule(
          flowId,
          startTime,
          { error: error.message },
          { logic: 'Error occurred' },
          { errors: [error.message] }
        );
        logicMonitor.completeFlow(flowId, 'failed');
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator to monitor DIAS module methods
 */
export function MonitorDIAS(module: keyof typeof DIAS_MODULES) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const inputs = extractMethodInputs(propertyName, args);
      const logic = describeDIASLogic(module, propertyName, inputs);

      const { flowId, startTime } = logicMonitor.trackModule(
        'DIAS',
        module,
        propertyName,
        inputs,
        logic
      );

      try {
        const result = await originalMethod.apply(this, args);
        
        const outputs = extractMethodOutputs(result);
        const decision = extractDIASDecision(module, propertyName, result);
        const metadata = extractDIASMetadata(this, result);

        logicMonitor.completeModule(
          flowId,
          startTime,
          outputs,
          decision,
          metadata
        );

        logicMonitor.completeFlow(flowId, 'completed');
        return result;
      } catch (error) {
        logicMonitor.completeModule(
          flowId,
          startTime,
          { error: error.message },
          { logic: 'Error occurred' },
          { errors: [error.message] }
        );
        logicMonitor.completeFlow(flowId, 'failed');
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Monitor integration layer operations
 */
export function MonitorIntegration(module: keyof typeof INTEGRATION_MODULES) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const inputs = extractMethodInputs(propertyName, args);
      const logic = describeIntegrationLogic(module, propertyName, inputs);

      const { flowId, startTime } = logicMonitor.trackModule(
        'INTEGRATION',
        module,
        propertyName,
        inputs,
        logic
      );

      try {
        const result = await originalMethod.apply(this, args);
        
        const outputs = extractMethodOutputs(result);
        const metadata = { 
          services: extractInvolvedServices(this, args, result) 
        };

        logicMonitor.completeModule(
          flowId,
          startTime,
          outputs,
          {},
          metadata
        );

        logicMonitor.completeFlow(flowId, 'completed');
        return result;
      } catch (error) {
        logicMonitor.completeModule(
          flowId,
          startTime,
          { error: error.message },
          { logic: 'Integration failed' },
          { errors: [error.message] }
        );
        logicMonitor.completeFlow(flowId, 'failed');
        throw error;
      }
    };

    return descriptor;
  };
}

// Logic Description Helpers
function describeAVCALogic(module: string, method: string, inputs: any): string {
  const logicMap: Record<string, Record<string, (inputs: any) => string>> = {
    AI_CLIENT: {
      generateCode: (i) => `Generating ${i.type || 'component'} code with AI`,
      reviewCode: () => 'Reviewing code for quality and compliance',
      classifyIntent: () => 'Classifying user intent for routing',
      analyzeInput: (i) => `Analyzing ${i.type} input source`
    },
    SOURCE_ANALYZER: {
      analyzeRepository: (i) => `Analyzing GitHub repository: ${i.repo || 'unknown'}`,
      analyzeCodeFiles: (i) => `Analyzing ${i.files?.length || 0} code files`,
      analyzeDocumentation: () => 'Analyzing documentation structure'
    },
    DOCUMENT_GENERATOR: {
      generateOverview: () => 'Generating project overview document',
      generateSpecs: () => 'Generating technical specification document',
      generateSection: (i) => `Generating section: ${i.section || 'unknown'}`
    },
    BLUEPRINT_SERVICE: {
      generateBlueprint: (i) => `Creating blueprint for ${i.projectType || 'project'}`,
      validateBlueprint: () => 'Validating blueprint compliance',
      convertToAVCA: () => 'Converting blueprint to AVCA format'
    },
    MIGRATION_SERVICE: {
      analyzeMigration: (i) => `Analyzing migration from ${i.source || 'source'}`,
      planMigration: () => 'Creating migration execution plan',
      validateMigration: () => 'Validating migration safety'
    }
  };

  const moduleLogic = logicMap[module] || {};
  const methodLogic = moduleLogic[method];
  
  return methodLogic ? methodLogic(inputs) : `Executing ${method}`;
}

function describeDIASLogic(module: string, method: string, inputs: any): string {
  const logicMap: Record<string, Record<string, (inputs: any) => string>> = {
    PATTERN_RECOGNITION: {
      analyzeSource: (i) => `Recognizing patterns in ${i.type} source`,
      detectMigrationPatterns: () => 'Detecting migration patterns and risks',
      inferPageStructure: () => 'Inferring optimal page structure'
    },
    FRAMEWORK_DETECTOR: {
      detectFramework: () => 'Detecting project framework and version',
      analyzeSignatures: () => 'Analyzing framework signatures',
      scoreConfidence: () => 'Calculating detection confidence'
    },
    ARCHITECTURE_ANALYZER: {
      analyzeArchitecture: () => 'Analyzing system architecture patterns',
      assessQuality: () => 'Assessing architecture quality metrics',
      identifyRisks: () => 'Identifying architectural risks'
    },
    COMPONENT_MAPPER: {
      mapComponents: () => 'Mapping components to patterns',
      generateInsights: () => 'Generating component insights',
      assessRisks: () => 'Assessing component migration risks'
    },
    LEARNING_SYSTEM: {
      learnFromMigration: () => 'Learning from migration outcomes',
      optimizePatterns: () => 'Optimizing pattern recognition',
      adjustStrategies: () => 'Adjusting migration strategies'
    }
  };

  const moduleLogic = logicMap[module] || {};
  const methodLogic = moduleLogic[method];
  
  return methodLogic ? methodLogic(inputs) : `Executing ${method}`;
}

function describeIntegrationLogic(module: string, method: string, inputs: any): string {
  const logicMap: Record<string, Record<string, (inputs: any) => string>> = {
    SYSTEM_INTEGRATOR: {
      orchestrateServices: () => 'Orchestrating AVCA and DIAS services',
      coordinateFlow: () => 'Coordinating system flow',
      manageState: () => 'Managing integration state'
    },
    SERVICE_ORCHESTRATOR: {
      routeRequest: () => 'Routing request to appropriate service',
      balanceLoad: () => 'Balancing load across services',
      handleFailover: () => 'Handling service failover'
    }
  };

  const moduleLogic = logicMap[module] || {};
  const methodLogic = moduleLogic[method];
  
  return methodLogic ? methodLogic(inputs) : `Executing ${method}`;
}

// Decision Extraction Helpers
function extractAVCADecision(module: string, method: string, result: any): any {
  if (!result) return {};

  // Extract decision-specific data based on module and method
  if (module === 'AI_CLIENT' && method === 'classifyIntent') {
    return {
      logic: `Classified as: ${result.intent}`,
      confidence: result.confidence,
      alternatives: result.alternatives
    };
  }

  if (module === 'BLUEPRINT_SERVICE' && method === 'validateBlueprint') {
    return {
      logic: result.isValid ? 'Blueprint validated successfully' : 'Blueprint validation failed',
      confidence: result.validationScore
    };
  }

  return {};
}

function extractDIASDecision(module: string, method: string, result: any): any {
  if (!result) return {};

  // Extract decision-specific data based on module and method
  if (module === 'FRAMEWORK_DETECTOR' && result.framework) {
    return {
      logic: `Detected: ${result.framework} v${result.version}`,
      confidence: result.confidence,
      alternatives: result.alternatives?.map((f: any) => f.name)
    };
  }

  if (module === 'PATTERN_RECOGNITION' && result.projectType) {
    return {
      logic: `Identified as: ${result.projectType}`,
      confidence: result.complexity?.score
    };
  }

  return {};
}

// Metadata Extraction Helpers
function extractAVCAMetadata(instance: any, result: any): any {
  const metadata: any = {};

  // Extract token usage if available
  if (instance.lastTokenUsage) {
    metadata.tokenUsage = instance.lastTokenUsage;
  }

  // Check cache status
  if (instance.cacheHit !== undefined) {
    metadata.cacheHit = instance.cacheHit;
  }

  return metadata;
}

function extractDIASMetadata(instance: any, result: any): any {
  const metadata: any = {};

  // Extract learning data
  if (instance.learningEnabled && result.learningApplied) {
    metadata.learningApplied = true;
  }

  // Extract pattern matches
  if (result.patterns?.length) {
    metadata.patternsMatched = result.patterns.length;
  }

  return metadata;
}

// Helper Functions
function extractMethodInputs(method: string, args: any[]): any {
  // Extract meaningful input data based on method signature
  if (args.length === 0) return {};
  
  const firstArg = args[0];
  if (typeof firstArg === 'object' && firstArg !== null) {
    return firstArg;
  }
  
  return { input: firstArg };
}

function extractMethodOutputs(result: any): any {
  if (!result) return {};
  
  if (typeof result === 'object') {
    // Extract key metrics from result
    return {
      type: result.type || result.constructor?.name,
      hasData: !!result.data,
      success: result.success !== false,
      ...(result.metrics && { metrics: result.metrics })
    };
  }
  
  return { result: typeof result };
}

function extractInvolvedServices(instance: any, args: any[], result: any): string[] {
  const services = [];
  
  if (instance.avca) services.push('AVCA');
  if (instance.dias) services.push('DIAS');
  if (result?.services) services.push(...result.services);
  
  return [...new Set(services)];
}