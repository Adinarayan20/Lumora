import type { SchemaDefinition } from "./schema-definition.js";
import type { ObjectDefinition } from "./object-definition.js";

/**
 * Portable snapshot payload for export/import, templates, and backups.
 */
export interface CatalogSnapshot {
  readonly workspaceId: string;
  readonly exportedAt: string;
  readonly schemaVersion: number;
  readonly objectDefinitions: readonly ObjectDefinition[];
  readonly schemas: readonly SchemaDefinition[];
}
