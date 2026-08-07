import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TypographyProps } from './Typography.types.js';
import { Typography } from './Typography.js';

export interface BodyProps extends Omit<TypographyProps, 'role'> {
  readonly size?: 'large' | 'normal' | 'small';
}

export const Body = memo(
  forwardRef<RNText, BodyProps>((props, ref) => {
    const { size = 'normal', ...rest } = props;
    let roleKey = 'Body' as const;
    if (size === 'large') roleKey = 'Body Large' as const;
    else if (size === 'small') roleKey = 'Body Small' as const;

    return <Typography ref={ref} role={roleKey} {...rest} />;
  }),
);

Body.displayName = 'Body';
