import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Onboarding Test Suite Configuration
 * 
 * This configuration runs all onboarding-related tests including:
 * - Unit tests for the onboarding store
 * - Integration tests for document generation
 * - SuperClaude integration tests
 * - API endpoint tests
 * - Performance tests
 * - Accessibility tests
 * - Cross-browser compatibility tests
 */

export default defineConfig({
  // Test directory containing all onboarding tests
  testDir: './tests',
  
  // Test patterns to include
  testMatch: [
    '**/onboarding*.test.ts',
    '**/onboarding*.spec.ts',
    '**/document-generation*.test.ts',
    '**/document-generation*.spec.ts',
    '**/superclaude-integration*.test.ts',
    '**/onboarding-endpoints*.test.ts',
    '**/onboarding-performance*.test.ts',
    '**/onboarding-accessibility*.test.ts'
  ],

  // Global test timeout
  timeout: 60000, // 1 minute per test

  // Expect timeout for assertions
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },

  // Fail fast on CI, continue locally
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line']
  ],

  // Global test configuration
  use: {
    // Base URL for tests
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,

    // Test environment
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Feature flags for testing
    extraHTTPHeaders: {
      'X-Test-Environment': 'playwright',
      'X-Test-Suite': 'onboarding'
    }
  },

  // Project configurations for different test types
  projects: [
    // Unit Tests
    {
      name: 'unit-tests',
      testMatch: '**/unit/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true
      },
      dependencies: []
    },

    // API Tests
    {
      name: 'api-tests',
      testMatch: '**/api/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true
      },
      dependencies: []
    },

    // Integration Tests - Desktop Chrome
    {
      name: 'integration-chrome',
      testMatch: '**/integration/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: !process.env.HEADED,
        // Enable SuperClaude features for integration tests
        storageState: {
          cookies: [],
          origins: [{
            origin: 'http://localhost:3000',
            localStorage: [{
              name: 'feature-flags',
              value: JSON.stringify({
                useSuperClaude: true,
                showPersonaInfo: true,
                showSuperClaudeIndicators: true,
                enableContext7: true,
                enableTestMode: true
              })
            }]
          }]
        }
      },
      dependencies: ['unit-tests', 'api-tests']
    },

    // E2E Tests - Multiple Browsers
    {
      name: 'e2e-chrome',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: !process.env.HEADED
      },
      dependencies: ['integration-chrome']
    },

    {
      name: 'e2e-firefox',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        headless: !process.env.HEADED
      },
      dependencies: ['integration-chrome']
    },

    {
      name: 'e2e-safari',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        headless: !process.env.HEADED
      },
      dependencies: ['integration-chrome']
    },

    // Mobile Testing
    {
      name: 'mobile-chrome',
      testMatch: [
        '**/e2e/onboarding-flow.spec.ts',
        '**/integration/document-generation.test.ts'
      ],
      use: {
        ...devices['Pixel 5'],
        headless: !process.env.HEADED
      },
      dependencies: ['e2e-chrome']
    },

    {
      name: 'mobile-safari',
      testMatch: [
        '**/e2e/onboarding-flow.spec.ts',
        '**/integration/document-generation.test.ts'
      ],
      use: {
        ...devices['iPhone 12'],
        headless: !process.env.HEADED
      },
      dependencies: ['e2e-chrome']
    },

    // Performance Tests
    {
      name: 'performance',
      testMatch: '**/performance/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        // Disable throttling for consistent performance measurements
        launchOptions: {
          args: ['--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows']
        }
      },
      timeout: 120000, // 2 minutes for performance tests
      dependencies: ['e2e-chrome']
    },

    // Accessibility Tests
    {
      name: 'accessibility',
      testMatch: '**/accessibility/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: !process.env.HEADED,
        // Enable accessibility testing features
        reducedMotion: 'reduce',
        forcedColors: 'none'
      },
      dependencies: ['e2e-chrome']
    },

    // SuperClaude Integration Tests
    {
      name: 'superclaude',
      testMatch: '**/superclaude-integration.test.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: !process.env.HEADED,
        // Enable SuperClaude features
        extraHTTPHeaders: {
          'X-Test-SuperClaude': 'true',
          'X-Feature-Flags': JSON.stringify({
            useSuperClaude: true,
            showPersonaInfo: true,
            showSuperClaudeIndicators: true,
            enableContext7: true,
            enableSequential: false,
            enableMagic: false,
            enablePlaywright: false
          })
        }
      },
      dependencies: ['integration-chrome']
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start server
    env: {
      // Test environment variables
      NODE_ENV: 'test',
      NEXT_PUBLIC_TEST_MODE: 'true',
      NEXT_PUBLIC_USE_SUPERCLAUDE: 'true',
      NEXT_PUBLIC_SHOW_PERSONA_INFO: 'true',
      NEXT_PUBLIC_SHOW_SUPERCLAUDE_INDICATORS: 'true',
      NEXT_PUBLIC_ENABLE_CONTEXT7: 'true',
      NEXT_PUBLIC_VERBOSE_LOGGING: 'false'
    }
  },

  // Output directories
  outputDir: 'test-results/playwright-artifacts',
  
  // Metadata
  metadata: {
    testSuite: 'Onboarding Comprehensive Test Suite',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    timestamp: new Date().toISOString()
  }
});