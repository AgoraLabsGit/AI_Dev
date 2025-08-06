/**
 * Context Manager Service
 * LRU cache and context preparation for DIAS services
 */

import { BaseService } from '@/lib/avca/services/base-service';
import { 
  ContextData, 
  CacheEntry,
  ServiceResponse, 
  DIASServiceConfig 
} from '../types';

interface LRUNode {
  key: string;
  value: CacheEntry;
  prev: LRUNode | null;
  next: LRUNode | null;
}

export class ContextManagerService extends BaseService {
  private cache: Map<string, LRUNode>;
  private head: LRUNode;
  private tail: LRUNode;
  private maxSize: number;
  private defaultTTL: number;
  private compressionThreshold: number;

  constructor(config: DIASServiceConfig) {
    super('ContextManagerService');
    
    this.maxSize = config.cache.maxSize;
    this.defaultTTL = config.cache.defaultTTL;
    this.compressionThreshold = config.cache.compressionThreshold;
    
    this.cache = new Map();
    
    // Initialize doubly linked list
    this.head = { key: '', value: {} as CacheEntry, prev: null, next: null };
    this.tail = { key: '', value: {} as CacheEntry, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Prepare context data for AI operations
   */
  async prepareContext(
    projectId: string,
    files: string[],
    includeHistory = true
  ): Promise<ServiceResponse<ContextData>> {
    const startTime = Date.now();
    const cacheKey = `context:${projectId}:${files.join(':')}`;
    
    try {
      // Check cache first
      const cached = this.get(cacheKey);
      if (cached) {
        this.log('info', `Context cache hit for project: ${projectId}`);
        return {
          success: true,
          data: cached as ContextData,
          executionTime: Date.now() - startTime,
          metadata: { cached: true }
        };
      }

      this.log('info', `Preparing context for project: ${projectId}, files: ${files.length}`);

      // Read and process files
      const code = await this.aggregateCodeFiles(files);
      const documentation = await this.aggregateDocumentation(projectId);
      const history = includeHistory ? await this.getProjectHistory(projectId) : [];
      const userPreferences = await this.getUserPreferences(projectId);

      // Create context data
      const contextData: ContextData = {
        projectId,
        files,
        code: await this.compressContent(code),
        documentation: await this.compressContent(documentation),
        history,
        userPreferences
      };

      // Cache the result
      this.put(cacheKey, contextData, this.defaultTTL);

      const executionTime = Date.now() - startTime;
      this.log('info', `Context prepared in ${executionTime}ms`);

      return {
        success: true,
        data: contextData,
        executionTime,
        metadata: { 
          cached: false,
          filesProcessed: files.length,
          codeLength: code.length,
          compressed: code.length > this.compressionThreshold
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log('error', 'Context preparation failed', error);
      
      return {
        success: false,
        error: errorMessage,
        executionTime
      };
    }
  }

  /**
   * Store data in LRU cache
   */
  put(key: string, data: any, ttl?: number): void {
    const now = Date.now();
    const expiresAt = ttl ? now + ttl : now + this.defaultTTL;
    const compressed = this.shouldCompress(data);
    
    const entry: CacheEntry = {
      key,
      data: compressed ? this.compress(data) : data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      compressed
    };

    if (this.cache.has(key)) {
      // Update existing entry
      const node = this.cache.get(key)!;
      node.value = entry;
      this.moveToHead(node);
    } else {
      // Add new entry
      const newNode: LRUNode = {
        key,
        value: entry,
        prev: null,
        next: null
      };
      
      this.cache.set(key, newNode);
      this.addToHead(newNode);
      
      if (this.cache.size > this.maxSize) {
        this.removeLRU();
      }
    }

    this.logger.debug(`Cached entry: ${key}, compressed: ${compressed}`);
  }

  /**
   * Retrieve data from LRU cache
   */
  get(key: string): any | null {
    const node = this.cache.get(key);
    
    if (!node) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now > node.value.timestamp + node.value.ttl) {
      this.remove(key);
      return null;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    
    // Decompress if needed
    const data = node.value.compressed ? 
      this.decompress(node.value.data) : 
      node.value.data;

    this.logger.debug(`Cache hit: ${key}`);
    return data;
  }

  /**
   * Remove entry from cache
   */
  remove(key: string): void {
    const node = this.cache.get(key);
    if (node) {
      this.cache.delete(key);
      this.removeNode(node);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{key: string; timestamp: number; compressed: boolean}>;
  } {
    const entries = Array.from(this.cache.values()).map(node => ({
      key: node.key,
      timestamp: node.value.timestamp,
      compressed: node.value.compressed
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for real implementation
      entries
    };
  }

  /**
   * LRU operations
   */
  private addToHead(node: LRUNode): void {
    node.prev = this.head;
    node.next = this.head.next;
    
    if (this.head.next) {
      this.head.next.prev = node;
    }
    this.head.next = node;
  }

  private removeNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
  }

  private moveToHead(node: LRUNode): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeLRU(): void {
    const last = this.tail.prev;
    if (last && last !== this.head) {
      this.cache.delete(last.key);
      this.removeNode(last);
    }
  }

  /**
   * Content processing methods
   */
  private async aggregateCodeFiles(files: string[]): Promise<string> {
    // In a real implementation, this would read the actual files
    return files.map(file => `// File: ${file}\n// Content would be read here`).join('\n\n');
  }

  private async aggregateDocumentation(projectId: string): Promise<string> {
    // In a real implementation, this would gather project documentation
    return `Documentation for project: ${projectId}`;
  }

  private async getProjectHistory(projectId: string): Promise<string[]> {
    // In a real implementation, this would get git history or project logs
    return [`Previous action for ${projectId}`];
  }

  private async getUserPreferences(projectId: string): Promise<Record<string, any>> {
    // In a real implementation, this would get user preferences from database
    return { theme: 'dark', language: 'typescript' };
  }

  /**
   * Content compression using LLM-based summarization
   * This replaces the previously failed compression algorithm
   */
  private async compressContent(content: string): Promise<string> {
    if (!this.shouldCompress({ content })) {
      return content;
    }

    try {
      // This would use an LLM-based summarization approach
      // For now, we'll use a simple truncation with key preservation
      const lines = content.split('\n');
      
      if (lines.length <= 100) {
        return content;
      }

      // Keep first 50 lines, last 50 lines, and key sections
      const keyLines = this.extractKeyLines(lines);
      const firstLines = lines.slice(0, 50);
      const lastLines = lines.slice(-50);
      
      const compressed = [
        ...firstLines,
        '// ... (content summarized) ...',
        ...keyLines,
        '// ... (content summarized) ...',
        ...lastLines
      ].join('\n');

      this.log('info', `Compressed content from ${lines.length} to ${compressed.split('\n').length} lines`);
      return compressed;

    } catch (error) {
      this.log('warn', 'Content compression failed, returning original', error);
      return content;
    }
  }

  private extractKeyLines(lines: string[]): string[] {
    const keyPatterns = [
      /^(export|import|class|interface|function|const|let|var)\s+/,
      /^\/\*\*.*\*\//,  // JSDoc comments
      /^\/\/\s*(TODO|FIXME|NOTE|WARNING):/,
      /^(if|for|while|switch|try|catch)\s*\(/
    ];

    return lines.filter(line => 
      keyPatterns.some(pattern => pattern.test(line.trim()))
    ).slice(0, 20); // Limit to 20 key lines
  }

  private shouldCompress(data: any): boolean {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return dataStr.length > this.compressionThreshold;
  }

  private compress(data: any): string {
    // Simple compression - in production, use proper compression library
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return Buffer.from(str).toString('base64');
  }

  private decompress(compressedData: string): any {
    try {
      const str = Buffer.from(compressedData, 'base64').toString('utf8');
      try {
        return JSON.parse(str);
      } catch {
        return str;
      }
    } catch (error) {
      this.log('error', 'Decompression failed', error);
      return compressedData;
    }
  }
}