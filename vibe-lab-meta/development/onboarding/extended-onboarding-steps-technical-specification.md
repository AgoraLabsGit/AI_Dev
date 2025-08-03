# Vibe Lab Extended Onboarding Steps
## Pages, Sub-Pages, Navigation, Components & Styling

## Overview

This specification extends the onboarding flow beyond Project Overview and Build Specifications to include complete application structure and design. The chat interface remains on the left (60%) while the right side (40%) shows interactive visual builders.

**Extended Flow:**
1. GitHub Sign In ✓
2. Project Overview ✓
3. Build Specifications ✓
4. **Pages** (main sections)
5. **Sub-Pages** (nested structure)
6. **Navigation** (how users move)
7. **Components** (page contents)
8. **Styling** (visual design)

---

## Step 4: Pages (Main Application Sections)

### Purpose
Define the top-level pages of the application without overwhelming with details.

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding: Application Structure                           │
├─────────────────────────┴───────────────────────────────────┤
│                                                              │
│  Page Builder (Left 60%)        │  Chat (Right 40%)        │
│                                 │                           │
│  Your Pages:                    │  🤖 Great! Now let's map  │
│  ┌─────────────┐               │     out your main pages.  │
│  │ 🏠 Homepage │               │     What major sections   │
│  └─────────────┘               │     will RecipeGram have? │
│  ┌─────────────┐               │                           │
│  │ 📊 Dashboard│               │  [🏠 Homepage]            │
│  └─────────────┘               │  [🔍 Discover]            │
│  ┌─────────────┐               │  [➕ Create Recipe]       │
│  │ 🔍 Discover │               │  [👤 Profile]             │
│  └─────────────┘               │  [⚙️ Settings]            │
│                                 │  [+ Add Custom Page]      │
│  [➕ Add Page]                  │                           │
│                                 │  👤 Selected: Homepage,    │
│  Drag to reorder               │     Discover, Create      │
│  Click to rename               │     Recipe, Profile       │
│                                 │                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Implementation

```tsx
interface PagesStepProps {
  onComplete: (pages: Page[]) => void;
  context: OnboardingContext;
}

export function PagesStep({ onComplete, context }: PagesStepProps) {
  const [pages, setPages] = useState<Page[]>([
    { id: 'home', name: 'Homepage', path: '/', icon: '🏠' }
  ]);
  
  const suggestedPages = getSuggestedPages(context.projectType);
  
  return (
    <div className="flex h-full">
      {/* Visual Builder - Left Side */}
      <div className="w-3/5 p-6 border-r">
        <h2 className="text-2xl font-bold mb-4">Your Pages</h2>
        
        <DraggablePageGrid
          pages={pages}
          onReorder={(newOrder) => setPages(newOrder)}
          onRename={(pageId, newName) => updatePageName(pageId, newName)}
          onDelete={(pageId) => removePage(pageId)}
        />
        
        <button 
          className="mt-4 w-full border-2 border-dashed border-gray-300 p-4 rounded-lg hover:border-primary"
          onClick={() => addCustomPage()}
        >
          ➕ Add Page
        </button>
        
        <PageStats pages={pages} />
      </div>
      
      {/* Chat - Right Side */}
      <div className="w-2/5 flex flex-col">
        <OnboardingChat
          stage="pages"
          message="Great! Now let's map out your main pages. What major sections will RecipeGram have?"
          quickActions={[
            ...suggestedPages.map(page => ({
              id: page.id,
              label: `${page.icon} ${page.name}`,
              type: 'multi-select' as const,
              action: () => togglePage(page)
            })),
            {
              id: 'custom',
              label: '+ Add Custom Page',
              type: 'secondary' as const,
              action: () => openCustomPageDialog()
            }
          ]}
          onComplete={() => onComplete(pages)}
        />
      </div>
    </div>
  );
}

// Visual page grid component
function DraggablePageGrid({ pages, onReorder, onRename, onDelete }) {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-4">
        {pages.map((page) => (
          <PageCard
            key={page.id}
            page={page}
            onRename={onRename}
            onDelete={onDelete}
            isDeletable={page.id !== 'home'}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

### Data Structure

```typescript
interface Page {
  id: string;
  name: string;
  path: string;
  icon?: string;
  isProtected?: boolean; // Can't be deleted
  requiresAuth?: boolean;
  subPages?: SubPage[];
  components?: string[]; // Added in Components step
}

