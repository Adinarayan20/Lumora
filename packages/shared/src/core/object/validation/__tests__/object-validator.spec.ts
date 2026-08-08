import { describe, it, expect } from 'vitest';
import type { ObjectDefinition } from '../../../catalog/object-definition.js';
import type { SchemaDefinition } from '../../../catalog/schema-definition.js';
import { FieldType } from '../../../catalog/field-type.js';
import { ObjectStatus } from '../../../catalog/object-status.js';
import { ObjectValidator } from '../object-validator.js';
import type { UniversalObject } from '../../types/universal-object.types.js';
import {
  ObjectSchemaMismatchException,
  ObjectLifecycleConflictException,
} from '../../errors/object-runtime-error.js';

describe('ObjectValidator Domain Contract & Micro-Hardening', () => {
  const sampleDef: ObjectDefinition = {
    typeKey: 'task',
    name: 'Task',
    pluralName: 'Tasks',
    icon: 'task',
    allowedCapabilities: ['reminder'],
    traits: [],
    schemaVersion: 1,
  };

  const sampleSchema: SchemaDefinition = {
    typeKey: 'task',
    schemaVersion: 1,
    fields: [
      { key: 'title', label: 'Title', type: FieldType.STRING, validation: { required: true } },
      { key: 'priority', label: 'Priority', type: FieldType.NUMBER, validation: { min: 0, max: 10 } },
      { key: 'isDone', label: 'Done Status', type: FieldType.BOOLEAN },
    ],
  };

  it('validates creation input and preserves 0 and false values correctly', () => {
    const input = {
      typeKey: 'task',
      attributes: {
        title: 'Build Universal Object Runtime',
        priority: 0, // Must preserve 0!
        isDone: false, // Must preserve false!
      },
    };

    const result = ObjectValidator.validateCreation(input, sampleDef, sampleSchema);
    expect(result.isValid).toBe(true);
    expect(result.normalizedAttributes.priority).toBe(0);
    expect(result.normalizedAttributes.isDone).toBe(false);
  });

  it('throws ObjectSchemaMismatchException if input typeKey does not match definition', () => {
    const input = {
      typeKey: 'medicine',
      attributes: { title: 'Tylenol' },
    };

    expect(() =>
      ObjectValidator.validateCreation(input, sampleDef, sampleSchema),
    ).toThrow(ObjectSchemaMismatchException);
  });

  it('throws ObjectSchemaMismatchException if definition schemaVersion does not match schema schemaVersion', () => {
    const mismatchedSchema: SchemaDefinition = {
      ...sampleSchema,
      schemaVersion: 2, // Mismatch!
    };

    const input = {
      typeKey: 'task',
      attributes: { title: 'Version Mismatch Task' },
    };

    expect(() =>
      ObjectValidator.validateCreation(input, sampleDef, mismatchedSchema),
    ).toThrow(ObjectSchemaMismatchException);
  });

  it('throws ObjectSchemaMismatchException during update if existing object schemaVersion differs from update schema', () => {
    const existingObj: UniversalObject = {
      id: 'obj-123',
      typeKey: 'task',
      schemaVersion: 1,
      status: ObjectStatus.ACTIVE,
      attributes: { title: 'Existing Task' },
      createdAt: '2026-08-08T00:00:00.000Z',
      updatedAt: '2026-08-08T00:00:00.000Z',
      version: 1,
    };

    const v2Schema: SchemaDefinition = {
      ...sampleSchema,
      schemaVersion: 2, // Mismatch with existingObj.schemaVersion = 1!
    };

    expect(() =>
      ObjectValidator.validateUpdate({ attributes: { title: 'Updated Title' } }, existingObj, v2Schema),
    ).toThrow(ObjectSchemaMismatchException);
  });

  it('enforces JSON Field Validation Semantics (objects, arrays, optional null, primitive rejection)', () => {
    const jsonFields = [
      { key: 'metadata', label: 'Optional Metadata', type: FieldType.JSON },
      { key: 'payload', label: 'Required Payload', type: FieldType.JSON, validation: { required: true } },
    ];

    // 1. JSON object & array accepted
    const validResult = ObjectValidator.validateAttributes(
      {
        metadata: { key: 'value' },
        payload: [1, 2, 3],
      },
      jsonFields,
    );
    expect(validResult.isValid).toBe(true);

    // 2. Optional JSON null accepted
    const optionalNullResult = ObjectValidator.validateAttributes(
      {
        metadata: null,
        payload: { valid: true },
      },
      jsonFields,
    );
    expect(optionalNullResult.isValid).toBe(true);

    // 3. Required JSON null rejected
    const requiredNullResult = ObjectValidator.validateAttributes(
      {
        metadata: null,
        payload: null, // Required field cannot be null
      },
      jsonFields,
    );
    expect(requiredNullResult.isValid).toBe(false);
    expect(requiredNullResult.errors.payload).toBeDefined();

    // 4. Primitive JSON value rejected
    const primitiveResult = ObjectValidator.validateAttributes(
      {
        metadata: 'just a string', // Invalid for FieldType.JSON
        payload: 12345, // Invalid for FieldType.JSON
      },
      jsonFields,
    );
    expect(primitiveResult.isValid).toBe(false);
    expect(primitiveResult.errors.metadata).toBeDefined();
    expect(primitiveResult.errors.payload).toBeDefined();
  });

  it('rejects illegal lifecycle transitions (e.g. active -> active)', () => {
    expect(() =>
      ObjectValidator.validateLifecycleTransition(ObjectStatus.ACTIVE, ObjectStatus.ACTIVE, 'obj-123'),
    ).toThrow(ObjectLifecycleConflictException);

    expect(() =>
      ObjectValidator.validateLifecycleTransition(ObjectStatus.ARCHIVED, ObjectStatus.ARCHIVED, 'obj-123'),
    ).toThrow(ObjectLifecycleConflictException);

    // Legal transition does not throw
    expect(() =>
      ObjectValidator.validateLifecycleTransition(ObjectStatus.ACTIVE, ObjectStatus.ARCHIVED, 'obj-123'),
    ).not.toThrow();
  });
});
