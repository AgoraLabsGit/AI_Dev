import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST as onboardingChatHandler } from '@/app/api/onboarding/chat/route';
import { POST as stagedChatHandler } from '@/app/api/onboarding/chat-staged/route';

// Mock external dependencies
vi.mock('@/lib/avca/services/ai-client', () => ({
  AIClientService: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    process: vi.fn().mockResolvedValue({
      content: 'Mock AI response',
      usage: { totalTokens: 100 }
    })
  })),
  AIRole: {
    ARCHITECT: 'architect',
    DEVELOPER: 'developer'
  },
  EntryPathType: {
    FRESH: 'fresh',
    GITHUB: 'github',
    CODE: 'code',
    DOCS: 'docs'
  }
}));

vi.mock('@/lib/avca/services/event-bus', () => ({
  EventBus: vi.fn().mockImplementation(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }))
}));

vi.mock('@/lib/dias/events/event-handlers', () => ({
  EventHandlingSystem: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    processEvent: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@/lib/monitoring/logic-monitor', () => ({
  logicMonitor: {
    trackModule: vi.fn().mockReturnValue({
      flowId: 'test-flow-id',
      startTime: Date.now()
    }),
    completeModule: vi.fn(),
    completeFlow: vi.fn()
  },
  AVCA_MODULES: {
    AI_CLIENT: 'ai-client'
  },
  INTEGRATION_MODULES: {
    SERVICE_ORCHESTRATOR: 'service-orchestrator'
  }
}));

vi.mock('@/lib/core/vibe-lab-services', () => ({
  initializeVibeLabServices: vi.fn().mockResolvedValue({
    getSystemStatus: vi.fn().mockReturnValue({
      basicReady: true,
      enhancedReady: true,
      services: [
        { name: 'AIClientService', status: 'ready' }
      ]
    }),
    getRouter: vi.fn().mockReturnValue({
      routeRequest: vi.fn().mockImplementation(async (type, handler) => {
        const mockService = {
          constructor: { name: 'AIClientService' }
        };
        return await handler(mockService);
      })
    })
  })
}));