// AI suggests pages based on project type
function getSuggestedPages(projectType: string): Page[] {
  const suggestions = {
    'social-media': [
      { id: 'home', name: 'Homepage', path: '/', icon: '🏠' },
      { id: 'discover', name: 'Discover', path: '/discover', icon: '🔍' },
      { id: 'create', name: 'Create Post', path: '/create', icon: '➕' },
      { id: 'profile', name: 'Profile', path: '/profile', icon: '👤' },
      { id: 'messages', name: 'Messages', path: '/messages', icon: '💬' }
    ],
    'e-commerce': [
      { id: 'home', name: 'Homepage', path: '/', icon: '🏠' },
      { id: 'shop', name: 'Shop', path: '/shop', icon: '🛍️' },
      { id: 'cart', name: 'Cart', path: '/cart', icon: '🛒' },
      { id: 'account', name: 'Account', path: '/account', icon: '👤' },
      { id: 'orders', name: 'Orders', path: '/orders', icon: '📦' }
    ],
    // ... more project types
  };
  
  return suggestions[projectType] || suggestions['general'];
}
```

---

## Step 5: Sub-Pages (Nested Structure)

### Purpose
Add depth to main pages where needed, creating logical hierarchies.

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding: Page Structure                                  │
├────────────────────────┴────────────────────────────────────┤
│                                                              │
│  Page Tree (Left 60%)           │  Chat (Right 40%)        │
│                                 │                           │
│  📁 Homepage                    │  🤖 Does your Discover   │
│  📁 Discover                    │     page need any        │
│    └─ 📄 Trending Recipes      │     sub-sections?        │
│    └─ 📄 Categories            │                           │
│    └─ 📄 Following             │  [📈 Trending Recipes]    │
│  📁 Create Recipe               │  [📂 Categories]          │
│  📁 Profile                     │  [👥 Following]           │
│    └─ 📄 My Recipes            │  [🌟 Featured Chefs]      │
│    └─ 📄 Saved Recipes         │  [🔍 Search Results]      │
│    └─ 📄 Settings              │  [Skip this page]         │
│                                 │                           │
│  [➕ Add Sub-page]              │  👤 Added: Trending,      │
│                                 │     Categories,           │
│                                 │     Following             │
│                                 │                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Implementation

```tsx
export function SubPagesStep({ pages, onComplete, context }: SubPagesStepProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pagesWithSubs, setPagesWithSubs] = useState<Page[]>([...pages]);
  
  const currentPage = pagesWithSubs[currentPageIndex];
  const suggestedSubPages = getSuggestedSubPages(currentPage, context);
  
  const handleSubPageAction = (action: 'add' | 'skip', subPages?: SubPage[]) => {
    if (action === 'add' && subPages) {
      updatePageWithSubPages(currentPage.id, subPages);
    }
    
    // Move to next page or complete
    if (currentPageIndex < pagesWithSubs.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      onComplete(pagesWithSubs);
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Tree View - Left Side */}
      <div className="w-3/5 p-6 border-r">
        <h2 className="text-2xl font-bold mb-4">Page Structure</h2>
        
        <PageTreeView
          pages={pagesWithSubs}
          currentPageId={currentPage.id}
          onAddSubPage={(pageId, subPage) => addSubPage(pageId, subPage)}
          onRemoveSubPage={(pageId, subPageId) => removeSubPage(pageId, subPageId)}
        />
        
        <ProgressBar
          current={currentPageIndex + 1}
          total={pages.length}
          label="Structuring pages"
        />
      </div>
      
      {/* Chat - Right Side */}
      <div className="w-2/5 flex flex-col">
        <OnboardingChat
          stage="sub-pages"
          message={`Does your ${currentPage.name} page need any sub-sections?`}
          quickActions={[
            ...suggestedSubPages.map(sub => ({
              id: sub.id,
              label: `${sub.icon} ${sub.name}`,
              type: 'multi-select' as const,
              action: () => toggleSubPage(sub)
            })),
            {
              id: 'skip',
              label: 'Skip this page',
              type: 'secondary' as const,
              action: () => handleSubPageAction('skip')
            }
          ]}
          onContinue={(selectedSubs) => handleSubPageAction('add', selectedSubs)}
        />
      </div>
    </div>
  );
}
```

---

## Step 6: Navigation (How Users Move)

### Purpose
Define how users navigate between pages and sub-pages.

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding: Navigation Design                               │
├───────────────────────┴─────────────────────────────────────┤
│                                                              │
│  Navigation Builder (Left 60%)  │  Chat (Right 40%)        │
│                                 │                           │
│  Navigation Style:              │  🤖 How should users      │
│  ┌─────────────────────┐       │     navigate RecipeGram?  │
│  │ [====] RecipeGram  🔍│      │                           │
│  │ Home Discover Create │       │  [📍 Top Navigation Bar]  │
│  └─────────────────────┘       │  [👈 Sidebar Menu]        │
│                                 │  [📱 Bottom Tabs]         │
│  Primary Menu Items:            │  [🍔 Hamburger Menu]      │
│  ☑️ Homepage                    │                           │
│  ☑️ Discover                    │  👤 Selected: Top         │
│  ☑️ Create Recipe               │     Navigation Bar        │
│  ☐ Profile                     │                           │
│  ☐ Messages                    │  🤖 Which pages should    │
│                                 │     appear in the main   │
│  Authenticated Menu:            │     navigation?          │
│  ☑️ Profile                     │                           │
│  ☑️ My Recipes                  │  [Select All]            │
│  ☑️ Settings                    │  [Essential Only]        │
│                                 │                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Implementation

```tsx
export function NavigationStep({ pages, onComplete, context }: NavigationStepProps) {
  const [navStyle, setNavStyle] = useState<NavigationStyle>('top-bar');
  const [primaryNav, setPrimaryNav] = useState<string[]>([]);
  const [authNav, setAuthNav] = useState<string[]>([]);
  
  return (
    <div className="flex h-full">
      {/* Navigation Designer - Left Side */}
      <div className="w-3/5 p-6 border-r">
        <h2 className="text-2xl font-bold mb-4">Navigation Design</h2>
        
        <NavigationPreview style={navStyle} pages={pages} />
        
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Primary Menu Items</h3>
          <PageCheckboxList
            pages={pages}
            selected={primaryNav}
            onChange={setPrimaryNav}
          />
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Authenticated Menu</h3>
          <PageCheckboxList
            pages={pages.filter(p => p.requiresAuth)}
            selected={authNav}
            onChange={setAuthNav}
          />
        </div>
      </div>
      
      {/* Chat - Right Side */}
      <div className="w-2/5 flex flex-col">
        <OnboardingChat
          stage="navigation"
          message="How should users navigate RecipeGram?"
          quickActions={[
            {
              id: 'top-bar',
              label: '📍 Top Navigation Bar',
              type: 'suggest',
              action: () => setNavStyle('top-bar')
            },
            {
              id: 'sidebar',
              label: '👈 Sidebar Menu',
              type: 'suggest',
              action: () => setNavStyle('sidebar')
            },
            {
              id: 'bottom-tabs',
              label: '📱 Bottom Tabs (mobile)',
              type: 'suggest',
              action: () => setNavStyle('bottom-tabs')
            }
          ]}
          followUp={{
            message: "Which pages should appear in the main navigation?",
            quickActions: [
              {
                id: 'all',
                label: 'Select All',
                type: 'primary',
                action: () => selectAllPages()
              },
              {
                id: 'essential',
                label: 'Essential Only',
                type: 'secondary',
                action: () => selectEssentialPages()
              }
            ]
          }}
          onComplete={() => onComplete({ style: navStyle, primaryNav, authNav })}
        />
      </div>
    </div>
  );
}
```

---

## Step 7: Components (Page Contents)

### Purpose
Define what components go on each page, building the actual content structure.

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding: Page Components                                 │
├──────────────────────┴──────────────────────────────────────┤
│                                                              │
│  Page Wireframe (Left 60%)      │  Chat (Right 40%)        │
│                                 │                           │
│  Homepage                       │  🤖 Let's add components │
│  ┌─────────────────────┐       │     to your Homepage.    │
│  │ 🗂️ Navigation Bar   │       │     What should visitors │
│  ├─────────────────────┤       │     see first?          │
│  │ 🎯 Hero Section     │       │                           │
│  │ "Share Recipes"     │       │  [🎯 Hero Section]        │
│  ├─────────────────────┤       │  [🔍 Search Bar]          │
│  │ 📋 Featured Recipes │       │  [📋 Recipe Grid]         │
│  │                     │       │  [👥 Popular Chefs]       │
│  ├─────────────────────┤       │  [📊 Trending Now]        │
│  │ ➕ Add Component    │       │  [+ Custom Component]     │
│  └─────────────────────┘       │                           │
│                                 │  👤 Added: Hero,          │
│  Component Library →            │     Featured Recipes      │
│                                 │                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Implementation

```tsx
export function ComponentsStep({ pages, onComplete, context }: ComponentsStepProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageComponents, setPageComponents] = useState<PageWithComponents[]>(
    pages.map(p => ({ ...p, components: [] }))
  );
  
  const currentPage = pageComponents[currentPageIndex];
  const suggestedComponents = getSuggestedComponents(currentPage, context);
  
  return (
    <div className="flex h-full">
      {/* Wireframe Builder - Left Side */}
      <div className="w-3/5 p-6 border-r">
        <PageSelector
          pages={pageComponents}
          currentPage={currentPage}
          onChange={setCurrentPageIndex}
        />
        
        <WireframeCanvas
          page={currentPage}
          onAddComponent={(component) => addComponent(currentPage.id, component)}
          onRemoveComponent={(componentId) => removeComponent(currentPage.id, componentId)}
          onReorderComponents={(newOrder) => reorderComponents(currentPage.id, newOrder)}
        />
        
        <ComponentLibrarySidebar
          availableComponents={getAvailableComponents(context)}
          onSelect={(component) => addComponent(currentPage.id, component)}
        />
      </div>
      
      {/* Chat - Right Side */}
      <div className="w-2/5 flex flex-col">
        <OnboardingChat
          stage="components"
          message={`Let's add components to your ${currentPage.name}. What should visitors see?`}
          quickActions={[
            ...suggestedComponents.map(comp => ({
              id: comp.id,
              label: `${comp.icon} ${comp.name}`,
              type: 'multi-select' as const,
              action: () => toggleComponent(comp)
            })),
            {
              id: 'custom',
              label: '+ Custom Component',
              type: 'secondary' as const,
              action: () => openCustomComponentDialog()
            }
          ]}
          navigationActions={[
            {
              id: 'next',
              label: currentPageIndex < pages.length - 1 ? 'Next Page →' : 'Continue to Styling',
              type: 'primary',
              action: () => handleNextPage()
            }
          ]}
        />
      </div>
    </div>
  );
}

