'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Hammer,
  Bot,
  Layout,
  Zap,
  FileCheck,
  FileText,
  Brain,
  Rocket,
  Target,
  TrendingUp,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import MainSidebar from '@/components/navigation/MainSidebar';
import DualClaudeChat from '@/components/DualClaudeChat';
import { cn } from '@/lib/utils';

// Types for our 3-tier roadmap structure
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'in-progress' | 'pending' | 'error';
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  complexity: number;
}

interface Stage {
  id: string;
  name: string;
  icon: string;
  status: 'complete' | 'in-progress' | 'pending' | 'error';
  tasks: Task[];
  progress: number;
}

interface Roadmap {
  id: string;
  name: string;
  description: string;
  stages: Stage[];
  progress: number;
  assignee: {
    name: string;
    avatar: string;
  };
  tasks: Task[];
}

interface Phase {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'complete' | 'in-progress' | 'pending' | 'error';
  progress: number;
  roadmaps: Roadmap[];
}

// Status indicators configuration
const statusIndicators = {
  'pending': 'bg-[#1F1F23]',
  'in-progress': 'bg-blue-500/80',
  'complete': 'bg-emerald-500/80',
  'error': 'bg-red-500/80'
};

// Icon mapping for phases
const phaseIcons = {
  'Foundation Setup': Hammer,
  'AI System Integration': Bot,
  'Frontend Components': Layout
};

// Icon mapping for stages
const stageIcons = {
  'PLAN': Target,
  'BUILD': Zap,
  'VALIDATE': FileCheck,
  'DOCUMENT': FileText,
  'INTELLIGENCE': Brain,
  'DEPLOY': Rocket
};

