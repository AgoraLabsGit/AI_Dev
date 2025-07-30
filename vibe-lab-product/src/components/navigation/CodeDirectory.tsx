'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Folder, 
  File, 
  FileCode, 
  FileText, 
  Image, 
  Settings,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  RefreshCw,
  GitBranch,
  Clock
} from 'lucide-react';
import { RepositoryFile } from './types';

interface CodeDirectoryProps {
  projectId?: string;
  onFileSelect?: (file: RepositoryFile) => void;
}

// Mock directory structure - will be fetched from GitHub API
const mockDirectoryStructure: RepositoryFile[] = [
  {
    path: 'src',
    type: 'directory',
    children: [
      {
        path: 'src/components',
        type: 'directory',
        children: [
          {
            path: 'src/components/ui',
            type: 'directory',
            children: [
              { path: 'src/components/ui/Button.tsx', type: 'file', size: 2456, language: 'typescript' },
              { path: 'src/components/ui/Card.tsx', type: 'file', size: 1834, language: 'typescript' },
              { path: 'src/components/ui/Modal.tsx', type: 'file', size: 3721, language: 'typescript' }
            ]
          },
          {
            path: 'src/components/navigation',
            type: 'directory',
            children: [
              { path: 'src/components/navigation/MainSidebar.tsx', type: 'file', size: 5432, language: 'typescript' },
              { path: 'src/components/navigation/MenuSwitcher.tsx', type: 'file', size: 2156, language: 'typescript' }
            ]
          }
        ]
      },
      {
        path: 'src/pages',
        type: 'directory',
        children: [
          { path: 'src/pages/dashboard.tsx', type: 'file', size: 4567, language: 'typescript' },
          { path: 'src/pages/design.tsx', type: 'file', size: 3892, language: 'typescript' }
        ]
      }
    ]
  },
  {
    path: 'generated', 
    type: 'directory',
    children: [
      {
        path: 'generated/components',
        type: 'directory',
        children: [
          { path: 'generated/components/HeaderComponent.tsx', type: 'file', size: 2134, language: 'typescript' },
          { path: 'generated/components/FooterComponent.tsx', type: 'file', size: 1567, language: 'typescript' }
        ]
      }
    ]
  },
  {
    path: 'registry',
    type: 'directory', 
    children: [
      { path: 'registry/components.json', type: 'file', size: 8765, language: 'json' },
      { path: 'registry/patterns.json', type: 'file', size: 4321, language: 'json' }
    ]
  },
  {
    path: 'blueprints',
    type: 'directory',
    children: [
      { path: 'blueprints/project-requirements.md', type: 'file', size: 5678, language: 'markdown' },
      { path: 'blueprints/technical-specs.md', type: 'file', size: 3456, language: 'markdown' }
    ]
  },
  {
    path: 'assets',
    type: 'directory',
    children: [
      { path: 'assets/logo.svg', type: 'file', size: 1234, language: 'svg' },
      { path: 'assets/styles.css', type: 'file', size: 2345, language: 'css' }
    ]
  }
];

export default function CodeDirectory({ projectId, onFileSelect }: CodeDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'components' | 'generated' | 'assets'>('all');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['src', 'src/components']));
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (file: RepositoryFile) => {
    if (file.type === 'directory') {
      return expandedPaths.has(file.path) ? FolderOpen : Folder;
    }

    const extension = file.path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'jsx':
      case 'js':
        return FileCode;
      case 'md':
      case 'txt':
        return FileText;
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
        return Image;
      case 'json':
        return Settings;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const toggleExpanded = (path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const filterFiles = (files: RepositoryFile[]): RepositoryFile[] => {
    return files.filter(file => {
      // Search filter
      if (searchQuery && !file.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'components' && !file.path.includes('component')) return false;
        if (filterType === 'generated' && !file.path.includes('generated')) return false;
        if (filterType === 'assets' && !file.path.includes('assets')) return false;
      }

      return true;
    }).map(file => ({
      ...file,
      children: file.children ? filterFiles(file.children) : undefined
    }));
  };

  const renderFile = (file: RepositoryFile, depth = 0) => {
    const Icon = getFileIcon(file);
    const isExpanded = expandedPaths.has(file.path);
    const hasChildren = file.children && file.children.length > 0;
    const filteredChildren = file.children ? filterFiles(file.children) : [];

    return (
      <div key={file.path}>
        <div 
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-[#1C1C1E] transition-colors group`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (file.type === 'directory') {
              toggleExpanded(file.path);
            } else {
              onFileSelect?.(file);
            }
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(file.path);
              }}
              className="p-0.5 hover:bg-gray-600/50 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-4" />}
          
          <Icon className={`w-4 h-4 ${
            file.type === 'directory' 
              ? 'text-blue-400' 
              : file.language === 'typescript' 
                ? 'text-blue-500'
                : file.language === 'json'
                  ? 'text-yellow-500'
                  : 'text-gray-400'
          }`} />
          
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="text-sm text-gray-200 truncate">
              {file.path.split('/').pop()}
            </span>
            
            {file.size && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                {file.lastModified && (
                  <Clock className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && filteredChildren.map(child => 
          renderFile(child, depth + 1)
        )}
      </div>
    );
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const filteredStructure = filterFiles(mockDirectoryStructure);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2E]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white">Code Directory</h3>
            <p className="text-xs text-gray-400">Project file explorer</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh directory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#1C1C1E] border border-[#2A2A2E] rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-[#1C1C1E] border border-[#2A2A2E] rounded-md text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Files</option>
            <option value="components">Components</option>
            <option value="generated">Generated</option>
            <option value="assets">Assets</option>
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 p-2 overflow-y-auto">
        {filteredStructure.length > 0 ? (
          <div className="space-y-0.5">
            {filteredStructure.map(file => renderFile(file))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderOpen className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">No files found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2A2A2E] bg-[#1A1A1C]">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <GitBranch className="w-3 h-3" />
          <span>main branch</span>
          <span className="text-gray-600">•</span>
          <span>{filteredStructure.length} items</span>
        </div>
      </div>
    </div>
  );
}