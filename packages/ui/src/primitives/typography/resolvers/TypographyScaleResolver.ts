import type { SemanticTypographyRole } from "@lumora/theme";
import { SemanticTypographyMap } from "@lumora/theme";

export class TypographyScaleResolver {
  public static resolveScale(
    role: SemanticTypographyRole,
    deviceType: "phone" | "tablet" | "desktop",
  ): { fontSize: number; lineHeight: number } {
    const config = SemanticTypographyMap[role] ?? SemanticTypographyMap.Body;

    let opticalScale = config.opticalScalePhone;
    if (deviceType === "desktop") {
      opticalScale = config.opticalScaleDesktop;
    } else if (deviceType === "tablet") {
      opticalScale = config.opticalScaleTablet;
    }

    return {
      fontSize: Math.round(config.fontSize * opticalScale),
      lineHeight: Math.round(config.lineHeight * opticalScale),
    };
  }
}
