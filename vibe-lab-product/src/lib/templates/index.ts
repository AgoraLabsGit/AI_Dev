import { TailwindTemplate } from '@/lib/avca/services/styling-service';

export const templates: TailwindTemplate[] = [
  {
    id: 'linear',
    name: 'Linear',
    description: 'Clean, minimal interface inspired by Linear',
    category: 'minimal',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      input: {
        base: 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        filled: 'bg-muted border-transparent',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-lg bg-card text-card-foreground',
        elevated: 'shadow-lg',
        outlined: 'border border-border',
        interactive: 'hover:shadow-md transition-shadow cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'Inter',
        heading: 'Inter',
        mono: 'JetBrains Mono',
      },
      weights: [400, 500, 600, 700],
    },
  },
  {
    id: 'apple',
    name: 'Apple',
    description: 'Elegant and refined design inspired by Apple',
    category: 'modern',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-6 py-2.5 rounded-full font-medium transition-all duration-300 focus:outline-none',
        primary: 'bg-black text-white hover:bg-gray-800',
        secondary: 'bg-white text-black border border-gray-200 hover:bg-gray-50',
        ghost: 'text-black hover:bg-gray-100',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      input: {
        base: 'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base transition-colors focus:border-black focus:outline-none',
        filled: 'bg-gray-100 border-transparent',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-2xl bg-white',
        elevated: 'shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
        outlined: 'border border-gray-200',
        interactive: 'hover:scale-[1.02] transition-transform cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'SF Pro Display',
        heading: 'SF Pro Display',
        mono: 'SF Mono',
      },
      weights: [400, 500, 600, 700],
    },
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Bold and vibrant design inspired by Spotify',
    category: 'playful',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-transform hover:scale-105',
        primary: 'bg-[#1DB954] text-black hover:bg-[#1ed760]',
        secondary: 'bg-white text-black hover:bg-gray-100',
        ghost: 'text-white hover:bg-[#282828]',
        destructive: 'bg-[#E91429] text-white hover:bg-[#f91430]',
      },
      input: {
        base: 'w-full rounded-full bg-[#282828] text-white px-6 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]',
        filled: 'bg-[#121212]',
        outlined: 'bg-transparent border-2',
        underlined: 'rounded-none border-b-2 px-0',
      },
      card: {
        base: 'rounded-lg bg-[#181818] text-white',
        elevated: 'hover:bg-[#282828] transition-colors duration-300',
        outlined: 'border-2 border-[#282828]',
        interactive: 'cursor-pointer hover:bg-[#282828]',
      },
    },
    typography: {
      fonts: {
        primary: 'Gotham',
        heading: 'Gotham',
        mono: 'IBM Plex Mono',
      },
      weights: [400, 500, 700],
    },
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Professional and trustworthy design inspired by Stripe',
    category: 'professional',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-6 py-2 rounded-lg font-medium text-sm transition-all',
        primary: 'bg-[#635BFF] text-white hover:bg-[#524aff]',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ghost: 'text-gray-600 hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      input: {
        base: 'w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-[#635BFF] focus:outline-none focus:ring-1 focus:ring-[#635BFF]',
        filled: 'bg-gray-50 border-transparent',
        outlined: 'bg-white',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-lg bg-white',
        elevated: 'shadow-lg shadow-gray-900/5',
        outlined: 'border border-gray-200',
        interactive: 'hover:shadow-xl transition-shadow cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'sohne',
        heading: 'sohne',
        mono: 'Source Code Pro',
      },
      weights: [400, 500, 600],
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Developer-focused design inspired by GitHub',
    category: 'developer',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-4 py-2 rounded-md font-semibold text-sm transition-colors',
        primary: 'bg-[#2DA44E] text-white hover:bg-[#2C974B]',
        secondary: 'border border-[#D0D7DE] bg-[#F6F8FA] text-[#24292F] hover:bg-[#F3F4F6]',
        ghost: 'text-[#24292F] hover:bg-[#F3F4F6]',
        destructive: 'bg-[#CF222E] text-white hover:bg-[#A40E26]',
      },
      input: {
        base: 'w-full rounded-md border border-[#D0D7DE] bg-white px-3 py-2 text-sm shadow-sm focus:border-[#0969DA] focus:outline-none focus:ring-1 focus:ring-[#0969DA]',
        filled: 'bg-[#F6F8FA]',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-md bg-white border border-[#D0D7DE]',
        elevated: 'shadow-sm',
        outlined: 'border border-[#D0D7DE]',
        interactive: 'hover:border-[#0969DA] transition-colors cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: '-apple-system',
        heading: '-apple-system',
        mono: 'SFMono-Regular',
      },
      weights: [400, 500, 600],
    },
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Modern and sleek design inspired by Vercel',
    category: 'minimal',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-4 py-2 rounded-md font-medium text-sm transition-all duration-150',
        primary: 'bg-black text-white hover:bg-gray-900',
        secondary: 'bg-white text-black border border-gray-200 hover:border-black',
        ghost: 'text-gray-600 hover:text-black',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      input: {
        base: 'w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm transition-colors focus:border-black focus:outline-none',
        filled: 'bg-gray-50',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-md bg-white',
        elevated: 'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
        outlined: 'border border-gray-200',
        interactive: 'hover:border-black transition-colors cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'Inter',
        heading: 'Inter',
        mono: 'Menlo',
      },
      weights: [400, 500, 600, 700],
    },
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Clean and functional design inspired by Notion',
    category: 'minimal',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-4 py-1.5 rounded-md font-medium text-sm transition-colors',
        primary: 'bg-black text-white hover:bg-gray-800',
        secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        ghost: 'text-gray-600 hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      input: {
        base: 'w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm transition-colors focus:border-blue-500 focus:outline-none',
        filled: 'bg-gray-50',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-md bg-white',
        elevated: 'shadow-sm',
        outlined: 'border border-gray-200',
        interactive: 'hover:bg-gray-50 transition-colors cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'inter',
        heading: 'inter',
        mono: 'monaco',
      },
      weights: [400, 500, 600],
    },
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Creative and modern design inspired by Figma',
    category: 'creative',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-4 py-2 rounded-md font-medium text-sm transition-all',
        primary: 'bg-black text-white hover:bg-[#1E1E1E]',
        secondary: 'bg-[#EBEBEB] text-black hover:bg-[#DFDFDF]',
        ghost: 'text-[#333333] hover:bg-[#EBEBEB]',
        destructive: 'bg-[#F24822] text-white hover:bg-[#DC3A12]',
      },
      input: {
        base: 'w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm transition-colors focus:border-[#18A0FB] focus:outline-none',
        filled: 'bg-[#F5F5F5]',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-md bg-white',
        elevated: 'shadow-[0_2px_5px_rgba(0,0,0,0.1)]',
        outlined: 'border border-[#E5E5E5]',
        interactive: 'hover:border-[#18A0FB] transition-colors cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'inter',
        heading: 'inter',
        mono: 'roboto mono',
      },
      weights: [400, 500, 600],
    },
  },
  {
    id: 'raycast',
    name: 'Raycast',
    description: 'Elegant and efficient design inspired by Raycast',
    category: 'minimal',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
        primary: 'bg-[#FF6363] text-white hover:bg-[#FF4F4F]',
        secondary: 'bg-[#2C2C2C] text-white hover:bg-[#3C3C3C]',
        ghost: 'text-gray-300 hover:text-white hover:bg-[#2C2C2C]',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      input: {
        base: 'w-full rounded-lg border border-[#2C2C2C] bg-[#1C1C1C] px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-[#FF6363] focus:outline-none',
        filled: 'bg-[#2C2C2C] border-transparent',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-lg bg-[#1C1C1C] text-white',
        elevated: 'shadow-lg shadow-black/20',
        outlined: 'border border-[#2C2C2C]',
        interactive: 'hover:bg-[#2C2C2C] transition-colors cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'inter',
        heading: 'inter',
        mono: 'jetbrains mono',
      },
      weights: [400, 500, 600],
    },
  },
  {
    id: 'arc',
    name: 'Arc',
    description: 'Playful and innovative design inspired by Arc Browser',
    category: 'playful',
    author: 'Vibe Lab',
    version: '1.0.0',
    classVariants: {
      button: {
        base: 'px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300',
        primary: 'bg-gradient-to-r from-[#FF4F4F] to-[#FF9B9B] text-white hover:opacity-90',
        secondary: 'bg-[#2C2C2C] text-white hover:bg-[#3C3C3C]',
        ghost: 'text-gray-300 hover:text-white hover:bg-[#2C2C2C]',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      input: {
        base: 'w-full rounded-full border border-[#2C2C2C] bg-[#1C1C1C] px-6 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#FF4F4F] focus:outline-none',
        filled: 'bg-[#2C2C2C] border-transparent',
        outlined: 'bg-transparent',
        underlined: 'border-0 border-b-2 rounded-none px-0',
      },
      card: {
        base: 'rounded-2xl bg-[#1C1C1C] text-white overflow-hidden',
        elevated: 'shadow-xl shadow-black/30',
        outlined: 'border-2 border-[#2C2C2C]',
        interactive: 'hover:scale-[1.02] transition-transform cursor-pointer',
      },
    },
    typography: {
      fonts: {
        primary: 'inter',
        heading: 'inter',
        mono: 'jetbrains mono',
      },
      weights: [400, 500, 600],
    },
  },
];

export type TemplateId = typeof templates[number]['id'];