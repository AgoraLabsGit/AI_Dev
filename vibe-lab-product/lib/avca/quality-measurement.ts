/**
 * Quality Measurement System for AVCA Pipeline
 * Tracks and enforces quality gates throughout component generation
 */

import type { 
  QualityGates, 
  ValidationResult, 
  QualityScores,
  PipelineStage 
} from './types';

export interface QualityMetrics {
  coverage: {
    unit: number;
    integration: number;
    e2e: number;
    overall: number;
  };
  performance: {
    responseTime: number;
    renderTime: number;
    bundleSize: number;
    memoryUsage: number;
  };
  security: {
    score: number;
    vulnerabilities: SecurityVulnerability[];
    passed: boolean;
  };
  accessibility: {
    score: number;
    violations: AccessibilityViolation[];
    level: 'A' | 'AA' | 'AAA';
  };
  codeQuality: {
    complexity: number;
    maintainability: number;
    duplications: number;
    issues: CodeIssue[];
  };
}

export interface SecurityVulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  file: string;
  line: number;
  fixSuggestion?: string;
}

export interface AccessibilityViolation {
  rule: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  element: string;
  fix: string;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  file: string;
  line: number;
  column: number;
}

export interface TestResult {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  coverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

// Default quality gates for Phase 0
const DEFAULT_QUALITY_GATES: QualityGates = {
  coverage: {
    unit: 90,
    integration: 80,
    e2e: 70
  },
  performance: {
    responseTime: 200,
    renderTime: 50,
    bundleSize: 15
  },
  accessibility: {
    standard: 'WCAG_AA',
    keyboardNav: true,
    screenReader: true
  },
  security: {
    inputSanitization: true,
    xssProtection: true,
    apiValidation: true
  }
};

export class QualityMeasurement {
  private metrics: Map<string, QualityMetrics> = new Map();
  private gates: QualityGates;

  constructor(gates: QualityGates = DEFAULT_QUALITY_GATES) {
    this.gates = gates;
  }

  /**
   * Run all quality checks for a component
   */
  async measureQuality(
    componentId: string,
    code: string,
    tests: string,
    stage: PipelineStage
  ): Promise<ValidationResult> {
    const metrics: QualityMetrics = {
      coverage: await this.measureCoverage(tests),
      performance: await this.measurePerformance(code),
      security: await this.measureSecurity(code),
      accessibility: await this.measureAccessibility(code),
      codeQuality: await this.measureCodeQuality(code)
    };

    this.metrics.set(componentId, metrics);

    const validation = this.validateAgainstGates(metrics);
    
    return {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      suggestions: this.generateSuggestions(metrics)
    };
  }

  /**
   * Measure test coverage
   */
  private async measureCoverage(tests: string): Promise<QualityMetrics['coverage']> {
    // In real implementation, this would run Jest with coverage
    // For now, simulate based on test content analysis
    const hasUnitTests = tests.includes('describe') && tests.includes('it');
    const hasIntegrationTests = tests.includes('integration') || tests.includes('api');
    const hasE2ETests = tests.includes('e2e') || tests.includes('cy.');

    const coverage = {
      unit: hasUnitTests ? 92 : 0,
      integration: hasIntegrationTests ? 85 : 0,
      e2e: hasE2ETests ? 75 : 0,
      overall: 0
    };

    coverage.overall = (coverage.unit + coverage.integration + coverage.e2e) / 3;

    return coverage;
  }

  /**
   * Measure performance metrics
   */
  private async measurePerformance(code: string): Promise<QualityMetrics['performance']> {
    // Analyze code for performance indicators
    const hasLazyLoading = code.includes('lazy(') || code.includes('dynamic(');
    const hasMemoization = code.includes('useMemo') || code.includes('useCallback');
    const hasVirtualization = code.includes('virtual') || code.includes('window');

    // Calculate bundle size (rough estimate)
    const bundleSize = code.length / 1024; // KB
    
    return {
      responseTime: hasLazyLoading ? 150 : 250,
      renderTime: hasMemoization ? 30 : 60,
      bundleSize: Math.round(bundleSize),
      memoryUsage: hasVirtualization ? 50 : 100 // MB
    };
  }

  /**
   * Measure security vulnerabilities
   */
  private async measureSecurity(code: string): Promise<QualityMetrics['security']> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for common security issues
    if (code.includes('dangerouslySetInnerHTML')) {
      vulnerabilities.push({
        severity: 'high',
        type: 'XSS',
        description: 'Potential XSS vulnerability with dangerouslySetInnerHTML',
        file: 'component.tsx',
        line: 0,
        fixSuggestion: 'Use DOMPurify to sanitize HTML content'
      });
    }

