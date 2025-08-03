## Vibe Lab Pages and Routing

### Authentication Pages
- Sign-In: http://localhost:3000/sign-in

### Onboarding Flow
- Onboarding: http://localhost:3000/onboarding

### Route Structure Fix
The onboarding page was previously located at `src/app/(onboarding)/page.tsx`, but since `(onboarding)` is a route group (denoted by parentheses), it doesn't create a URL path segment. This caused a 404 error when trying to access `/onboarding`.

**Solution Implemented:**
1. Created a dedicated onboarding route inside the group: `src/app/(onboarding)/onboarding/page.tsx`
2. Updated the root page (`src/app/page.tsx`) to redirect to `/onboarding`

This approach:
- Maintains the route group structure for organizational purposes
- Creates the proper URL path for the onboarding page
- Follows Next.js best practices for routing
- Preserves the separation between auth and app layouts