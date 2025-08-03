# Vibe Lab Real-Time Document Crafting UI
## Live Document Generation with Interactive Approval Flow

## Overview

The Real-Time Document Crafting UI shows users their Project Overview and Build Specifications being written live by the AI, with granular control over each section. Users can approve, modify, or regenerate any part while maintaining conversation flow.

---

## UI Architecture

### Split-Screen Layout During Onboarding

```typescript
interface OnboardingLayout {
  left: "Chat conversation (60% width)";
  right: "Live document preview (40% width)";
  mobile: "Swipeable tabs between chat and documents";
}
```

### Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding: Creating Your Project Documents                 │
├─────────────────────────────┴───────────────────────────────┤
│                                                              │
│  Chat Conversation              │  📄 Project Overview      │
│                                 │  ━━━━━━━━━━━━━━━━━━━    │
│  🤖 Welcome to Vibe Lab!        │                          │
│     What are you building?      │  RecipeGram              │
│                                 │  ▓▓▓▓▓▓▓▓▓▓░░░░░        │
│  👤 Instagram for recipes       │                          │
│                                 │  Social recipe sharing    │
│  🤖 Love it! Let me suggest     │  platform for home co...  │
│     some names...               │                          │
│                                 │  [✓ Keep] [↻] [✏️]      │
│  [📝 RecipeGram]                │                          │
│  [📸 FoodSnap]                  │  Target Users            │
│  [🍳 CookShare]                 │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░      │
│                                 │                          │
│                                 │  🔨 Build Specs          │
│                                 │  ━━━━━━━━━━━━━━━        │
│                                 │  [Waiting for details...]│
│                                 │                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Live Document Preview Component

```tsx
interface LiveDocumentPreview {
  document: 'overview' | 'specs';
  sections: DocumentSection[];
  onSectionAction: (sectionId: string, action: SectionAction) => void;
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  status: 'writing' | 'complete' | 'editing' | 'approved';
  wordCount: number;
  lastUpdated: Date;
}

export function LiveDocumentPreview({ document, sections, onSectionAction }: LiveDocumentPreviewProps) {
  return (
    <div className="live-document-container">
      <DocumentHeader type={document} />
      
      {sections.map(section => (
        <DocumentSection key={section.id}>
          <SectionHeader>
            <h3>{section.title}</h3>
            <SectionStatus status={section.status} />
          </SectionHeader>
          
          <SectionContent>
            {section.status === 'writing' ? (
              <TypewriterEffect text={section.content} />
            ) : (
              <EditableContent 
                content={section.content}
                editable={section.status === 'editing'}
              />
            )}
          </SectionContent>
          
          <SectionActions>
            {section.status === 'complete' && (
              <>
                <QuickActionButton
                  action={{
                    id: 'approve',
                    label: '✓ Keep',
                    type: 'primary',
                    action: () => onSectionAction(section.id, 'approve')
                  }}
                />
                <QuickActionButton
                  action={{
                    id: 'regenerate',
                    label: '↻',
                    type: 'secondary',
                    action: () => onSectionAction(section.id, 'regenerate')
                  }}
                />
                <QuickActionButton
                  action={{
                    id: 'edit',
                    label: '✏️',
                    type: 'secondary',
                    action: () => onSectionAction(section.id, 'edit')
                  }}
                />
              </>
            )}
          </SectionActions>
        </DocumentSection>
      ))}
      
      <DocumentFooter>
        <ProgressIndicator 
          completed={sections.filter(s => s.status === 'approved').length}
          total={sections.length}
        />
      </DocumentFooter>
    </div>
  );
}
```

### 2. Typewriter Effect Component

```tsx
function TypewriterEffect({ text, speed = 30 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);
  
  return (
    <div className="typewriter-text">
      {displayedText}
      {currentIndex < text.length && (
        <span className="typewriter-cursor">▊</span>
      )}
    </div>
  );
}
```

### 3. Section-Level Interactions

```typescript
interface SectionInteractions {
  approve: {
    action: 'Lock section as approved',
    visual: 'Green checkmark, section highlight',
    effect: 'Section becomes read-only'
  };
  
  regenerate: {
    action: 'AI rewrites this section',
    visual: 'Section fades, typewriter starts again',
    prompt: 'Optional: Add guidance for regeneration'
  };
  
  edit: {
    action: 'Enable manual editing',
    visual: 'Section becomes editable textarea',
    features: ['Save', 'Cancel', 'AI Assist']
  };
  
  expand: {
    action: 'AI adds more detail',
    visual: 'Section grows with new content',
    limit: 'Respects document conciseness goals'
  };
}
```

