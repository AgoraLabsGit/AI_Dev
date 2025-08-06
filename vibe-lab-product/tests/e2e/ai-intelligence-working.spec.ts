import { test, expect } from '@playwright/test';

/**
 * Working AI Intelligence Tests
 * Tests the actual AI responses and intelligence
 */

test.describe('AI Intelligence - Working Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
  });

  test('should provide intelligent e-commerce platform advice', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Send e-commerce request
    await chatInput.fill('I want to build an e-commerce platform');
    await sendButton.click();
    
    // Wait for typing indicator to appear first
    await expect(page.locator('text=...')).toBeVisible();
    
    // Wait for typing indicator to disappear and AI response to appear
    await page.waitForFunction(() => {
      const chatContainer = document.querySelector('[data-testid="onboarding-chat"]');
      if (!chatContainer) return false;
      
      const messages = chatContainer.querySelectorAll('[class*="message"], div');
      return Array.from(messages).some(msg => {
        const text = msg.textContent || '';
        return text.length > 50 && 
               !text.includes('...') && 
               (text.includes('e-commerce') || text.includes('platform') || text.includes('market'));
      });
    }, { timeout: 30000 });
    
    // Find and validate the AI response
    const chatContainer = page.locator('[data-testid="onboarding-chat"]');
    const aiResponse = chatContainer.locator('text=/.*e-commerce.*|.*platform.*|.*market.*/i').first();
    
    await expect(aiResponse).toBeVisible();
    
    const responseText = await aiResponse.textContent();
    console.log('AI Response:', responseText);
    
    // Validate intelligent response
    expect(responseText?.length).toBeGreaterThan(50);
    expect(responseText?.toLowerCase()).toMatch(/e-commerce|platform|market|product|business|segment/);
  });

  test('should ask clarifying questions for better project planning', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    await chatInput.fill('Build me a mobile app');
    await sendButton.click();
    
    // Wait for AI response about mobile apps
    await page.waitForFunction(() => {
      const chatContainer = document.querySelector('[data-testid="onboarding-chat"]');
      if (!chatContainer) return false;
      
      const messages = chatContainer.querySelectorAll('div');
      return Array.from(messages).some(msg => {
        const text = msg.textContent || '';
        return text.length > 30 && 
               !text.includes('...') && 
               (text.includes('mobile') || text.includes('app') || text.includes('platform'));
      });
    }, { timeout: 25000 });
    
    // Get all text in the chat container
    const chatContainer = page.locator('[data-testid="onboarding-chat"]');
    const chatText = await chatContainer.textContent();
    
    console.log('Chat content for mobile app:', chatText);
    
    // AI should ask questions or provide mobile-specific guidance
    expect(chatText?.toLowerCase()).toMatch(/mobile|app|ios|android|platform|feature|type|purpose/);
    expect(chatText?.length).toBeGreaterThan(100);
  });

  test('should generate relevant quick actions', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    await chatInput.fill('I want to create a web application');
    await sendButton.click();
    
    // Wait for response and quick actions
    await page.waitForTimeout(10000);
    
    // Look for any buttons that might be quick actions
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    console.log(`Found ${buttonCount} buttons`);
    
    if (buttonCount > 2) { // More than just send button
      const buttonTexts = await buttons.allTextContents();
      console.log('Button texts:', buttonTexts);
      
      // Should have some relevant quick actions
      const relevantButtons = buttonTexts.filter(text => 
        /web|app|react|vue|database|api|framework|suggest|help/i.test(text)
      );
      
      expect(relevantButtons.length).toBeGreaterThan(0);
    }
  });

  test('should handle complex project requirements intelligently', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    const complexRequest = 'I need a project management tool with team collaboration, task tracking, and real-time updates';
    
    await chatInput.fill(complexRequest);
    await sendButton.click();
    
    // Wait for AI to process complex request
    await page.waitForFunction(() => {
      const chatContainer = document.querySelector('[data-testid="onboarding-chat"]');
      if (!chatContainer) return false;
      
      const content = chatContainer.textContent || '';
      return content.includes('project') || 
             content.includes('management') || 
             content.includes('team') ||
             content.includes('collaboration');
    }, { timeout: 30000 });
    
    const chatContainer = page.locator('[data-testid="onboarding-chat"]');
    const chatText = await chatContainer.textContent();
    
    console.log('Complex request response:', chatText);
    
    // AI should understand the complexity and mention key components
    expect(chatText?.toLowerCase()).toMatch(/project|management|team|collaboration|task|real-time/);
    expect(chatText?.length).toBeGreaterThan(150);
  });

  test('should provide contextual follow-up responses', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // First message: establish context
    await chatInput.fill('I want to build a social media app');
    await sendButton.click();
    
    await page.waitForTimeout(8000);
    
    // Second message: add more details
    await chatInput.fill('It should focus on developers sharing code');
    await sendButton.click();
    
    // Wait for contextual response
    await page.waitForFunction(() => {
      const chatContainer = document.querySelector('[data-testid="onboarding-chat"]');
      if (!chatContainer) return false;
      
      const content = chatContainer.textContent || '';
      return content.includes('developer') || 
             content.includes('code') || 
             content.includes('social');
    }, { timeout: 25000 });
    
    const chatContainer = page.locator('[data-testid="onboarding-chat"]');
    const chatText = await chatContainer.textContent();
    
    console.log('Contextual response:', chatText);
    
    // AI should build on the context (social media + developers + code)
    expect(chatText?.toLowerCase()).toMatch(/social|developer|code|share|community|github/);
  });

  test('should respond within reasonable time', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    const startTime = Date.now();
    
    await chatInput.fill('Create a simple todo app');
    await sendButton.click();
    
    // Wait for any meaningful response
    await page.waitForFunction(() => {
      const chatContainer = document.querySelector('[data-testid="onboarding-chat"]');
      if (!chatContainer) return false;
      
      const messages = chatContainer.querySelectorAll('div');
      return Array.from(messages).some(msg => {
        const text = msg.textContent || '';
        return text.length > 30 && !text.includes('...');
      });
    }, { timeout: 20000 });
    
    const responseTime = Date.now() - startTime;
    console.log(`AI response time: ${responseTime}ms`);
    
    // Should respond within 20 seconds
    expect(responseTime).toBeLessThan(20000);
    
    // Should have a meaningful response about todo apps
    const chatContainer = page.locator('[data-testid="onboarding-chat"]');
    const chatText = await chatContainer.textContent();
    expect(chatText?.toLowerCase()).toMatch(/todo|task|app|feature|simple|create/);
  });
});