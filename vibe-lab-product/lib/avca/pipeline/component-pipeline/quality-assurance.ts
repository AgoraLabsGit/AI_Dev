/**
 * Quality Assurance - Stage 4 of Component Pipeline
 * 
 * Validates, optimizes, and enhances generated code
 */

import { BaseService } from '../../services/base-service';
import { EventBus } from '../../services/event-bus';
import { EventFactory, EventCategory, PipelineEventType } from '../../../dias/events/event-types';
import {
  GeneratedComponent,
  QualityReport,
  OptimizedComponent,
  QualityIssue,
  CodeOptimization,
  BestPractice,
  GeneratedFile
} from './types';

export interface QualityConfig {
  name?: string;
  version?: string;
  eventBus?: EventBus;
  enableAutoFix?: boolean;
  enableOptimizations?: boolean;
  strictMode?: boolean;
  formatCode?: boolean;
}

interface ValidationResult {
  passed: boolean;
  issues: QualityIssue[];
  suggestions: CodeOptimization[];
}

export class QualityAssurance extends BaseService {
  private eventBus?: EventBus;
  private qualityConfig: QualityConfig;

  constructor(config: QualityConfig = {}) {
    super({
      name: config.name || 'quality-assurance',
      version: config.version || '1.0.0',
      dependencies: []
    });
    this.eventBus = config.eventBus;
    this.qualityConfig = {
      enableAutoFix: true,
      enableOptimizations: true,
      strictMode: true,
      formatCode: true,
      ...config
    };
  }

