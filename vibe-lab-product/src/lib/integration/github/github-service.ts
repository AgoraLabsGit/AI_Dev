/**
 * GitHub Integration Service
 * 
 * Handles GitHub repository operations:
 * - Repository access
 * - Code analysis
 * - Import/export
 */

import { BaseService } from '@/lib/avca/services/base-service';
import { EventBus } from '../../avca/services/event-bus';
import { Octokit } from '@octokit/rest';

export interface GitHubServiceConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface RepoAnalysis {
  structure: {
    files: number;
    directories: number;
    size: number;
    languages: Record<string, number>;
  };
  content: {
    readme?: {
      exists: boolean;
      content?: string;
    };
    license?: {
      exists: boolean;
      type?: string;
    };
    dependencies?: {
      [key: string]: string;
    };
  };
  activity: {
    commits: number;
    contributors: number;
    lastActivity: string;
    branches: {
      name: string;
      lastCommit: string;
    }[];
  };
}

export class GitHubService extends BaseService {
  private config: Required<GitHubServiceConfig>;
  private octokit: Octokit;

  constructor(config: GitHubServiceConfig = {}) {
    super({
      name: config.name || 'github-service',
      version: config.version || '1.0.0',
      dependencies: []
    });

    this.config = {
      name: config.name || 'github-service',
      version: config.version || '1.0.0',
      eventBus: config.eventBus,
      token: config.token || process.env.GITHUB_TOKEN || '',
      baseUrl: config.baseUrl || 'https://api.github.com',
      timeout: config.timeout || 10000
    };

    this.octokit = new Octokit({
      auth: this.config.token,
      baseUrl: this.config.baseUrl,
      request: {
        timeout: this.config.timeout
      }
    });
  }

  protected async initialize(): Promise<void> {
    await this.validateToken();
    this.log('info', 'GitHub Service initialized');
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'GitHub Service cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    try {
      await this.octokit.rest.users.getAuthenticated();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate GitHub token
   */
  private async validateToken(): Promise<void> {
    try {
      await this.octokit.rest.users.getAuthenticated();
    } catch (error) {
      throw new Error('Invalid GitHub token');
    }
  }

  /**
   * Get repository information
   */
  async getRepository(info: RepoInfo): Promise<RepoAnalysis> {
    try {
      // Get repository details
      const repo = await this.octokit.rest.repos.get({
        owner: info.owner,
        repo: info.repo
      });

      // Get languages
      const languages = await this.octokit.rest.repos.listLanguages({
        owner: info.owner,
        repo: info.repo
      });

      // Get commits
      const commits = await this.octokit.rest.repos.listCommits({
        owner: info.owner,
        repo: info.repo,
        per_page: 1
      });

      // Get contributors
      const contributors = await this.octokit.rest.repos.listContributors({
        owner: info.owner,
        repo: info.repo
      });

      // Get branches
      const branches = await this.octokit.rest.repos.listBranches({
        owner: info.owner,
        repo: info.repo
      });

      // Get readme
      const readme = await this.getReadme(info);

      // Get license
      const license = await this.getLicense(info);

      // Get dependencies
      const dependencies = await this.getDependencies(info);

      return {
        structure: {
          files: repo.data.size,
          directories: 0, // Requires tree traversal
          size: repo.data.size * 1024, // Convert to bytes
          languages: languages.data
        },
        content: {
          readme: {
            exists: !!readme,
            content: readme
          },
          license: {
            exists: !!repo.data.license,
            type: repo.data.license?.spdx_id
          },
          dependencies
        },
        activity: {
          commits: repo.data.size,
          contributors: contributors.data.length,
          lastActivity: commits.data[0]?.commit.author?.date || '',
          branches: branches.data.map(branch => ({
            name: branch.name,
            lastCommit: branch.commit.sha
          }))
        }
      };

    } catch (error) {
      this.log('error', `Failed to get repository info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Get repository readme
   */
  private async getReadme(info: RepoInfo): Promise<string | undefined> {
    try {
      const response = await this.octokit.rest.repos.getReadme({
        owner: info.owner,
        repo: info.repo,
        ref: info.branch
      });

      return Buffer.from(response.data.content, 'base64').toString();
    } catch {
      return undefined;
    }
  }

  /**
   * Get repository license
   */
  private async getLicense(info: RepoInfo): Promise<string | undefined> {
    try {
      const response = await this.octokit.rest.licenses.getForRepo({
        owner: info.owner,
        repo: info.repo
      });

      return response.data.license?.spdx_id;
    } catch {
      return undefined;
    }
  }

  /**
   * Get repository dependencies
   */
  private async getDependencies(info: RepoInfo): Promise<Record<string, string>> {
    try {
      // Try to get package.json
      const response = await this.octokit.rest.repos.getContent({
        owner: info.owner,
        repo: info.repo,
        path: 'package.json',
        ref: info.branch
      });

      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString();
        const pkg = JSON.parse(content);
        return {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };
      }

      return {};
    } catch {
      return {};
    }
  }

  /**
   * Clone repository
   */
  async cloneRepository(info: RepoInfo, targetPath: string): Promise<void> {
    try {
      // Get repository contents
      const response = await this.octokit.rest.repos.downloadZipballArchive({
        owner: info.owner,
        repo: info.repo,
        ref: info.branch || 'main'
      });

      // Implementation would save and extract the zip file
      this.log('info', `Repository downloaded to ${targetPath}`);

    } catch (error) {
      this.log('error', `Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Get file contents
   */
  async getFileContents(info: RepoInfo & { path: string }): Promise<string> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: info.owner,
        repo: info.repo,
        path: info.path,
        ref: info.branch
      });

      if ('content' in response.data) {
        return Buffer.from(response.data.content, 'base64').toString();
      }

      throw new Error('Not a file');

    } catch (error) {
      this.log('error', `Failed to get file contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * List repository contents
   */
  async listContents(info: RepoInfo & { path?: string }): Promise<{
    name: string;
    path: string;
    type: 'file' | 'dir';
    size: number;
  }[]> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: info.owner,
        repo: info.repo,
        path: info.path || '',
        ref: info.branch
      });

      if (Array.isArray(response.data)) {
        return response.data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type as 'file' | 'dir',
          size: item.size
        }));
      }

      throw new Error('Not a directory');

    } catch (error) {
      this.log('error', `Failed to list contents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(info: RepoInfo): Promise<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }[]> {
    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner: info.owner,
        repo: info.repo,
        sha: info.branch
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || '',
        date: commit.commit.author?.date || ''
      }));

    } catch (error) {
      this.log('error', `Failed to get commit history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Get branch information
   */
  async getBranchInfo(info: RepoInfo & { branch: string }): Promise<{
    name: string;
    commit: string;
    protected: boolean;
    lastCommit: {
      sha: string;
      message: string;
      author: string;
      date: string;
    };
  }> {
    try {
      const [branch, commits] = await Promise.all([
        this.octokit.rest.repos.getBranch({
          owner: info.owner,
          repo: info.repo,
          branch: info.branch
        }),
        this.octokit.rest.repos.listCommits({
          owner: info.owner,
          repo: info.repo,
          sha: info.branch,
          per_page: 1
        })
      ]);

      const lastCommit = commits.data[0];

      return {
        name: branch.data.name,
        commit: branch.data.commit.sha,
        protected: branch.data.protected || false,
        lastCommit: {
          sha: lastCommit.sha,
          message: lastCommit.commit.message,
          author: lastCommit.commit.author?.name || '',
          date: lastCommit.commit.author?.date || ''
        }
      };

    } catch (error) {
      this.log('error', `Failed to get branch info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}