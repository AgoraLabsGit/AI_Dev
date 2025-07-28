'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Download, 
  Settings, 
  Zap, 
  Users, 
  Code2, 
  Database, 
  Palette, 
  Shield, 
  Gauge,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Bot
} from 'lucide-react';

interface BlueprintData {
  // Project Details
  projectName: string;
  description: string;
  projectType: 'web-app' | 'mobile-app' | 'api' | 'desktop' | 'other';
  timeline: string;
  teamSize: number;
  
  // Technical Requirements
  frontend: string[];
  backend: string[];
  database: string[];
  deployment: string[];
  testing: string[];
  
  // AI Configuration
  complexity: number; // 0-1 scale
  aiAssistance: 'basic' | 'advanced' | 'full';
  codeGeneration: boolean;
  reviewLevel: 'standard' | 'thorough' | 'enterprise';
  
  // Metadata
  lastSaved?: string;
  version: number;
}

interface BlueprintEditorProps {
  projectId?: string;
  initialData?: Partial<BlueprintData>;
  onSave?: (data: BlueprintData) => void;
  onExport?: (data: BlueprintData) => void;
}

type TabType = 'project' | 'technical' | 'ai' | 'review';

const defaultBlueprint: BlueprintData = {
  projectName: '',
  description: '',
  projectType: 'web-app',
  timeline: '4-6 weeks',
  teamSize: 1,
  frontend: ['React', 'TypeScript', 'Tailwind CSS'],
  backend: ['Node.js', 'Express'],
  database: ['PostgreSQL'],
  deployment: ['Vercel'],
  testing: ['Jest', 'React Testing Library'],
  complexity: 0.5,
  aiAssistance: 'advanced',
  codeGeneration: true,
  reviewLevel: 'thorough',
  version: 1
};

const techOptions = {
  frontend: ['React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'SCSS', 'CSS Modules'],
  backend: ['Node.js', 'Python', 'Go', 'Rust', 'Java', 'C#', 'Express', 'FastAPI', 'Django', 'Gin', 'Spring Boot'],
  database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Supabase', 'Firebase', 'PlanetScale'],
  deployment: ['Vercel', 'Netlify', 'AWS', 'GCP', 'Azure', 'Railway', 'Render', 'DigitalOcean'],
  testing: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'React Testing Library', 'PyTest', 'Go Test']
};

