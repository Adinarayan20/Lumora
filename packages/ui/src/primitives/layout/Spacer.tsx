import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface SpacerProps {
  readonly flex?: number;
  readonly size?: number;
}

export const Spacer: React.FC<SpacerProps> = React.memo(({ flex = 1, size }) => {
  const style: ViewStyle = size
    ? { width: size, height: size }
    : { flex };

  return <View style={style} />;
});

Spacer.displayName = 'Spacer';
