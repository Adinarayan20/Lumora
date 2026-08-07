import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TextProps } from './Typography.types.js';
import { Typography } from './Typography.js';

export const Text = memo(
  forwardRef<RNText, TextProps>((props, ref) => {
    return <Typography ref={ref} {...props} />;
  }),
);

Text.displayName = 'Text';
