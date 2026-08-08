import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TypographyProps } from './Typography.types';
import { Typography } from './Typography';

export interface ButtonTextProps extends Omit<TypographyProps, 'role'> {}

export const ButtonText = memo(
  forwardRef<RNText, ButtonTextProps>((props, ref) => {
    return <Typography ref={ref} role="Button" {...props} />;
  }),
);

ButtonText.displayName = 'ButtonText';
