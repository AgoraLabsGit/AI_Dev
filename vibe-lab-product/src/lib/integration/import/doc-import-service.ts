/**
 * Documentation Import Service
 * 
 * Handles documentation import:
 * - Format detection
 * - Content parsing
 * - Structure analysis
 */

import { BaseService } from '../../avca/services/base-service';
import { EventBus } from '../../avca/services/event-bus';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface DocImportConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  importDir?: string;
  maxFileSize?: number;
  allowedFormats?: string[];
}

export interface ImportedDoc {
  id: string;
  name: string;
  path: string;
  format: string;
  size: number;
  hash: string;
  timestamp: number;
  structure: {
    sections: {
      title: string;
      level: number;
      content: string;
    }[];
    links: {
      internal: string[];
      external: string[];
    };
    codeBlocks: {
      language: string;
      content: string;
    }[];
  };
}

export interface ImportResult {
  success: boolean;
  doc?: ImportedDoc;
  error?: string;
  validationResults?: {
    passed: boolean;
    issues: string[];
  };
}

export interface ProcessingResult {
  success: boolean;
  docs: ImportedDoc[];
  analysis: {
    format: string;
    structure: {
      depth: number;
      sections: number;
      links: number;
      codeBlocks: number;
    };
    quality: {
      score: number;
      issues: string[];
    };
  };
}

export class DocImportService extends BaseService {
  private config: Required<DocImportConfig>;
  private imports: Map<string, ImportedDoc> = new Map();

  constructor(config: DocImportConfig = {}) {
    super({
      name: config.name || 'doc-import-service',
      version: config.version || '1.0.0',
      dependencies: []
    });

    this.config = {
      name: config.name || 'doc-import-service',
      version: config.version || '1.0.0',
      eventBus: config.eventBus,
      importDir: config.importDir || './imports',
      maxFileSize: config.maxFileSize || 5 * 1024 * 1024, // 5MB
      allowedFormats: config.allowedFormats || [
        'md', 'mdx', 'txt',
        'rst', 'adoc', 'org',
        'wiki', 'textile'
      ]
    };
  }

  protected async initialize(): Promise<void> {
    await this.ensureImportDirectory();
    this.log('info', 'Documentation Import Service initialized');
  }

