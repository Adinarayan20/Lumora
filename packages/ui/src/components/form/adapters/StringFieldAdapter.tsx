import React, { memo } from 'react';
import { Input } from '../../../primitives/input/Input';
import { TextArea } from '../../../primitives/input/TextArea';
import type { FieldControlAdapterProps } from '../DynamicForm.types';

export const StringFieldAdapter: React.FC<FieldControlAdapterProps<unknown>> = memo(({
  value,
  onChange,
  label,
  helperText,
  errorText,
  disabled,
  schema,
  testID,
}) => {
  const stringValue = typeof value === 'string' ? value : '';
  const isMultiline = schema.display?.format === 'raw' && schema.validation?.maxLength && schema.validation.maxLength > 200;

  if (isMultiline) {
    return (
      <TextArea
        value={stringValue}
        onChangeText={(val) => onChange(val)}
        label={label}
        helperText={helperText}
        errorText={errorText}
        disabled={disabled}
        testID={testID}
      />
    );
  }

  return (
    <Input
      value={stringValue}
      onChangeText={(val) => onChange(val)}
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
      testID={testID}
    />
  );
});

StringFieldAdapter.displayName = 'StringFieldAdapter';
