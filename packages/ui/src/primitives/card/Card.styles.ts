import {
  type ColorPalette,
  CardElevations,
  RadiusScale,
  SpacingScale,
} from "@lumora/theme";
import type { CardVariant, CardPadding } from "./Card.types";

export interface ResolveCardStylesParams {
  readonly variant: CardVariant;
  readonly padding: CardPadding;
  readonly selected: boolean;
  readonly disabled: boolean;
  readonly colors: ColorPalette;
}

export function resolveCardStyles({
  variant,
  padding,
  selected,
  disabled,
  colors,
}: ResolveCardStylesParams) {
  const elevation = CardElevations[variant] || CardElevations.outlined;

  let paddingPx = 0;
  switch (padding) {
    case "xs":
      paddingPx = SpacingScale.xs;
      break;
    case "sm":
      paddingPx = SpacingScale.sm;
      break;
    case "md":
      paddingPx = SpacingScale.md;
      break;
    case "lg":
      paddingPx = SpacingScale.lg;
      break;
    case "none":
    default:
      paddingPx = 0;
      break;
  }

  const backgroundColor = selected
    ? colors.primaryGlow
    : variant === "flat"
      ? colors.backgroundSecondary
      : colors.surface;

  const borderColor = selected ? colors.primary : colors.border;

  const opacity = disabled ? colors.disabledOpacity : 1.0;

  return {
    cardStyle: {
      backgroundColor,
      borderColor,
      borderWidth: elevation.borderWidth,
      borderRadius: RadiusScale.card,
      padding: paddingPx,
      shadowColor: colors.textPrimary,
      shadowOffset: elevation.shadowOffset,
      shadowOpacity: elevation.shadowOpacity,
      shadowRadius: elevation.shadowRadius,
      elevation: elevation.elevation,
      opacity,
      overflow: "hidden" as const,
    },
  };
}
