import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ThemeMode, ColorPalette } from './generated/tokens.js';
import { LightThemeColors, DarkThemeColors } from './generated/tokens.js';

export interface ThemeContextValue {
  readonly mode: ThemeMode;
  readonly colors: ColorPalette;
  readonly toggleTheme: () => void;
  readonly setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  readonly initialMode?: ThemeMode;
  readonly children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  initialMode = 'light',
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = mode === 'dark' ? DarkThemeColors : LightThemeColors;
    return {
      mode,
      colors,
      toggleTheme: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      setThemeMode: (newMode: ThemeMode) => setMode(newMode),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a Lumora ThemeProvider');
  }
  return context;
};
