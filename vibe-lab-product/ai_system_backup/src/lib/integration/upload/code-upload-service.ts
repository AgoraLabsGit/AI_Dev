/**
 * Code Upload Service
 * 
 * Handles code upload operations:
 * - File validation
 * - Code processing
 * - Import handling
 */

import { BaseService } from '@/lib/avca/services/base-service';
import { EventBus } from '../../avca/services/event-bus';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface CodeUploadConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  uploadDir?: string;
  maxFileSize?: number;
  allowedExtensions?: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  hash: string;
  timestamp: number;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
  validationResults?: {
    passed: boolean;
    issues: string[];
  };
}

export interface ProcessingResult {
  success: boolean;
  files: UploadedFile[];
  analysis: {
    language: string;
    complexity: number;
    dependencies: string[];
    issues: string[];
  };
}

export class CodeUploadService extends BaseService {
  private config: Required<CodeUploadConfig>;
  private uploads: Map<string, UploadedFile> = new Map();

  constructor(config: CodeUploadConfig = {}) {
    super({
      name: config.name || 'code-upload-service',
      version: config.version || '1.0.0',
      dependencies: []
    });

    this.config = {
      name: config.name || 'code-upload-service',
      version: config.version || '1.0.0',
      eventBus: config.eventBus,
      uploadDir: config.uploadDir || './uploads',
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedExtensions: config.allowedExtensions || [
        '.js', '.jsx', '.ts', '.tsx',
        '.html', '.css', '.scss',
        '.json', '.yaml', '.yml',
        '.md', '.txt'
      ]
    };
  }

  protected async initialize(): Promise<void> {
    await this.ensureUploadDirectory();
    this.log('info', 'Code Upload Service initialized');
  }

  protected async cleanup(): Promise<void> {
    await this.cleanupUploads();
    this.log('info', 'Code Upload Service cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    try {
      await fs.access(this.config.uploadDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upload a single file
   */
  async uploadFile(file: {
    name: string;
    content: Buffer;
    type: string;
  }): Promise<UploadResult> {
    try {
      // Validate file
      const validationResults = this.validateFile(file);
      if (!validationResults.passed) {
        return {
          success: false,
          error: 'File validation failed',
          validationResults
        };
      }

      // Generate file hash
      const hash = this.generateFileHash(file.content);

      // Check for duplicates
      const existing = Array.from(this.uploads.values())
        .find(f => f.hash === hash);
      if (existing) {
        return {
          success: true,
          file: existing,
          validationResults
        };
      }

      // Save file
      const id = this.generateFileId();
      const filePath = path.join(this.config.uploadDir, id);
      await fs.writeFile(filePath, file.content);

      // Create upload record
      const uploadedFile: UploadedFile = {
        id,
        name: file.name,
        path: filePath,
        size: file.content.length,
        type: file.type,
        hash,
        timestamp: Date.now()
      };

      // Store upload record
      this.uploads.set(id, uploadedFile);

      return {
        success: true,
        file: uploadedFile,
        validationResults
      };

    } catch (error) {
      this.log('error', `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        error: 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: {
    name: string;
    content: Buffer;
    type: string;
  }[]): Promise<UploadResult[]> {
    return Promise.all(files.map(file => this.uploadFile(file)));
  }

  /**
   * Process uploaded files
   */
  async processFiles(fileIds: string[]): Promise<ProcessingResult> {
    try {
      const files: UploadedFile[] = [];
      const issues: string[] = [];

      // Collect files
      for (const id of fileIds) {
        const file = this.uploads.get(id);
        if (!file) {
          issues.push(`File not found: ${id}`);
          continue;
        }
        files.push(file);
      }

      if (files.length === 0) {
        return {
          success: false,
          files: [],
          analysis: {
            language: 'unknown',
            complexity: 0,
            dependencies: [],
            issues: ['No valid files to process']
          }
        };
      }

      // Analyze files
      const analysis = await this.analyzeFiles(files);

      return {
        success: true,
        files,
        analysis: {
          ...analysis,
          issues: [...issues, ...analysis.issues]
        }
      };

    } catch (error) {
      this.log('error', `File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        files: [],
        analysis: {
          language: 'unknown',
          complexity: 0,
          dependencies: [],
          issues: ['Processing failed']
        }
      };
    }
  }

  /**
   * Get uploaded file
   */
  getFile(fileId: string): UploadedFile | undefined {
    return this.uploads.get(fileId);
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const file = this.uploads.get(fileId);
    if (!file) return false;

    try {
      await fs.unlink(file.path);
      this.uploads.delete(fileId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate file
   */
  private validateFile(file: {
    name: string;
    content: Buffer;
    type: string;
  }): { passed: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check file size
    if (file.content.length > this.config.maxFileSize) {
      issues.push(`File too large: ${file.content.length} bytes`);
    }

    // Check file extension
    const ext = path.extname(file.name).toLowerCase();
    if (!this.config.allowedExtensions.includes(ext)) {
      issues.push(`Invalid file extension: ${ext}`);
    }

    // Check file type
    if (!file.type.startsWith('text/') &&
        !file.type.includes('javascript') &&
        !file.type.includes('json')) {
      issues.push(`Invalid file type: ${file.type}`);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Analyze files
   */
  private async analyzeFiles(files: UploadedFile[]): Promise<{
    language: string;
    complexity: number;
    dependencies: string[];
    issues: string[];
  }> {
    const languages = new Set<string>();
    const dependencies = new Set<string>();
    const issues: string[] = [];
    let totalComplexity = 0;

    for (const file of files) {
      try {
        // Read file content
        const content = await fs.readFile(file.path, 'utf8');

        // Detect language
        const lang = this.detectLanguage(file.name);
        if (lang) languages.add(lang);

        // Find dependencies
        const deps = this.findDependencies(content, lang);
        deps.forEach(dep => dependencies.add(dep));

        // Calculate complexity
        totalComplexity += this.calculateComplexity(content);

      } catch (error) {
        issues.push(`Failed to analyze ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      language: Array.from(languages).join(', '),
      complexity: Math.round(totalComplexity / files.length),
      dependencies: Array.from(dependencies),
      issues
    };
  }

  /**
   * Detect file language
   */
  private detectLanguage(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const langMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript (React)',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript (React)',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.json': 'JSON',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown'
    };
    return langMap[ext] || 'Unknown';
  }

  /**
   * Find dependencies in file
   */
  private findDependencies(content: string, language: string): string[] {
    const deps = new Set<string>();

    // Simple regex-based dependency detection
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      deps.add(match[1]);
    }
    while ((match = requireRegex.exec(content)) !== null) {
      deps.add(match[1]);
    }

    return Array.from(deps);
  }

  /**
   * Calculate code complexity
   */
  private calculateComplexity(content: string): number {
    // Simple complexity calculation
    const lines = content.split('\n').length;
    const functions = (content.match(/function/g) || []).length;
    const classes = (content.match(/class/g) || []).length;
    const conditionals = (content.match(/if|else|switch|case|while|for/g) || []).length;

    return lines * 0.1 + functions * 2 + classes * 3 + conditionals;
  }

  /**
   * Generate file ID
   */
  private generateFileId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate file hash
   */
  private generateFileHash(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.config.uploadDir);
    } catch {
      await fs.mkdir(this.config.uploadDir, { recursive: true });
    }
  }

  /**
   * Clean up old uploads
   */
  private async cleanupUploads(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, file] of this.uploads.entries()) {
      if (now - file.timestamp > maxAge) {
        await this.deleteFile(id);
      }
    }
  }
}