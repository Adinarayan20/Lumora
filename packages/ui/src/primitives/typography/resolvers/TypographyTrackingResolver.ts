import type { SemanticTypographyRole } from "@lumora/theme";
import { SemanticTypographyMap } from "@lumora/theme";

export class TypographyTrackingResolver {
  public static resolveTracking(
    role: SemanticTypographyRole,
    uppercase?: boolean,
  ): number {
    const config = SemanticTypographyMap[role] ?? SemanticTypographyMap.Body;
    if (uppercase || role === "Overline") return 1.28;
    return config.tracking;
  }
}
