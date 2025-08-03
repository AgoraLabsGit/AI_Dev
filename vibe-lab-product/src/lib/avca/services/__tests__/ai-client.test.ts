import { AIClientService, AIRole, EntryPathType } from '../ai-client';
import { EventBus } from '../event-bus';
import { tokenTracker } from '../../token-tracking';

// Mock dependencies
jest.mock('@anthropic-ai/sdk');
jest.mock('../../token-tracking');

describe('AIClientService', () => {
  let aiClient: AIClientService;
  let eventBus: EventBus;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create event bus
    eventBus = new EventBus();

    // Create AI client
    aiClient = new AIClientService(eventBus);
  });

  afterEach(async () => {
    await aiClient.stop();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid API key', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      await expect(aiClient.start()).resolves.not.toThrow();
    });

    it('should fail initialization without API key', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      await expect(aiClient.start()).rejects.toThrow('ANTHROPIC_API_KEY environment variable is required');
    });
  });

  describe('process', () => {
    beforeEach(async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      await aiClient.start();
    });

    it('should process AI request successfully', async () => {
      const request = {
        role: AIRole.DEVELOPER,
        prompt: 'Test prompt',
        context: 'Test context'
      };

      const response = await aiClient.process(request);

      expect(response).toMatchObject({
        role: AIRole.DEVELOPER,
        content: expect.any(String),
        model: expect.any(String),
        usage: {
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
          totalTokens: expect.any(Number)
        },
        cost: expect.any(Number),
        duration: expect.any(Number)
      });

      // Verify token tracking
      expect(tokenTracker.track).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        {
          model: expect.any(String),
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
          totalTokens: expect.any(Number),
          cost: expect.any(Number)
        },
        expect.any(Number)
      );
    });

    it('should handle rate limits', async () => {
      // Simulate rate limit by making multiple requests
      const requests = Array(10).fill({
        role: AIRole.DEVELOPER,
        prompt: 'Test prompt'
      });

      const responses = await Promise.all(
        requests.map(req => aiClient.process(req))
      );

      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response).toMatchObject({
          role: AIRole.DEVELOPER,
          content: expect.any(String)
        });
      });
    });

    it('should handle errors gracefully', async () => {
      const request = {
        role: AIRole.DEVELOPER,
        prompt: '' // Invalid empty prompt
      };

      await expect(aiClient.process(request)).rejects.toThrow();
    });
  });

  describe('analyzeInput', () => {
    beforeEach(async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      await aiClient.start();
    });

    it('should analyze GitHub source successfully', async () => {
      const request = {
        entryPath: EntryPathType.GITHUB,
        source: {
          type: EntryPathType.GITHUB,
          content: {
            owner: 'test',
            repo: 'test-repo',
            branch: 'main'
          }
        }
      };

      const result = await aiClient.analyzeInput(request);

      expect(result).toMatchObject({
        entryPath: EntryPathType.GITHUB,
        results: expect.any(Object),
        confidence: expect.any(Number),
        suggestions: expect.arrayContaining([expect.any(String)]),
        metadata: {
          processingTime: expect.any(Number),
          tokenUsage: expect.any(Number),
          analysisTypes: expect.arrayContaining([expect.any(String)])
        }
      });
    });

    it('should analyze code source successfully', async () => {
      const request = {
        entryPath: EntryPathType.CODE,
        source: {
          type: EntryPathType.CODE,
          content: {
            files: [{
              path: 'src/components/Button.tsx',
              content: 'export function Button() { return <button>Click me</button>; }'
            }]
          }
        }
      };

      const result = await aiClient.analyzeInput(request);

      expect(result).toMatchObject({
        entryPath: EntryPathType.CODE,
        results: expect.any(Object),
        confidence: expect.any(Number),
        suggestions: expect.arrayContaining([expect.any(String)])
      });
    });

    it('should analyze documentation source successfully', async () => {
      const request = {
        entryPath: EntryPathType.DOCS,
        source: {
          type: EntryPathType.DOCS,
          content: {
            files: [{
              path: 'docs/architecture.md',
              content: '# Architecture Overview\n\nThis document describes...'
            }]
          }
        }
      };

      const result = await aiClient.analyzeInput(request);

      expect(result).toMatchObject({
        entryPath: EntryPathType.DOCS,
        results: expect.any(Object),
        confidence: expect.any(Number),
        suggestions: expect.arrayContaining([expect.any(String)])
      });
    });

    it('should handle invalid entry path', async () => {
      const request = {
        entryPath: 'invalid' as EntryPathType,
        source: {
          type: EntryPathType.DOCS,
          content: {}
        }
      };

      await expect(aiClient.analyzeInput(request)).rejects.toThrow('Invalid entry path');
    });
  });

  describe('generateBlueprint', () => {
    beforeEach(async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      await aiClient.start();
    });

    it('should generate blueprint successfully', async () => {
      const request = {
        analysis: {
          entryPath: EntryPathType.FRESH,
          results: {
            project_type: 'web_app',
            features: ['authentication', 'dashboard'],
            complexity: 'moderate'
          },
          confidence: 0.8,
          suggestions: ['Consider breaking down into smaller components'],
          metadata: {
            processingTime: 1000,
            tokenUsage: 1000,
            analysisTypes: ['project_type', 'features', 'complexity']
          }
        },
        requirements: {
          functional: ['User can log in', 'User can view dashboard'],
          technical: ['Must use Tailwind CSS'],
          design: ['Follow atomic design principles']
        },
        templates: [{
          name: 'default',
          version: '1.0.0'
        }]
      };

      const result = await aiClient.generateBlueprint(request);

      expect(result).toMatchObject({
        blueprint: expect.any(Object),
        tokenUsage: {
          prompt: expect.any(Number),
          completion: expect.any(Number),
          total: expect.any(Number)
        },
        cost: expect.any(Number),
        metadata: {
          processingTime: expect.any(Number),
          confidence: expect.any(Number),
          suggestions: expect.arrayContaining([expect.any(String)])
        }
      });
    });

    it('should handle invalid analysis', async () => {
      const request = {
        analysis: {
          entryPath: EntryPathType.FRESH,
          results: {},
          confidence: 0,
          suggestions: [],
          metadata: {
            processingTime: 0,
            tokenUsage: 0,
            analysisTypes: []
          }
        },
        requirements: {
          functional: [],
          technical: [],
          design: []
        },
        templates: []
      };

      const result = await aiClient.generateBlueprint(request);

      expect(result.metadata.confidence).toBeLessThan(0.5);
      expect(result.metadata.suggestions).toContain('Insufficient analysis data');
    });
  });

  describe('metrics and monitoring', () => {
    beforeEach(async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      await aiClient.start();
    });

    it('should track token usage correctly', async () => {
      const request = {
        role: AIRole.DEVELOPER,
        prompt: 'Test prompt'
      };

      await aiClient.process(request);

      expect(tokenTracker.track).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          model: expect.any(String),
          promptTokens: expect.any(Number),
          completionTokens: expect.any(Number),
          totalTokens: expect.any(Number),
          cost: expect.any(Number)
        }),
        expect.any(Number)
      );
    });

    it('should update metrics on success and failure', async () => {
      // Successful request
      await aiClient.process({
        role: AIRole.DEVELOPER,
        prompt: 'Test prompt'
      });

      // Failed request
      await expect(
        aiClient.process({
          role: AIRole.DEVELOPER,
          prompt: '' // Invalid empty prompt
        })
      ).rejects.toThrow();

      expect(aiClient.getTotalTokensProcessed()).toBeGreaterThan(0);
    });

    it('should handle concurrent requests within limits', async () => {
      const requests = Array(5).fill({
        role: AIRole.DEVELOPER,
        prompt: 'Test prompt'
      });

      const responses = await Promise.all(
        requests.map(req => aiClient.process(req))
      );

      expect(responses).toHaveLength(5);
      expect(aiClient.getActiveRequests()).toBe(0);
      expect(aiClient.getQueueSize()).toBe(0);
    });
  });
});