// Wireframe canvas showing component layout
function WireframeCanvas({ page, onAddComponent, onRemoveComponent, onReorderComponents }) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[400px]">
      <h3 className="text-center text-gray-500 mb-4">{page.name}</h3>
      
      <DndContext onDragEnd={(result) => handleReorder(result)}>
        <div className="space-y-2">
          {page.components.map((component) => (
            <ComponentBlock
              key={component.id}
              component={component}
              onRemove={() => onRemoveComponent(component.id)}
            />
          ))}
          
          <button 
            className="w-full border-2 border-dashed border-gray-300 p-4 rounded hover:border-primary"
            onClick={() => openComponentSelector()}
          >
            ➕ Add Component
          </button>
        </div>
      </DndContext>
    </div>
  );
}
```

---

## Step 8: Styling (Visual Design)

### Purpose
Apply visual design through templates or website analysis.

### UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding: Visual Styling                                  │
├─────────────────────┴───────────────────────────────────────┤
│                                                              │
│  Style Selection (Left 60%)     │  Chat (Right 40%)        │
│                                 │                           │
│  Choose a Style:                │  🤖 Finally, let's style │
│  ┌────────┐ ┌────────┐         │     RecipeGram! Choose a │
│  │ Modern │ │ Playful│         │     template or analyze  │
│  │ Minimal│ │Colorful│         │     a website you like.  │
│  └────────┘ └────────┘         │                           │
│  ┌────────┐ ┌────────┐         │  [🎨 Modern Minimal]      │
│  │  Dark  │ │Business│         │  [🌈 Playful Colorful]    │
│  │  Tech  │ │  Pro   │         │  [🌑 Dark Tech]           │
│  └────────┘ └────────┘         │  [💼 Business Pro]        │
│                                 │                           │
│  Or Analyze a Website:          │  👤 "I like how Pinterest│
│  ┌─────────────────────┐       │      looks"              │
│  │ Enter URL...        │ [→]   │                           │
│  └─────────────────────┘       │  🤖 Let me analyze       │
│                                 │     Pinterest's design... │
│  Extracted Style:               │                           │
│  • Colors: Red, White, Gray     │  [✅ Apply This Style]    │
│  • Fonts: -apple-system         │  [🔄 Try Another Site]    │
│  • Spacing: Tight (8px base)    │  [🎨 Customize]           │
│  • Corners: Rounded (8px)       │                           │
│                                 │                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Implementation

```tsx
interface StyleTemplate {
  id: string;
  name: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headingStyle: string;
    bodyStyle: string;
  };
  spacing: 'tight' | 'normal' | 'relaxed';
  borderRadius: string;
}

