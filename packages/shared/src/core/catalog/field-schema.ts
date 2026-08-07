import { FieldType } from "./field-type.js";
import type { ValidationRule } from "./validation-rule.js";
import type { DisplayFormatter } from "./display-formatter.js";

/**
 * Universal field schema definition for dynamic attributes.
 */
export interface FieldSchema {
  readonly key: string;
  readonly label: string;
  readonly type: FieldType;
  readonly defaultValue?: unknown;
  readonly validation?: ValidationRule;
  readonly display?: DisplayFormatter;
  readonly isSystem?: boolean;
}
