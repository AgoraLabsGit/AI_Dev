#!/usr/bin/env npx tsx

/**
 * @vibe-lab/build - Core product extraction tool
 * Automatically extracts clean Vibe Lab product code based on marker comments
 */

import { glob } from 'glob';
import { readFile, writeFile, mkdir, stat, copyFile } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { existsSync } from 'fs';

interface ExtractionStats {
  totalFiles: number;
  coreFiles: number;
  buildFiles: number;
  optionalFiles: number;
  mixedFiles: number;
  unmarkedFiles: number;
  processedLines: number;
  removedLines: number;
}

export class VibLabProductExtractor {
  private stats: ExtractionStats = {
    totalFiles: 0,
    coreFiles: 0,
    buildFiles: 0,  
    optionalFiles: 0,
    mixedFiles: 0,
    unmarkedFiles: 0,
    processedLines: 0,
    removedLines: 0
  };

  private sourceDir: string;
  private outputDir: string;

  constructor(sourceDir = 'src', outputDir = 'dist/vibe-lab-core') {
    this.sourceDir = sourceDir;
    this.outputDir = outputDir;
  }

  async extractCoreProduct(): Promise<ExtractionStats> {
    console.log('🔍 Starting Vibe Lab Core Product Extraction...\n');

    // Find all relevant files
    const patterns = [
      `${this.sourceDir}/**/*.{ts,tsx,js,jsx}`,
      `${this.sourceDir}/**/*.{json,md}`,
      `${this.sourceDir}/**/*.css`,
      'package.json',
      'next.config.js',
      'tailwind.config.js'
    ];

    const allFiles = await this.findFiles(patterns);
    this.stats.totalFiles = allFiles.length;

    console.log(`📁 Found ${allFiles.length} files to analyze\n`);

    // Process each file
    for (const file of allFiles) {
      await this.processFile(file);
    }

    // Copy additional core assets
    await this.copyAssets();

    // Generate summary
    this.printSummary();
    
    return this.stats;
  }