export function StylingStep({ onComplete, context }: StylingStepProps) {
  const [selectedStyle, setSelectedStyle] = useState<StyleTemplate | null>(null);
  const [analyzedStyle, setAnalyzedStyle] = useState<ExtractedStyle | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleUrlAnalysis = async (url: string) => {
    setIsAnalyzing(true);
    try {
      const extracted = await analyzeWebsiteStyle(url);
      setAnalyzedStyle(extracted);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Style Selection - Left Side */}
      <div className="w-3/5 p-6 border-r">
        <h2 className="text-2xl font-bold mb-6">Choose Your Style</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {styleTemplates.map((template) => (
            <StyleTemplateCard
              key={template.id}
              template={template}
              selected={selectedStyle?.id === template.id}
              onClick={() => setSelectedStyle(template)}
            />
          ))}
        </div>
        
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Or Analyze a Website</h3>
          
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Enter website URL..."
              className="flex-1 px-4 py-2 border rounded-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUrlAnalysis(e.currentTarget.value);
                }
              }}
            />
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg"
              onClick={() => handleUrlAnalysis(inputValue)}
            >
              →
            </button>
          </div>
          
          {isAnalyzing && <LoadingSpinner />}
          
          {analyzedStyle && (
            <ExtractedStylePreview
              style={analyzedStyle}
              onApply={() => setSelectedStyle(convertToTemplate(analyzedStyle))}
            />
          )}
        </div>
        
        {selectedStyle && (
          <StyleCustomizer
            style={selectedStyle}
            onChange={setSelectedStyle}
          />
        )}
      </div>
      
      {/* Chat - Right Side */}
      <div className="w-2/5 flex flex-col">
        <OnboardingChat
          stage="styling"
          message="Finally, let's style RecipeGram! Choose a template or analyze a website you like."
          quickActions={
            analyzedStyle ? [
              {
                id: 'apply',
                label: '✅ Apply This Style',
                type: 'primary',
                action: () => applyAnalyzedStyle()
              },
              {
                id: 'try-another',
                label: '🔄 Try Another Site',
                type: 'secondary',
                action: () => setAnalyzedStyle(null)
              },
              {
                id: 'customize',
                label: '🎨 Customize',
                type: 'secondary',
                action: () => openCustomizer()
              }
            ] : styleTemplates.map(template => ({
              id: template.id,
              label: `${template.icon} ${template.name}`,
              type: 'suggest',
              action: () => setSelectedStyle(template)
            }))
          }
          onComplete={() => onComplete(selectedStyle)}
        />
      </div>
    </div>
  );
}

