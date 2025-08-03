# Vibe Lab Platform Theme

## Design Philosophy
Following Strike's actual minimal, ultra-dark aesthetic:
- Ultra-dark backgrounds with subtle contrast
- Clean white text with clear hierarchy
- Minimal color usage - primarily grays
- No Bitcoin orange or heavy color accents
- Professional, understated design
- System fonts for clean typography

## Color System

### Core Colors
```typescript
const colors = {
  // Backgrounds (Strike's ultra-dark theme)
  background: '#0A0A0B',       // Almost black main background
  surface: '#111113',          // Card backgrounds
  surfaceElevated: '#1A1A1C',  // Elevated elements
  
  // Borders
  border: {
    subtle: '#1F1F23',        // Subtle borders
    default: '#374151',       // Default borders
  },
  
  // Text (Strike's clean hierarchy)
  text: {
    primary: '#FFFFFF',       // Primary white text
    secondary: '#A1A1AA',     // Secondary gray text
    muted: '#6B7280',        // Muted text
    disabled: '#4B5563',     // Disabled text
  },
  
  // Functional colors (minimal approach)
  status: {
    success: '#10B981',      // Green for positive
    warning: '#F59E0B',      // Amber for warnings
    error: '#EF4444',        // Red for errors
    neutral: '#6B7280',      // Gray for neutral
  }
}
```

## Typography

```typescript
const typography = {
  // Strike uses system fonts
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'system-ui, monospace',  // For amounts/numbers
  },
  
  weights: {
    light: 300,      // For large numbers
    normal: 400,     // Default weight
    medium: 500,     // For emphasis
    semibold: 600,   // For strong emphasis
  },
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',  // Small labels
    base: '1rem',    // Default body
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '2.5rem', // Large amounts
  }
}
```

## Component Styling

### Buttons (Match Strike's gray buttons)
```typescript
const buttonStyles = {
  // Primary buttons
  primary: cn(
    "bg-[#374151]",              // Dark gray instead of blue
    "text-white",
    "border border-[#4B5563]",
    "hover:bg-[#4B5563]",
    "hover:border-[#6B7280]",
    "transition-all duration-200"
  ),
  
  // Secondary buttons
  secondary: cn(
    "bg-[#1F2937]",
    "text-[#D1D5DB]",
    "border border-[#374151]",
    "hover:bg-[#374151]",
    "hover:text-white"
  ),
  
  // Ghost buttons
  ghost: cn(
    "text-[#9CA3AF]",
    "hover:text-white",
    "hover:bg-transparent"
  )
}
```

### Cards (Like Strike's transaction rows)
```typescript
const cardStyles = {
  base: cn(
    "bg-[#111113]",
    "border border-[#1F1F23]",
    "transition-all duration-200"
  ),
  
  hover: cn(
    "hover:bg-[#1A1A1C]",
    "hover:border-[#374151]"
  ),
  
  // For elevated cards
  elevated: cn(
    "bg-[#1A1A1C]",
    "border border-[#1F1F23]"
  )
}
```

### Form Elements (Strike's minimal inputs)
```typescript
const inputStyles = {
  base: cn(
    "bg-[#111113]",
    "border border-[#1F1F23]",
    "text-white",
    "placeholder-[#6B7280]"
  ),
  
  focus: cn(
    "focus:border-[#374151]",
    "focus:ring-1",
    "focus:ring-[#374151]",
    "focus:ring-opacity-10"
  )
}
```

### Navigation (Match Strike's minimal nav)
```typescript
const navStyles = {
  item: cn(
    "text-[#9CA3AF]",
    "transition-colors duration-200",
    "hover:text-white",
    "hover:bg-transparent"
  ),
  
  active: "text-white bg-transparent",
  
  sidebar: cn(
    "bg-[#0A0A0B]",
    "border-r border-[#1F1F23]"
  )
}
```

## Special Elements

### Amount Displays (Like Strike's balance displays)
```typescript
const amountStyles = {
  // Large amounts
  large: cn(
    "font-light text-[2.5rem]",
    "text-white",
    "font-mono"
  ),
  
  // Regular amounts
  default: cn(
    "font-normal",
    "text-white",
    "font-mono"
  ),
  
  // Labels
  label: cn(
    "text-sm",
    "text-[#9CA3AF]",
    "font-normal"
  )
}
```

### Status Indicators
```typescript
const statusStyles = {
  active: "bg-[#10B981] text-white",    // Green
  neutral: "bg-[#6B7280] text-white",   // Gray
  warning: "bg-[#F59E0B] text-white",   // Amber
  error: "bg-[#EF4444] text-white"      // Red
}
```

## Usage Examples

### Dashboard Card
```tsx
<div className={cn(
  "bg-[#111113] border border-[#1F1F23] p-6",
  "rounded-lg"
)}>
  <div className="text-[#9CA3AF] text-sm">Balance</div>
  <div className="font-mono text-2xl font-light text-white mt-2">
    $1,234.56
  </div>
</div>
```

### Navigation Item
```tsx
<a 
  href="#"
  className={cn(
    "text-[#9CA3AF] hover:text-white",
    "transition-colors duration-200",
    "py-2 px-4"
  )}
>
  Dashboard
</a>
```

### Form Input
```tsx
<input
  type="text"
  className={cn(
    "bg-[#111113] border border-[#1F1F23]",
    "text-white placeholder-[#6B7280]",
    "p-3 rounded-lg w-full",
    "focus:border-[#374151] focus:ring-1 focus:ring-[#374151] focus:ring-opacity-10"
  )}
  placeholder="Enter amount"
/>
```