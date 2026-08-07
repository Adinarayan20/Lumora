import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@lumora/theme';

export interface StackProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly padding?: number;
  readonly gap?: number;
  readonly background?: string;
}

export const Stack: React.FC<StackProps> = React.memo(({
  children,
  style,
  padding,
  gap,
  background,
}) => {
  const { colors } = useTheme();

  const computedStyle: ViewStyle = {
    padding: padding ?? 0,
    gap: gap ?? 0,
    backgroundColor: background ?? colors.background,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

Stack.displayName = 'Stack';
