import type { TextStyle } from 'react-native';
import type { SemanticTypographyRole, ColorPalette } from '@lumora/theme';
import type { TypographyColorToken, TypographyAlign, TypographyEmphasis } from '../Typography.types.js';
import { TypographyColorResolver } from './TypographyColorResolver.js';
import { TypographyScaleResolver } from './TypographyScaleResolver.js';
import { TypographyTrackingResolver } from './TypographyTrackingResolver.js';
import { TypographyWeightResolver } from './TypographyWeightResolver.js';

export class TypographyStyleComposer {
  public static composeStyle(options: {
    role: SemanticTypographyRole;
    colorToken: TypographyColorToken;
    emphasis: TypographyEmphasis;
    colors: ColorPalette;
    deviceType: 'phone' | 'tablet' | 'desktop';
    align?: TypographyAlign;
    italic?: boolean;
    uppercase?: boolean;
    writingDirection?: 'auto' | 'ltr' | 'rtl';
  }): TextStyle {
    const { fontSize, lineHeight } = TypographyScaleResolver.resolveScale(options.role, options.deviceType);
    const color = TypographyColorResolver.resolveColor(options.colorToken, options.emphasis, options.colors);
    const letterSpacing = TypographyTrackingResolver.resolveTracking(options.role, options.uppercase);
    const fontWeight = TypographyWeightResolver.resolveWeight(options.role, options.emphasis);

    return {
      fontSize,
      fontWeight,
      lineHeight,
      color,
      textAlign: options.align ?? 'auto',
      fontStyle: options.italic ? 'italic' : 'normal',
      textTransform: options.uppercase ? 'uppercase' : 'none',
      letterSpacing,
      writingDirection: options.writingDirection ?? 'auto',
    };
  }
}
