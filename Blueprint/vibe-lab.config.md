# Project Settings: Vibe Lab

**Purpose**: This document defines the core technical and architectural settings for your project. The Vibe Lab AI uses these settings to guide its code generation, architectural decisions, and development workflow.

---

## 1. Technical Foundation
> High-level choices about the core technologies for your project.

*   **Primary Language**: `TypeScript`
*   **Framework**: `Next.js`
*   **Database**: `PostgreSQL`
*   **Deployment Target**: `Vercel`

---

## 2. Architecture
> Key decisions about the structure and style of your application.

*   **Structure**: `Monolith`
*   **Authentication**: `NextAuth`
*   **Styling**: `Tailwind CSS`
*   **State Management**: `React State/Context`

---

## 3. Development Workflow & Conventions
> How you and the AI will collaborate on building the project.

*   **Branching Strategy**: `GitHub Flow (main + feature branches)`
*   **Commit Convention**: `Conventional Commits`
*   **Code Formatting**: `Prettier (Default)`
*   **CI/CD**: `GitHub Actions`

---

## 4. Environment Variables
> Define the secret keys and environment-specific variables your project needs. The Vibe Lab AI will help you generate and manage these.

```env
# Database
DATABASE_URL=

# Authentication  
# e.g., for NextAuth.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Add project-specific variables below:
```

---

## 5. Next Steps
Once this configuration is set, the Vibe Lab AI will use it to inform all subsequent blueprinting phases, ensuring that the project vision, page architecture, and data models align with your chosen technical foundation. 