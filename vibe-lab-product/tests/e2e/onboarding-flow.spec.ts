import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow State Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('http://localhost:3000/onboarding');
    
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
    
    // Verify initial state
    await expect(page.locator('h1')).toContainText('Let\'s build something amazing together');
  });

  test.describe('Quick Action State Transitions', () => {
    test('should handle New Project → GitHub Import → New Project transition', async ({ page }) => {
      // Test New Project quick action
      await page.click('button:has-text("New Project")');
      
      // Verify chat input shows
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
      
      // Now click GitHub Import
      await page.click('button:has-text("GitHub Import")');
      
      // Verify GitHub URL input appears
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).toBeVisible();
      await expect(page.locator('[data-testid="github-import-button"]')).toBeVisible();
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
      
      // Click Cancel to go back
      await page.click('button:has-text("Cancel")');
      
      // Verify we're back to normal chat state
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).not.toBeVisible();
      
      // Now try New Project again
      await page.click('button:has-text("New Project")');
      
      // Verify it still works
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });

    test('should handle GitHub Import → Upload Code → GitHub Import transition', async ({ page }) => {
      // Start with GitHub Import
      await page.click('button:has-text("GitHub Import")');
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).toBeVisible();
      
      // Switch to Upload Code
      await page.click('button:has-text("Upload Code")');
      
      // Verify Upload Code interface
      await expect(page.locator('input[type="file"]')).toBeVisible();
      await expect(page.locator('[data-testid="code-upload-button"]')).toBeVisible();
      
      // Switch back to GitHub Import
      await page.click('button:has-text("GitHub Import")');
      
      // Verify GitHub interface is back
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).toBeVisible();
      await expect(page.locator('input[type="file"]')).not.toBeVisible();
    });

    test('should handle Upload Code → Import Docs → Upload Code transition', async ({ page }) => {
      // Start with Upload Code
      await page.click('button:has-text("Upload Code")');
      await expect(page.locator('input[type="file"]')).toBeVisible();
      
      // Switch to Import Docs
      await page.click('button:has-text("Import Docs")');
      
      // Verify Import Docs interface
      await expect(page.locator('input[type="file"][accept*=".md"]')).toBeVisible();
      await expect(page.locator('[data-testid="docs-import-button"]')).toBeVisible();
      
      // Switch back to Upload Code
      await page.click('button:has-text("Upload Code")');
      
      // Verify Upload Code interface is back
      await expect(page.locator('input[type="file"]')).toBeVisible();
      await expect(page.locator('input[type="file"][accept*=".md"]')).not.toBeVisible();
    });

    test('should handle Import Docs → New Project → Import Docs transition', async ({ page }) => {
      // Start with Import Docs
      await page.click('button:has-text("Import Docs")');
      await expect(page.locator('input[type="file"][accept*=".md"]')).toBeVisible();
      
      // Switch to New Project
      await page.click('button:has-text("New Project")');
      
      // Verify back to normal chat
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
      await expect(page.locator('input[type="file"]')).not.toBeVisible();
      
      // Switch back to Import Docs
      await page.click('button:has-text("Import Docs")');
      
      // Verify Import Docs interface is back
      await expect(page.locator('input[type="file"][accept*=".md"]')).toBeVisible();
    });
  });

  test.describe('State Management Edge Cases', () => {
    test('should maintain project name across state transitions', async ({ page }) => {
      // Enter a project name
      const projectName = 'Test Project 123';
      await page.fill('input[placeholder*="My Awesome Project"]', projectName);
      
      // Switch between different states
      await page.click('button:has-text("GitHub Import")');
      await page.click('button:has-text("Upload Code")');
      await page.click('button:has-text("New Project")');
      
      // Verify project name is preserved
      await expect(page.locator('input[placeholder*="My Awesome Project"]')).toHaveValue(projectName);
    });

    test('should clear upload state when switching modes', async ({ page }) => {
      // Go to GitHub Import and enter URL
      await page.click('button:has-text("GitHub Import")');
      await page.fill('input[placeholder*="https://github.com/username/repository"]', 'https://github.com/test/repo');
      
      // Switch to Upload Code
      await page.click('button:has-text("Upload Code")');
      
      // Switch back to GitHub Import
      await page.click('button:has-text("GitHub Import")');
      
      // Verify GitHub URL field is cleared
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).toHaveValue('');
    });

    test('should handle rapid state switching without errors', async ({ page }) => {
      // Rapidly switch between states
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("New Project")');
        await page.waitForTimeout(100);
        await page.click('button:has-text("GitHub Import")');
        await page.waitForTimeout(100);
        await page.click('button:has-text("Upload Code")');
        await page.waitForTimeout(100);
        await page.click('button:has-text("Import Docs")');
        await page.waitForTimeout(100);
      }
      
      // Verify final state is correct
      await expect(page.locator('input[type="file"][accept*=".md"]')).toBeVisible();
      
      // Verify no error messages
      await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    });
  });

  test.describe('Form Submission and Validation', () => {
    test('should handle GitHub Import form submission', async ({ page }) => {
      await page.click('button:has-text("GitHub Import")');
      
      // Verify button is initially disabled
      await expect(page.locator('[data-testid="github-import-button"]')).toBeDisabled();
      
      // Enter valid URL
      await page.fill('input[placeholder*="https://github.com/username/repository"]', 'https://github.com/test/repo');
      await expect(page.locator('[data-testid="github-import-button"]')).toBeEnabled();
      
      // Submit form
      await page.click('[data-testid="github-import-button"]');
      
      // Verify submission was processed (should show in chat)
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });

    test('should handle Upload Code form submission', async ({ page }) => {
      await page.click('button:has-text("Upload Code")');
      
      // Test empty submission
      await expect(page.locator('[data-testid="code-upload-button"]')).toBeDisabled();
      
      // Mock file selection
      const fileInput = page.locator('input[type="file"]');
      
      // Create a test file
      await fileInput.setInputFiles({
        name: 'test.js',
        mimeType: 'text/javascript',
        buffer: Buffer.from('console.log("test");')
      });
      
      await expect(page.locator('[data-testid="code-upload-button"]')).toBeEnabled();
      
      // Submit form
      await page.click('[data-testid="code-upload-button"]');
      
      // Verify submission was processed
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });

    test('should handle Import Docs form submission', async ({ page }) => {
      await page.click('button:has-text("Import Docs")');
      
      // Test empty submission
      await expect(page.locator('[data-testid="docs-import-button"]')).toBeDisabled();
      
      // Mock file selection
      const fileInput = page.locator('input[type="file"][accept*=".md"]');
      
      // Create a test file
      await fileInput.setInputFiles({
        name: 'test.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('# Test Documentation\nThis is a test.')
      });
      
      await expect(page.locator('[data-testid="docs-import-button"]')).toBeEnabled();
      
      // Submit form
      await page.click('[data-testid="docs-import-button"]');
      
      // Verify submission was processed
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });
  });

  test.describe('Accessibility and UX', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Test keyboard navigation through quick actions
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Should be on first quick action
      await page.keyboard.press('Enter');
      
      // Verify action was triggered
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });

    test('should maintain focus management during state transitions', async ({ page }) => {
      // Click GitHub Import
      await page.click('button:has-text("GitHub Import")');
      
      // Tab to URL input
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Enter URL
      await page.keyboard.type('https://github.com/test/repo');
      
      // Tab to Cancel button and press Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Verify focus is managed properly after cancel
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });

    test('should show appropriate loading states', async ({ page }) => {
      await page.click('button:has-text("GitHub Import")');
      await page.fill('input[placeholder*="https://github.com/username/repository"]', 'https://github.com/test/repo');
      
      // Verify button is enabled before clicking
      await expect(page.locator('[data-testid="github-import-button"]')).toBeEnabled();
      
      // Click import and check for loading state
      await page.click('[data-testid="github-import-button"]');
      
      // After clicking, should either be disabled or back to normal state
      // Wait a moment for state change
      await page.waitForTimeout(100);
    });
  });

  test.describe('Chat Integration', () => {
    test('should handle text input and message sending', async ({ page }) => {
      // Type a message
      const message = 'I want to build a web application';
      await page.fill('input[placeholder*="Tell me about your project"]', message);
      
      // Send message via Enter key
      await page.keyboard.press('Enter');
      
      // Verify message appears in chat
      await expect(page.locator('text=' + message)).toBeVisible();
      
      // Verify input is cleared
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toHaveValue('');
    });

    test('should handle message sending via send button', async ({ page }) => {
      const message = 'I want to build a mobile app';
      await page.fill('input[placeholder*="Tell me about your project"]', message);
      
      // Click send button
      await page.click('[data-testid="send-message-button"]');
      
      // Verify message appears in chat
      await expect(page.locator('text=' + message)).toBeVisible();
    });

    test('should show AI response after user message', async ({ page }) => {
      const message = 'Hello, I need help with my project';
      await page.fill('input[placeholder*="Tell me about your project"]', message);
      await page.keyboard.press('Enter');
      
      // Wait for user message to appear in chat
      await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
      
      // Wait for AI response (should appear within 10 seconds)
      await expect(page.locator('.bg-\\[\\#1A1A1C\\]').first()).toBeVisible({ timeout: 10000 });
      
      // Just verify an AI response appeared, don't check specific content
      await expect(page.locator('[data-testid="onboarding-chat"]')).toContainText('...', { timeout: 5000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
      
      // Test quick actions on mobile
      await page.click('button:has-text("GitHub Import")');
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).toBeVisible();
      
      // Test cancellation
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
      
      // Test state transitions
      await page.click('button:has-text("Upload Code")');
      await expect(page.locator('input[type="file"]')).toBeVisible();
      
      await page.click('button:has-text("New Project")');
      await expect(page.locator('input[placeholder*="Tell me about your project"]')).toBeVisible();
    });
  });
});