import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SpacingScale } from '@lumora/theme';
import { Button } from '../../primitives/button/Button';
import type { DynamicFormProps } from './DynamicForm.types';
import { defaultFieldRegistry } from './FieldRegistry';
import { useDynamicForm } from './useDynamicForm';

export const DynamicForm: React.FC<DynamicFormProps> = memo(({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  onReset,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  resetLabel = 'Reset',
  showResetButton = false,
  disabled = false,
  isLoading = false,
  registry = defaultFieldRegistry,
  testID,
}) => {
  const { formState, setFieldValue, handleSubmit, resetForm } = useDynamicForm({
    fields,
    initialValues,
    onSubmit,
  });

  const isFormDisabled = disabled || isLoading || formState.isSubmitting;

  const handleResetClick = () => {
    resetForm();
    if (onReset) {
      onReset();
    }
  };

  return (
    <View
      style={styles.formContainer}
      accessibilityRole="form"
      accessibilityLabel={`Dynamic form containing ${fields.length} fields`}
      testID={testID}
    >
      {/* Field List Rendering */}
      <View style={styles.fieldList}>
        {fields.map((field) => {
          const Adapter = registry.get(field.type);
          const value = formState.values[field.key];
          const isTouched = formState.touched[field.key];
          const errorText = isTouched ? formState.errors[field.key] : undefined;

          return (
            <View key={field.key} style={styles.fieldWrapper}>
              <Adapter
                schema={field}
                value={value}
                onChange={(val) => setFieldValue(field.key, val)}
                label={field.label}
                errorText={errorText}
                disabled={isFormDisabled}
                testID={testID ? `${testID}-field-${field.key}` : `field-${field.key}`}
              />
            </View>
          );
        })}
      </View>

      {/* Form Action Controls */}
      <View style={styles.actionRow}>
        {onCancel ? (
          <View style={styles.buttonWrapper}>
            <Button
              variant="secondary"
              size="md"
              onPress={onCancel}
              disabled={isFormDisabled}
              accessibilityLabel={cancelLabel}
              testID={testID ? `${testID}-cancel-button` : 'form-cancel-button'}
            >
              {cancelLabel}
            </Button>
          </View>
        ) : null}

        {showResetButton || onReset ? (
          <View style={styles.buttonWrapper}>
            <Button
              variant="ghost"
              size="md"
              onPress={handleResetClick}
              disabled={isFormDisabled}
              accessibilityLabel={resetLabel}
              testID={testID ? `${testID}-reset-button` : 'form-reset-button'}
            >
              {resetLabel}
            </Button>
          </View>
        ) : null}

        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            size="md"
            loading={isLoading || formState.isSubmitting}
            disabled={isFormDisabled}
            onPress={handleSubmit}
            accessibilityLabel={submitLabel}
            testID={testID ? `${testID}-submit-button` : 'form-submit-button'}
          >
            {submitLabel}
          </Button>
        </View>
      </View>
    </View>
  );
});

DynamicForm.displayName = 'DynamicForm';

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  fieldList: {
    width: '100%',
  },
  fieldWrapper: {
    marginBottom: SpacingScale.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SpacingScale.md,
    gap: SpacingScale.sm,
  },
  buttonWrapper: {
    minWidth: 100,
  },
});
