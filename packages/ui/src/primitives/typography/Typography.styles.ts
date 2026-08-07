import type { TextStyle } from 'react-native';
import type { SemanticTypographyRole, ColorPalette } from '@lumora/theme';
import { SemanticTypographyMap } from '@lumora/theme';
import type { TypographyColorToken, TypographyAlign } from './Typography.types.js';

export class TypographyStyles {
  public static resolveStyle(options: {
    role: SemanticTypographyRole;
    colorToken: TypographyColorToken;
    colors: ColorPalette;
    align?: TypographyAlign;
    italic?: boolean;
    uppercase?: boolean;
    viewportScaleModifier?: number;
  }): TextStyle {
    const config = SemanticTypographyMap[options.role] ?? SemanticTypographyMap.Body;
    const scale = options.viewportScaleModifier ?? 1.0;

    let textColor = options.colors.textPrimary;
    if (options.colorToken === 'textSecondary') textColor = options.colors.textSecondary;
    else if (options.colorToken === 'textMuted') textColor = options.colors.textMuted;
    else if (options.colorToken === 'primary') textColor = options.colors.primary;
    else if (options.colorToken === 'success') textColor = options.colors.success;
    else if (options.colorToken === 'warning') textColor = options.colors.warning;
    else if (options.colorToken === 'danger') textColor = options.colors.danger;
    else if (options.colorToken === 'inverse') textColor = options.colors.surface;

    let letterSpacing = 0;
    if (options.role === 'Display XL' || options.role === 'Display L' || options.role === 'Hero') {
      letterSpacing = -0.32;
    } else if (options.role === 'Overline' || options.uppercase) {
      letterSpacing = 1.28;
    } else if (options.role === 'Button' || options.role === 'Navigation') {
      letterSpacing = 0.16;
    }

    return {
      fontSize: Math.round(config.fontSize * scale),
      fontWeight: config.fontWeight,
      lineHeight: Math.round(config.lineHeight * scale),
      color: textColor,
      textAlign: options.align ?? 'auto',
      fontStyle: options.italic ? 'italic' : 'normal',
      textTransform: options.uppercase ? 'uppercase' : 'none',
      letterSpacing,
    };
  }
}
