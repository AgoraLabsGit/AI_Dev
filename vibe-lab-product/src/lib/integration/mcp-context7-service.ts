/**
 * Context7 MCP Server Integration
 * Official library documentation, code examples, and best practices lookup
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseService } from '@/lib/avca/services/base-service';

const execAsync = promisify(exec);

export interface Context7Request {
  libraryName: string;
  topic?: string;
  tokens?: number;
  version?: string;
}

export interface Context7Response {
  libraryId: string;
  documentation: string;
  codeExamples: string[];
  bestPractices: string[];
  version?: string;
  confidence: number;
  sources: string[];
}

export class Context7Service extends BaseService {
  private cliCommand: string;
  private cache: Map<string, Context7Response> = new Map();
  private cacheTimeout = 3600000; // 1 hour

  constructor() {
    super({
      name: 'context7-service',
      version: '1.0.0',
      dependencies: [],
      healthCheckInterval: 60000
    });
    
    this.cliCommand = process.env.CONTEXT7_CLI_PATH || 'claude-code';
  }

  protected async initialize(): Promise<void> {
    // Verify Context7 is available
    try {
      await this.checkAvailability();
      this.log('info', 'Context7 MCP server integration initialized');
    } catch (error) {
      throw new Error(`Context7 initialization failed: ${error}`);
    }
  }

  protected async cleanup(): Promise<void> {
    this.cache.clear();
  }

  protected async healthCheck(): Promise<boolean> {
    try {
      return await this.checkAvailability();
    } catch {
      return false;
    }
  }

  /**
   * Resolve library name to Context7-compatible library ID
   */
  async resolveLibraryId(libraryName: string): Promise<string> {
    try {
      const command = `${this.cliCommand} --c7 --resolve-library-id "${libraryName}"`;
      const result = await execAsync(command, { timeout: 30000 });
      
      // Parse library ID from output
      const match = result.stdout.match(/Library ID: (.+)/);
      if (!match) {
        throw new Error(`Could not resolve library ID for ${libraryName}`);
      }
      
      return match[1].trim();
    } catch (error) {
      this.log('error', `Failed to resolve library ID for ${libraryName}:`, error);
      throw error;
    }
  }

  /**
   * Get library documentation and examples
   */
  async getLibraryDocs(request: Context7Request): Promise<Context7Response> {
    const cacheKey = `${request.libraryName}-${request.topic || 'default'}-${request.version || 'latest'}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // First resolve library ID
      const libraryId = await this.resolveLibraryId(request.libraryName);
      
      // Build command for getting documentation
      const flags = [
        '--c7',
        `--library-id="${libraryId}"`,
        `--tokens=${request.tokens || 10000}`
      ];
      
      if (request.topic) {
        flags.push(`--topic="${request.topic}"`);
      }
      
      if (request.version) {
        flags.push(`--version="${request.version}"`);
      }

      const command = `${this.cliCommand} ${flags.join(' ')}`;
      const result = await execAsync(command, { timeout: 60000 });
      
      // Parse the response
      const response = this.parseContext7Response(result.stdout, libraryId, request);
      
      // Cache the result
      this.cache.set(cacheKey, response);
      
      // Set cache timeout
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, this.cacheTimeout);
      
      return response;

    } catch (error) {
      this.log('error', `Context7 documentation lookup failed for ${request.libraryName}:`, error);
      throw error;
    }
  }

  /**
   * Search for specific patterns or implementations
   */
  async searchPatterns(
    libraryName: string, 
    pattern: string, 
    options?: { 
      examples?: boolean;
      bestPractices?: boolean;
      tokens?: number;
    }
  ): Promise<Context7Response> {
    return await this.getLibraryDocs({
      libraryName,
      topic: pattern,
      tokens: options?.tokens || 5000
    });
  }

  /**
   * Get framework-specific documentation
   */
  async getFrameworkDocs(
    framework: 'react' | 'nextjs' | 'tailwind' | 'typescript',
    topic?: string
  ): Promise<Context7Response> {
    const frameworkMap = {
      react: 'react',
      nextjs: 'vercel/next.js',
      tailwind: 'tailwindlabs/tailwindcss',
      typescript: 'microsoft/typescript'
    };

    return await this.getLibraryDocs({
      libraryName: frameworkMap[framework],
      topic,
      tokens: 8000
    });
  }

  /**
   * Parse Context7 CLI response
   */
  private parseContext7Response(
    output: string, 
    libraryId: string, 
    request: Context7Request
  ): Context7Response {
    // This is a simplified parser - in reality, Context7 would return structured data
    const lines = output.split('\n');
    
    let documentation = '';
    const codeExamples: string[] = [];
    const bestPractices: string[] = [];
    const sources: string[] = [];
    
    let currentSection = '';
    let codeBlock = '';
    let inCodeBlock = false;
    
    for (const line of lines) {
      if (line.startsWith('# Documentation')) {
        currentSection = 'docs';
        continue;
      } else if (line.startsWith('# Examples')) {
        currentSection = 'examples';
        continue;
      } else if (line.startsWith('# Best Practices')) {
        currentSection = 'practices';
        continue;
      } else if (line.startsWith('# Sources')) {
        currentSection = 'sources';
        continue;
      }
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          if (currentSection === 'examples' && codeBlock.trim()) {
            codeExamples.push(codeBlock.trim());
          }
          codeBlock = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlock += line + '\n';
        continue;
      }
      
      // Handle regular content
      switch (currentSection) {
        case 'docs':
          documentation += line + '\n';
          break;
        case 'practices':
          if (line.trim() && line.startsWith('-')) {
            bestPractices.push(line.substring(1).trim());
          }
          break;
        case 'sources':
          if (line.trim() && line.startsWith('-')) {
            sources.push(line.substring(1).trim());
          }
          break;
      }
    }
    
    return {
      libraryId,
      documentation: documentation.trim(),
      codeExamples,
      bestPractices,
      version: request.version,
      confidence: 0.9, // High confidence for Context7 responses
      sources
    };
  }

  /**
   * Check if Context7 is available
   */
  private async checkAvailability(): Promise<boolean> {
    try {
      const result = await execAsync(`${this.cliCommand} --version`, { timeout: 5000 });
      return result.stdout.includes('SuperClaude') || result.stdout.includes('claude-code');
    } catch {
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { 
    size: number; 
    keys: string[];
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.log('info', 'Context7 cache cleared');
  }
}

// Export singleton instance
export const context7Service = new Context7Service();