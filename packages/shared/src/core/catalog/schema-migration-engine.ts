import type { SchemaDefinition } from "./schema-definition.js";
import type { FieldSchema } from "./field-schema.js";
import { FieldType } from "./field-type.js";
import { DomainValidationException } from "../errors/domain-exceptions.js";

/**
 * Deterministic Schema Migration Engine for attribute default value resolution,
 * strict type validation, and schema version transitions.
 */
export class SchemaMigrationEngine {
  /**
   * Applies schema initializers and default values to an object's attribute payload.
   */
  public static migrateAttributes(
    attributes: Record<string, unknown>,
    schema: SchemaDefinition,
  ): Record<string, unknown> {
    const migrated = { ...attributes };

    // 1. Populate missing fields from field default values
    for (const field of schema.fields) {
      if (migrated[field.key] === undefined && field.defaultValue !== undefined) {
        migrated[field.key] = field.defaultValue;
      }
    }

    // 2. Apply explicit migration initializers if provided
    if (schema.migrationInitializers) {
      for (const [key, initValue] of Object.entries(schema.migrationInitializers)) {
        if (migrated[key] === undefined) {
          migrated[key] = initValue;
        }
      }
    }

    return migrated;
  }

  /**
   * Validates a single attribute value against its FieldSchema contract.
   * Throws DomainValidationException if validation fails.
   */
  public static validateAttributeValue(
    fieldSchema: FieldSchema,
    value: unknown,
  ): void {
    if (value === null || value === undefined) {
      if (fieldSchema.validation?.required) {
        throw new DomainValidationException(
          `Attribute '${fieldSchema.key}' is required by schema definition.`,
        );
      }
      return;
    }

    switch (fieldSchema.type) {
      case FieldType.STRING:
        if (typeof value !== "string") {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' must be of type STRING. Received ${typeof value}.`,
          );
        }
        if (
          fieldSchema.validation?.minLength !== undefined &&
          value.length < fieldSchema.validation.minLength
        ) {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' length must be >= ${fieldSchema.validation.minLength}.`,
          );
        }
        if (
          fieldSchema.validation?.maxLength !== undefined &&
          value.length > fieldSchema.validation.maxLength
        ) {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' length must be <= ${fieldSchema.validation.maxLength}.`,
          );
        }
        break;

      case FieldType.NUMBER:
        if (typeof value !== "number" || isNaN(value)) {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' must be of type NUMBER. Received ${typeof value}.`,
          );
        }
        if (
          fieldSchema.validation?.min !== undefined &&
          value < fieldSchema.validation.min
        ) {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' value must be >= ${fieldSchema.validation.min}.`,
          );
        }
        if (
          fieldSchema.validation?.max !== undefined &&
          value > fieldSchema.validation.max
        ) {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' value must be <= ${fieldSchema.validation.max}.`,
          );
        }
        break;

      case FieldType.BOOLEAN:
        if (typeof value !== "boolean") {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' must be of type BOOLEAN. Received ${typeof value}.`,
          );
        }
        break;

      case FieldType.DATE:
        if (
          !(value instanceof Date) &&
          (typeof value !== "string" || isNaN(Date.parse(value)))
        ) {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' must be a valid ISO Date string or Date instance.`,
          );
        }
        break;

      case FieldType.ENUM:
        if (
          fieldSchema.validation?.options &&
          !fieldSchema.validation.options.includes(String(value))
        ) {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' value '${String(value)}' is not a valid enum option [${fieldSchema.validation.options.join(", ")}].`,
          );
        }
        break;

      case FieldType.RELATIONSHIP:
      case FieldType.FILE:
      case FieldType.JSON:
        // Complex structural types allowed as non-primitive objects/strings
        if (typeof value !== "object" && typeof value !== "string") {
          throw new DomainValidationException(
            `Attribute '${fieldSchema.key}' must be an object or valid string identifier.`,
          );
        }
        break;

      default:
        break;
    }
  }
}
