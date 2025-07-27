'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  FolderOpen, 
  GitBranch, 
  Clock, 
  Activity,
  ExternalLink,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Code2
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ON_HOLD';
  lastActivity: string;
  progress: number;
  taskStats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    blocked: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  activeProjects: number;
  totalTasks: number;
  aiAssists: number;
  productivity: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    totalTasks: 0,
    aiAssists: 342,
    productivity: '+24%'
  });

  // Fetch projects from API
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/projects');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setProjects(result.data);
          
          // Calculate dashboard stats
          const activeProjects = result.data.filter((p: Project) => p.status === 'ACTIVE').length;
          const totalTasks = result.data.reduce((sum: number, p: Project) => sum + p.taskStats.total, 0);
          
          setStats(prev => ({
            ...prev,
            activeProjects,
            totalTasks
          }));
        } else {
          setError(result.error || 'Failed to fetch projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Create new project
  async function createProject() {
    try {
      const response = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Project',
          description: 'A new AI-powered development project',
          complexity: 0.5
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProjects(prev => [result.data, ...prev]);
          setStats(prev => ({
            ...prev,
            activeProjects: prev.activeProjects + 1
          }));
        }
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ARCHIVED': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'ON_HOLD': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'COMPLETED': return 'Completed';
      case 'ARCHIVED': return 'Archived';
      case 'ON_HOLD': return 'On Hold';
    }
  };

  const getAIStatusIcon = (project: Project) => {
    // Determine AI activity based on recent tasks and status
    const hasActiveTasks = project.taskStats.inProgress > 0;
    const hasRecentActivity = new Date(project.lastActivity).getTime() > Date.now() - (1000 * 60 * 30); // 30 minutes
    
    if (hasActiveTasks && hasRecentActivity) {
      return <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />;
    }
    return <Code2 className="w-3.5 h-3.5 text-gray-500" />;
  };

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your AI-powered development projects</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading projects...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
          <div className="text-red-400 text-sm">
            Error loading projects: {error}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Projects</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
            <div className="text-xs text-gray-500 mt-1">Real-time data</div>
          </div>
          
          <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Tasks</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
            <div className="text-xs text-gray-500 mt-1">
              {projects.reduce((sum, p) => sum + p.taskStats.completed, 0)} completed
            </div>
          </div>
          
          <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">AI Assists</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.aiAssists}</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>
          
          <div className="bg-[#161618] border border-[#2A2A2E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Productivity</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.productivity}</div>
            <div className="text-xs text-gray-500 mt-1">vs last month</div>
          </div>
        </div>
      )}

      {/* Projects Section */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Projects</h2>
            <button 
              onClick={createProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Project</span>
            </button>
          </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}/plan`}
            className="group relative bg-[#161618] border border-[#2A2A2E] rounded-xl p-6 hover:border-[#404040] transition-all duration-200 cursor-pointer"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <div className="flex items-center gap-1">
                      {getAIStatusIcon(project)}
                      <span className="text-xs text-gray-500">
                        {project.taskStats.inProgress > 0 ? 'AI Active' : 'AI Ready'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="p-1 hover:bg-[#1C1C1E] rounded-md transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Project Description */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-gray-300">{project.progress}%</span>
              </div>
              <div className="h-2 bg-[#0D0D0D] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Tasks</div>
                <div className="text-sm font-medium text-white">
                  {project.taskStats.completed}/{project.taskStats.total}
                </div>
                {project.taskStats.blocked > 0 && (
                  <div className="text-xs text-red-400">
                    {project.taskStats.blocked} blocked
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500">Updated</div>
                <div className="text-sm font-medium text-white">
                  {formatLastActivity(project.lastActivity)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Team</div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#161618] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">U</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 border-[#161618] flex items-center justify-center ${
                    project.taskStats.inProgress > 0 ? 'bg-emerald-500' : 'bg-emerald-600'
                  }`}>
                    <Code2 className="w-3 h-3 text-white" />
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 border-[#161618] flex items-center justify-center ${
                    project.taskStats.inProgress > 0 ? 'bg-purple-500' : 'bg-purple-600'
                  }`}>
                    <Code2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-[#2A2A2E]">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                <GitBranch className="w-3.5 h-3.5" />
                <span>View Code</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Project</span>
              </button>
            </div>

            {/* Active Indicator */}
            {project.taskStats.inProgress > 0 && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              </div>
            )}
          </Link>
        ))}

        {/* Create New Project Card */}
        <button 
          onClick={createProject}
          className="group relative bg-[#161618] border border-[#2A2A2E] border-dashed rounded-xl p-6 hover:border-[#404040] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[320px]"
        >
          <div className="w-12 h-12 rounded-lg bg-[#1C1C1E] group-hover:bg-[#2A2A2E] flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </div>
          <h3 className="font-medium text-gray-400 group-hover:text-white mb-1 transition-colors">
            Create New Project
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Start with AI-generated blueprints
          </p>
        </button>
      </div>
        </>
      )}
    </div>
  );
}