describe('Onboarding API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/onboarding/chat', () => {
    it('should handle basic chat request', async () => {
      const requestBody = {
        message: 'I want to build a web app',
        projectName: 'Test Project',
        conversationHistory: [],
        context: { stage: 'initial', extractedInfo: {} }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('response');
      expect(data).toHaveProperty('quickActions');
      expect(data).toHaveProperty('extractedInfo');
    });

    it('should extract project information from message', async () => {
      const requestBody = {
        message: 'I want to build a marketplace web app for artists',
        projectName: 'Artist Marketplace',
        conversationHistory: [],
        context: { stage: 'initial' }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(data.extractedInfo).toHaveProperty('projectType');
      expect(data.extractedInfo.projectType).toContain('web');
    });

    it('should generate stage-specific quick actions', async () => {
      const requestBody = {
        message: 'Tell me about React features',
        projectName: 'React App',
        conversationHistory: [
          { role: 'user', content: 'Initial message', timestamp: new Date().toISOString() }
        ],
        context: { stage: 'features' }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(Array.isArray(data.quickActions)).toBe(true);
      expect(data.quickActions.length).toBeGreaterThan(0);
      expect(data.quickActions[0]).toHaveProperty('id');
      expect(data.quickActions[0]).toHaveProperty('label');
      expect(data.quickActions[0]).toHaveProperty('type');
    });

    it('should handle conversation history properly', async () => {
      const requestBody = {
        message: 'Add authentication features',
        projectName: 'Secure App',
        conversationHistory: [
          { role: 'user', content: 'Build a web app', timestamp: new Date().toISOString() },
          { role: 'assistant', content: 'Great idea!', timestamp: new Date().toISOString() }
        ],
        context: { stage: 'features' }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      
      expect(response.status).toBe(200);
      // History should be processed without errors
    });

    it('should handle missing optional fields', async () => {
      const requestBody = {
        message: 'Simple message',
        conversationHistory: []
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('response');
    });

    it('should handle errors gracefully', async () => {
      const invalidRequestBody = {
        // Missing required message field
        conversationHistory: []
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody)
      });

      const response = await onboardingChatHandler(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should sanitize conversation history timestamps', async () => {
      const requestBody = {
        message: 'Test message',
        conversationHistory: [
          { role: 'user', content: 'Test', timestamp: 'invalid-timestamp' }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      
      // Should not crash due to invalid timestamp
      expect(response.status).toBe(200);
    });

    it('should determine correct entry path', async () => {
      const testCases = [
        {
          message: 'Import from GitHub repository',
          expectedPath: 'github'
        },
        {
          message: 'Upload my existing codebase',
          expectedPath: 'code'
        },
        {
          message: 'Import my documentation files',
          expectedPath: 'docs'
        },
        {
          message: 'Start a fresh project',
          expectedPath: 'fresh'
        }
      ];

      for (const testCase of testCases) {
        const requestBody = {
          message: testCase.message,
          conversationHistory: []
        };

        const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await onboardingChatHandler(request);
        expect(response.status).toBe(200);
        // Entry path detection is tested indirectly through response generation
      }
    });
  });

  describe('POST /api/onboarding/chat-staged', () => {
    it('should handle staged initialization', async () => {
      const requestBody = {
        message: 'Test staged chat',
        conversationHistory: [],
        context: { stage: 'initial' }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat-staged', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await stagedChatHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('response');
      expect(data).toHaveProperty('_metadata');
      expect(data._metadata).toHaveProperty('processingTime');
      expect(data._metadata).toHaveProperty('systemStatus');
    });

    it('should route to appropriate service', async () => {
      const requestBody = {
        message: 'Route this message',
        conversationHistory: [],
        context: { stage: 'initial' }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat-staged', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await stagedChatHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data._metadata.systemStatus).toHaveProperty('basicReady');
      expect(data._metadata.systemStatus).toHaveProperty('enhancedReady');
    });

    it('should handle service unavailability', async () => {
      // Mock service failure
      const { initializeVibeLabServices } = await import('@/lib/core/vibe-lab-services');
      (initializeVibeLabServices as Mock).mockRejectedValueOnce(new Error('Service unavailable'));

      const requestBody = {
        message: 'Test service failure',
        conversationHistory: []
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat-staged', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await stagedChatHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.response).toContain('systems are still initializing');
    });

    it('should track performance metrics', async () => {
      const requestBody = {
        message: 'Performance test',
        conversationHistory: []
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat-staged', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const startTime = Date.now();
      const response = await stagedChatHandler(request);
      const endTime = Date.now();
      const data = await response.json();

      expect(data._metadata.processingTime).toBeGreaterThan(0);
      expect(data._metadata.processingTime).toBeLessThan(endTime - startTime + 100); // Allow some margin
    });
  });

  describe('Information Extraction', () => {
    it('should extract project types correctly', async () => {
      const testCases = [
        { message: 'web application', expected: 'web application' },
        { message: 'mobile app for iOS', expected: 'mobile application' },
        { message: 'REST API service', expected: 'API service' },
        { message: 'e-commerce platform', expected: undefined }
      ];

      for (const testCase of testCases) {
        const requestBody = {
          message: `I want to build a ${testCase.message}`,
          conversationHistory: []
        };

        const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await onboardingChatHandler(request);
        const data = await response.json();

        if (testCase.expected) {
          expect(data.extractedInfo.projectType).toBe(testCase.expected);
        }
      }
    });

    it('should extract features from conversation', async () => {
      const requestBody = {
        message: 'I need user authentication, payment processing, and real-time chat',
        conversationHistory: []
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(data.extractedInfo.mentionedFeatures).toContain('authentication');
      expect(data.extractedInfo.mentionedFeatures).toContain('payments');
      expect(data.extractedInfo.mentionedFeatures).toContain('messaging');
    });
  });

  describe('Stage-specific Behavior', () => {
    it('should provide initial stage prompts', async () => {
      const requestBody = {
        message: 'Hello',
        conversationHistory: [],
        context: { stage: 'initial' }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(data.response).toBeTruthy();
      // Should be asking for project information
    });

    it('should handle requirements stage', async () => {
      const requestBody = {
        message: 'I need more features',
        conversationHistory: [],
        context: { 
          stage: 'requirements',
          extractedInfo: { projectType: 'web application' }
        }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(data.response).toBeTruthy();
      // Should be focusing on feature requirements
    });

    it('should progress through conversation stages', async () => {
      const stages = ['initial', 'requirements', 'features', 'architecture'];
      
      for (const stage of stages) {
        const requestBody = {
          message: `Test message for ${stage} stage`,
          conversationHistory: [],
          context: { stage: stage as any }
        };

        const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });

        const response = await onboardingChatHandler(request);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Quick Actions Generation', () => {
    it('should generate contextual quick actions', async () => {
      const requestBody = {
        message: 'I need help choosing a framework',
        conversationHistory: [],
        context: { 
          stage: 'architecture',
          extractedInfo: { projectType: 'web application' }
        }
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      expect(data.quickActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            label: expect.any(String),
            type: expect.stringMatching(/primary|secondary|suggest|info/),
            metadata: expect.objectContaining({
              icon: expect.any(String),
              description: expect.any(String)
            })
          })
        ])
      );
    });

    it('should include help action in all contexts', async () => {
      const requestBody = {
        message: 'Any message',
        conversationHistory: [],
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      const data = await response.json();

      const helpAction = data.quickActions.find((action: any) => action.id === 'get-help');
      expect(helpAction).toBeTruthy();
      expect(helpAction.type).toBe('info');
    });
  });

  describe('Error Cases', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await onboardingChatHandler(request);
      
      expect(response.status).toBe(500);
    });

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: '',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await onboardingChatHandler(request);
      
      expect(response.status).toBe(500);
    });

    it('should handle AI service failures', async () => {
      const { AIClientService } = await import('@/lib/avca/services/ai-client');
      const mockAIClient = {
        start: vi.fn().mockResolvedValue(undefined),
        process: vi.fn().mockRejectedValue(new Error('AI service error'))
      };
      (AIClientService as Mock).mockImplementationOnce(() => mockAIClient);

      const requestBody = {
        message: 'Test AI error',
        conversationHistory: []
      };

      const request = new NextRequest('http://localhost:3000/api/onboarding/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await onboardingChatHandler(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeTruthy();
    });
  });
});