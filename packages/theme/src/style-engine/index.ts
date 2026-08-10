import type { ColorPalette, ThemeMode } from "../generated/tokens";
import {
  SpacingScale,
  RadiusScale,
  SemanticTypographyMap,
  SemanticTypographyRole,
  LightThemeColors,
  DarkThemeColors,
} from "../generated/tokens";

export class StyleEngine {
  public static resolveColor(
    colorToken: keyof ColorPalette,
    themeMode: ThemeMode,
  ): string {
    const palette =
      themeMode === "dark" || themeMode === "amoled"
        ? DarkThemeColors
        : LightThemeColors;
    return palette[colorToken] ?? palette.textPrimary;
  }

  public static resolveSpacing(step: number): number {
    const keys = Object.keys(SpacingScale) as Array<keyof typeof SpacingScale>;
    const index = Math.min(Math.max(step, 0), keys.length - 1);
    return SpacingScale[keys[index]];
  }

  public static resolveRadius(key: keyof typeof RadiusScale): number {
    return RadiusScale[key] ?? RadiusScale.md;
  }

  public static resolveFontSize(role: SemanticTypographyRole): number {
    return SemanticTypographyMap[role]?.fontSize ?? 16;
  }

  public static resolveFontWeight(
    role: SemanticTypographyRole,
  ): "400" | "500" | "600" | "700" {
    return SemanticTypographyMap[role]?.fontWeight ?? "400";
  }
}
