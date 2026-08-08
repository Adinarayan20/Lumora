import type { ViewStyle } from 'react-native';
import {
  RadiusScale,
  ButtonHeights,
  ButtonPaddingHorizontal,
  ButtonIconGaps,
  InteractiveTouchTargetMinimum,
} from '@lumora/theme';
import type { ColorPalette, ViewportSizeClass } from '@lumora/theme';
import type { SemanticIconColor, SemanticIconSize } from '../icon/Icon.types';
import type { TypographyColorToken } from '../typography/Typography.types';
import type { ButtonVariant, ButtonSize, ButtonShape } from './Button.types';

export interface ResolveButtonStylesOptions {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly shape?: ButtonShape;
  readonly themeColors: ColorPalette;
  readonly sizeClass: ViewportSizeClass;
  readonly isTouchMode: boolean;
  readonly disabled?: boolean;
}

export interface ResolvedButtonStyles {
  readonly containerStyle: ViewStyle;
  readonly textColorToken: TypographyColorToken;
  readonly iconColorToken: SemanticIconColor;
  readonly spinnerColor: string;
  readonly focusRingColor: string;
  readonly hoverBackgroundColor: string;
  readonly resolvedHeight: number;
  readonly resolvedPaddingHorizontal: number;
  readonly resolvedIconGap: number;
  readonly resolvedIconSize: SemanticIconSize;
  readonly resolvedRadius: number;
  readonly resolvedBorderWidth: number;
  readonly resolvedBorderColor: string;
  readonly resolvedBackgroundColor: string;
  readonly resolvedOpacity: number;
  readonly touchTargetDimension: number;
}

export function resolveButtonStyles({
  variant = 'primary',
  size,
  shape = 'rounded',
  themeColors,
  sizeClass,
  isTouchMode,
  disabled = false,
}: ResolveButtonStylesOptions): ResolvedButtonStyles {
  // 1. Resolve Contextual Responsive Size Class
  let resolvedSize: ButtonSize = size ?? 'md';
  if (!size) {
    if (sizeClass === 'Medium' || sizeClass === 'Expanded') {
      resolvedSize = 'lg';
    } else {
      resolvedSize = 'md';
    }
  }

  // Strictly guarded token mapping
  const resolvedHeight = ButtonHeights[resolvedSize];
  const resolvedPaddingHorizontal = ButtonPaddingHorizontal[resolvedSize];
  const resolvedIconGap = ButtonIconGaps[resolvedSize];

  if (__DEV__ && (!resolvedHeight || !resolvedPaddingHorizontal || !resolvedIconGap)) {
    throw new Error(
      `[Lumora Button Token Error]: Invalid or missing button size token for size '${resolvedSize}'.`,
    );
  }

  // 2. Resolve Interactive Touch Target Minimum
  const touchTargetDimension = isTouchMode ? InteractiveTouchTargetMinimum : 36;

  // 3. Resolve Icon Size Token
  const resolvedIconSize: SemanticIconSize =
    resolvedSize === 'sm' ? 'sm' : resolvedSize === 'lg' ? 'lg' : 'md';

  // 4. Resolve Shape Radius
  const resolvedRadius = shape === 'pill' ? RadiusScale.full : RadiusScale.md;

  // 5. Resolve Variant Colors
  let textColorToken: TypographyColorToken = 'inverse';
  let iconColorToken: SemanticIconColor = 'icon.inverse';
  let resolvedBackgroundColor = themeColors.primary;
  let resolvedBorderColor = 'transparent';
  let resolvedBorderWidth = 0;
  let spinnerColor = themeColors.surface;
  let hoverBackgroundColor = themeColors.primaryHover;
  const focusRingColor = themeColors.primary;

  switch (variant) {
    case 'secondary':
      resolvedBackgroundColor = themeColors.surfaceElevated;
      textColorToken = 'textPrimary';
      iconColorToken = 'icon.primary';
      spinnerColor = themeColors.textPrimary;
      hoverBackgroundColor = themeColors.surface;
      break;

    case 'outline':
      resolvedBackgroundColor = 'transparent';
      resolvedBorderColor = themeColors.border;
      resolvedBorderWidth = 1;
      textColorToken = 'textPrimary';
      iconColorToken = 'icon.primary';
      spinnerColor = themeColors.textPrimary;
      hoverBackgroundColor = themeColors.backgroundSecondary;
      break;

    case 'ghost':
      resolvedBackgroundColor = 'transparent';
      textColorToken = 'textPrimary';
      iconColorToken = 'icon.primary';
      spinnerColor = themeColors.textPrimary;
      hoverBackgroundColor = themeColors.backgroundSecondary;
      break;

    case 'destructive':
      resolvedBackgroundColor = themeColors.danger;
      textColorToken = 'inverse';
      iconColorToken = 'icon.inverse';
      spinnerColor = themeColors.surface;
      hoverBackgroundColor = themeColors.danger;
      break;

    case 'primary':
    default:
      resolvedBackgroundColor = themeColors.primary;
      textColorToken = 'inverse';
      iconColorToken = 'icon.inverse';
      spinnerColor = themeColors.surface;
      hoverBackgroundColor = themeColors.primaryHover;
      break;
  }

  // 6. Resolve Disabled Opacity
  const resolvedOpacity = disabled ? themeColors.disabledOpacity : 1.0;

  const containerStyle: ViewStyle = {
    height: resolvedHeight,
    minHeight: resolvedHeight,
    paddingHorizontal: resolvedPaddingHorizontal,
    borderRadius: resolvedRadius,
    backgroundColor: resolvedBackgroundColor,
    borderWidth: resolvedBorderWidth,
    borderColor: resolvedBorderColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: resolvedOpacity,
  };

  return {
    containerStyle,
    textColorToken,
    iconColorToken,
    spinnerColor,
    focusRingColor,
    hoverBackgroundColor,
    resolvedHeight,
    resolvedPaddingHorizontal,
    resolvedIconGap,
    resolvedIconSize,
    resolvedRadius,
    resolvedBorderWidth,
    resolvedBorderColor,
    resolvedBackgroundColor,
    resolvedOpacity,
    touchTargetDimension,
  };
}
