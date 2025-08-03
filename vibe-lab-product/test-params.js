// Simple test to verify Next.js 15 parameter types
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/app/project/[projectId]/dashboard/page.tsx',
  'src/app/project/[projectId]/design/page.tsx',
  'src/app/project/[projectId]/import/page.tsx',
  'src/app/project/[projectId]/design/blueprints/page.tsx',
  'src/app/project/[projectId]/design/components/page.tsx',
  'src/app/project/[projectId]/design/pages/page.tsx',
];

console.log('Checking Next.js 15 parameter type fixes...\n');

let allFixed = true;

filesToCheck.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for Next.js 15 pattern
    const hasPromiseParams = content.includes('params: Promise<{') || content.includes('params: Promise<{ projectId: string }>');
    const hasAsyncFunction = content.includes('export default async function');
    const hasAwaitParams = content.includes('await params');
    
    const isFixed = hasPromiseParams && hasAsyncFunction && hasAwaitParams;
    
    console.log(`${filePath}:`);
    console.log(`  ✓ Promise params: ${hasPromiseParams}`);
    console.log(`  ✓ Async function: ${hasAsyncFunction}`);
    console.log(`  ✓ Await params: ${hasAwaitParams}`);
    console.log(`  ${isFixed ? '✅ FIXED' : '❌ NOT FIXED'}\n`);
    
    if (!isFixed) {
      allFixed = false;
    }
  } catch (error) {
    console.log(`❌ Error checking ${filePath}: ${error.message}\n`);
    allFixed = false;
  }
});

console.log(`\n${allFixed ? '🎉 All files have been fixed for Next.js 15!' : '❌ Some files still need fixing'}`);