# Onboarding Phase Headers Documentation

## Overview
The onboarding flow uses phase-aware headers to provide clear context about the current stage of the user journey. This replaces generic "AI Assistant" labeling with specific phase information.

## Implementation Pattern

### Chat Header Structure
```tsx
<div>
  <h3 className="text-sm font-medium text-white">{currentPhase}</h3>
  <p className="text-xs text-[#6B7280]">{phaseDescription}</p>
</div>
```

## Phase Mapping

### Phase 1: Foundation & Context
- **Header**: "Project Set-Up"
- **Description**: "Phase 1: Foundation & Context"
- **Duration**: Initial onboarding conversation
- **Trigger**: User enters onboarding flow

### Phase 2: Document Crafting (Future)
- **Header**: "Document Creation"
- **Description**: "Phase 2: Real-Time Documents" 
- **Duration**: When sufficient context is gathered
- **Trigger**: `hasEnoughInfo` becomes true

### Phase 3: Structure Definition (Future)
- **Header**: "Structure Design"
- **Description**: "Phase 3: Pages & Navigation"
- **Duration**: After documents are approved
- **Trigger**: Document completion

### Phase 4: Visual Design (Future)
- **Header**: "Visual Design"
- **Description**: "Phase 4: Components & Styling"
- **Duration**: After structure is defined
- **Trigger**: Structure completion

## Implementation Guidelines

### Current Implementation
Located in: `/src/app/(onboarding)/onboarding/page.tsx`
- Line ~303: Main phase title
- Line ~304: Phase description

### Dynamic Phase Updates (Recommended)
For future enhancement, implement phase state management:

```tsx
const [currentPhase, setCurrentPhase] = useState({
  title: "Project Set-Up",
  description: "Phase 1: Foundation & Context",
  number: 1
});

// Update based on progress
useEffect(() => {
  if (hasEnoughInfo) {
    setCurrentPhase({
      title: "Document Creation", 
      description: "Phase 2: Real-Time Documents",
      number: 2
    });
  }
}, [hasEnoughInfo]);
```

### Design Consistency

#### Visual Elements
- **Icon**: Keep the Beaker icon (🧪) for all phases
- **Colors**: Purple background `bg-[#8B5CF6]` for consistency
- **Typography**: 
  - Title: `text-sm font-medium text-white`
  - Description: `text-xs text-[#6B7280]`

#### Content Guidelines
- **Titles**: Should be action-oriented and clear
- **Descriptions**: Include phase number and brief context
- **Length**: Keep titles under 20 characters for mobile compatibility

## Benefits

### User Experience
- **Clear Progress**: Users understand where they are in the journey
- **Context Awareness**: Header reflects current functionality
- **Professional Feel**: Removes generic "AI Assistant" labeling

### Development Benefits
- **Debugging**: Easier to identify which phase users are experiencing issues in
- **Analytics**: Can track phase-specific metrics and completion rates
- **Maintenance**: Clear separation of concerns for each phase

## Future Enhancements

### Phase Progress Indicator
Consider adding a progress bar or step indicator:
```tsx
<div className="flex items-center space-x-2">
  <span className="text-xs text-[#6B7280]">Step {currentPhase.number} of 8</span>
  <div className="flex space-x-1">
    {[1,2,3,4,5,6,7,8].map(step => (
      <div 
        key={step}
        className={`w-1 h-1 rounded-full ${
          step <= currentPhase.number ? 'bg-[#8B5CF6]' : 'bg-[#374151]'
        }`}
      />
    ))}
  </div>
</div>
```

### Phase-Specific Actions
Add phase-appropriate quick actions or help options in the header.

### Accessibility
Ensure screen readers announce phase changes for better accessibility.

## Maintenance Notes

- Update phase information when adding new onboarding steps
- Keep descriptions consistent with roadmap documentation
- Test phase transitions for smooth user experience
- Monitor analytics for phase completion rates

---

*Last Updated: February 3, 2025*
*Implementation Status: Phase 1 Complete*