# Vibe Lab Development Code of Conduct

## Our Commitment

We are committed to building a high-quality, accessible, and maintainable platform that serves developers, freelancers, and teams effectively. This Code of Conduct establishes standards for code quality, design system compliance, and collaborative development practices.

---

## Code Quality Standards

### ✅ Required Practices

#### **PWA Compliance (Non-Negotiable)**
- **44px Minimum Touch Targets**: All interactive elements must meet PWA standards
- **Semantic HTML**: Use proper HTML elements (`<header>`, `<nav>`, `<button>`, `<section>`) 
- **Mobile-First Design**: Progressive enhancement, not content hiding
- **ARIA Labels**: Accessibility attributes required for complex interactions
- **Keyboard Navigation**: Full keyboard support for all interactive elements

#### **Component Architecture**
- **TypeScript Interfaces**: All components must define proper prop interfaces
- **Component Size Limit**: Maximum 200 lines per component file
- **Composable Design**: Prefer composition over monolithic components
- **Systematic Spacing**: Use design token scale (gap-1 through gap-8)
- **No Magic Numbers**: Avoid hardcoded values, use design system tokens

#### **Layout & Responsive Design**
- **CSS Grid for Structure**: Use CSS Grid for complex layouts, not nested flexbox
- **Systematic Breakpoints**: Follow mobile (sm), tablet (md), desktop (lg) strategy
- **No Complex Flexbox**: Avoid `justify-between` with competing layout methods
- **Progressive Enhancement**: Core functionality works on all devices

### ❌ Prohibited Practices

#### **Anti-Patterns That Will Be Blocked**
- **Touch Targets < 44px**: Automatically blocked by pre-commit hooks
- **Complex Nested Flexbox**: Patterns like `justify-between` + `flex-1` + `min-w-0` + `gap-*` + `mr-*`
- **Content Hiding**: Using `hidden sm:block` instead of proper responsive reflow
- **Hardcoded Colors**: Hex values instead of design tokens
- **Any Type Usage**: TypeScript `any` type is forbidden
- **Magic Spacing Values**: Large numeric spacing (p-12, gap-20) without systematic justification

#### **Architectural Violations**
- **Monolithic Components**: Components exceeding 200 lines
- **Missing Interfaces**: Components without proper TypeScript prop definitions
- **Div Soup**: Excessive nested divs instead of semantic HTML
- **Non-Responsive**: Components that don't work on mobile devices

---

## Automated Enforcement

### 🤖 Pre-Commit Validation

**Every commit is automatically validated against these standards:**

```bash
# PWA Compliance Check
npm run check:pwa

# Component Architecture Validation  
npm run check:architecture

# Complete Design System Validation
npm run check:design-system
```

**Commits will be BLOCKED if violations are detected.**

### 🔍 Real-Time Feedback

**Development workflow provides immediate feedback:**
- VS Code integration shows violations as you type
- NPM scripts provide detailed fix guidance
- Git hooks prevent committing problematic code
- Learning capture system documents architectural decisions

### 📋 Quality Gates

**Multi-layer validation ensures consistent quality:**
1. **Development**: Real-time IDE feedback
2. **Pre-commit**: Automated validation blocking violations
3. **Pull Request**: Additional review for architectural decisions
4. **Learning**: Automated capture of design patterns and decisions

---

## Design System Guidelines

### 🎨 Component Creation Process

**When creating new components:**

1. **Read Design System Learning Log** first for established patterns
2. **Use PWA Compliance Checklist** for all interactive elements
3. **Follow Component Architecture Guidelines** for structure and composition
4. **Test with automated validation** before committing
5. **Document significant architectural decisions** in learning logs

### 🏗️ Layout Decision Framework

**Before implementing any layout:**

**Ask these questions:**
1. **Is this mobile-first and PWA compliant?**
2. **Can this use CSS Grid instead of complex flexbox?**
3. **Are all touch targets minimum 44px?**
4. **Will this be maintainable and testable?**
5. **Does this follow systematic spacing?**

**Red Flags (Stop and Reconsider):**
- Multiple failed attempts to fix layout issues
- Need for conflicting CSS properties (flexbox + justify-between + gaps + margins)
- Interactive elements smaller than 44px
- Content hiding for responsive behavior
- Complex nested structures for simple layouts

### 🎯 When to Patch vs. Rebuild

**Patch When:**
- Single property adjustment needed
- Minor spacing issue in isolated component  
- Simple responsive behavior fix

**Rebuild When:**
- Multiple patch attempts have failed
- Complex layout causing maintainability issues
- PWA standards violations detected
- Component architecture becoming unwieldy

**Escalation Path:**
- 2+ failed patches → Review architecture
- PWA violations → Mandatory rebuild with compliant patterns
- Learning patterns detected → Update documentation and automation

