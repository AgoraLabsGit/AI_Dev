#!/usr/bin/env ts-node

/**
 * Onboarding Test Suite Runner
 * 
 * This script provides different test execution modes for the onboarding system:
 * - Full suite: All tests including unit, integration, e2e, performance, and accessibility
 * - Quick suite: Essential tests for rapid feedback
 * - Specific test types: Run only certain categories of tests
 * - CI mode: Optimized for continuous integration
 */

import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';

const program = new Command();

// Set test start time for duration tracking
process.env.TEST_START_TIME = Date.now().toString();

interface TestConfig {
  projects: string[];
  headed: boolean;
  workers: number;
  retries: number;
  timeout: number;
  reporter: string[];
}

const testConfigs: Record<string, TestConfig> = {
  full: {
    projects: [
      'unit-tests',
      'api-tests', 
      'integration-chrome',
      'e2e-chrome',
      'e2e-firefox',
      'e2e-safari',
      'mobile-chrome',
      'mobile-safari',
      'performance',
      'accessibility',
      'superclaude'
    ],
    headed: false,
    workers: 2,
    retries: 1,
    timeout: 60000,
    reporter: ['html', 'json', 'junit', 'line']
  },
  
  quick: {
    projects: [
      'unit-tests',
      'api-tests',
      'integration-chrome',
      'e2e-chrome'
    ],
    headed: false,
    workers: 4,
    retries: 0,
    timeout: 30000,
    reporter: ['line', 'json']
  },
  
  unit: {
    projects: ['unit-tests'],
    headed: false,
    workers: 1,
    retries: 0,
    timeout: 15000,
    reporter: ['line']
  },
  
  integration: {
    projects: ['integration-chrome', 'superclaude'],
    headed: false,
    workers: 2,
    retries: 1,
    timeout: 45000,
    reporter: ['line', 'html']
  },
  
  e2e: {
    projects: ['e2e-chrome', 'e2e-firefox'],
    headed: false,
    workers: 2,
    retries: 2,
    timeout: 60000,
    reporter: ['line', 'html']
  },
  
  performance: {
    projects: ['performance'],
    headed: false,
    workers: 1,
    retries: 0,
    timeout: 120000,
    reporter: ['line', 'json']
  },
  
  accessibility: {
    projects: ['accessibility'],
    headed: false,
    workers: 1,
    retries: 0,
    timeout: 45000,
    reporter: ['line', 'html']
  },
  
  mobile: {
    projects: ['mobile-chrome', 'mobile-safari'],
    headed: false,
    workers: 1,
    retries: 1,
    timeout: 60000,
    reporter: ['line', 'html']
  },
  
  ci: {
    projects: [
      'unit-tests',
      'api-tests',
      'integration-chrome',
      'e2e-chrome',
      'performance',
      'accessibility'
    ],
    headed: false,
    workers: 1,
    retries: 2,
    timeout: 90000,
    reporter: ['line', 'json', 'junit']
  }
};

program
  .name('run-onboarding-tests')
  .description('Run comprehensive onboarding test suite')
  .version('1.0.0');

