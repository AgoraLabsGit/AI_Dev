#!/usr/bin/env npx tsx

/**
 * @vibe-lab/build - Extraction analysis tool
 * Analyzes the results of core product extraction
 */

import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

async function analyzeExtraction() {
  console.log('📊 Analyzing Vibe Lab Core Product Extraction Results\n');

  const sourceDir = 'src';
  const extractedDir = 'dist/vibe-lab-core/src';

  // Count original files
  const originalFiles = await glob(`${sourceDir}/**/*.{ts,tsx,js,jsx}`);
  console.log(`📁 Original source files: ${originalFiles.length}`);

  // Count extracted files
  const extractedFiles = await glob(`${extractedDir}/**/*.{ts,tsx,js,jsx}`);
  console.log(`📦 Extracted core files: ${extractedFiles.length}`);

  // Calculate reduction
  const reduction = ((originalFiles.length - extractedFiles.length) / originalFiles.length * 100).toFixed(1);
  console.log(`📉 File reduction: ${reduction}%\n`);

  // Analyze what was removed
  console.log('🚫 Excluded Categories:');
  
  const excludedPatterns = [
    { pattern: 'monitoring', description: 'Development monitoring system' },
    { pattern: 'test', description: 'Test files and testing infrastructure' },
    { pattern: 'experimental', description: 'Experimental development features' },
    { pattern: 'scripts', description: 'Build and deployment scripts' },
    { pattern: 'generated', description: 'Generated code files' }
  ];

  for (const { pattern, description } of excludedPatterns) {
    const excludedCount = originalFiles.filter(f => f.includes(pattern)).length;
    if (excludedCount > 0) {
      console.log(`   ${excludedCount.toString().padStart(3)} files - ${description}`);
    }
  }

  // Analyze what was included
  console.log('\n✅ Included Categories:');
  
  const includedPatterns = [
    { pattern: 'components', description: 'UI components' },
    { pattern: 'api', description: 'API endpoints' }, 
    { pattern: 'lib/avca', description: 'Core AVCA system' },
    { pattern: 'lib/dias', description: 'DIAS intelligence system' },
    { pattern: 'lib/integration', description: 'Integration layer' },
    { pattern: 'app/', description: 'Next.js app structure' }
  ];

  for (const { pattern, description } of includedPatterns) {
    const includedCount = extractedFiles.filter(f => f.includes(pattern)).length;
    if (includedCount > 0) {
      console.log(`   ${includedCount.toString().padStart(3)} files - ${description}`);
    }
  }

  // Check for successful marker processing
  console.log('\n🔍 Marker Processing Analysis:');
  
  let processedFiles = 0;
  let buildMarkerRemoved = 0;
  let coreMarkerKept = 0;

  for (const file of extractedFiles) {
    try {
      const content = await readFile(file, 'utf-8');
      
      // Check if this was a marked file that got processed
      if (file.includes('examples/marked-')) {
        processedFiles++;
        
        // Should not contain build markers
        if (!content.includes('@vibe-lab/build')) {
          buildMarkerRemoved++;
        }
        
        // May still contain core markers (header comments)
        if (content.includes('@vibe-lab/core')) {
          coreMarkerKept++;
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  if (processedFiles > 0) {
    console.log(`   Processed marked files: ${processedFiles}`);
    console.log(`   Build markers removed: ${buildMarkerRemoved}/${processedFiles}`);
    console.log(`   Core headers preserved: ${coreMarkerKept}/${processedFiles}`);
  }

  // Calculate size reduction
  try {
    const originalSize = await calculateDirectorySize(sourceDir);
    const extractedSize = await calculateDirectorySize(extractedDir);
    const sizeReduction = ((originalSize - extractedSize) / originalSize * 100).toFixed(1);
    
    console.log(`\n💾 Size Analysis:`);
    console.log(`   Original: ${formatBytes(originalSize)}`);
    console.log(`   Extracted: ${formatBytes(extractedSize)}`);
    console.log(`   Reduction: ${sizeReduction}%`);
  } catch (error) {
    console.log(`\n💾 Size analysis skipped (${error.message})`);
  }

  console.log('\n🎉 Core Product Ready for Distribution!');
  console.log('📦 Location: dist/vibe-lab-core/');
  console.log('🚀 Clean, production-ready Vibe Lab codebase extracted');
}

async function calculateDirectorySize(dir: string): Promise<number> {
  const files = await glob(`${dir}/**/*.{ts,tsx,js,jsx,css,json,md}`);
  let totalSize = 0;
  
  for (const file of files) {
    try {
      const stats = await stat(file);
      totalSize += stats.size;
    } catch (error) {
      // Skip files that can't be accessed
    }
  }
  
  return totalSize;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Run analysis
analyzeExtraction().catch(console.error);