// Website style analyzer
async function analyzeWebsiteStyle(url: string): Promise<ExtractedStyle> {
  const response = await fetch('/api/analyze-style', {
    method: 'POST',
    body: JSON.stringify({ url })
  });
  
  return response.json();
}

// Style customizer component
function StyleCustomizer({ style, onChange }: StyleCustomizerProps) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-4">Customize Style</h3>
      
      <div className="space-y-4">
        <ColorPicker
          label="Primary Color"
          value={style.colors.primary}
          onChange={(color) => updateStyleColor('primary', color)}
        />
        
        <FontSelector
          value={style.typography.fontFamily}
          onChange={(font) => updateStyleFont(font)}
        />
        
        <SpacingSelector
          value={style.spacing}
          onChange={(spacing) => updateStyleSpacing(spacing)}
        />
        
        <BorderRadiusSlider
          value={style.borderRadius}
          onChange={(radius) => updateStyleRadius(radius)}
        />
      </div>
    </div>
  );
}
```

---

## Complete Flow Integration

### Onboarding Orchestrator

```tsx
export function ExtendedOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('pages');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    projectOverview: {}, // From previous steps
    buildSpecs: {},      // From previous steps
    pages: [],
    navigation: {},
    styling: {}
  });
  
  const steps: OnboardingStep[] = [
    'pages',
    'sub-pages', 
    'navigation',
    'components',
    'styling'
  ];
  
  const handleStepComplete = (stepData: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [currentStep]: stepData
    }));
    
    const nextIndex = steps.indexOf(currentStep) + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    } else {
      completeOnboarding();
    }
  };
  
  const completeOnboarding = async () => {
    // Generate complete application blueprint
    const blueprint = await generateApplicationBlueprint(onboardingData);
    
    // Initialize AVCA pipeline with complete specs
    await initializeAVCAPipeline({
      projectId: onboardingData.projectId,
      blueprint,
      startStage: 'component-generation'
    });
    
    // Navigate to project dashboard
    router.push(`/project/${onboardingData.projectId}`);
  };
  
  return (
    <div className="h-screen flex flex-col">
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={8}
        projectName={onboardingData.projectOverview.name}
      />
      
      <div className="flex-1">
        {currentStep === 'pages' && (
          <PagesStep
            context={onboardingData}
            onComplete={handleStepComplete}
          />
        )}
        
        {currentStep === 'sub-pages' && (
          <SubPagesStep
            pages={onboardingData.pages}
            context={onboardingData}
            onComplete={handleStepComplete}
          />
        )}
        
        {currentStep === 'navigation' && (
          <NavigationStep
            pages={onboardingData.pages}
            context={onboardingData}
            onComplete={handleStepComplete}
          />
        )}
        
        {currentStep === 'components' && (
          <ComponentsStep
            pages={onboardingData.pages}
            context={onboardingData}
            onComplete={handleStepComplete}
          />
        )}
        
        {currentStep === 'styling' && (
          <StylingStep
            context={onboardingData}
            onComplete={handleStepComplete}
          />
        )}
      </div>
    </div>
  );
}
```

---

## API Endpoints

### Style Analysis Endpoint

```typescript
// /api/analyze-style
export async function POST(request: Request) {
  const { url } = await request.json();
  
  // Use Puppeteer or similar to analyze website
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Extract styles
  const styles = await page.evaluate(() => {
    const computed = window.getComputedStyle(document.body);
    const primary = document.querySelector('[class*="primary"]');
    
    return {
      colors: extractColors(),
      typography: extractFonts(),
      spacing: detectSpacingSystem(),
      borderRadius: extractBorderRadius(),
      shadows: extractShadows()
    };
  });
  
  await browser.close();
  
  return Response.json(styles);
}
```

---

## Implementation Checklist

### Phase 1: Page Structure (Days 1-2)
- [ ] Pages step with drag-and-drop builder
- [ ] Sub-pages step with tree view
- [ ] Navigation step with style selector
- [ ] Page data models and state management

### Phase 2: Components & Styling (Days 3-4)
- [ ] Components step with wireframe builder
- [ ] Component library sidebar
- [ ] Styling step with template gallery
- [ ] Website URL analyzer

### Phase 3: Integration (Days 5-6)
- [ ] Connect all steps in flow
- [ ] Generate complete blueprint
- [ ] Pass to AVCA pipeline
- [ ] Testing and polish

---

## Key Benefits

1. **Complete Application Blueprint** - Every page, component, and style defined
2. **Visual Building** - See structure as you build it
3. **AI Guidance** - Smart suggestions at every step
4. **Flexibility** - Skip steps if not needed
5. **Website Inspiration** - Analyze and apply existing designs

*This extended onboarding ensures users have a complete, detailed blueprint before any code is generated, setting up projects for success from the start.*