---

## Collaboration Standards

### 👥 Team Development

#### **Code Reviews**
- **Design System Compliance**: Reviewer must verify automated checks pass
- **Architectural Decisions**: Document reasoning for complex implementations
- **Learning Capture**: Note patterns that should be added to automation
- **PWA Standards**: Verify accessibility and mobile experience

#### **Knowledge Sharing**
- **Learning Logs**: Update design system learning log for architectural decisions
- **Pattern Documentation**: Add reusable patterns to component library
- **Automation Enhancement**: Suggest new validation rules based on recurring issues
- **Cross-Project Transfer**: Apply learnings from other projects (e.g., BitAgora PWA knowledge)

#### **Communication**
- **Be Respectful**: Focus on code quality, not personal criticism
- **Be Constructive**: Provide specific, actionable feedback
- **Be Learning-Oriented**: Share knowledge and learn from others
- **Be Patient**: Allow time for understanding and improvement

### 🎓 Continuous Improvement

#### **Learning Culture**
- **Mistakes are Learning Opportunities**: Document issues and solutions
- **Question Patterns**: Challenge existing approaches when better solutions exist
- **Share Knowledge**: Contribute to design system evolution
- **Embrace Automation**: Use tools to enforce quality consistently

#### **System Evolution**
- **Pattern Recognition**: Identify recurring issues for automation
- **Rule Enhancement**: Suggest improvements to validation systems
- **Documentation Updates**: Keep learning logs current and actionable
- **Quality Metrics**: Track improvement in development velocity and issue prevention

---

## Enforcement & Resolution

### 🚨 Violation Response

#### **Automated Violations (Blocked by Git Hooks)**
1. **Review Error Messages**: Detailed guidance provided with each violation
2. **Consult Learning Logs**: Check Design System Learning Log for solutions
3. **Apply Fixes**: Use NPM scripts to validate fixes (`npm run check:design-system`)
4. **Escalate if Needed**: If automated guidance isn't sufficient, seek team input

#### **Manual Review Violations**
1. **Collaborative Discussion**: Work together to understand the issue
2. **Learning Opportunity**: Document the pattern for future reference
3. **Solution Implementation**: Apply fixes with reviewer guidance
4. **Pattern Addition**: Consider adding to automated validation if recurring

### 🤝 Conflict Resolution

#### **Technical Disagreements**
- **Evidence-Based Discussion**: Provide specific examples and reasoning
- **Refer to Standards**: Use PWA compliance and design system guidelines as reference
- **Seek Consensus**: Focus on best solution for the platform and users
- **Document Decisions**: Record architectural decisions for future reference

#### **Quality Standards Questions**
- **Automated Validation First**: If automation flags it, there's usually a good reason
- **Consult Documentation**: Check Design System Learning Log for historical context
- **Team Discussion**: Bring complex cases to team for broader input
- **Evolution**: Standards can evolve, but changes should be deliberate and documented

---

## Getting Started

### 🚀 For New Contributors

**Setup Required:**
```bash
# Install quality automation
npm run hooks:install

# Test the system
npm run check:design-system

# Read the guidelines
open "Vibe Lab/Concept-&-Inspiration/Review/Design-System-Learning-Log.md"
```

**Required Reading:**
1. **Design System Learning Log** - Understanding established patterns
2. **PWA Compliance Checklist** - Standards for all interactive elements
3. **Component Architecture Guidelines** - Structural requirements

**First Contribution Checklist:**
- [ ] Quality automation installed and tested
- [ ] Design system documentation reviewed
- [ ] Sample component created and validated
- [ ] Pre-commit hooks working correctly

### 📚 Resources

**Primary Documentation:**
- `Design-System-Learning-Log.md` - Real-time architectural learnings
- `Responsive-Design-System.md` - PWA and responsive design standards
- `DESIGN_SYSTEM_SETUP.md` - Automation installation and usage

**Automation Tools:**
- `npm run check:design-system` - Complete validation suite
- `npm run hooks:test` - Test pre-commit hook functionality
- `npm run capture:learning` - Document new learning patterns

---

## Living Document

This Code of Conduct is a living document that evolves with our platform and team. Changes are made through:

1. **Team Discussion**: Proposed changes discussed with all contributors
2. **Evidence-Based Updates**: Changes supported by development experience and metrics
3. **Automated Integration**: New standards integrated into validation systems
4. **Documentation Updates**: All related documentation updated consistently

**Last Updated**: 2025-01-27  
**Next Review**: After Phase 2 completion or significant architectural changes

---

*This Code of Conduct supports our mission to build a high-quality, accessible platform that serves our users effectively while maintaining a positive and productive development environment.*