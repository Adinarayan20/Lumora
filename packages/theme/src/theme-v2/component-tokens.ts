import type { ColorPalette, ThemeMode } from '../generated/tokens.js';
import { LightThemeColors, DarkThemeColors } from '../generated/tokens.js';

export interface ComponentThemeTokens {
  readonly button: {
    readonly primary: {
      readonly background: string;
      readonly text: string;
      readonly hover: string;
      readonly pressed: string;
      readonly glow: string;
      readonly border: string;
      readonly disabledBg: string;
      readonly disabledText: string;
    };
    readonly danger: {
      readonly background: string;
      readonly text: string;
      readonly hover: string;
      readonly pressed: string;
    };
  };
  readonly card: {
    readonly default: {
      readonly surface: string;
      readonly border: string;
      readonly textPrimary: string;
      readonly textSecondary: string;
    };
    readonly elevated: {
      readonly surface: string;
      readonly border: string;
    };
  };
  readonly timeline: {
    readonly hero: {
      readonly border: string;
      readonly background: string;
    };
  };
  readonly home: {
    readonly focus: {
      readonly glow: string;
    };
  };
}

export class ComponentTokenResolver {
  public static resolve(mode: ThemeMode = 'light'): ComponentThemeTokens {
    const palette: ColorPalette = mode === 'dark' ? DarkThemeColors : LightThemeColors;

    return {
      button: {
        primary: {
          background: palette.primary,
          text: palette.surface,
          hover: palette.primaryHover,
          pressed: palette.primaryPressed,
          glow: palette.primaryGlow,
          border: palette.border,
          disabledBg: palette.backgroundSecondary,
          disabledText: palette.textMuted,
        },
        danger: {
          background: palette.danger,
          text: palette.surface,
          hover: palette.danger,
          pressed: palette.danger,
        },
      },
      card: {
        default: {
          surface: palette.surface,
          border: palette.border,
          textPrimary: palette.textPrimary,
          textSecondary: palette.textSecondary,
        },
        elevated: {
          surface: palette.surfaceElevated,
          border: palette.border,
        },
      },
      timeline: {
        hero: {
          border: palette.primary,
          background: palette.surfaceElevated,
        },
      },
      home: {
        focus: {
          glow: palette.primaryGlow,
        },
      },
    };
  }
}