program
  .command('run')
  .description('Run tests with specified configuration')
  .option('-s, --suite <type>', 'Test suite type (full, quick, unit, integration, e2e, performance, accessibility, mobile, ci)', 'quick')
  .option('-h, --headed', 'Run tests in headed mode (visible browser)')
  .option('-w, --workers <number>', 'Number of parallel workers')
  .option('-r, --retries <number>', 'Number of retries on failure')
  .option('-t, --timeout <number>', 'Test timeout in milliseconds')
  .option('--grep <pattern>', 'Only run tests matching pattern')
  .option('--project <projects...>', 'Specific projects to run')
  .option('--reporter <reporters...>', 'Test reporters to use')
  .option('--update-snapshots', 'Update visual snapshots')
  .option('--debug', 'Enable debug mode')
  .action(async (options: any) => {
    try {
      console.log(chalk.blue.bold('🚀 Starting Onboarding Test Suite\n'));
      
      // Validate suite type
      const suiteType = options.suite;
      if (!testConfigs[suiteType]) {
        console.error(chalk.red(`❌ Invalid suite type: ${suiteType}`));
        console.log(chalk.gray('Available suite types:'), Object.keys(testConfigs).join(', '));
        process.exit(1);
      }
      
      // Get configuration
      const config = { ...testConfigs[suiteType] };
      
      // Override with command line options
      if (options.headed) config.headed = true;
      if (options.workers) config.workers = parseInt(options.workers);
      if (options.retries) config.retries = parseInt(options.retries);
      if (options.timeout) config.timeout = parseInt(options.timeout);
      if (options.project) config.projects = options.project;
      if (options.reporter) config.reporter = options.reporter;
      
      // Display configuration
      console.log(chalk.cyan('📋 Test Configuration:'));
      console.log(`  Suite: ${chalk.yellow(suiteType)}`);
      console.log(`  Projects: ${chalk.yellow(config.projects.join(', '))}`);
      console.log(`  Workers: ${chalk.yellow(config.workers)}`);
      console.log(`  Retries: ${chalk.yellow(config.retries)}`);
      console.log(`  Timeout: ${chalk.yellow(config.timeout)}ms`);
      console.log(`  Headed: ${chalk.yellow(config.headed)}`);
      console.log('');
      
      // Prepare environment
      await prepareTestEnvironment();
      
      // Build Playwright command
      const playwrightCmd = buildPlaywrightCommand(config, options);
      
      console.log(chalk.gray('Running command:'), playwrightCmd);
      console.log('');
      
      // Execute tests
      const startTime = Date.now();
      
      try {
        execSync(playwrightCmd, {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'test',
            HEADED: config.headed ? '1' : '0'
          }
        });
        
        const duration = Date.now() - startTime;
        console.log('');
        console.log(chalk.green.bold(`✅ Test suite completed successfully in ${Math.round(duration / 1000)}s`));
        
        // Show results summary
        await showResultsSummary();
        
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log('');
        console.log(chalk.red.bold(`❌ Test suite failed after ${Math.round(duration / 1000)}s`));
        
        // Show failure details
        await showFailureDetails();
        
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error running tests:'), error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available test suites and projects')
  .action(() => {
    console.log(chalk.blue.bold('📋 Available Test Suites:\n'));
    
    Object.entries(testConfigs).forEach(([name, config]) => {
      console.log(chalk.yellow.bold(`${name}:`));
      console.log(`  Projects: ${config.projects.join(', ')}`);
      console.log(`  Workers: ${config.workers}, Retries: ${config.retries}`);
      console.log('');
    });
  });

program
  .command('clean')
  .description('Clean test results and artifacts')
  .action(() => {
    console.log(chalk.blue('🧹 Cleaning test results...'));
    
    try {
      if (fs.existsSync('test-results')) {
        execSync('rm -rf test-results/*', { stdio: 'inherit' });
        console.log(chalk.green('✅ Test results cleaned'));
      } else {
        console.log(chalk.gray('ℹ️ No test results to clean'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error cleaning test results:'), error);
      process.exit(1);
    }
  });

async function prepareTestEnvironment() {
  console.log(chalk.cyan('🔧 Preparing test environment...'));
  
  // Create test results directory
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  // Install Playwright browsers if needed
  try {
    execSync('npx playwright install --with-deps', { stdio: 'pipe' });
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Could not install Playwright browsers automatically'));
  }
  
  console.log(chalk.green('✅ Environment prepared'));
}

function buildPlaywrightCommand(config: TestConfig, options: any): string {
  const cmd = ['npx', 'playwright', 'test'];
  
  // Add configuration file
  cmd.push('--config', 'tests/onboarding-test-suite.config.ts');
  
  // Add projects
  config.projects.forEach(project => {
    cmd.push('--project', project);
  });
  
  // Add options
  if (config.headed) cmd.push('--headed');
  if (config.workers > 1) cmd.push('--workers', config.workers.toString());
  if (config.retries > 0) cmd.push('--retries', config.retries.toString());
  
  // Add command line options
  if (options.grep) cmd.push('--grep', options.grep);
  if (options.updateSnapshots) cmd.push('--update-snapshots');
  if (options.debug) cmd.push('--debug');
  
  return cmd.join(' ');
}

async function showResultsSummary() {
  console.log(chalk.cyan('\n📊 Test Results Summary:'));
  
  try {
    if (fs.existsSync('test-results/results.json')) {
      const results = JSON.parse(fs.readFileSync('test-results/results.json', 'utf8'));
      
      // Parse Playwright results
      let passed = 0, failed = 0, skipped = 0;
      
      results.suites?.forEach((suite: any) => {
        suite.specs?.forEach((spec: any) => {
          spec.tests?.forEach((test: any) => {
            test.results?.forEach((result: any) => {
              if (result.status === 'passed') passed++;
              else if (result.status === 'failed') failed++;
              else if (result.status === 'skipped') skipped++;
            });
          });
        });
      });
      
      console.log(`  ${chalk.green('✅ Passed:')} ${passed}`);
      console.log(`  ${chalk.red('❌ Failed:')} ${failed}`);
      console.log(`  ${chalk.yellow('⏭️ Skipped:')} ${skipped}`);
      console.log(`  ${chalk.blue('📊 Total:')} ${passed + failed + skipped}`);
    }
    
    // Show report locations
    console.log(chalk.cyan('\n📋 Generated Reports:'));
    if (fs.existsSync('test-results/html-report')) {
      console.log(`  📄 HTML Report: ${chalk.underline('test-results/html-report/index.html')}`);
    }
    if (fs.existsSync('test-results/junit.xml')) {
      console.log(`  📄 JUnit Report: ${chalk.underline('test-results/junit.xml')}`);
    }
    
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Could not parse test results'));
  }
}

async function showFailureDetails() {
  console.log(chalk.red('\n💥 Failure Details:'));
  console.log('  Check test-results/html-report/index.html for detailed failure information');
  console.log('  Screenshots and videos are available in test-results/ directory');
}

program.parse(process.argv);