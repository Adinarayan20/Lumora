import { type ColorPalette, BadgeDimensions, RadiusScale } from "@lumora/theme";
import type { BadgeVariant, BadgeSize } from "./Badge.types";

export interface ResolveBadgeStylesParams {
  readonly variant: BadgeVariant;
  readonly size: BadgeSize;
  readonly colors: ColorPalette;
}

export function resolveBadgeStyles({
  variant,
  size,
  colors,
}: ResolveBadgeStylesParams) {
  const dims = BadgeDimensions[size] || BadgeDimensions.md;

  let backgroundColor: string = colors.backgroundSecondary;
  let textColor: string = colors.textPrimary;
  let borderColor: string = colors.border;

  switch (variant) {
    case "primary":
      backgroundColor = colors.primaryGlow;
      textColor = colors.primary;
      borderColor = colors.primary;
      break;
    case "success":
      backgroundColor = colors.successGlow;
      textColor = colors.success;
      borderColor = colors.success;
      break;
    case "warning":
      backgroundColor = colors.warningGlow;
      textColor = colors.warning;
      borderColor = colors.warning;
      break;
    case "danger":
      backgroundColor = colors.dangerGlow;
      textColor = colors.danger;
      borderColor = colors.danger;
      break;
    case "info":
      backgroundColor = colors.infoGlow;
      textColor = colors.info;
      borderColor = colors.info;
      break;
    case "neutral":
    default:
      backgroundColor = colors.backgroundSecondary;
      textColor = colors.textSecondary;
      borderColor = colors.border;
      break;
  }

  return {
    badgeContainerStyle: {
      height: dims.height,
      paddingHorizontal: dims.paddingHorizontal,
      borderRadius: RadiusScale.pill,
      backgroundColor,
      borderWidth: 1,
      borderColor,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      alignSelf: "flex-start" as const,
    },
    textStyle: {
      fontSize: dims.fontSize,
      color: textColor,
      fontWeight: "600" as const,
    },
    iconSize: dims.iconSize,
    iconGap: 4,
  };
}
