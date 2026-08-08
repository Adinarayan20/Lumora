import type { ViewStyle } from 'react-native';
import {
  RadiusScale,
  ButtonHeights,
  ButtonPaddingHorizontal,
  ButtonIconGaps,
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
  readonly loading?: boolean;
}

export interface ResolvedButtonStyles {
  readonly containerStyle: ViewStyle;
  readonly textColorToken: TypographyColorToken;
  readonly iconColorToken: SemanticIconColor;
  readonly spinnerColor: string;
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

  // 2. Resolve Height & Touch Target
  const resolvedHeight = ButtonHeights[resolvedSize] || 44;
  const resolvedPaddingHorizontal = ButtonPaddingHorizontal[resolvedSize] || 16;
  const resolvedIconGap = ButtonIconGaps[resolvedSize] || 8;

  const touchTargetDimension = isTouchMode
    ? sizeClass === 'Compact'
      ? 44
      : 48
    : 36;

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

  switch (variant) {
    case 'secondary':
      resolvedBackgroundColor = themeColors.surfaceElevated;
      textColorToken = 'textPrimary';
      iconColorToken = 'icon.primary';
      spinnerColor = themeColors.textPrimary;
      break;

    case 'outline':
      resolvedBackgroundColor = 'transparent';
      resolvedBorderColor = themeColors.border;
      resolvedBorderWidth = 1;
      textColorToken = 'textPrimary';
      iconColorToken = 'icon.primary';
      spinnerColor = themeColors.textPrimary;
      break;

    case 'ghost':
      resolvedBackgroundColor = 'transparent';
      textColorToken = 'textPrimary';
      iconColorToken = 'icon.primary';
      spinnerColor = themeColors.textPrimary;
      break;

    case 'destructive':
      resolvedBackgroundColor = themeColors.danger;
      textColorToken = 'inverse';
      iconColorToken = 'icon.inverse';
      spinnerColor = themeColors.surface;
      break;

    case 'primary':
    default:
      resolvedBackgroundColor = themeColors.primary;
      textColorToken = 'inverse';
      iconColorToken = 'icon.inverse';
      spinnerColor = themeColors.surface;
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
