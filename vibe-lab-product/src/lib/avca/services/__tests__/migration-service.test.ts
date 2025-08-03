import { MigrationService } from '../migration-service';
import { AIClientService } from '../ai-client';
import { EventBus } from '../event-bus';
import { tokenTracker } from '../../token-tracking';

// Mock dependencies
jest.mock('../ai-client');
jest.mock('../../token-tracking');

describe('MigrationService', () => {
  let migrationService: MigrationService;
  let eventBus: EventBus;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create event bus
    eventBus = new EventBus();

    // Create migration service
    migrationService = new MigrationService(eventBus);
  });

  afterEach(async () => {
    await migrationService.stop();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(migrationService.start()).resolves.not.toThrow();
    });

    it('should initialize AI client during startup', async () => {
      await migrationService.start();
      expect(AIClientService.prototype.start).toHaveBeenCalled();
    });
  });

  describe('process', () => {
    beforeEach(async () => {
      await migrationService.start();
    });

    it('should process GitHub repository migration request', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'github' as const,
          content: {
            owner: 'test',
            repo: 'test-repo',
            branch: 'main'
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response).toMatchObject({
        requestId: 'test-request',
        analysis: expect.objectContaining({
          sourceType: 'github',
          structure: expect.any(Object),
          patterns: expect.any(Object),
          complexity: expect.any(Object),
          risks: expect.any(Array)
        }),
        plan: expect.objectContaining({
          steps: expect.any(Array),
          timeline: expect.any(Object),
          recommendations: expect.any(Array)
        }),
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

    it('should process local code migration request', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {
            files: [{
              path: 'src/components/Button.tsx',
              content: 'export function Button() { return <button>Click me</button>; }'
            }]
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response).toMatchObject({
        requestId: 'test-request',
        analysis: expect.objectContaining({
          sourceType: 'code',
          structure: expect.any(Object),
          patterns: expect.any(Object)
        }),
        plan: expect.objectContaining({
          steps: expect.any(Array),
          timeline: expect.any(Object)
        })
      });
    });

    it('should process documentation migration request', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'docs' as const,
          content: {
            files: [{
              path: 'docs/architecture.md',
              content: '# Architecture Overview\n\nThis document describes...'
            }]
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response).toMatchObject({
        requestId: 'test-request',
        analysis: expect.objectContaining({
          sourceType: 'docs',
          structure: expect.any(Object),
          patterns: expect.any(Object)
        }),
        plan: expect.objectContaining({
          steps: expect.any(Array),
          timeline: expect.any(Object)
        })
      });
    });
  });

  describe('source analysis', () => {
    beforeEach(async () => {
      await migrationService.start();
    });

    it('should analyze GitHub repository structure', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'github' as const,
          content: {
            owner: 'test',
            repo: 'test-repo',
            branch: 'main'
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.analysis.structure).toMatchObject({
        files: expect.any(Array),
        components: expect.any(Array),
        dependencies: expect.any(Array)
      });
    });

    it('should detect styling patterns', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {
            files: [{
              path: 'src/styles/main.css',
              content: '.button { color: blue; }'
            }]
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.analysis.patterns.styling).toContain('custom-css');
      expect(response.plan.recommendations).toContain(
        expect.stringMatching(/convert.*Tailwind/i)
      );
    });

    it('should assess migration complexity', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {
            files: [
              {
                path: 'src/styles/main.css',
                content: '/* Large CSS file with many custom styles */'
              },
              {
                path: 'src/components/Button.tsx',
                content: 'styled-components usage...'
              }
            ]
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.analysis.complexity).toMatchObject({
        score: expect.any(Number),
        factors: expect.arrayContaining([
          expect.stringMatching(/custom.*CSS/i),
          expect.stringMatching(/styled-components/i)
        ])
      });
    });

    it('should identify migration risks', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {
            files: [
              {
                path: 'src/styles/main.css',
                content: '@import "design-system.css";'
              },
              {
                path: 'src/components/ThemeProvider.tsx',
                content: 'complex theming logic...'
              }
            ]
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.analysis.risks).toContainEqual(
        expect.objectContaining({
          type: expect.stringMatching(/design.*system/i),
          severity: expect.any(String),
          description: expect.any(String)
        })
      );
    });
  });

  describe('migration planning', () => {
    beforeEach(async () => {
      await migrationService.start();
    });

    it('should generate ordered migration steps', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {
            files: [
              {
                path: 'src/styles/main.css',
                content: '.button { color: blue; }'
              },
              {
                path: 'src/components/Button.tsx',
                content: 'import "./main.css";'
              }
            ]
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.plan.steps).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            priority: expect.any(String),
            dependencies: expect.any(Array),
            estimatedTime: expect.any(Number)
          })
        ])
      );

      // Verify step ordering
      const steps = response.plan.steps;
      const buttonStepIndex = steps.findIndex(s => s.name.toLowerCase().includes('button'));
      const cssStepIndex = steps.findIndex(s => s.name.toLowerCase().includes('css'));
      expect(cssStepIndex).toBeLessThan(buttonStepIndex);
    });

    it('should estimate migration timeline', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'github' as const,
          content: {
            owner: 'test',
            repo: 'test-repo',
            branch: 'main'
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.plan.timeline).toMatchObject({
        totalDuration: expect.any(Number),
        phases: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            duration: expect.any(Number),
            steps: expect.any(Array)
          })
        ])
      });
    });

    it('should provide migration recommendations', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {
            files: [
              {
                path: 'src/styles/main.css',
                content: '.button { color: blue; }'
              },
              {
                path: 'src/components/Button.tsx',
                content: 'styled-components usage...'
              }
            ]
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.plan.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Tailwind/i),
          expect.stringMatching(/styled-components/i)
        ])
      );
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await migrationService.start();
    });

    it('should handle AI service errors', async () => {
      // Mock AI client to throw error
      (AIClientService.prototype.process as jest.Mock).mockRejectedValueOnce(
        new Error('AI service error')
      );

      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {}
        }
      };

      await expect(migrationService.process(request)).rejects.toThrow('AI service error');
    });

    it('should handle invalid source type', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'invalid' as any,
          content: {}
        }
      };

      await expect(migrationService.process(request)).rejects.toThrow(
        expect.stringMatching(/invalid.*source/i)
      );
    });

    it('should handle empty source content', async () => {
      const request = {
        requestId: 'test-request',
        source: {
          type: 'code' as const,
          content: {
            files: []
          }
        }
      };

      const response = await migrationService.process(request);

      expect(response.analysis.complexity.score).toBe(0);
      expect(response.plan.recommendations).toContain(
        expect.stringMatching(/no.*content/i)
      );
    });
  });
});