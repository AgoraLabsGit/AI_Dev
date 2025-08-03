import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocumentSection } from '@/components/onboarding/LiveDocumentPreview';
import { DocumentGenerator } from '@/lib/avca/services/document-generator';
import { AIClient } from '@/lib/avca/services/ai-client';
import { SourceAnalyzer } from '@/lib/avca/services/source-analyzer';

// Types for onboarding data structures
export type OnboardingStep = 'entry';

export interface ProjectOverview {
  name?: string;
  description: string;
  goals: string;
  targetAudience: string;
  timeline: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
}

export interface BuildSpecifications {
  framework: string;
  database: string;
  authentication: boolean;
  apiRequirements: string[];
  thirdPartyIntegrations: string[];
  hostingPreferences: string;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  description: string;
  components: string[];
  subPages?: SubPage[];
}

export interface SubPage {
  id: string;
  name: string;
  path: string;
  parentId: string;
  description: string;
  components: string[];
}

export interface NavigationConfig {
  type: 'horizontal' | 'sidebar' | 'mobile-first' | 'mega-menu';
  style: 'minimal' | 'modern' | 'classic' | 'custom';
  items: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  children?: NavigationItem[];
}

export interface ComponentMapping {
  [pageId: string]: {
    header: string[];
    content: string[];
    sidebar?: string[];
    footer: string[];
  };
}

export interface StyleConfig {
  colorScheme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  spacing: 'tight' | 'normal' | 'relaxed';
  referenceWebsites: string[];
}

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalSteps: number;
  startedAt: Date;
  lastSavedAt?: Date;
}

export interface Blueprint {
  id: string;
  projectId: string;
  overview: ProjectOverview;
  specifications: BuildSpecifications;
  pages: Page[];
  navigation: NavigationConfig;
  components: ComponentMapping;
  styling: StyleConfig;
  version: number;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Zustand store interface
interface OnboardingStore {
  // State
  sessionId: string | null;
  progress: OnboardingProgress;
  
  // Data
  projectOverview: Partial<ProjectOverview>;
  buildSpecs: Partial<BuildSpecifications>;
  pages: Page[];
  navigation: Partial<NavigationConfig>;
  components: ComponentMapping;
  styling: Partial<StyleConfig>;
  
  // Generated content
  generatedOverview: string | null;
  generatedSpecs: string | null;
  blueprint: Blueprint | null;
  
  // Document sections for LiveDocumentPreview
  overviewSections: DocumentSection[];
  specsSections: DocumentSection[];
  
  // UI state
  isGenerating: boolean;
  isGeneratingDocument: boolean;
  currentGeneratingDocument: 'overview' | 'specs' | null;
  lastError: string | null;
  
  // Actions
  initializeSession: () => void;
  setCurrentStep: (step: OnboardingStep) => void;
  markStepCompleted: (step: OnboardingStep) => void;
  
  // Data updates
  updateProjectOverview: (data: Partial<ProjectOverview>) => void;
  updateBuildSpecs: (data: Partial<BuildSpecifications>) => void;
  updatePages: (pages: Page[]) => void;
  updateNavigation: (nav: Partial<NavigationConfig>) => void;
  updateComponents: (components: ComponentMapping) => void;
  updateStyling: (style: Partial<StyleConfig>) => void;
  
  // Generation actions
  generateOverview: () => Promise<void>;
  generateSpecs: () => Promise<void>;
  generateBlueprint: () => Promise<Blueprint>;
  
  // Document section actions
  generateDocumentSection: (document: 'overview' | 'specs', sectionId: string) => Promise<void>;
  updateDocumentSection: (document: 'overview' | 'specs', sectionId: string, content: string) => void;
  approveDocumentSection: (document: 'overview' | 'specs', sectionId: string) => void;
  regenerateDocumentSection: (document: 'overview' | 'specs', sectionId: string, feedback?: string) => Promise<void>;
  expandDocumentSection: (document: 'overview' | 'specs', sectionId: string) => void;
  
