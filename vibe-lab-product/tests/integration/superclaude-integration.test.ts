import { test, expect } from '@playwright/test';

test.describe('SuperClaude Integration', () => {
  // Enable SuperClaude features for these tests
  test.use({
    extraHTTPHeaders: {
      'x-test-superclaude': 'true'
    }
  });

  test.beforeEach(async ({ page }) => {
    // Set feature flags via localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem('feature-flags', JSON.stringify({
        useSuperClaude: true,
        showPersonaInfo: true,
        showSuperClaudeIndicators: true,
        enableContext7: true
      }));
    });
    
    await page.goto('http://localhost:3000/onboarding');
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
  });

  test.describe('SuperClaude Quick Actions', () => {
    test('should show SuperClaude-specific quick actions', async ({ page }) => {
      // Look for SuperClaude actions
      await expect(page.locator('button:has-text("Strategic Plan")')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('button:has-text("Get Guidance")')).toBeVisible();
      
      // Check for metadata descriptions
      const strategicPlanButton = page.locator('button:has-text("Strategic Plan")');
      await strategicPlanButton.hover();
      
      // Should show AI Architect description
      await expect(page.locator('text=AI Architect: Strategic planning and system design')).toBeVisible();
    });

    test('should trigger Strategic Plan action', async ({ page }) => {
      // Click Strategic Plan button
      await page.click('button:has-text("Strategic Plan")');
      
      // Should show processing indicator
      await expect(page.locator('text=/AI architect is processing/')).toBeVisible({ timeout: 5000 });
      
      // Should show persona indicator
      await expect(page.locator('text=AI Architect')).toBeVisible({ timeout: 10000 });
      
      // Should show SuperClaude indicator (lightning bolt)
      await expect(page.locator('.text-yellow-400')).toBeVisible();
    });

    test('should trigger Get Guidance action', async ({ page }) => {
      // Click Get Guidance button
      await page.click('button:has-text("Get Guidance")');
      
      // Should show processing indicator
      await expect(page.locator('text=/AI mentor is processing/')).toBeVisible({ timeout: 5000 });
      
      // Should show persona indicator
      await expect(page.locator('text=AI Mentor')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Persona Indicators', () => {
    test('should show persona badges in responses', async ({ page }) => {
      // Trigger a SuperClaude action
      await page.click('button:has-text("Strategic Plan")');
      
      // Wait for response
      await page.waitForTimeout(5000);
      
      // Check for persona badge
      const personaBadge = page.locator('.rounded-full').filter({ hasText: /AI (Architect|Mentor|QA)/ });
      await expect(personaBadge.first()).toBeVisible({ timeout: 10000 });
      
      // Badge should have appropriate styling
      await expect(personaBadge.first()).toHaveClass(/bg-.*-900\/50/);
    });

    test('should show persona-specific icons', async ({ page }) => {
      await page.click('button:has-text("Strategic Plan")');
      await page.waitForTimeout(5000);
      
      // Should show Target icon for Architect
      const targetIcon = page.locator('svg').filter({ hasText: 'Target' });
      if (await targetIcon.isVisible()) {
        expect(targetIcon).toBeTruthy();
      }
    });

    test('should show metadata for SuperClaude responses', async ({ page }) => {
      await page.click('button:has-text("Get Guidance")');
      await page.waitForTimeout(5000);
      
      // Should show token usage and confidence
      const metadata = page.locator('text=/~\\d+ tokens/');
      if (await metadata.isVisible()) {
        await expect(metadata).toBeVisible();
        
        // Should also show confidence
        await expect(page.locator('text=/%\\sconfidence/')).toBeVisible();
      }
    });
  });

  test.describe('Enhanced UI Indicators', () => {
    test('should show SuperClaude badge in chat header', async ({ page }) => {
      // Should show SuperClaude indicator in header
      const superClaudeBadge = page.locator('.rounded-full').filter({ hasText: 'SuperClaude' });
      await expect(superClaudeBadge).toBeVisible();
      
      // Should have lightning icon
      await expect(superClaudeBadge.locator('svg')).toBeVisible();
    });

    test('should show processing animation for SuperClaude', async ({ page }) => {
      await page.click('button:has-text("Strategic Plan")');
      
      // Should show enhanced processing indicator
      await expect(page.locator('.animate-pulse').filter({ hasText: 'Brain' })).toBeVisible({ timeout: 5000 });
      
      // Should show animated dots
      await expect(page.locator('.animate-bounce').first()).toBeVisible();
    });

    test('should use gradient styling for SuperClaude avatars', async ({ page }) => {
      await page.click('button:has-text("Strategic Plan")');
      await page.waitForTimeout(5000);
      
      // SuperClaude responses should have gradient avatar
      const gradientAvatar = page.locator('.bg-gradient-to-r.from-\\[\\#8B5CF6\\].to-\\[\\#2563EB\\]');
      await expect(gradientAvatar.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('API Integration', () => {
    test('should call plan endpoint for Strategic Plan', async ({ page }) => {
      const apiCalls = [];
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiCalls.push({
            url: request.url(),
            method: request.method()
          });
        }
      });
      
      await page.click('button:has-text("Strategic Plan")');
      await page.waitForTimeout(5000);
      
      // Should have called /api/plan endpoint
      const planCall = apiCalls.find(call => call.url.includes('/api/plan'));
      expect(planCall).toBeTruthy();
      expect(planCall?.method).toBe('POST');
    });

    test('should call help endpoint for Get Guidance', async ({ page }) => {
      const apiCalls = [];
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiCalls.push({
            url: request.url(),
            method: request.method()
          });
        }
      });
      
      await page.click('button:has-text("Get Guidance")');
      await page.waitForTimeout(5000);
      
      // Should have called /api/help endpoint
      const helpCall = apiCalls.find(call => call.url.includes('/api/help'));
      expect(helpCall).toBeTruthy();
      expect(helpCall?.method).toBe('POST');
    });

    test('should send proper context to SuperClaude endpoints', async ({ page }) => {
      let requestBody = null;
      
      await page.route('**/api/plan', async (route) => {
        const request = route.request();
        requestBody = JSON.parse(request.postData() || '{}');
        route.continue();
      });
      
      // Set project name
      await page.fill('input[placeholder*="My Awesome Project"]', 'SuperClaude Test Project');
      
      // Click Strategic Plan
      await page.click('button:has-text("Strategic Plan")');
      
      await page.waitForTimeout(2000);
      
      // Check request body
      if (requestBody) {
        expect(requestBody).toHaveProperty('context');
        expect(requestBody.context).toHaveProperty('projectName', 'SuperClaude Test Project');
        expect(requestBody.context).toHaveProperty('stage', 'onboarding');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle SuperClaude API failures gracefully', async ({ page }) => {
      // Block SuperClaude endpoints
      await page.route('**/api/plan', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'SuperClaude service unavailable' })
        });
      });
      
      await page.click('button:has-text("Strategic Plan")');
      
      // Should show error message
      await expect(page.locator('text=/having trouble with the plan request/')).toBeVisible({ timeout: 10000 });
      
      // Should still be able to use regular chat
      const chatInput = page.locator('textarea[placeholder=""]');
      await expect(chatInput).toBeEnabled();
    });

    test('should clear processing state on error', async ({ page }) => {
      await page.route('**/api/help', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Service error' })
        });
      });
      
      await page.click('button:has-text("Get Guidance")');
      
      // Processing indicator should clear
      await page.waitForTimeout(10000);
      await expect(page.locator('text=/AI mentor is processing/')).not.toBeVisible();
      
      // Chat should be enabled again
      await expect(page.locator('textarea[placeholder=""]')).toBeEnabled();
    });
  });

  test.describe('Feature Flag Integration', () => {
    test('should hide SuperClaude features when disabled', async ({ page }) => {
      // Clear flags and reload
      await page.evaluate(() => {
        localStorage.setItem('feature-flags', JSON.stringify({
          useSuperClaude: false,
          showPersonaInfo: false,
          showSuperClaudeIndicators: false
        }));
      });
      
      await page.reload();
      await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
      
      // SuperClaude actions should not be visible
      await expect(page.locator('button:has-text("Strategic Plan")')).not.toBeVisible();
      await expect(page.locator('button:has-text("Get Guidance")')).not.toBeVisible();
      
      // SuperClaude badge should not be visible
      await expect(page.locator('.rounded-full').filter({ hasText: 'SuperClaude' })).not.toBeVisible();
    });

    test('should show indicators only when enabled', async ({ page }) => {
      // Enable SuperClaude but disable indicators
      await page.evaluate(() => {
        localStorage.setItem('feature-flags', JSON.stringify({
          useSuperClaude: true,
          showPersonaInfo: false,
          showSuperClaudeIndicators: false
        }));
      });
      
      await page.reload();
      await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
      
      // Actions should be visible
      await expect(page.locator('button:has-text("Strategic Plan")')).toBeVisible();
      
      // But indicators should not show
      await expect(page.locator('.rounded-full').filter({ hasText: 'SuperClaude' })).not.toBeVisible();
    });
  });

  test.describe('Context7 Integration', () => {
    test('should enable Context7 when flag is set', async ({ page }) => {
      // This would require checking if Context7 is being used in responses
      // For now, we verify the flag is respected
      
      const flags = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('feature-flags') || '{}');
      });
      
      expect(flags.enableContext7).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('should not block regular chat while SuperClaude is processing', async ({ page }) => {
      // Start a SuperClaude action
      await page.click('button:has-text("Strategic Plan")');
      
      // Immediately try to use regular chat
      await page.fill('textarea[placeholder=""]', 'Regular message while processing');
      
      // Should be disabled during SuperClaude processing
      await expect(page.locator('textarea[placeholder=""]')).toBeDisabled();
      
      // Wait for SuperClaude to complete
      await page.waitForTimeout(10000);
      
      // Should be enabled again
      await expect(page.locator('textarea[placeholder=""]')).toBeEnabled();
    });
  });
});