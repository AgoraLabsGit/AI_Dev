import { test, expect } from '@playwright/test';

test.describe('Onboarding Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/onboarding');
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
  });

  test.describe('Page Load Performance', () => {
    test('should load onboarding page within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/onboarding');
      await page.waitForSelector('[data-testid="onboarding-chat"]');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Verify Core Web Vitals
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const metrics = {
              LCP: 0,
              FID: 0,
              CLS: 0
            };
            
            entries.forEach((entry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                metrics.LCP = entry.startTime;
              }
              if (entry.entryType === 'first-input') {
                metrics.FID = entry.processingStart - entry.startTime;
              }
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                metrics.CLS += entry.value;
              }
            });
            
            resolve(metrics);
          }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
          
          // Fallback after 5 seconds
          setTimeout(() => resolve({ LCP: 0, FID: 0, CLS: 0 }), 5000);
        });
      });
      
      console.log('Performance Metrics:', performanceMetrics);
    });

    test('should have acceptable bundle size', async ({ page }) => {
      const resourceSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources
          .filter((resource: any) => resource.name.includes('.js') || resource.name.includes('.css'))
          .map((resource: any) => ({
            name: resource.name.split('/').pop(),
            size: resource.transferSize || resource.encodedBodySize || 0
          }));
      });
      
      const totalSize = resourceSizes.reduce((sum, resource) => sum + resource.size, 0);
      
      // Total JS + CSS should be under 2MB
      expect(totalSize).toBeLessThan(2 * 1024 * 1024);
      
      console.log('Resource sizes:', resourceSizes);
      console.log('Total bundle size:', Math.round(totalSize / 1024), 'KB');
    });
  });

  test.describe('API Response Times', () => {
    test('should respond to chat messages within acceptable time', async ({ page }) => {
      let apiResponseTime = 0;
      
      page.on('response', response => {
        if (response.url().includes('/api/onboarding/chat')) {
          // Calculate response time (this is approximate)
          apiResponseTime = Date.now();
        }
      });
      
      const startTime = Date.now();
      
      // Send a simple message
      await page.fill('textarea[placeholder=""]', 'Hello, build me a simple app');
      await page.click('[data-testid="send-message-button"]');
      
      // Wait for AI response
      await page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 15000 });
      
      const endTime = Date.now();
      const totalResponseTime = endTime - startTime;
      
      // Total response time should be under 10 seconds
      expect(totalResponseTime).toBeLessThan(10000);
      
      console.log('API Response Time:', totalResponseTime, 'ms');
    });

    test('should handle multiple rapid messages efficiently', async ({ page }) => {
      const messages = [
        'Message 1: Quick test',
        'Message 2: Another test',
        'Message 3: Performance test'
      ];
      
      const startTime = Date.now();
      
      // Send messages rapidly
      for (let i = 0; i < messages.length; i++) {
        await page.fill('textarea[placeholder=""]', messages[i]);
        await page.click('[data-testid="send-message-button"]');
        
        // Small delay to allow processing
        await page.waitForTimeout(500);
      }
      
      // Wait for all responses
      await page.waitForTimeout(15000);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should handle all messages within reasonable time
      expect(totalTime).toBeLessThan(20000);
      
      // Verify all messages appear
      for (const message of messages) {
        await expect(page.locator(`text=${message}`)).toBeVisible();
      }
      
      console.log('Multiple messages processed in:', totalTime, 'ms');
    });
  });

  test.describe('Document Generation Performance', () => {
    test('should generate document sections efficiently', async ({ page }) => {
      // Fill project info to trigger document generation
      await page.fill('input[placeholder*="My Awesome Project"]', 'Performance Test App');
      await page.fill('textarea[placeholder=""]', 'Build a comprehensive e-commerce platform with React, Node.js, MongoDB, user authentication, product management, shopping cart, payment processing, and admin dashboard');
      
      const startTime = Date.now();
      await page.keyboard.press('Enter');
      
      // Wait for document generation to start
      await page.waitForSelector('text=Project Overview', { timeout: 10000 });
      
      // Wait for first section to complete
      await page.waitForSelector('text=✓ Section complete', { timeout: 30000 });
      
      const firstSectionTime = Date.now() - startTime;
      
      // First section should generate within 20 seconds
      expect(firstSectionTime).toBeLessThan(20000);
      
      console.log('First section generated in:', firstSectionTime, 'ms');
    });

    test('should handle typewriter effect without performance issues', async ({ page }) => {
      // Trigger document generation
      await page.fill('input[placeholder*="My Awesome Project"]', 'Typewriter Performance');
      await page.fill('textarea[placeholder=""]', 'Create a social networking platform');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      // Monitor typewriter animation performance
      const animationFrames = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let startTime = Date.now();
          
          function countFrames() {
            frameCount++;
            if (Date.now() - startTime < 5000) { // Monitor for 5 seconds
              requestAnimationFrame(countFrames);
            } else {
              resolve(frameCount);
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });
      
      // Should maintain reasonable frame rate (>30 FPS)
      const fps = (animationFrames as number) / 5;
      expect(fps).toBeGreaterThan(30);
      
      console.log('Animation FPS:', Math.round(fps));
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have significant memory leaks', async ({ page }) => {
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Perform multiple operations
      for (let i = 0; i < 5; i++) {
        await page.fill('textarea[placeholder=""]', `Memory test message ${i}`);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // Clear input and wait
        await page.fill('textarea[placeholder=""]', '');
        await page.waitForTimeout(1000);
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      });
      
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercentage = (memoryIncrease / initialMemory) * 100;
        
        // Memory increase should be reasonable (<50%)
        expect(memoryIncreasePercentage).toBeLessThan(50);
        
        console.log('Memory usage increase:', Math.round(memoryIncreasePercentage), '%');
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/onboarding');
      await page.waitForSelector('[data-testid="onboarding-chat"]');
      
      const loadTime = Date.now() - startTime;
      
      // Mobile load should be within 4 seconds (slower than desktop)
      expect(loadTime).toBeLessThan(4000);
      
      // Test mobile interactions
      await page.fill('textarea[placeholder=""]', 'Mobile performance test');
      
      const interactionStart = Date.now();
      await page.tap('[data-testid="send-message-button"]');
      
      // Wait for response
      await page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 15000 });
      
      const interactionTime = Date.now() - interactionStart;
      
      // Mobile interactions should be responsive
      expect(interactionTime).toBeLessThan(12000);
      
      console.log('Mobile load time:', loadTime, 'ms');
      console.log('Mobile interaction time:', interactionTime, 'ms');
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle long conversations efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      // Send 10 messages to build up conversation history
      for (let i = 1; i <= 10; i++) {
        await page.fill('textarea[placeholder=""]', `Long conversation message ${i}: This is a detailed message to test how the system handles growing conversation history and memory usage over time.`);
        await page.click('[data-testid="send-message-button"]');
        
        // Wait briefly between messages
        await page.waitForTimeout(1000);
      }
      
      // Wait for all responses
      await page.waitForTimeout(20000);
      
      const totalTime = Date.now() - startTime;
      
      // Should handle long conversation within reasonable time
      expect(totalTime).toBeLessThan(60000); // 1 minute max
      
      // Verify all messages are still visible
      for (let i = 1; i <= 10; i++) {
        await expect(page.locator(`text=Long conversation message ${i}`)).toBeVisible();
      }
      
      console.log('Long conversation processed in:', totalTime, 'ms');
    });

    test('should handle large project descriptions', async ({ page }) => {
      const largeDescription = `
        Build a comprehensive enterprise-grade e-commerce platform with the following features:
        - Multi-vendor marketplace with vendor management and commission tracking
        - Advanced product catalog with categories, variations, and inventory management  
        - User account system with roles, permissions, and social login integration
        - Shopping cart and wishlist functionality with persistent storage
        - Multiple payment gateways including Stripe, PayPal, and cryptocurrency
        - Order management system with status tracking and notifications
        - Advanced search and filtering with Elasticsearch integration
        - Real-time chat system for customer support and vendor communication
        - Review and rating system with moderation capabilities
        - Analytics dashboard with sales reports and business intelligence
        - Mobile-responsive design with Progressive Web App capabilities
        - Multi-language and multi-currency support for global markets
        - SEO optimization with meta tags, sitemaps, and structured data
        - Email marketing integration with automated campaigns
        - Social media integration for sharing and authentication
        - Advanced security features including fraud detection and GDPR compliance
        - Performance optimization with CDN, caching, and image optimization
        - Scalable architecture supporting millions of users and products
        - Admin panel with comprehensive management tools and reporting
        - API-first design with REST and GraphQL endpoints for mobile apps
      `.trim();
      
      const startTime = Date.now();
      
      await page.fill('input[placeholder*="My Awesome Project"]', 'Enterprise E-commerce Platform');
      await page.fill('textarea[placeholder=""]', largeDescription);
      await page.keyboard.press('Enter');
      
      // Wait for response
      await page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 20000 });
      
      const responseTime = Date.now() - startTime;
      
      // Should handle large input within reasonable time
      expect(responseTime).toBeLessThan(15000);
      
      console.log('Large description processed in:', responseTime, 'ms');
    });
  });

  test.describe('Resource Monitoring', () => {
    test('should monitor network requests efficiently', async ({ page }) => {
      const networkRequests = [];
      
      page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      });
      
      // Perform normal operations
      await page.fill('textarea[placeholder=""]', 'Monitor network requests');
      await page.click('[data-testid="send-message-button"]');
      await page.waitForTimeout(5000);
      
      // Check for excessive requests
      const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
      
      // Should not make too many API calls for single interaction
      expect(apiRequests.length).toBeLessThan(10);
      
      console.log('API requests made:', apiRequests.length);
      console.log('Total requests:', networkRequests.length);
    });

    test('should handle concurrent users efficiently', async ({ browser }) => {
      // Simulate multiple users
      const contexts = await Promise.all([
        browser.newContext(),
        browser.newContext(),
        browser.newContext()
      ]);
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );
      
      const startTime = Date.now();
      
      // All users navigate to onboarding
      await Promise.all(
        pages.map(page => page.goto('http://localhost:3000/onboarding'))
      );
      
      // All users wait for load
      await Promise.all(
        pages.map(page => page.waitForSelector('[data-testid="onboarding-chat"]'))
      );
      
      // All users send messages simultaneously
      await Promise.all(
        pages.map((page, index) => 
          page.fill('textarea[placeholder=""]', `Concurrent user ${index + 1} message`)
        )
      );
      
      await Promise.all(
        pages.map(page => page.click('[data-testid="send-message-button"]'))
      );
      
      // Wait for all responses
      await Promise.all(
        pages.map(page => page.waitForSelector('.bg-\\[\\#1A1A1C\\]', { timeout: 20000 }))
      );
      
      const totalTime = Date.now() - startTime;
      
      // Should handle concurrent users efficiently
      expect(totalTime).toBeLessThan(25000);
      
      // Cleanup
      await Promise.all(contexts.map(context => context.close()));
      
      console.log('Concurrent users handled in:', totalTime, 'ms');
    });
  });
});