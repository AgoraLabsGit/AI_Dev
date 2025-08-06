# Onboarding Test Suite

A comprehensive testing framework for the Vibe Lab onboarding system, covering all aspects from unit tests to end-to-end user flows, performance testing, and accessibility compliance.

## Overview

This test suite ensures the onboarding system works correctly across all browsers, devices, and user scenarios. It includes:

- **Unit Tests**: Individual component and store testing
- **Integration Tests**: Document generation and feature interactions
- **E2E Tests**: Complete user flows and cross-browser compatibility
- **API Tests**: Backend endpoint functionality and error handling
- **Performance Tests**: Load times, memory usage, and scalability
- **Accessibility Tests**: WCAG compliance and screen reader support
- **SuperClaude Tests**: AI persona integration and enhanced features

## Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Running Tests

```bash
# Quick test suite (essential tests)
npm run test:onboarding

# Full comprehensive test suite
npm run test:onboarding:full

# Specific test types
npm run test:onboarding:unit
npm run test:onboarding:e2e
npm run test:onboarding:performance
npm run test:onboarding:accessibility
```

### Advanced Usage

```bash
# Custom test runner with options
npx ts-node scripts/run-onboarding-tests.ts run --suite full --headed

# Run specific projects
npx ts-node scripts/run-onboarding-tests.ts run --project e2e-chrome integration-chrome

# Debug mode with visible browser
npx ts-node scripts/run-onboarding-tests.ts run --suite quick --headed --debug

# Clean test results
npx ts-node scripts/run-onboarding-tests.ts clean
```

## Test Structure

### Directory Organization

```
tests/
├── unit/                           # Unit tests
│   └── onboarding-store.test.ts   # Zustand store testing
├── integration/                    # Integration tests
│   ├── document-generation.test.ts # Document generation flow
│   └── superclaude-integration.test.ts # SuperClaude features
├── e2e/                           # End-to-end tests
│   ├── onboarding-flow.spec.ts   # Complete user flows
│   └── onboarding-api.spec.ts    # API integration
├── api/                           # API unit tests
│   └── onboarding-endpoints.test.ts # Backend endpoints
├── performance/                   # Performance tests
│   └── onboarding-performance.test.ts # Load times, memory
├── accessibility/                 # Accessibility tests
│   └── onboarding-accessibility.test.ts # WCAG compliance
├── global-setup.ts               # Test environment setup
├── global-teardown.ts            # Cleanup and reporting
└── onboarding-test-suite.config.ts # Playwright configuration
```

### Test Categories

#### 1. Unit Tests (`/unit/`)

Test individual components and utilities in isolation:

- **Store Management**: Zustand store state management
- **Document Sections**: Section generation and updates
- **Validation Logic**: Form validation and error handling
- **Utility Functions**: Helper functions and data processing

```typescript
// Example: Testing store functionality
test('should update project overview data', () => {
  const { result } = renderHook(() => useOnboardingStore());
  
  act(() => {
    result.current.updateProjectOverview({
      name: 'My App',
      description: 'A great app'
    });
  });
  
  expect(result.current.projectOverview).toMatchObject({
    name: 'My App',
    description: 'A great app'
  });
});
```

#### 2. Integration Tests (`/integration/`)

Test feature interactions and document generation:

- **Document Generation**: Live document preview functionality
- **SuperClaude Integration**: AI persona interactions
- **State Transitions**: Mode switching and data persistence
- **API Integration**: Frontend-backend communication

```typescript
// Example: Testing document generation
test('should generate document sections efficiently', async ({ page }) => {
  await page.fill('textarea[placeholder=""]', 'Build a comprehensive e-commerce platform');
  await page.keyboard.press('Enter');
  
  await page.waitForSelector('text=Project Overview', { timeout: 10000 });
  await page.waitForSelector('text=✓ Section complete', { timeout: 30000 });
  
  expect(firstSectionTime).toBeLessThan(20000);
});
```

#### 3. E2E Tests (`/e2e/`)

Test complete user journeys across browsers:

- **User Flows**: Complete onboarding experience
- **Cross-Browser**: Chrome, Firefox, Safari compatibility
- **Mobile Responsive**: Touch interactions and mobile layouts
- **Error Recovery**: Handling API failures gracefully

