import React, { memo, useState, useEffect } from 'react';
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
  const initialText = typeof value === 'number' && !isNaN(value) ? String(value) : '';
  const [rawText, setRawText] = useState<string>(initialText);

  useEffect(() => {
    const currentNum = typeof value === 'number' && !isNaN(value) ? String(value) : '';
    if (value === undefined || value === null) {
      setRawText('');
    } else if (currentNum !== rawText && Number(rawText) !== value) {
      setRawText(currentNum);
    }
  }, [value]);

  const handleChangeText = (text: string) => {
    setRawText(text);

    if (text.trim() === '') {
      onChange(undefined);
      return;
    }

    const parsed = Number(text);
    if (!isNaN(parsed) && text.trim() !== '-' && text.trim() !== '.' && !text.endsWith('.')) {
      onChange(parsed);
    }
  };

  return (
    <Input
      value={rawText}
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
