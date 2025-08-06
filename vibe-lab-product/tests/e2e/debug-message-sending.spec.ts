import { test, expect } from '@playwright/test';

test('debug message sending step by step', async ({ page }) => {
  await page.goto('/onboarding');
  await page.waitForLoadState('networkidle');
  
  console.log('1. Page loaded');
  
  // Check initial state
  const chatInput = page.locator('textarea');
  const sendButton = page.locator('[data-testid="send-message-button"]');
  
  console.log('2. Found input and button');
  
  // Check if send button is initially disabled
  const isDisabled = await sendButton.isDisabled();
  console.log('3. Send button disabled initially:', isDisabled);
  
  // Type message
  await chatInput.fill('test message');
  console.log('4. Typed message');
  
  // Check if button becomes enabled
  await page.waitForTimeout(1000);
  const isDisabledAfterTyping = await sendButton.isDisabled();
  console.log('5. Send button disabled after typing:', isDisabledAfterTyping);
  
  // Get button attributes
  const buttonClass = await sendButton.getAttribute('class');
  console.log('6. Button class:', buttonClass);
  
  // Try to click anyway
  console.log('7. Attempting to click send button...');
  await sendButton.click();
  
  // Wait a bit and see what happened
  await page.waitForTimeout(3000);
  
  // Check for any new messages
  const allElements = await page.locator('body *').allTextContents();
  const hasTestMessage = allElements.some(text => text.includes('test message'));
  console.log('8. User message appeared:', hasTestMessage);
  
  // Check for typing indicator
  const hasTyping = allElements.some(text => text.includes('...'));
  console.log('9. Typing indicator present:', hasTyping);
  
  // Check network requests
  const responses = [];
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      responses.push(response.url(), response.status());
    }
  });
  
  console.log('10. API responses:', responses);
  
  // Screenshot for debugging
  await page.screenshot({ path: 'debug-message-sending.png' });
});