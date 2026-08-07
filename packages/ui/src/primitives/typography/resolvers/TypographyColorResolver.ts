import type { ColorPalette } from '@lumora/theme';
import type { TypographyColorToken, TypographyEmphasis } from '../Typography.types.js';

export class TypographyColorResolver {
  public static resolveColor(
    colorToken: TypographyColorToken,
    emphasis: TypographyEmphasis,
    colors: ColorPalette,
  ): string {
    if (emphasis === 'strong') return colors.textPrimary;
    if (emphasis === 'subtle') return colors.textSecondary;
    if (emphasis === 'disabled') return colors.textMuted;
    if (emphasis === 'accent') return colors.primary;

    switch (colorToken) {
      case 'textSecondary':
        return colors.textSecondary;
      case 'textMuted':
        return colors.textMuted;
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      case 'inverse':
        return colors.surface;
      case 'textPrimary':
      default:
        return colors.textPrimary;
    }
  }
}
