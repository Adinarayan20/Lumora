import React, { memo } from 'react';
import { Select, type SelectOption } from '../../../primitives/select/Select';
import type { FieldControlAdapterProps } from '../DynamicForm.types';

export const EnumFieldAdapter: React.FC<FieldControlAdapterProps<unknown>> = memo(({
  value,
  onChange,
  label,
  helperText,
  errorText,
  disabled,
  schema,
  testID,
}) => {
  const selectedValue = typeof value === 'string' ? value : '';
  const rawOptions = schema.validation?.options || [];

  const options: readonly SelectOption[] = rawOptions.map((opt) => ({
    label: opt,
    value: opt,
  }));

  return (
    <Select
      value={selectedValue}
      onValueChange={(val) => onChange(val)}
      options={options}
      label={label}
      placeholder={`Select ${label}...`}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
      testID={testID}
    />
  );
});

EnumFieldAdapter.displayName = 'EnumFieldAdapter';
