import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface VStackProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly gap?: number;
  readonly align?: ViewStyle['alignItems'];
  readonly justify?: ViewStyle['justifyContent'];
}

export const VStack: React.FC<VStackProps> = React.memo(({
  children,
  style,
  gap = 0,
  align = 'stretch',
  justify = 'flex-start',
}) => {
  const computedStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: align,
    justifyContent: justify,
    gap,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

VStack.displayName = 'VStack';
