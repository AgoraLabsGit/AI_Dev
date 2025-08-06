# Learning Log

This document captures key learnings, insights, and discoveries made during the development of Vibe Lab. It serves as an active repository of knowledge to inform future decisions and to train the DIAS.

---

### **Initial Development Phase (Pre-Docs Reorg)**

#### What Worked Well
*   **Phased Approach**: A phased development approach with clear milestones proved highly effective for tracking progress and maintaining focus.
*   **Early Cost Awareness**: Integrating cost tracking from the very beginning was critical. It allowed us to identify and solve a major cost issue with our AI model usage that would have otherwise made the project non-viable.
*   **Modular, Event-Driven Design**: Designing the system with modular, event-driven architecture has made it significantly easier to test, debug, and enhance individual components without affecting the entire system.

#### Areas for Improvement
*   **Token Prediction**: Our initial token counting was not accurate enough. We need to invest in more precise token prediction mechanisms to better manage context windows and costs.
*   **Context Optimization**: We identified the need for a caching layer in our `ContextManager` early on but did not implement it. This should be prioritized to improve performance and reduce redundant API calls.
*   **Load Testing**: While our resilience features are tested, we have not yet performed comprehensive load testing to see how the system behaves under sustained, high-concurrency usage.
*   **Monitoring UI**: Our current monitoring is command-line based. A visual dashboard would provide much better real-time visibility into system health.

---

### **Critical Issue Resolutions (Pre-Docs Reorg)**

This section documents critical issues that were discovered and the permanent solutions or best practices that were established to prevent them from recurring.

*   **Issue**: Middleware blocking static asset loading (e.g., logos).
    *   **Root Cause**: The NextAuth middleware matcher was not configured to ignore the `/assets` directory.
    *   **Permanent Solution**: The matcher in `src/middleware.ts` must *always* include `'assets'` in its exclusion list. All logos and static images should be rendered via a dedicated component (e.g., `VibeLabLogo.tsx`) to prevent hardcoded paths.

*   **Issue**: QuickAction buttons displaying icon names as text (e.g., "Sparkles New Project").
    *   **Root Cause**: The component was rendering the icon's name from metadata instead of dynamically mapping the name to the actual imported Lucide icon component.
    *   **Permanent Solution**: Use a mapping function to convert icon names from metadata into actual, imported icon components from `lucide-react`. Never render icon names directly as text.

*   **Issue**: Duplicate components providing the same functionality (e.g., two `QuickActionButton` components).
    *   **Root Cause**: Lack of a single source of truth for core UI elements.
    *   **Permanent Solution**: Strictly enforce the use of a single, comprehensive component for each piece of UI functionality. Immediately deprecate and remove any duplicates that are discovered, refactoring all imports to point to the canonical component.

*   **Issue**: Inconsistent error handling across the application.
    *   **Root Cause**: No standardized pattern for handling errors within components.
    *   **Permanent Solution**: Implement a standardized `ErrorBoundary` higher-order component (HOC) to wrap all major components. This ensures that errors are caught gracefully and a consistent fallback UI is displayed to the user.

*   **Issue**: Complete database connectivity failure during initial setup.
    *   **Root Cause**: The development environment was misconfigured to use a cloud-based Prisma Accelerate connection string, but no local PostgreSQL instance was running. This highlighted a major gap in our developer onboarding documentation.
    *   **Permanent Solution**: We created a comprehensive `Onboarding_and_Setup.md` guide. All new development now defaults to a local PostgreSQL connection. We have also added a `check:db` script to `package.json` to allow developers to instantly verify their database connection, preventing this entire class of errors.

*   **Issue**: A simple icon overlap issue in the UI required multiple failed patch attempts, revealing a fundamental flaw in the styling architecture.
    *   **Root Cause**: The use of complex, nested flexbox layouts without a systematic approach, combined with a lack of adherence to PWA standards for touch targets. This was a direct result of not having a strict, enforced design and styling architecture.
    *   **Permanent Solution**: The "Pure Tailwind CSS Only" philosophy, documented in `Styling_Architecture.md`, was established. This enforces a single, consistent approach to styling using component-local, conditional Tailwind classes. We also implemented automated CI checks and Git hooks to programmatically enforce these new standards and prevent architectural drift. The key learning was that multiple failed patches are a strong signal of a deeper architectural problem, not a surface-level bug.

*   **Issue**: A successful "Phase 0" E2E test of the AVCA pipeline was nearly derailed by a 5.7x cost overrun.
    *   **Root Cause**: The initial implementation used the most powerful AI models (e.g., Claude Opus) for all 8 stages of the pipeline, including simple, low-complexity tasks.
    *   **Permanent Solution**: A cost optimization strategy was implemented to use a dynamic, stage-based model selection. More powerful and expensive models are now reserved for quality-critical stages like final verification, while more cost-effective models (like Claude Sonnet and Haiku) are used for standard code generation and simple operations. This reduced projected pipeline costs by over 80% and brought the project under its target budget, allowing development to proceed. This established a core principle: **cost is a feature** and must be monitored and optimized continuously.

*   **Historical Audit (December 2024)**: An automated audit at the completion of Phase 1 revealed a 75% completion rate and critical discrepancies between the project's roadmap and the task list.
    *   **Key Finding**: The database setup, marked as complete in the task list, had not yet been started. This highlighted a need for more rigorous, automated synchronization between planning documents.
    *   **Action Taken**: The audit recommended, and the team adopted, a process of completing minor UI tasks in parallel with database development to mitigate delays. This reinforced the need for a single source of truth for task management, which is now the `comprehensive_taskmaster.md`.
