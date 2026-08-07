import React from 'react';
import { View, ViewStyle } from 'react-native';
import type { SpacingTokenKey } from '@lumora/theme';
import { SpacingScale } from '@lumora/theme';

export interface VStackProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly gap?: SpacingTokenKey;
  readonly align?: ViewStyle['alignItems'];
  readonly justify?: ViewStyle['justifyContent'];
}

export const VStack: React.FC<VStackProps> = React.memo(({
  children,
  style,
  gap,
  align = 'stretch',
  justify = 'flex-start',
}) => {
  const computedStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: align,
    justify: justify,
    gap: gap ? SpacingScale[gap] : 0,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

VStack.displayName = 'VStack';
