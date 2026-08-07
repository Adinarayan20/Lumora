import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TypographyProps } from './Typography.types.js';
import { Typography } from './Typography.js';

export interface LabelProps extends Omit<TypographyProps, 'role'> {
  readonly size?: 'large' | 'normal';
}

export const Label = memo(
  forwardRef<RNText, LabelProps>((props, ref) => {
    const { size = 'normal', ...rest } = props;
    const roleKey = size === 'large' ? 'Label Large' : 'Label';

    return <Typography ref={ref} role={roleKey} {...rest} />;
  }),
);

Label.displayName = 'Label';
