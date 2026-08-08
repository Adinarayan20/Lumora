import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TypographyProps } from './Typography.types';
import { Typography } from './Typography';

export interface CaptionProps extends Omit<TypographyProps, 'role'> {}

export const Caption = memo(
  forwardRef<RNText, CaptionProps>((props, ref) => {
    return <Typography ref={ref} role="Caption" {...props} />;
  }),
);

Caption.displayName = 'Caption';
