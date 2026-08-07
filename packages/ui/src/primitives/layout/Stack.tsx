import React from 'react';
import { View, ViewStyle } from 'react-native';
import type { SpacingTokenKey, SemanticRadiusKey } from '@lumora/theme';
import { useTheme, SpacingScale, SemanticRadiusMap } from '@lumora/theme';

export interface StackProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly padding?: SpacingTokenKey;
  readonly gap?: SpacingTokenKey;
  readonly radius?: SemanticRadiusKey;
  readonly background?: string;
}

export const Stack: React.FC<StackProps> = React.memo(({
  children,
  style,
  padding,
  gap,
  radius,
  background,
}) => {
  const { colors } = useTheme();

  const computedStyle: ViewStyle = {
    padding: padding ? SpacingScale[padding] : 0,
    gap: gap ? SpacingScale[gap] : 0,
    borderRadius: radius ? SemanticRadiusMap[radius] : 0,
    backgroundColor: background ?? colors.background,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

Stack.displayName = 'Stack';
