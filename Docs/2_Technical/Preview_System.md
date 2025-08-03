# Preview System

## 1. Overview

The Vibe Lab Preview System provides a real-time application preview environment, allowing for immediate visual feedback and interaction at multiple stages of the development process. This is one of the two primary "Visualize" features, alongside pushing the code to a GitHub repository.

## 2. The Preview Evolution

The "preview" is not a single feature, but an evolving experience that provides different capabilities at different stages of the AVCA pipeline.

*   **Stage 0: Import & Analysis Preview**: During the initial import phase, the preview system provides tools to analyze an existing codebase. It can visualize the repository structure, extract styles for Tailwind conversion, and generate a component inventory.
*   **Stage 2: Template Preview**: In the design phase, the preview system allows for live demonstration of different template variations. It includes a class inspector and responsive testing tools to help designers and developers fine-tune the look and feel.
*   **Stage 8: Live Application Preview**: The final stage is a full, interactive deployment of the generated application. It uses the Vercel Edge Runtime to create instant, sandboxed environments.

## 3. Live Application Preview: Core Features

This is the most advanced preview, available at the end of the build pipeline.

*   **Live Environment**: Deployed instantly to the Vercel Edge and rendered within a sandboxed iframe. Each preview has a 30-minute lifetime.
*   **Real-time Updates**: A WebSocket connection provides real-time updates as changes are made.
*   **Device Simulation**: The interface includes controls for simulating various devices (mobile, tablet, desktop).
*   **Style Inspector**: A built-in inspector allows for real-time validation of Tailwind CSS classes.
*   **Performance Monitoring**: The system tracks Core Web Vitals to provide immediate feedback on performance.

## 4. Technical Implementation (Live Preview)

*   **Trigger**: Automatically triggered upon the successful completion of the Stage 8 AVCA code generation pipeline.
*   **Process**: The system packages the generated code, deploys it to the Vercel Edge Runtime, generates a unique preview URL, and initializes monitoring services.
*   **Security & Isolation**: Previews are heavily secured using a strict Content Security Policy (CSP), a restricted execution environment, resource usage limits, and cross-origin isolation.

## 5. Integration with Core Systems

*   **AVCA**: The preview system is directly connected to the output of the AVCA pipeline at multiple stages.
*   **DIAS**: The DIAS monitors the final live preview in real-time to provide quality validation and performance metrics.
*   **Styling**: The system performs real-time analysis of the preview's styling to ensure compliance with our pure Tailwind architecture.

## 6. Risks & Mitigation

*   **Excessive Resource Usage**: Mitigated by enforcing strict 30-minute lifetimes on all live preview environments and running a robust automated cleanup service.
*   **Slow Preview Generation**: Mitigated by using the Vercel Edge Runtime for near-instant deployments and leveraging intelligent caching.
*   **Security of Executed Code**: Mitigated by running all previews within a heavily restricted, sandboxed environment with a strict CSP.
