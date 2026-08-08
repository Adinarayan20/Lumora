import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, SpacingScale } from '@lumora/theme';
import { Label } from '../typography/Label';
import { Caption } from '../typography/Caption';
import type { FieldControlProps } from './Input.types';

export const FieldControl: React.FC<FieldControlProps> = memo(({
  children,
  label,
  helperText,
  errorText,
  disabled = false,
  testID,
}) => {
  const { colors } = useTheme();

  const activeMessage = errorText || helperText;
  const isError = Boolean(errorText);

  return (
    <View style={styles.fieldWrapper} testID={testID ? `${testID}-field-control` : undefined}>
      {/* Field Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Label color={disabled ? 'textMuted' : 'textPrimary'}>
            {label}
          </Label>
        </View>
      )}

      {/* Main Field Control Input Box */}
      {children}

      {/* Helper / Error Text Block (Reserved layout region to prevent sibling jitter) */}
      {activeMessage ? (
        <View style={styles.messageContainer}>
          <Caption color={isError ? 'danger' : 'textMuted'}>
            {activeMessage}
          </Caption>
        </View>
      ) : null}
    </View>
  );
});

FieldControl.displayName = 'FieldControl';

const styles = StyleSheet.create({
  fieldWrapper: {
    width: '100%',
    flexDirection: 'column',
  },
  labelContainer: {
    marginBottom: SpacingScale.xs,
  },
  messageContainer: {
    marginTop: SpacingScale.xs,
  },
});
