# Framework Compliance Checklist

## Development Standards Compliance

### TypeScript & Code Quality
- [ ] TypeScript strict mode enabled
- [ ] No `any` types used
- [ ] All component props properly typed
- [ ] Conditional rendering for optional values

### API & Data Standards
- [ ] API responses follow `{ success: boolean, data?: T, error?: string }` format
- [ ] Environment-aware patterns implemented (dev vs prod)
- [ ] Database operations use proper ORM patterns
- [ ] Input validation with Zod schemas

### Architecture Compliance
- [ ] Error boundaries and global error handling configured
- [ ] State management follows decision tree (useState → Context → External)
- [ ] Performance budgets respected (<200KB bundle, <2s load, <200ms API)
- [ ] Logging framework implemented with proper levels

### Security & Production Readiness
- [ ] Authentication system environment-aware
- [ ] HTTPS/SSL configured for production
- [ ] Environment variables secured (no .env in production)
- [ ] Rate limiting enabled on API endpoints

### Development Workflow
- [ ] Pre-development TypeScript check: `npx tsc --noEmit --skipLibCheck`
- [ ] Database migrations tested
- [ ] Emergency debugging procedures documented
- [ ] Essential commands reference updated

## Reference Framework
Follow the **Next.js Development Framework** patterns for all architectural decisions and code implementation. Reference the full framework document in `04-protocols/ai-development-framework.md` for detailed patterns and examples.