#### 4. API Tests (`/api/`)

Test backend endpoints and data processing:

- **Endpoint Functionality**: Request/response validation
- **Error Handling**: Proper error messages and status codes
- **Data Extraction**: Information parsing from conversations
- **Performance**: Response time monitoring

#### 5. Performance Tests (`/performance/`)

Ensure optimal performance across devices:

- **Load Times**: Page and API response times
- **Memory Usage**: Memory leak detection
- **Bundle Size**: JavaScript and CSS optimization
- **Core Web Vitals**: LCP, FID, CLS measurements
- **Stress Testing**: High load scenarios

#### 6. Accessibility Tests (`/accessibility/`)

Ensure WCAG compliance and inclusive design:

- **WCAG 2.1 AA**: Automated accessibility scanning
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and announcements
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Proper focus handling

## Test Suites

### Available Test Suites

| Suite | Description | Projects | Duration |
|-------|-------------|----------|----------|
| `quick` | Essential tests for rapid feedback | unit, api, integration, e2e-chrome | ~5 min |
| `full` | Complete test coverage | All projects | ~20 min |
| `unit` | Unit tests only | unit-tests | ~1 min |
| `integration` | Integration and SuperClaude tests | integration, superclaude | ~5 min |
| `e2e` | Cross-browser end-to-end tests | e2e-chrome, e2e-firefox | ~8 min |
| `performance` | Performance and load testing | performance | ~10 min |
| `accessibility` | Accessibility compliance testing | accessibility | ~5 min |
| `mobile` | Mobile device testing | mobile-chrome, mobile-safari | ~8 min |
| `ci` | Optimized for continuous integration | Essential projects | ~12 min |

### Running Specific Suites

```bash
# Quick feedback loop during development
npm run test:onboarding:quick

# Full test coverage before release
npm run test:onboarding:full

# Performance testing
npm run test:onboarding:performance

# Accessibility compliance
npm run test:onboarding:accessibility

# Mobile compatibility
npm run test:onboarding:mobile
```

## Test Configuration

### Feature Flags

Tests can be configured with different feature flags:

```typescript
// Enable SuperClaude features for testing
localStorage.setItem('feature-flags', JSON.stringify({
  useSuperClaude: true,
  showPersonaInfo: true,
  showSuperClaudeIndicators: true,
  enableContext7: true
}));
```

### Environment Variables

```bash
# Test environment
NODE_ENV=test
NEXT_PUBLIC_TEST_MODE=true

# SuperClaude features
NEXT_PUBLIC_USE_SUPERCLAUDE=true
NEXT_PUBLIC_SHOW_PERSONA_INFO=true
NEXT_PUBLIC_ENABLE_CONTEXT7=true

# API configuration
ANTHROPIC_API_KEY=your-test-key
```

### Browser Configuration

```typescript
// Desktop browsers
use: {
  ...devices['Desktop Chrome'],
  headless: !process.env.HEADED
}

// Mobile devices
use: {
  ...devices['Pixel 5'],
  headless: !process.env.HEADED
}
```

## Test Data

### Test Scenarios

The test suite includes predefined scenarios for consistent testing:

```json
{
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "A comprehensive online marketplace",
      "type": "web application",
      "features": ["authentication", "payments", "real-time"],
      "complexity": "complex"
    }
  ]
}
```

### Mock Data

- **API Responses**: Consistent mock responses for testing
- **Document Content**: Predefined document sections
- **User Interactions**: Scripted user behavior patterns

## Reporting

### Generated Reports

The test suite generates multiple report formats:

- **HTML Report**: Interactive test results (`test-results/html-report/index.html`)
- **JSON Report**: Machine-readable results (`test-results/results.json`)
- **JUnit Report**: CI/CD integration (`test-results/junit.xml`)
- **Allure Report**: Detailed test analytics (`test-results/allure-results/`)

### Viewing Results

