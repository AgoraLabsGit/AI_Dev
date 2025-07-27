# Project Settings: [Project Name]

**Purpose**: This document defines the core technical and architectural settings for your project. The Vibe Lab AI uses these settings to guide its code generation, architectural decisions, and development workflow.

---

## 1. Technical Foundation
> High-level choices about the core technologies for your project.

*   **Primary Language**: `[JavaScript/TypeScript | Python | Go]`
*   **Framework**: `[React (Vite) | Next.js | SvelteKit | Django | Express]`
*   **Database**: `[PostgreSQL | MongoDB | SQLite]`
*   **Deployment Target**: `[Vercel | Netlify | AWS | Google Cloud | Fly.io]`

---

## 2. Architecture
> Key decisions about the structure and style of your application.

*   **Structure**: `[Monolith | Microservices | Serverless]`
*   **Authentication**: `[Supabase Auth | Auth0 | NextAuth | Custom]`
*   **Styling**: `[Tailwind CSS | CSS Modules | Styled Components]`
*   **State Management**: `[React State/Context | Redux | Zustand | None]`

---

## 3. Development Workflow & Conventions
> How you and the AI will collaborate on building the project.

*   **Branching Strategy**: `[GitHub Flow (main + feature branches) | Git Flow (main, develop, feature)]`
*   **Commit Convention**: `[Conventional Commits | Custom Prefix | None]`
*   **Code Formatting**: `[Prettier (Default) | Custom Rules]`
*   **CI/CD**: `[GitHub Actions | GitLab CI | Jenkins | Not configured]`

---

## 4. Environment Variables
> Define the secret keys and environment-specific variables your project needs. The Vibe Lab AI will help you generate and manage these.

```env
# Database
DATABASE_URL=

# Authentication  
# e.g., for Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=

# External APIs
# e.g., for Stripe
STRIPE_SECRET_KEY=

# Add project-specific variables below:
```

---

## 5. Next Steps
Once this configuration is set, the Vibe Lab AI will use it to inform all subsequent blueprinting phases, ensuring that the project vision, page architecture, and data models align with your chosen technical foundation.