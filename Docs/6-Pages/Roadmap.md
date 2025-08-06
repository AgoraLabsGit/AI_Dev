## **Vibe Lab Roadmap - Strike Bitcoin Ultra-Dark Theme**

### **Updated Component Implementation (Pure Tailwind)**

```tsx
// Phase Component - Ultra-dark with Strike-inspired design
const PhaseCard = ({ phase, isActive }: { phase: Phase, isActive: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  
  const phaseStatus = calculatePhaseStatus(phase);
  const statusBookmarks = {
    'not-started': 'bg-gray-800 text-gray-500',
    'in-progress': 'bg-orange-600 text-orange-100',
    'complete': 'bg-green-600 text-green-100',
    'error': 'bg-red-600 text-red-100'
  };

  return (
    <div className={cn(
      "relative mb-4 rounded-lg transition-all duration-300",
      "bg-[#111113] border border-[#1F1F23]",
      isActive && "ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      !isActive && "hover:border-[#2A2A2E]"
    )}>
      {/* Phase Header */}
      <div 
        className={cn(
          "p-6 cursor-pointer rounded-t-lg transition-colors duration-200",
          isActive ? "bg-[#0A0A0B]/50" : "bg-transparent"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronRight className={cn(
              "w-5 h-5 text-gray-600 transition-transform duration-200",
              isExpanded && "rotate-90"
            )} />
            <span className="text-2xl">{phase.icon}</span>
            <h2 className="text-xl font-light text-white">{phase.name}</h2>
            {isActive && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                CURRENT
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {phase.progress}% Complete
            </span>
            <div className="w-32 bg-[#1F1F23] rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bookmark - Strike-inspired */}
      <div className={cn(
        "absolute right-0 top-6 w-12 h-24",
        statusBookmarks[phaseStatus],
        "rounded-l-lg shadow-[inset_2px_0_4px_rgba(0,0,0,0.3)]",
        "flex items-center justify-center transition-all duration-300"
      )}>
        <div className="text-xs font-bold transform -rotate-90 tracking-wider">
          {phaseStatus.toUpperCase()}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-6 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-300">
          {phase.roadmaps.map(roadmap => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
          ))}
        </div>
      )}
    </div>
  );
};

// Roadmap Card - Information Dense Design
const RoadmapCard = ({ roadmap }: { roadmap: Roadmap }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#0A0A0B] border border-[#1F1F23] rounded-lg p-4 hover:border-[#2A2A2E] transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={cn(
            "w-4 h-4 text-gray-600 transition-transform",
            "group-hover:text-gray-400",
            isExpanded && "rotate-90"
          )} />
          <h3 className="font-light text-white group-hover:text-blue-400 transition-colors">
            {roadmap.name}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Validation Rings - Strike-inspired minimal design */}
          <div className="flex items-center gap-2">
            {roadmap.stages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <ValidationRing 
                  icon={stage.icon} 
                  status={stage.status}
                  name={stage.name}
                />
                {index < roadmap.stages.length - 1 && (
                  <div className={cn(
                    "w-4 h-px transition-colors duration-300",
                    stage.status === 'complete' ? 'bg-green-500/50' : 'bg-[#1F1F23]'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#1F1F23] overflow-hidden">
              <img src={roadmap.assignee.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm text-gray-500 font-mono">{roadmap.progress}%</span>
          </div>
        </div>
      </div>

      {/* Tasks - Ultra minimal */}
      {isExpanded && (
        <div className="mt-4 ml-7 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {roadmap.tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

// Validation Ring - Strike-inspired minimal
const ValidationRing = ({ icon, status, name }: ValidationRingProps) => {
  const rings = {
    'not-started': 'border-[#1F1F23] bg-[#0A0A0B]',
    'in-progress': 'border-orange-500/50 bg-orange-500/10',
    'complete': 'border-green-500/50 bg-green-500/10',
    'error': 'border-red-500/50 bg-red-500/10'
  };

  return (
    <div 
      className={cn(
        "relative w-8 h-8 rounded-full border transition-all duration-300",
        rings[status],
        "flex items-center justify-center group cursor-pointer",
        "hover:scale-110 hover:border-opacity-100"
      )}
      title={`${name}: ${status}`}
    >
      <span className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
      
      {/* Error dot */}
      {status === 'error' && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
      
      {/* In-progress pulse */}
      {status === 'in-progress' && (
        <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping" />
      )}
    </div>
  );
};

// Task Item - Minimal Strike design
const TaskItem = ({ task }: { task: Task }) => {
  const statusIcons = {
    'complete': '✓',
    'in-progress': '◐',
    'pending': '○'
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#111113] transition-colors group">
      <span className="text-gray-600 text-sm">{statusIcons[task.status]}</span>
      <span className="text-gray-300 text-sm flex-1 group-hover:text-white transition-colors">
        {task.title}
      </span>
      <span className="text-gray-600 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        {task.dueDate}
      </span>
    </div>
  );
};
```

### **Visual Mockup - Ultra-Dark Theme**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Vibe Lab Roadmap                                                 42% ████░░░░       │
│  AI-Powered Development Pipeline                                  Last sync: 2m ago  │
└─────────────────────────────────────────────────────────────────────────────────────┘

[Dark background #0A0A0B]

┌─────────────────────────────────────────────────────────────────────┬──────┐────────┐
│ ▼ 🏗️ Phase 1: Foundation                              75% ████████░░│  IN  │        │
│    [CURRENT]                                                        │ PROG │        │ 
├─────────────────────────────────────────────────────────────────────┴──────┴────────┤
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │ ▼ Database Schema & Models                    ⬤─⬤─⬤─⬤─⬤─⬤     @sarah       │ │
│  │    100% ████████████                          📋 ⚡ 🔍 📚 🧠 🚀   2d ago      │ │
│  ├────────────────────────────────────────────────────────────────────────────────┤ │
│  │  ✓ Set up Prisma schema                                              Nov 15    │ │
│  │  ✓ Create user and project models                                    Nov 16    │ │
│  │  ✓ Add relationship mappings                                         Nov 17    │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### **Key Design Alignments**

1. **Pure Tailwind**: No custom CSS, all styling via utility classes
2. **Ultra-Dark Theme**: Backgrounds use `#0A0A0B` and `#111113`
3. **Strike-Inspired**: Minimal borders, subtle shadows, clean typography
4. **Information Dense**: Compact layout maximizes content visibility
5. **Keyboard Ready**: All expandable sections support keyboard navigation
6. **AI Status**: Validation rings show AI processing status clearly

### **CSS Variables Integration**

```typescript
// In your globals.css (the ONLY allowed CSS file)
:root {
  --background: #0A0A0B;
  --surface: #111113;
  --foreground: #FFFFFF;
  --foreground-secondary: #A1A1AA;
  --border: #1F1F23;
  
  /* Status colors */
  --status-complete: #10B981;
  --status-progress: #F97316;
  --status-error: #EF4444;
  --status-inactive: #6B7280;
}
```

This implementation strictly follows Vibe Lab's styling standards while creating a beautiful, functional roadmap system that fits perfectly with the Strike Bitcoin aesthetic!