export default function BlueprintEditor({ 
  projectId, 
  initialData = {}, 
  onSave, 
  onExport 
}: BlueprintEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('project');
  const [blueprint, setBlueprint] = useState<BlueprintData>({
    ...defaultBlueprint,
    ...initialData
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && blueprint.projectName) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [blueprint, isDirty]);

  const updateBlueprint = (updates: Partial<BlueprintData>) => {
    setBlueprint(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const validateBlueprint = (): string[] => {
    const errors: string[] = [];
    
    if (!blueprint.projectName.trim()) {
      errors.push('Project name is required');
    }
    if (!blueprint.description.trim()) {
      errors.push('Project description is required');
    }
    if (blueprint.frontend.length === 0) {
      errors.push('At least one frontend technology is required');
    }
    if (blueprint.backend.length === 0) {
      errors.push('At least one backend technology is required');
    }
    
    return errors;
  };

  const handleAutoSave = async () => {
    const errors = validateBlueprint();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setIsSaving(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setLastSaved(new Date().toLocaleTimeString());
        setIsDirty(false);
        onSave?.(blueprint);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    const errors = validateBlueprint();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      await handleAutoSave();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(blueprint, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${blueprint.projectName || 'blueprint'}-v${blueprint.version}.json`;
    link.click();
    onExport?.(blueprint);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          setBlueprint({ ...defaultBlueprint, ...importedData, version: blueprint.version + 1 });
          setIsDirty(true);
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleTechSelection = (category: keyof typeof techOptions, tech: string) => {
    const currentSelection = blueprint[category] as string[];
    const updated = currentSelection.includes(tech)
      ? currentSelection.filter(t => t !== tech)
      : [...currentSelection, tech];
    
    updateBlueprint({ [category]: updated });
  };

  const handleGenerateRoadmap = async () => {
    if (!projectId || validationErrors.length > 0) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blueprint })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Redirect to build page to view generated roadmap
          window.location.href = `/project/${projectId}/build`;
        } else {
          console.error('Roadmap generation failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'project', label: 'Project Details', icon: FileText },
    { id: 'technical', label: 'Tech Stack', icon: Code2 },
    { id: 'ai', label: 'AI Configuration', icon: Bot },
    { id: 'review', label: 'Review & Export', icon: CheckCircle }
  ] as const;

  const getComplexityColor = (complexity: number) => {
    if (complexity < 0.3) return 'text-green-400';
    if (complexity < 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getComplexityLabel = (complexity: number) => {
    if (complexity < 0.3) return 'Simple';
    if (complexity < 0.7) return 'Moderate';
    return 'Complex';
  };

  const completionPercentage = Math.round(
    ((blueprint.projectName ? 25 : 0) +
     (blueprint.description ? 25 : 0) +
     (blueprint.frontend.length > 0 ? 25 : 0) +
     (blueprint.backend.length > 0 ? 25 : 0)) / 100 * 100
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Blueprint Editor</h1>
            <p className="text-gray-400">Design your project architecture with AI assistance</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-save Status */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {isSaving ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Saved {lastSaved}</span>
                </>
              ) : isDirty ? (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span>Unsaved changes</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Up to date</span>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <label className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Import</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport} 
                  className="hidden" 
                />
              </label>
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <button
                onClick={handleSave}
                disabled={validationErrors.length > 0 || isSaving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Save Blueprint</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Blueprint Completion</span>
            <span className="text-sm text-gray-300">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-[#0D0D0D] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-2">Please fix these issues:</h3>
                <ul className="text-sm text-red-300 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#2A2A2E] mb-8">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-white bg-[#1C1C1E]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'project' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={blueprint.projectName}
                  onChange={(e) => updateBlueprint({ projectName: e.target.value })}
                  placeholder="My Awesome Project"
                  className="w-full bg-[#161618] border border-[#2A2A2E] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={blueprint.description}
                  onChange={(e) => updateBlueprint({ description: e.target.value })}
                  placeholder="Describe your project's purpose, goals, and key features..."
                  rows={4}
                  className="w-full bg-[#161618] border border-[#2A2A2E] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type
                </label>
                <select
                  value={blueprint.projectType}
                  onChange={(e) => updateBlueprint({ projectType: e.target.value as any })}
                  className="w-full bg-[#161618] border border-[#2A2A2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="web-app">Web Application</option>
                  <option value="mobile-app">Mobile Application</option>
                  <option value="api">API/Backend Service</option>
                  <option value="desktop">Desktop Application</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Project Metrics */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeline
                </label>
                <select
                  value={blueprint.timeline}
                  onChange={(e) => updateBlueprint({ timeline: e.target.value })}
                  className="w-full bg-[#161618] border border-[#2A2A2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="4-6 weeks">4-6 weeks</option>
                  <option value="6-8 weeks">6-8 weeks</option>
                  <option value="2-3 months">2-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Size
                </label>
                <select
                  value={blueprint.teamSize}
                  onChange={(e) => updateBlueprint({ teamSize: parseInt(e.target.value) })}
                  className="w-full bg-[#161618] border border-[#2A2A2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Solo Developer</option>
                  <option value={2}>2 Developers</option>
                  <option value={3}>3 Developers</option>
                  <option value={4}>4-5 Developers</option>
                  <option value={6}>6-10 Developers</option>
                  <option value={11}>11+ Developers</option>
                </select>
              </div>

              {/* Complexity Preview */}
              <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">Estimated Complexity</span>
                  <div className="flex items-center gap-2">
                    <Gauge className={`w-4 h-4 ${getComplexityColor(blueprint.complexity)}`} />
                    <span className={`text-sm font-medium ${getComplexityColor(blueprint.complexity)}`}>
                      {getComplexityLabel(blueprint.complexity)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-[#0D0D0D] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      blueprint.complexity < 0.3 ? 'bg-green-500' :
                      blueprint.complexity < 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${blueprint.complexity * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Complexity automatically calculated based on tech stack and project scope
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-8">
            {(Object.keys(techOptions) as Array<keyof typeof techOptions>).map((category) => (
              <div key={category} className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  {category === 'frontend' && <Palette className="w-5 h-5 text-blue-400" />}
                  {category === 'backend' && <Code2 className="w-5 h-5 text-green-400" />}
                  {category === 'database' && <Database className="w-5 h-5 text-purple-400" />}
                  {category === 'deployment' && <Zap className="w-5 h-5 text-orange-400" />}
                  {category === 'testing' && <Shield className="w-5 h-5 text-red-400" />}
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {category} Technologies
                  </h3>
                  <span className="text-sm text-gray-400">
                    ({(blueprint[category] as string[]).length} selected)
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {techOptions[category].map((tech) => {
                    const isSelected = (blueprint[category] as string[]).includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => toggleTechSelection(category, tech)}
                        className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                          isSelected
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                            : 'bg-[#1C1C1E] border-[#2A2A2E] text-gray-300 hover:border-[#404040] hover:text-white'
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
                
                {(blueprint[category] as string[]).length === 0 && (
                  <p className="text-sm text-gray-500 mt-3">
                    Select at least one {category} technology
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  AI Assistance Level
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'basic', label: 'Basic', desc: 'Code suggestions and basic guidance' },
                    { value: 'advanced', label: 'Advanced', desc: 'Architecture guidance and code review' },
                    { value: 'full', label: 'Full AI', desc: 'Complete development assistance' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        blueprint.aiAssistance === option.value
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-[#1C1C1E] border-[#2A2A2E] hover:border-[#404040]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="aiAssistance"
                        value={option.value}
                        checked={blueprint.aiAssistance === option.value}
                        onChange={(e) => updateBlueprint({ aiAssistance: e.target.value as any })}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Code Review Level
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'Standard', desc: 'Basic code quality checks' },
                    { value: 'thorough', label: 'Thorough', desc: 'Comprehensive review with security checks' },
                    { value: 'enterprise', label: 'Enterprise', desc: 'Exhaustive review with compliance checks' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        blueprint.reviewLevel === option.value
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-[#1C1C1E] border-[#2A2A2E] hover:border-[#404040]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reviewLevel"
                        value={option.value}
                        checked={blueprint.reviewLevel === option.value}
                        onChange={(e) => updateBlueprint({ reviewLevel: e.target.value as any })}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-3 p-4 bg-[#161618] border border-[#2A2A2E] rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blueprint.codeGeneration}
                    onChange={(e) => updateBlueprint({ codeGeneration: e.target.checked })}
                    className="rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Enable Code Generation</div>
                    <div className="text-xs text-gray-400">
                      Allow AI to generate boilerplate and component code
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Project Complexity: {Math.round(blueprint.complexity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={blueprint.complexity}
                  onChange={(e) => updateBlueprint({ complexity: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Simple</span>
                  <span>Moderate</span>
                  <span>Complex</span>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-white">AI Recommendations</h4>
                </div>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>• Estimated development time: {blueprint.timeline}</p>
                  <p>• Recommended team size: {blueprint.teamSize} developer{blueprint.teamSize > 1 ? 's' : ''}</p>
                  <p>• Complexity level: {getComplexityLabel(blueprint.complexity)}</p>
                  <p>• AI assistance: {blueprint.aiAssistance} mode recommended</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Blueprint Summary */}
            <div className="space-y-6">
              <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Blueprint Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400">Project</div>
                    <div className="text-white font-medium">{blueprint.projectName || 'Untitled Project'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400">Type & Timeline</div>
                    <div className="text-white">{blueprint.projectType} • {blueprint.timeline}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400">Team Size</div>
                    <div className="text-white">{blueprint.teamSize} developer{blueprint.teamSize > 1 ? 's' : ''}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400">Complexity</div>
                    <div className={`font-medium ${getComplexityColor(blueprint.complexity)}`}>
                      {getComplexityLabel(blueprint.complexity)} ({Math.round(blueprint.complexity * 100)}%)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Technology Stack</h3>
                
                <div className="space-y-3">
                  {(Object.keys(techOptions) as Array<keyof typeof techOptions>).map((category) => (
                    <div key={category}>
                      <div className="text-sm text-gray-400 capitalize mb-1">{category}</div>
                      <div className="flex flex-wrap gap-1">
                        {(blueprint[category] as string[]).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-[#2A2A2E] rounded text-xs text-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {(blueprint[category] as string[]).length === 0 && (
                          <span className="text-xs text-gray-500 italic">None selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Export */}
            <div className="space-y-6">
              <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={validationErrors.length > 0}
                    className="w-full p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Blueprint</span>
                  </button>
                  
                  <button
                    onClick={handleExport}
                    className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Blueprint</span>
                  </button>
                  
                  <button
                    onClick={handleGenerateRoadmap}
                    disabled={validationErrors.length > 0 || isGenerating}
                    className="w-full p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>{isGenerating ? 'Generating...' : 'Generate Roadmap'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assistance Level</span>
                    <span className="text-white capitalize">{blueprint.aiAssistance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Code Generation</span>
                    <span className="text-white">{blueprint.codeGeneration ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Review Level</span>
                    <span className="text-white capitalize">{blueprint.reviewLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}