import type { FieldSchema } from "./field-schema.js";

/**
 * Universal schema definition for an object type or custom entity.
 */
export interface SchemaDefinition {
  readonly typeKey: string;
  readonly schemaVersion: number;
  readonly fields: readonly FieldSchema[];
  readonly migrationInitializers?: Record<string, unknown>;
}
