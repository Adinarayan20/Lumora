import type { ColorPalette, ThemeMode } from '../generated/tokens';
import { LightThemeColors, DarkThemeColors } from '../generated/tokens';

export class ComponentTokenResolver {
  public static resolveButtonTokens(options: {
    variant: 'primary' | 'secondary' | 'ghost' | 'danger';
    state: 'default' | 'hover' | 'pressed' | 'disabled';
    themeMode: ThemeMode;
    colors: ColorPalette;
  }) {
    const isDark = options.themeMode === 'dark' || options.themeMode === 'amoled';
    const activeColors = options.colors || (isDark ? DarkThemeColors : LightThemeColors);

    if (options.variant === 'primary') {
      if (options.state === 'disabled') {
        return {
          background: activeColors.border,
          text: activeColors.textMuted,
          border: 'transparent',
          shadow: 'none',
          glow: 'transparent',
        };
      }
      if (options.state === 'pressed') {
        return {
          background: activeColors.primaryPressed,
          text: activeColors.surface,
          border: 'transparent',
          shadow: 'none',
          glow: activeColors.primaryGlow,
        };
      }
      if (options.state === 'hover') {
        return {
          background: activeColors.primaryHover,
          text: activeColors.surface,
          border: 'transparent',
          shadow: 'none',
          glow: activeColors.primaryGlow,
        };
      }
      return {
        background: activeColors.primary,
        text: activeColors.surface,
        border: 'transparent',
        shadow: 'none',
        glow: activeColors.primaryGlow,
      };
    }

    return {
      background: activeColors.surface,
      text: activeColors.textPrimary,
      border: activeColors.border,
      shadow: 'none',
      glow: 'transparent',
    };
  }
}
