import type { SchemaDefinition } from "./schema-definition.js";

/**
 * Deterministic Schema Migration Engine for attribute default value resolution
 * and schema version transitions without database schema mutations.
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
}
