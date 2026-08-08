import type { ColorPalette, ThemeMode, WindowSizeClass } from '@lumora/theme';
import { IconSizes, IconStrokeWeights, IconTouchTargets } from '@lumora/theme';
import type { SemanticIconColor, SemanticIconSize, IconStrokeWeight } from './Icon.types';

export interface IconStyleConfig {
  readonly resolvedSize: number;
  readonly resolvedStrokeWidth: number;
  readonly resolvedColor: string;
  readonly resolvedOpacity: number;
  readonly touchTargetDimension: number;
}

export function resolveIconStyles(params: {
  readonly size?: SemanticIconSize;
  readonly color?: SemanticIconColor;
  readonly strokeWeight?: IconStrokeWeight;
  readonly themeColors: ColorPalette;
  readonly themeMode: ThemeMode;
  readonly sizeClass: WindowSizeClass;
  readonly isTouchMode: boolean;
  readonly isSelected?: boolean;
}): IconStyleConfig {
  const {
    size,
    color = 'icon.primary',
    strokeWeight = 'auto',
    themeColors,
    themeMode,
    sizeClass,
    isTouchMode,
    isSelected,
  } = params;

  // 1. Resolve Contextual Default Size if prop omitted
  let resolvedSizeToken: SemanticIconSize = size ?? 'md';
  if (!size) {
    if (sizeClass === 'Medium') {
      resolvedSizeToken = 'lg';
    } else {
      resolvedSizeToken = 'md';
    }
  }

  const resolvedSize = IconSizes[resolvedSizeToken] ?? IconSizes.md;

  // 2. Resolve Stroke Weight (No raw numeric props exposed!)
  let resolvedStrokeWidth = IconStrokeWeights.regular;
  if (strokeWeight === 'thin') {
    resolvedStrokeWidth = IconStrokeWeights.thin;
  } else if (strokeWeight === 'strong' || themeMode === 'highContrast') {
    resolvedStrokeWidth = IconStrokeWeights.strong;
  } else if (strokeWeight === 'regular') {
    resolvedStrokeWidth = IconStrokeWeights.regular;
  } else {
    // 'auto' mode
    if (resolvedSizeToken === 'lg' || resolvedSizeToken === 'xl' || resolvedSizeToken === 'display') {
      resolvedStrokeWidth = IconStrokeWeights.strong;
    } else {
      resolvedStrokeWidth = IconStrokeWeights.regular;
    }
  }

  // 3. Resolve Color & Opacity via Theme Tokens
  let resolvedColor = themeColors.textPrimary;
  let resolvedOpacity = 1.0;

  if (color === 'icon.disabled') {
    resolvedColor = themeColors.textMuted;
    resolvedOpacity = themeColors.disabledOpacity;
  } else if (color === 'icon.secondary') {
    resolvedColor = themeColors.textSecondary;
  } else if (color === 'icon.muted') {
    resolvedColor = themeColors.textMuted;
  } else if (color === 'icon.brand') {
    resolvedColor = themeColors.primary;
  } else if (color === 'icon.accent') {
    resolvedColor = themeColors.accent;
  } else if (color === 'icon.inverse') {
    resolvedColor = themeColors.surface;
  } else if (color === 'icon.success') {
    resolvedColor = themeColors.success;
  } else if (color === 'icon.warning') {
    resolvedColor = themeColors.warning;
  } else if (color === 'icon.danger') {
    resolvedColor = themeColors.danger;
  } else {
    // 'icon.primary'
    resolvedColor = isSelected ? themeColors.primary : themeColors.textPrimary;
  }

  // 4. Resolve Touch Target Dimensions
  let touchTargetDimension = IconTouchTargets.minimum;
  if (!isTouchMode) {
    touchTargetDimension = IconTouchTargets.pointer;
  } else if (sizeClass === 'Medium' || sizeClass === 'Expanded') {
    touchTargetDimension = IconTouchTargets.comfortable;
  }

  return {
    resolvedSize,
    resolvedStrokeWidth,
    resolvedColor,
    resolvedOpacity,
    touchTargetDimension,
  };
}
