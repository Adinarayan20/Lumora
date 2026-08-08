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
import type { InputVariant, InputSize } from '../input/Input.types';

export interface ResolveSelectStylesOptions {
  readonly variant?: InputVariant;
  readonly size?: InputSize;
  readonly themeColors: ColorPalette;
  readonly sizeClass: ViewportSizeClass;
  readonly disabled?: boolean;
  readonly error?: boolean;
  readonly isOpen?: boolean;
}

export interface ResolvedSelectStyles {
  readonly triggerStyle: ViewStyle;
  readonly textStyle: TextStyle;
  readonly resolvedHeight: number;
  readonly resolvedPaddingHorizontal: number;
  readonly resolvedIconGap: number;
  readonly resolvedFontSize: number;
  readonly touchTargetDimension: number;
}

export function resolveSelectStyles({
  variant = 'default',
  size,
  themeColors,
  sizeClass,
  disabled = false,
  error = false,
  isOpen = false,
}: ResolveSelectStylesOptions): ResolvedSelectStyles {
  let resolvedSize: InputSize = size ?? 'md';
  if (!size) {
    if (sizeClass === 'Medium' || sizeClass === 'Expanded') {
      resolvedSize = 'lg';
    } else {
      resolvedSize = 'md';
    }
  }

  const resolvedHeight = InputHeights[resolvedSize];
  const resolvedPaddingHorizontal = InputPaddingHorizontal[resolvedSize];
  const resolvedIconGap = InputIconGaps[resolvedSize];
  const resolvedFontSize = InputFontSizes[resolvedSize];
  const touchTargetDimension = Math.max(resolvedHeight, InputInteractiveTargetMinimum);

  let resolvedBackgroundColor = themeColors.surface;
  let resolvedBorderColor = themeColors.border;

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

  if (isOpen) {
    resolvedBorderColor = themeColors.primary;
  }

  if (error) {
    resolvedBorderColor = themeColors.danger;
  }

  const resolvedOpacity = disabled ? themeColors.disabledOpacity : 1.0;

  const triggerStyle: ViewStyle = {
    height: resolvedHeight,
    minHeight: resolvedHeight,
    paddingHorizontal: resolvedPaddingHorizontal,
    borderRadius: RadiusScale.md,
    backgroundColor: resolvedBackgroundColor,
    borderWidth: 1,
    borderColor: resolvedBorderColor,
    opacity: resolvedOpacity,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const textStyle: TextStyle = {
    flex: 1,
    fontSize: resolvedFontSize,
    includeFontPadding: false,
  };

  return {
    triggerStyle,
    textStyle,
    resolvedHeight,
    resolvedPaddingHorizontal,
    resolvedIconGap,
    resolvedFontSize,
    touchTargetDimension,
  };
}
