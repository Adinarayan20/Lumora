import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TextProps } from './Typography.types';
import { Typography } from './Typography';

export const Text = memo(
  forwardRef<RNText, TextProps>((props, ref) => {
    return <Typography ref={ref} {...props} />;
  }),
);

Text.displayName = 'Text';