  // Persistence
  saveProgress: () => Promise<void>;
  loadProgress: (sessionId: string) => Promise<void>;
  clearSession: () => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  canProceedToNextStep: () => boolean;
}

// Default values
const defaultProgress: OnboardingProgress = {
  currentStep: 'entry',
  completedSteps: [],
  totalSteps: 8,
  startedAt: new Date(),
};

const defaultProjectOverview: Partial<ProjectOverview> = {
  description: '',
  goals: '',
  targetAudience: '',
  timeline: '',
  category: 'Web Application',
  complexity: 'medium',
};

const defaultBuildSpecs: Partial<BuildSpecifications> = {
  framework: 'Next.js',
  database: 'PostgreSQL',
  authentication: false,
  apiRequirements: [],
  thirdPartyIntegrations: [],
  hostingPreferences: 'Vercel',
};

const defaultNavigation: Partial<NavigationConfig> = {
  type: 'horizontal',
  style: 'modern',
  items: [],
};

const defaultStyling: Partial<StyleConfig> = {
  colorScheme: 'dark',
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  fontFamily: 'Inter',
  borderRadius: 'medium',
  spacing: 'normal',
  referenceWebsites: [],
};

// Default document sections
const defaultOverviewSections: DocumentSection[] = [
  { id: 'description', title: 'What is this application?', content: '', status: 'pending' },
  { id: 'users', title: 'Target Users', content: '', status: 'pending' },
  { id: 'features', title: 'Key Features', content: '', status: 'pending' },
  { id: 'problem', title: 'Problem Solved', content: '', status: 'pending' },
  { id: 'metrics', title: 'Success Metrics', content: '', status: 'pending' }
];

const defaultSpecsSections: DocumentSection[] = [
  { id: 'architecture', title: 'Architecture', content: '', status: 'pending' },
  { id: 'techstack', title: 'Technology Stack', content: '', status: 'pending' },
  { id: 'data', title: 'Data Model', content: '', status: 'pending' },
  { id: 'integrations', title: 'Integrations', content: '', status: 'pending' },
  { id: 'performance', title: 'Performance', content: '', status: 'pending' },
  { id: 'security', title: 'Security', content: '', status: 'pending' }
];

// Create the store
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      progress: defaultProgress,
      projectOverview: defaultProjectOverview,
      buildSpecs: defaultBuildSpecs,
      pages: [],
      navigation: defaultNavigation,
      components: {},
      styling: defaultStyling,
      generatedOverview: null,
      generatedSpecs: null,
      blueprint: null,
      overviewSections: [...defaultOverviewSections],
      specsSections: [...defaultSpecsSections],
      isGenerating: false,
      isGeneratingDocument: false,
      currentGeneratingDocument: null,
      lastError: null,

