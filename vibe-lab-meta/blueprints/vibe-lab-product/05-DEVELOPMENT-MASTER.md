# 05 - Vibe Lab Development Master Blueprint
**Code Standards, Workflows, and Development Protocols**

---

## 1. Code Style & Conventions

### Language Standards
```typescript
interface DevelopmentStandards {
  language: "TypeScript 5.0+ with strict mode";
  framework: "Next.js 14+ with App Router";
  styling: "Tailwind CSS v4 (pure utility classes only)";
  linting: "ESLint with TypeScript-specific rules";
  formatting: "Prettier with consistent config";
  bundling: "Native Next.js bundling with optimization";
}
```

### Naming Conventions
```typescript
interface NamingConventions {
  components: "PascalCase (Button, UserProfile, NavSidebar)";
  files: "kebab-case for pages, PascalCase for components";
  variables: "camelCase for all variables and functions";
  constants: "SCREAMING_SNAKE_CASE for module constants";
  types: "PascalCase with descriptive suffixes (UserData, APIResponse)";
  cssClasses: "Tailwind utility classes only (no custom classes)";
}
```

### File Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   ├── api/               # API route handlers
│   └── globals.css        # Tailwind directives only
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI elements
│   ├── navigation/       # Navigation components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── avca/            # AVCA engine components
│   ├── dias/            # DIAS intelligence components
│   └── utils.ts         # Shared utilities
├── types/               # TypeScript type definitions
└── config/              # Configuration files
```

## 2. Pure Tailwind Development Standards

### Styling Requirements (Critical)
```typescript
interface StylingStandards {
  enforcement: "MANDATORY - Zero tolerance for violations";
  
  allowed: [
    "Tailwind utility classes only",
    "CSS variables in globals.css (theming)",
    "Tailwind directives (@tailwind base/components/utilities)",
    "Conditional class application in components"
  ];
  
  forbidden: [
    "Custom CSS files (except globals.css)",
    "CSS modules (.module.css, .module.scss)",
    "Styled-components or any CSS-in-JS",
    "Design system imports (shadcn/ui, etc.)",
    "Inline styles except for dynamic values",
    "Custom CSS classes in globals.css"
  ];
  
