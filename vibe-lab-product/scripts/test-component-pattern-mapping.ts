/**
 * COMP-002 Week 2: Component Pattern Mapping System Test
 * 
 * Tests the enhanced blueprint pattern recognition and component-pattern mapping
 * with confidence scoring system
 */

import { BlueprintParser } from '../lib/avca/pipeline/component-pipeline/blueprint-parser';
import { ComponentCatalogService } from '../lib/avca/services/component-catalog-service';
import { EventBus } from '../lib/avca/services/event-bus';

interface TestScenario {
  name: string;
  description: string;
  blueprint: any;
  expectedPatterns: string[];
  expectedComponents: string[];
  minimumConfidence: number;
}

class ComponentPatternMappingTest {
  private parser: BlueprintParser;
  private catalogService: ComponentCatalogService;
  
  constructor() {
    // Initialize services with event bus
    const eventBus = new EventBus();
    this.parser = new BlueprintParser({ eventBus });
    this.catalogService = new ComponentCatalogService({ eventBus });
  }

  async runTests(): Promise<void> {
    console.log('🚀 COMP-002 Week 2: Component Pattern Mapping System Test');
    console.log('================================================================\n');

    // Initialize services
    await this.parser.start();
    await this.catalogService.start();

    const testScenarios: TestScenario[] = [
      {
        name: 'E-commerce Product Dashboard',
        description: 'Complex e-commerce dashboard with product management',
        blueprint: {
          id: 'ecommerce-dashboard-001',
          description: 'Create a comprehensive e-commerce dashboard for product management with shopping cart, product catalog, order management, and sales analytics. The dashboard should include data visualization, performance monitoring, and business metrics.',
          projectContext: {
            name: 'E-commerce Admin Dashboard',
            description: 'Admin interface for online store management'
          },
          functionalRequirements: [
            'Display product catalog with search and filtering',
            'Show shopping cart contents and checkout process',
            'Monitor sales performance with charts and graphs',
            'Manage customer orders and inventory tracking',
            'Generate business reports and analytics'
          ],
          technicalRequirements: {
            framework: 'React with TypeScript',
            testing: 'Jest and React Testing Library',
            performance: 'Page load time < 2 seconds'
          },
          architecturalGuidelines: {
            componentStructure: 'atomic'
          }
        },
        expectedPatterns: ['dashboard', 'ecommerce', 'table', 'chart', 'navigation'],
        expectedComponents: ['navigation-header', 'product-card', 'shopping-cart', 'data-table', 'chart-card'],
        minimumConfidence: 75
      },
      {
        name: 'Blog Content Management',
        description: 'Content management system for blog publishing',
        blueprint: {
          id: 'blog-cms-001',
          description: 'Build a blog content management system with article creation, content editor, author profiles, and tag management. Include search functionality and comment system.',
          functionalRequirements: [
            'Create and edit blog articles with rich text editor',
            'Manage author profiles and bio information',
            'Organize content with tags and categories',
            'Enable search functionality for articles',
            'Handle reader comments and engagement'
          ],
          technicalRequirements: {
            framework: 'Next.js',
            performance: 'SEO optimized with fast loading'
          }
        },
        expectedPatterns: ['blog', 'form', 'search', 'profile'],
        expectedComponents: ['article-card', 'content-editor', 'search-bar', 'tag-list'],
        minimumConfidence: 70
      },
      {
        name: 'SaaS Landing Page',
        description: 'Marketing landing page for SaaS product',
        blueprint: {
          id: 'saas-landing-001',
          description: 'Create a high-conversion landing page for SaaS product with hero section, feature highlights, pricing table, customer testimonials, and lead generation forms.',
          functionalRequirements: [
            'Display compelling hero section with call-to-action',
            'Showcase product features and benefits',
            'Present pricing plans and comparison table',
            'Include customer testimonials and social proof',
            'Capture leads through contact forms'
          ]
        },
        expectedPatterns: ['landing', 'form', 'table'],
        expectedComponents: ['hero-section', 'cta-button', 'pricing-table', 'contact-form'],
        minimumConfidence: 80
      },
      {
        name: 'Chat Application Interface',
        description: 'Real-time messaging application UI',
        blueprint: {
          id: 'chat-app-001',
          description: 'Build a real-time chat application interface with message threads, user lists, emoji support, and file sharing capabilities.',
          functionalRequirements: [
            'Display chat messages in real-time conversation',
            'Show list of active users and participants',
            'Enable emoji picker for message enhancement',
            'Support file and image sharing in chats',
            'Provide message search and history'
          ]
        },
        expectedPatterns: ['chat', 'search', 'modal'],
        expectedComponents: ['chat-window', 'message-input', 'user-list', 'emoji-picker'],
        minimumConfidence: 75
      },
      {
        name: 'User Profile Settings',
        description: 'User account and profile management',
        blueprint: {
          id: 'profile-settings-001',
          description: 'Create user profile and settings management interface with account preferences, security settings, and profile customization options.',
          functionalRequirements: [
            'Display user profile information and avatar',
            'Manage account settings and preferences',
            'Configure security and privacy options',
            'Update personal information and contact details'
          ]
        },
        expectedPatterns: ['profile', 'settings', 'form'],
        expectedComponents: ['profile-card', 'settings-panel', 'avatar-upload', 'form-group'],
        minimumConfidence: 80
      }
    ];

    let passedTests = 0;
    const totalTests = testScenarios.length;

    for (const scenario of testScenarios) {
      console.log(`\n📋 Testing: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);
      console.log('-'.repeat(60));

      try {
        // Parse blueprint to detect patterns
        const parsedBlueprint = await this.parser.process(scenario.blueprint);
        const detectionData = parsedBlueprint.componentDetection;

        // Test pattern detection
        const detectedPatterns = detectionData?.detectedPatterns || [];
        console.log(`\n🔍 Pattern Detection Results:`);
        console.log(`Detected ${detectedPatterns.length} patterns with ${detectionData?.confidence || 0}% overall confidence`);
        
        detectedPatterns.forEach(pattern => {
          console.log(`  • ${pattern.type}: ${pattern.confidence}% confidence`);
          console.log(`    Keywords: ${pattern.keywords.join(', ')}`);
          console.log(`    ${pattern.description}`);
        });

        // Get component recommendations
        if (detectionData) {
          const recommendations = await this.catalogService.getRecommendations({
            blueprintAnalysis: {
              patterns: detectedPatterns,
              requirements: detectionData.componentRequirements
            },
            templateId: 'linear', // Use linear template for testing
            limit: 10
          });

          console.log(`\n🧩 Component Recommendations:`);
          console.log(`Generated ${recommendations.recommendations.length} component recommendations`);
          console.log(`Overall confidence: ${recommendations.confidence}%`);

          recommendations.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec.name} (${rec.componentId})`);
            console.log(`     Confidence: ${rec.confidence}%`);
            console.log(`     Category: ${rec.category}`);
            console.log(`     Reasoning: ${rec.reasoning.join('; ')}`);
          });

