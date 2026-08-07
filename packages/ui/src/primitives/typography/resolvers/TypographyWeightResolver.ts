import type { SemanticTypographyRole } from '@lumora/theme';
import { SemanticTypographyMap } from '@lumora/theme';
import type { TypographyEmphasis } from '../Typography.types.js';

export class TypographyWeightResolver {
  public static resolveWeight(
    role: SemanticTypographyRole,
    emphasis: TypographyEmphasis,
  ): '400' | '500' | '600' | '700' {
    if (emphasis === 'strong') return '700';
    const config = SemanticTypographyMap[role] ?? SemanticTypographyMap.Body;
    return config.fontWeight;
  }
}
