"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorTheme, ThemeName, themes, currentTheme } from './colors';

interface ThemeContextType {
  theme: ColorTheme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: ThemeName[];
  systemTheme: 'light' | 'dark' | null;
  useSystemTheme: boolean;
  setUseSystemTheme: (use: boolean) => void;
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Helper to get initial theme from localStorage (runs synchronously)
const getInitialTheme = (): ThemeName => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
  }
  return currentTheme;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const initialTheme = getInitialTheme();
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);
  const [theme, setThemeState] = useState<ColorTheme>(themes[initialTheme]);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | null>(null);
  const [useSystemTheme, setUseSystemTheme] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    setThemeState(themes[newThemeName]);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newThemeName);
    }
  };

  // Detect system theme preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUseSystemTheme = localStorage.getItem('useSystemTheme') === 'true';
      setUseSystemTheme(savedUseSystemTheme);

      if (savedUseSystemTheme && systemTheme) {
        // Use system theme
        const autoTheme = systemTheme === 'dark' ? 'ocean' : 'cherryBlossom';
        setThemeName(autoTheme);
        setThemeState(themes[autoTheme]);
      }

      setIsInitialized(true);
    }
  }, [systemTheme]);

  // Apply CSS variables when theme changes with smooth transition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;

      // Remove no-transitions class on first load
      root.classList.remove('no-transitions');
      body.classList.remove('no-transitions');

      // Add transition class for smooth color changes (but not on initial load)
      if (isInitialized) {
        root.classList.add('theme-transition');
        body.classList.add('theme-transition');
        setTimeout(() => {
          root.classList.remove('theme-transition');
          body.classList.remove('theme-transition');
        }, 300);
      }

      // Apply CSS variables
      Object.entries(theme.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value);
      });

      Object.entries(theme.secondary).forEach(([key, value]) => {
        root.style.setProperty(`--color-secondary-${key}`, value);
      });

      Object.entries(theme.accent).forEach(([key, value]) => {
        root.style.setProperty(`--color-accent-${key}`, value);
      });

      Object.entries(theme.neutral).forEach(([key, value]) => {
        root.style.setProperty(`--color-neutral-${key}`, value);
      });

      Object.entries(theme.semantic).forEach(([key, value]) => {
        root.style.setProperty(`--color-semantic-${key}`, value);
      });

      Object.entries(theme.background).forEach(([key, value]) => {
        root.style.setProperty(`--color-background-${key}`, value);
      });

      Object.entries(theme.text).forEach(([key, value]) => {
        root.style.setProperty(`--color-text-${key}`, value);
      });

      Object.entries(theme.border).forEach(([key, value]) => {
        root.style.setProperty(`--color-border-${key}`, value);
      });

      // Apply background and text colors directly to body for full coverage
      body.style.backgroundColor = theme.background.primary;
      body.style.color = theme.text.primary;

      // Add data attribute to body for theme-aware styling
      const isLight = themeName === 'cherryBlossom' || themeName === 'nordic';
      body.setAttribute('data-theme', themeName);
      body.setAttribute('data-theme-type', isLight ? 'light' : 'dark');
    }
  }, [theme, isInitialized, themeName]);

  const value: ThemeContextType = {
    theme,
    themeName,
    setTheme,
    availableThemes: Object.keys(themes) as ThemeName[],
    systemTheme,
    useSystemTheme,
    isInitialized,
    setUseSystemTheme: (use: boolean) => {
      setUseSystemTheme(use);
      if (typeof window !== 'undefined') {
        localStorage.setItem('useSystemTheme', String(use));
      }
      if (use && systemTheme) {
        const autoTheme = systemTheme === 'dark' ? 'ocean' : 'cherryBlossom';
        setTheme(autoTheme);
      }
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
