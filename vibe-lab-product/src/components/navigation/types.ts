export type NavigationMode = 'main' | 'directory';

export interface NavItem {
  id: string;
  label: string;
  icon: any; // LucideIcon type
  href: string;
  description?: string;
  badge?: string;
  count?: number;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: any; // LucideIcon type
  items: NavItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'archived' | 'migrating';
  lastAccessed?: string;
  progress?: number;
  componentCount?: number;
  githubRepo?: string;
  stage0Complete?: boolean;
}

export interface AgentStatus {
  id: 'developer' | 'auditor';
  name: string;
  status: 'active' | 'idle' | 'thinking' | 'blocked';
  currentTask?: string;
  lastActivity?: string;
  confidence?: number;
}

export interface RepositoryFile {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  language?: string;
  children?: RepositoryFile[];
}

export interface ComponentMetadata {
  id: string;
  name: string;
  type: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  dependencies: string[];
  usageCount?: number;
  lastUpdated?: string;
}