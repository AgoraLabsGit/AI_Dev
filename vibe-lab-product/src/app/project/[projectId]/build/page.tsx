import { 
  Wrench, 
  Sparkles, 
  TestTube, 
  Package, 
  Eye,
  Rocket,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  GitBranch,
  Activity
} from 'lucide-react';

interface ProjectBuildProps {
  params: {
    projectId: string;
  };
}

// Mock AVCA Stages 5-8 data
const buildStages = [
  {
    id: 5,
    name: 'Generate',
    description: 'AI-powered component generation',
    icon: Sparkles,
    status: 'pending',
    progress: 0,
    href: '/project/[id]/build/generate',
    badge: 'AI'
  },
  {
    id: 6,
    name: 'Quality',
    description: 'Quality gates and automated testing',
    icon: TestTube,
    status: 'pending',
    progress: 0,
    href: '/project/[id]/build/quality'
  },
  {
    id: 7,
    name: 'Registry',
    description: 'Component registry management',
    icon: Package,
    status: 'pending',
    progress: 0,
    href: '/project/[id]/build/registry',
    count: 156
  },
  {
    id: 8,
    name: 'Preview',
    description: 'Live application preview and assembly',
    icon: Eye,
    status: 'pending',
    progress: 0,
    href: '/project/[id]/build/preview'
  }
];

const mockBuildMetrics = {
  componentsGenerated: 34,
  testsPass: 156,
  testsFail: 3,
  codeQuality: 94,
  performance: 87,
  buildTime: '2m 34s',
  bundleSize: '234 KB'
};

export default function ProjectBuild({ params }: ProjectBuildProps) {
  const { projectId } = params;

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
      {/* Build Workspace Header */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Build Workspace</h1>
            <p className="text-gray-400">AVCA Stages 5-8: Development and deployment pipeline</p>
          </div>
        </div>

        {/* Build Status */}
        <div className="bg-[#0F0F11] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Build Pipeline Status</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400">Awaiting Design Completion</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">{mockBuildMetrics.componentsGenerated}</div>
              <div className="text-xs text-gray-400">Components Ready</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">{mockBuildMetrics.testsPass}</div>
              <div className="text-xs text-gray-400">Tests Passing</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">{mockBuildMetrics.codeQuality}%</div>
              <div className="text-xs text-gray-400">Code Quality</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-400">{mockBuildMetrics.bundleSize}</div>
              <div className="text-xs text-gray-400">Bundle Size</div>
            </div>
          </div>
        </div>
      </div>

      {/* AVCA Build Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buildStages.map((stage) => {
          const Icon = stage.icon;
          return (
            <a
              key={stage.id}
              href={stage.href.replace('[id]', projectId)}
              className="group bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6 hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-green-200">
                      Stage {stage.id}: {stage.name}
                    </h3>
                    <p className="text-sm text-gray-400">{stage.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(stage.status)}
                  {stage.badge && (
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded font-medium">
                      {stage.badge}
                    </span>
                  )}
                  {stage.count && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-medium">
                      {stage.count} Components
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
                {stage.status === 'pending' && (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
            </a>
          );
        })}
      </div>

      {/* Pipeline Requirements */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Pipeline Prerequisites</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-400">Design Phase Completion Required</span>
              <span className="text-sm text-gray-400">70% Complete</span>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              The build pipeline will automatically activate once all design stages (1-4) are completed. 
              Currently waiting for Stage 3 (Pages) and Stage 4 (Components) to finish.
            </p>
            <a
              href={`/project/${projectId}/design`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Complete Design Phase
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Requirements Ready</span>
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ Project blueprints defined</li>
                <li>✓ Design system configured</li>
                <li>✓ Component specifications prepared</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">AI Generation Ready</span>
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ 224-component library prepared</li>
                <li>✓ Code generation models loaded</li>
                <li>✓ Quality gates configured</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Build Tools Preview */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Build Tools & Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-green-500/50 hover:bg-green-500/5 transition-colors">
            <Code className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium text-white">Code Generator</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-green-500/50 hover:bg-green-500/5 transition-colors">
            <TestTube className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium text-white">Quality Gates</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-green-500/50 hover:bg-green-500/5 transition-colors">
            <Package className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium text-white">Registry</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-green-500/50 hover:bg-green-500/5 transition-colors">
            <Eye className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium text-white">Live Preview</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-green-500/50 hover:bg-green-500/5 transition-colors">
            <Rocket className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium text-white">Deploy</span>
          </button>
        </div>
      </div>

      {/* Recent Build Activity */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Build History</h2>
        </div>
        
        <div className="space-y-3 text-center py-8">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-400">No builds yet</p>
          <p className="text-sm text-gray-500">Builds will appear here once the design phase is complete</p>
        </div>
      </div>
    </div>
  );
}