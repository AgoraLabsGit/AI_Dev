import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global setup for Onboarding Test Suite
 * Runs once before all tests to prepare the testing environment
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Onboarding Test Suite Global Setup...');

  // Create test results directories
  const testResultsDir = 'test-results';
  const directories = [
    testResultsDir,
    `${testResultsDir}/screenshots`,
    `${testResultsDir}/videos`,
    `${testResultsDir}/traces`,
    `${testResultsDir}/html-report`,
    `${testResultsDir}/allure-results`,
    `${testResultsDir}/performance-reports`
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Create test metadata file
  const metadata = {
    suite: 'Onboarding Comprehensive Test Suite',
    startTime: new Date().toISOString(),
    config: {
      baseURL: config.projects[0]?.use?.baseURL || 'http://localhost:3000',
      workers: config.workers,
      timeout: config.timeout,
      retries: config.retries
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      ci: !!process.env.CI
    },
    projects: config.projects.map(project => ({
      name: project.name,
      testDir: project.testDir || config.testDir,
      testMatch: project.testMatch,
      dependencies: project.dependencies
    }))
  };

  fs.writeFileSync(
    `${testResultsDir}/test-metadata.json`,
    JSON.stringify(metadata, null, 2)
  );

  // Validate environment
  await validateEnvironment(config);

  // Prepare test data
  await prepareTestData();

  // Warm up the application if needed
  if (!process.env.SKIP_WARMUP) {
    await warmupApplication(config);
  }

  console.log('✅ Global setup completed successfully');
}

/**
 * Validate that the testing environment is properly configured
 */
async function validateEnvironment(config: FullConfig) {
  console.log('🔍 Validating test environment...');

  // Check if required environment variables are set
  const requiredEnvVars = [
    'NODE_ENV'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingEnvVars);
  }

  // Check if the application is accessible
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log(`🌐 Checking application availability at ${baseURL}...`);
    
    // Try to access the onboarding page
    const response = await page.goto(`${baseURL}/onboarding`, {
      timeout: 30000,
      waitUntil: 'networkidle'
    });

    if (!response || !response.ok()) {
      throw new Error(`Application not accessible: ${response?.status()}`);
    }

    // Check if the onboarding page loads properly
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
    
    console.log('✅ Application is accessible and onboarding page loads correctly');
    
    await browser.close();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw error;
  }
}

/**
 * Prepare any test data needed for the test suite
 */
async function prepareTestData() {
  console.log('📋 Preparing test data...');

  // Create test scenarios data
  const testScenarios = {
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'A comprehensive online marketplace with vendor management, product catalog, shopping cart, and payment processing',
        type: 'web application',
        features: ['authentication', 'payments', 'real-time', 'messaging'],
        complexity: 'complex'
      },
      {
        name: 'Social Media App',
        description: 'A mobile-first social networking platform for developers to share code and collaborate',
        type: 'mobile application',
        features: ['authentication', 'messaging', 'real-time'],
        complexity: 'medium'
      },
      {
        name: 'Task Management Tool',
        description: 'A simple project management application with team collaboration features',
        type: 'web application',
        features: ['authentication'],
        complexity: 'simple'
      }
    ],
    messages: [
      'Build me a web application',
      'I need user authentication',
      'Add payment processing',
      'Include real-time chat',
      'Make it mobile responsive',
      'Add a dashboard',
      'Include analytics',
      'Set up notifications'
    ],
    githubUrls: [
      'https://github.com/test/repo',
      'https://github.com/example/project',
      'https://github.com/sample/app'
    ]
  };

  fs.writeFileSync(
    'test-results/test-scenarios.json',
    JSON.stringify(testScenarios, null, 2)
  );

  console.log('✅ Test data prepared');
}

/**
 * Warm up the application to ensure consistent test performance
 */
async function warmupApplication(config: FullConfig) {
  console.log('🔥 Warming up application...');

  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Visit key pages to warm up the application
    const pages = ['/onboarding'];
    
    for (const pagePath of pages) {
      console.log(`🌐 Warming up ${pagePath}...`);
      await page.goto(`${baseURL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // Perform a basic interaction to warm up the API
    console.log('🤖 Warming up API endpoints...');
    await page.goto(`${baseURL}/onboarding`);
    await page.waitForSelector('[data-testid="onboarding-chat"]', { timeout: 10000 });
    
    // Send a test message to warm up the chat API
    await page.fill('textarea[placeholder=""]', 'Warmup test message');
    await page.click('[data-testid="send-message-button"]');
    
    // Wait for response to ensure API is working
    await page.waitForTimeout(5000);
    
    await browser.close();
    
    console.log('✅ Application warmup completed');
  } catch (error) {
    console.warn('⚠️ Application warmup failed (tests will continue):', error);
  }
}

/**
 * Log system information for debugging
 */
function logSystemInfo() {
  console.log('💻 System Information:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Platform: ${process.platform} ${process.arch}`);
  console.log(`  Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`);
  console.log(`  CI Environment: ${process.env.CI ? 'Yes' : 'No'}`);
  console.log(`  Workers: ${process.env.CI ? '1 (CI)' : 'auto'}`);
}

// Log system info
logSystemInfo();

export default globalSetup;