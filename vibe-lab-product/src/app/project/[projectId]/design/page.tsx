import { 
  Palette, 
  FileText, 
  Layout, 
  Component,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface ProjectDesignProps {
  params: Promise<{
    projectId: string;
  }>;
}

// Mock AVCA Stages 1-4 data
const designStages = [
  {
    id: 1,
    name: 'Blueprints',
    description: 'Project requirements and user stories',
    icon: FileText,
    status: 'completed',
    progress: 100,
    href: '/project/[id]/design/blueprints'
  },
  {
    id: 2,
    name: 'Styling',
    description: 'Theme and design system configuration',
    icon: Palette,
    status: 'completed',
    progress: 100,
    href: '/project/[id]/design/styling'
  },
  {
    id: 3,
    name: 'Pages',
    description: 'Page layouts and user flows',
    icon: Layout,
    status: 'in_progress',
    progress: 65,
    href: '/project/[id]/design/pages'
  },
  {
    id: 4,
    name: 'Components',
    description: '224-component specifications',
    icon: Component,
    status: 'pending',
    progress: 15,
    href: '/project/[id]/design/components',
    badge: '224 Components'
  }
];

export default async function ProjectDesign({ params }: ProjectDesignProps) {
  const { projectId } = await params;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'pending': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Design Workspace Header */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Design Workspace</h1>
            <p className="text-gray-400">AVCA Stages 1-4: Visual creation and planning</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-[#0F0F11] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Design Phase Progress</span>
            <span className="text-sm text-gray-400">70% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: '70%' }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>2 of 4 stages complete</span>
            <span>Estimated 1 week remaining</span>
          </div>
        </div>
      </div>

      {/* AVCA Design Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {designStages.map((stage) => {
          const Icon = stage.icon;
          return (
            <a
              key={stage.id}
              href={stage.href.replace('[id]', projectId)}
              className="group bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-200">
                      Stage {stage.id}: {stage.name}
                    </h3>
                    <p className="text-sm text-gray-400">{stage.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(stage.status)}
                  {stage.badge && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-medium">
                      {stage.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-white">{stage.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      stage.status === 'completed' ? 'bg-green-500' :
                      stage.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(stage.status)}`}>
                <span className="capitalize">{stage.status.replace('_', ' ')}</span>
                {stage.status === 'in_progress' && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                )}
              </div>
            </a>
          );
        })}
      </div>

      {/* Current Stage Focus */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Currently Working On: Stage 3 - Pages</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-white mb-3">Page Layouts in Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[#0F0F11] rounded-lg">
                <span className="text-sm text-gray-300">Dashboard Layout</span>
                <span className="text-xs text-green-400">Complete</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0F0F11] rounded-lg">
                <span className="text-sm text-gray-300">User Profile Page</span>
                <span className="text-xs text-blue-400">In Progress</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0F0F11] rounded-lg">
                <span className="text-sm text-gray-300">Settings Page</span>
                <span className="text-xs text-gray-400">Pending</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-white mb-3">Next: Component Specifications</h3>
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">224-Component System Ready</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Once page layouts are complete, we'll automatically generate specifications 
                for all 224 components in your design system.
              </p>
              <button className="px-4 py-2 text-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                Preview Component Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Design Tools */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Design Tools & Resources</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors">
            <FileText className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Blueprint Editor</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors">
            <Palette className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Theme Customizer</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors">
            <Layout className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Layout Builder</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors">
            <Component className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Component Specs</span>
          </button>
        </div>
      </div>
    </div>
  );
}