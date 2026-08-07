import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useViewport } from '@lumora/theme';

export interface ContainerProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = React.memo(({ children, style }) => {
  const viewport = useViewport();

  const computedStyle: ViewStyle = {
    width: '100%',
    maxWidth: viewport.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: viewport.pagePadding,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

Container.displayName = 'Container';
