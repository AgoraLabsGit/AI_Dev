'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, darkTheme, lightTheme, generateCSSVariables } from './theme';

interface ThemeContextType {
  theme: Theme;
  themeName: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<'dark' | 'light'>('dark');
  const theme = themeName === 'dark' ? darkTheme : lightTheme;
  
  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Add theme class
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${themeName}`);
    
    // Generate and apply CSS variables
    const cssVars = generateCSSVariables(theme);
    const styleTag = document.getElementById('theme-vars') || document.createElement('style');
    styleTag.id = 'theme-vars';
    styleTag.innerHTML = `:root { ${cssVars} }`;
    
    if (!document.getElementById('theme-vars')) {
      document.head.appendChild(styleTag);
    }
    
    // Apply background color to body
    document.body.style.backgroundColor = theme.colors.background.primary;
    document.body.style.color = theme.colors.text.primary;
  }, [theme, themeName]);
  
  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('vibe-lab-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setThemeName(savedTheme);
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(newTheme);
    localStorage.setItem('vibe-lab-theme', newTheme);
  };
  
  const setTheme = (theme: 'dark' | 'light') => {
    setThemeName(theme);
    localStorage.setItem('vibe-lab-theme', theme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}