# Phase 0: Blueprint - Tech Stack Proposal

**Last Updated**: January 2025

---

## 1. Proposed Technology Stack
> This is an initial proposal based on the project vision and existing AIdioma.V2 platform. It is open for discussion and refinement.

| Category          | Technology / Service        | Rationale                                                              |
| ----------------- | --------------------------- | ---------------------------------------------------------------------- |
| **Frontend**      | Next.js 15.x (with TypeScript) | Migration from Vite/React to Next.js for better SEO, SSR capabilities, and enhanced performance. |
| **Styling**       | Tailwind CSS                | Already in use, provides utility-first CSS framework for rapid UI development. |
| **UI Components** | shadcn/ui                   | Enhanced component library to replace current custom components, providing better accessibility and design consistency. |
| **State Management** | Zustand                    | Lightweight state management to replace current React Context patterns for better performance. |
| **Backend**       | Next.js API Routes          | Migration from Express server to Next.js API routes for unified deployment and better integration. |
| **Database**      | PostgreSQL (via Supabase)   | Migration from SQLite to PostgreSQL for better scalability and production readiness. |
| **Authentication** | Supabase Auth               | Robust authentication system with social login options and user management. |
| **AI Integration** | OpenAI API                  | Already in use for sentence evaluation, enhanced for better translation feedback. |
| **Deployment**    | Vercel                      | Optimized for Next.js applications with seamless Git integration and edge functions. |
| **Form Handling** | React Hook Form + Zod       | Already in use, provides excellent form validation and type safety. |
| **Data Fetching** | TanStack Query              | Already in use, provides excellent caching and real-time data synchronization. |

---

## 2. Migration Strategy
> How we'll transition from the current stack to the proposed stack.

### **Phase 1: Frontend Migration**
- Migrate from Vite/React to Next.js 15.x
- Replace wouter routing with Next.js App Router
- Enhance existing Tailwind CSS implementation
- Integrate shadcn/ui component library

### **Phase 2: Backend Migration**
- Convert Express server to Next.js API routes
- Migrate from SQLite to PostgreSQL via Supabase
- Enhance AI integration with improved OpenAI prompts
- Implement Supabase authentication

### **Phase 3: Enhanced Features**
- Implement real-time progress tracking
- Add advanced analytics and reporting
- Enhance AI-powered feedback system
- Optimize performance and user experience

---

## 3. Alternative Options Considered
> This section documents other tools that were considered and why they were not selected as the primary recommendation.

### **Frontend Alternatives**
*   **Remix**: Strong contender for full-stack React, but Next.js has better ecosystem and deployment options.
*   **SvelteKit**: Excellent performance but would require complete rewrite of existing React components.

### **Backend Alternatives**
*   **Firebase**: Considered for BaaS, but Supabase offers better PostgreSQL integration and open-source benefits.
*   **Custom Express/Node.js Server**: Current implementation, but Next.js API routes provide better integration and deployment.

### **Database Alternatives**
*   **MongoDB**: Considered for flexibility, but PostgreSQL provides better relational data modeling for learning analytics.
*   **SQLite**: Current implementation, but PostgreSQL offers better scalability and concurrent access.

---

## 4. Key Decisions & Open Questions
> Any critical decisions that need to be made or questions that need to be answered before finalizing the stack.
>
> *   **Decision**: We will migrate to Next.js 15.x for better performance and developer experience.
> *   **Decision**: We will use Supabase for authentication and database to reduce backend complexity.
> *   **Question**: Should we implement real-time features using Supabase real-time subscriptions or WebSockets?
> *   **Question**: How should we handle the migration of existing user data and progress?
> *   **Decision**: We will maintain the existing AI evaluation system while enhancing it with better prompts and feedback. 