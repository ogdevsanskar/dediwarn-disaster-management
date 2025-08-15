import React, { createContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'cyber' | 'ocean' | 'forest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { [key in Theme]: ThemeConfig };
}

interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    gradient: string;
  };
}

const themes: { [key in Theme]: ThemeConfig } = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#A78BFA',
      accent: '#FBBF24',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#334155',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)'
    }
  },
  cyber: {
    name: 'Cyber',
    colors: {
      primary: '#00FFFF',
      secondary: '#FF00FF',
      accent: '#00FF00',
      background: '#000011',
      surface: '#001122',
      text: '#00FFFF',
      textSecondary: '#0099CC',
      border: '#003366',
      success: '#00FF88',
      warning: '#FFAA00',
      error: '#FF0066',
      gradient: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)'
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      accent: '#F0F9FF',
      background: '#0C4A6E',
      surface: '#075985',
      text: '#F0F9FF',
      textSecondary: '#BAE6FD',
      border: '#0369A1',
      success: '#22D3EE',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#064E3B',
      surface: '#065F46',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#047857',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
    }
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dediwarn-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dediwarn-theme', theme);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    const themeColors = themes[theme].colors;
    
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};