```bash
# Open HTML report
open test-results/html-report/index.html

# View summary
cat test-results/SUMMARY.md

# Check completion report
cat test-results/completion-report.json
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Onboarding Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:onboarding:ci
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

### Test Commands for CI

```json
{
  "scripts": {
    "test:onboarding": "ts-node scripts/run-onboarding-tests.ts run --suite quick",
    "test:onboarding:full": "ts-node scripts/run-onboarding-tests.ts run --suite full",
    "test:onboarding:ci": "ts-node scripts/run-onboarding-tests.ts run --suite ci",
    "test:onboarding:unit": "ts-node scripts/run-onboarding-tests.ts run --suite unit",
    "test:onboarding:e2e": "ts-node scripts/run-onboarding-tests.ts run --suite e2e",
    "test:onboarding:performance": "ts-node scripts/run-onboarding-tests.ts run --suite performance",
    "test:onboarding:accessibility": "ts-node scripts/run-onboarding-tests.ts run --suite accessibility",
    "test:onboarding:mobile": "ts-node scripts/run-onboarding-tests.ts run --suite mobile"
  }
}
```

## Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode with visible browser
npx ts-node scripts/run-onboarding-tests.ts run --suite quick --headed --debug

# Run specific test with debugging
npx playwright test tests/integration/document-generation.test.ts --debug
```

### Test Artifacts

When tests fail, artifacts are automatically captured:

- **Screenshots**: Visual state at failure point
- **Videos**: Recording of test execution
- **Traces**: Detailed execution timeline
- **Console Logs**: Browser console output

### Common Debugging Steps

1. **Run in headed mode**: See what the browser is doing
2. **Check screenshots**: Visual state at failure
3. **Review console logs**: JavaScript errors or warnings
4. **Examine API calls**: Network request failures
5. **Verify selectors**: Element visibility and attributes

## Best Practices

### Writing Tests

1. **Use descriptive test names**: Clearly state what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Test user behavior**: Focus on user interactions, not implementation
4. **Use proper selectors**: Prefer `data-testid` over CSS selectors
5. **Handle async operations**: Properly wait for elements and responses

### Test Organization

1. **Group related tests**: Use `describe` blocks for organization
2. **Share setup logic**: Use `beforeEach` for common setup
3. **Independent tests**: Each test should be able to run independently
4. **Clean up resources**: Properly close browsers and clean state

### Performance Considerations

1. **Parallel execution**: Run tests in parallel when possible
2. **Selective execution**: Only run necessary tests during development
3. **Resource management**: Clean up resources after tests
4. **Efficient selectors**: Use efficient DOM selectors

## Troubleshooting

### Common Issues

#### Tests Failing Locally

1. **Check browser installation**: `npx playwright install`
2. **Verify server is running**: Application should be available at `http://localhost:3000`
3. **Clear test results**: `rm -rf test-results/`
4. **Update snapshots**: Add `--update-snapshots` flag

#### Tests Failing in CI

1. **Check CI configuration**: Verify environment variables
2. **Review artifacts**: Download and examine failure artifacts
3. **Compare with local**: Ensure tests pass locally first
4. **Check resource limits**: CI may have memory/CPU constraints

#### Performance Test Issues

1. **Unstable metrics**: Run multiple times and average results
2. **Resource contention**: Ensure CI has sufficient resources
3. **Network variability**: Account for network latency differences
4. **Browser differences**: Results may vary between browsers

### Getting Help

1. **Check documentation**: Review test documentation and comments
2. **Examine similar tests**: Look at working tests for patterns
3. **Use debug mode**: Run tests with `--debug` flag
4. **Review generated reports**: HTML reports provide detailed information

## Contributing

### Adding New Tests

1. **Identify test category**: Unit, integration, e2e, etc.
2. **Follow naming conventions**: Use descriptive file names
3. **Add to appropriate directory**: Place in correct subdirectory
4. **Update configuration**: Add to relevant test projects if needed
5. **Document test purpose**: Include clear descriptions

### Test Guidelines

1. **Test user scenarios**: Focus on real user behavior
2. **Cover edge cases**: Test error conditions and boundaries
3. **Maintain test data**: Keep test scenarios up to date
4. **Follow coding standards**: Use consistent style and patterns
5. **Add appropriate timeouts**: Account for realistic response times

### Updating Tests

1. **Run full suite**: Ensure all tests still pass
2. **Update documentation**: Keep README and comments current
3. **Consider backwards compatibility**: Maintain test stability
4. **Review performance impact**: Ensure tests run efficiently