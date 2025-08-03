#!/usr/bin/env node

/**
 * Script to ensure the development server runs on port 3000
 * This is critical for GitHub authentication to work properly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if port 3000 is in use
try {
  console.log('Checking if port 3000 is available...');
  const portCheck = execSync('lsof -i:3000 -t', { encoding: 'utf-8' }).trim();
  
  if (portCheck) {
    console.log('⚠️ Port 3000 is currently in use by process ID(s):', portCheck);
    
    const shouldKill = process.argv.includes('--kill');
    
    if (shouldKill) {
      console.log('Attempting to kill process(es) using port 3000...');
      try {
        // Handle multiple PIDs by splitting the string and killing each process
        const pids = portCheck.split('\n').filter(Boolean);
        
        for (const pid of pids) {
          console.log(`Killing process ${pid}...`);
          try {
            execSync(`kill -9 ${pid}`);
          } catch (err) {
            console.log(`Failed to kill process ${pid}: ${err.message}`);
          }
        }
        
        // Verify port is now available
        try {
          const checkAgain = execSync('lsof -i:3000 -t', { encoding: 'utf-8' }).trim();
          if (checkAgain) {
            console.error('❌ Some processes could not be killed. Please manually free port 3000.');
            process.exit(1);
          } else {
            console.log('✅ Successfully freed port 3000');
          }
        } catch (e) {
          console.log('✅ Successfully freed port 3000');
        }
      } catch (killError) {
        console.error('❌ Failed to kill processes. You may need to manually kill them or use a different port.');
        process.exit(1);
      }
    } else {
      console.error('❌ ERROR: Port 3000 is required for GitHub authentication.');
      console.error('Please free up port 3000 before starting the development server.');
      console.error('You can run this script with --kill to attempt to free the port automatically:');
      console.error('  node scripts/ensure-port-3000.js --kill');
      process.exit(1);
    }
  } else {
    console.log('✅ Port 3000 is available');
  }
} catch (error) {
  // If lsof command fails or returns nothing, port is likely available
  console.log('✅ Port 3000 appears to be available');
}

// Update package.json to ensure dev script uses port 3000
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Check if dev script already specifies port 3000
  if (!packageJson.scripts.dev.includes('-p 3000')) {
    packageJson.scripts.dev = 'next dev -p 3000';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json to ensure development server runs on port 3000');
  }
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

console.log('🚀 Ready to start development server on port 3000');