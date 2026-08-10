import type { ObjectDefinition } from "../../catalog/object-definition.js";
import type { SchemaDefinition } from "../../catalog/schema-definition.js";
import type { FieldSchema } from "../../catalog/field-schema.js";
import { FieldType } from "../../catalog/field-type.js";
import { ObjectStatus } from "../../catalog/object-status.js";
import type {
  CreateObjectInput,
  UpdateObjectInput,
  UniversalObject,
} from "../types/universal-object.types.js";
import {
  ObjectValidationException,
  ObjectSchemaMismatchException,
  ObjectLifecycleConflictException,
} from "../errors/object-runtime-error.js";

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: Readonly<Record<string, readonly string[]>>;
  readonly normalizedAttributes: Readonly<Record<string, unknown>>;
}

export class ObjectValidator {
  /**
   * Validates creation input against object definition and schema definition.
   */
  public static validateCreation(
    input: CreateObjectInput,
    definition: ObjectDefinition,
    schema: SchemaDefinition,
  ): ValidationResult {
    if (input.typeKey !== definition.typeKey) {
      throw new ObjectSchemaMismatchException(
        input.typeKey,
        definition.typeKey,
      );
    }
    if (schema.typeKey !== definition.typeKey) {
      throw new ObjectSchemaMismatchException(
        schema.typeKey,
        definition.typeKey,
      );
    }
    if (definition.schemaVersion !== schema.schemaVersion) {
      throw new ObjectSchemaMismatchException(
        schema.typeKey,
        definition.typeKey,
        schema.schemaVersion,
        definition.schemaVersion,
      );
    }

    return ObjectValidator.validateAttributes(input.attributes, schema.fields);
  }

  /**
   * Validates update patch input against schema definition.
   */
  public static validateUpdate(
    changes: UpdateObjectInput,
    existingObject: UniversalObject,
    schema: SchemaDefinition,
  ): ValidationResult {
    if (existingObject.typeKey !== schema.typeKey) {
      throw new ObjectSchemaMismatchException(
        existingObject.typeKey,
        schema.typeKey,
      );
    }
    if (existingObject.schemaVersion !== schema.schemaVersion) {
      throw new ObjectSchemaMismatchException(
        schema.typeKey,
        existingObject.typeKey,
        schema.schemaVersion,
        existingObject.schemaVersion,
      );
    }

    if (!changes.attributes || Object.keys(changes.attributes).length === 0) {
      return {
        isValid: true,
        errors: {},
        normalizedAttributes: existingObject.attributes,
      };
    }

    // Merge existing attributes with patch changes
    const mergedAttributes: Record<string, unknown> = {
      ...existingObject.attributes,
      ...changes.attributes,
    };

    return ObjectValidator.validateAttributes(mergedAttributes, schema.fields);
  }

  /**
   * Validates lifecycle transition legality (e.g. active -> archived, archived -> active).
   */
  public static validateLifecycleTransition(
    currentStatus: ObjectStatus,
    targetStatus: ObjectStatus,
    objectId: string,
  ): void {
    if (currentStatus === targetStatus) {
      throw new ObjectLifecycleConflictException(
        objectId,
        currentStatus,
        `transition_to_${targetStatus.toLowerCase()}`,
      );
    }
  }

  /**
   * Core schema attribute validator.
   */
  public static validateAttributes(
    rawAttributes: Readonly<Record<string, unknown>>,
    fields: readonly FieldSchema[],
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    const normalized: Record<string, unknown> = { ...rawAttributes };

    for (const field of fields) {
      const value = rawAttributes[field.key];
      const isRequired = Boolean(field.validation?.required);

      const addFieldError = (msg: string) => {
        const list = errors[field.key] ?? [];
        list.push(msg);
        errors[field.key] = list;
      };

      // 1. Required Check — 0, false, "", null (if optional) are valid, only undefined is missing!
      if (value === undefined) {
        if (field.defaultValue !== undefined) {
          normalized[field.key] = field.defaultValue;
        } else if (isRequired) {
          addFieldError(`Field '${field.label}' is required.`);
        }
        continue;
      }

      // If value is null, check if null is permitted or required
      if (value === null) {
        if (isRequired) {
          addFieldError(`Field '${field.label}' cannot be null.`);
        }
        continue;
      }

      // 2. Type Check
      switch (field.type) {
        case FieldType.STRING:
        case FieldType.ENUM:
        case FieldType.DATE:
          if (typeof value !== "string") {
            addFieldError(`Field '${field.label}' must be a string.`);
          } else {
            // Regex pattern validation
            if (field.validation?.pattern) {
              try {
                const regex = new RegExp(field.validation.pattern);
                if (!regex.test(value)) {
                  addFieldError(
                    `Field '${field.label}' does not match required pattern.`,
                  );
                }
              } catch {
                // Ignore invalid regex patterns safely
              }
            }
          }
          break;

        case FieldType.NUMBER:
          if (typeof value !== "number" || Number.isNaN(value)) {
            addFieldError(`Field '${field.label}' must be a valid number.`);
          } else {
            if (
              field.validation?.min !== undefined &&
              value < field.validation.min
            ) {
              addFieldError(
                `Field '${field.label}' must be at least ${field.validation.min}.`,
              );
            }
            if (
              field.validation?.max !== undefined &&
              value > field.validation.max
            ) {
              addFieldError(
                `Field '${field.label}' cannot exceed ${field.validation.max}.`,
              );
            }
          }
          break;

        case FieldType.BOOLEAN:
          if (typeof value !== "boolean") {
            addFieldError(`Field '${field.label}' must be a boolean.`);
          }
          break;

        case FieldType.JSON:
          // FieldType.JSON semantics: plain object or array required; null/undefined handled above
          if (typeof value !== "object") {
            addFieldError(
              `Field '${field.label}' must be a JSON object or array.`,
            );
          }
          break;

        default:
          // Unknown / deferred field types pass safely without crashing
          break;
      }
    }

    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      const readOnlyErrors: Record<string, readonly string[]> = {};
      for (const [k, v] of Object.entries(errors)) {
        if (v) {
          readOnlyErrors[k] = Object.freeze(v);
        }
      }
      return {
        isValid: false,
        errors: Object.freeze(readOnlyErrors),
        normalizedAttributes: Object.freeze(normalized),
      };
    }

    return {
      isValid: true,
      errors: Object.freeze({}),
      normalizedAttributes: Object.freeze(normalized),
    };
  }
}
