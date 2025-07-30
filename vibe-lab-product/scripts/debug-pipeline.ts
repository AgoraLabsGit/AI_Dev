import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
import { ComponentPlanner } from '../lib/avca/pipeline/component-pipeline/component-planner';
import { CodeGenerator } from '../lib/avca/pipeline/component-pipeline/code-generator';
import { QualityAssurance } from '../lib/avca/pipeline/component-pipeline/quality-assurance';
import { EventBus } from '../lib/avca/services/event-bus';

const debug = async () => {
  const eventBus = new EventBus();
  const parser = new BlueprintParser({ eventBus });
  const planner = new ComponentPlanner({ eventBus });
  const generator = new CodeGenerator({ eventBus });
  const qa = new QualityAssurance({ eventBus });
  
  await parser.start();
  await planner.start();
  await generator.start();
  await qa.start();
  
  const rawBlueprint = {
    name: 'ComplexComponent',
    description: 'Complex component needing optimization',
    functionalRequirements: [
      'Display data grid',
      'Filter results',
      'Sort columns',
      'Handle pagination'
    ]
  };
  
  const blueprint = await parser.process(rawBlueprint);
  const plan = await planner.process(blueprint);
  const generated = await generator.process(plan);
  const optimized = await qa.process(generated);
  
  console.log('Complexity:', blueprint.metadata.complexity);
  console.log('Component file:', generated.files.find(f => f.path.includes('ComplexComponent.tsx'))?.path);
  console.log('Optimizations applied:', optimized.qualityReport.optimizations);
  console.log('Optimization count:', optimized.improvements.optimizationsApplied);
  
  await qa.stop();
  await generator.stop();
  await planner.stop();
  await parser.stop();
};

debug();
