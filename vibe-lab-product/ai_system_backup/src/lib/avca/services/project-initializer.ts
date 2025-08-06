/**
 * Vibe Lab Project Initializer
 * 
 * Automatically sets up new Vibe Lab projects with:
 * - Quality assurance tools baked in
 * - Proper TypeScript configuration
 * - Pre-commit hooks and CI/CD
 * - Architectural compliance monitoring
 */

import { BaseService, ServiceConfig } from './base-service';
import { BlueprintService } from './blueprint-service';
import { QualityOrchestrator } from '@/lib/dias/services/quality-orchestrator';
import { EventBus } from './event-bus';
import { UserIntent } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ProjectInitializationConfig extends ServiceConfig {
  templateRepository?: string;
  defaultBranch: string;
  qualitySetup: {
    enabled: boolean;
    autoFix: boolean;
    strictMode: boolean;
    ciIntegration: boolean;
  };
  integrations: {
    github: boolean;
    vercel: boolean;
    docker: boolean;
  };
}

export interface ProjectSetupResult {
  success: boolean;
  projectPath: string;
  qualityScore: number;
  setupTime: number;
  installedTools: string[];
  errors: string[];
  warnings: string[];
  nextSteps: string[];
}

export class ProjectInitializer extends BaseService {
  private blueprintService: BlueprintService;
  private qualityOrchestrator: QualityOrchestrator;
  private eventBus: EventBus;
  private initConfig: ProjectInitializationConfig;

  constructor(config: ProjectInitializationConfig, eventBus: EventBus) {
    super({
      name: 'project-initializer',
      version: '1.0.0',
      dependencies: ['blueprint-service', 'quality-orchestrator']
    });

    this.initConfig = {
      defaultBranch: 'main',
      qualitySetup: {
        enabled: true,
        autoFix: false,
        strictMode: false,
        ciIntegration: true
      },
      integrations: {
        github: true,
        vercel: false,
        docker: false
      },
      ...config
    };

    this.eventBus = eventBus;
    this.blueprintService = new BlueprintService({ 
      name: 'blueprint-service', 
      version: '1.0.0' 
    });
    
    this.qualityOrchestrator = new QualityOrchestrator({
      name: 'quality-orchestrator',
      version: '1.0.0',
      projectRoot: process.cwd(),
      autoRemediation: this.initConfig.qualitySetup.autoFix,
      qualityGates: {
        preCommit: true,
        preBuild: true,
        preDeployment: true
      }
    }, eventBus);
  }

  protected async initialize(): Promise<void> {
    await this.blueprintService.start();
    await this.qualityOrchestrator.start();
    this.log('info', 'Project Initializer ready');
  }

  protected async cleanup(): Promise<void> {
    await this.blueprintService.stop();
    await this.qualityOrchestrator.stop();
    this.log('info', 'Project Initializer cleanup complete');
  }

  protected async healthCheck(): Promise<boolean> {
    return (
      await this.blueprintService.healthCheck() &&
      await this.qualityOrchestrator.healthCheck()
    );
  }

  async process(input: any): Promise<ProjectSetupResult> {
    if (input.action === 'initialize-project') {
      return await this.initializeProject(
        input.intent,
        input.projectName,
        input.projectPath
      );
    }
    throw new Error('Invalid action for Project Initializer');
  }