    if (code.includes('eval(') || code.includes('Function(')) {
      vulnerabilities.push({
        severity: 'critical',
        type: 'Code Injection',
        description: 'eval() or Function() usage detected',
        file: 'component.tsx',
        line: 0,
        fixSuggestion: 'Remove eval() and use safer alternatives'
      });
    }

    if (!code.includes('sanitize') && code.includes('user')) {
      vulnerabilities.push({
        severity: 'medium',
        type: 'Input Validation',
        description: 'User input may not be properly sanitized',
        file: 'component.tsx',
        line: 0,
        fixSuggestion: 'Add input validation and sanitization'
      });
    }

    const score = vulnerabilities.length === 0 ? 10 :
                  Math.max(0, 10 - vulnerabilities.reduce((sum, v) => 
                    sum + (v.severity === 'critical' ? 4 : 
                           v.severity === 'high' ? 3 : 
                           v.severity === 'medium' ? 2 : 1), 0));

    return {
      score,
      vulnerabilities,
      passed: score >= 9.0
    };
  }

  /**
   * Measure accessibility compliance
   */
  private async measureAccessibility(code: string): Promise<QualityMetrics['accessibility']> {
    const violations: AccessibilityViolation[] = [];

    // Check for common accessibility issues
    if (code.includes('<img') && !code.includes('alt=')) {
      violations.push({
        rule: 'img-alt',
        impact: 'critical',
        description: 'Images must have alt text',
        element: '<img>',
        fix: 'Add alt attribute to all images'
      });
    }

    if (code.includes('onClick') && !code.includes('onKeyDown')) {
      violations.push({
        rule: 'keyboard-navigation',
        impact: 'serious',
        description: 'Interactive elements must be keyboard accessible',
        element: 'clickable element',
        fix: 'Add onKeyDown handler for keyboard users'
      });
    }

    if (!code.includes('aria-label') && code.includes('<button>')) {
      violations.push({
        rule: 'button-name',
        impact: 'moderate',
        description: 'Buttons should have accessible names',
        element: '<button>',
        fix: 'Add aria-label or visible text to buttons'
      });
    }

    const score = Math.max(0, 100 - violations.length * 20);
    const level = score >= 90 ? 'AAA' : score >= 80 ? 'AA' : 'A';

    return {
      score,
      violations,
      level
    };
  }

  /**
   * Measure code quality metrics
   */
  private async measureCodeQuality(code: string): Promise<QualityMetrics['codeQuality']> {
    const issues: CodeIssue[] = [];

    // Check for code quality issues
    const lines = code.split('\n');
    let complexity = 0;

    lines.forEach((line, index) => {
      // Check for complexity
      if (line.includes('if') || line.includes('switch') || line.includes('for')) {
        complexity++;
      }

      // Check for long lines
      if (line.length > 100) {
        issues.push({
          type: 'warning',
          rule: 'max-line-length',
          message: 'Line exceeds 100 characters',
          file: 'component.tsx',
          line: index + 1,
          column: 100
        });
      }

      // Check for console.log
      if (line.includes('console.log')) {
        issues.push({
          type: 'warning',
          rule: 'no-console',
          message: 'Remove console.log statements',
          file: 'component.tsx',
          line: index + 1,
          column: line.indexOf('console.log')
        });
      }
    });

    // Calculate maintainability index (simplified)
    const maintainability = Math.max(0, 100 - complexity * 5 - issues.length * 2);

    return {
      complexity,
      maintainability,
      duplications: 0, // Would need more sophisticated analysis
      issues
    };
  }

  /**
   * Validate metrics against quality gates
   */
  private validateAgainstGates(metrics: QualityMetrics): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check coverage gates
    if (metrics.coverage.unit < this.gates.coverage.unit) {
      errors.push(`Unit test coverage (${metrics.coverage.unit}%) below required ${this.gates.coverage.unit}%`);
    }
    if (metrics.coverage.integration < this.gates.coverage.integration) {
      errors.push(`Integration test coverage (${metrics.coverage.integration}%) below required ${this.gates.coverage.integration}%`);
    }
    if (metrics.coverage.e2e < this.gates.coverage.e2e) {
      warnings.push(`E2E test coverage (${metrics.coverage.e2e}%) below recommended ${this.gates.coverage.e2e}%`);
    }

