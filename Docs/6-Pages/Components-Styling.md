NOTE THAT THIS COMPONENT LIBRARY SYSTEM NEEDS TO BE BUILT IN A WAY THAT IT DOES NOT FUCK UP THE UNDERLING STYLING AND VIBE LAB SYSTEM. IT MUST ALSO BE LIGHTWEIGHT AND NOT WEIGH DOWN THE VIBE LAP APPLICATION. IT MUST USE MODERN AND WELL REGARDED COMPONENTS AND THEMES IN ORDER TO REDUCE THE DEVELOPMENT OVERHEAD OF BUILDING STYLING AND COMPONENTS FROM THE GROUND UP! USE EXISTING LIBRARIES, SERVICES AND THEMES TO IMPORT INTO THIS SYSTEM. LOOK AT GIT HUB RESOURCES. IF WE CAN'T FIND FREE RESOURCES WE CAN CONSIDER PAYING FOR THEM (ONE TIME) 

CURRENT (FAILED) ITTERATION LIVES AT:
http://localhost:3000/components

***

### **Project Overview: Dynamic Styling and Component System**

**1. Core Objective**

The primary goal is to create a dynamic, themeable component system for a Next.js application. The user should be able to select from a curated list of professional, pre-built styling templates ("themes") and have those styles instantly apply to a library of high-quality, reusable UI components. The core principle is to leverage existing, best-in-class libraries to avoid manual, from-scratch component design and ensure a polished, professional result.

**2. Core Technologies**

*   **Framework**: Next.js (App Router)
*   **Styling**: Tailwind CSS
*   **Component Library**: Shadcn UI (components are added manually to `src/components/ui`, not installed as a package)
*   **Component Primitives**: Radix UI (installed as dependencies for Shadcn components)

**3. Architectural Approach**

The system is designed to work by bridging a theme data source with Shadcn's CSS variable-based styling:

1.  **Theme Provider (`src/lib/theme-provider.ts`)**: A centralized file that exports an array of `Theme` objects. Each theme contains a name and a key-value map of CSS variables (e.g., `'--primary': 'hsl(210 100% 50%)'`). This is the single source of truth for all styling information.
2.  **Tailwind Configuration (`tailwind.config.ts`)**: The Tailwind config is set up to use CSS variables for its entire color palette, border radius, and font families (e.g., `primary: 'var(--primary)'`).
3.  **Global Layout (`src/app/layout.tsx`)**: This file is responsible for importing all necessary web fonts (from Google Fonts) and making their corresponding CSS variables available globally.
4.  **Component Gallery (`src/app/components/page.tsx`)**: This page consumes the themes from the theme provider. When a user selects a theme, a `useEffect` hook iterates through the theme's variables and applies them to the root `<html>` element using `document.documentElement.style.setProperty()`. Because Tailwind's classes are linked to these variables, all Shadcn components on the page re-theme instantly.

**4. Development History & Failed Paths**

The path to the current architecture was plagued by significant implementation failures.

*   **Failed Path 1: DaisyUI Integration**
    *   **Attempt**: The DaisyUI library was installed and added as a Tailwind plugin. The goal was to use its `data-theme` attribute to switch between its 32 built-in themes.
    *   **Reason for Failure**: A core incompatibility exists between the theming mechanisms. DaisyUI uses its own set of CSS variables (e.g., `--p`, `--b1`, `--bc`). Shadcn components are built to use a different, specific set of variables (e.g., `--primary`, `--background`, `--card`). The two systems are not compatible out of the box, and applying the `data-theme` attribute had no effect on the Shadcn components, resulting in only minor color changes and no changes to typography or border styles.

*   **Failed Path 2: Shadcn CLI Compatibility Issues**
    *   **Attempt**: The standard `npx shadcn@latest add` command was used to add components to the project.
    *   **Reason for Failure**: The CLI repeatedly failed in the development environment. It would either hang on interactive prompts (which could not be answered) or fail on a `tailwind: Required` validation error, even when the configuration was present. This necessitated adding all Shadcn components manually by copying their source code from the official documentation, which introduced several subsequent errors.

**5. Summary of Key Challenges Encountered**

*   **Module Casing Mismatches**: The `Button.tsx` component was initially created as `button.tsx`. This caused persistent `TypeError: ... is not a function` errors due to the Next.js bundler's confusion on a case-insensitive file system.
*   **Missing Radix Dependencies**: The initial manual addition of Shadcn components failed to include the installation of their underlying Radix UI dependencies (e.g., `@radix-ui/react-avatar`), leading to `Module not found` errors.
*   **Incomplete Theme Data**: Early versions of the `theme-provider` contained placeholder themes with empty color palettes. This caused `TypeError: Cannot read properties of undefined` when the application tried to access color properties that didn't exist.
*   **Missing Font Imports**: The most recent failure was caused by defining font families in the theme provider (e.g., `'--font-sans': '"Poppins", sans-serif'`) without actually importing the Poppins font into the application via the global layout file. This resulted in themes only changing colors, with no effect on typography.

I am deeply sorry for the cascade of failures. The current architecture is sound, but my execution has been flawed. The immediate next step is to correctly and completely implement the plan I most recently laid out.