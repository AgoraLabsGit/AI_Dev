# Vibe Lab Navigation System (Pure Tailwind Implementation)

## 1. Core Features

The navigation system is designed to provide access to four main categories of features:

*   **Platform Features**: Project Dashboard, User Authentication, Team Collaboration, and Monitoring.
*   **AVCA Pipeline Stages**: Blueprints, Styling, Page Layouts, Component Specifications, and Live Preview.
*   **Build System**: Component Generation, Code Quality, Component Registry, and Application Assembly.
*   **AI Intelligence (DIAS)**: The Smart AI Chat, Intent Routing, and the Learning System.

### 🏠 **Platform Features**
- Project Dashboard & Overview
- Project Creation & Management  
- User Authentication & Profile
- Team Collaboration & Sharing
- Cost Monitoring & Analytics
- System Health & Performance

### 🎨 **AVCA Pipeline Stages**
- Project Blueprints & Requirements (Stage 1)
- Component Templates & Styling (Stage 2)  
- Page Layouts & User Flows (Stage 3)
- Component Specifications (Stage 4)
- Live Preview & Testing

### 🔧 **Build System**
- Component Generation (Stage 5)
- Code Quality & Verification (Stage 6)
- Component Registry Management (Stage 7)
- Application Assembly & Preview (Stage 8)
- Deployment Pipeline Integration

### 🤖 **AI Intelligence (DIAS)**
- Smart AI Chat Interface (Developer + Auditor)
- Intent Classification & Routing
- Pipeline Progress Tracking
- Intelligent Suggestions & Predictions
- Learning System & Preferences
- Error Intelligence & Debugging

## 2. Navigation Components

All navigation components are implemented using a **Pure Tailwind CSS** approach. This means no custom CSS files, no external design system imports, and all styling is component-local.

### Main Sidebar

The primary navigation component, providing access to the main sections of the application.

```tsx
// Pure Tailwind implementation
const MainSidebar = () => {
  const mode = useMode();

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4">
        <Logo className="h-8 w-8" />
        <MenuSwitcher />
      </div>

      {mode === 'home' ? (
        <HomeNav className="space-y-2 p-4" />
      ) : (
        <ProjectNav className="space-y-2 p-4" />
      )}

      <GlobalActions className="absolute bottom-0 w-full p-4" />
    </aside>
  );
}
```

### Code Directory Mode

A specialized sidebar view for navigating the file structure of a generated project.

```tsx
// Pure Tailwind implementation
const CodeDirectory = () => {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4">
        <DirectoryHeader />
        <MenuSwitcher />
      </div>

      <div className="overflow-y-auto h-[calc(100vh-8rem)]">
        <FileTree className="space-y-1 p-4" />
      </div>

      <SearchBar className="absolute bottom-0 w-full p-4" />
    </aside>
  );
}
```

## 3. Template & Styling Variations

All styling variations (e.g., for active or danger states) are handled through Tailwind class conditionals, not separate CSS.

```tsx
const NavigationButton = ({ variant = 'default', ...props }) => {
  const styles = {
    default: 'bg-gray-800 hover:bg-gray-700 text-white',
    active: 'bg-blue-600 hover:bg-blue-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white'
  }

  return (
    <button
      className={`px-4 py-2 rounded-lg transition-colors ${styles[variant]}`}
      {...props}
    />
  );
}
```

## 4. Mobile Responsiveness

Responsiveness is achieved using Tailwind's built-in responsive classes (e.g., `lg:block`, `hidden`).

```tsx
const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <Sidebar className="hidden lg:block fixed inset-y-0 left-0 w-64" />

      {/* Mobile header - visible on mobile only */}
      <header className="lg:hidden flex items-center h-16 px-4">
        {/* ... */}
      </header>

      {/* Main content - full width on mobile, adjusted on desktop */}
      <main className="lg:ml-64 p-4">
        {children}
      </main>
    </div>
  );
}
```
