import { AIRole } from './ai-client';
import { encode } from '@dqbd/tiktoken';
import { createHash } from 'crypto';

export interface ProjectContext {
  projectId: string;
  projectName: string;
  description?: string;
  techStack?: string[];
  currentPhase?: string;
  recentChanges?: string[];
}

export interface ContextWindow {
  role: AIRole;
  content: string;
  tokens: number;
  metadata: Record<string, any>;
  compressed?: boolean;
  cachedAt?: number;
}

export interface ContextSection {
  priority: 'critical' | 'high' | 'medium' | 'low';
  content: string;
  tokens: number;
  compressible: boolean;
}

export interface CacheOptions {
  ttlMs?: number;  // Time to live in milliseconds
  maxSize?: number; // Max cache entries
}

export class ContextManager {
  private static readonly MAX_CONTEXT_TOKENS = {
    [AIRole.DEVELOPER]: 150000,  // Full context for development
    [AIRole.AUDITOR]: 50000,     // Limited context for fresh perspective
    [AIRole.ROUTER]: 5000        // Minimal context for routing
  };

  private static readonly DEFAULT_CACHE_OPTIONS: CacheOptions = {
    ttlMs: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
  };

  // LRU Cache implementation
  private contextCache: Map<string, ContextWindow> = new Map();
  private cacheAccessOrder: string[] = [];
  private cacheOptions: CacheOptions;

  // Token encoder (using cl100k_base encoding for Claude models)
  private encoder: any;

  constructor(cacheOptions?: CacheOptions) {
    this.cacheOptions = { 
      ...ContextManager.DEFAULT_CACHE_OPTIONS, 
      ...cacheOptions 
    };
    this.initializeEncoder();
  }

  private async initializeEncoder() {
    try {
      // Initialize tiktoken encoder for accurate token counting
      const { encoding_for_model } = await import('@dqbd/tiktoken');
      this.encoder = encoding_for_model('gpt-4'); // cl100k_base encoding
    } catch (error) {
      console.warn('Failed to initialize tiktoken, falling back to estimation', error);
    }
  }

  /**
   * Prepare context based on AI role with caching
   */
  prepareContext(
    role: AIRole,
    projectContext: ProjectContext,
    additionalContext?: string
  ): string {
    // Generate cache key
    const cacheKey = this.generateCacheKey(role, projectContext, additionalContext);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached.content;
    }

    const maxTokens = ContextManager.MAX_CONTEXT_TOKENS[role];
    let context: string;
    
    switch (role) {
      case AIRole.DEVELOPER:
        context = this.prepareDeveloperContext(projectContext, additionalContext, maxTokens);
        break;
      
      case AIRole.AUDITOR:
        context = this.prepareAuditorContext(projectContext, additionalContext, maxTokens);
        break;
      
      case AIRole.ROUTER:
        context = this.prepareRouterContext(projectContext, additionalContext, maxTokens);
        break;
      
      default:
        throw new Error(`Unknown AI role: ${role}`);
    }

    // Cache the prepared context
    this.addToCache(cacheKey, {
      role,
      content: context,
      tokens: this.countTokens(context),
      metadata: { projectId: projectContext.projectId },
      cachedAt: Date.now()
    });

