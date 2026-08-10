import type { SemanticTypographyRole } from "@lumora/theme";
import { SemanticTypographyMap, TypographyWeightsData } from "@lumora/theme";
import type { TypographyEmphasis } from "../Typography.types";

export class TypographyWeightResolver {
  public static resolveWeight(
    role: SemanticTypographyRole,
    emphasis: TypographyEmphasis,
  ): "400" | "500" | "600" | "700" {
    const emphasisTargetWeight = TypographyWeightsData.emphasis[emphasis];
    if (emphasisTargetWeight && emphasisTargetWeight !== "default") {
      return emphasisTargetWeight as "400" | "500" | "600" | "700";
    }

    const config = SemanticTypographyMap[role] ?? SemanticTypographyMap.Body;
    return config.fontWeight;
  }
}
