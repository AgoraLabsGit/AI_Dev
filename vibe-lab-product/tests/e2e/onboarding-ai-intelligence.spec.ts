import { test, expect } from '@playwright/test';

/**
 * AI Intelligence Tests for Onboarding System
 * 
 * These tests validate the actual AI responses, intelligence, and behavior
 */

test.describe('Onboarding AI Intelligence', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
  });

  test('should provide intelligent responses to project requests', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Send a project request
    await chatInput.fill('I want to build an e-commerce platform with user authentication and payment processing');
    await sendButton.click();
    
    // Wait for AI response (up to 30 seconds)
    await page.waitForFunction(() => {
      const messages = document.querySelectorAll('[class*="message"], [class*="response"]');
      return Array.from(messages).some(msg => 
        msg.textContent && 
        msg.textContent.length > 50 && 
        !msg.textContent.includes('...')
      );
    }, { timeout: 30000 });
    
    // Verify AI provided a meaningful response
    const aiResponse = page.locator('text=/.*e-commerce.*|.*platform.*|.*authentication.*|.*payment.*/i').first();
    await expect(aiResponse).toBeVisible();
    
    // Check that response is substantial (not just a generic error)
    const responseText = await aiResponse.textContent();
    expect(responseText?.length).toBeGreaterThan(50);
    expect(responseText?.toLowerCase()).toMatch(/e-commerce|platform|auth|payment|user|database|api/);
  });

  test('should generate relevant quick actions based on project type', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Send a web app request
    await chatInput.fill('Build me a modern web application for task management');
    await sendButton.click();
    
    // Wait for quick actions to appear
    await page.waitForTimeout(10000);
    
    // Look for quick action buttons that should be relevant to web apps
    const quickActions = page.locator('button[class*="quick"], [data-testid*="quick"], button:has-text("Web"), button:has-text("React"), button:has-text("Database")');
    
    // Should have at least some quick actions
    const actionCount = await quickActions.count();
    expect(actionCount).toBeGreaterThan(0);
    
    // Verify actions are contextually relevant
    const actionTexts = await quickActions.allTextContents();
    const relevantActions = actionTexts.filter(text => 
      /web|react|vue|database|api|auth|deploy|host/i.test(text)
    );
    expect(relevantActions.length).toBeGreaterThan(0);
  });

  test('should extract and understand project requirements', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Send detailed requirements
    await chatInput.fill('I need a social media app for developers with real-time messaging, code sharing, and user profiles');
    await sendButton.click();
    
    // Wait for AI processing
    await page.waitForTimeout(15000);
    
    // Look for AI response that shows understanding of requirements
    const responseArea = page.locator('[class*="message"], [class*="response"], [class*="chat"]');
    const responseText = await responseArea.allTextContents();
    const fullResponse = responseText.join(' ').toLowerCase();
    
    // AI should understand and mention key requirements
    expect(fullResponse).toMatch(/social|messaging|real-time|code|profile|developer/);
    
    // Should ask clarifying questions or suggest next steps
    expect(fullResponse).toMatch(/question|next|step|feature|technology|framework|database/);
  });

  test('should adapt responses based on conversation context', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // First message: establish context
    await chatInput.fill('I want to build a mobile app');
    await sendButton.click();
    await page.waitForTimeout(8000);
    
    // Second message: add more details
    await chatInput.fill('It should work on both iOS and Android with offline capability');
    await sendButton.click();
    await page.waitForTimeout(8000);
    
    // Third message: technical question
    await chatInput.fill('What database should I use?');
    await sendButton.click();
    await page.waitForTimeout(8000);
    
    // Get the final AI response
    const responses = page.locator('[class*="message"], [class*="response"]');
    const lastResponseText = await responses.last().textContent();
    
    // AI should provide contextual database recommendations for mobile apps with offline capability
    expect(lastResponseText?.toLowerCase()).toMatch(/sqlite|realm|couchbase|firebase|offline|sync|mobile|database/);
    expect(lastResponseText?.length).toBeGreaterThan(30);
  });

  test('should handle technical questions intelligently', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Ask a technical question
    await chatInput.fill('What is the best architecture for a microservices-based e-commerce platform?');
    await sendButton.click();
    
    // Wait for technical response
    await page.waitForTimeout(15000);
    
    // Get AI response
    const responseArea = page.locator('[class*="message"], [class*="response"]');
    const responseText = await responseArea.allTextContents();
    const fullResponse = responseText.join(' ').toLowerCase();
    
    // Should mention relevant technical concepts
    expect(fullResponse).toMatch(/microservices|architecture|api|gateway|service|container|docker|kubernetes|database/);
    
    // Should be substantial and technical
    expect(fullResponse.length).toBeGreaterThan(100);
  });

  test('should provide project suggestions when user is unsure', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Send uncertain request
    await chatInput.fill('I want to build something but I\'m not sure what. Can you help me with ideas?');
    await sendButton.click();
    
    // Wait for suggestions
    await page.waitForTimeout(10000);
    
    // Look for quick action suggestions
    const suggestions = page.locator('button[class*="quick"], button:has-text("Web App"), button:has-text("Mobile App"), button:has-text("Marketplace")');
    const suggestionCount = await suggestions.count();
    
    expect(suggestionCount).toBeGreaterThan(2);
    
    // Verify suggestions are diverse project types
    const suggestionTexts = await suggestions.allTextContents();
    const projectTypes = suggestionTexts.filter(text => 
      /web|mobile|app|marketplace|blog|dashboard|api|game|tool/i.test(text)
    );
    expect(projectTypes.length).toBeGreaterThan(1);
  });

  test('should remember conversation history and build on it', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Establish project context
    await chatInput.fill('I\'m building a fitness tracking app');
    await sendButton.click();
    await page.waitForTimeout(8000);
    
    // Add user preferences
    await chatInput.fill('My users are primarily weightlifters and bodybuilders');
    await sendButton.click();
    await page.waitForTimeout(8000);
    
    // Ask for specific feature
    await chatInput.fill('What features should I include?');
    await sendButton.click();
    await page.waitForTimeout(10000);
    
    // Get the AI response
    const responses = page.locator('[class*="message"], [class*="response"]');
    const lastResponseText = await responses.last().textContent();
    
    // AI should provide fitness-specific recommendations for weightlifters
    expect(lastResponseText?.toLowerCase()).toMatch(/workout|exercise|weight|rep|set|progress|muscle|training|gym/);
    expect(lastResponseText?.length).toBeGreaterThan(50);
  });

  test('should handle complex multi-part project requirements', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Send complex requirements
    const complexRequest = `I need a comprehensive project management platform that includes:
    - Team collaboration with real-time chat
    - Task management with Kanban boards
    - Time tracking and reporting
    - Integration with GitHub and Slack
    - Multi-tenant architecture for different companies
    - Mobile apps for iOS and Android
    - Advanced analytics and dashboards`;
    
    await chatInput.fill(complexRequest);
    await sendButton.click();
    
    // Wait for comprehensive AI analysis
    await page.waitForTimeout(20000);
    
    // Get AI response
    const responseArea = page.locator('[class*="message"], [class*="response"]');
    const responseText = await responseArea.allTextContents();
    const fullResponse = responseText.join(' ').toLowerCase();
    
    // AI should acknowledge the complexity and mention key components
    expect(fullResponse).toMatch(/complex|comprehensive|platform|management/);
    expect(fullResponse).toMatch(/team|collaboration|task|kanban|time|track/);
    expect(fullResponse).toMatch(/github|slack|integration|api/);
    expect(fullResponse).toMatch(/mobile|ios|android|app/);
    
    // Should be a substantial response (complex projects need detailed responses)
    expect(fullResponse.length).toBeGreaterThan(200);
  });

  test('should provide intelligent error recovery suggestions', async ({ page }) => {
    const chatInput = page.locator('textarea');
    const sendButton = page.locator('[data-testid="send-message-button"]');
    
    // Send an ambiguous or problematic request
    await chatInput.fill('Build me something with AI and blockchain that makes money');
    await sendButton.click();
    
    // Wait for AI response
    await page.waitForTimeout(12000);
    
    // AI should ask clarifying questions rather than just saying "I don't understand"
    const responseArea = page.locator('[class*="message"], [class*="response"]');
    const responseText = await responseArea.allTextContents();
    const fullResponse = responseText.join(' ').toLowerCase();
    
    // Should ask clarifying questions
    expect(fullResponse).toMatch(/question|clarify|specific|what.*type|tell.*more|help.*understand/);
    
    // Should still be helpful and not dismissive
    expect(fullResponse).not.toMatch(/can't.*help|don't.*understand|impossible|not.*possible/);
    expect(fullResponse.length).toBeGreaterThan(30);
  });

  test.describe('Performance and Responsiveness', () => {
    test('should respond within reasonable time limits', async ({ page }) => {
      const chatInput = page.locator('textarea');
      const sendButton = page.locator('[data-testid="send-message-button"]');
      
      const startTime = Date.now();
      
      await chatInput.fill('Create a simple todo app');
      await sendButton.click();
      
      // Wait for typing indicator to disappear and real response to appear
      await page.waitForFunction(() => {
        const messages = document.querySelectorAll('[class*="message"], [class*="response"]');
        return Array.from(messages).some(msg => 
          msg.textContent && 
          msg.textContent.length > 20 && 
          !msg.textContent.includes('...')
        );
      }, { timeout: 30000 });
      
      const responseTime = Date.now() - startTime;
      
      // AI should respond within 30 seconds for simple requests
      expect(responseTime).toBeLessThan(30000);
      
      console.log(`AI response time: ${responseTime}ms`);
    });
  });
});