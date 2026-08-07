import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface HStackProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly gap?: number;
  readonly align?: ViewStyle['alignItems'];
  readonly justify?: ViewStyle['justifyContent'];
}

export const HStack: React.FC<HStackProps> = React.memo(({
  children,
  style,
  gap = 0,
  align = 'center',
  justify = 'flex-start',
}) => {
  const computedStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: align,
    justifyContent: justify,
    gap,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

HStack.displayName = 'HStack';