  validation: "Pre-commit hooks validate Tailwind-only compliance";
}
```

### Component Architecture Pattern
```typescript
// ✅ CORRECT: Pure Tailwind component with template variations
const Button = ({ 
  template = 'strike', 
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  const templateStyles = {
    strike: {
      primary: 'bg-surface hover:bg-surface-elevated text-foreground border border-border',
      secondary: 'bg-transparent hover:bg-surface text-foreground-secondary border border-border',
      destructive: 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
    },
    linear: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      destructive: 'bg-red-600 hover:bg-red-700 text-white'
    }
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button 
      className={`
        ${templateStyles[template][variant]} 
        ${sizeStyles[size]} 
        rounded-lg transition-colors duration-150 
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
      {...props}
    />
  );
};
```

## 3. Git Workflow & Version Control

### Branching Strategy
```typescript
interface GitWorkflow {
  strategy: "GitHub Flow (simplified)";
  
  branches: {
    main: "Production-ready code, auto-deploys to production";
    feature: "feature/[issue-number]-[short-description]";
    hotfix: "hotfix/[issue-number]-[short-description]";
    experimental: "experiment/[feature-name]";
  };
  
  protection: {
    main: ["Required PR review", "Passing CI checks", "Up-to-date branch"];
    process: "No direct commits to main branch";
  };
}
```

### Commit Message Standards
```typescript
interface CommitStandards {
  format: "Conventional Commits specification";
  
  types: {
    feat: "New feature implementation";
    fix: "Bug fix";
    docs: "Documentation changes";
    style: "Code style changes (formatting, no logic changes)";
    refactor: "Code refactoring without feature changes";
    test: "Adding or updating tests";
    chore: "Build process or auxiliary tool changes";
  };
  
  examples: [
    "feat(avca): add Stage 2 styling configuration",
    "fix(dias): resolve pattern recognition memory leak",
    "docs(blueprints): update UI/UX blueprint with Strike theme",
    "style(components): enforce Tailwind-only compliance",
    "refactor(api): optimize database query performance"
  ];
}
```

## 4. Testing Strategy

### Testing Architecture
```typescript
interface TestingStrategy {
  levels: {
    unit: {
      tool: "Jest + React Testing Library";
      coverage: "80%+ for business logic";
      focus: "Component behavior, utility functions, API logic";
    };
    integration: {
      tool: "Jest + Supertest for API testing";
      coverage: "90%+ for API endpoints";
      focus: "API routes, database interactions, service integration";
    };
    e2e: {
      tool: "Playwright";
      coverage: "Critical user workflows";
      focus: "Complete AVCA pipeline, user authentication, deployment";
    };
  };
  
  requirements: {
    newFeatures: "Must include tests before PR approval";
    bugFixes: "Must include regression tests";
    refactoring: "Existing tests must continue to pass";
  };
}
```

### Testing Patterns
```typescript
// Component Testing Example
describe('Button Component', () => {
  it('applies correct Tailwind classes for Strike template', () => {
    render(<Button template="strike" variant="primary">Test</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-surface', 
      'hover:bg-surface-elevated', 
      'text-foreground',
      'border',
      'border-border'
    );
  });
  
  it('enforces Tailwind-only styling', () => {
    render(<Button>Test</Button>);
    
    const button = screen.getByRole('button');
    // Ensure no custom CSS classes are applied
    expect(button.className).toMatch(/^[a-z-\s:]+$/); // Only Tailwind format
  });
});
```

## 5. Code Review Process

### PR Requirements
```typescript
interface CodeReviewProcess {
  requirements: {
    description: "Clear description of changes and reasoning";
    testing: "Evidence of testing (unit tests, manual testing)";
    screenshots: "UI changes must include before/after screenshots";
    compliance: "Tailwind-only compliance verification";
    performance: "Performance impact assessment for significant changes";
  };
  
  checks: {
    automated: [
      "TypeScript compilation",
      "ESLint passing",
      "Prettier formatting",
      "Test suite passing",
      "Tailwind compliance check",
      "Build success"
    ];
    manual: [
      "Code quality review",
      "Architecture alignment",
      "Security considerations",
      "Performance implications"
    ];
  };
}
```

### Review Checklist
```markdown
## Code Review Checklist

### Architecture & Design
- [ ] Follows Vibe Lab architectural patterns
- [ ] Uses pure Tailwind styling (no custom CSS)
- [ ] Implements proper TypeScript types
- [ ] Follows established naming conventions

### Quality & Performance
- [ ] Code is clear and maintainable
- [ ] No performance regressions
- [ ] Proper error handling
- [ ] Security considerations addressed

### Testing & Documentation
- [ ] Adequate test coverage
- [ ] Documentation updated if needed
- [ ] No breaking changes without migration plan
- [ ] Follows conventional commit format
```

## 6. Performance Standards

### Performance Budgets
```typescript
interface PerformanceStandards {
  metrics: {
    firstContentfulPaint: "<1.5s";
    largestContentfulPaint: "<2.5s";
    firstInputDelay: "<100ms";
    cumulativeLayoutShift: "<0.1";
  };
  
  bundleSize: {
    javascript: "<250KB gzipped per route";
    css: "<50KB (Tailwind purged)";
    images: "WebP format, responsive sizing";
  };
  
  monitoring: {
    tool: "Vercel Analytics + Core Web Vitals";
    alerts: "Performance regression alerts";
    reporting: "Monthly performance review";
  };
}
```

## 7. AI Development Integration

### AVCA/DIAS Development Standards
```typescript
interface AIDevelopmentStandards {
  codeGeneration: {
    compliance: "All generated code must pass Tailwind compliance checks";
    testing: "Generated components must include basic tests";
    documentation: "Generated code must include TypeScript types";
  };
  
  qualityAssurance: {
    auditAgent: "Claude Auditor reviews all generated code";
    validation: "DIAS validates architectural compliance";
    iteration: "Failed audits trigger automatic regeneration";
  };
  
  humanOversight: {
    review: "Human review required for complex generated features";
    approval: "Manual approval for production deployments";
    learning: "Feedback loop improves AI generation quality";
  };
}
```

## 8. Development Environment

### Local Development Setup
```typescript
interface DevelopmentEnvironment {
  requirements: {
    node: "Node.js 18+";
    package: "npm or yarn (consistent across team)";
    editor: "VS Code with recommended extensions";
    database: "PostgreSQL (local or Neon for development)";
  };
  
  scripts: {
    dev: "next dev (development server)";
    build: "next build (production build)";
    test: "jest --watch (test runner)";
    "test:e2e": "playwright test (E2E tests)";
    lint: "eslint . --fix (code linting)";
    "type-check": "tsc --noEmit (type checking)";
    "tailwind-check": "custom script for Tailwind compliance";
  };
}
```

### IDE Configuration
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

---

## Development Success Metrics

### Code Quality
- **Type Safety**: 100% TypeScript coverage with strict mode
- **Test Coverage**: 80%+ unit, 90%+ integration, 100% critical paths
- **Tailwind Compliance**: 100% (zero custom CSS violations)
- **Performance**: Meet all Core Web Vitals targets

### Development Velocity
- **Build Time**: <2 minutes for full build
- **Test Suite**: <5 minutes for complete test run
- **Hot Reload**: <500ms for development changes
- **Deployment**: <3 minutes from PR merge to production

### Quality Assurance
- **Bug Rate**: <2% of releases require hotfixes
- **Code Review**: <24 hour review turnaround
- **CI/CD**: 99%+ build success rate
- **Performance**: Zero performance regressions

---

*This development blueprint ensures consistent, high-quality code that follows Vibe Lab's architectural standards and supports both human and AI development workflows.*