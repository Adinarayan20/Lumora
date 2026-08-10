import { describe, it, expect } from "vitest";
import { SchemaMigrationEngine } from "../schema-migration-engine.js";
import { FieldType } from "../field-type.js";
import type { FieldSchema } from "../field-schema.js";
import { DomainValidationException } from "../../errors/domain-exceptions.js";

describe("SchemaMigrationEngine Boundary Validation Tests", () => {
  it("should validate STRING field minLength, maxLength, and required constraints", () => {
    const field: FieldSchema = {
      key: "title",
      label: "Title",
      type: FieldType.STRING,
      validation: { required: true, minLength: 3, maxLength: 10 },
    };

    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(field, null),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(field, "ab"),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(
        field,
        "this-is-too-long-title",
      ),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(field, "valid"),
    ).not.toThrow();
  });

  it("should validate NUMBER field min, max, and NaN constraints", () => {
    const field: FieldSchema = {
      key: "age",
      label: "Age",
      type: FieldType.NUMBER,
      validation: { required: true, min: 18, max: 100 },
    };

    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(field, NaN),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(field, 17),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(field, 101),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(field, 25),
    ).not.toThrow();
  });

  it("should validate BOOLEAN, DATE, ENUM, JSON, FILE, and RELATIONSHIP types", () => {
    const boolField: FieldSchema = {
      key: "active",
      label: "Active",
      type: FieldType.BOOLEAN,
    };
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(boolField, "not-bool"),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(boolField, true),
    ).not.toThrow();

    const dateField: FieldSchema = {
      key: "dueDate",
      label: "Due Date",
      type: FieldType.DATE,
    };
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(dateField, "invalid-date"),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(
        dateField,
        new Date().toISOString(),
      ),
    ).not.toThrow();

    const enumField: FieldSchema = {
      key: "status",
      label: "Status",
      type: FieldType.ENUM,
      validation: { options: ["OPEN", "CLOSED"] },
    };
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(enumField, "INVALID"),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(enumField, "OPEN"),
    ).not.toThrow();

    const jsonField: FieldSchema = {
      key: "metadata",
      label: "Metadata",
      type: FieldType.JSON,
    };
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(jsonField, { a: 1 }),
    ).not.toThrow();

    const fileField: FieldSchema = {
      key: "attachment",
      label: "Attachment",
      type: FieldType.FILE,
    };
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(fileField, 12345),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(fileField, "asset_guid_123"),
    ).not.toThrow();

    const relField: FieldSchema = {
      key: "parentId",
      label: "Parent ID",
      type: FieldType.RELATIONSHIP,
    };
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(relField, 999),
    ).toThrow(DomainValidationException);
    expect(() =>
      SchemaMigrationEngine.validateAttributeValue(relField, "obj_guid_456"),
    ).not.toThrow();
  });
});
