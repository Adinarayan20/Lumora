import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SpacingScale } from '@lumora/theme';
import { Toggle } from '../../../primitives/selection/Toggle';
import { Caption } from '../../../primitives/typography/Caption';
import type { FieldControlAdapterProps } from '../DynamicForm.types';

export const BooleanFieldAdapter: React.FC<FieldControlAdapterProps<unknown>> = memo(({
  value,
  onChange,
  label,
  helperText,
  errorText,
  disabled,
  testID,
}) => {
  const boolValue = Boolean(value);
  const activeMessage = errorText || helperText;
  const isError = Boolean(errorText);

  return (
    <View style={styles.container}>
      <Toggle
        value={boolValue}
        onValueChange={(val) => onChange(val)}
        label={label}
        disabled={disabled}
        testID={testID}
      />
      {activeMessage ? (
        <View style={styles.messageWrapper}>
          <Caption color={isError ? 'danger' : 'textMuted'}>
            {activeMessage}
          </Caption>
        </View>
      ) : null}
    </View>
  );
});

BooleanFieldAdapter.displayName = 'BooleanFieldAdapter';

const styles = StyleSheet.create({
  container: {
    marginVertical: SpacingScale.xs,
  },
  messageWrapper: {
    marginTop: SpacingScale.xs,
  },
});
