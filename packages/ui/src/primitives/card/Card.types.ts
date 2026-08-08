import type React from 'react';

export type CardVariant = 'flat' | 'outlined' | 'elevated' | 'interactive';

export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg';

export interface CardProps {
  readonly variant?: CardVariant;
  readonly padding?: CardPadding;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly onPress?: () => void;
  readonly children: React.ReactNode;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
}
