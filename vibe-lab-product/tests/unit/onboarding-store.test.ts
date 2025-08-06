import { renderHook, act } from '@testing-library/react';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { DocumentSection } from '@/components/onboarding/LiveDocumentPreview';

describe('Onboarding Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.clearSession();
    });
  });

  describe('Session Management', () => {
    it('should initialize a new session', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.sessionId).toBeNull();
      
      act(() => {
        result.current.initializeSession();
      });
      
      expect(result.current.sessionId).toMatch(/^onboarding-\d+-[a-z0-9]+$/);
      expect(result.current.progress.startedAt).toBeInstanceOf(Date);
    });

    it('should clear session data', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.initializeSession();
        result.current.updateProjectOverview({ name: 'Test Project' });
      });
      
      expect(result.current.projectOverview.name).toBe('Test Project');
      
      act(() => {
        result.current.clearSession();
      });
      
      expect(result.current.sessionId).toBeNull();
      expect(result.current.projectOverview.name).toBeUndefined();
    });
  });

  describe('Project Overview Updates', () => {
    it('should update project overview data', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.updateProjectOverview({
          name: 'My App',
          description: 'A great app',
          targetAudience: 'Developers'
        });
      });
      
      expect(result.current.projectOverview).toMatchObject({
        name: 'My App',
        description: 'A great app',
        targetAudience: 'Developers'
      });
    });

    it('should merge updates with existing data', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.updateProjectOverview({ name: 'Initial' });
      });
      
      act(() => {
        result.current.updateProjectOverview({ description: 'Updated' });
      });
      
      expect(result.current.projectOverview).toMatchObject({
        name: 'Initial',
        description: 'Updated'
      });
    });
  });

  describe('Build Specifications Updates', () => {
    it('should update build specifications', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.updateBuildSpecs({
          framework: 'React',
          database: 'MongoDB',
          authentication: true
        });
      });
      
      expect(result.current.buildSpecs).toMatchObject({
        framework: 'React',
        database: 'MongoDB',
        authentication: true
      });
    });
  });

  describe('Document Section Management', () => {
    it('should have default overview sections', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.overviewSections).toHaveLength(5);
      expect(result.current.overviewSections[0]).toMatchObject({
        id: 'description',
        title: 'What is this application?',
        status: 'pending'
      });
    });

    it('should have default specs sections', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.specsSections).toHaveLength(6);
      expect(result.current.specsSections[0]).toMatchObject({
        id: 'architecture',
        title: 'Architecture',
        status: 'pending'
      });
    });

    it('should update document section content', () => {
      const { result } = renderHook(() => useOnboardingStore());
      const newContent = 'This is updated content';
      
      act(() => {
        result.current.updateDocumentSection('overview', 'description', newContent);
      });
      
      const section = result.current.overviewSections.find(s => s.id === 'description');
      expect(section?.content).toBe(newContent);
      expect(section?.wordCount).toBe(4);
      expect(section?.lastUpdated).toBeInstanceOf(Date);
    });

    it('should approve document section', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.approveDocumentSection('overview', 'description');
      });
      
      const section = result.current.overviewSections.find(s => s.id === 'description');
      expect(section?.status).toBe('complete');
    });

    it('should generate document section', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.isGeneratingDocument).toBe(false);
      
      const generatePromise = act(async () => {
        await result.current.generateDocumentSection('overview', 'description');
      });
      
      // Check generating state
      expect(result.current.isGeneratingDocument).toBe(true);
      expect(result.current.currentGeneratingDocument).toBe('overview');
      
      // Wait for generation to complete
      await generatePromise;
      
      // Check final state
      expect(result.current.isGeneratingDocument).toBe(false);
      const section = result.current.overviewSections.find(s => s.id === 'description');
      expect(section?.status).toBe('complete');
      expect(section?.content).toBeTruthy();
    });

    it('should handle section generation errors', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      // Mock error by testing with invalid section ID
      await act(async () => {
        await result.current.generateDocumentSection('overview', 'invalid-section');
      });
      
      expect(result.current.isGeneratingDocument).toBe(false);
      expect(result.current.lastError).toBeNull();
    });
  });

  describe('Step Navigation', () => {
    it('should set current step', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.progress.currentStep).toBe('entry');
      
      act(() => {
        result.current.setCurrentStep('entry');
      });
      
      expect(result.current.progress.currentStep).toBe('entry');
    });

    it('should mark steps as completed', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.progress.completedSteps).toHaveLength(0);
      
      act(() => {
        result.current.markStepCompleted('entry');
      });
      
      expect(result.current.progress.completedSteps).toContain('entry');
    });

    it('should not duplicate completed steps', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.markStepCompleted('entry');
        result.current.markStepCompleted('entry');
      });
      
      expect(result.current.progress.completedSteps).toHaveLength(1);
    });
  });

  describe('Validation', () => {
    it('should validate current step', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      // Entry step should always be valid
      expect(result.current.validateCurrentStep()).toBe(true);
    });

    it('should check if can proceed to next step', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.canProceedToNextStep()).toBe(true);
    });
  });

  describe('Document Generation', () => {
    it('should generate overview document', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.updateProjectOverview({
          description: 'Test project'
        });
      });
      
      await act(async () => {
        await result.current.generateOverview();
      });
      
      expect(result.current.generatedOverview).toBeTruthy();
      expect(result.current.generatedOverview).toContain('Test project');
    });

    it('should handle overview generation errors', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      // Try to generate without description
      await act(async () => {
        await result.current.generateOverview();
      });
      
      expect(result.current.lastError).toBe('Project description is required');
    });

    it('should generate build specifications', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      await act(async () => {
        await result.current.generateSpecs();
      });
      
      expect(result.current.generatedSpecs).toBeTruthy();
      expect(result.current.generatedSpecs).toContain('Build Specifications');
    });

    it('should generate blueprint', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.initializeSession();
        result.current.updateProjectOverview({
          name: 'Test',
          description: 'Test desc',
          goals: 'Test goals',
          targetAudience: 'Users',
          timeline: '1 month',
          category: 'Web Application',
          complexity: 'medium'
        });
        result.current.updateBuildSpecs({
          framework: 'Next.js',
          database: 'PostgreSQL',
          authentication: true,
          apiRequirements: [],
          thirdPartyIntegrations: [],
          hostingPreferences: 'Vercel'
        });
      });
      
      let blueprint;
      await act(async () => {
        blueprint = await result.current.generateBlueprint();
      });
      
      expect(blueprint).toBeTruthy();
      expect(result.current.blueprint).toBeTruthy();
      expect(result.current.blueprint?.id).toMatch(/^blueprint-\d+$/);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress metadata', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      expect(result.current.progress.totalSteps).toBe(8);
      expect(result.current.progress.startedAt).toBeInstanceOf(Date);
    });

    it('should save progress with timestamp', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      await act(async () => {
        await result.current.saveProgress();
      });
      
      expect(result.current.progress.lastSavedAt).toBeInstanceOf(Date);
    });
  });

  describe('Section Regeneration', () => {
    it('should regenerate document section with feedback', async () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      await act(async () => {
        await result.current.regenerateDocumentSection('overview', 'description', 'Make it more detailed');
      });
      
      const section = result.current.overviewSections.find(s => s.id === 'description');
      expect(section?.status).toBe('complete');
    });
  });

  describe('Page and Navigation Management', () => {
    it('should update pages', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      const pages = [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          description: 'Landing page',
          components: ['Header', 'Hero']
        }
      ];
      
      act(() => {
        result.current.updatePages(pages);
      });
      
      expect(result.current.pages).toEqual(pages);
    });

    it('should update navigation config', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.updateNavigation({
          type: 'sidebar',
          style: 'modern'
        });
      });
      
      expect(result.current.navigation.type).toBe('sidebar');
      expect(result.current.navigation.style).toBe('modern');
    });
  });

  describe('Styling Configuration', () => {
    it('should update styling preferences', () => {
      const { result } = renderHook(() => useOnboardingStore());
      
      act(() => {
        result.current.updateStyling({
          primaryColor: '#FF0000',
          fontFamily: 'Roboto'
        });
      });
      
      expect(result.current.styling.primaryColor).toBe('#FF0000');
      expect(result.current.styling.fontFamily).toBe('Roboto');
    });
  });
});