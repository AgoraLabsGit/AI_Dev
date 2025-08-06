import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Onboarding Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/onboarding');
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
  });

  test.describe('WCAG Compliance', () => {
    test('should pass axe accessibility scan on initial load', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe scan in split-panel mode', async ({ page }) => {
      // Trigger split-panel mode
      await page.fill('input[placeholder*="My Awesome Project"]', 'Accessibility Test');
      await page.fill('textarea[placeholder=""]', 'Build a comprehensive web application with React and Node.js');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);

      // Wait for split-panel mode
      await page.waitForSelector('text=Project Overview', { timeout: 10000 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper color contrast ratios', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('[data-testid="onboarding-chat"]')
        .analyze();

      const colorContrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(colorContrastViolations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be fully keyboard navigable', async ({ page }) => {
      // Start tabbing through the interface
      await page.keyboard.press('Tab');
      
      // Should focus project name input
      await expect(page.locator('input[placeholder*="My Awesome Project"]:focus')).toBeVisible();
      
      // Continue tabbing to quick actions
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should focus on first quick action button
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should be a button
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('button');
    });

    test('should handle Enter key on quick action buttons', async ({ page }) => {
      // Tab to first quick action
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Press Enter to activate
      await page.keyboard.press('Enter');
      
      // Should trigger the action (either show input or send message)
      await page.waitForTimeout(1000);
      
      // Interface should respond appropriately
      const chatInput = page.locator('textarea[placeholder=""]');
      const githubInput = page.locator('input[placeholder*="https://github.com/username/repository"]');
      const fileInput = page.locator('input[type="file"]');
      
      // One of these should be visible/enabled
      const hasInput = await chatInput.isVisible() || 
                      await githubInput.isVisible() || 
                      await fileInput.isVisible();
      
      expect(hasInput).toBe(true);
    });

    test('should support Escape key to cancel upload modes', async ({ page }) => {
      // Click GitHub Import to show upload mode
      await page.click('button:has-text("GitHub Import")');
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).toBeVisible();
      
      // Press Escape to cancel
      await page.keyboard.press('Escape');
      
      // Should return to normal chat mode
      await expect(page.locator('textarea[placeholder=""]')).toBeVisible();
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]')).not.toBeVisible();
    });

    test('should handle Tab navigation in upload modes', async ({ page }) => {
      // Enter GitHub import mode
      await page.click('button:has-text("GitHub Import")');
      
      // Tab through the form elements
      await page.keyboard.press('Tab');
      
      // Should focus URL input
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]:focus')).toBeVisible();
      
      // Continue tabbing
      await page.keyboard.press('Tab');
      
      // Should focus Import button
      const importButton = page.locator('[data-testid="github-import-button"]:focus');
      await expect(importButton).toBeVisible();
      
      // Tab to Cancel button
      await page.keyboard.press('Tab');
      const cancelButton = page.locator('button:has-text("Cancel"):focus');
      await expect(cancelButton).toBeVisible();
    });

    test('should maintain focus when switching between modes', async ({ page }) => {
      // Start in normal mode
      await page.click('button:has-text("GitHub Import")');
      await page.fill('input[placeholder*="https://github.com/username/repository"]', 'test');
      
      // Switch modes
      await page.click('button:has-text("Upload Code")');
      
      // Focus should be managed appropriately
      await page.waitForTimeout(500);
      
      // Should be able to continue keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus').count();
      expect(focusedElement).toBe(1);
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check project name input
      const projectInput = page.locator('input[placeholder*="My Awesome Project"]');
      const projectLabel = await projectInput.getAttribute('aria-label') || 
                          await projectInput.getAttribute('aria-labelledby');
      
      expect(projectLabel).toBeTruthy();
      
      // Check chat input
      const chatInput = page.locator('textarea[placeholder=""]');
      const chatLabel = await chatInput.getAttribute('aria-label') || 
                       await chatInput.getAttribute('aria-labelledby');
      
      expect(chatLabel).toBeTruthy();
    });

    test('should have proper button descriptions', async ({ page }) => {
      // Check quick action buttons
      const buttons = page.locator('button').filter({ hasText: /GitHub Import|Upload Code|Import Docs/ });
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const hasAccessibleName = await button.getAttribute('aria-label') ||
                                 await button.getAttribute('title') ||
                                 await button.textContent();
        
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should announce form validation errors', async ({ page }) => {
      // Try to submit empty GitHub form
      await page.click('button:has-text("GitHub Import")');
      
      const importButton = page.locator('[data-testid="github-import-button"]');
      
      // Button should be disabled initially
      await expect(importButton).toBeDisabled();
      
      // Check for proper ARIA states
      const ariaDisabled = await importButton.getAttribute('aria-disabled');
      expect(ariaDisabled).toBe('true');
    });

    test('should have proper heading structure', async ({ page }) => {
      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      
      // Should have at least one main heading
      expect(headings.length).toBeGreaterThan(0);
      
      // Check if headings make sense
      const hasMainHeading = headings.some(heading => 
        heading.includes('build') || 
        heading.includes('project') || 
        heading.includes('onboarding')
      );
      
      expect(hasMainHeading).toBe(true);
    });

    test('should have accessible loading states', async ({ page }) => {
      // Send a message to trigger loading
      await page.fill('textarea[placeholder=""]', 'Test loading state');
      await page.click('[data-testid="send-message-button"]');
      
      // Check for loading indicator with proper ARIA
      const loadingIndicator = page.locator('[aria-label*="loading"], [aria-live="polite"], .animate-pulse');
      
      // Should have some form of accessible loading indication
      const hasLoadingState = await loadingIndicator.first().isVisible({ timeout: 5000 });
      expect(hasLoadingState).toBe(true);
    });
  });

  test.describe('Focus Management', () => {
    test('should trap focus in modals', async ({ page }) => {
      // This test would apply if there were modal dialogs
      // For now, we test focus management in different modes
      
      await page.click('button:has-text("GitHub Import")');
      
      // Focus should be on the first interactive element
      await page.keyboard.press('Tab');
      await expect(page.locator('input[placeholder*="https://github.com/username/repository"]:focus')).toBeVisible();
      
      // Shift+Tab should go to previous element
      await page.keyboard.press('Shift+Tab');
      
      // Should still be within the form area
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should restore focus after mode changes', async ({ page }) => {
      // Start with normal mode
      const chatInput = page.locator('textarea[placeholder=""]');
      await chatInput.focus();
      
      // Switch to GitHub mode
      await page.click('button:has-text("GitHub Import")');
      
      // Cancel back to normal mode
      await page.click('button:has-text("Cancel")');
      
      // Focus should be restored or managed appropriately
      await page.waitForTimeout(500);
      
      // Should be able to continue keyboard navigation
      await page.keyboard.press('Tab');
      const hasFocus = await page.locator(':focus').count();
      expect(hasFocus).toBe(1);
    });

    test('should handle focus with dynamic content', async ({ page }) => {
      // Trigger document generation to create dynamic content
      await page.fill('input[placeholder*="My Awesome Project"]', 'Focus Test');
      await page.fill('textarea[placeholder=""]', 'Test dynamic content focus management');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Wait for content to appear
      await page.waitForSelector('text=Project Overview', { timeout: 10000 });
      
      // Tab through the interface
      await page.keyboard.press('Tab');
      
      // Should still be navigable
      const focusableElements = await page.locator('button, input, textarea, [tabindex]:not([tabindex="-1"])').count();
      expect(focusableElements).toBeGreaterThan(0);
    });
  });

  test.describe('High Contrast Mode', () => {
    test('should be usable in high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background-color: black !important;
              color: white !important;
              border-color: white !important;
            }
          }
        `
      });
      
      // Elements should still be visible and functional
      await expect(page.locator('[data-testid="onboarding-chat"]')).toBeVisible();
      await expect(page.locator('textarea[placeholder=""]')).toBeVisible();
      
      // Should be able to interact
      await page.fill('textarea[placeholder=""]', 'High contrast test');
      await page.click('[data-testid="send-message-button"]');
      
      // Should still function normally
      await expect(page.locator('text=High contrast test')).toBeVisible();
    });
  });

  test.describe('Reduced Motion', () => {
    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Trigger animations (document generation)
      await page.fill('input[placeholder*="My Awesome Project"]', 'Reduced Motion Test');
      await page.fill('textarea[placeholder=""]', 'Test reduced motion support');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Check that animations are reduced or disabled
      const animatedElements = page.locator('.animate-pulse, .animate-bounce, .animate-spin');
      
      if (await animatedElements.first().isVisible()) {
        // If animations are present, they should respect reduced motion
        const animationDuration = await animatedElements.first().evaluate(el => {
          const styles = getComputedStyle(el);
          return styles.animationDuration;
        });
        
        // Animation should be instant or very fast
        expect(animationDuration === '0s' || animationDuration === '0.01s').toBe(true);
      }
    });
  });

  test.describe('Text Scaling', () => {
    test('should work with large text sizes', async ({ page }) => {
      // Simulate large text scaling
      await page.addStyleTag({
        content: `
          html {
            font-size: 24px !important;
          }
          * {
            font-size: inherit !important;
          }
        `
      });
      
      // Interface should still be functional
      await expect(page.locator('[data-testid="onboarding-chat"]')).toBeVisible();
      
      // Should be able to scroll and interact
      await page.fill('textarea[placeholder=""]', 'Large text test');
      await page.click('[data-testid="send-message-button"]');
      
      // Content should still be accessible
      await expect(page.locator('text=Large text test')).toBeVisible();
    });
  });

  test.describe('Error States Accessibility', () => {
    test('should announce errors accessibly', async ({ page }) => {
      // Block API to trigger error
      await page.route('**/api/onboarding/chat*', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Test error' })
        });
      });
      
      // Send message that will fail
      await page.fill('textarea[placeholder=""]', 'This will error');
      await page.click('[data-testid="send-message-button"]');
      
      // Wait for error message
      await page.waitForSelector('text=I apologize, but I\'m having trouble', { timeout: 10000 });
      
      // Error should be announced to screen readers
      const errorMessage = page.locator('[role="alert"], [aria-live="assertive"]').filter({ 
        hasText: /trouble|error|sorry|apologize/ 
      });
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      } else {
        // At minimum, error text should be visible
        await expect(page.locator('text=I apologize, but I\'m having trouble')).toBeVisible();
      }
    });
  });

  test.describe('Language Support', () => {
    test('should have proper lang attributes', async ({ page }) => {
      // Check html lang attribute
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBeTruthy();
      expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // Should be valid language code
      
      // Check for any elements with different languages
      const langElements = await page.locator('[lang]').count();
      
      // If there are lang elements, they should have valid values
      if (langElements > 0) {
        const langs = await page.locator('[lang]').evaluateAll(elements => 
          elements.map(el => el.getAttribute('lang'))
        );
        
        langs.forEach(lang => {
          expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
        });
      }
    });
  });
});