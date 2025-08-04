#!/usr/bin/env node

/**
 * Vibe Lab Quality Setup Script
 * 
 * Automatically configures quality assurance tools for any Vibe Lab project
 * This script is run during project initialization to ensure quality controls
 * are baked into the project from day one
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VibeLabQualitySetup {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.packageJsonPath = path.join(projectRoot, 'package.json');
    this.tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    this.eslintConfigPath = path.join(projectRoot, '.eslintrc.js');
  }

  async setup() {
    console.log('🚀 Setting up Vibe Lab Quality Assurance System...\n');

    try {
      await this.installDependencies();
      await this.setupPackageScripts();
      await this.setupTypeScriptConfig();
      await this.setupESLintConfig();
      await this.setupPreCommitHooks();
      await this.setupGitHooks();
      await this.setupQualityReporting();
      await this.setupCIConfig();
      
      console.log('\n✅ Vibe Lab Quality Assurance System setup complete!');
      console.log('\n📋 Next steps:');
      console.log('  • Run `npm run quality:check` to validate setup');
      console.log('  • Run `npm run quality:fix` to auto-fix issues');
      console.log('  • Check quality reports in ./reports/quality/');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async installDependencies() {
    console.log('📦 Installing quality assurance dependencies...');
    
    const devDependencies = [
      // TypeScript and linting
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser', 
      'eslint',
      'eslint-config-next',
      'eslint-plugin-import',
      
      // Git hooks
      'husky',
      'lint-staged',
      
      // Architecture analysis
      'madge',
      'ts-unused-exports',
      
      // Testing
      '@jest/globals',
      'jest',
      'ts-jest',
      
      // Security
      'audit-ci'
    ];

    try {
      execSync(`npm install --save-dev ${devDependencies.join(' ')}`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  async setupPackageScripts() {
    console.log('⚙️  Setting up package.json scripts...');
    
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    
    // Add quality assurance scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      
      // Core quality checks
      'type-check': 'npx tsc --noEmit',
      'type-check:watch': 'npx tsc --noEmit --watch', 
      'lint': 'npx eslint src --ext .ts,.tsx',
      'lint:fix': 'npx eslint src --ext .ts,.tsx --fix',
      
      // Comprehensive quality checks
      'quality:check': 'npm run type-check && npm run lint && npm run test:ci',
      'quality:fix': 'npm run lint:fix && npm audit fix',
      'quality:report': 'node scripts/generate-quality-report.js',
      
      // Architecture analysis
      'arch:deps': 'npx madge --circular --extensions ts,tsx src/',
      'arch:unused': 'npx ts-unused-exports tsconfig.json',
      'arch:analyze': 'npm run arch:deps && npm run arch:unused',
      
      // Security
      'security:audit': 'npx audit-ci --config audit-ci.json',
      'security:check': 'npm audit && npx audit-ci',
      
      // Testing
      'test:ci': 'jest --coverage --watchAll=false',
      'test:watch': 'jest --watch',
      
      // Pre-commit validation
      'pre-commit': 'npm run quality:check',
      'validate': 'npm run quality:check && npm run arch:analyze && npm run security:check'
    };

    // Add lint-staged configuration
    packageJson['lint-staged'] = {
      '*.{ts,tsx}': [
        'npx tsc --noEmit',
        'eslint --fix',
        'git add'
      ],
      '*.{js,jsx,ts,tsx,json,md}': [
        'prettier --write',
        'git add'
      ]
    };

    // Add husky configuration
    packageJson.husky = {
      hooks: {
        'pre-commit': 'lint-staged',
        'pre-push': 'npm run quality:check'
      }
    };

    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Package scripts configured');
  }

  async setupTypeScriptConfig() {
    console.log('🔧 Optimizing TypeScript configuration...');
    
    let tsconfig;
    
    if (fs.existsSync(this.tsconfigPath)) {
      tsconfig = JSON.parse(fs.readFileSync(this.tsconfigPath, 'utf8'));
    } else {
      tsconfig = {
        compilerOptions: {},
        include: [],
        exclude: []
      };
    }

    // Ensure optimal TypeScript configuration
    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      
      // Essential settings
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      
      // Critical for path resolution
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*']
      },
      
      // Enhanced type checking
      noUnusedLocals: true,
      noUnusedParameters: true,
      exactOptionalPropertyTypes: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      
      // Next.js specific
      plugins: [{ name: 'next' }]
    };

    // Optimal include/exclude patterns
    tsconfig.include = [
      'next-env.d.ts',
      'src/**/*.ts',
      'src/**/*.tsx',
      '.next/types/**/*.ts'
    ];

    tsconfig.exclude = [
      'node_modules',
      '.next',
      'out',
      'dist',
      'src/app/_archive'
    ];

    fs.writeFileSync(this.tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('✅ TypeScript configuration optimized');
  }

  async setupESLintConfig() {
    console.log('🔍 Setting up ESLint configuration...');
    
    const eslintConfig = {
      extends: [
        'next/core-web-vitals',
        '@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript'
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'import'],
      rules: {
        // TypeScript specific
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/prefer-const': 'error',
        
        // Import organization
        'import/order': ['error', {
          groups: [
            'builtin',
            'external', 
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' }
        }],
        'import/no-unresolved': 'error',
        'import/no-cycle': 'error',
        
        // Code quality
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'error',
        'no-var': 'error',
        
        // Vibe Lab specific architectural rules
        'no-restricted-imports': ['error', {
          patterns: [
            {
              group: ['../../*'],
              message: 'Use absolute imports with @/ instead of relative imports going up multiple levels'
            }
          ]
        }]
      },
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: './tsconfig.json'
          }
        }
      },
      overrides: [
        {
          files: ['*.test.ts', '*.test.tsx'],
          rules: {
            '@typescript-eslint/no-explicit-any': 'off'
          }
        }
      ]
    };

    fs.writeFileSync(this.eslintConfigPath, `module.exports = ${JSON.stringify(eslintConfig, null, 2)};`);
    console.log('✅ ESLint configuration created');
  }

  async setupPreCommitHooks() {
    console.log('🪝 Setting up pre-commit hooks...');
    
    try {
      // Initialize husky
      execSync('npx husky install', { cwd: this.projectRoot, stdio: 'inherit' });
      
      // Create pre-commit hook
      execSync('npx husky add .husky/pre-commit "npx lint-staged"', { 
        cwd: this.projectRoot, 
        stdio: 'inherit' 
      });
      
      // Create pre-push hook
      execSync('npx husky add .husky/pre-push "npm run quality:check"', { 
        cwd: this.projectRoot, 
        stdio: 'inherit' 
      });
      
      console.log('✅ Git hooks configured');
    } catch (error) {
      console.warn('⚠️  Git hooks setup failed (not critical):', error.message);
    }
  }

  async setupGitHooks() {
    console.log('📝 Creating Git hook integration...');
    
    // Create commit message template
    const commitTemplate = `# Vibe Lab Commit Template
# 
# Format: <type>(<scope>): <description>
#
# Types:
#   feat: New feature
#   fix: Bug fix  
#   docs: Documentation
#   style: Formatting
#   refactor: Code restructure
#   test: Adding tests
#   chore: Maintenance
#
# Example: feat(auth): add user authentication system
#
# Quality checks will run automatically before commit.
# Ensure all checks pass before committing.`;

    fs.writeFileSync(path.join(this.projectRoot, '.gitmessage'), commitTemplate);
    
    // Configure git to use the template
    try {
      execSync('git config commit.template .gitmessage', { cwd: this.projectRoot });
      console.log('✅ Git commit template configured');
    } catch (error) {
      console.warn('⚠️  Git config failed (not critical):', error.message);
    }
  }

  async setupQualityReporting() {
    console.log('📊 Setting up quality reporting...');
    
    // Create reports directory
    const reportsDir = path.join(this.projectRoot, 'reports', 'quality');
    fs.mkdirSync(reportsDir, { recursive: true });
    
    // Create quality report generator script
    const reportGenerator = `#!/usr/bin/env node

/**
 * Vibe Lab Quality Report Generator
 * Generates comprehensive quality reports for the project
 */

const { QualityAssuranceService } = require('../src/lib/avca/services/quality-assurance-service');
const { EventBus } = require('../src/lib/avca/services/event-bus');

async function generateReport() {
  const eventBus = new EventBus();
  
  const qaService = new QualityAssuranceService({
    name: 'quality-assurance',
    version: '1.0.0',
    projectRoot: process.cwd(),
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
    reportPath: './reports/quality'
  }, eventBus);

  try {
    await qaService.start();
    const report = await qaService.process({ action: 'analyze' });
    
    console.log('\\n📊 Quality Report Generated');
    console.log('='.repeat(50));
    console.log(\`📈 Overall Score: \${report.score}/100\`);
    console.log(\`🎯 Status: \${report.status.toUpperCase()}\`);
    console.log(\`🔧 TypeScript Errors: \${report.metrics.typeErrors}\`);
    console.log(\`⚠️  ESLint Errors: \${report.metrics.lintErrors}\`);
    console.log(\`🧪 Test Coverage: \${report.metrics.testCoverage}%\`);
    console.log(\`🏗️  Build Success: \${report.metrics.buildSuccess ? '✅' : '❌'}\`);
    console.log(\`🔒 Vulnerabilities: \${report.metrics.dependencyVulnerabilities}\`);
    
    if (report.recommendations.length > 0) {
      console.log('\\n📋 Top Recommendations:');
      report.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(\`  \${i + 1}. [\${rec.priority.toUpperCase()}] \${rec.message}\`);
      });
    }
    
    console.log(\`\\n📄 Full report saved to: reports/quality/latest.json\`);
    
  } catch (error) {
    console.error('❌ Failed to generate quality report:', error.message);
    process.exit(1);
  } finally {
    await qaService.stop();
  }
}

generateReport();`;

    fs.writeFileSync(
      path.join(this.projectRoot, 'scripts', 'generate-quality-report.js'), 
      reportGenerator
    );
    
    // Create audit-ci configuration
    const auditConfig = {
      moderate: false,
      high: false,
      critical: false,
      allowlist: []
    };
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'audit-ci.json'),
      JSON.stringify(auditConfig, null, 2)  
    );
    
    console.log('✅ Quality reporting configured');
  }

  async setupCIConfig() {
    console.log('🔄 Creating CI/CD configuration...');
    
    // Create GitHub Actions workflow for quality checks
    const githubDir = path.join(this.projectRoot, '.github', 'workflows');
    fs.mkdirSync(githubDir, { recursive: true });
    
    const qualityWorkflow = `name: Vibe Lab Quality Assurance

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: TypeScript type checking
      run: npm run type-check
      
    - name: ESLint analysis  
      run: npm run lint
      
    - name: Security audit
      run: npm run security:check
      
    - name: Architecture analysis
      run: npm run arch:analyze
      
    - name: Run tests with coverage
      run: npm run test:ci
      
    - name: Build project
      run: npm run build
      
    - name: Generate quality report
      run: npm run quality:report
      
    - name: Upload quality reports
      uses: actions/upload-artifact@v3
      with:
        name: quality-reports-\${{ matrix.node-version }}
        path: reports/quality/
        
    - name: Comment PR with quality report
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const report = JSON.parse(fs.readFileSync('reports/quality/latest.json', 'utf8'));
          
          const comment = \`## 📊 Quality Report
          
**Overall Score:** \${report.score}/100 (\${report.status.toUpperCase()})

**Metrics:**
- 🔧 TypeScript Errors: \${report.metrics.typeErrors}
- ⚠️ ESLint Errors: \${report.metrics.lintErrors}  
- 🧪 Test Coverage: \${report.metrics.testCoverage}%
- 🏗️ Build: \${report.metrics.buildSuccess ? '✅ Success' : '❌ Failed'}
- 🔒 Vulnerabilities: \${report.metrics.dependencyVulnerabilities}

\${report.recommendations.length > 0 ? \`
**Top Recommendations:**
\${report.recommendations.slice(0, 3).map(r => \`- [\${r.priority.toUpperCase()}] \${r.message}\`).join('\\n')}
\` : '✅ No issues found!'}
          \`;
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });`;

    fs.writeFileSync(
      path.join(githubDir, 'quality-check.yml'), 
      qualityWorkflow
    );
    
    console.log('✅ CI/CD configuration created');
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new VibeLabQualitySetup();
  setup.setup().catch(console.error);
}

module.exports = { VibeLabQualitySetup };