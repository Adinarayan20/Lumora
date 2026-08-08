import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ThemeMode, ColorPalette } from './generated/tokens';
import {
  LightThemeColors,
  DarkThemeColors,
  AmoledThemeColors,
  HighContrastThemeColors,
} from './generated/tokens';

export interface ThemeContextState {
  readonly mode: ThemeMode;
  readonly colors: ColorPalette;
  readonly setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

export interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialMode = 'light' }) => {
  const [mode, setThemeMode] = useState<ThemeMode>(initialMode);

  const colors = useMemo<ColorPalette>(() => {
    switch (mode) {
      case 'dark':
        return DarkThemeColors;
      case 'amoled':
        return AmoledThemeColors;
      case 'highContrast':
        return HighContrastThemeColors;
      case 'light':
      case 'system':
      default:
        return LightThemeColors;
    }
  }, [mode]);

  const value = useMemo<ThemeContextState>(
    () => ({
      mode,
      colors,
      setThemeMode,
    }),
    [mode, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextState => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a Lumora ThemeProvider');
  }
  return context;
};
