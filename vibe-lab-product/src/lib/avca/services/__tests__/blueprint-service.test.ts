import { BlueprintService } from '../blueprint-service';
import { AIClientService } from '../ai-client';
import { EventBus } from '../event-bus';
import { tokenTracker } from '../../token-tracking';
import { ComponentType, Priority, Complexity } from '../../pipeline/component-pipeline/types';

// Mock dependencies
jest.mock('../ai-client');
jest.mock('../../token-tracking');

describe('BlueprintService', () => {
  let blueprintService: BlueprintService;
  let eventBus: EventBus;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create event bus
    eventBus = new EventBus();

    // Create blueprint service
    blueprintService = new BlueprintService();
  });

  afterEach(async () => {
    await blueprintService.stop();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(blueprintService.start()).resolves.not.toThrow();
    });

    it('should load templates during initialization', async () => {
      await blueprintService.start();
      expect(blueprintService['templates'].size).toBeGreaterThan(0);
    });
  });

  describe('process', () => {
    beforeEach(async () => {
      await blueprintService.start();
    });

    it('should process blueprint request successfully', async () => {
      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      const response = await blueprintService.process(request);

      expect(response).toMatchObject({
        requestId: 'test-request',
        blueprint: expect.any(Object),
        tokensUsed: expect.any(Number),
        cost: expect.any(Number),
        duration: expect.any(Number)
      });

      // Verify token tracking
      expect(tokenTracker.track).toHaveBeenCalledWith(
        'test-request',
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

    it('should validate blueprint before returning', async () => {
      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      const response = await blueprintService.process(request);

      expect(response.blueprint).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        requirements: expect.any(Object)
      });
    });

    it('should handle validation errors', async () => {
      // Mock AI client to return invalid blueprint
      (AIClientService.prototype.generateBlueprint as jest.Mock).mockResolvedValueOnce({
        blueprint: {
          // Missing required fields
        },
        tokenUsage: {
          prompt: 100,
          completion: 100,
          total: 200
        },
        cost: 0.01
      });

      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      await expect(blueprintService.process(request)).rejects.toThrow('Blueprint validation failed');
    });
  });

  describe('AVCA format conversion', () => {
    beforeEach(async () => {
      await blueprintService.start();
    });

    it('should convert blueprint to AVCA format', async () => {
      const rawBlueprint = {
        id: 'test-component',
        name: 'SearchBar',
        type: ComponentType.UI_COMPONENT,
        description: 'A search bar component',
        requirements: {
          functional: [{
            id: 'func_1',
            description: 'User can enter search query',
            priority: Priority.HIGH
          }],
          technical: [{
            id: 'tech_1',
            category: 'COMPATIBILITY',
            specification: 'Must use Tailwind CSS'
          }],
          design: [{
            id: 'design_1',
            pattern: 'atomic',
            styling: 'tailwind'
          }]
        },
        dependencies: {
          internal: [{
            id: 'dep_1',
            name: 'Button'
          }],
          external: [{
            name: 'react',
            version: '^18.0.0'
          }]
        },
        structure: {
          files: [{
            path: 'SearchBar.tsx',
            type: 'COMPONENT'
          }]
        }
      };

      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      // Mock AI client to return our test blueprint
      (AIClientService.prototype.generateBlueprint as jest.Mock).mockResolvedValueOnce({
        blueprint: rawBlueprint,
        tokenUsage: {
          prompt: 100,
          completion: 100,
          total: 200
        },
        cost: 0.01
      });

      const response = await blueprintService.process(request);

      // Verify AVCA format
      expect(response.blueprint).toMatchObject({
        id: 'test-component',
        name: 'SearchBar',
        type: ComponentType.UI_COMPONENT,
        category: expect.any(String),
        requirements: {
          functional: expect.arrayContaining([
            expect.objectContaining({
              id: 'func_1',
              description: 'User can enter search query',
              priority: Priority.HIGH
            })
          ]),
          technical: expect.arrayContaining([
            expect.objectContaining({
              id: 'tech_1',
              category: 'COMPATIBILITY',
              specification: 'Must use Tailwind CSS'
            })
          ]),
          design: expect.arrayContaining([
            expect.objectContaining({
              pattern: 'atomic',
              styling: 'tailwind'
            })
          ])
        },
        dependencies: {
          internal: expect.arrayContaining([
            expect.objectContaining({
              componentId: expect.any(String),
              type: 'COMPOSE'
            })
          ]),
          external: expect.arrayContaining([
            expect.objectContaining({
              package: 'react',
              version: expect.any(String)
            })
          ]),
          peer: []
        },
        structure: {
          files: expect.arrayContaining([
            expect.objectContaining({
              path: 'SearchBar.tsx',
              type: 'COMPONENT'
            })
          ]),
          exports: expect.arrayContaining([
            expect.objectContaining({
              name: 'SearchBar',
              type: 'DEFAULT'
            })
          ]),
          imports: expect.arrayContaining([
            expect.objectContaining({
              source: 'react',
              imports: ['React']
            })
          ])
        },
        validation: {
          rules: expect.any(Array),
          constraints: expect.any(Array)
        },
        metadata: {
          priority: expect.any(String),
          complexity: expect.any(String),
          estimatedTime: expect.any(Number),
          tags: expect.any(Array)
        }
      });
    });

    it('should handle missing optional fields in conversion', async () => {
      const minimalBlueprint = {
        id: 'test-component',
        name: 'SearchBar',
        type: ComponentType.UI_COMPONENT,
        description: 'A search bar component',
        requirements: {
          functional: [],
          technical: [],
          design: []
        }
      };

      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      // Mock AI client to return minimal blueprint
      (AIClientService.prototype.generateBlueprint as jest.Mock).mockResolvedValueOnce({
        blueprint: minimalBlueprint,
        tokenUsage: {
          prompt: 100,
          completion: 100,
          total: 200
        },
        cost: 0.01
      });

      const response = await blueprintService.process(request);

      // Verify default values are set
      expect(response.blueprint).toMatchObject({
        id: 'test-component',
        name: 'SearchBar',
        type: ComponentType.UI_COMPONENT,
        category: 'FEATURE',
        requirements: {
          functional: [],
          technical: [],
          design: expect.arrayContaining([
            expect.objectContaining({
              pattern: 'atomic',
              styling: 'tailwind'
            })
          ])
        },
        dependencies: {
          internal: [],
          external: expect.arrayContaining([
            expect.objectContaining({
              package: 'react'
            })
          ]),
          peer: []
        },
        metadata: {
          priority: Priority.MEDIUM,
          complexity: Complexity.MODERATE,
          estimatedTime: expect.any(Number),
          tags: expect.any(Array)
        }
      });
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await blueprintService.start();
    });

    it('should handle AI service errors', async () => {
      // Mock AI client to throw error
      (AIClientService.prototype.generateBlueprint as jest.Mock).mockRejectedValueOnce(
        new Error('AI service error')
      );

      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      await expect(blueprintService.process(request)).rejects.toThrow('AI service error');
    });

    it('should handle validation errors with details', async () => {
      // Mock AI client to return invalid blueprint
      (AIClientService.prototype.generateBlueprint as jest.Mock).mockResolvedValueOnce({
        blueprint: {
          // Missing name and type
          id: 'test-component'
        },
        tokenUsage: {
          prompt: 100,
          completion: 100,
          total: 200
        },
        cost: 0.01
      });

      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      await expect(blueprintService.process(request)).rejects.toThrow(
        expect.stringMatching(/Missing blueprint name.*Missing blueprint type/s)
      );
    });

    it('should handle Tailwind compliance validation', async () => {
      // Mock AI client to return blueprint with non-Tailwind styling
      (AIClientService.prototype.generateBlueprint as jest.Mock).mockResolvedValueOnce({
        blueprint: {
          id: 'test-component',
          name: 'SearchBar',
          type: ComponentType.UI_COMPONENT,
          requirements: {
            functional: [],
            technical: [],
            design: [{
              id: 'design_1',
              pattern: 'atomic',
              styling: 'custom-css' // Non-Tailwind styling
            }]
          }
        },
        tokenUsage: {
          prompt: 100,
          completion: 100,
          total: 200
        },
        cost: 0.01
      });

      const request = {
        requestId: 'test-request',
        userIntent: {
          originalMessage: 'Create a search bar component',
          classifiedIntent: 'COMPONENT_REQUEST'
        }
      };

      await expect(blueprintService.process(request)).rejects.toThrow(
        'Blueprint contains non-Tailwind styling approaches'
      );
    });
  });
});