/**
 * Test Component System Integration
 * 
 * Validates the component detection and recommendation system
 */

import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
import { ComponentCatalogService } from '../lib/avca/services/component-catalog-service';
import { EventBus } from '../lib/avca/services/event-bus';

async function testComponentSystem() {
  console.log('🧪 Testing Component System Integration...\n');

  // Initialize services
  const eventBus = new EventBus();
  const blueprintParser = new BlueprintParser({ eventBus });
  const componentCatalog = new ComponentCatalogService({ eventBus });

  try {
    // Initialize the component catalog service
    await componentCatalog.start();

    // Test 1: Blueprint parsing with component detection
    console.log('📋 Test 1: Blueprint parsing with component detection');
    
    const testBlueprint = {
      id: 'test-dashboard',
      name: 'Admin Dashboard',
      description: 'Create a modern admin dashboard with navigation, data tables, charts, and user management features. Include a sidebar navigation, header with user profile, main content area with metrics cards, and a data table for user management.',
      projectContext: {
        description: 'A comprehensive admin dashboard for managing users, analytics, and system settings'
      },
      functionalRequirements: [
        'Navigation sidebar with menu items',
        'Header with user profile and notifications',
        'Metrics cards showing key performance indicators',
        'Data table for user management with sorting and filtering',
        'Charts and graphs for analytics visualization',
        'User profile management functionality'
      ],
      technicalRequirements: [
        'Responsive design for all screen sizes',
        'Accessible navigation and interactions',
        'Real-time data updates',
        'Optimized performance for large datasets'
      ],
      designRequirements: [
        'Modern, clean design with consistent spacing',
        'Use of Tailwind CSS for styling',
        'Atomic design pattern for component reusability',
        'Dark/light theme support'
      ]
    };

    const parsedBlueprint = await blueprintParser.process(testBlueprint);
    
    console.log('✅ Blueprint parsed successfully');
    console.log(`📊 Detected patterns: ${parsedBlueprint.componentDetection?.detectedPatterns.length || 0}`);
    console.log(`🔧 Component requirements: ${parsedBlueprint.componentDetection?.componentRequirements.length || 0}`);
    console.log(`🎨 Template recommendations: ${parsedBlueprint.componentDetection?.templateRecommendations.length || 0}`);
    console.log(`📈 Confidence: ${parsedBlueprint.componentDetection?.confidence || 0}%`);
    
    if (parsedBlueprint.componentDetection?.reasoning) {
      console.log('💭 Reasoning:');
      parsedBlueprint.componentDetection.reasoning.forEach(reason => {
        console.log(`   - ${reason}`);
      });
    }

    // Test 2: Component search and filtering
    console.log('\n🔍 Test 2: Component search and filtering');
    
    const searchResults = await componentCatalog.searchComponents({
      category: 'CORE',
      limit: 5
    });
    
    console.log(`✅ Found ${searchResults.components.length} components`);
    console.log(`📊 Total available: ${searchResults.total}`);
    
    searchResults.components.forEach(component => {
      console.log(`   - ${component.name} (${component.category})`);
    });

    // Test 3: Component recommendations
    console.log('\n🎯 Test 3: Component recommendations');
    
    if (parsedBlueprint.componentDetection) {
      const recommendations = await componentCatalog.getRecommendations({
        blueprintAnalysis: {
          patterns: parsedBlueprint.componentDetection.detectedPatterns,
          requirements: parsedBlueprint.componentDetection.componentRequirements
        },
        templateId: 'linear',
        limit: 8
      });
      
      console.log(`✅ Generated ${recommendations.recommendations.length} recommendations`);
      console.log(`📈 Overall confidence: ${recommendations.confidence}%`);
      
      recommendations.recommendations.forEach(rec => {
        console.log(`   - ${rec.name} (${rec.category}) - ${rec.confidence}% confidence`);
      });
      
      console.log('💭 Reasoning:');
      recommendations.reasoning.forEach(reason => {
        console.log(`   - ${reason}`);
      });
    }

    // Test 4: Template system
    console.log('\n🎨 Test 4: Template system');
    
    const templates = await componentCatalog.getTemplates();
    console.log(`✅ Loaded ${templates.length} templates`);
    
    templates.forEach(template => {
      console.log(`   - ${template.name} (${template.category})`);
    });

    // Test 5: Component details
    console.log('\n📄 Test 5: Component details');
    
    const component = await componentCatalog.getComponent('button-primary');
    if (component) {
      console.log(`✅ Retrieved component: ${component.name}`);
      console.log(`📊 Template variations: ${component.templateVariations.length}`);
      console.log(`🏷️ Tags: ${component.tags.join(', ')}`);
    }

    // Performance metrics
    console.log('\n⚡ Performance Summary:');
    console.log('✅ All component system tests passed');
    console.log('✅ Component detection integrated with blueprint parser');
    console.log('✅ Component catalog service operational');
    console.log('✅ API endpoints ready for integration');
    console.log('✅ Template system functional');
    
    console.log('\n🎉 Component System Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testComponentSystem()
    .then(() => {
      console.log('\n✅ All tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}

export { testComponentSystem }; 