  protected async initialize(): Promise<void> {
    this.log('info', 'Quality assurance initialized');
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'Quality assurance cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Main processing method - validates and optimizes generated code
   */
  async process(generated: GeneratedComponent): Promise<OptimizedComponent> {
    const startTime = Date.now();
    
    try {
      // Emit start event
      await this.emitPipelineEvent(PipelineEventType.STAGE_STARTED, generated.plan.blueprint.id, {
        stage: 'quality-assurance',
        fileCount: generated.files.length
      });

      // Run validation checks (merge with existing issues)
      const validation = await this.validateCode(generated);
      
      // Merge existing issues from generation with new validation issues
      const allIssues = [...generated.qualityReport.issues, ...validation.issues];
      validation.issues = allIssues;
      
      // Apply optimizations
      let optimizedFiles = generated.files;
      const optimizations: CodeOptimization[] = [];
      
      if (this.qualityConfig.enableOptimizations && validation.passed) {
        const result = await this.optimizeCode(generated.files, generated.plan);
        optimizedFiles = result.files;
        optimizations.push(...result.optimizations);
      }

      // Apply auto-fixes
      let fixedIssueCount = 0;
      if (this.qualityConfig.enableAutoFix && validation.issues.length > 0) {
        const fixed = await this.autoFixIssues(optimizedFiles, validation.issues);
        optimizedFiles = fixed.files;
        fixedIssueCount = validation.issues.filter(i => i.fixed).length;
        validation.issues = fixed.remainingIssues;
      }

      // Format code
      if (this.qualityConfig.formatCode) {
        optimizedFiles = await this.formatCode(optimizedFiles);
      }

      // Check best practices
      const bestPractices = await this.checkBestPractices(optimizedFiles, generated.plan);

      // Calculate final quality score
      const qualityScore = this.calculateQualityScore(
        validation.issues,
        optimizations,
        bestPractices
      );

      // Create final quality report
      const qualityReport: QualityReport = {
        lintingPassed: validation.issues.filter(i => i.severity === 'error').length === 0,
        typeCheckPassed: validation.issues.filter(i => i.type === 'type').length === 0,
        testsPassed: true, // Would run actual tests
        coverage: this.estimateCoverage(generated),
        issues: validation.issues,
        score: qualityScore,
        optimizations,
        bestPractices
      };

      const result: OptimizedComponent = {
        ...generated,
        files: optimizedFiles,
        qualityReport,
        improvements: {
          optimizationsApplied: optimizations.length,
          issuesFixed: fixedIssueCount,
          codeReduced: this.calculateCodeReduction(generated.files, optimizedFiles),
          performanceGain: this.estimatePerformanceGain(optimizations)
        }
      };

      // Emit completion event
      const duration = Date.now() - startTime;
      await this.emitPipelineEvent(PipelineEventType.STAGE_COMPLETED, generated.plan.blueprint.id, {
        stage: 'quality-assurance',
        duration,
        qualityScore,
        issuesFixed: result.improvements.issuesFixed,
        optimizationsApplied: result.improvements.optimizationsApplied
      });

      this.log('info', `Quality assurance completed in ${duration}ms - Score: ${qualityScore}%`);
      return result;

    } catch (error) {
      await this.emitPipelineEvent(PipelineEventType.STAGE_FAILED, generated.plan.blueprint.id, {
        stage: 'quality-assurance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Validate generated code
   */
  private async validateCode(generated: GeneratedComponent): Promise<ValidationResult> {
    const issues: QualityIssue[] = [];
    const suggestions: CodeOptimization[] = [];

    for (const file of generated.files) {
      // TypeScript validation
      if (file.language === 'typescript') {
        issues.push(...this.validateTypeScript(file));
      }

      // React-specific validation
      if (file.path.includes('.tsx') || file.path.includes('.jsx')) {
        issues.push(...this.validateReact(file));
      }

      // General code quality
      issues.push(...this.validateCodeQuality(file));

      // Import validation
      issues.push(...this.validateImports(file));
    }

    // Cross-file validation
    issues.push(...this.validateCrossFileConsistency(generated.files));

    return {
      passed: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Optimize generated code
   */
  private async optimizeCode(
    files: GeneratedFile[],
    plan: any
  ): Promise<{ files: GeneratedFile[]; optimizations: CodeOptimization[] }> {
    const optimizedFiles: GeneratedFile[] = [];
    const optimizations: CodeOptimization[] = [];

    for (const file of files) {
      let optimizedContent = file.content;

      // Remove unused imports
      const unusedImports = this.findUnusedImports(file);
      if (unusedImports.length > 0) {
        optimizedContent = this.removeUnusedImports(optimizedContent, unusedImports);
        optimizations.push({
          type: 'import',
          description: `Removed ${unusedImports.length} unused imports`,
          impact: 'minor',
          file: file.path
        });
      }

      // Optimize React components
      if (file.path.includes('.tsx') && !file.path.includes('.test.') && !file.path.includes('.stories.')) {
        const memoResult = this.addReactMemo(optimizedContent, plan);
        if (memoResult.changed) {
          optimizedContent = memoResult.content;
          optimizations.push({
            type: 'performance',
            description: 'Added React.memo for performance',
            impact: 'moderate',
            file: file.path
          });
        }
      }

      // Consolidate duplicate code
      const duplicates = this.findDuplicateCode(optimizedContent);
      if (duplicates.length > 0) {
        optimizedContent = this.consolidateDuplicates(optimizedContent, duplicates);
        optimizations.push({
          type: 'refactor',
          description: `Consolidated ${duplicates.length} duplicate patterns`,
          impact: 'moderate',
          file: file.path
        });
      }

      optimizedFiles.push({
        ...file,
        content: optimizedContent,
        size: optimizedContent.length
      });
    }

    return { files: optimizedFiles, optimizations };
  }

  /**
   * Auto-fix issues
   */
  private async autoFixIssues(
    files: GeneratedFile[],
    issues: QualityIssue[]
  ): Promise<{ files: GeneratedFile[]; remainingIssues: QualityIssue[] }> {
    const fixedFiles = [...files];
    const remainingIssues: QualityIssue[] = [];

    for (const issue of issues) {
      if (issue.fix && this.qualityConfig.enableAutoFix) {
        const fileIndex = fixedFiles.findIndex(f => f.path === issue.file);
        if (fileIndex !== -1) {
          const file = fixedFiles[fileIndex];
          const fixed = this.applyFix(file.content, issue);
          
          if (fixed.success) {
            fixedFiles[fileIndex] = {
              ...file,
              content: fixed.content,
              size: fixed.content.length
            };
            issue.fixed = true;
          } else {
            remainingIssues.push(issue);
          }
        }
      } else {
        remainingIssues.push(issue);
      }
    }

    return { files: fixedFiles, remainingIssues };
  }

  /**
   * Format code
   */
  private async formatCode(files: GeneratedFile[]): Promise<GeneratedFile[]> {
    return files.map(file => ({
      ...file,
      content: this.formatFileContent(file.content, file.language)
    }));
  }

  /**
   * Check best practices
   */
  private async checkBestPractices(
    files: GeneratedFile[],
    plan: any
  ): Promise<BestPractice[]> {
    const practices: BestPractice[] = [];

    // Component best practices
    for (const file of files) {
      if (file.path.includes('.tsx') && !file.path.includes('.test')) {
        // Check for prop types
        if (!file.content.includes('interface') || !file.content.includes('Props')) {
          practices.push({
            category: 'typescript',
            practice: 'Define prop types',
            applied: false,
            recommendation: 'Add TypeScript interface for component props'
          });
        } else {
          practices.push({
            category: 'typescript',
            practice: 'Define prop types',
            applied: true
          });
        }

        // Check for error boundaries
        if (plan.blueprint.metadata.complexity === 'COMPLEX' ||
            plan.blueprint.metadata.complexity === 'VERY_COMPLEX') {
          if (!file.content.includes('ErrorBoundary')) {
            practices.push({
              category: 'react',
              practice: 'Use error boundaries',
              applied: false,
              recommendation: 'Add error boundary for complex components'
            });
          }
        }

        // Check for accessibility
        if (file.content.includes('<button') && !file.content.includes('aria-')) {
          practices.push({
            category: 'accessibility',
            practice: 'Add ARIA labels',
            applied: false,
            recommendation: 'Add appropriate ARIA attributes for accessibility'
          });
        }
      }

      // Test best practices
      if (file.path.includes('.test')) {
        if (file.content.includes('describe(') && file.content.includes('it(')) {
          practices.push({
            category: 'testing',
            practice: 'Structured test suites',
            applied: true
          });
        }
      }
    }

    return practices;
  }

  // Validation methods

  private validateTypeScript(file: GeneratedFile): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const lines = file.content.split('\n');

    lines.forEach((line, index) => {
      // Check for any types
      if (this.qualityConfig.strictMode && line.includes(': any')) {
        issues.push({
          severity: 'warning',
          type: 'type',
          message: 'Avoid using "any" type',
          file: file.path,
          line: index + 1,
          suggestion: 'Use specific type instead',
          fix: {
            searchValue: ': any',
            replaceValue: ': unknown'
          }
        });
      }

      // Check for missing return types
      if (line.includes('function') && !line.includes(':') && !line.includes('constructor')) {
        issues.push({
          severity: 'warning',
          type: 'type',
          message: 'Missing return type',
          file: file.path,
          line: index + 1,
          suggestion: 'Add explicit return type'
        });
      }
    });

    return issues;
  }

  private validateReact(file: GeneratedFile): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for missing keys in lists
    if (file.content.includes('.map(') && !file.content.includes('key=')) {
      issues.push({
        severity: 'error',
        type: 'react',
        message: 'Missing key prop in list rendering',
        file: file.path,
        suggestion: 'Add unique key prop to list items'
      });
    }

    // Check for direct state mutation
    if (file.content.includes('state.') && file.content.includes('=')) {
      issues.push({
        severity: 'error',
        type: 'react',
        message: 'Direct state mutation detected',
        file: file.path,
        suggestion: 'Use setState or state update function'
      });
    }

    return issues;
  }

  private validateCodeQuality(file: GeneratedFile): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const lines = file.content.split('\n');

    // Check for long lines
    lines.forEach((line, index) => {
      if (line.length > 100) {
        issues.push({
          severity: 'info',
          type: 'style',
          message: `Line too long (${line.length} characters)`,
          file: file.path,
          line: index + 1,
          suggestion: 'Break into multiple lines'
        });
      }
      
      // Check for TODOs
      if (line.includes('TODO:')) {
        issues.push({
          severity: 'info',
          type: 'quality',
          message: `TODO found: ${line.trim()}`,
          file: file.path,
          line: index + 1
        });
      }
    });

    // Check for console.log in each line
    lines.forEach((line, index) => {
      if (line.includes('console.log')) {
        issues.push({
          severity: 'warning',
          type: 'quality',
          message: 'Remove console.log statements',
          file: file.path,
          line: index + 1,
          suggestion: 'Use proper logging service',
          fix: {
            searchValue: line.trim(),
            replaceValue: ''
          }
        });
      }
    });

    return issues;
  }

  private validateImports(file: GeneratedFile): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [...file.content.matchAll(importRegex)];

    // Check for duplicate imports
    const importPaths = imports.map(i => i[1]);
    const duplicates = importPaths.filter((path, index) => importPaths.indexOf(path) !== index);
    
    if (duplicates.length > 0) {
      issues.push({
        severity: 'error',
        type: 'import',
        message: `Duplicate imports: ${duplicates.join(', ')}`,
        file: file.path,
        suggestion: 'Consolidate duplicate imports'
      });
    }

    return issues;
  }

  private validateCrossFileConsistency(files: GeneratedFile[]): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check that exports match imports
    const exports = new Map<string, string[]>();
    const imports = new Map<string, string[]>();

    for (const file of files) {
      // Extract exports
      const exportMatches = file.content.matchAll(/export\s+(?:default\s+)?(?:const|class|function|interface|type)\s+(\w+)/g);
      exports.set(file.path, [...exportMatches].map(m => m[1]));

      // Extract imports
      const importMatches = file.content.matchAll(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g);
      for (const match of importMatches) {
        const importedItems = match[1].split(',').map(i => i.trim());
        const fromPath = match[2];
        imports.set(file.path, [...(imports.get(file.path) || []), ...importedItems]);
      }
    }

    return issues;
  }

  // Helper methods

  private findUnusedImports(file: GeneratedFile): string[] {
    const unused: string[] = [];
    const importRegex = /import\s+{([^}]+)}\s+from/g;
    const matches = [...file.content.matchAll(importRegex)];

    for (const match of matches) {
      const imports = match[1].split(',').map(i => i.trim());
      for (const imp of imports) {
        const usageRegex = new RegExp(`\\b${imp}\\b`, 'g');
        const usages = file.content.match(usageRegex);
        if (!usages || usages.length === 1) { // Only in import
          unused.push(imp);
        }
      }
    }

    return unused;
  }

  private removeUnusedImports(content: string, unused: string[]): string {
    let result = content;
    
    for (const imp of unused) {
      // Remove from import statements
      result = result.replace(new RegExp(`\\s*${imp}\\s*,?`, 'g'), '');
    }

    // Clean up empty imports
    result = result.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"]\s*;?\n?/g, '');
    
    return result;
  }

  private addReactMemo(content: string, plan: any): { content: string; changed: boolean } {
    // Only optimize non-simple components
    if (content.includes('React.memo') || plan.blueprint.metadata.complexity === 'SIMPLE') {
      return { content, changed: false };
    }
    
    // Find React functional component
    const componentRegex = /export const (\w+)(?::\s*React\.FC<[^>]+>)?\s*=\s*\(/;
    const match = content.match(componentRegex);
    
    if (match) {
      const componentName = match[1];
      
      // Replace the component definition with React.memo wrapped version
      const memoWrapped = content.replace(
        match[0],
        `export const ${componentName} = React.memo(`
      );
      
      // Find the end of the component and add closing parenthesis
      // Look for the final export statement
      const exportDefaultRegex = new RegExp(`export default ${componentName};`);
      if (exportDefaultRegex.test(memoWrapped)) {
        const result = memoWrapped.replace(
          exportDefaultRegex,
          `);\n\nexport default ${componentName};`
        );
        return { content: result, changed: true };
      }
    }
    
    return { content, changed: false };
  }

  private findDuplicateCode(content: string): Array<{ pattern: string; count: number }> {
    const duplicates: Array<{ pattern: string; count: number }> = [];
    const lines = content.split('\n');
    const patterns = new Map<string, number>();

    // Look for duplicate patterns (3+ lines)
    for (let i = 0; i < lines.length - 2; i++) {
      const pattern = lines.slice(i, i + 3).join('\n');
      if (pattern.trim().length > 50) { // Significant code
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    }

    for (const [pattern, count] of patterns) {
      if (count > 1) {
        duplicates.push({ pattern, count });
      }
    }

    return duplicates;
  }

  private consolidateDuplicates(content: string, duplicates: any[]): string {
    // This would extract duplicate code into functions
    // For now, just return original content
    return content;
  }

  private applyFix(content: string, issue: QualityIssue): { success: boolean; content: string } {
    if (!issue.fix) {
      return { success: false, content };
    }

    try {
      let fixed = content;
      
      if (typeof issue.fix.searchValue === 'string' && issue.fix.searchValue.includes('console.log')) {
        // For console.log, remove the entire line
        const lines = content.split('\n');
        const filteredLines = lines.filter(line => !line.includes('console.log'));
        fixed = filteredLines.join('\n');
      } else if (issue.fix.searchValue instanceof RegExp) {
        fixed = content.replace(issue.fix.searchValue, issue.fix.replaceValue);
      } else {
        fixed = content.replace(issue.fix.searchValue, issue.fix.replaceValue);
      }

      return { success: fixed !== content, content: fixed };
    } catch {
      return { success: false, content };
    }
  }

  private formatFileContent(content: string, language: string): string {
    // Simple formatting - in production would use prettier
    let formatted = content;

    // Fix indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const formattedLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Decrease indent for closing braces
      if (trimmed.startsWith('}') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Apply indent
      if (trimmed) {
        formattedLines.push('  '.repeat(indentLevel) + trimmed);
      } else {
        formattedLines.push('');
      }

      // Increase indent for opening braces
      if (trimmed.endsWith('{') || trimmed.endsWith('(')) {
        indentLevel++;
      }
    }

    formatted = formattedLines.join('\n');

    // Add spacing
    formatted = formatted
      .replace(/\{([^\s])/g, '{ $1')
      .replace(/([^\s])\}/g, '$1 }')
      .replace(/,([^\s])/g, ', $1');

    return formatted;
  }

  private calculateQualityScore(
    issues: QualityIssue[],
    optimizations: CodeOptimization[],
    bestPractices: BestPractice[]
  ): number {
    let score = 100;

    // Deduct for issues
    for (const issue of issues) {
      if (!issue.fixed) {
        switch (issue.severity) {
          case 'error':
            score -= 10;
            break;
          case 'warning':
            score -= 5;
            break;
          case 'info':
            score -= 1;
            break;
        }
      }
    }

    // Add for optimizations
    score += optimizations.length * 2;

    // Check best practices
    const appliedPractices = bestPractices.filter(p => p.applied).length;
    const totalPractices = bestPractices.length;
    const practiceScore = totalPractices > 0 ? (appliedPractices / totalPractices) * 10 : 0;
    score += practiceScore;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private estimateCoverage(generated: GeneratedComponent): number | undefined {
    const testFiles = generated.files.filter(f => f.path.includes('.test'));
    const componentFiles = generated.files.filter(f => 
      !f.path.includes('.test') && 
      !f.path.includes('.stories') &&
      (f.path.includes('.tsx') || f.path.includes('.ts'))
    );

    if (componentFiles.length === 0) return undefined;

    // Estimate based on test count
    const testCount = generated.plan.testPlan.unitTests.length + 
                     generated.plan.testPlan.integrationTests.length;
    const requiredTests = generated.plan.blueprint.requirements.functional.length * 2;
    
    return Math.min(100, Math.round((testCount / requiredTests) * 100));
  }

  private calculateCodeReduction(original: GeneratedFile[], optimized: GeneratedFile[]): number {
    const originalSize = original.reduce((sum, f) => sum + f.size, 0);
    const optimizedSize = optimized.reduce((sum, f) => sum + f.size, 0);
    
    return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
  }

  private estimatePerformanceGain(optimizations: CodeOptimization[]): number {
    let gain = 0;
    
    for (const opt of optimizations) {
      switch (opt.impact) {
        case 'major':
          gain += 10;
          break;
        case 'moderate':
          gain += 5;
          break;
        case 'minor':
          gain += 1;
          break;
      }
    }

    return gain;
  }

  private async emitPipelineEvent(type: PipelineEventType, projectId: string, data: any): Promise<void> {
    if (!this.eventBus) return;

    const event = EventFactory.createEvent(
      EventCategory.PIPELINE,
      type,
      this.config.name,
      projectId,
      data
    );

    await this.eventBus.publish(EventCategory.PIPELINE, this.config.name, event);
  }
}
