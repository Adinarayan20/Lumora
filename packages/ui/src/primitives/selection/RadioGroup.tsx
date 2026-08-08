import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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

  const enabledOptions = options.filter((opt) => !opt.disabled);

  const navigateRadio = (step: number, currentVal: T | null) => {
    if (disabled || enabledOptions.length === 0) return;

    const currentIndex = enabledOptions.findIndex((opt) => opt.value === currentVal);
    let nextIndex: number;

    if (currentIndex === -1) {
      nextIndex = step > 0 ? 0 : enabledOptions.length - 1;
    } else {
      nextIndex = (currentIndex + step + enabledOptions.length) % enabledOptions.length;
    }

    onChange(enabledOptions[nextIndex].value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optValue: T) => {
    if (Platform.OS !== 'web' || disabled) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      navigateRadio(1, optValue);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateRadio(-1, optValue);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(optValue);
    }
  };

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
              onKeyDown={(e) => handleKeyDown(e, opt.value)}
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
