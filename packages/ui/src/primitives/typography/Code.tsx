import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TypographyProps } from './Typography.types.js';
import { Typography } from './Typography.js';

export interface CodeProps extends Omit<TypographyProps, 'role'> {}

export const Code = memo(
  forwardRef<RNText, CodeProps>((props, ref) => {
    return <Typography ref={ref} role="Code" {...props} />;
  }),
);

Code.displayName = 'Code';
