/**
 * Validation rule interface for custom field attribute verification.
 */
export interface ValidationRule {
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
  readonly required?: boolean;
  readonly options?: readonly string[];
  readonly customErrorMessage?: string;
}