  /**
   * Initialize a complete Vibe Lab project with quality assurance baked in
   */
  async initializeProject(
    intent: UserIntent,
    projectName: string,
    projectPath: string
  ): Promise<ProjectSetupResult> {
    const startTime = Date.now();
    const installedTools: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const nextSteps: string[] = [];

    this.log('info', `Initializing Vibe Lab project: ${projectName}`);

    try {
      // Emit project initialization start event
      this.eventBus.publish('project:init:start', 'project-initializer', {
        projectName,
        projectPath,
        intent
      });

      // Step 1: Generate project blueprint with quality integration
      this.log('info', 'Generating project blueprint...');
      const blueprint = await this.blueprintService.generateProjectWithQuality(
        intent,
        projectPath,
        this.initConfig.qualitySetup.enabled
      );

      // Step 2: Create project directory structure
      await this.createProjectStructure(projectPath, blueprint);
      installedTools.push('project-structure');

      // Step 3: Set up quality assurance system
      if (this.initConfig.qualitySetup.enabled) {
        await this.setupQualityAssurance(projectPath);
        installedTools.push('quality-assurance');
      }

      // Step 4: Initialize Git repository
      await this.initializeGitRepository(projectPath);
      installedTools.push('git-repository');

      // Step 5: Install dependencies and run initial setup
      await this.installDependencies(projectPath);
      installedTools.push('dependencies');

      // Step 6: Run initial quality check
      let qualityScore = 0;
      if (this.initConfig.qualitySetup.enabled) {
        const qualityResult = await this.runInitialQualityCheck(projectPath);
        qualityScore = qualityResult.score;
        
        if (qualityScore < 80) {
          warnings.push(`Initial quality score is ${qualityScore}/100 - consider running quality fixes`);
        }
      }

      // Step 7: Set up integrations
      await this.setupIntegrations(projectPath, installedTools);

      // Step 8: Generate next steps
      nextSteps.push(...this.generateNextSteps(blueprint, installedTools));

      // Emit project initialization complete event
      this.eventBus.publish('project:init:complete', 'project-initializer', {
        projectName,
        projectPath,
        qualityScore,
        setupTime: Date.now() - startTime,
        installedTools
      });

      const result: ProjectSetupResult = {
        success: true,
        projectPath,
        qualityScore,
        setupTime: Date.now() - startTime,
        installedTools,
        errors,
        warnings,
        nextSteps
      };

      this.log('info', `Project ${projectName} initialized successfully in ${result.setupTime}ms`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);
      
      this.eventBus.publish('project:init:error', 'project-initializer', {
        projectName,
        projectPath,
        error: errorMessage
      });

      return {
        success: false,
        projectPath,
        qualityScore: 0,
        setupTime: Date.now() - startTime,
        installedTools,
        errors,
        warnings,
        nextSteps: ['Fix initialization errors and retry']
      };
    }
  }

  /**
   * Create the project directory structure
   */
  private async createProjectStructure(projectPath: string, blueprint: any): Promise<void> {
    this.log('info', 'Creating project directory structure...');

    // Create base directories
    const directories = [
      'src',
      'src/app',
      'src/components',
      'src/lib',
      'src/lib/avca',
      'src/lib/dias', 
      'src/lib/services',
      'src/lib/utils',
      'src/styles',
      'public',
      'docs',
      'scripts',
      'reports',
      'reports/quality',
      '.husky',
      '.github',
      '.github/workflows'
    ];

    for (const dir of directories) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }

