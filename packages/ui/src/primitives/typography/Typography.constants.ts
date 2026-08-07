import type { SemanticTypographyRole } from '@lumora/theme';

export const DEFAULT_TYPOGRAPHY_ROLE: SemanticTypographyRole = 'Body';

export const HEADING_LEVEL_ROLE_MAP: Record<1 | 2 | 3 | 4, SemanticTypographyRole> = {
  1: 'Display XL',
  2: 'Headline',
  3: 'Title Large',
  4: 'Section Header',
};
