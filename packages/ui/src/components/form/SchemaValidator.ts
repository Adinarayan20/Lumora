import type { FieldSchema } from '@lumora/shared';

export interface ValidationErrorResult {
  readonly [fieldKey: string]: string;
}

export class SchemaValidator {
  /**
   * Validates form values against an array of FieldSchema definitions.
   * Returns a map of field keys to error messages.
   */
  public static validate(
    fields: readonly FieldSchema[],
    values: Record<string, unknown>,
  ): ValidationErrorResult {
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const val = values[field.key];
      const rules = field.validation;
      if (!rules) continue;

      const isValueEmpty =
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '');

      // 1. Required Check
      if (rules.required && isValueEmpty) {
        errors[field.key] = rules.customErrorMessage || `${field.label} is required.`;
        continue;
      }

      // Skip non-required empty fields
      if (isValueEmpty) continue;

      // 2. String Length Validation
      if (typeof val === 'string') {
        if (rules.minLength !== undefined && val.length < rules.minLength) {
          errors[field.key] =
            rules.customErrorMessage ||
            `${field.label} must be at least ${rules.minLength} characters.`;
          continue;
        }

        if (rules.maxLength !== undefined && val.length > rules.maxLength) {
          errors[field.key] =
            rules.customErrorMessage ||
            `${field.label} must be at most ${rules.maxLength} characters.`;
          continue;
        }

        if (rules.pattern) {
          const regex = new RegExp(rules.pattern);
          if (!regex.test(val)) {
            errors[field.key] =
              rules.customErrorMessage || `${field.label} format is invalid.`;
            continue;
          }
        }
      }

      // 3. Numeric Range Validation
      if (typeof val === 'number' && !isNaN(val)) {
        if (rules.min !== undefined && val < rules.min) {
          errors[field.key] =
            rules.customErrorMessage ||
            `${field.label} must be at least ${rules.min}.`;
          continue;
        }

        if (rules.max !== undefined && val > rules.max) {
          errors[field.key] =
            rules.customErrorMessage ||
            `${field.label} must be at most ${rules.max}.`;
          continue;
        }
      }
    }

    return errors;
  }
}