// Mock data with 6-stage validation pipeline
const mockPhases: Phase[] = [
  {
    id: 'phase-1',
    name: 'Foundation Setup',
    icon: '🏗️',
    description: 'Core infrastructure and database setup',
    status: 'complete',
    progress: 100,
    roadmaps: [
      {
        id: 'roadmap-1',
        name: 'Database Architecture',
        description: 'Prisma schema and data models',
        progress: 100,
        assignee: { name: 'Sarah', avatar: '/avatars/sarah.jpg' },
        stages: [
          { id: 'stage-1', name: 'PLAN', icon: 'PLAN', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-2', name: 'BUILD', icon: 'BUILD', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-3', name: 'VALIDATE', icon: 'VALIDATE', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-4', name: 'DOCUMENT', icon: 'DOCUMENT', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-5', name: 'INTELLIGENCE', icon: 'INTELLIGENCE', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-6', name: 'DEPLOY', icon: 'DEPLOY', status: 'complete', progress: 100, tasks: [] }
        ],
        tasks: [
          {
            id: 'task-1',
            title: 'Design Prisma schema',
            description: 'Create comprehensive database schema',
            status: 'complete',
            assignee: { name: 'Sarah', avatar: '/avatars/sarah.jpg' },
            dueDate: '2025-08-05',
            complexity: 3
          }
        ]
      }
    ]
  },
  {
    id: 'phase-2',
    name: 'AI System Integration',
    icon: '🤖',
    description: 'AVCA and DIAS implementation with SuperClaude',
    status: 'in-progress',
    progress: 67,
    roadmaps: [
      {
        id: 'roadmap-2',
        name: 'SuperClaude Core',
        description: 'AI Orchestrator and MCP servers',
        progress: 67,
        assignee: { name: 'Mike', avatar: '/avatars/mike.jpg' },
        stages: [
          { id: 'stage-1', name: 'PLAN', icon: 'PLAN', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-2', name: 'BUILD', icon: 'BUILD', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-3', name: 'VALIDATE', icon: 'VALIDATE', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-4', name: 'DOCUMENT', icon: 'DOCUMENT', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-5', name: 'INTELLIGENCE', icon: 'INTELLIGENCE', status: 'in-progress', progress: 70, tasks: [] },
          { id: 'stage-6', name: 'DEPLOY', icon: 'DEPLOY', status: 'pending', progress: 0, tasks: [] }
        ],
        tasks: [
          {
            id: 'task-2',
            title: 'Implement Context7 MCP server',
            description: 'Documentation lookup and research integration',
            status: 'in-progress',
            assignee: { name: 'Mike', avatar: '/avatars/mike.jpg' },
            dueDate: '2025-08-06',
            complexity: 4
          },
          {
            id: 'task-3',
            title: 'Build Sequential MCP server',
            description: 'Deep analysis and reasoning engine',
            status: 'pending',
            assignee: { name: 'Alex', avatar: '/avatars/alex.jpg' },
            dueDate: '2025-08-08',
            complexity: 5
          }
        ]
      }
    ]
  },
  {
    id: 'phase-3',
    name: 'Frontend Components',
    icon: '🎨',
    description: 'UI components and user interface',
    status: 'pending',
    progress: 15,
    roadmaps: [
      {
        id: 'roadmap-3',
        name: 'Core UI Components',
        description: 'Essential interface components',
        progress: 15,
        assignee: { name: 'Jordan', avatar: '/avatars/jordan.jpg' },
        stages: [
          { id: 'stage-1', name: 'PLAN', icon: 'PLAN', status: 'complete', progress: 100, tasks: [] },
          { id: 'stage-2', name: 'BUILD', icon: 'BUILD', status: 'pending', progress: 0, tasks: [] },
          { id: 'stage-3', name: 'VALIDATE', icon: 'VALIDATE', status: 'pending', progress: 0, tasks: [] },
          { id: 'stage-4', name: 'DOCUMENT', icon: 'DOCUMENT', status: 'pending', progress: 0, tasks: [] },
          { id: 'stage-5', name: 'INTELLIGENCE', icon: 'INTELLIGENCE', status: 'pending', progress: 0, tasks: [] },
          { id: 'stage-6', name: 'DEPLOY', icon: 'DEPLOY', status: 'pending', progress: 0, tasks: [] }
        ],
        tasks: [
          {
            id: 'task-4',
            title: 'Create roadmap visualization component',
            description: 'Interactive 3-tier roadmap display',
            status: 'in-progress',
            assignee: { name: 'Jordan', avatar: '/avatars/jordan.jpg' },
            dueDate: '2025-08-10',
            complexity: 4
          }
        ]
      }
    ]
  }
];

// Helper functions
const calculatePhaseStatus = (phase: Phase): 'complete' | 'in-progress' | 'pending' | 'error' => {
  if (phase.progress === 100) return 'complete';
  if (phase.progress > 0) return 'in-progress';
  return 'pending';
};

// Validation Ring Component
const ValidationRing = ({ icon, status, name }: { icon: string; status: string; name: string }) => {
  const rings = {
    'complete': 'border-emerald-500/50 bg-emerald-500/10',
    'in-progress': 'border-orange-500/50 bg-orange-500/10',
    'pending': 'border-[#1F1F23] bg-[#0A0A0B]',
    'error': 'border-red-500/50 bg-red-500/10'
  };

  const IconComponent = stageIcons[icon as keyof typeof stageIcons] || Target;

  return (
    <div 
      className={cn(
        "relative w-8 h-8 rounded-full border transition-all duration-200",
        rings[status as keyof typeof rings],
        "flex items-center justify-center group cursor-pointer",
        "hover:scale-110 hover:border-opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      )}
      title={`${name}: ${status}`}
      tabIndex={0}
    >
      <IconComponent className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Status indicators */}
      {status === 'error' && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
      
      {status === 'in-progress' && (
        <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping" />
      )}
    </div>
  );
};

// Task Item Component
const TaskItem = ({ task }: { task: Task }) => {
  const statusIcons = {
    'complete': '✓',
    'in-progress': '◐',
    'pending': '○',
    'error': '✗'
  };

  const statusColors = {
    'complete': 'text-green-400',
    'in-progress': 'text-orange-400',
    'pending': 'text-gray-600',
    'error': 'text-red-400'
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded hover:bg-[#111113] transition-colors group">
      <span className={cn("text-sm", statusColors[task.status])}>
        {statusIcons[task.status]}
      </span>
      <span className="text-gray-300 text-sm flex-1 group-hover:text-white transition-colors">
        {task.title}
      </span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-gray-600 text-xs">Complexity: {task.complexity}/5</span>
        <span className="text-gray-600 text-xs font-mono">{task.dueDate}</span>
      </div>
    </div>
  );
};

// Roadmap Card Component
const RoadmapCard = ({ roadmap }: { roadmap: Roadmap }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = roadmap.progress === 100 ? 'complete' : roadmap.progress > 0 ? 'in-progress' : 'pending';

  return (
    <div className="relative bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg overflow-hidden hover:bg-[#15151A] transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/50">
      {/* Status Indicator */}
      <div className={cn(
        "absolute left-1 top-1 bottom-1 w-1.5",
        statusIndicators[status],
        "transition-all duration-300 rounded-full"
      )} />

      <div 
        className="flex items-center justify-between w-full p-4 pl-5 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={cn(
            "w-4 h-4 text-gray-600 transition-all duration-200",
            "group-hover:text-gray-400",
            isExpanded && "rotate-90"
          )} />
          <h3 className="font-normal text-white group-hover:text-blue-400 transition-colors duration-200 font-jetbrains">
            {roadmap.name}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-2">{roadmap.progress}% Complete</div>
            <div className="relative h-1.5 bg-[#1F1F23] rounded-full overflow-hidden w-32">
              <div 
                className="absolute h-full bg-blue-500/80 rounded-full transition-all duration-300"
                style={{ width: `${roadmap.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Stage Visualization */}
      <div className="flex items-center gap-4 px-8 pb-4">
        {roadmap.stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center">
            <ValidationRing 
              icon={stage.icon} 
              status={stage.status}
              name={stage.name}
            />
            {index < roadmap.stages.length - 1 && (
              <div className={cn(
                "h-[2px] w-12 mx-2 transition-colors duration-300",
                stage.status === 'complete' ? 'bg-emerald-500/50' : 'bg-[#1F1F23]'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Tasks */}
      {isExpanded && (
        <div className="mt-4 px-8 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {roadmap.tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

// Phase Card Component
const PhaseCard = ({ phase, isActive }: { phase: Phase; isActive: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  
  const phaseStatus = calculatePhaseStatus(phase);
  const PhaseIcon = phaseIcons[phase.name as keyof typeof phaseIcons] || Hammer;

  return (
    <div className="relative mb-4">
      <div className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-200",
        "bg-[#1A1A1C] border border-[#2A2A2E]",
        "hover:bg-[#15151A] focus-within:ring-2 focus-within:ring-blue-500/50",
        isActive && "ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
      )}>
        {/* Status Indicator */}
        <div className={cn(
          "absolute left-1 top-1 bottom-1 w-1.5",
          statusIndicators[phaseStatus],
          "transition-all duration-300 rounded-full"
        )} />

        {/* Phase Header */}
        <div 
          className={cn(
            "group relative flex items-center justify-between w-full p-5 pl-6",
            "cursor-pointer rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <ChevronRight className={cn(
              "w-5 h-5 text-gray-600 transition-all duration-200",
              "group-hover:text-gray-400",
              isExpanded && "rotate-90"
            )} />
            <PhaseIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
            <h2 className="text-xl font-normal tracking-tight text-white group-hover:text-blue-400 transition-colors duration-200 font-jetbrains">
              {phase.name}
            </h2>
            {isActive && (
              <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                CURRENT
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-2">{phase.progress}% Complete</div>
              <div className="relative h-1.5 bg-[#1F1F23] rounded-full overflow-hidden w-36">
                <div 
                  className="absolute h-full bg-blue-500/80 rounded-full transition-all duration-300"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="p-5 pl-6 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-300">
            {phase.roadmaps.map(roadmap => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Project Overview Dashboard Component
const ProjectOverview = ({ overallProgress }: { overallProgress: number }) => {
  return (
    <div className="bg-[#1A1A1C] rounded-lg overflow-hidden border border-[#2A2A2E] p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-400 font-inter">Time Remaining</div>
              <div className="text-lg font-normal text-white font-inter">2.5 Weeks</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-400 font-inter">Tasks Completed</div>
              <div className="text-lg font-normal text-white font-inter">24/56</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-400 font-inter">Quality Score</div>
              <div className="text-lg font-normal text-green-400 font-inter">94%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-400 font-inter">Performance</div>
              <div className="text-lg font-normal text-blue-400 font-inter">87%</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-400 font-inter">Overall Progress</span>
              <span className="text-sm font-normal text-white font-inter">{overallProgress}%</span>
            </div>
            <div className="relative h-1.5 bg-[#1F1F23] rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-blue-500/80 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CoreBuildPage() {
  const [phases] = useState<Phase[]>(mockPhases);
  const [activePhase] = useState<string>('phase-2'); // Current active phase
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [chatPanelWidth, setChatPanelWidth] = useState(450);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null);
  
  const isResizingChat = useRef(false);
  const isResizingSidebar = useRef(false);

  const overallProgress = Math.round(
    phases.reduce((acc, phase) => acc + phase.progress, 0) / phases.length
  );

  // Mouse handlers for resizing
  const handleChatMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingChat.current = true;
  };

  const handleMouseUp = useCallback(() => {
    isResizingChat.current = false;
    isResizingSidebar.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingChat.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 320 && newWidth < 960) {
        setChatPanelWidth(newWidth);
      }
    }
    if (isResizingSidebar.current) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 500) {
        setSidebarWidth(newWidth);
      }
    }
  }, []);

  // Set initial sidebar width
  useEffect(() => {
    setSidebarWidth(256);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-[#FFFFFF]">
      {/* Main Sidebar */}
      <MainSidebar 
        isCollapsed={isSidebarCollapsed}
        onCollapse={setIsSidebarCollapsed}
        width={sidebarWidth ?? 256}
        onWidthChange={setSidebarWidth}
      />

      {/* Main Content and Chat Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
                         <div className="max-w-7xl mx-auto">
               {/* Header */}
               <div className="mb-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                                         <h1 className="text-2xl font-normal tracking-tight font-inter">Core Build</h1>
                    <span className="text-sm text-gray-400 font-inter">AI-Powered Development Pipeline</span>
                   </div>
                                     <div className="flex items-center gap-2 text-sm text-gray-500 font-inter">
                    <Clock className="w-4 h-4" />
                    Last sync: 2 minutes ago
                  </div>
                 </div>
               </div>

               {/* 6-Stage Validation Pipeline */}
               <div className="mb-4 p-2.5 bg-[#111113] border border-[#1F1F23] rounded-lg">
                 <div className="flex items-center justify-center">
                   {[
                     { icon: "PLAN", status: "complete", name: "Plan" },
                     { icon: "BUILD", status: "complete", name: "Build" },
                     { icon: "VALIDATE", status: "in-progress", name: "Validate" },
                     { icon: "DOCUMENT", status: "pending", name: "Document" },
                     { icon: "INTELLIGENCE", status: "pending", name: "Intelligence" },
                     { icon: "DEPLOY", status: "pending", name: "Deploy" }
                   ].map((stage, index, arr) => (
                     <div key={stage.name} className="flex items-center">
                       <div className="flex items-center gap-2">
                         <ValidationRing icon={stage.icon} status={stage.status} name={stage.name} />
                         <span className="text-xs text-gray-400 hidden sm:inline">{stage.name}</span>
                       </div>
                       {index < arr.length - 1 && (
                         <div className={cn(
                           "h-[2px] w-8 mx-3 transition-colors duration-300",
                           stage.status === 'complete' ? 'bg-emerald-500/50' : 'bg-[#1F1F23]'
                         )} />
                       )}
                     </div>
                   ))}
                 </div>
               </div>

              {/* Project Overview Dashboard */}
              <ProjectOverview overallProgress={overallProgress} />

              {/* Phase Cards */}
              <div className="space-y-4">
                {phases.map((phase) => (
                  <PhaseCard 
                    key={phase.id} 
                    phase={phase} 
                    isActive={phase.id === activePhase}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Chat Panel */}
        <aside 
          className={cn(
            "relative flex-shrink-0 bg-[#111113] border-l border-[#1F1F23]",
            "flex flex-col transition-all duration-200",
            isChatCollapsed ? 'w-12' : ''
          )}
          style={{ width: isChatCollapsed ? '48px' : `${chatPanelWidth}px` }}
        >
          {/* Collapse/Expand Button */}
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={() => setIsChatCollapsed(!isChatCollapsed)}
              className={cn(
                "p-1.5 rounded-lg",
                "text-[#9CA3AF] hover:text-white",
                "hover:bg-[#1A1A1C]",
                "transition-colors"
              )}
              title={isChatCollapsed ? 'Expand Chat' : 'Collapse Chat'}
            >
              {isChatCollapsed ? 
                <PanelLeftClose className="w-5 h-5" /> : 
                <PanelRightClose className="w-5 h-5" />
              }
            </button>
          </div>
          
          {/* Resizer Handle */}
          {!isChatCollapsed && (
            <div 
              className={cn(
                "w-1.5 cursor-col-resize absolute top-0 left-0 h-full",
                "bg-transparent hover:bg-[#374151]",
                "transition-colors duration-200"
              )}
              onMouseDown={handleChatMouseDown}
            />
          )}

          {/* Chat Content */}
          {!isChatCollapsed && (
            <div className="flex-1 flex flex-col min-h-0">
              <DualClaudeChat />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}