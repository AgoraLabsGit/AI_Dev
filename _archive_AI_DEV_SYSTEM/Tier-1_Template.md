# Architecture Quick Reference
**Tier 1: Fast Implementation Guidance**

*🎯 Purpose: Quick architectural decisions and patterns for rapid development*  
*📏 Target: 1,000-2,000 words | ⚡ Speed-optimized for daily coding*

---

## ⚡ Quick Decision Trees

### **Component Architecture Choice**
```
Need to build a feature?
├── Simple display → Functional Component + Props
├── State needed → useState + useEffect patterns  
├── Complex state → Custom hook or Context
└── Cross-app state → Global state management
```

### **Data Flow Decision**
```
How should data move?
├── Single component → Local state
├── Parent-child → Props + callbacks
├── Sibling components → Lift state up
├── Distant components → Context API
└── Complex app state → External state manager
```

### **API Architecture Choice**
```
What kind of endpoint?
├── Simple CRUD → RESTful pattern
├── Complex queries → GraphQL or enhanced REST
├── Real-time needed → WebSocket + REST hybrid
└── File operations → Multipart + presigned URLs
```

---

## 🏗 Core Architectural Patterns

### **Project Structure Pattern**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (buttons, inputs)
│   └── feature/         # Feature-specific components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configs
├── api/                 # API routes (if applicable)
└── types/               # TypeScript type definitions
```

### **Component Pattern**
```typescript
// ✅ Standard Component Pattern
interface ComponentProps {
  required: string;
  optional?: boolean;
  children?: ReactNode;
}

export function Component({ required, optional = false }: ComponentProps) {
  // Logic here
  return <div>{/* JSX here */}</div>
}
```

### **API Route Pattern**
```typescript
// ✅ Standard API Pattern
export async function GET(request: Request) {
  try {
    // Validation
    // Business logic
    // Return success
    return Response.json({ success: true, data: result })
  } catch (error) {
    return Response.json({ success: false, error: error.message })
  }
}
```

---

## 📊 Data Architecture

### **Database Patterns**
**Choose based on your PROJECT-CONFIG.md settings:**

```typescript
// ✅ Standard CRUD Pattern
interface DatabaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // Add fields based on domain
}

// ✅ Multi-tenant Pattern (if enabled)
interface TenantRecord extends DatabaseRecord {
  tenantId: string;
  // Ensure all queries include tenant scoping
}
```

### **State Management Levels**
1. **Component Level**: `useState` for local UI state
2. **Feature Level**: Custom hooks for feature-specific logic
3. **Application Level**: Context API for shared state
4. **Global Level**: External library if complexity requires

---

## 🔐 Security Architecture

### **Authentication Flow**
```
User Request → Auth Check → Route Access
├── Authenticated → Continue to component
├── Unauthenticated → Redirect to login
└── Insufficient permissions → Access denied
```

### **Data Protection Pattern**
```typescript
// ✅ Input validation pattern
import { z } from 'zod'

const InputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
})

// Validate all user inputs
const validated = InputSchema.parse(userInput)
```

---

## 🎨 UI Architecture

### **Component Hierarchy**
```
App
├── Layout (navigation, footer)
├── Pages (route-specific content)
│   ├── Feature Components (business logic)
│   └── UI Components (reusable elements)
└── Providers (context, auth, theme)
```

### **Styling Strategy**
**Based on PROJECT-CONFIG.md styling choice:**
- **Tailwind CSS**: Utility-first classes, component variants
- **CSS Modules**: Component-scoped styles, clear naming
- **Styled Components**: CSS-in-JS with theme integration

---

## 🔄 Integration Architecture

### **External API Pattern**
```typescript
// ✅ Service wrapper pattern
class ExternalService {
  private baseURL = process.env.EXTERNAL_API_URL
  
  async getData(params: QueryParams) {
    // Implementation with error handling
    // Return standardized response format
  }
}
```

### **Database Integration**
```typescript
// ✅ Repository pattern
class DataRepository {
  async create(data: CreateData) {
    // Validation, creation, logging
  }
  
  async findMany(filters: Filters) {
    // Query building, execution, formatting
  }
}
```

---

## 📈 Performance Architecture

### **Optimization Patterns**
- **Component Level**: React.memo for expensive renders
- **Data Level**: Proper caching and pagination
- **Bundle Level**: Code splitting and lazy loading
- **Network Level**: API response caching

### **Monitoring Points**
- Page load times
- API response times  
- Database query performance
- User interaction responsiveness

---

## 🚨 When to Escalate to Higher Tiers

### **Check Tier 2 (Living Examples) When:**
- Building a feature you think might already exist
- Integrating with external services
- Implementing complex business logic
- Need proven patterns from this project

### **Check Tier 3 (Comprehensive) When:**
- Making major architectural decisions
- Encountering complex debugging scenarios
- Need complete context for review process
- Implementing security-critical features

### **Search External Resources When:**
- Need library-specific implementation details
- Looking for industry best practices
- Researching new technology integration
- Validating architectural approaches

---

## ⚡ Quick Commands

### **Development Workflow**
```bash
# Based on PROJECT-CONFIG.md settings
npm run dev          # Start development server
npm run build        # Production build
npm test            # Run tests
npm run lint        # Check code quality
```

### **Common Patterns to Check First**
1. **Authentication flow** - Check existing auth implementation
2. **API endpoints** - Look for similar endpoint patterns  
3. **Form handling** - Reuse validation and submission patterns
4. **Error handling** - Use established error boundary patterns

---

## 📋 Implementation Checklist

**Before starting any feature:**
- [ ] Check Tier 2 for existing similar patterns
- [ ] Identify required integrations and dependencies
- [ ] Plan component structure and data flow
- [ ] Consider security and validation requirements
- [ ] Plan testing approach

**During implementation:**
- [ ] Follow established patterns from this document
- [ ] Log decisions and reasoning in dev_log.md
- [ ] Update Tier 2 with reusable patterns
- [ ] Test functionality as you build

**After completion:**
- [ ] Document new patterns for future reuse
- [ ] Update integration examples if applicable
- [ ] Hand off to review process with clear context
- [ ] Archive working solutions in appropriate Tier 2 directory

---

*🚀 Remember: Use your AI training knowledge for implementation details. This document provides project-specific patterns and decision guidance. When in doubt, check Tier 2 for existing examples first, then escalate to Tier 3 for comprehensive context.*