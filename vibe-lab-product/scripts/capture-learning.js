#!/usr/bin/env node

/**
 * Learning Capture System
 * Automatically captures development learnings and updates documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LearningCapture {
  constructor() {
    this.learningLogPath = '../Vibe Lab/Concept-&-Inspiration/Review/Design-System-Learning-Log.md';
    this.systemLogPath = '../Vibe Lab/AI-Intelligence/memory/learning-log.md';
  }

  // Capture learning from commit messages and code changes
  captureFromGit(commitHash = 'HEAD') {
    try {
      // Get commit details
      const commitMessage = execSync(`git log -1 --pretty=format:"%s" ${commitHash}`, { encoding: 'utf8' });
      const changedFiles = execSync(`git diff-tree --no-commit-id --name-only -r ${commitHash}`, { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim() && (file.endsWith('.tsx') || file.endsWith('.jsx')));

      console.log(`📝 Analyzing commit: ${commitMessage}`);
      console.log(`📁 Changed files: ${changedFiles.length}`);

      // Detect learning patterns
      const learningPatterns = this.detectLearningPatterns(commitMessage, changedFiles);
      
      if (learningPatterns.length > 0) {
        console.log(`💡 Learning patterns detected: ${learningPatterns.length}`);
        this.updateLearningLogs(commitMessage, changedFiles, learningPatterns);
      } else {
        console.log('ℹ️  No significant learning patterns detected');
      }

    } catch (error) {
      console.error('Error capturing learning:', error.message);
    }
  }

  detectLearningPatterns(commitMessage, changedFiles) {
    const patterns = [];
    const message = commitMessage.toLowerCase();

    // Design system related patterns
    if (message.includes('fix') && (message.includes('layout') || message.includes('spacing') || message.includes('responsive'))) {
      patterns.push({
        type: 'DESIGN_SYSTEM_FIX',
        confidence: 0.8,
        description: 'Design system layout fix detected'
      });
    }

    // Component architecture patterns
    if (message.includes('refactor') && changedFiles.some(file => file.includes('component'))) {
      patterns.push({
        type: 'COMPONENT_REFACTOR',
        confidence: 0.7,
        description: 'Component architecture refactoring'
      });
    }

    // PWA compliance patterns
    if (message.includes('pwa') || message.includes('touch') || message.includes('accessibility')) {
      patterns.push({
        type: 'PWA_COMPLIANCE',
        confidence: 0.9,
        description: 'PWA compliance improvement'
      });
    }

    // Multiple failed attempts pattern (patch vs rebuild)
    if (message.includes('attempt') || message.includes('try') || message.includes('another')) {
      patterns.push({
        type: 'REPEATED_ATTEMPTS',
        confidence: 0.6,
        description: 'Multiple attempts detected - possible architectural issue'
      });
    }

    return patterns;
  }

  updateLearningLogs(commitMessage, changedFiles, patterns) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Create learning entry
    const learningEntry = this.createLearningEntry(timestamp, commitMessage, changedFiles, patterns);
    
    console.log('📝 Updating learning logs...');
    
    // Update design system learning log
    this.appendToLearningLog(learningEntry);
    
    // Update system intelligence log
    this.updateSystemIntelligence(timestamp, patterns);
    
    console.log('✅ Learning captured successfully');
  }

  createLearningEntry(timestamp, commitMessage, changedFiles, patterns) {
    return `
## ${timestamp} | ${commitMessage}

### 📊 **Pattern Analysis**
${patterns.map(pattern => 
  `- **${pattern.type}**: ${pattern.description} (confidence: ${Math.round(pattern.confidence * 100)}%)`
).join('\n')}

### 📁 **Files Modified**
${changedFiles.map(file => `- ${file}`).join('\n')}

### 💡 **Learning Captured**
- Detected ${patterns.length} learning pattern(s)
- Auto-captured from git commit analysis
- Timestamp: ${new Date().toISOString()}

### 🔄 **Action Items**
- [ ] Review if this indicates a recurring pattern
- [ ] Consider if documentation updates are needed
- [ ] Evaluate if new automation rules should be added

---
`;
  }

  appendToLearningLog(entry) {
    try {
      const logPath = path.resolve(__dirname, this.learningLogPath);
      
      if (fs.existsSync(logPath)) {
        let content = fs.readFileSync(logPath, 'utf8');
        
        // Find insertion point (after the header, before existing entries)
        const insertionPoint = content.indexOf('---\n\n## ');
        
        if (insertionPoint !== -1) {
          content = content.slice(0, insertionPoint + 5) + entry + content.slice(insertionPoint + 5);
        } else {
          content += entry;
        }
        
        fs.writeFileSync(logPath, content);
        console.log(`✅ Updated Design System Learning Log`);
      }
    } catch (error) {
      console.error('Error updating learning log:', error.message);
    }
  }

  updateSystemIntelligence(timestamp, patterns) {
    try {
      const logPath = path.resolve(__dirname, this.systemLogPath);
      
      if (fs.existsSync(logPath)) {
        let content = fs.readFileSync(logPath, 'utf8');
        
        const intelligenceEntry = `
## ${timestamp} | Auto-Captured Learning Pattern

**Pattern Types**: ${patterns.map(p => p.type).join(', ')}  
**Trigger**: Git commit analysis  
**Learning**: Automated pattern recognition from development workflow  

**System Intelligence Update**:
- Enhanced pattern recognition for ${patterns.length} development patterns
- Improved commit message analysis and learning extraction
- Automated documentation updates based on code changes

---
`;
        
        // Insert after the header
        const insertionPoint = content.indexOf('---\n\n## ');
        
        if (insertionPoint !== -1) {
          content = content.slice(0, insertionPoint + 5) + intelligenceEntry + content.slice(insertionPoint + 5);
        } else {
          content += intelligenceEntry;
        }
        
        fs.writeFileSync(logPath, content);
        console.log(`✅ Updated System Intelligence Log`);
      }
    } catch (error) {
      console.error('Error updating system log:', error.message);
    }
  }

  // Interactive learning capture for manual input
  promptForLearning() {
    console.log('🎓 Manual Learning Capture');
    console.log('What did you learn today? (describe the issue and solution)');
    
    // This would integrate with a CLI prompt library in a real implementation
    console.log('💡 Use: npm run capture:learning -- --interactive');
    console.log('📝 Or update Design-System-Learning-Log.md manually');
  }
}

// CLI usage
if (require.main === module) {
  const capture = new LearningCapture();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive')) {
    capture.promptForLearning();
  } else if (args.includes('--commit')) {
    const commitHash = args[args.indexOf('--commit') + 1] || 'HEAD';
    capture.captureFromGit(commitHash);
  } else {
    // Default: analyze latest commit
    capture.captureFromGit();
  }
}

module.exports = LearningCapture;