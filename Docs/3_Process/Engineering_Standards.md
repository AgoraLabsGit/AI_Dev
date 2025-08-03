# Engineering Standards & Goals

This document defines the key performance indicators (KPIs), service level agreements (SLAs), and quality standards for the Vibe Lab platform.

## 1. Performance SLAs

These are the target performance metrics that the system must meet to ensure a high-quality and responsive user experience.

*   **API Response Time (p95)**:
    *   **Target**: < 200ms
    *   **Description**: Applies to all standard synchronous API calls (e.g., fetching project data). Excludes endpoints that initiate long-running asynchronous jobs.

*   **AI First Token Time (p95)**:
    *   **Target**: < 1.5 seconds
    *   **Description**: Measured from the moment a user submits a prompt to the first text chunk appearing in the UI. This is a critical metric for perceived AI responsiveness.

*   **Async Job Initiation Time (p95)**:
    *   **Target**: < 500ms
    *   **Description**: The time it takes for the system to acknowledge a request and schedule a background job (e.g., for code generation).

## 2. Platform Reliability

*   **Platform Uptime**:
    *   **Target**: 99.9% ("three nines")
    *   **Description**: Applies to the Vibe Lab frontend and all core backend services.

## 3. Quality Gates

These are the minimum quality standards that all generated code must meet, enforced automatically by the AVCA pipeline's `Verification` stage.

*   **Test Coverage**: Minimum 80%
*   **Security Score**: Minimum 9/10 (as rated by the Auditor AI)
*   **Performance Score**: Minimum 90/100 (as rated by the Auditor AI)
*   **Accessibility Standard**: Must meet WCAG AA
*   **Typing**: Must pass TypeScript strict mode

## 4. Security & Testing Requirements

To ensure the platform is secure and reliable, the following requirements are enforced for all code contributions.

### Security Requirements
*   **Validate All Inputs**: Especially data coming from AI model responses.
*   **Sanitize User Content**: All user-generated content must be sanitized to prevent XSS attacks.
*   **Use Environment Variables**: No secrets should ever be hardcoded.
*   **Follow OWASP Guidelines**: Adhere to the OWASP Top 10 security best practices.

### Testing Requirements
Every Pull Request must include a comprehensive suite of tests:
*   **Unit Tests**: For all new or modified functions and logic.
*   **Integration Tests**: For API endpoints and service interactions.
*   **Component Tests**: For all new or modified UI components.
*   **E2E Tests**: For critical user workflows (e.g., onboarding, code generation).
