import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { HeadingProps } from './Typography.types.js';
import { Typography } from './Typography.js';
import { HEADING_LEVEL_ROLE_MAP } from './Typography.constants.js';

export const Heading = memo(
  forwardRef<RNText, HeadingProps>((props, ref) => {
    const { level = 2, ...rest } = props;
    const role = HEADING_LEVEL_ROLE_MAP[level];

    return <Typography ref={ref} role={role} {...rest} />;
  }),
);

Heading.displayName = 'Heading';
