'use client';

import { useState, useEffect } from 'react';
import { 
  Github, 
  GitBranch, 
  Star, 
  GitFork, 
  FileText, 
  Calendar,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Check,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  url: string;
  defaultBranch: string;
  size: number;
  hasIssues: boolean;
  topics: string[];
}

interface GitHubConnectorProps {
  onRepositorySelect?: (repo: Repository) => void;
  selectedRepository?: Repository | null;
}

// Mock GitHub repositories - will be fetched from GitHub API
const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'vibe-lab-v1',
    fullName: 'user/vibe-lab-v1',
    description: 'Modern web application built with Next.js and TypeScript',
    private: false,
    stars: 24,
    forks: 5,
    language: 'TypeScript',
    lastUpdated: '2025-01-27T10:30:00Z',
    url: 'https://github.com/user/vibe-lab-v1',
    defaultBranch: 'main',
    size: 1024,
    hasIssues: true,
    topics: ['nextjs', 'typescript', 'react', 'tailwind']
  },
  {
    id: '2',
    name: 'ecommerce-dashboard',
    fullName: 'user/ecommerce-dashboard',
    description: 'E-commerce analytics dashboard with real-time metrics',
    private: true,
    stars: 12,
    forks: 2,
    language: 'JavaScript',
    lastUpdated: '2025-01-25T15:45:00Z', 
    url: 'https://github.com/user/ecommerce-dashboard',
    defaultBranch: 'main',
    size: 2048,
    hasIssues: false,
    topics: ['react', 'dashboard', 'analytics']
  },
  {
    id: '3',
    name: 'legacy-php-app',
    fullName: 'user/legacy-php-app',
    description: 'Legacy PHP application ready for modernization',
    private: false,
    stars: 3,
    forks: 1,
    language: 'PHP',
    lastUpdated: '2024-12-15T09:15:00Z',
    url: 'https://github.com/user/legacy-php-app',
    defaultBranch: 'master',
    size: 5120,
    hasIssues: true,
    topics: ['php', 'legacy', 'migration']
  }
];

export default function GitHubConnector({ onRepositorySelect, selectedRepository }: GitHubConnectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>(mockRepositories);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Simulate connected state
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');

  const languages = [...new Set(repositories.map(repo => repo.language))];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} KB`;
    return `${(bytes / 1024).toFixed(1)} MB`;
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-green-500',
      'PHP': 'bg-purple-500',
      'Java': 'bg-orange-500',
      'Go': 'bg-cyan-500'
    };
    return colors[language] || 'bg-gray-500';
  };

  const filteredAndSortedRepos = repositories
    .filter(repo => {
      const matchesSearch = searchQuery === '' || 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;
      
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

  const handleConnect = async () => {
    setIsLoading(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRepositories([...mockRepositories]);
      setIsLoading(false);
    }, 1000);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-6">
          <Github className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-xl font-medium text-white mb-2">Connect to GitHub</h3>
        <p className="text-gray-400 mb-6 max-w-md">
          Connect your GitHub account to import and analyze existing repositories for migration to Vibe Lab.
        </p>
        
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Github className="w-5 h-5" />
              Connect GitHub Account
            </>
          )}
        </button>
        
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>OAuth integration will redirect to GitHub for authorization</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-[#2A2A2E]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">GitHub Repositories</h2>
            <p className="text-gray-400 text-sm">Select a repository to analyze and import</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Connected</span>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh repositories"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Language Filter */}
          <div className="relative">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-[#1C1C1E] border border-[#2A2A2E] rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="stars">Most Stars</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repository List */}
      <div className="flex-1 p-6 overflow-y-auto">
        {filteredAndSortedRepos.length > 0 ? (
          <div className="grid gap-4">
            {filteredAndSortedRepos.map((repo) => (
              <div
                key={repo.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-blue-500/50 ${
                  selectedRepository?.id === repo.id
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-[#2A2A2E] bg-[#1A1A1C] hover:bg-[#1C1C1E]'
                }`}
                onClick={() => onRepositorySelect?.(repo)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">{repo.name}</h3>
                      {repo.private && (
                        <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">
                          Private
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {repo.description || 'No description available'}
                    </p>
                    
                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {repo.topics.slice(0, 3).map(topic => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                        {repo.topics.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded">
                            +{repo.topics.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                    title="Open in GitHub"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    {/* Language */}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                      <span>{repo.language}</span>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{repo.stars}</span>
                    </div>
                    
                    {/* Forks */}
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      <span>{repo.forks}</span>
                    </div>
                    
                    {/* Size */}
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{formatSize(repo.size)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(repo.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Github className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No repositories found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || languageFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first repository on GitHub'
              }
            </p>
            {searchQuery || languageFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLanguageFilter('all');
                }}
                className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            ) : (
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Github className="w-4 h-4" />
                Create Repository
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}