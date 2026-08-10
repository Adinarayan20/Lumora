import type { ColorPalette } from "@lumora/theme";
import { TypographyColorsData } from "@lumora/theme";
import type {
  TypographyColorToken,
  TypographyEmphasis,
} from "../Typography.types";

export class TypographyColorResolver {
  public static resolveColor(
    colorToken: TypographyColorToken,
    emphasis: TypographyEmphasis,
    colors: ColorPalette,
  ): string {
    const emphasisTargetKey = TypographyColorsData.emphasis[emphasis] as
      keyof ColorPalette | undefined;
    if (emphasisTargetKey && emphasis !== "default") {
      return colors[emphasisTargetKey] ?? colors.textPrimary;
    }

    const tokenTargetKey = TypographyColorsData.colors[colorToken] as
      keyof ColorPalette | undefined;
    return colors[tokenTargetKey ?? "textPrimary"] ?? colors.textPrimary;
  }
}