          // Validate test expectations
          const testResults = this.validateTestResults(scenario, detectedPatterns, recommendations.recommendations);
          
          console.log(`\n✅ Test Validation:`);
          console.log(`Pattern Detection: ${testResults.patternMatch ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`Component Mapping: ${testResults.componentMatch ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`Confidence Threshold: ${testResults.confidencePass ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`Overall: ${testResults.overall ? '✅ PASS' : '❌ FAIL'}`);

          if (testResults.overall) {
            passedTests++;
          }

          // Display reasoning
          console.log(`\n💡 Reasoning Analysis:`);
          detectionData.reasoning.forEach(reason => {
            console.log(`  • ${reason}`);
          });

        } else {
          console.log('❌ No component detection data available');
        }

      } catch (error) {
        console.error(`❌ Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      console.log('\n' + '='.repeat(80));
    }

    // Final results
    console.log(`\n🎯 FINAL RESULTS:`);
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Component pattern mapping system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Review the results above for details.');
    }

    // Cleanup
    await this.parser.stop();
    await this.catalogService.stop();
  }

  private validateTestResults(
    scenario: TestScenario,
    detectedPatterns: any[],
    recommendedComponents: any[]
  ): {
    patternMatch: boolean;
    componentMatch: boolean;
    confidencePass: boolean;
    overall: boolean;
  } {
    // Check pattern detection
    const detectedPatternTypes = detectedPatterns.map(p => p.type);
    const patternMatch = scenario.expectedPatterns.some(expected => 
      detectedPatternTypes.includes(expected)
    );

    // Check component recommendations
    const recommendedComponentIds = recommendedComponents.map(c => c.componentId);
    const componentMatch = scenario.expectedComponents.some(expected => 
      recommendedComponentIds.some(recommended => recommended.includes(expected))
    );

    // Check confidence threshold
    const avgConfidence = recommendedComponents.length > 0
      ? recommendedComponents.reduce((sum, c) => sum + c.confidence, 0) / recommendedComponents.length
      : 0;
    const confidencePass = avgConfidence >= scenario.minimumConfidence;

    const overall = patternMatch && componentMatch && confidencePass;

    return {
      patternMatch,
      componentMatch,
      confidencePass,
      overall
    };
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const test = new ComponentPatternMappingTest();
  test.runTests().catch(console.error);
}

export { ComponentPatternMappingTest };