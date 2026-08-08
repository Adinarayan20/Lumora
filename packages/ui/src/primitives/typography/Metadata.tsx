import React, { forwardRef, memo } from 'react';
import { Text as RNText } from 'react-native';
import type { TypographyProps } from './Typography.types';
import { Typography } from './Typography';

export interface MetadataProps extends Omit<TypographyProps, 'role'> {}

export const Metadata = memo(
  forwardRef<RNText, MetadataProps>((props, ref) => {
    return <Typography ref={ref} role="Metadata" color="textMuted" {...props} />;
  }),
);

Metadata.displayName = 'Metadata';