---

## Real-Time Generation Flow

### 1. Progressive Document Building

```typescript
class DocumentBuilder {
  private sections = {
    overview: [
      { id: 'description', title: 'What is this application?' },
      { id: 'users', title: 'Target Users' },
      { id: 'features', title: 'Key Features' },
      { id: 'problem', title: 'Problem Solved' },
      { id: 'metrics', title: 'Success Metrics' }
    ],
    specs: [
      { id: 'architecture', title: 'Architecture' },
      { id: 'techstack', title: 'Technology Stack' },
      { id: 'data', title: 'Data Model' },
      { id: 'integrations', title: 'Integrations' },
      { id: 'performance', title: 'Performance' },
      { id: 'security', title: 'Security' }
    ]
  };
  
  async buildSection(
    document: 'overview' | 'specs',
    sectionId: string,
    context: OnboardingContext
  ): Promise<void> {
    // Set section to writing state
    this.updateSectionStatus(sectionId, 'writing');
    
    // Generate content
    const content = await this.generateSectionContent(sectionId, context);
    
    // Stream content with typewriter effect
    await this.streamContent(sectionId, content);
    
    // Set section to complete
    this.updateSectionStatus(sectionId, 'complete');
    
    // Auto-proceed to next section after brief pause
    setTimeout(() => {
      this.buildNextSection(document, context);
    }, 500);
  }
}
```

### 2. Smart Section Generation

```typescript
interface SmartGeneration {
  // AI understands dependencies between sections
  generateWithContext(sectionId: string, context: OnboardingContext) {
    const previousSections = this.getApprovedSections();
    const conversation = this.getConversationHistory();
    
    return ai.generate({
      section: sectionId,
      previousContent: previousSections,
      userResponses: conversation,
      constraints: {
        maxWords: this.getWordLimit(sectionId),
        tone: 'professional yet approachable',
        format: this.getSectionFormat(sectionId)
      }
    });
  }
  
  // Regeneration includes user feedback
  regenerateSection(sectionId: string, feedback?: string) {
    return ai.regenerate({
      section: sectionId,
      originalContent: this.getSectionContent(sectionId),
      feedback: feedback || 'Make it different',
      previousAttempts: this.getRegenerationHistory(sectionId)
    });
  }
}
```

---

## Interactive Editing Features

### 1. In-Line Editing Mode

```tsx
function EditableSection({ section, onSave, onCancel }: EditableSectionProps) {
  const [content, setContent] = useState(section.content);
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
  
  return (
    <div className="editable-section">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="section-editor"
        rows={calculateRows(content)}
      />
      
      <EditorToolbar>
        <button onClick={() => requestAiSuggestions(content)}>
          💡 AI Suggestions
        </button>
        <button onClick={() => checkGrammar(content)}>
          ✓ Check Grammar
        </button>
        <WordCount current={content.split(' ').length} target={50} />
      </EditorToolbar>
      
      {aiSuggestions.length > 0 && (
        <SuggestionPanel suggestions={aiSuggestions} />
      )}
      
      <EditorActions>
        <button className="save-btn" onClick={() => onSave(content)}>
          Save Changes
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </EditorActions>
    </div>
  );
}
```

### 2. AI-Assisted Editing

```typescript
interface AIEditAssistant {
  suggestions: {
    improveTone: "Make this sound more professional/casual";
    addDetail: "Expand with specific examples";
    makeConcise: "Shorten while keeping key points";
    clarify: "Rewrite for clarity";
    checkFacts: "Verify technical accuracy";
  };
  
  async assistEdit(content: string, action: EditAction): Promise<string> {
    return ai.editContent({
      original: content,
      action: action,
      context: this.documentContext,
      constraints: this.documentConstraints
    });
  }
}
```

---

## Document-Level Controls

### 1. Master Document Actions

