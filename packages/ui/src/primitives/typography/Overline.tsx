import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TypographyProps } from './Typography.types';
import { Typography } from './Typography';

export interface OverlineProps extends Omit<TypographyProps, 'role'> {}

export const Overline = memo(
  forwardRef<RNText, OverlineProps>((props, ref) => {
    return <Typography ref={ref} role="Overline" uppercase={true} {...props} />;
  }),
);

Overline.displayName = 'Overline';
