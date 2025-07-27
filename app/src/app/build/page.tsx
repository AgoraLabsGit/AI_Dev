'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Bot, 
  Zap, 
  Calendar,
  BarChart3,
  Users,
  GitBranch,
  Play,
  Pause,
  MoreHorizontal,
  ChevronRight,
  Target
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complexity: number;
  estimatedHours: number;
  assignedAgent: string;
  parentTaskId?: string;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  status: string;
  completion: number;
  estimatedHours: number;
  tasks: Task[];
}

interface Roadmap {
  phases: Phase[];
  overallCompletion: number;
  totalTasks: number;
  completedTasks: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  complexity: number;
  status: string;
}

export default function BuildPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Mock project ID - in real app, this would come from route params
  const projectId = 'default-project';

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/projects/${projectId}/roadmap`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProject(result.data.project);
          setRoadmap(result.data.roadmap);
          if (result.data.roadmap.phases.length > 0) {
            setSelectedPhase(result.data.roadmap.phases[0].id);
          }
        } else {
          setError(result.error || 'Failed to fetch roadmap');
        }
      } else {
        setError('Failed to fetch roadmap');
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError('Error fetching roadmap');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'BLOCKED':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'BLOCKED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-400';
      case 'HIGH':
        return 'text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getAgentIcon = (agent: string) => {
    return agent === 'auditor' ? 
      <Bot className="w-3 h-3 text-purple-400" /> : 
      <Bot className="w-3 h-3 text-green-400" />;
  };

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh roadmap data
        fetchRoadmap();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading roadmap...</span>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Roadmap Available</h2>
          <p className="text-gray-400 mb-6">
            {error || 'Create a blueprint first to generate your project roadmap.'}
          </p>
          <a
            href="/plan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>Create Blueprint</span>
          </a>
        </div>
      </div>
    );
  }

  const selectedPhaseData = roadmap.phases.find(p => p.id === selectedPhase) || roadmap.phases[0];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Build Dashboard</h1>
            <p className="text-gray-400">AI-powered development task management</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>Start Development</span>
            </button>
          </div>
        </div>

        {/* Project Overview */}
        {project && (
          <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Project</div>
                <div className="text-lg font-semibold text-white">{project.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Overall Progress</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#0D0D0D] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${roadmap.overallCompletion}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{roadmap.overallCompletion}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Tasks</div>
                <div className="text-lg font-semibold text-white">
                  {roadmap.completedTasks}/{roadmap.totalTasks}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Complexity</div>
                <div className="text-lg font-semibold text-yellow-400">
                  {Math.round((project.complexity || 0) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phase Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Development Phases</h2>
            <div className="space-y-3">
              {roadmap.phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedPhase === phase.id
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-[#1C1C1E] border-[#2A2A2E] hover:border-[#404040]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{phase.name}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                      selectedPhase === phase.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-1.5 bg-[#0D0D0D] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${phase.completion}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{phase.completion}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {phase.tasks.length} tasks • {phase.estimatedHours}h estimated
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="lg:col-span-2">
          {selectedPhaseData && (
            <div className="space-y-6">
              {/* Phase Header */}
              <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{selectedPhaseData.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(selectedPhaseData.status)}`}>
                      {selectedPhaseData.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{selectedPhaseData.description}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Completion</div>
                    <div className="text-lg font-semibold text-green-400">{selectedPhaseData.completion}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Tasks</div>
                    <div className="text-lg font-semibold text-white">{selectedPhaseData.tasks.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Estimated Hours</div>
                    <div className="text-lg font-semibold text-blue-400">{selectedPhaseData.estimatedHours}h</div>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {selectedPhaseData.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-4 hover:border-[#404040] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-1"
                        >
                          {getStatusIcon(task.status)}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-white">{task.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              <span>Complexity: {task.complexity}/5</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimatedHours}h estimated</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {getAgentIcon(task.assignedAgent)}
                              <span>{task.assignedAgent}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            title="Start Task"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <>
                            <button
                              onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              title="Complete Task"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => updateTaskStatus(task.id, 'PENDING')}
                              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Pause Task"
                            >
                              <Pause className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}