```tsx
function DocumentMasterControls({ 
  overview, 
  specs, 
  onAction 
}: MasterControlsProps) {
  const allSectionsApproved = 
    [...overview.sections, ...specs.sections]
      .every(s => s.status === 'approved');
  
  return (
    <div className="master-controls">
      <DocumentStats>
        <Stat label="Project Overview" 
          value={`${overview.approvedCount}/${overview.totalSections}`} />
        <Stat label="Build Specs" 
          value={`${specs.approvedCount}/${specs.totalSections}`} />
        <Stat label="Total Words" value={calculateTotalWords()} />
      </DocumentStats>
      
      <MasterActions>
        <button 
          className="approve-all"
          onClick={() => onAction('approve-all')}
          disabled={!allSectionsApproved}
        >
          ✅ Approve All & Continue
        </button>
        <button 
          className="regenerate-all"
          onClick={() => onAction('regenerate-all')}
        >
          🔄 Regenerate Everything
        </button>
        <button 
          className="export"
          onClick={() => onAction('export')}
        >
          📥 Export Documents
        </button>
      </MasterActions>
    </div>
  );
}
```

### 2. Progress Tracking

```tsx
function DocumentProgress({ sections }: ProgressProps) {
  const statuses = {
    approved: sections.filter(s => s.status === 'approved').length,
    editing: sections.filter(s => s.status === 'editing').length,
    pending: sections.filter(s => s.status === 'complete').length,
    writing: sections.filter(s => s.status === 'writing').length
  };
  
  return (
    <div className="document-progress">
      <ProgressBar 
        value={statuses.approved} 
        max={sections.length}
        color="green"
      />
      <ProgressStats>
        <span className="approved">✓ {statuses.approved}</span>
        <span className="pending">⏳ {statuses.pending}</span>
        <span className="editing">✏️ {statuses.editing}</span>
      </ProgressStats>
    </div>
  );
}
```

---

## Mobile Responsiveness

### Swipeable Document View

```tsx
function MobileDocumentView() {
  const [activeTab, setActiveTab] = useState<'chat' | 'overview' | 'specs'>('chat');
  
  return (
    <SwipeableViews value={activeTab} onChangeIndex={setActiveTab}>
      <TabPanel value="chat">
        <OnboardingChat />
      </TabPanel>
      <TabPanel value="overview">
        <LiveDocumentPreview document="overview" />
      </TabPanel>
      <TabPanel value="specs">
        <LiveDocumentPreview document="specs" />
      </TabPanel>
    </SwipeableViews>
  );
}
```

---

## Visual States & Animations

### Section Status Indicators

```css
/* Writing state - typewriter effect */
.section-writing {
  background: linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%);
  border-left: 3px solid #3b82f6;
  animation: pulse 2s infinite;
}

/* Complete state - awaiting action */
.section-complete {
  background: #fefce8;
  border-left: 3px solid #facc15;
}

/* Approved state - locked */
.section-approved {
  background: #f0fdf4;
  border-left: 3px solid #22c55e;
  position: relative;
}

.section-approved::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  color: #22c55e;
  font-size: 20px;
}

/* Editing state */
.section-editing {
  background: #faf5ff;
  border-left: 3px solid #a855f7;
}

/* Regenerating state */
.section-regenerating {
  opacity: 0.5;
  animation: fadeInOut 1s infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
```

---

## Implementation Checklist

### Core Components
- [ ] LiveDocumentPreview container
- [ ] TypewriterEffect component
- [ ] EditableSection component
- [ ] SectionActions buttons
- [ ] DocumentProgress tracker
- [ ] MasterControls panel

### Interactions
- [ ] Section approval flow
- [ ] Regeneration with feedback
- [ ] Inline editing mode
- [ ] AI-assisted editing
- [ ] Auto-save functionality
- [ ] Keyboard shortcuts

### Visual Polish
- [ ] Section status animations
- [ ] Smooth transitions
- [ ] Loading states
- [ ] Progress indicators
- [ ] Mobile swipe gestures
- [ ] Dark mode support

---

## Best Practices

1. **Progressive Disclosure**: Build documents section by section, not all at once
2. **Immediate Feedback**: Every action should have instant visual response
3. **Non-Blocking**: Users can interact with completed sections while others generate
4. **Conciseness Enforcement**: Visual indicators when sections get too long
5. **Undo Support**: Allow reverting section changes
6. **Auto-Save**: Continuously save progress to prevent data loss
7. **Export Ready**: Documents should be easily exportable in multiple formats

---

*This Real-Time Document Crafting UI makes the AI's work transparent and gives users fine-grained control over their project documentation, creating a collaborative experience that builds trust and ensures satisfaction.*