import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { FieldSchema } from '@lumora/shared';
import type { DynamicFormState } from './DynamicForm.types';
import { SchemaValidator } from './SchemaValidator';

export interface UseDynamicFormOptions {
  readonly fields: readonly FieldSchema[];
  readonly initialValues?: Record<string, unknown>;
  readonly onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
}

export function useDynamicForm({ fields, initialValues, onSubmit }: UseDynamicFormOptions) {
  const normalizedInitialValues = useMemo(() => {
    const base: Record<string, unknown> = {};
    for (const field of fields) {
      if (initialValues && initialValues[field.key] !== undefined) {
        base[field.key] = initialValues[field.key];
      } else if (field.defaultValue !== undefined) {
        base[field.key] = field.defaultValue;
      }
    }
    return base;
  }, [fields, initialValues]);

  const [values, setValues] = useState<Record<string, unknown>>(normalizedInitialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const errors = useMemo(() => {
    return SchemaValidator.validate(fields, values);
  }, [fields, values]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const isDirty = useMemo(() => {
    return fields.some((field) => {
      const initial = normalizedInitialValues[field.key];
      const current = values[field.key];
      return initial !== current;
    });
  }, [fields, normalizedInitialValues, values]);

  const setFieldValue = useCallback((key: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const setFieldTouched = useCallback((key: string, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [key]: isTouched }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Touch all fields on submission
    const allTouched: Record<string, boolean> = {};
    for (const field of fields) {
      allTouched[field.key] = true;
    }
    setTouched(allTouched);

    const validationErrors = SchemaValidator.validate(fields, values);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [fields, values, onSubmit, isSubmitting]);

  const resetForm = useCallback(() => {
    setValues(normalizedInitialValues);
    setTouched({});
    setIsSubmitting(false);
  }, [normalizedInitialValues]);

  const formState: DynamicFormState = {
    values,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
  };

  return {
    formState,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
  };
}
