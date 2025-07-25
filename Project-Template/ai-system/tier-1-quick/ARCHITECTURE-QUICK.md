# Architecture Quick Reference
**Tier 1: Fast architectural decisions for this project.**

## ⚡ Quick Decision Trees

### Component Architecture Choice
```
Need to build a UI feature?
├── Is there a similar component in `ai-system/tier-2-patterns/components/`? → Adapt it.
├── Is it a simple display component? → Create a new Functional Component with props.
├── Does it manage its own state? → Use `useState` and `useEffect`.
├── Does it share state with a few other components? → Use a custom hook or the Context API.
└── Is the state needed across the entire application? → Use a global state management solution.
```

### API Route Choice
```
Need to build an API endpoint?
├── Is it for simple CRUD operations? → Use a standard RESTful pattern.
├── Does it need to handle complex queries or mutations? → Consider GraphQL or an enhanced REST pattern.
├── Does it need to provide real-time updates? → Use a WebSocket alongside a REST endpoint for initial data.
```

## 🏗️ Core Architectural Patterns

### Project Structure
- Adhere to the standard `src/` directory structure: `components`, `pages`, `hooks`, `lib`.

### Component Naming
- Use `PascalCase` as defined in `PROJECT-CONFIG.md`.

### API Route Pattern
```typescript
// Always return a standardized JSON response.
export async function GET(request: Request) {
  try {
    // ... business logic ...
    return Response.json({ success: true, data: result });
  } catch (error) {
    // Log the error for the intelligence system.
    console.error('API Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
``` 