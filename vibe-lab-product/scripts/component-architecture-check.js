#!/usr/bin/env node

/**
 * Component Architecture Validator
 * Checks for proper component composition and design system compliance
 */

const fs = require('fs');
const path = require('path');

class ComponentArchitectureChecker {
  constructor() {
    this.violations = [];
    this.suggestions = [];
  }

  checkComponents(directory = 'src/components') {
    const files = this.getComponentFiles(directory);
    
    for (const file of files) {
      this.checkFile(file);
    }

    return this.generateReport();
  }

  getComponentFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.getComponentFiles(fullPath, files);
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // 1. Check for monolithic components (too long)
    this.checkComponentLength(content, fileName);
    
    // 2. Check for proper TypeScript interfaces
    this.checkTypeScript(content, fileName);
    
    // 3. Check for design token usage
    this.checkDesignTokens(content, fileName);
    
    // 4. Check for component composition patterns
    this.checkComposition(content, fileName);
    
    // 5. Check for systematic spacing
    this.checkSpacing(content, fileName);
  }

  checkComponentLength(content, fileName) {
    const lines = content.split('\n').length;
    
    if (lines > 200) {
      this.violations.push({
        file: fileName,
        type: 'COMPONENT_TOO_LARGE',
        message: `Component has ${lines} lines. Consider breaking into smaller components (max 200 lines)`,
        severity: 'error'
      });
    } else if (lines > 150) {
      this.suggestions.push({
        file: fileName,
        type: 'COMPONENT_LARGE',
        message: `Component has ${lines} lines. Consider refactoring for better maintainability`,
        severity: 'warning'
      });
    }
  }

  checkTypeScript(content, fileName) {
    // Check for proper interface definitions
    if (content.includes('Props') && !content.includes('interface')) {
      this.violations.push({
        file: fileName,
        type: 'MISSING_INTERFACE',
        message: 'Components should define TypeScript interfaces for props',
        severity: 'error'
      });
    }

    // Check for any usage
    if (content.includes(': any')) {
      this.violations.push({
        file: fileName,
        type: 'ANY_TYPE_USAGE',
        message: 'Avoid using "any" type. Define specific types for better type safety',
        severity: 'error'
      });
    }
  }

  checkDesignTokens(content, fileName) {
    // Check for magic numbers in spacing
    const magicNumberPattern = /className="[^"]*(?:p|m|gap|space)-\d{2,}[^"]*"/g;
    
    if (magicNumberPattern.test(content)) {
      this.suggestions.push({
        file: fileName,
        type: 'MAGIC_SPACING',
        message: 'Consider using systematic spacing scale (1-8) instead of large numeric values',
        severity: 'warning'
      });
    }

    // Check for hardcoded colors
    const hardcodedColorPattern = /#[0-9a-fA-F]{3,6}/g;
    
    if (hardcodedColorPattern.test(content)) {
      this.violations.push({
        file: fileName,
        type: 'HARDCODED_COLORS',
        message: 'Use design tokens or Tailwind color classes instead of hardcoded hex values',
        severity: 'error'
      });
    }
  }

  checkComposition(content, fileName) {
    // Check for proper component composition
    if (content.includes('children') && !content.includes('ReactNode')) {
      this.suggestions.push({
        file: fileName,
        type: 'CHILDREN_TYPE',
        message: 'Import ReactNode from React for proper children typing',
        severity: 'warning'
      });
    }

    // Check for render prop patterns
    if (content.includes('render') && content.includes('=>')) {
      this.suggestions.push({
        file: fileName,
        type: 'RENDER_PROP',
        message: 'Consider using compound components instead of render props for better composition',
        severity: 'info'
      });
    }
  }

  checkSpacing(content, fileName) {
    // Check for inconsistent spacing patterns
    const spacingPatterns = [
      { pattern: /gap-1.*gap-2.*gap-3/g, message: 'Inconsistent gap usage detected' },
      { pattern: /p-1.*p-3.*p-2/g, message: 'Inconsistent padding usage detected' },
      { pattern: /m-1.*m-4.*m-2/g, message: 'Inconsistent margin usage detected' }
    ];

    for (const { pattern, message } of spacingPatterns) {
      if (pattern.test(content)) {
        this.suggestions.push({
          file: fileName,
          type: 'INCONSISTENT_SPACING',
          message: `${message}. Use systematic spacing scale`,
          severity: 'warning'
        });
      }
    }
  }

  generateReport() {
    const total = this.violations.length + this.suggestions.length;
    
    if (total === 0) {
      console.log('✅ All components pass architecture checks!');
      return { success: true, violations: [], suggestions: [] };
    }

    console.log('\n🏗️  Component Architecture Issues Found:\n');
    
    // Show violations (errors)
    if (this.violations.length > 0) {
      console.log('❌ VIOLATIONS:');
      this.violations.forEach(violation => {
        console.log(`  ${violation.file}: ${violation.message}`);
      });
    }

    // Show suggestions (warnings/info)
    if (this.suggestions.length > 0) {
      console.log('\n💡 SUGGESTIONS:');
      this.suggestions.forEach(suggestion => {
        console.log(`  ${suggestion.file}: ${suggestion.message}`);
      });
    }

    console.log(`\nTotal issues: ${total} (${this.violations.length} violations, ${this.suggestions.length} suggestions)`);
    
    return {
      success: this.violations.length === 0,
      violations: this.violations,
      suggestions: this.suggestions
    };
  }
}

// CLI usage
if (require.main === module) {
  const checker = new ComponentArchitectureChecker();
  const report = checker.checkComponents();
  
  // Exit with error code only for violations, not suggestions
  process.exit(report.success ? 0 : 1);
}

module.exports = ComponentArchitectureChecker;