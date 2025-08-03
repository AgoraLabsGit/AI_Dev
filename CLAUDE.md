# Vibe Lab Claude Code Memory

## 🚨 CRITICAL PATTERNS - CHECK FIRST

### Static Asset Loading Issues (Logo/Images)
**WHEN**: Logo or static assets not loading, broken images on pages

**ROOT CAUSE**: NextAuth middleware blocking static asset requests

**IMMEDIATE CHECKS**:
1. ✅ `src/middleware.ts` - Ensure `assets` is in matcher exclusions
2. ✅ Search codebase for hardcoded `/assets/brand/` paths  
3. ✅ Replace hardcoded paths with `<VibeLabLogo />` component

**CORRECT MIDDLEWARE**:
```typescript
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
  //                                                   ^^^^^^^^^^^^ MUST INCLUDE
};
```

**PATTERN**: Always use `<VibeLabLogo size={X} />` instead of `<img src="/assets/brand/..." />`

---

## Project Context

- **Tech Stack**: Next.js 14, TypeScript, Tailwind, NextAuth, Zustand
- **Key Directories**: 
  - `src/app/` - App router pages
  - `src/components/` - Reusable components  
  - `vibe-lab-meta/` - Documentation and tracking
- **Monitoring**: `http://localhost:3000/dev/monitor` for system health
- **Best Practices**: `vibe-lab-meta/development/best-practices.md`

---

## Development Notes

- **Authentication**: GitHub OAuth with NextAuth
- **State Management**: Zustand for complex state
- **UI Components**: Custom component library with QuickActions system
- **Backend Services**: AVCA/DIAS AI integration services
- **File Structure**: Clean app router structure (removed route groups)

---

*This file serves as session-persistent memory for Claude Code to avoid repeating critical mistakes.*