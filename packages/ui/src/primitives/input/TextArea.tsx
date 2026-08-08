import React, { memo } from 'react';
import { Input } from './Input';
import type { TextAreaProps } from './Input.types';

export const TextArea: React.FC<TextAreaProps> = memo(({
  numberOfLines = 4,
  ...props
}) => {
  return (
    <Input
      {...props}
      multiline={true}
      numberOfLines={numberOfLines}
    />
  );
});

TextArea.displayName = 'TextArea';
