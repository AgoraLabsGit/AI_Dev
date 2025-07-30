import GitHubConnector from '@/components/stage0/GitHubConnector';
import { 
  Import, 
  Github, 
  Search, 
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ProjectImportProps {
  params: {
    projectId: string;
  };
}

// Mock Stage 0 analysis data
const mockAnalysisResults = {
  repositoryHealth: {
    score: 85,
    factors: {
      codeQuality: 88,
      documentation: 72,
      testCoverage: 91,
      dependencies: 83,
      security: 79
    }
  },
  migrationComplexity: 'moderate',
  estimatedDuration: '6-8 weeks',
  technicalDebt: {
    total: 23,
    critical: 2,
    high: 7,
    medium: 14
  },
  componentOpportunities: [
    { type: 'Header Component', confidence: 0.94, impact: 'high' },
    { type: 'Navigation Menu', confidence: 0.89, impact: 'high' },
    { type: 'Data Table', confidence: 0.87, impact: 'medium' },
    { type: 'Form Components', confidence: 0.92, impact: 'high' }
  ]
};

export default function ProjectImport({ params }: ProjectImportProps) {
  const { projectId } = params;

  return (
    <div className="space-y-6">
      {/* Stage 0 Import Header */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Import className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Stage 0: Import & Analysis</h1>
            <p className="text-gray-400">Repository analysis and migration planning</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded-lg font-medium border border-blue-500/30">
              BETA
            </span>
          </div>
        </div>

        {/* Process Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3 p-3 bg-[#0F0F11] rounded-lg">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Github className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">1. Connect</div>
              <div className="text-xs text-gray-400">GitHub Repository</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[#0F0F11] rounded-lg">
            <div className="p-2 rounded-full bg-purple-500/10">
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">2. Analyze</div>
              <div className="text-xs text-gray-400">Codebase Structure</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[#0F0F11] rounded-lg">
            <div className="p-2 rounded-full bg-green-500/10">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">3. Plan</div>
              <div className="text-xs text-gray-400">Migration Roadmap</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-[#0F0F11] rounded-lg">
            <div className="p-2 rounded-full bg-orange-500/10">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">4. Execute</div>
              <div className="text-xs text-gray-400">Component Migration</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Repository Connection */}
        <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2E]">
            <h2 className="text-lg font-semibold text-white">Repository Connection</h2>
            <p className="text-sm text-gray-400">Connect and select your GitHub repository</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <GitHubConnector />
          </div>
        </div>

        {/* Analysis Results Preview */}
        <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Analysis Preview</h2>
          
          {/* Repository Health Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Repository Health</span>
              <span className="text-2xl font-bold text-green-400">{mockAnalysisResults.repositoryHealth.score}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${mockAnalysisResults.repositoryHealth.score}%` }}
              />
            </div>
          </div>

          {/* Health Factors */}
          <div className="space-y-3 mb-6">
            {Object.entries(mockAnalysisResults.repositoryHealth.factors).map(([factor, score]) => (
              <div key={factor} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        score >= 90 ? 'bg-green-500' : 
                        score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8">{score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Migration Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0F0F11] rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Estimated Duration</span>
              </div>
              <span className="text-sm font-medium text-white">{mockAnalysisResults.estimatedDuration}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0F0F11] rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Complexity</span>
              </div>
              <span className="text-sm font-medium text-white capitalize">{mockAnalysisResults.migrationComplexity}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0F0F11] rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-300">Technical Debt</span>
              </div>
              <span className="text-sm font-medium text-white">{mockAnalysisResults.technicalDebt.total} issues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Component Opportunities */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Component Extraction Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAnalysisResults.componentOpportunities.map((opportunity, index) => (
            <div key={index} className="p-4 bg-[#0F0F11] rounded-lg border border-[#2A2A2E]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">{opportunity.type}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    opportunity.impact === 'high' ? 'bg-green-500/20 text-green-400' :
                    opportunity.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {opportunity.impact} impact
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Confidence</span>
                <span className="text-sm font-medium text-blue-400">{Math.round(opportunity.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${opportunity.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Next Steps</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm font-medium text-white">Complete Repository Analysis</div>
              <div className="text-xs text-gray-400">Generate detailed migration roadmap and component specifications</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Begin Design Phase</div>
              <div className="text-xs text-gray-400">Start with blueprints and component specifications</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-500/5 border border-gray-500/20 rounded-lg">
            <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-300">Execute Migration</div>
              <div className="text-xs text-gray-400">Automated component generation and testing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}