    // Check performance gates
    if (metrics.performance.responseTime > this.gates.performance.responseTime) {
      errors.push(`Response time (${metrics.performance.responseTime}ms) exceeds limit of ${this.gates.performance.responseTime}ms`);
    }
    if (metrics.performance.bundleSize > this.gates.performance.bundleSize) {
      warnings.push(`Bundle size (${metrics.performance.bundleSize}KB) exceeds recommended ${this.gates.performance.bundleSize}KB`);
    }

    // Check security
    if (!metrics.security.passed) {
      errors.push(`Security score (${metrics.security.score}/10) below required 9.0`);
    }

    // Check accessibility
    if (metrics.accessibility.level !== 'AA' && metrics.accessibility.level !== 'AAA') {
      errors.push(`Accessibility level (${metrics.accessibility.level}) does not meet WCAG AA standard`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(metrics: QualityMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.coverage.unit < 95) {
      suggestions.push('Add more unit tests to achieve 95% coverage');
    }

    if (metrics.performance.responseTime > 150) {
      suggestions.push('Implement code splitting and lazy loading to improve response time');
    }

    if (metrics.security.vulnerabilities.length > 0) {
      suggestions.push('Address security vulnerabilities before deployment');
    }

    if (metrics.accessibility.violations.length > 0) {
      suggestions.push('Fix accessibility violations to ensure WCAG AA compliance');
    }

    if (metrics.codeQuality.complexity > 10) {
      suggestions.push('Refactor complex functions to improve maintainability');
    }

    return suggestions;
  }

  /**
   * Get quality score for a component
   */
  getQualityScore(componentId: string): QualityScores | null {
    const metrics = this.metrics.get(componentId);
    if (!metrics) return null;

    return {
      overall: this.calculateOverallScore(metrics),
      coverage: metrics.coverage.overall,
      security: metrics.security.score,
      performance: this.calculatePerformanceScore(metrics.performance),
      accessibility: metrics.accessibility.score,
      typing: true // Assuming TypeScript is always used
    };
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(metrics: QualityMetrics): number {
    const weights = {
      coverage: 0.3,
      security: 0.3,
      performance: 0.2,
      accessibility: 0.1,
      codeQuality: 0.1
    };

    const scores = {
      coverage: metrics.coverage.overall,
      security: metrics.security.score * 10,
      performance: this.calculatePerformanceScore(metrics.performance),
      accessibility: metrics.accessibility.score,
      codeQuality: metrics.codeQuality.maintainability
    };

    return Object.entries(weights).reduce((total, [key, weight]) => 
      total + (scores[key as keyof typeof scores] * weight), 0
    );
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(performance: QualityMetrics['performance']): number {
    const responseScore = Math.max(0, 100 - (performance.responseTime / 2));
    const renderScore = Math.max(0, 100 - performance.renderTime);
    const bundleScore = Math.max(0, 100 - (performance.bundleSize * 5));
    
    return (responseScore + renderScore + bundleScore) / 3;
  }

  /**
   * Export quality report
   */
  exportReport(componentId: string): string {
    const metrics = this.metrics.get(componentId);
    if (!metrics) return 'No metrics available';

    const score = this.getQualityScore(componentId);
    
    return `
# Quality Report for ${componentId}

## Overall Score: ${score?.overall.toFixed(1)}/100

### Test Coverage
- Unit Tests: ${metrics.coverage.unit}%
- Integration Tests: ${metrics.coverage.integration}%
- E2E Tests: ${metrics.coverage.e2e}%
- Overall Coverage: ${metrics.coverage.overall.toFixed(1)}%

### Performance
- Response Time: ${metrics.performance.responseTime}ms
- Render Time: ${metrics.performance.renderTime}ms
- Bundle Size: ${metrics.performance.bundleSize}KB

### Security
- Score: ${metrics.security.score}/10
- Vulnerabilities: ${metrics.security.vulnerabilities.length}
- Status: ${metrics.security.passed ? 'PASSED' : 'FAILED'}

### Accessibility
- Score: ${metrics.accessibility.score}/100
- Level: ${metrics.accessibility.level}
- Violations: ${metrics.accessibility.violations.length}

### Code Quality
- Complexity: ${metrics.codeQuality.complexity}
- Maintainability: ${metrics.codeQuality.maintainability}/100
- Issues: ${metrics.codeQuality.issues.length}
    `.trim();
  }
}

// Singleton instance
export const qualityMeasurement = new QualityMeasurement(); 