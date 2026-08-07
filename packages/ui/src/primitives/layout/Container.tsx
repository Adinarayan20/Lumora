import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useViewport } from '@lumora/theme';

export type ContainerMaxTarget = 'content' | 'reading' | 'wide' | 'full';

export interface ContainerProps {
  readonly children?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly max?: ContainerMaxTarget;
}

export const Container: React.FC<ContainerProps> = React.memo(({
  children,
  style,
  max = 'content',
}) => {
  const viewport = useViewport();

  let targetMaxWidth: number | string = viewport.maxContentWidth;

  if (max === 'reading') {
    targetMaxWidth = 680;
  } else if (max === 'wide') {
    targetMaxWidth = 1200;
  } else if (max === 'full') {
    targetMaxWidth = '100%';
  }

  const computedStyle: ViewStyle = {
    width: '100%',
    maxWidth: targetMaxWidth as any,
    alignSelf: 'center',
    paddingHorizontal: viewport.pagePadding,
  };

  return <View style={[computedStyle, style]}>{children}</View>;
});

Container.displayName = 'Container';
