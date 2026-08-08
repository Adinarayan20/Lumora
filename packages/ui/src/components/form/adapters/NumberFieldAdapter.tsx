import React, { memo } from 'react';
import { Input } from '../../../primitives/input/Input';
import type { FieldControlAdapterProps } from '../DynamicForm.types';

export const NumberFieldAdapter: React.FC<FieldControlAdapterProps<unknown>> = memo(({
  value,
  onChange,
  label,
  helperText,
  errorText,
  disabled,
  testID,
}) => {
  const displayValue = typeof value === 'number' && !isNaN(value) ? String(value) : '';

  const handleChangeText = (text: string) => {
    if (text.trim() === '') {
      onChange(undefined);
      return;
    }

    const parsed = Number(text);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <Input
      value={displayValue}
      onChangeText={handleChangeText}
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
      testID={testID}
    />
  );
});

NumberFieldAdapter.displayName = 'NumberFieldAdapter';
