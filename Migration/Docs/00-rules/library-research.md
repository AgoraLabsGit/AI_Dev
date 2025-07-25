# Library Research Protocol

**MANDATORY**: Before adding ANY new dependency, complete this evaluation process.

## 1. Check Existing Solutions First
```bash
grep -r "dependency-name" package.json
grep -r "similar-functionality" Docs/
npm list | grep -i "related-terms"
```

## 2. Evaluation Criteria (Score 1-5)

**Technical (40% weight):**
- Performance impact on AI evaluation pipeline
- Bundle size (<10KB preferred, >50KB needs justification)
- TypeScript support (native types preferred)
- Integration complexity with 12-module architecture

**Ecosystem (30% weight):**
- Maintenance activity (commits within 3 months)
- Community adoption (>10k weekly downloads)
- Issue response time (<7 days)
- Semver compliance and stability

**Security (20% weight):**
- Zero critical vulnerabilities (npm audit)
- Shallow dependency tree
- Commercial license compatibility
- Verified publisher with 2FA

**AIdioma Fit (10% weight):**
- Module reusability across pages
- Documentation quality
- Testing/mocking support

## 3. Decision Matrix

**Score >4.0**: ✅ Green Light - Adopt immediately
**Score 3.0-4.0**: 🟡 Yellow Light - Proof of concept required
**Score <3.0**: 🔴 Red Light - Build custom solution

## 4. Required Documentation
```markdown
## Library Decision: [Name] v[Version]

**Evaluation Score:** X.X/5.0
- Technical: X/5 - [performance, bundle size, TypeScript]
- Ecosystem: X/5 - [maintenance, adoption, stability]  
- Security: X/5 - [vulnerabilities, dependencies, license]
- Project Fit: X/5 - [reusability, learning curve, docs]

**Integration Cost vs Custom Development:**
- Library integration: 2 hours
- Custom development: 2 weeks
- Decision: [Justified choice with reasoning]

**Alternatives Considered:**
- Library A: Rejected because [specific reason]
- Library B: Rejected because [specific reason]
- Custom implementation: [time estimate and trade-offs]
```

## 5. Integration Requirements
- Must work with existing TanStack Query + shadcn/ui stack
- Must support TypeScript with proper type definitions
- Must not duplicate existing functionality
- Must enhance rather than replace approved tools

Always weigh **2-hour integration vs 2-week custom development** time. 