    // Create essential files
    await this.createEssentialFiles(projectPath, blueprint);
  }

  /**
   * Create essential project files
   */
  private async createEssentialFiles(projectPath: string, blueprint: any): Promise<void> {
    // package.json
    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      description: blueprint.description || 'A Vibe Lab project',
      scripts: {
        'dev': 'next dev',
        'build': 'next build',
        'start': 'next start',
        'lint': 'next lint',
        'type-check': 'npx tsc --noEmit',
        'quality:check': 'npm run type-check && npm run lint',
        'quality:setup': 'node scripts/vibe-lab-quality-setup.js'
      },
      dependencies: {
        'next': '^14.0.0',
        'react': '^18.0.0',
        'react-dom': '^18.0.0',
        'typescript': '^5.0.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // tsconfig.json (optimized configuration)
    const tsconfig = {
      compilerOptions: {
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
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        },
        plugins: [{ name: 'next' }]
      },
      include: [
        'next-env.d.ts',
        'src/**/*.ts',
        'src/**/*.tsx',
        '.next/types/**/*.ts'
      ],
      exclude: ['node_modules', '.next', 'out']
    };

    await fs.writeFile(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    );

    // README.md
    const readme = `# ${path.basename(projectPath)}

${blueprint.description || 'A Vibe Lab project with integrated quality assurance.'}

## Quick Start

\`\`\`bash
npm install
npm run quality:setup  # Set up quality assurance tools
npm run dev            # Start development server
\`\`\`

## Quality Assurance

This project includes integrated quality assurance tools:

- **TypeScript**: Strict type checking
- **ESLint**: Code quality and style enforcement  
- **Pre-commit hooks**: Automatic quality checks
- **CI/CD**: Automated quality validation
- **Security audits**: Dependency vulnerability scanning

Run \`npm run quality:check\` to validate code quality.

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run quality:check\` - Run quality checks
- \`npm run quality:setup\` - Set up quality tools

## Generated by Vibe Lab

This project was generated with [Vibe Lab](https://vibelab.dev) - AI-powered project generation with quality assurance built-in.
`;

    await fs.writeFile(path.join(projectPath, 'README.md'), readme);

    // next.config.js
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // Don't ignore build errors - quality first!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't ignore lint errors - quality first!
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
`;

    await fs.writeFile(path.join(projectPath, 'next.config.js'), nextConfig);
  }

  /**
   * Set up quality assurance system
   */
  private async setupQualityAssurance(projectPath: string): Promise<void> {
    this.log('info', 'Setting up quality assurance system...');

    // Copy quality setup script
    const qualitySetupScript = await fs.readFile(
      path.join(__dirname, '../../../scripts/vibe-lab-quality-setup.js'),
      'utf8'
    );

    await fs.writeFile(
      path.join(projectPath, 'scripts/vibe-lab-quality-setup.js'),
      qualitySetupScript
    );

    // Make it executable
    await fs.chmod(path.join(projectPath, 'scripts/vibe-lab-quality-setup.js'), 0o755);
  }

  /**
   * Initialize Git repository
   */
  private async initializeGitRepository(projectPath: string): Promise<void> {
    this.log('info', 'Initializing Git repository...');

    try {
      await execAsync('git init', { cwd: projectPath });
      await execAsync(`git branch -m ${this.initConfig.defaultBranch}`, { cwd: projectPath });
      
      // Create .gitignore
      const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.tsbuildinfo
next-env.d.ts

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# Quality reports
reports/
.nyc_output/

# IDE
.vscode/
.idea/
`;

      await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

    } catch (error) {
      this.log('warn', `Git initialization failed: ${error}`);
    }
  }

  /**
   * Install dependencies
   */
  private async installDependencies(projectPath: string): Promise<void> {
    this.log('info', 'Installing dependencies...');

    try {
      await execAsync('npm install', { cwd: projectPath });
    } catch (error) {
      this.log('warn', `Dependency installation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Run initial quality check
   */
  private async runInitialQualityCheck(projectPath: string): Promise<{ score: number }> {
    this.log('info', 'Running initial quality check...');

    try {
      // Run the quality setup script
      await execAsync('node scripts/vibe-lab-quality-setup.js', { cwd: projectPath });
      
      // Get quality report
      const report = await this.qualityOrchestrator.process({ action: 'analyze' });
      
      return { score: report.score };
      
    } catch (error) {
      this.log('warn', `Initial quality check failed: ${error}`);
      return { score: 0 };
    }
  }

  /**
   * Set up integrations
   */
  private async setupIntegrations(projectPath: string, installedTools: string[]): Promise<void> {
    if (this.initConfig.integrations.github) {
      // GitHub Actions already included in quality setup
      installedTools.push('github-actions');
    }

    if (this.initConfig.integrations.vercel) {
      // Create vercel.json
      const vercelConfig = {
        framework: 'nextjs',
        buildCommand: 'npm run build',
        devCommand: 'npm run dev',
        installCommand: 'npm install'
      };

      await fs.writeFile(
        path.join(projectPath, 'vercel.json'),
        JSON.stringify(vercelConfig, null, 2)
      );
      
      installedTools.push('vercel');
    }

    if (this.initConfig.integrations.docker) {
      // Create Dockerfile
      const dockerfile = `FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
`;

      await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfile);
      installedTools.push('docker');
    }
  }

  /**
   * Generate next steps for the user
   */
  private generateNextSteps(blueprint: any, installedTools: string[]): string[] {
    const steps: string[] = [
      'Navigate to your project directory',
      'Run `npm run dev` to start the development server',
      'Run `npm run quality:check` to validate code quality'
    ];

    if (installedTools.includes('quality-assurance')) {
      steps.push('Check quality reports in `reports/quality/latest.json`');
    }

    if (installedTools.includes('github-actions')) {
      steps.push('Push to GitHub to trigger automated quality checks');
    }

    if (installedTools.includes('vercel')) {
      steps.push('Connect to Vercel for automatic deployments');
    }

    steps.push('Read the README.md for detailed instructions');

    return steps;
  }
}