  private async findFiles(patterns: string[]): Promise<string[]> {
    const allFiles = new Set<string>();
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { ignore: ['node_modules/**', '.next/**', 'dist/**'] });
      files.forEach(file => allFiles.add(file));
    }

    return Array.from(allFiles);
  }

  private async processFile(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      this.stats.processedLines += lines.length;

      // Determine file type based on markers
      const fileType = this.analyzeFileType(content);
      
      switch (fileType) {
        case 'core':
          await this.processCoreFile(filePath, content);
          this.stats.coreFiles++;
          break;
          
        case 'build':
          console.log(`⏭️  Skipping build file: ${filePath}`);
          this.stats.buildFiles++;
          break;
          
        case 'optional':
          await this.processOptionalFile(filePath, content);
          this.stats.optionalFiles++;
          break;
          
        case 'mixed':
          await this.processMixedFile(filePath, content);
          this.stats.mixedFiles++;
          break;
          
        default:
          await this.processUnmarkedFile(filePath, content);
          this.stats.unmarkedFiles++;
          break;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  private analyzeFileType(content: string): 'core' | 'build' | 'optional' | 'mixed' | 'unmarked' {
    const hasCore = content.includes('@vibe-lab/core');
    const hasBuild = content.includes('@vibe-lab/build');
    const hasOptional = content.includes('@vibe-lab/optional');

    if (hasCore && hasBuild) return 'mixed';
    if (hasCore) return 'core';
    if (hasBuild) return 'build';
    if (hasOptional) return 'optional';
    
    return 'unmarked';
  }

  private async processCoreFile(filePath: string, content: string): Promise<void> {
    console.log(`✅ Processing core file: ${filePath}`);
    
    // Remove marker comments but keep all code
    const cleanedContent = this.removeMarkerComments(content);
    await this.writeToOutput(filePath, cleanedContent);
  }

  private async processOptionalFile(filePath: string, content: string): Promise<void> {
    console.log(`🔧 Processing optional file: ${filePath}`);
    
    // Include optional files but mark them clearly
    const processedContent = this.processOptionalMarkers(content);
    await this.writeToOutput(filePath, processedContent);
  }

  private async processMixedFile(filePath: string, content: string): Promise<void> {
    console.log(`🔀 Processing mixed file: ${filePath}`);
    
    const processedContent = this.processMixedContent(content);
    await this.writeToOutput(filePath, processedContent);
  }

  private async processUnmarkedFile(filePath: string, content: string): Promise<void> {
    // Apply heuristics to determine if file should be included
    const shouldInclude = this.shouldIncludeUnmarkedFile(filePath, content);
    
    if (shouldInclude) {
      console.log(`⚠️  Including unmarked file (heuristic): ${filePath}`);
      await this.writeToOutput(filePath, content);
    } else {
      console.log(`⏭️  Skipping unmarked file: ${filePath}`);
    }
  }

  private removeMarkerComments(content: string): string {
    return content
      .replace(/\/\/ @vibe-lab\/\w+.*$/gm, '') // Remove marker lines
      .replace(/\/\* @vibe-lab\/\w+.*?\*\//gs, '') // Remove block markers
      .replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up extra whitespace
  }

  private processOptionalMarkers(content: string): string {
    // Convert optional markers to feature flags
    return content.replace(
      /\/\/ @vibe-lab\/optional:start:(\w+)/g,
      '// Feature: $1 - This code is optional and may be excluded'
    ).replace(
      /\/\/ @vibe-lab\/optional:end:(\w+)/g,
      '// End Feature: $1'
    );
  }

  private processMixedContent(content: string): string {
    let processed = content;
    let removedLines = 0;

    // Remove build blocks
    processed = processed.replace(
      /\/\/ @vibe-lab\/build:start[\s\S]*?\/\/ @vibe-lab\/build:end/g,
      (match) => {
        removedLines += match.split('\n').length;
        return ''; // Remove entire block
      }
    );

    // Remove single-line build markers  
    processed = processed.replace(
      /.*\/\/ @vibe-lab\/build.*$/gm,
      (match) => {
        removedLines++;
        return ''; // Remove line
      }
    );

    // Clean up core markers (keep code)
    processed = processed.replace(
      /\/\/ @vibe-lab\/core:(start|end)/g,
      ''
    );

    // Clean up extra whitespace
    processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');

    this.stats.removedLines += removedLines;
    return processed;
  }

  private shouldIncludeUnmarkedFile(filePath: string, content: string): boolean {
    // Heuristics for unmarked files
    
    // Always exclude obvious build files
    if (filePath.includes('/test/') || 
        filePath.includes('/scripts/') ||
        filePath.includes('monitoring') ||
        filePath.endsWith('.test.ts') ||
        filePath.endsWith('.spec.ts')) {
      return false;
    }

    // Always include core app files
    if (filePath.includes('/app/') && 
        !filePath.includes('/experimental/') &&
        !filePath.includes('/api/test') &&
        !filePath.includes('/api/monitoring')) {
      return true;
    }

    // Include essential components
    if (filePath.includes('/components/') && 
        !filePath.includes('monitoring')) {
      return true;
    }

    // Include core lib files but exclude monitoring
    if (filePath.includes('/lib/') && 
        !filePath.includes('/lib/monitoring') &&
        !filePath.includes('/lib/mock-data')) {
      return true;
    }

    // Default to exclude
    return false;
  }

  private async writeToOutput(filePath: string, content: string): Promise<void> {
    const outputPath = join(this.outputDir, filePath);
    const outputDir = dirname(outputPath);

    // Create directory if it doesn't exist
    await mkdir(outputDir, { recursive: true });
    
    // Write processed content
    await writeFile(outputPath, content, 'utf-8');
  }

  private async copyAssets(): Promise<void> {
    console.log('\n📋 Copying additional assets...');
    
    const assetPaths = [
      'public/assets',
      '.env.example',
      'README.md'
    ];

    for (const assetPath of assetPaths) {
      if (existsSync(assetPath)) {
        const outputPath = join(this.outputDir, assetPath);
        await mkdir(dirname(outputPath), { recursive: true });
        
        const stats = await stat(assetPath);
        if (stats.isDirectory()) {
          // Copy directory recursively
          const files = await glob(`${assetPath}/**/*`);
          for (const file of files) {
            const destFile = join(this.outputDir, file);
            await mkdir(dirname(destFile), { recursive: true });
            await copyFile(file, destFile);
          }
        } else {
          await copyFile(assetPath, outputPath);
        }
        console.log(`✅ Copied: ${assetPath}`);
      }
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXTRACTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📁 Total files analyzed: ${this.stats.totalFiles}`);
    console.log(`✅ Core files included: ${this.stats.coreFiles}`);
    console.log(`⏭️  Build files excluded: ${this.stats.buildFiles}`);
    console.log(`🔧 Optional files included: ${this.stats.optionalFiles}`);
    console.log(`🔀 Mixed files processed: ${this.stats.mixedFiles}`);
    console.log(`⚠️  Unmarked files: ${this.stats.unmarkedFiles}`);
    console.log(`📄 Lines processed: ${this.stats.processedLines.toLocaleString()}`);
    console.log(`🗑️  Lines removed: ${this.stats.removedLines.toLocaleString()}`);
    
    const reductionPercent = ((this.stats.removedLines / this.stats.processedLines) * 100).toFixed(1);
    console.log(`💾 Code reduction: ${reductionPercent}%`);
    
    console.log('\n🎉 Core product extraction complete!');
    console.log(`📦 Clean product code available in: ${this.outputDir}`);
  }
}

// CLI Usage
if (require.main === module) {
  const extractor = new VibLabProductExtractor();
  extractor.extractCoreProduct().catch(console.error);
}