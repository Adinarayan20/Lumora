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
    };
    readonly danger: {
      readonly background: string;
      readonly text: string;
    };
  };
  readonly card: {
    readonly default: {
      readonly surface: string;
      readonly border: string;
      readonly shadow: string;
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
          text: '#FFFFFF',
          hover: palette.primaryHover,
          pressed: 'hsl(226, 70%, 45%)',
          glow: 'rgba(91, 127, 255, 0.18)',
        },
        danger: {
          background: palette.danger,
          text: '#FFFFFF',
        },
      },
      card: {
        default: {
          surface: palette.surface,
          border: palette.border,
          shadow: mode === 'dark' ? '0 18px 50px rgba(0,0,0,0.45)' : '0 12px 40px rgba(17,24,39,0.08)',
        },
        elevated: {
          surface: palette.surfaceElevated,
          border: palette.border,
        },
      },
      timeline: {
        hero: {
          border: 'hsl(226, 70%, 55%)',
          background: mode === 'dark' ? '#1D2430' : '#FCFCFD',
        },
      },
      home: {
        focus: {
          glow: 'rgba(91, 127, 255, 0.18)',
        },
      },
    };
  }
}
