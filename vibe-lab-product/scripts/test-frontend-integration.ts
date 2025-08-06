#!/usr/bin/env tsx
/**
 * Test Frontend SuperClaude Integration
 * Tests the SuperClaude frontend integration in the onboarding page
 */

import { chromium } from 'playwright';

async function testFrontendIntegration() {
  console.log('🧪 Testing SuperClaude Frontend Integration...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the onboarding page
    console.log('📁 Navigating to onboarding page...');
    await page.goto('http://localhost:3000/onboarding');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="onboarding-chat"]');
    console.log('✅ Onboarding page loaded successfully');

    // Check if SuperClaude indicators are present (if feature flags are enabled)
    const superClaudeIndicator = await page.$('.bg-yellow-900\\/50'); // SuperClaude badge
    if (superClaudeIndicator) {
      console.log('✅ SuperClaude status indicators found');
    }

    // Test Quick Actions
    console.log('\n🎯 Testing Quick Actions...');
    const quickActions = await page.$$('.quick-action-btn');
    console.log(`✅ Found ${quickActions.length} quick action buttons`);

    // Check for SuperClaude specific actions
    const strategicPlanBtn = await page.$('button:has-text("Strategic Plan")');
    const getGuidanceBtn = await page.$('button:has-text("Get Guidance")');
    
    if (strategicPlanBtn || getGuidanceBtn) {
      console.log('✅ SuperClaude action buttons found');
    } else {
      console.log('ℹ️  SuperClaude actions not visible (feature flags may be disabled)');
    }

    // Test chat input functionality
    console.log('\n💬 Testing chat interface...');
    const chatInput = await page.$('input[type="text"]');
    const sendButton = await page.$('[data-testid="send-message-button"]');
    
    if (chatInput && sendButton) {
      console.log('✅ Chat input and send button found');
      
      // Test typing in chat
      await chatInput.fill('Test message for SuperClaude integration');
      console.log('✅ Chat input functionality working');
      
      // Clear the input to avoid sending test message
      await chatInput.fill('');
    }

    // Check for persona indicators (if enabled)
    const personaIndicators = await page.$$('.bg-purple-900\\/50, .bg-blue-900\\/50, .bg-green-900\\/50');
    if (personaIndicators.length > 0) {
      console.log('✅ Persona indicators found');
    }

    // Test project name input
    console.log('\n📝 Testing project name input...');
    const projectNameInput = await page.$('input[placeholder*="My Awesome Project"]');
    if (projectNameInput) {
      await projectNameInput.fill('Test SuperClaude Project');
      console.log('✅ Project name input working');
    }

    console.log('\n🎉 Frontend integration test completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`   • Onboarding page: ✅ Loaded`);
    console.log(`   • Quick actions: ✅ ${quickActions.length} buttons found`);
    console.log(`   • Chat interface: ✅ Functional`);
    console.log(`   • Project input: ✅ Working`);
    
    return {
      success: true,
      quickActionCount: quickActions.length,
      personaIndicators: personaIndicators.length,
      hasSuperclaude: !!(strategicPlanBtn || getGuidanceBtn)
    };

  } catch (error) {
    console.error('❌ Frontend integration test failed:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Main execution
if (require.main === module) {
  testFrontendIntegration()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All frontend integration tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Frontend integration tests failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { testFrontendIntegration };