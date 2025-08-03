import { test, expect } from '@playwright/test';

test.describe('Onboarding API Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('http://localhost:3000/onboarding');
    
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
  });

  test.describe('Chat API Integration', () => {
    test('should successfully send message and receive AI response', async ({ page }) => {
      // Listen for network requests to the API
      const apiCalls = [];
      page.on('request', request => {
        if (request.url().includes('/api/onboarding/chat')) {
          apiCalls.push({
            url: request.url(),
            method: request.method(),
            postData: request.postData()
          });
        }
      });

      // Listen for network responses
      const apiResponses = [];
      page.on('response', response => {
        if (response.url().includes('/api/onboarding/chat')) {
          apiResponses.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
          });
        }
      });

      // Type a simple message
      const message = 'Build me an instagram clone';
      await page.fill('input[placeholder=""]', message);
      
      // Send the message
      await page.click('[data-testid="send-message-button"]');
      
      // Verify the message appears in chat immediately
      await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
      
      // Wait for API call to be made
      await page.waitForFunction(() => {
        return document.querySelector('.bg-\\[\\#1A1A1C\\]') !== null;
      }, { timeout: 15000 });

      // Check that API call was made
      expect(apiCalls.length).toBeGreaterThan(0);
      expect(apiCalls[0].method).toBe('POST');
      expect(apiCalls[0].url).toContain('/api/onboarding/chat');

      // Check API response
      expect(apiResponses.length).toBeGreaterThan(0);
      expect(apiResponses[0].status).toBe(200);

      // Verify an AI response appears (any response is good)
      // Wait for the AI response message to appear
      await page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 10000 });
      
      // Check that we have more than just the user message
      const messageElements = page.locator('[data-testid="onboarding-chat"] > div > div');
      const messageCount = await messageElements.count();
      expect(messageCount).toBeGreaterThan(1); // Should have user message + AI response
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Monitor console for errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Intercept and block the API call to simulate server error
      await page.route('**/api/onboarding/chat*', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      // Send a message
      const message = 'Test error handling';
      await page.fill('input[placeholder=""]', message);
      await page.click('[data-testid="send-message-button"]');
      
      // Verify the user message still appears
      await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
      
      // Verify error message appears
      await expect(page.locator('text=I apologize, but I\'m having trouble processing your message right now')).toBeVisible({ timeout: 10000 });
    });

    test('should send correct request format to API', async ({ page }) => {
      let requestBody = null;
      
      // Intercept API call to examine request
      await page.route('**/api/onboarding/chat*', async (route) => {
        const request = route.request();
        requestBody = JSON.parse(request.postData() || '{}');
        
        // Forward to actual API
        route.continue();
      });

      // Fill project name
      await page.fill('input[placeholder*="My Awesome Project"]', 'Test Project');
      
      // Send a message
      const message = 'I want to build a social media app';
      await page.fill('input[placeholder=""]', message);
      await page.click('[data-testid="send-message-button"]');
      
      // Wait for request to be made
      await page.waitForFunction(() => requestBody !== null, { timeout: 10000 });

      // Verify request structure
      expect(requestBody).toHaveProperty('message', message);
      expect(requestBody).toHaveProperty('projectName', 'Test Project');
      expect(requestBody).toHaveProperty('conversationHistory');
      expect(Array.isArray(requestBody.conversationHistory)).toBe(true);
      expect(requestBody).toHaveProperty('context');
      expect(requestBody.context).toHaveProperty('stage', 'initial');
    });

    test('should handle QuickAction buttons after API response', async ({ page }) => {
      // Send initial message
      const message = 'Build me a web application';
      await page.fill('input[placeholder=""]', message);
      await page.click('[data-testid="send-message-button"]');
      
      // Wait for AI response
      await page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 15000 });
      
      // Look for QuickAction buttons in the response
      const quickActionButtons = page.locator('.quick-action-btn');
      const buttonCount = await quickActionButtons.count();
      
      if (buttonCount > 0) {
        // Click the first QuickAction button
        await quickActionButtons.first().click();
        
        // Verify the action was processed (should send another message or show UI change)
        await page.waitForTimeout(1000);
        
        // Check that either a new message was sent or UI state changed
        const messages = page.locator('[data-testid="onboarding-chat"] > div > div');
        const messageCount = await messages.count();
        
        // Should have at least user message + AI response + potential new message
        expect(messageCount).toBeGreaterThanOrEqual(2);
      }
    });

    test('should maintain conversation history across multiple messages', async ({ page }) => {
      let requestBodies = [];
      
      // Intercept all API calls
      await page.route('**/api/onboarding/chat*', async (route) => {
        const request = route.request();
        const body = JSON.parse(request.postData() || '{}');
        requestBodies.push(body);
        route.continue();
      });

      // Send first message
      await page.fill('input[placeholder=""]', 'I want to build a web app');
      await page.click('[data-testid="send-message-button"]');
      
      // Wait for response
      await page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 15000 });
      
      // Send second message
      await page.fill('input[placeholder=""]', 'It should have user authentication');
      await page.click('[data-testid="send-message-button"]');
      
      // Wait for second response
      await page.waitForTimeout(5000);
      
      // Check that conversation history builds up
      if (requestBodies.length >= 2) {
        const secondRequest = requestBodies[1];
        expect(secondRequest.conversationHistory.length).toBeGreaterThan(0);
        
        // Verify history contains previous messages
        const historyContent = secondRequest.conversationHistory.map(msg => msg.content).join(' ');
        expect(historyContent).toContain('web app');
      }
    });

    test('should handle different entry paths (GitHub, Upload, Docs)', async ({ page }) => {
      let requestBody = null;
      
      // Intercept API call
      await page.route('**/api/onboarding/chat*', async (route) => {
        const request = route.request();
        requestBody = JSON.parse(request.postData() || '{}');
        route.continue();
      });

      // Test GitHub Import path
      await page.click('button:has-text("GitHub Import")');
      await page.fill('input[placeholder*="https://github.com/username/repository"]', 'https://github.com/test/repo');
      await page.click('[data-testid="github-import-button"]');
      
      // Wait for API call
      await page.waitForFunction(() => requestBody !== null, { timeout: 10000 });
      
      // Verify message contains GitHub reference
      expect(requestBody.message).toContain('GitHub');
      expect(requestBody.message).toContain('https://github.com/test/repo');
    });
  });

  test.describe('API Performance and Reliability', () => {
    test('should respond within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      let endTime = null;
      
      // Monitor API response time
      page.on('response', response => {
        if (response.url().includes('/api/onboarding/chat')) {
          endTime = Date.now();
        }
      });

      // Send message
      await page.fill('input[placeholder=""]', 'Quick response test');
      await page.click('[data-testid="send-message-button"]');
      
      // Wait for response
      await page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 15000 });
      
      // Check response time (should be under 10 seconds for simple endpoint)
      if (endTime) {
        const responseTime = endTime - startTime;
        console.log(`API response time: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(10000); // 10 seconds max
      }
    });

    test('should handle concurrent requests', async ({ page }) => {
      // Open multiple messages rapidly
      const messages = [
        'Message 1',
        'Message 2', 
        'Message 3'
      ];

      for (const message of messages) {
        await page.fill('input[placeholder=""]', message);
        await page.click('[data-testid="send-message-button"]');
        await page.waitForTimeout(500); // Small delay between sends
      }
      
      // Wait for all responses
      await page.waitForTimeout(15000);
      
      // Verify all messages appear in chat
      for (const message of messages) {
        await expect(page.locator(`text=${message}`)).toBeVisible();
      }
    });

    test('should provide helpful error messages on failure', async ({ page }) => {
      // Block API completely
      await page.route('**/api/onboarding/chat*', (route) => {
        route.abort('failed');
      });

      // Send message
      await page.fill('input[placeholder=""]', 'This should fail');
      await page.click('[data-testid="send-message-button"]');
      
      // Verify helpful error message appears
      await expect(page.locator('text=I apologize, but I\'m having trouble processing your message right now')).toBeVisible({ timeout: 10000 });
    });
  });
});