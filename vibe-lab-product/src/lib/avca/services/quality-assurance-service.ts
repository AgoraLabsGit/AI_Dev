/**
 * Vibe Lab Quality Assurance Service
 * 
 * Core QA system that integrates into AVCA/DIAS architecture
 * Provides automated quality checks, configuration validation, 
 * and architectural compliance monitoring for all Vibe Lab projects
 */

import { BaseService, ServiceConfig } from './base-service';
import { EventBus } from './event-bus';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface QualityMetrics {
  typeErrors: number;
  lintWarnings: number;
  lintErrors: number;
  testCoverage: number;
  buildSuccess: boolean;
  dependencyVulnerabilities: number;
  circularDependencies: string[];
  unusedExports: string[];
  configurationHealth: ConfigHealthScore;
}

export interface ConfigHealthScore {
  tsconfig: number;
  eslint: number;
  package: number;
  paths: number;
  overall: number;
}

export interface QualityReport {
  timestamp: Date;
  projectName: string;
  metrics: QualityMetrics;
  recommendations: QualityRecommendation[];
  status: 'excellent' | 'good' | 'warning' | 'critical';
  score: number; // 0-100
}

export interface QualityRecommendation {
  type: 'error' | 'warning' | 'info';
  category: 'typescript' | 'eslint' | 'architecture' | 'security' | 'performance';
  message: string;
  file?: string;
  line?: number;
  fix?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface QualityConfig extends ServiceConfig {
  projectRoot: string;
  enabledChecks: {
    typescript: boolean;
    eslint: boolean;
    tests: boolean;
    build: boolean;
    dependencies: boolean;
    architecture: boolean;
  };
  thresholds: {
    minTypeScriptScore: number;
    maxLintErrors: number;
    minTestCoverage: number;
    maxBuildTime: number;
  };
  autoFix: boolean;
  reportPath: string;
}

export class QualityAssuranceService extends BaseService {
  private projectRoot: string;
  private qaConfig: QualityConfig;
  private eventBus: EventBus;

  constructor(config: QualityConfig, eventBus: EventBus) {
    super({
      name: 'quality-assurance',
      version: '1.0.0',
      dependencies: ['typescript', 'eslint', 'jest']
    });

    this.qaConfig = {
      enabledChecks: {
        typescript: true,
        eslint: true,
        tests: true,
        build: true,
        dependencies: true,
        architecture: true
      },
      thresholds: {
        minTypeScriptScore: 90,
        maxLintErrors: 0,
        minTestCoverage: 80,
        maxBuildTime: 60000
      },
      autoFix: false,
      reportPath: './reports/quality',
      ...config
    };

    this.projectRoot = config.projectRoot;
    this.eventBus = eventBus;
  }

  protected async initialize(): Promise<void> {
    // Ensure quality reports directory exists
    await fs.mkdir(path.join(this.projectRoot, this.qaConfig.reportPath), { 
      recursive: true 
    });

    // Subscribe to build events for automatic quality checking
    this.eventBus.subscribe('build:complete', async (event) => {
      if (event.data.success) {
        await this.runQualityAnalysis();
      }
    }, 'quality-assurance');

    this.log('info', 'Quality Assurance Service initialized');
  }

  protected async cleanup(): Promise<void> {
    this.log('info', 'Quality Assurance Service cleaned up');
  }

  protected async healthCheck(): Promise<boolean> {
    try {
      // Check if required tools are available
      await execAsync('npx tsc --version', { cwd: this.projectRoot });
      await execAsync('npx eslint --version', { cwd: this.projectRoot });
      return true;
    } catch {
      return false;
    }
  }

  async process(input: any): Promise<QualityReport> {
    if (input?.action === 'analyze') {
      return await this.runQualityAnalysis();
    }
    throw new Error('Invalid input for Quality Assurance Service');
  }