      // Actions
      initializeSession: () => {
        const sessionId = `onboarding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set({
          sessionId,
          progress: {
            ...defaultProgress,
            startedAt: new Date(),
          },
        });
      },

      setCurrentStep: (step: OnboardingStep) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentStep: step,
          },
        }));
      },

      markStepCompleted: (step: OnboardingStep) => {
        set((state) => ({
          progress: {
            ...state.progress,
            completedSteps: Array.from(new Set([...state.progress.completedSteps, step])),
          },
        }));
      },

      // Data updates
      updateProjectOverview: (data: Partial<ProjectOverview>) => {
        set((state) => ({
          projectOverview: { ...state.projectOverview, ...data },
        }));
      },

      updateBuildSpecs: (data: Partial<BuildSpecifications>) => {
        set((state) => ({
          buildSpecs: { ...state.buildSpecs, ...data },
        }));
      },

      updatePages: (pages: Page[]) => {
        set({ pages });
      },

      updateNavigation: (nav: Partial<NavigationConfig>) => {
        set((state) => ({
          navigation: { ...state.navigation, ...nav },
        }));
      },

      updateComponents: (components: ComponentMapping) => {
        set({ components });
      },

      updateStyling: (style: Partial<StyleConfig>) => {
        set((state) => ({
          styling: { ...state.styling, ...style },
        }));
      },

      // Generation actions
      generateOverview: async () => {
        const state = get();
        if (!state.projectOverview.description?.trim()) {
          set({ lastError: 'Project description is required' });
          return;
        }

        set({ isGenerating: true, lastError: null });
        
        try {
          // TODO: Integrate with AVCA document generation service
          // const result = await documentGeneratorService.generateOverview(state.projectOverview);
          
          // Mock generation for now
          await new Promise(resolve => setTimeout(resolve, 2000));
          const mockOverview = `# ${state.projectOverview.description || 'Project'} Overview\n\nThis project aims to ${state.projectOverview.goals || 'achieve specific goals'}.\n\n## Target Audience\n${state.projectOverview.targetAudience || 'General users'}\n\n## Timeline\n${state.projectOverview.timeline || 'To be determined'}`;
          
          set({
            generatedOverview: mockOverview,
            isGenerating: false,
          });
        } catch (error) {
          set({
            lastError: error instanceof Error ? error.message : 'Failed to generate overview',
            isGenerating: false,
          });
        }
      },

      generateSpecs: async () => {
        const state = get();
        set({ isGenerating: true, lastError: null });
        
        try {
          // TODO: Integrate with AVCA document generation service
          await new Promise(resolve => setTimeout(resolve, 2500));
          const mockSpecs = `# Build Specifications\n\n## Framework: ${state.buildSpecs.framework}\n## Database: ${state.buildSpecs.database}\n## Authentication: ${state.buildSpecs.authentication ? 'Required' : 'Not required'}`;
          
          set({
            generatedSpecs: mockSpecs,
            isGenerating: false,
          });
        } catch (error) {
          set({
            lastError: error instanceof Error ? error.message : 'Failed to generate specifications',
            isGenerating: false,
          });
        }
      },

      generateBlueprint: async (): Promise<Blueprint> => {
        const state = get();
        set({ isGenerating: true, lastError: null });
        
        try {
          // TODO: Integrate with AVCA blueprint generation service
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const blueprint: Blueprint = {
            id: `blueprint-${Date.now()}`,
            projectId: state.sessionId || '',
            overview: state.projectOverview as ProjectOverview,
            specifications: state.buildSpecs as BuildSpecifications,
            pages: state.pages,
            navigation: state.navigation as NavigationConfig,
            components: state.components,
            styling: state.styling as StyleConfig,
            version: 1,
            approved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set({
            blueprint,
            isGenerating: false,
          });
          
          return blueprint;
        } catch (error) {
          set({
            lastError: error instanceof Error ? error.message : 'Failed to generate blueprint',
            isGenerating: false,
          });
          throw error;
        }
      },

      // Document section actions
      generateDocumentSection: async (document: 'overview' | 'specs', sectionId: string) => {
        const state = get();
        const sections = document === 'overview' ? state.overviewSections : state.specsSections;
        const sectionIndex = sections.findIndex(s => s.id === sectionId);
        
        if (sectionIndex === -1) return;

        // Update section status to writing
        const updatedSections = [...sections];
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          status: 'writing',
          lastUpdated: new Date()
        };

        set({
          [document === 'overview' ? 'overviewSections' : 'specsSections']: updatedSections,
          isGeneratingDocument: true,
          currentGeneratingDocument: document
        });

        try {
          // Mock content generation based on section type
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
          
          let mockContent = '';
          const section = updatedSections[sectionIndex];
          
          switch (section.id) {
            case 'description':
              mockContent = `${state.projectOverview.description || 'This application'} serves as a comprehensive solution that addresses key user needs through an intuitive interface and robust functionality.`;
              break;
            case 'users':
              mockContent = `${state.projectOverview.targetAudience || 'Primary users'} will benefit from streamlined workflows and enhanced productivity features designed specifically for their use cases.`;
              break;
            case 'features':
              mockContent = `Core features include: real-time collaboration, intuitive dashboard, automated workflows, and comprehensive analytics to drive decision-making.`;
              break;
            case 'problem':
              mockContent = `This application solves the critical problem of fragmented workflows and inefficient processes that cost organizations time and resources.`;
              break;
            case 'metrics':
              mockContent = `Success will be measured by: 40% reduction in task completion time, 90% user satisfaction rate, and 25% increase in overall productivity.`;
              break;
            case 'architecture':
              mockContent = `Built on a modern ${state.buildSpecs.framework || 'React'} architecture with microservices design, ensuring scalability and maintainability.`;
              break;
            case 'techstack':
              mockContent = `Technology stack: ${state.buildSpecs.framework || 'React'}, ${state.buildSpecs.database || 'PostgreSQL'}, Node.js backend, and cloud-native deployment.`;
              break;
            case 'data':
              mockContent = `Data model centers around user entities, project structures, and activity tracking with normalized relationships and optimized indexing.`;
              break;
            case 'integrations':
              mockContent = `Planned integrations include: GitHub, Slack, Google Workspace, and industry-standard APIs for seamless workflow connectivity.`;
              break;
            case 'performance':
              mockContent = `Performance targets: <200ms response time, 99.9% uptime, support for 10k+ concurrent users with horizontal scaling capabilities.`;
              break;
            case 'security':
              mockContent = `Security measures: OAuth 2.0 authentication, role-based access control, end-to-end encryption, and SOC 2 compliance.`;
              break;
            default:
              mockContent = `Detailed information about ${section.title.toLowerCase()} will be generated based on your project requirements and industry best practices.`;
          }

          // Update section with generated content
          const finalSections = [...(get()[document === 'overview' ? 'overviewSections' : 'specsSections'])];
          const finalIndex = finalSections.findIndex(s => s.id === sectionId);
          if (finalIndex !== -1) {
            finalSections[finalIndex] = {
              ...finalSections[finalIndex],
              content: mockContent,
              status: 'complete',
              wordCount: mockContent.split(' ').length,
              lastUpdated: new Date()
            };

            set({
              [document === 'overview' ? 'overviewSections' : 'specsSections']: finalSections,
              isGeneratingDocument: false,
              currentGeneratingDocument: null
            });
          }
        } catch (error) {
          // Revert section status on error
          const errorSections = [...(get()[document === 'overview' ? 'overviewSections' : 'specsSections'])];
          const errorIndex = errorSections.findIndex(s => s.id === sectionId);
          if (errorIndex !== -1) {
            errorSections[errorIndex] = {
              ...errorSections[errorIndex],
              status: 'pending'
            };

            set({
              [document === 'overview' ? 'overviewSections' : 'specsSections']: errorSections,
              isGeneratingDocument: false,
              currentGeneratingDocument: null,
              lastError: `Failed to generate ${section.title}`
            });
          }
        }
      },

      updateDocumentSection: (document: 'overview' | 'specs', sectionId: string, content: string) => {
        const state = get();
        const sections = document === 'overview' ? state.overviewSections : state.specsSections;
        const updatedSections = sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                content,
                wordCount: content.split(' ').length,
                lastUpdated: new Date()
              }
            : section
        );

        set({
          [document === 'overview' ? 'overviewSections' : 'specsSections']: updatedSections
        });
      },

      approveDocumentSection: (document: 'overview' | 'specs', sectionId: string) => {
        const state = get();
        const sections = document === 'overview' ? state.overviewSections : state.specsSections;
        const updatedSections = sections.map(section =>
          section.id === sectionId
            ? { ...section, status: 'complete' as const, lastUpdated: new Date() }
            : section
        );

        set({
          [document === 'overview' ? 'overviewSections' : 'specsSections']: updatedSections
        });
      },

      regenerateDocumentSection: async (document: 'overview' | 'specs', sectionId: string, feedback?: string) => {
        // Use the same logic as generateDocumentSection but with feedback context
        await get().generateDocumentSection(document, sectionId);
      },

      expandDocumentSection: (document: 'overview' | 'specs', sectionId: string) => {
        // This method can be used for additional expand logic if needed
        // For now, the expand functionality is handled in the UI component
        console.log(`Expanding section ${sectionId} in ${document}`);
      },

      // Persistence
      saveProgress: async () => {
        const state = get();
        try {
          // TODO: Implement backend persistence
          console.log('Saving progress:', state.sessionId);
          set((prevState) => ({
            progress: {
              ...prevState.progress,
              lastSavedAt: new Date(),
            },
          }));
        } catch (error) {
          set({ lastError: 'Failed to save progress' });
        }
      },

      loadProgress: async (sessionId: string) => {
        try {
          // TODO: Implement backend loading
          console.log('Loading progress:', sessionId);
        } catch (error) {
          set({ lastError: 'Failed to load progress' });
        }
      },

      clearSession: () => {
        set({
          sessionId: null,
          progress: defaultProgress,
          projectOverview: defaultProjectOverview,
          buildSpecs: defaultBuildSpecs,
          pages: [],
          navigation: defaultNavigation,
          components: {},
          styling: defaultStyling,
          generatedOverview: null,
          generatedSpecs: null,
          blueprint: null,
          isGenerating: false,
          lastError: null,
        });
      },

      // Validation
      validateCurrentStep: () => {
        const state = get();
        switch (state.progress.currentStep) {
          case 'overview':
            return !!state.projectOverview.description?.trim();
          case 'buildSpecs':
            return !!state.buildSpecs.framework && !!state.buildSpecs.database;
          case 'pages':
            return state.pages.length > 0;
          case 'navigation':
            return !!state.navigation.type && !!state.navigation.style;
          case 'styling':
            return !!state.styling.primaryColor && !!state.styling.colorScheme;
          default:
            return true;
        }
      },

      canProceedToNextStep: () => {
        return get().validateCurrentStep();
      },
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        progress: state.progress,
        projectOverview: state.projectOverview,
        buildSpecs: state.buildSpecs,
        pages: state.pages,
        navigation: state.navigation,
        components: state.components,
        styling: state.styling,
        generatedOverview: state.generatedOverview,
        generatedSpecs: state.generatedSpecs,
        blueprint: state.blueprint,
        overviewSections: state.overviewSections,
        specsSections: state.specsSections,
      }),
    }
  )
);