import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FieldControl } from '../field/FieldControl';
import { Radio } from './Radio';
import type { RadioGroupProps } from './Selection.types';

export function RadioGroup<T = string>({
  value,
  onChange,
  options,
  label,
  helperText,
  errorText,
  disabled = false,
  direction = 'column',
  accessibilityLabel,
  testID,
}: RadioGroupProps<T>): React.ReactElement {
  const effectiveAccessibilityLabel = accessibilityLabel || label || 'Radio option group';

  return (
    <FieldControl
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
      testID={testID}
    >
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={effectiveAccessibilityLabel}
        accessibilityState={{ disabled }}
        testID={testID}
        style={[
          styles.groupWrapper,
          direction === 'row' ? styles.rowDirection : styles.columnDirection,
        ]}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const isOptionDisabled = disabled || Boolean(opt.disabled);

          return (
            <Radio
              key={String(opt.value)}
              selected={isSelected}
              onSelect={() => {
                if (!isOptionDisabled) {
                  onChange(opt.value);
                }
              }}
              label={opt.label}
              description={opt.description}
              disabled={isOptionDisabled}
              testID={testID ? `${testID}-option-${opt.value}` : undefined}
            />
          );
        })}
      </View>
    </FieldControl>
  );
}

RadioGroup.displayName = 'RadioGroup';

const styles = StyleSheet.create({
  groupWrapper: {
    width: '100%',
  },
  columnDirection: {
    flexDirection: 'column',
  },
  rowDirection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
});
