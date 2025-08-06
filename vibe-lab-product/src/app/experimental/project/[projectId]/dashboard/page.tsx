import { Suspense } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface ProjectDashboardProps {
  params: Promise<{
    projectId: string;
  }>;
}

// Mock project data - will be fetched from API
const mockProjectData = {
  id: 'proj_001',
  name: 'E-commerce Dashboard',
  status: 'active',
  progress: 78,
  componentCount: 34,
  lastUpdated: '2 hours ago',
  metrics: {
    quality: 94,
    performance: 87,
    security: 91,
    coverage: 85
  },
  recentActivity: [
    { id: 1, action: 'Component generated', item: 'HeaderComponent', time: '5 min ago' },
    { id: 2, action: 'Quality gate passed', item: 'LoginForm', time: '12 min ago' },
    { id: 3, action: 'Stage completed', item: 'Design Phase', time: '1 hour ago' }
  ]
};

export default async function ProjectDashboard({ params }: ProjectDashboardProps) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      {/* Project Overview Header */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{mockProjectData.name}</h1>
            <p className="text-gray-400">Project ID: {projectId}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 capitalize">{mockProjectData.status}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-medium text-white">{mockProjectData.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${mockProjectData.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{mockProjectData.componentCount}</div>
            <div className="text-sm text-gray-400">Components</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{mockProjectData.metrics.quality}%</div>
            <div className="text-sm text-gray-400">Quality Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{mockProjectData.metrics.performance}%</div>
            <div className="text-sm text-gray-400">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{mockProjectData.metrics.coverage}%</div>
            <div className="text-sm text-gray-400">Test Coverage</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DIAS Intelligence Panel */}
        <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">DIAS Intelligence</h2>
            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded font-medium">
              AI
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Predictive Insight</span>
              </div>
              <p className="text-sm text-gray-300">
                Based on current progress, your project will be ready for deployment in 2-3 weeks. 
                Consider prioritizing the authentication components for faster user testing.
              </p>
            </div>

            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Optimization Suggestion</span>
              </div>
              <p className="text-sm text-gray-300">
                Your component reusability score is excellent! 12 components are being reused 
                across multiple pages, reducing bundle size by 23%.
              </p>
            </div>

            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Attention Needed</span>
              </div>
              <p className="text-sm text-gray-300">
                3 components haven't been updated in 2 weeks. Consider reviewing for 
                potential improvements or deprecation.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          
          <div className="space-y-3">
            {mockProjectData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#252527] transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div className="flex-1">
                  <div className="text-sm text-white">{activity.action}</div>
                  <div className="text-xs text-gray-400">{activity.item}</div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors border border-[#2A2A2E] rounded-lg hover:border-blue-500/50">
            View All Activity
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href={`/project/${projectId}/design`}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
          >
            <LayoutDashboard className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-medium text-white">Go to Design</span>
          </a>
          
          <a
            href={`/project/${projectId}/build`}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-green-500/50 hover:bg-green-500/5 transition-colors"
          >
            <Zap className="w-6 h-6 text-green-400" />
            <span className="text-sm font-medium text-white">Go to Build</span>
          </a>
          
          <a
            href={`/project/${projectId}/import`}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors"
          >
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Stage 0 Import</span>
          </a>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2E] hover:border-gray-500/50 hover:bg-gray-500/5 transition-colors">
            <Users className="w-6 h-6 text-gray-400" />
            <span className="text-sm font-medium text-white">Invite Team</span>
          </button>
        </div>
      </div>
    </div>
  );
}