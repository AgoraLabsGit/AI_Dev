import { describe, it, expect } from '@jest/globals';

describe('Basic Chat API', () => {
  const API_BASE = 'http://localhost:3000';

  it('should respond to basic chat requests', async () => {
    const response = await fetch(`${API_BASE}/api/onboarding/chat-basic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Build me an instagram clone',
        projectName: 'Test Project',
        conversationHistory: [],
        context: {
          stage: 'initial',
          extractedInfo: {}
        }
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data).toHaveProperty('response');
    expect(data.response).toBeTruthy();
    expect(data).toHaveProperty('quickActions');
    expect(Array.isArray(data.quickActions)).toBe(true);
    expect(data.quickActions.length).toBeGreaterThan(0);
  });

  it('should handle different project types', async () => {
    const testCases = [
      { message: 'Build me a web application', expectedType: 'web application' },
      { message: 'Create a mobile app', expectedType: 'mobile application' },
      { message: 'I want to build an API service', expectedType: 'API service' }
    ];

    for (const testCase of testCases) {
      const response = await fetch(`${API_BASE}/api/onboarding/chat-basic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testCase.message,
          conversationHistory: [],
          context: { stage: 'initial' }
        })
      });

      const data = await response.json();
      expect(data.extractedInfo?.projectType).toBe(testCase.expectedType);
    }
  });

  it('should return appropriate quick actions', async () => {
    const response = await fetch(`${API_BASE}/api/onboarding/chat-basic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I want to build something',
        conversationHistory: [],
        context: { stage: 'initial' }
      })
    });

    const data = await response.json();
    expect(data.quickActions).toContainEqual(
      expect.objectContaining({
        id: 'web-app',
        label: 'Web Application',
        type: 'suggest'
      })
    );
  });
});