  protected async cleanup(): Promise<void> {
    await this.cleanupImports();
    this.log('info', 'Documentation Import Service cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    try {
      await fs.access(this.config.importDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Import a document
   */
  async importDoc(doc: {
    name: string;
    content: string;
    format: string;
  }): Promise<ImportResult> {
    try {
      // Validate document
      const validationResults = this.validateDoc(doc);
      if (!validationResults.passed) {
        return {
          success: false,
          error: 'Document validation failed',
          validationResults
        };
      }

      // Generate document hash
      const hash = this.generateDocHash(doc.content);

      // Check for duplicates
      const existing = Array.from(this.imports.values())
        .find(d => d.hash === hash);
      if (existing) {
        return {
          success: true,
          doc: existing,
          validationResults
        };
      }

      // Parse document structure
      const structure = this.parseDocStructure(doc.content, doc.format);

      // Save document
      const id = this.generateDocId();
      const docPath = path.join(this.config.importDir, id);
      await fs.writeFile(docPath, doc.content);

      // Create import record
      const importedDoc: ImportedDoc = {
        id,
        name: doc.name,
        path: docPath,
        format: doc.format,
        size: doc.content.length,
        hash,
        timestamp: Date.now(),
        structure
      };

      // Store import record
      this.imports.set(id, importedDoc);

      return {
        success: true,
        doc: importedDoc,
        validationResults
      };

    } catch (error) {
      this.log('error', `Document import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        error: 'Import failed'
      };
    }
  }

  /**
   * Import multiple documents
   */
  async importDocs(docs: {
    name: string;
    content: string;
    format: string;
  }[]): Promise<ImportResult[]> {
    return Promise.all(docs.map(doc => this.importDoc(doc)));
  }

  /**
   * Process imported documents
   */
  async processDocs(docIds: string[]): Promise<ProcessingResult> {
    try {
      const docs: ImportedDoc[] = [];
      const issues: string[] = [];

      // Collect documents
      for (const id of docIds) {
        const doc = this.imports.get(id);
        if (!doc) {
          issues.push(`Document not found: ${id}`);
          continue;
        }
        docs.push(doc);
      }

      if (docs.length === 0) {
        return {
          success: false,
          docs: [],
          analysis: {
            format: 'unknown',
            structure: {
              depth: 0,
              sections: 0,
              links: 0,
              codeBlocks: 0
            },
            quality: {
              score: 0,
              issues: ['No valid documents to process']
            }
          }
        };
      }

      // Analyze documents
      const analysis = this.analyzeDocs(docs);

      return {
        success: true,
        docs,
        analysis: {
          ...analysis,
          quality: {
            ...analysis.quality,
            issues: [...issues, ...analysis.quality.issues]
          }
        }
      };

    } catch (error) {
      this.log('error', `Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        docs: [],
        analysis: {
          format: 'unknown',
          structure: {
            depth: 0,
            sections: 0,
            links: 0,
            codeBlocks: 0
          },
          quality: {
            score: 0,
            issues: ['Processing failed']
          }
        }
      };
    }
  }

  /**
   * Get imported document
   */
  getDoc(docId: string): ImportedDoc | undefined {
    return this.imports.get(docId);
  }

  /**
   * Delete imported document
   */
  async deleteDoc(docId: string): Promise<boolean> {
    const doc = this.imports.get(docId);
    if (!doc) return false;

    try {
      await fs.unlink(doc.path);
      this.imports.delete(docId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate document
   */
  private validateDoc(doc: {
    name: string;
    content: string;
    format: string;
  }): { passed: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check file size
    if (doc.content.length > this.config.maxFileSize) {
      issues.push(`Document too large: ${doc.content.length} bytes`);
    }

    // Check format
    if (!this.config.allowedFormats.includes(doc.format)) {
      issues.push(`Invalid document format: ${doc.format}`);
    }

    // Check content
    if (!doc.content.trim()) {
      issues.push('Empty document content');
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Parse document structure
   */
  private parseDocStructure(content: string, format: string): ImportedDoc['structure'] {
    const sections: ImportedDoc['structure']['sections'] = [];
    const links: ImportedDoc['structure']['links'] = {
      internal: [],
      external: []
    };
    const codeBlocks: ImportedDoc['structure']['codeBlocks'] = [];

    // Parse sections (Markdown-style headers)
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headerRegex.exec(content)) !== null) {
      sections.push({
        level: match[1].length,
        title: match[2],
        content: this.extractSectionContent(content, match.index, match[0].length)
      });
    }

    // Parse links
    const internalLinkRegex = /\[([^\]]+)\]\((?!http)([^)]+)\)/g;
    const externalLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

    while ((match = internalLinkRegex.exec(content)) !== null) {
      links.internal.push(match[2]);
    }
    while ((match = externalLinkRegex.exec(content)) !== null) {
      links.external.push(match[2]);
    }

    // Parse code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        content: match[2]
      });
    }

    return {
      sections,
      links,
      codeBlocks
    };
  }

  /**
   * Extract section content
   */
  private extractSectionContent(
    content: string,
    startIndex: number,
    headerLength: number
  ): string {
    const nextHeader = content.slice(startIndex + headerLength)
      .search(/\n#{1,6}\s+/);
    
    if (nextHeader === -1) {
      return content.slice(startIndex + headerLength).trim();
    }
    
    return content.slice(
      startIndex + headerLength,
      startIndex + headerLength + nextHeader
    ).trim();
  }

  /**
   * Analyze documents
   */
  private analyzeDocs(docs: ImportedDoc[]): ProcessingResult['analysis'] {
    const formats = new Set<string>();
    const issues: string[] = [];
    let totalDepth = 0;
    let totalSections = 0;
    let totalLinks = 0;
    let totalCodeBlocks = 0;

    for (const doc of docs) {
      formats.add(doc.format);

      // Calculate structure metrics
      const depth = Math.max(...doc.structure.sections.map(s => s.level));
      totalDepth += depth;
      totalSections += doc.structure.sections.length;
      totalLinks += doc.structure.links.internal.length + doc.structure.links.external.length;
      totalCodeBlocks += doc.structure.codeBlocks.length;

      // Check for issues
      if (depth > 4) {
        issues.push(`Deep nesting in ${doc.name}`);
      }
      if (doc.structure.sections.length === 0) {
        issues.push(`No sections in ${doc.name}`);
      }
      if (doc.structure.links.internal.length === 0) {
        issues.push(`No internal links in ${doc.name}`);
      }
    }

    // Calculate quality score
    const qualityScore = this.calculateQualityScore({
      depth: totalDepth / docs.length,
      sections: totalSections / docs.length,
      links: totalLinks / docs.length,
      codeBlocks: totalCodeBlocks / docs.length,
      issues: issues.length
    });

    return {
      format: Array.from(formats).join(', '),
      structure: {
        depth: Math.round(totalDepth / docs.length),
        sections: totalSections,
        links: totalLinks,
        codeBlocks: totalCodeBlocks
      },
      quality: {
        score: qualityScore,
        issues
      }
    };
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(metrics: {
    depth: number;
    sections: number;
    links: number;
    codeBlocks: number;
    issues: number;
  }): number {
    const scores = {
      depth: Math.min(100, metrics.depth * 20),
      sections: Math.min(100, metrics.sections * 10),
      links: Math.min(100, metrics.links * 5),
      codeBlocks: Math.min(100, metrics.codeBlocks * 10)
    };

    const baseScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
    const penalty = metrics.issues * 5;

    return Math.max(0, Math.min(100, baseScore - penalty));
  }

  /**
   * Generate document ID
   */
  private generateDocId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate document hash
   */
  private generateDocHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Ensure import directory exists
   */
  private async ensureImportDirectory(): Promise<void> {
    try {
      await fs.access(this.config.importDir);
    } catch {
      await fs.mkdir(this.config.importDir, { recursive: true });
    }
  }

  /**
   * Clean up old imports
   */
  private async cleanupImports(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, doc] of this.imports.entries()) {
      if (now - doc.timestamp > maxAge) {
        await this.deleteDoc(id);
      }
    }
  }
}