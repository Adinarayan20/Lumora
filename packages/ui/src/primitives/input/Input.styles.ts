import type { ViewStyle, TextStyle } from 'react-native';
import {
  RadiusScale,
  InputHeights,
  InputPaddingHorizontal,
  InputIconGaps,
  InputFontSizes,
  InputInteractiveTargetMinimum,
} from '@lumora/theme';
import type { ColorPalette, ViewportSizeClass } from '@lumora/theme';
import type { SemanticIconColor, SemanticIconSize } from '../icon/Icon.types';
import type { InputVariant, InputSize, InputShape } from './Input.types';

export interface ResolveInputStylesOptions {
  readonly variant?: InputVariant;
  readonly size?: InputSize;
  readonly shape?: InputShape;
  readonly themeColors: ColorPalette;
  readonly sizeClass: ViewportSizeClass;
  readonly disabled?: boolean;
  readonly error?: boolean;
}

export interface ResolvedInputStyles {
  readonly containerStyle: ViewStyle;
  readonly inputTextStyle: TextStyle;
  readonly iconColorToken: SemanticIconColor;
  readonly focusRingColor: string;
  readonly resolvedHeight: number;
  readonly resolvedPaddingHorizontal: number;
  readonly resolvedIconGap: number;
  readonly resolvedFontSize: number;
  readonly resolvedIconSize: SemanticIconSize;
  readonly resolvedRadius: number;
  readonly resolvedBorderWidth: number;
  readonly resolvedBorderColor: string;
  readonly resolvedBackgroundColor: string;
  readonly resolvedOpacity: number;
  readonly touchTargetDimension: number;
}

export function resolveInputStyles({
  variant = 'default',
  size,
  shape = 'rounded',
  themeColors,
  sizeClass,
  disabled = false,
  error = false,
}: ResolveInputStylesOptions): ResolvedInputStyles {
  // 1. Resolve Contextual Responsive Size Class
  let resolvedSize: InputSize = size ?? 'md';
  if (!size) {
    if (sizeClass === 'Medium' || sizeClass === 'Expanded') {
      resolvedSize = 'lg';
    } else {
      resolvedSize = 'md';
    }
  }

  // Strictly guarded token mapping
  const resolvedHeight = InputHeights[resolvedSize];
  const resolvedPaddingHorizontal = InputPaddingHorizontal[resolvedSize];
  const resolvedIconGap = InputIconGaps[resolvedSize];
  const resolvedFontSize = InputFontSizes[resolvedSize];

  if (
    __DEV__ &&
    (!resolvedHeight ||
      !resolvedPaddingHorizontal ||
      !resolvedIconGap ||
      !resolvedFontSize)
  ) {
    throw new Error(
      `[Lumora Input Token Error]: Invalid or missing input size token for size '${resolvedSize}'.`,
    );
  }

  // 2. Resolve Interactive Touch Target Minimum (48dp minimum unconditionally)
  const touchTargetDimension = Math.max(
    resolvedHeight,
    InputInteractiveTargetMinimum,
  );

  // 3. Resolve Icon Size Token
  const resolvedIconSize: SemanticIconSize =
    resolvedSize === 'sm' ? 'sm' : resolvedSize === 'lg' ? 'lg' : 'md';

  // 4. Resolve Radius
  const resolvedRadius = shape === 'pill' ? RadiusScale.full : RadiusScale.md;

  // 5. Resolve Variant Colors
  let resolvedBackgroundColor = themeColors.surface;
  let resolvedBorderColor = themeColors.border;
  let resolvedBorderWidth = 1;
  let iconColorToken: SemanticIconColor = 'icon.secondary';
  const focusRingColor = themeColors.primary;

  switch (variant) {
    case 'filled':
      resolvedBackgroundColor = themeColors.backgroundSecondary;
      resolvedBorderColor = 'transparent';
      break;

    case 'ghost':
      resolvedBackgroundColor = 'transparent';
      resolvedBorderColor = 'transparent';
      break;

    case 'default':
    default:
      resolvedBackgroundColor = themeColors.surface;
      resolvedBorderColor = themeColors.border;
      break;
  }

  // Error state overrides border color
  if (error) {
    resolvedBorderColor = themeColors.danger;
    iconColorToken = 'icon.primary';
  }

  const resolvedOpacity = disabled ? themeColors.disabledOpacity : 1.0;

  const containerStyle: ViewStyle = {
    height: resolvedHeight,
    minHeight: resolvedHeight,
    paddingHorizontal: resolvedPaddingHorizontal,
    borderRadius: resolvedRadius,
    backgroundColor: resolvedBackgroundColor,
    borderWidth: resolvedBorderWidth,
    borderColor: resolvedBorderColor,
    opacity: resolvedOpacity,
    flexDirection: 'row',
    alignItems: 'center',
  };

  const inputTextStyle: TextStyle = {
    flex: 1,
    color: disabled ? themeColors.textMuted : themeColors.textPrimary,
    fontSize: resolvedFontSize,
    includeFontPadding: false,
    textAlignVertical: 'center',
  };

  return {
    containerStyle,
    inputTextStyle,
    iconColorToken,
    focusRingColor,
    resolvedHeight,
    resolvedPaddingHorizontal,
    resolvedIconGap,
    resolvedFontSize,
    resolvedIconSize,
    resolvedRadius,
    resolvedBorderWidth,
    resolvedBorderColor,
    resolvedBackgroundColor,
    resolvedOpacity,
    touchTargetDimension,
  };
}
