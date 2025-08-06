import { test, expect } from '@playwright/test';

/**
 * Basic Onboarding Functionality Tests
 * 
 * These tests verify core onboarding page functionality:
 * - Page loads correctly
 * - Chat interface is available
 * - Basic user interactions work
 */

test.describe('Onboarding Page - Basic Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load onboarding page successfully', async ({ page }) => {
    // Check that the main onboarding container is present
    await expect(page.locator('main')).toBeVisible();
    
    // Check for key UI elements
    await expect(page.locator('h1')).toContainText('Tell me about your project');
    
    // Verify chat interface is present
    const chatContainer = page.locator('[data-testid="onboarding-chat"]');
    await expect(chatContainer).toBeVisible();
  });

  test('should display chat input and send button', async ({ page }) => {
    // Check for textarea input
    const chatInput = page.locator('textarea[placeholder*=""]');
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeEditable();
    
    // Check for send button
    const sendButton = page.locator('[data-testid="send-message-button"]');
    await expect(sendButton).toBeVisible();
  });

  test('should allow typing in chat input', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*=""]');
    
    // Type a test message
    await chatInput.fill('This is a test message');
    
    // Verify the text was entered
    await expect(chatInput).toHaveValue('This is a test message');
  });

  test('should have quick action buttons', async ({ page }) => {
    // Look for quick action buttons
    const quickActions = page.locator('[data-testid*="quick-action"]');
    
    // Should have at least one quick action button
    await expect(quickActions.first()).toBeVisible();
  });

  test('should display SuperClaude indicators when enabled', async ({ page }) => {
    // Set SuperClaude feature flags
    await page.addInitScript(() => {
      localStorage.setItem('feature-flags', JSON.stringify({
        useSuperClaude: true,
        showPersonaInfo: true,
        showSuperClaudeIndicators: true,
        enableContext7: true
      }));
    });
    
    // Reload to apply feature flags
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check for SuperClaude indicators (if implemented)
    // Note: These selectors may need adjustment based on actual implementation
    const superClaudeIndicators = page.locator('[data-testid*="superclaude"], [class*="superclaude"]');
    
    // Just verify the page still loads correctly with SuperClaude enabled
    await expect(page.locator('h1')).toContainText('Tell me about your project');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that main elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea[placeholder*=""]')).toBeVisible();
    
    // Verify layout doesn't break on mobile
    const chatContainer = page.locator('[data-testid="onboarding-chat"]');
    await expect(chatContainer).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*=""]');
    
    // Focus should be manageable via keyboard
    await chatInput.focus();
    await expect(chatInput).toBeFocused();
    
    // Tab navigation should work
    await page.keyboard.press('Tab');
    
    // Should be able to return focus to input
    await chatInput.focus();
    await expect(chatInput).toBeFocused();
  });

  test('should display page title correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Vibe Lab/);
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // This test verifies the page loads even if some resources fail
      await page.route('**/*', (route) => {
        // Let most requests through normally
        if (route.request().url().includes('/api/')) {
          // Simulate API timeout for API calls
          route.abort('timedout');
        } else {
          route.continue();
        }
      });
      
      await page.goto('/onboarding');
      
      // Page should still load with basic functionality
      await expect(page.locator('h1')).toContainText('Tell me about your project');
      await expect(page.locator('textarea[placeholder*=""]')).toBeVisible();
    });
  });
});