  /**
   * Run comprehensive quality analysis
   */
  async runQualityAnalysis(): Promise<QualityReport> {
    this.log('info', 'Starting comprehensive quality analysis');
    const startTime = Date.now();

    const metrics: QualityMetrics = {
      typeErrors: 0,
      lintWarnings: 0,
      lintErrors: 0,
      testCoverage: 0,
      buildSuccess: false,
      dependencyVulnerabilities: 0,
      circularDependencies: [],
      unusedExports: [],
      configurationHealth: {
        tsconfig: 0,
        eslint: 0,
        package: 0,
        paths: 0,
        overall: 0
      }
    };

    const recommendations: QualityRecommendation[] = [];

    // Run all enabled checks in parallel
    const checks = [];

    if (this.qaConfig.enabledChecks.typescript) {
      checks.push(this.checkTypeScript(metrics, recommendations));
    }

    if (this.qaConfig.enabledChecks.eslint) {
      checks.push(this.checkESLint(metrics, recommendations));
    }

    if (this.qaConfig.enabledChecks.tests) {
      checks.push(this.checkTestCoverage(metrics, recommendations));
    }

    if (this.qaConfig.enabledChecks.build) {
      checks.push(this.checkBuild(metrics, recommendations));
    }

    if (this.qaConfig.enabledChecks.dependencies) {
      checks.push(this.checkDependencies(metrics, recommendations));
    }

    if (this.qaConfig.enabledChecks.architecture) {
      checks.push(this.checkArchitecture(metrics, recommendations));
    }

    // Always check configuration health
    checks.push(this.checkConfigurationHealth(metrics, recommendations));

    await Promise.all(checks);

    // Calculate overall score and status
    const score = this.calculateQualityScore(metrics);
    const status = this.determineStatus(score);

    const report: QualityReport = {
      timestamp: new Date(),
      projectName: path.basename(this.projectRoot),
      metrics,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      status,
      score
    };

    // Save report
    await this.saveReport(report);

    // Emit quality analysis complete event
    this.eventBus.publish('quality:analysis:complete', 'quality-assurance', {
      score,
      status,
      metrics,
      duration: Date.now() - startTime
    });

    this.log('info', `Quality analysis complete. Score: ${score}/100, Status: ${status}`);
    return report;
  }

