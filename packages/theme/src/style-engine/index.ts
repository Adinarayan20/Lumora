import type { ColorPalette, ThemeMode } from '../generated/tokens.js';
import {
  LightThemeColors,
  DarkThemeColors,
  SpacingScale,
  RadiusScale,
  TypographyTokens,
} from '../generated/tokens.js';

export class StyleEngine {
  public static resolveColor(colorKey: keyof ColorPalette, mode: ThemeMode = 'light'): string {
    const palette = mode === 'dark' ? DarkThemeColors : LightThemeColors;
    return palette[colorKey] ?? palette.textPrimary;
  }

  public static resolveSpacing(scaleKey: keyof typeof SpacingScale): number {
    return SpacingScale[scaleKey] ?? 0;
  }

  public static resolveRadius(radiusKey: keyof typeof RadiusScale): number {
    return RadiusScale[radiusKey] ?? 0;
  }

  public static resolveFontSize(sizeKey: keyof typeof TypographyTokens.fontSizes): number {
    return TypographyTokens.fontSizes[sizeKey] ?? 16;
  }

  public static resolveFontWeight(
    weightKey: keyof typeof TypographyTokens.fontWeights,
  ): '400' | '500' | '600' | '700' {
    return (TypographyTokens.fontWeights[weightKey] as any) ?? '400';
  }
}
