#!/usr/bin/env node

/**
 * PWA Compliance Checker
 * Automatically validates components against PWA standards
 * Runs on file changes and in git hooks
 */

const fs = require('fs');
const path = require('path');

class PWAComplianceChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
  }

  // Check all React component files
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

    console.log(`Checking ${fileName}...`);

    // 1. Check for minimum touch targets (44px)
    this.checkTouchTargets(content, fileName);
    
    // 2. Check for semantic HTML
    this.checkSemanticHTML(content, fileName);
    
    // 3. Check for mobile-first responsive design
    this.checkResponsiveDesign(content, fileName);
    
    // 4. Check for accessibility attributes
    this.checkAccessibility(content, fileName);
    
    // 5. Check for complex layout patterns
    this.checkLayoutComplexity(content, fileName);
  }

  checkTouchTargets(content, fileName) {
    // Look for interactive elements with insufficient size
    const buttonPatterns = [
      /className="[^"]*p-1[^"]*"/g,  // p-1 = 4px padding = too small
      /className="[^"]*p-1\.5[^"]*"/g,  // p-1.5 = 6px padding = too small
      /className="[^"]*w-6[^"]*"/g,  // w-6 = 24px = too small
      /className="[^"]*h-6[^"]*"/g,  // h-6 = 24px = too small
      /className="[^"]*w-8[^"]*"/g,  // w-8 = 32px = too small
      /className="[^"]*h-8[^"]*"/g,  // h-8 = 32px = too small
    ];

    for (const pattern of buttonPatterns) {
      if (pattern.test(content)) {
        this.violations.push({
          file: fileName,
          type: 'TOUCH_TARGET_TOO_SMALL',
          message: 'Interactive elements must be minimum 44px (w-11 h-11 or p-2.5)',
          severity: 'error'
        });
      }
    }
  }

  checkSemanticHTML(content, fileName) {
    // Check for div soup instead of semantic elements
    const divSoupPattern = /<div className="[^"]*">\s*<div className="[^"]*">\s*<div className="[^"]*">/g;
    
    if (divSoupPattern.test(content)) {
      this.warnings.push({
        file: fileName,
        type: 'SEMANTIC_HTML',
        message: 'Consider using semantic HTML elements (header, nav, button, section) instead of nested divs',
        severity: 'warning'
      });
    }

    // Check for missing button elements
    if (content.includes('onClick') && !content.includes('<button')) {
      this.violations.push({
        file: fileName,
        type: 'MISSING_BUTTON_ELEMENT',
        message: 'Interactive elements should use <button> tag for accessibility',
        severity: 'error'
      });
    }
  }

  checkResponsiveDesign(content, fileName) {
    // Check for non-mobile-first patterns
    const nonMobileFirstPatterns = [
      /hidden\s+sm:block/g,  // Content hiding instead of reflow
      /md:hidden/g,          // Desktop-first hiding
      /lg:hidden/g,          // Desktop-first hiding
    ];

    for (const pattern of nonMobileFirstPatterns) {
      if (pattern.test(content)) {
        this.warnings.push({
          file: fileName,
          type: 'NON_MOBILE_FIRST',
          message: 'Consider responsive reflow instead of hiding content',
          severity: 'warning'
        });
      }
    }
  }

  checkAccessibility(content, fileName) {
    // Check for missing ARIA labels on interactive elements
    if (content.includes('<button') && !content.includes('aria-label') && !content.includes('title=')) {
      this.warnings.push({
        file: fileName,
        type: 'MISSING_ARIA_LABELS',
        message: 'Interactive elements should have aria-label or title attributes',
        severity: 'warning'
      });
    }
  }

  checkLayoutComplexity(content, fileName) {
    // Check for complex flexbox patterns that indicate architectural issues
    const complexPatterns = [
      /justify-between.*flex-1.*min-w-0/g,  // The exact pattern that caused our issues
      /flex.*justify-between.*gap-.*mr-/g,  // Mixed layout methods
    ];

    for (const pattern of complexPatterns) {
      if (pattern.test(content)) {
        this.violations.push({
          file: fileName,
          type: 'COMPLEX_LAYOUT',
          message: 'Complex flexbox pattern detected. Consider CSS Grid for more predictable layout',
          severity: 'error'
        });
      }
    }
  }

  generateReport() {
    const total = this.violations.length + this.warnings.length;
    
    if (total === 0) {
      console.log('✅ All components pass PWA compliance checks!');
      return { success: true, violations: [], warnings: [] };
    }

    console.log('\n🚨 PWA Compliance Issues Found:\n');
    
    // Show violations (errors)
    if (this.violations.length > 0) {
      console.log('❌ ERRORS:');
      this.violations.forEach(violation => {
        console.log(`  ${violation.file}: ${violation.message}`);
      });
    }

    // Show warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file}: ${warning.message}`);
      });
    }

    console.log(`\nTotal issues: ${total} (${this.violations.length} errors, ${this.warnings.length} warnings)`);
    
    // Return report for programmatic use
    return {
      success: this.violations.length === 0,
      violations: this.violations,
      warnings: this.warnings
    };
  }
}

// CLI usage
if (require.main === module) {
  const checker = new PWAComplianceChecker();
  const report = checker.checkComponents();
  
  // Exit with error code if violations found
  process.exit(report.success ? 0 : 1);
}

module.exports = PWAComplianceChecker;