import { describe, it, expect } from 'vitest';
import type { ObjectDefinition } from '../../../catalog/object-definition.js';
import type { SchemaDefinition } from '../../../catalog/schema-definition.js';
import { FieldType } from '../../../catalog/field-type.js';
import { ObjectStatus } from '../../../catalog/object-status.js';
import { ObjectValidator } from '../object-validator.js';
import {
  ObjectSchemaMismatchException,
  ObjectLifecycleConflictException,
} from '../../errors/object-runtime-error.js';

describe('ObjectValidator Domain Contract', () => {
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

  it('rejects required missing string attributes and invalid number boundaries', () => {
    const input = {
      typeKey: 'task',
      attributes: {
        priority: 999, // Exceeds max 10
      },
    };

    const result = ObjectValidator.validateCreation(input, sampleDef, sampleSchema);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.priority).toBeDefined();
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
