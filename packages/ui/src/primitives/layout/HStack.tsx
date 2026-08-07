import React from 'react';
import { View, ViewStyle } from 'react-native';
import type { SpacingTokenKey } from '@lumora/theme';
import { SpacingScale } from '@lumora/theme';

export interface HStackProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly gap?: SpacingTokenKey;
  readonly align?: ViewStyle['alignItems'];
  readonly justify?: ViewStyle['justifyContent'];
}

export const HStack: React.FC<HStackProps> = React.memo(({
  children,
  style,
  gap,
  align = 'center',
  justify = 'flex-start',
}) => {
  const computedStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: align,
    justifyContent: justify,
    gap: gap ? SpacingScale[gap] : 0,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

HStack.displayName = 'HStack';