  /**
   * Check TypeScript compilation and type safety
   */
  private async checkTypeScript(metrics: QualityMetrics, recommendations: QualityRecommendation[]): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit', { 
        cwd: this.projectRoot 
      });

      metrics.typeErrors = 0;
      
      if (stderr) {
        const errorLines = stderr.split('\n').filter(line => line.includes('error TS'));
        metrics.typeErrors = errorLines.length;

        if (metrics.type

 > this.qaConfig.thresholds.minTypeScriptScore) {
          recommendations.push({
            type: 'error',
            category: 'typescript',
            message: `${metrics.typeErrors} TypeScript errors found`,
            priority: 'high',
            fix: 'Run `npx tsc --noEmit` to see detailed errors'
          });
        }
      }

    } catch (error: any) {
      const errorOutput = error.stdout || error.stderr || '';
      const errorLines = errorOutput.split('\n').filter((line: string) => line.includes('error TS'));
      metrics.typeErrors = errorLines.length;

      recommendations.push({
        type: 'error',
        category: 'typescript',
        message: `TypeScript compilation failed with ${metrics.typeErrors} errors`,
        priority: 'high',
        fix: 'Fix TypeScript errors before proceeding'
      });
    }
  }

  /**
   * Check ESLint compliance
   */
  private async checkESLint(metrics: QualityMetrics, recommendations: QualityRecommendation[]): Promise<void> {
    try {
      const { stdout } = await execAsync('npx eslint src --format json', { 
        cwd: this.projectRoot 
      });

      const results = JSON.parse(stdout);
      metrics.lintErrors = results.reduce((total: number, file: any) => 
        total + file.errorCount, 0);
      metrics.lintWarnings = results.reduce((total: number, file: any) => 
        total + file.warningCount, 0);

      if (metrics.lintErrors > this.qaConfig.thresholds.maxLintErrors) {
        recommendations.push({
          type: 'error',
          category: 'eslint',
          message: `${metrics.lintErrors} ESLint errors found`,
          priority: 'high',
          fix: this.qaConfig.autoFix ? 'Run `npx eslint src --fix`' : 'Fix ESLint errors manually'
        });
      }

      if (metrics.lintWarnings > 10) {
        recommendations.push({
          type: 'warning',
          category: 'eslint',
          message: `${metrics.lintWarnings} ESLint warnings found`,
          priority: 'medium',
          fix: 'Address ESLint warnings for better code quality'
        });
      }

    } catch (error) {
      recommendations.push({
        type: 'error',
        category: 'eslint',
        message: 'ESLint check failed',
        priority: 'medium',
        fix: 'Check ESLint configuration'
      });
    }
  }

  /**
   * Check test coverage
   */
  private async checkTestCoverage(metrics: QualityMetrics, recommendations: QualityRecommendation[]): Promise<void> {
    try {
      const { stdout } = await execAsync('npm test -- --coverage --watchAll=false', { 
        cwd: this.projectRoot 
      });

      // Extract coverage percentage from Jest output
      const coverageMatch = stdout.match(/All files\s+\|\s+[\d.]+\s+\|\s+([\d.]+)/);
      if (coverageMatch) {
        metrics.testCoverage = parseFloat(coverageMatch[1]);
      }

      if (metrics.testCoverage < this.qaConfig.thresholds.minTestCoverage) {
        recommendations.push({
          type: 'warning',
          category: 'performance',
          message: `Test coverage is ${metrics.testCoverage}%, below threshold of ${this.qaConfig.thresholds.minTestCoverage}%`,
          priority: 'medium',
          fix: 'Add more comprehensive tests'
        });
      }

    } catch (error) {
      recommendations.push({
        type: 'warning',
        category: 'performance',
        message: 'Unable to determine test coverage',
        priority: 'low',
        fix: 'Set up Jest test coverage reporting'
      });
    }
  }

  /**
   * Check build success and performance
   */
  private async checkBuild(metrics: QualityMetrics, recommendations: QualityRecommendation[]): Promise<void> {
    const buildStart = Date.now();
    
    try {
      await execAsync('npm run build', { cwd: this.projectRoot });
      metrics.buildSuccess = true;

      const buildTime = Date.now() - buildStart;
      if (buildTime > this.qaConfig.thresholds.maxBuildTime) {
        recommendations.push({
          type: 'warning',
          category: 'performance',
          message: `Build time (${buildTime}ms) exceeds threshold (${this.qaConfig.thresholds.maxBuildTime}ms)`,
          priority: 'medium',
          fix: 'Optimize build performance'
        });
      }

    } catch (error) {
      metrics.buildSuccess = false;
      recommendations.push({
        type: 'error',
        category: 'typescript',
        message: 'Build failed',
        priority: 'high',
        fix: 'Fix build errors before proceeding'
      });
    }
  }

  /**
   * Check dependency vulnerabilities and health
   */
  private async checkDependencies(metrics: QualityMetrics, recommendations: QualityRecommendation[]): Promise<void> {
    try {
      const { stdout } = await execAsync('npm audit --json', { cwd: this.projectRoot });
      const auditResult = JSON.parse(stdout);
      
      metrics.dependencyVulnerabilities = auditResult.metadata?.vulnerabilities?.total || 0;

      if (metrics.dependencyVulnerabilities > 0) {
        recommendations.push({
          type: 'error',
          category: 'security',
          message: `${metrics.dependencyVulnerabilities} dependency vulnerabilities found`,
          priority: 'high',
          fix: 'Run `npm audit fix` to resolve vulnerabilities'
        });
      }

    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities found
      try {
        const { stdout } = await execAsync('npm audit --json', { 
          cwd: this.projectRoot 
        }).catch(e => ({ stdout: e.stdout }));
        
        if (stdout) {
          const auditResult = JSON.parse(stdout);
          metrics.dependencyVulnerabilities = auditResult.metadata?.vulnerabilities?.total || 0;
        }
      } catch {}
    }
  }

  /**
   * Check architectural integrity
   */
  private async checkArchitecture(metrics: QualityMetrics, recommendations: QualityRecommendation[]): Promise<void> {
    try {
      // Check for circular dependencies
      const { stdout } = await execAsync('npx madge --circular --extensions ts,tsx src/', { 
        cwd: this.projectRoot 
      });

      if (stdout.trim()) {
        metrics.circularDependencies = stdout.trim().split('\n');
        recommendations.push({
          type: 'warning',
          category: 'architecture',
          message: `${metrics.circularDependencies.length} circular dependencies found`,
          priority: 'medium',
          fix: 'Refactor code to eliminate circular dependencies'
        });
      }

    } catch (error) {
      // madge might not be installed, that's ok
    }

    try {
      // Check for unused exports
      const { stdout } = await execAsync('npx ts-unused-exports tsconfig.json', { 
        cwd: this.projectRoot 
      });

      if (stdout.trim()) {
        metrics.unusedExports = stdout.trim().split('\n');
        recommendations.push({
          type: 'info',
          category: 'architecture',
          message: `${metrics.unusedExports.length} unused exports found`,
          priority: 'low',
          fix: 'Remove unused exports to reduce bundle size'
        });
      }

    } catch (error) {
      // ts-unused-exports might not be installed, that's ok
    }
  }

  /**
   * Check configuration file health
   */
  private async checkConfigurationHealth(metrics: QualityMetrics, recommendations: QualityRecommendation[]): Promise<void> {
    const health = metrics.configurationHealth;

    // Check tsconfig.json
    try {
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));
      
      let score = 100;
      
      if (!tsconfig.compilerOptions?.baseUrl) {
        score -= 20;
        recommendations.push({
          type: 'error',
          category: 'typescript',
          message: 'tsconfig.json missing baseUrl',
          priority: 'high',
          fix: 'Add "baseUrl": "." to compilerOptions'
        });
      }

      if (!tsconfig.compilerOptions?.paths) {
        score -= 10;
        recommendations.push({
          type: 'warning',
          category: 'typescript',
          message: 'tsconfig.json missing path aliases',
          priority: 'medium',
          fix: 'Add path aliases for cleaner imports'
        });
      }

      if (tsconfig.include?.includes('**/*.ts')) {
        score -= 15;
        recommendations.push({
          type: 'warning',
          category: 'typescript',
          message: 'tsconfig.json include pattern too broad',
          priority: 'medium',
          fix: 'Restrict include to src/**/*.ts for better performance'
        });
      }

      health.tsconfig = Math.max(0, score);

    } catch (error) {
      health.tsconfig = 0;
      recommendations.push({
        type: 'error',
        category: 'typescript',
        message: 'tsconfig.json not found or invalid',
        priority: 'high',
        fix: 'Create a valid tsconfig.json file'
      });
    }

    // Check package.json
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      
      let score = 100;
      
      if (!packageJson.scripts?.['type-check']) {
        score -= 20;
        recommendations.push({
          type: 'warning',
          category: 'typescript',
          message: 'Missing type-check script in package.json',
          priority: 'medium',
          fix: 'Add "type-check": "npx tsc --noEmit" to scripts'
        });
      }

      if (!packageJson.scripts?.lint) {
        score -= 15;
        recommendations.push({
          type: 'warning',
          category: 'eslint',
          message: 'Missing lint script in package.json',
          priority: 'medium',
          fix: 'Add "lint": "npx eslint src" to scripts'
        });
      }

      health.package = Math.max(0, score);

    } catch (error) {
      health.package = 0;
    }

    // Calculate overall configuration health
    health.overall = Math.round((health.tsconfig + health.eslint + health.package + health.paths) / 4);
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(metrics: QualityMetrics): number {
    let score = 100;

    // TypeScript errors (heavy penalty)
    score -= Math.min(50, metrics.typeErrors * 2);

    // Lint errors
    score -= Math.min(20, metrics.lintErrors * 1);

    // Lint warnings
    score -= Math.min(10, metrics.lintWarnings * 0.1);

    // Test coverage
    score -= Math.max(0, (this.qaConfig.thresholds.minTestCoverage - metrics.testCoverage) * 0.5);

    // Build failure
    if (!metrics.buildSuccess) {
      score -= 30;
    }

    // Vulnerabilities
    score -= Math.min(15, metrics.dependencyVulnerabilities * 0.5);

    // Configuration health
    score = score * (metrics.configurationHealth.overall / 100);

    return Math.max(0, Math.round(score));
  }

  /**
   * Determine status based on score
   */
  private determineStatus(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  }

  /**
   * Save quality report to file
   */
  private async saveReport(report: QualityReport): Promise<void> {
    const filename = `quality-report-${Date.now()}.json`;
    const filepath = path.join(this.projectRoot, this.qaConfig.reportPath, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    // Also save latest report
    const latestPath = path.join(this.projectRoot, this.qaConfig.reportPath, 'latest.json');
    await fs.writeFile(latestPath, JSON.stringify(report, null, 2));
  }

  /**
   * Get latest quality report
   */
  async getLatestReport(): Promise<QualityReport | null> {
    try {
      const latestPath = path.join(this.projectRoot, this.qaConfig.reportPath, 'latest.json');
      const content = await fs.readFile(latestPath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Auto-fix issues where possible
   */
  async autoFix(): Promise<string[]> {
    const fixes: string[] = [];

    if (this.qaConfig.autoFix) {
      try {
        // Auto-fix ESLint issues
        await execAsync('npx eslint src --fix', { cwd: this.projectRoot });
        fixes.push('ESLint auto-fix applied');
      } catch {}

      try {
        // Auto-fix dependency vulnerabilities
        await execAsync('npm audit fix', { cwd: this.projectRoot });
        fixes.push('Dependency vulnerabilities auto-fixed');
      } catch {}
    }

    return fixes;
  }
}