    return context;
  }

  /**
   * Developer gets full project context with sliding window
   */
  private prepareDeveloperContext(
    projectContext: ProjectContext,
    additionalContext: string | undefined,
    maxTokens: number
  ): string {
    const sections: ContextSection[] = [];

    // Critical sections (always included)
    sections.push({
      priority: 'critical',
      content: `# Project: ${projectContext.projectName}`,
      tokens: 0,
      compressible: false
    });

    if (projectContext.description) {
      sections.push({
        priority: 'critical',
        content: `Description: ${projectContext.description}`,
        tokens: 0,
        compressible: true
      });
    }

    // High priority sections
    if (projectContext.techStack?.length) {
      sections.push({
        priority: 'high',
        content: `\n## Tech Stack\n${projectContext.techStack.map(tech => `- ${tech}`).join('\n')}`,
        tokens: 0,
        compressible: false
      });
    }

    if (projectContext.currentPhase) {
      sections.push({
        priority: 'high',
        content: `\n## Current Phase: ${projectContext.currentPhase}`,
        tokens: 0,
        compressible: false
      });
    }

    // Medium priority sections
    if (projectContext.recentChanges?.length) {
      const changes = projectContext.recentChanges.slice(0, 10); // Limit recent changes
      sections.push({
        priority: 'medium',
        content: `\n## Recent Changes\n${changes.map(change => `- ${change}`).join('\n')}`,
        tokens: 0,
        compressible: true
      });
    }

    // Additional context (variable priority)
    if (additionalContext) {
      sections.push({
        priority: 'high',
        content: `\n## Additional Context\n${additionalContext}`,
        tokens: 0,
        compressible: this.isCompressible(additionalContext)
      });
    }

    // Calculate tokens for each section
    sections.forEach(section => {
      section.tokens = this.countTokens(section.content);
    });

    // Build context with sliding window
    return this.buildContextWithSlidingWindow(sections, maxTokens);
  }

  /**
   * Auditor gets isolated context without implementation details
   */
  private prepareAuditorContext(
    projectContext: ProjectContext,
    additionalContext: string | undefined,
    maxTokens: number
  ): string {
    const sections: string[] = [];

    // Minimal project info
    sections.push(`# Code Review Context`);
    sections.push(`Project: ${projectContext.projectName}`);
    
    // Tech stack for standards
    if (projectContext.techStack?.length) {
      sections.push(`\nTech Stack: ${projectContext.techStack.join(', ')}`);
    }

    // Focus only on code to review
    if (additionalContext) {
      sections.push(`\n## Code to Review`);
      sections.push(additionalContext);
    }

    sections.push(`\n## Review Guidelines`);
    sections.push(`- Focus on code quality, security, and best practices`);
    sections.push(`- Provide unbiased feedback`);
    sections.push(`- Suggest improvements where applicable`);

    const context = sections.join('\n');
    return this.truncateToTokenLimit(context, maxTokens);
  }

  /**
   * Router gets minimal context for classification
   */
  private prepareRouterContext(
    projectContext: ProjectContext,
    additionalContext: string | undefined,
    maxTokens: number
  ): string {
    const sections: string[] = [];

    sections.push(`# Intent Classification Context`);
    sections.push(`Project Type: ${this.classifyProjectType(projectContext)}`);
    
    if (additionalContext) {
      sections.push(`\nUser Message: ${additionalContext}`);
    }

    sections.push(`\nClassify the intent and determine routing.`);

    const context = sections.join('\n');
    return this.truncateToTokenLimit(context, maxTokens);
  }

  /**
   * Classify project type for router context
   */
  private classifyProjectType(projectContext: ProjectContext): string {
    const techStack = projectContext.techStack || [];
    
    if (techStack.includes('Next.js') || techStack.includes('React')) {
      return 'Web Application';
    } else if (techStack.includes('React Native')) {
      return 'Mobile Application';
    } else if (techStack.includes('Node.js')) {
      return 'Backend Service';
    }
    
    return 'Software Project';
  }

  /**
   * Truncate context to token limit
   * TODO: Implement proper token counting with tiktoken
   */
  private truncateToTokenLimit(context: string, maxTokens: number): string {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedTokens = context.length / 4;
    
    if (estimatedTokens <= maxTokens) {
      return context;
    }

    // Truncate from the middle to preserve start and end
    const maxChars = maxTokens * 4;
    const halfMax = Math.floor(maxChars / 2);
    
    return (
      context.substring(0, halfMax) +
      '\n\n... [context truncated] ...\n\n' +
      context.substring(context.length - halfMax)
    );
  }

  /**
   * Build context respecting token limit using sliding window
   */
  private buildContextWithSlidingWindow(
    sections: ContextSection[],
    maxTokens: number
  ): string {
    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    sections.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    let currentTokens = 0;
    const includedSections: string[] = [];
    const compressedSections: string[] = [];

    // First pass: Include critical and high priority sections
    for (const section of sections) {
      if (section.priority === 'critical' || section.priority === 'high') {
        if (currentTokens + section.tokens <= maxTokens) {
          includedSections.push(section.content);
          currentTokens += section.tokens;
        } else if (section.compressible) {
          // Compress if needed
          const compressed = this.compressContent(section.content);
          const compressedTokens = this.countTokens(compressed);
          if (currentTokens + compressedTokens <= maxTokens) {
            compressedSections.push(compressed);
            currentTokens += compressedTokens;
          }
        }
      }
    }

    // Second pass: Add medium/low priority if space available
    for (const section of sections) {
      if (section.priority === 'medium' || section.priority === 'low') {
        if (currentTokens + section.tokens <= maxTokens * 0.9) { // Leave 10% buffer
          includedSections.push(section.content);
          currentTokens += section.tokens;
        }
      }
    }

    // Combine sections
    const allSections = [...includedSections];
    if (compressedSections.length > 0) {
      allSections.push('\n## Compressed Context');
      allSections.push(...compressedSections);
    }

    return allSections.join('\n');
  }

  /**
   * Compress content to save tokens
   */
  private compressContent(content: string): string {
    // Remove extra whitespace
    let compressed = content.replace(/\s+/g, ' ').trim();
    
    // Remove comments
    compressed = compressed.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    
    // Summarize if still too long
    if (compressed.length > 1000) {
      const lines = compressed.split('\n');
      const summary = lines.slice(0, 5).join('\n');
      compressed = `${summary}\n... [${lines.length - 5} more lines]`;
    }
    
    return compressed;
  }

  /**
   * Check if content is compressible
   */
  private isCompressible(content: string): boolean {
    // Don't compress short content
    if (content.length < 500) return false;
    
    // Don't compress code blocks
    if (content.includes('```')) return false;
    
    // Compress long text blocks
    return true;
  }

  /**
   * Accurate token counting using tiktoken
   */
  private countTokens(text: string): number {
    if (this.encoder) {
      try {
        const tokens = this.encoder.encode(text);
        return tokens.length;
      } catch (error) {
        console.warn('Token counting failed, using estimation', error);
      }
    }
    
    // Fallback: rough estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate cache key for context
   */
  private generateCacheKey(
    role: AIRole,
    projectContext: ProjectContext,
    additionalContext?: string
  ): string {
    const keyParts = [
      role,
      projectContext.projectId,
      projectContext.currentPhase || '',
      additionalContext ? createHash('md5').update(additionalContext).digest('hex').substring(0, 8) : ''
    ];
    
    return keyParts.filter(Boolean).join(':');
  }

  /**
   * Get context from cache if valid
   */
  private getFromCache(key: string): ContextWindow | null {
    const cached = this.contextCache.get(key);
    
    if (!cached) return null;
    
    // Check TTL
    if (cached.cachedAt && this.cacheOptions.ttlMs) {
      const age = Date.now() - cached.cachedAt;
      if (age > this.cacheOptions.ttlMs) {
        this.contextCache.delete(key);
        return null;
      }
    }
    
    // Update LRU order
    this.updateCacheAccess(key);
    
    return cached;
  }

  /**
   * Add context to cache with LRU eviction
   */
  private addToCache(key: string, context: ContextWindow): void {
    // Check cache size limit
    if (this.cacheOptions.maxSize && this.contextCache.size >= this.cacheOptions.maxSize) {
      // Evict least recently used
      const lruKey = this.cacheAccessOrder.shift();
      if (lruKey) {
        this.contextCache.delete(lruKey);
      }
    }
    
    this.contextCache.set(key, context);
    this.updateCacheAccess(key);
  }

  /**
   * Update cache access order for LRU
   */
  private updateCacheAccess(key: string): void {
    const index = this.cacheAccessOrder.indexOf(key);
    if (index > -1) {
      this.cacheAccessOrder.splice(index, 1);
    }
    this.cacheAccessOrder.push(key);
  }

  /**
   * Get context statistics
   */
  getContextStats(): {
    cacheSize: number;
    cacheHitRate: number;
    averageTokens: Record<AIRole, number>;
  } {
    const stats = {
      cacheSize: this.contextCache.size,
      cacheHitRate: 0, // TODO: Track hits/misses
      averageTokens: {} as Record<AIRole, number>
    };
    
    // Calculate average tokens per role
    const tokensByRole: Record<string, number[]> = {};
    
    this.contextCache.forEach((context) => {
      if (!tokensByRole[context.role]) {
        tokensByRole[context.role] = [];
      }
      tokensByRole[context.role].push(context.tokens);
    });
    
    Object.entries(tokensByRole).forEach(([role, tokens]) => {
      stats.averageTokens[role as AIRole] = 
        tokens.reduce((a, b) => a + b, 0) / tokens.length;
    });
    
    return stats;
  }

  /**
   * Clear context cache
   */
  clearCache(): void {
    this.contextCache.clear();
    this.cacheAccessOrder = [];
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.contextCache.size;
  }
} 