/**
 * Theme Provider (Final Professional Version)
 *
 * This file contains the complete, correctly mapped theme data for the application.
 * It uses professional color palettes from Radix Colors, tailored to create
 * sophisticated, modern themes suitable for developer tools and enterprise applications.
 */

export interface Theme {
  name: string;
  variables: { [key: string]: string };
}

// Color palettes are from Radix Colors: https://www.radix-ui.com/colors
export const themes: Theme[] = [
  // 1. Slate (Inspired by Vercel/Linear - Dark)
  {
    name: 'Slate',
    variables: {
      '--background': 'hsl(222 18% 12%)', // slate2
      '--foreground': 'hsl(215 20% 65%)', // slate11
      '--card': 'hsl(222 18% 14%)', // slate3
      '--card-foreground': 'hsl(215 20% 65%)',
      '--popover': 'hsl(222 18% 14%)',
      '--popover-foreground': 'hsl(215 20% 65%)',
      '--primary': 'hsl(210 100% 98%)', // Almost white
      '--primary-foreground': 'hsl(222 18% 12%)',
      '--secondary': 'hsl(222 18% 20%)', // slate5
      '--secondary-foreground': 'hsl(210 100% 98%)',
      '--muted': 'hsl(222 18% 17%)', // slate4
      '--muted-foreground': 'hsl(215 15% 45%)', // slate9
      '--accent': 'hsl(210 100% 50%)', // Blue
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--destructive': 'hsl(0 63% 50%)', // red9
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--border': 'hsl(222 18% 20%)',
      '--input': 'hsl(222 18% 20%)',
      '--ring': 'hsl(210 100% 50%)',
      '--radius': '0.5rem',
      '--font-sans': 'var(--font-inter)',
      '--font-mono': 'var(--font-jetbrains-mono)',
    },
  },
  // 2. Graphite (Inspired by GitHub Dark)
  {
    name: 'Graphite',
    variables: {
      '--background': 'hsl(220 13% 9%)', // gray2
      '--foreground': 'hsl(210 15% 85%)', // gray11
      '--card': 'hsl(220 13% 12%)', // gray3
      '--card-foreground': 'hsl(210 15% 85%)',
      '--popover': 'hsl(220 13% 12%)',
      '--popover-foreground': 'hsl(210 15% 85%)',
      '--primary': 'hsl(205 90% 60%)', // blue9
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--secondary': 'hsl(220 13% 20%)', // gray5
      '--secondary-foreground': 'hsl(210 15% 95%)',
      '--muted': 'hsl(220 13% 15%)', // gray4
      '--muted-foreground': 'hsl(210 10% 55%)', // gray9
      '--accent': 'hsl(150 70% 45%)', // green9
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--destructive': 'hsl(350 80% 60%)', // red9
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--border': 'hsl(220 13% 20%)',
      '--input': 'hsl(220 13% 20%)',
      '--ring': 'hsl(205 90% 60%)',
      '--radius': '0.5rem',
      '--font-sans': 'var(--font-inter)',
      '--font-mono': 'var(--font-jetbrains-mono)',
    },
  },
  // 3. Stone (Light Theme)
  {
    name: 'Stone',
    variables: {
      '--background': 'hsl(0 0% 100%)',
      '--foreground': 'hsl(240 10% 4%)',
      '--card': 'hsl(0 0% 98%)',
      '--card-foreground': 'hsl(240 10% 4%)',
      '--popover': 'hsl(0 0% 98%)',
      '--popover-foreground': 'hsl(240 10% 4%)',
      '--primary': 'hsl(240 6% 10%)',
      '--primary-foreground': 'hsl(0 0% 98%)',
      '--secondary': 'hsl(0 0% 96%)',
      '--secondary-foreground': 'hsl(240 6% 10%)',
      '--muted': 'hsl(0 0% 94%)',
      '--muted-foreground': 'hsl(240 4% 46%)',
      '--accent': 'hsl(240 5% 26%)',
      '--accent-foreground': 'hsl(0 0% 98%)',
      '--destructive': 'hsl(0 84% 60%)',
      '--destructive-foreground': 'hsl(0 0% 98%)',
      '--border': 'hsl(0 0% 91%)',
      '--input': 'hsl(0 0% 91%)',
      '--ring': 'hsl(240 6% 10%)',
      '--radius': '0.5rem',
      '--font-sans': 'var(--font-inter)',
      '--font-mono': 'var(--font-jetbrains-mono)',
    },
  },
  // 4. Forest (Inspired by Supabase)
  {
    name: 'Forest',
    variables: {
      '--background': 'hsl(210 20% 10%)',
      '--foreground': 'hsl(140 20% 88%)',
      '--card': 'hsl(210 20% 13%)',
      '--card-foreground': 'hsl(140 20% 88%)',
      '--popover': 'hsl(210 20% 13%)',
      '--popover-foreground': 'hsl(140 20% 88%)',
      '--primary': 'hsl(140 65% 45%)', // green9
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--secondary': 'hsl(210 20% 22%)',
      '--secondary-foreground': 'hsl(140 20% 95%)',
      '--muted': 'hsl(210 20% 18%)',
      '--muted-foreground': 'hsl(140 10% 55%)',
      '--accent': 'hsl(140 55% 55%)', // green10
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--destructive': 'hsl(0 70% 60%)',
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--border': 'hsl(210 20% 22%)',
      '--input': 'hsl(210 20% 22%)',
      '--ring': 'hsl(140 65% 45%)',
      '--radius': '0.75rem',
      '--font-sans': 'var(--font-inter)',
      '--font-mono': 'var(--font-jetbrains-mono)',
    },
  },
  // 5. Indigo (Deep Blue)
  {
    name: 'Indigo',
    variables: {
      '--background': 'hsl(226 30% 11%)',
      '--foreground': 'hsl(220 20% 85%)',
      '--card': 'hsl(226 30% 14%)',
      '--card-foreground': 'hsl(220 20% 85%)',
      '--popover': 'hsl(226 30% 14%)',
      '--popover-foreground': 'hsl(220 20% 85%)',
      '--primary': 'hsl(220 90% 65%)', // indigo9
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--secondary': 'hsl(226 30% 25%)',
      '--secondary-foreground': 'hsl(220 20% 95%)',
      '--muted': 'hsl(226 30% 20%)',
      '--muted-foreground': 'hsl(220 15% 55%)',
      '--accent': 'hsl(260 90% 70%)', // violet9
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--destructive': 'hsl(0 80% 65%)',
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--border': 'hsl(226 30% 25%)',
      '--input': 'hsl(226 30% 25%)',
      '--ring': 'hsl(220 90% 65%)',
      '--radius': '0.5rem',
      '--font-sans': 'var(--font-inter)',
      '--font-mono': 'var(--font-jetbrains-mono)',
    },
  },
  // 6. Rose (Soft Light Theme)
  {
    name: 'Rose',
    variables: {
      '--background': 'hsl(350 100% 99%)',
      '--foreground': 'hsl(350 20% 25%)',
      '--card': 'hsl(350 100% 98%)',
      '--card-foreground': 'hsl(350 20% 25%)',
      '--popover': 'hsl(350 100% 98%)',
      '--popover-foreground': 'hsl(350 20% 25%)',
      '--primary': 'hsl(340 75% 55%)', // rose9
      '--primary-foreground': 'hsl(0 0% 100%)',
      '--secondary': 'hsl(350 50% 96%)',
      '--secondary-foreground': 'hsl(350 20% 25%)',
      '--muted': 'hsl(350 50% 94%)',
      '--muted-foreground': 'hsl(350 15% 45%)',
      '--accent': 'hsl(20 80% 60%)', // orange9
      '--accent-foreground': 'hsl(0 0% 100%)',
      '--destructive': 'hsl(0 80% 60%)',
      '--destructive-foreground': 'hsl(0 0% 100%)',
      '--border': 'hsl(350 50% 90%)',
      '--input': 'hsl(350 50% 90%)',
      '--ring': 'hsl(340 75% 55%)',
      '--radius': '0.75rem',
      '--font-sans': 'var(--font-lora)',
      '--font-mono': 'var(--font-courier-prime)',
    },
  },
  // Whimsical themes for variety
  {
      name: 'Cyberpunk',
      variables: {
        '--background': 'hsl(250 20% 10%)',
        '--foreground': 'hsl(180 100% 85%)',
        '--card': 'hsl(250 20% 12%)',
        '--card-foreground': 'hsl(180 100% 85%)',
        '--popover': 'hsl(250 20% 12%)',
        '--popover-foreground': 'hsl(180 100% 85%)',
        '--primary': 'hsl(50 100% 60%)',
        '--primary-foreground': 'hsl(250 20% 10%)',
        '--secondary': 'hsl(320 100% 70%)',
        '--secondary-foreground': 'hsl(250 20% 10%)',
        '--muted': 'hsl(250 20% 20%)',
        '--muted-foreground': 'hsl(180 20% 60%)',
        '--accent': 'hsl(180 100% 50%)',
        '--accent-foreground': 'hsl(250 20% 10%)',
        '--destructive': 'hsl(0 100% 65%)',
        '--destructive-foreground': 'hsl(0 0% 100%)',
        '--border': 'hsl(50 100% 60%)',
        '--input': 'hsl(250 20% 20%)',
        '--ring': 'hsl(50 100% 60%)',
        '--radius': '0rem',
        '--font-sans': 'var(--font-orbitron)',
        '--font-mono': 'var(--font-vt323)',
      },
  },
  {
      name: 'Valentine',
      variables: {
        '--background': 'hsl(340 40% 95%)',
        '--foreground': 'hsl(340 20% 30%)',
        '--card': 'hsl(340 40% 92%)',
        '--card-foreground': 'hsl(340 20% 30%)',
        '--popover': 'hsl(340 40% 92%)',
        '--popover-foreground': 'hsl(340 20% 30%)',
        '--primary': 'hsl(340 80% 65%)',
        '--primary-foreground': 'hsl(0 0% 100%)',
        '--secondary': 'hsl(260 70% 80%)',
        '--secondary-foreground': 'hsl(340 20% 30%)',
        '--muted': 'hsl(340 35% 85%)',
        '--muted-foreground': 'hsl(340 15% 45%)',
        '--accent': 'hsl(190 70% 75%)',
        '--accent-foreground': 'hsl(340 20% 30%)',
        '--destructive': 'hsl(0 70% 60%)',
        '--destructive-foreground': 'hsl(0 0% 100%)',
        '--border': 'hsl(340 35% 85%)',
        '--input': 'hsl(340 35% 85%)',
        '--ring': 'hsl(340 80% 65%)',
        '--radius': '1rem',
        '--font-sans': 'var(--font-dancing-script)',
        '--font-mono': 'var(--font-fira-code)',
      },
  },
];
