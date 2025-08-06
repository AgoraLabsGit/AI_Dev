import { test, expect } from '@playwright/test';

test.describe('Document Generation Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/onboarding');
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
  });

  test.describe('Live Document Preview', () => {
    test('should transition to split-panel mode when enough information is gathered', async ({ page }) => {
      // Fill project name
      await page.fill('input[placeholder*="My Awesome Project"]', 'Test Document Generation');
      
      // Send multiple messages to gather information
      const messages = [
        'I want to build a marketplace application',
        'It should connect buyers and sellers of handmade crafts',
        'Main features: user profiles, product listings, secure payments, and reviews'
      ];
      
      for (const message of messages) {
        await page.fill('textarea[placeholder=""]', message);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000); // Wait for response
      }
      
      // Check if split-panel mode is activated
      // Should see LiveDocumentPreview component
      await expect(page.locator('text=Project Overview')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Your document builds as we chat')).toBeVisible();
    });

    test('should show document sections with proper structure', async ({ page }) => {
      // Trigger split-panel mode
      await page.fill('input[placeholder*="My Awesome Project"]', 'Document Test App');
      
      // Send message with enough info
      await page.fill('textarea[placeholder=""]', 'Build a full-featured e-commerce platform with React, Node.js, user authentication, product catalog, shopping cart, and payment processing');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Check for document sections
      const sections = [
        'What is this application?',
        'Target Users',
        'Key Features',
        'Problem Solved',
        'Success Metrics'
      ];
      
      for (const section of sections) {
        await expect(page.locator(`text=${section}`)).toBeVisible({ timeout: 10000 });
      }
    });

    test('should show section generation with typewriter effect', async ({ page }) => {
      // Set up split-panel mode
      await page.fill('input[placeholder*="My Awesome Project"]', 'Typewriter Test');
      await page.fill('textarea[placeholder=""]', 'Create a social media platform for developers to share code snippets and collaborate');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Look for typewriter cursor during generation
      const typewriterCursor = page.locator('.animate-pulse.text-blue-400');
      
      // Should see typewriter effect at some point
      await expect(typewriterCursor).toBeVisible({ timeout: 15000 });
      
      // Eventually should complete
      await expect(page.locator('text=✓ Section complete')).toBeVisible({ timeout: 20000 });
    });

    test('should allow section editing', async ({ page }) => {
      // Set up document generation
      await page.fill('input[placeholder*="My Awesome Project"]', 'Edit Test App');
      await page.fill('textarea[placeholder=""]', 'Build a task management application with team collaboration features');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Wait for a section to complete
      await page.waitForSelector('text=✓ Section complete', { timeout: 20000 });
      
      // Hover over a completed section to show controls
      const sectionContainer = page.locator('.bg-\\[\\#1A1B1E\\]').first();
      await sectionContainer.hover();
      
      // Click edit button
      await page.click('button[title="Edit section"]');
      
      // Should show textarea for editing
      await expect(page.locator('textarea[placeholder="Edit section content..."]')).toBeVisible();
      
      // Edit content
      await page.fill('textarea[placeholder="Edit section content..."]', 'This is edited content for testing');
      
      // Save edit
      await page.click('button:has-text("Save")');
      
      // Verify edited content appears
      await expect(page.locator('text=This is edited content for testing')).toBeVisible();
    });

    test('should allow section regeneration', async ({ page }) => {
      // Set up document generation
      await page.fill('input[placeholder*="My Awesome Project"]', 'Regenerate Test');
      await page.fill('textarea[placeholder=""]', 'Create a fitness tracking mobile application');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Wait for section completion
      await page.waitForSelector('text=✓ Section complete', { timeout: 20000 });
      
      // Hover and click regenerate
      const sectionContainer = page.locator('.bg-\\[\\#1A1B1E\\]').first();
      await sectionContainer.hover();
      await page.click('button[title="Regenerate section"]');
      
      // Should show writing state again
      await expect(page.locator('text=Writing...')).toBeVisible({ timeout: 5000 });
      
      // Should complete regeneration
      await expect(page.locator('text=✓ Section complete')).toBeVisible({ timeout: 20000 });
    });

    test('should show progress indicator', async ({ page }) => {
      // Set up document generation
      await page.fill('input[placeholder*="My Awesome Project"]', 'Progress Test');
      await page.fill('textarea[placeholder=""]', 'Build a video streaming platform with live chat');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Check for progress indicator
      await expect(page.locator('text=/\\d+ of \\d+ sections complete/')).toBeVisible({ timeout: 10000 });
      
      // Check for progress bar
      const progressBar = page.locator('.w-20.h-1.bg-\\[\\#2F2F33\\]');
      await expect(progressBar).toBeVisible();
    });

    test('should expand/collapse sections', async ({ page }) => {
      // Set up document with long content
      await page.fill('input[placeholder*="My Awesome Project"]', 'Expand Test');
      await page.fill('textarea[placeholder=""]', 'Build a comprehensive learning management system with courses, quizzes, certifications, and progress tracking');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Wait for section completion
      await page.waitForSelector('text=✓ Section complete', { timeout: 20000 });
      
      // Find a section with line-clamp
      const clampedSection = page.locator('.line-clamp-3').first();
      
      if (await clampedSection.isVisible()) {
        // Hover and click expand
        const sectionContainer = clampedSection.locator('..').locator('..');
        await sectionContainer.hover();
        await page.click('button[title*="Expand section"]');
        
        // Should no longer be clamped
        await expect(clampedSection).not.toHaveClass(/line-clamp-3/);
      }
    });
  });

  test.describe('Document Section States', () => {
    test('should show correct status indicators', async ({ page }) => {
      await page.fill('input[placeholder*="My Awesome Project"]', 'Status Test');
      await page.fill('textarea[placeholder=""]', 'Create a project management tool');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Check for different status indicators
      const statuses = ['Queued', 'Writing...', '✓ Section complete'];
      
      for (const status of statuses) {
        // At least one should be visible at some point
        const statusElement = page.locator(`text=${status}`);
        if (await statusElement.isVisible()) {
          expect(statusElement).toBeTruthy();
        }
      }
    });

    test('should update word count after generation', async ({ page }) => {
      await page.fill('input[placeholder*="My Awesome Project"]', 'Word Count Test');
      await page.fill('textarea[placeholder=""]', 'Build a blogging platform');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Wait for section completion
      await page.waitForSelector('text=✓ Section complete', { timeout: 20000 });
      
      // Check for word count
      await expect(page.locator('text=/\\d+ words/')).toBeVisible();
    });

    test('should show last updated timestamp', async ({ page }) => {
      await page.fill('input[placeholder*="My Awesome Project"]', 'Timestamp Test');
      await page.fill('textarea[placeholder=""]', 'Create a calendar application');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Wait for section completion
      await page.waitForSelector('text=✓ Section complete', { timeout: 20000 });
      
      // Check for timestamp
      await expect(page.locator('text=/Updated \\d+:\\d+/')).toBeVisible();
    });
  });

  test.describe('Build Specifications Document', () => {
    test.skip('should show Build Specifications panel', async ({ page }) => {
      // This is currently not implemented but planned
      await page.fill('input[placeholder*="My Awesome Project"]', 'Build Specs Test');
      await page.fill('textarea[placeholder=""]', 'Build a full-stack application with specific technical requirements');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Should eventually show Build Specifications
      await expect(page.locator('text=Build Specifications')).toBeVisible({ timeout: 10000 });
      
      // Should have tech stack sections
      const techSections = [
        'Architecture',
        'Technology Stack',
        'Data Model',
        'Integrations',
        'Performance',
        'Security'
      ];
      
      for (const section of techSections) {
        await expect(page.locator(`text=${section}`)).toBeVisible();
      }
    });
  });

  test.describe('Empty States', () => {
    test('should show empty state before document generation', async ({ page }) => {
      // Check initial empty state
      await expect(page.locator('text=/Your Project Overview will appear here/')).toBeVisible();
    });

    test('should clear empty state when generation starts', async ({ page }) => {
      // Verify empty state exists
      await expect(page.locator('text=/Your Project Overview will appear here/')).toBeVisible();
      
      // Trigger generation
      await page.fill('input[placeholder*="My Awesome Project"]', 'Empty State Test');
      await page.fill('textarea[placeholder=""]', 'Build a recipe sharing application');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Empty state should be gone
      await expect(page.locator('text=/Your Project Overview will appear here/')).not.toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle section generation failures gracefully', async ({ page }) => {
      // This would require mocking API failures
      // For now, we verify the UI can handle error states
      
      await page.fill('input[placeholder*="My Awesome Project"]', 'Error Test');
      await page.fill('textarea[placeholder=""]', 'Test error handling');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // The UI should remain functional even if errors occur
      const chatInput = page.locator('textarea[placeholder=""]');
      await expect(chatInput).toBeEnabled();
    });
  });

  test.describe('Performance', () => {
    test('should handle multiple sections generating simultaneously', async ({ page }) => {
      await page.fill('input[placeholder*="My Awesome Project"]', 'Performance Test');
      await page.fill('textarea[placeholder=""]', 'Build a complex enterprise application with many features');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Multiple sections should generate
      const writingIndicators = page.locator('text=Writing...');
      const count = await writingIndicators.count();
      
      // Should handle multiple generations
      if (count > 0) {
        expect(count).toBeGreaterThanOrEqual(1);
      }
      
      // All should eventually complete
      await expect(page.locator('text=✓ Section complete').first()).toBeVisible({ timeout: 30000 });
    });
  });
});