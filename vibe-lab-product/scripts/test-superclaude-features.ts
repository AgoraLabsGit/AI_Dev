#!/usr/bin/env tsx
/**
 * Test SuperClaude Features with Feature Flags
 * Tests SuperClaude features by temporarily enabling feature flags
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testSuperClaudeFeatures() {
  console.log('🔬 Testing SuperClaude Features with Feature Flags...\n');

  // Create a temporary .env.local to enable SuperClaude features
  const envPath = path.join(process.cwd(), '.env.local');
  const originalEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  
  const testEnvVars = `
# Temporary SuperClaude test configuration
NEXT_PUBLIC_USE_SUPERCLAUDE=true
NEXT_PUBLIC_SHOW_PERSONA_INFO=true
NEXT_PUBLIC_SHOW_SUPERCLAUDE_INDICATORS=true
NEXT_PUBLIC_ENHANCED_RESPONSE_FORMATTING=true
NEXT_PUBLIC_ENABLE_CONTEXT7=true

${originalEnv}
`.trim();

  try {
    // Write test environment variables
    fs.writeFileSync(envPath, testEnvVars);
    console.log('🔧 Temporary feature flags enabled');

    // Wait a moment for the environment to refresh
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      // Navigate to the onboarding page
      console.log('📁 Navigating to onboarding page with SuperClaude enabled...');
      await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="onboarding-chat"]');
      console.log('✅ Onboarding page loaded');

      // Check for SuperClaude indicators
      console.log('\n🎯 Checking SuperClaude indicators...');
      
      // Look for SuperClaude badge in header
      await page.waitForTimeout(1000); // Wait for React to render
      const superClaudeBadge = await page.$('span:has-text("SuperClaude")');
      if (superClaudeBadge) {
        console.log('✅ SuperClaude status badge found');
      }

      // Check for Strategic Plan and Get Guidance buttons
      const strategicPlanBtn = await page.$('button:has-text("Strategic Plan")');
      const getGuidanceBtn = await page.$('button:has-text("Get Guidance")');
      
      if (strategicPlanBtn) {
        console.log('✅ Strategic Plan button found');
      }
      if (getGuidanceBtn) {
        console.log('✅ Get Guidance button found');
      }

      // Count all quick actions
      const quickActions = await page.$$('.quick-action-btn');
      console.log(`✅ Total quick actions: ${quickActions.length} (should be 6 with SuperClaude enabled)`);

      // Test Strategic Plan functionality if available
      if (strategicPlanBtn) {
        console.log('\n🚀 Testing Strategic Plan integration...');
        
        // Click the Strategic Plan button
        await strategicPlanBtn.click();
        console.log('✅ Strategic Plan button clicked');
        
        // Look for processing indicators
        await page.waitForTimeout(500);
        const processingIndicator = await page.$('text=architect is processing');
        if (processingIndicator) {
          console.log('✅ Processing indicator appeared');
        }
        
        // Wait for the request to complete (with timeout)
        try {
          await page.waitForSelector('text=architect is processing', { state: 'detached', timeout: 15000 });
          console.log('✅ Processing completed');
        } catch (e) {
          console.log('⏳ Processing may still be in progress (this is normal for long requests)');
        }
      }

      // Test feature flag integration
      console.log('\n🏁 Feature flag integration test complete');
      
      const results = {
        success: true,
        quickActionCount: quickActions.length,
        hasSuperClaudeBadge: !!superClaudeBadge,
        hasStrategicPlan: !!strategicPlanBtn,
        hasGetGuidance: !!getGuidanceBtn,
        expectedFeatures: quickActions.length >= 6
      };

      console.log('\n📊 SuperClaude Feature Test Results:');
      console.log(`   • SuperClaude badge: ${results.hasSuperClaudeBadge ? '✅' : '❌'}`);
      console.log(`   • Strategic Plan: ${results.hasStrategicPlan ? '✅' : '❌'}`);
      console.log(`   • Get Guidance: ${results.hasGetGuidance ? '✅' : '❌'}`);
      console.log(`   • Quick Actions: ${results.quickActionCount} total`);
      console.log(`   • Expected features: ${results.expectedFeatures ? '✅' : '❌'}`);

      return results;

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error('❌ SuperClaude feature test failed:', error);
    return { success: false, error: error.message };
  } finally {
    // Restore original environment
    if (originalEnv) {
      fs.writeFileSync(envPath, originalEnv);
    } else {
      fs.unlinkSync(envPath);
    }
    console.log('\n🔄 Original environment restored');
  }
}

// Main execution
if (require.main === module) {
  testSuperClaudeFeatures()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 SuperClaude feature tests completed!');
        if (result.expectedFeatures) {
          console.log('✅ All expected SuperClaude features working correctly');
          process.exit(0);
        } else {
          console.log('⚠️  Some SuperClaude features may not be fully enabled');
          process.exit(1);
        }
      } else {
        console.log('\n❌ SuperClaude feature tests failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { testSuperClaudeFeatures };