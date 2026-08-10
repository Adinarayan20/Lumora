import { describe, it, expect } from "vitest";
import { SchemaMigrationEngine } from "../schema-migration-engine.js";
import { FieldType } from "../field-type.js";
import type { SchemaDefinition } from "../schema-definition.js";

describe("SchemaMigrationEngine", () => {
  it("should populate missing attribute default values cleanly", () => {
    const schema: SchemaDefinition = {
      typeKey: "task",
      schemaVersion: 2,
      fields: [
        {
          key: "priority",
          label: "Priority",
          type: FieldType.STRING,
          defaultValue: "MEDIUM",
        },
      ],
      migrationInitializers: {
        archived: false,
      },
    };

    const migrated = SchemaMigrationEngine.migrateAttributes({}, schema);

    expect(migrated["priority"]).toBe("MEDIUM");
    expect(migrated["archived"]).toBe(false);
  });
});
