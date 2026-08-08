import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, SpacingScale } from '@lumora/theme';
import { Label } from '../typography/Label';
import { Caption } from '../typography/Caption';
import type { FieldControlProps } from './Input.types';

/**
 * FieldControl — Reusable Layout & Accessibility Composition Helper
 *
 * Contract:
 * - Renders visible field Label primitive when label prop is provided.
 * - Renders helperText / errorText block below input container smoothly (helper text is
 *   replaced by error text without animated jitter or unnecessary permanent vertical blank space).
 * - Reusable across Input, TextArea, and future Selection/Picker controls.
 */
export const FieldControl: React.FC<FieldControlProps> = memo(({
  children,
  label,
  helperText,
  errorText,
  disabled = false,
  testID,
}) => {
  useTheme(); // Subscribes to active theme context

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

      {/* Main Field Body Control */}
      {children}

      {/* Helper / Error Text Block (smooth message replacement without permanent empty margin) */}
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
