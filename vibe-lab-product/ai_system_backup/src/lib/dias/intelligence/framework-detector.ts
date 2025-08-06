import { BaseService } from '@/lib/avca/services/base-service';

export interface Framework {
  name: string;
  version?: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop';
  confidence: number;
  features: string[];
  dependencies?: string[];
}

export interface DetectionResult {
  primaryFramework: Framework;
  alternativeFrameworks: Framework[];
  recommendations: string[];
  migrationComplexity: 'low' | 'medium' | 'high';
}

export interface FrameworkSignature {
  name: string;
  type: Framework['type'];
  patterns: {
    files: string[];
    dependencies: string[];
    configFiles: string[];
    codePatterns: string[];
  };
  features: string[];
}

export class FrameworkDetector extends BaseService {
  private signatures: FrameworkSignature[] = [
    {
      name: 'Next.js',
      type: 'frontend',
      patterns: {
        files: ['next.config.js', 'next.config.mjs'],
        dependencies: ['next', 'react', 'react-dom'],
        configFiles: ['tsconfig.json', 'package.json'],
        codePatterns: ['import { useRouter }', 'getStaticProps', 'getServerSideProps']
      },
      features: ['SSR', 'File-based routing', 'API routes', 'Image optimization']
    },
    {
      name: 'React',
      type: 'frontend',
      patterns: {
        files: ['src/index.js', 'src/App.js', 'public/index.html'],
        dependencies: ['react', 'react-dom', 'react-scripts'],
        configFiles: ['package.json', 'tsconfig.json'],
        codePatterns: ['import React', 'useState', 'useEffect']
      },
      features: ['Component-based', 'Virtual DOM', 'State management']
    },
    {
      name: 'Express',
      type: 'backend',
      patterns: {
        files: ['app.js', 'server.js', 'index.js'],
        dependencies: ['express', 'body-parser'],
        configFiles: ['package.json'],
        codePatterns: ['app.use(', 'app.get(', 'app.post(']
      },
      features: ['Middleware', 'Routing', 'Static file serving']
    },
    {
      name: 'NestJS',
      type: 'backend',
      patterns: {
        files: ['nest-cli.json', 'src/main.ts'],
        dependencies: ['@nestjs/core', '@nestjs/common'],
        configFiles: ['tsconfig.json', 'package.json'],
        codePatterns: ['@Controller', '@Injectable', '@Module']
      },
      features: ['Dependency injection', 'Decorators', 'TypeScript']
    }
    // Add more framework signatures as needed
  ];

  constructor() {
    super({
      name: 'framework-detector',
      version: '1.0.0',
      dependencies: [],
      healthCheckInterval: 30000
    });
  }

  async detectFramework(codebase: {
    files: string[];
    dependencies: string[];
    fileContents: Record<string, string>;
  }): Promise<DetectionResult> {
    try {
      // Score each framework
      const scores = await Promise.all(
        this.signatures.map(async (signature) => {
          const score = await this.calculateFrameworkScore(signature, codebase);
          return {
            framework: signature.name,
            score,
            type: signature.type,
            features: signature.features
          };
        })
      );

      // Sort by score
      scores.sort((a, b) => b.score - a.score);

      // Get primary and alternatives
      const primary = scores[0];
      const alternatives = scores.slice(1, 3);

      // Generate recommendations
      const recommendations = this.generateRecommendations(primary, alternatives);

      // Calculate migration complexity
      const migrationComplexity = this.calculateMigrationComplexity(primary.score);

      return {
        primaryFramework: {
          name: primary.framework,
          type: primary.type,
          confidence: primary.score,
          features: primary.features
        },
        alternativeFrameworks: alternatives.map(alt => ({
          name: alt.framework,
          type: alt.type,
          confidence: alt.score,
          features: alt.features
        })),
        recommendations,
        migrationComplexity
      };

    } catch (error) {
      this.log('error', 'Framework detection failed', { error });
      throw error;
    }
  }

  private async calculateFrameworkScore(
    signature: FrameworkSignature,
    codebase: {
      files: string[];
      dependencies: string[];
      fileContents: Record<string, string>;
    }
  ): Promise<number> {
    let score = 0;
    const weights = {
      files: 0.3,
      dependencies: 0.3,
      configFiles: 0.2,
      codePatterns: 0.2
    };

    // Check files
    const fileScore = signature.patterns.files.reduce((sum, file) => {
      return sum + (codebase.files.includes(file) ? 1 : 0);
    }, 0) / signature.patterns.files.length;
    score += fileScore * weights.files;

    // Check dependencies
    const depScore = signature.patterns.dependencies.reduce((sum, dep) => {
      return sum + (codebase.dependencies.includes(dep) ? 1 : 0);
    }, 0) / signature.patterns.dependencies.length;
    score += depScore * weights.dependencies;

    // Check config files
    const configScore = signature.patterns.configFiles.reduce((sum, file) => {
      return sum + (codebase.files.includes(file) ? 1 : 0);
    }, 0) / signature.patterns.configFiles.length;
    score += configScore * weights.configFiles;

    // Check code patterns
    const patternScore = signature.patterns.codePatterns.reduce((sum, pattern) => {
      const patternFound = Object.values(codebase.fileContents).some(
        content => content.includes(pattern)
      );
      return sum + (patternFound ? 1 : 0);
    }, 0) / signature.patterns.codePatterns.length;
    score += patternScore * weights.codePatterns;

    return score;
  }

  private generateRecommendations(
    primary: { framework: string; score: number },
    alternatives: { framework: string; score: number }[]
  ): string[] {
    const recommendations: string[] = [];

    if (primary.score > 0.8) {
      recommendations.push(`Strong ${primary.framework} patterns detected. Consider maintaining the current framework.`);
    } else if (primary.score > 0.5) {
      recommendations.push(`Moderate ${primary.framework} usage detected. Consider upgrading to latest version.`);
    } else {
      recommendations.push('No strong framework patterns detected. Consider adopting a modern framework.');
    }

    if (alternatives.length > 0 && alternatives[0].score > 0.3) {
      recommendations.push(`Alternative framework ${alternatives[0].framework} also detected. Consider consolidating to one framework.`);
    }

    return recommendations;
  }

  private calculateMigrationComplexity(
    primaryScore: number
  ): 'low' | 'medium' | 'high' {
    if (primaryScore > 0.8) return 'low';
    if (primaryScore > 0.5) return 'medium';
    return 'high';
  }

  protected async initialize(): Promise<void> {
    // Validate framework signatures
    this.validateSignatures();
  }

  protected async cleanup(): Promise<void> {
    // No cleanup needed
  }

  protected async healthCheck(): Promise<boolean> {
    // Verify signatures are valid
    try {
      this.validateSignatures();
      return true;
    } catch {
      return false;
    }
  }

  private validateSignatures(): void {
    // Ensure all signatures have required fields
    for (const signature of this.signatures) {
      if (!signature.name || !signature.type || !signature.patterns) {
        throw new Error(`Invalid framework signature: ${signature.name}`);
      }
      if (signature.patterns.files.length === 0) {
        throw new Error(`Framework ${signature.name} has no file patterns`);
      }
      if (signature.patterns.dependencies.length === 0) {
        throw new Error(`Framework ${signature.name} has no dependency patterns`);
      }
    }
  }
}