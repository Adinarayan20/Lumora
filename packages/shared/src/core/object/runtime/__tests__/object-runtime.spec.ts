import { describe, it, expect, beforeEach } from 'vitest';
import type { ObjectDefinition } from '../../../catalog/object-definition.js';
import type { SchemaDefinition } from '../../../catalog/schema-definition.js';
import { FieldType } from '../../../catalog/field-type.js';
import { ObjectStatus } from '../../../catalog/object-status.js';
import { InMemoryObjectRepository } from '../../repository/in-memory-object-repository.js';
import { ObjectRuntime, createObjectRuntime } from '../object-runtime.js';
import type { ClockProvider, IdGeneratorProvider } from '../../types/object-runtime.types.js';
import {
  ObjectNotFoundException,
  ObjectValidationException,
  ObjectLifecycleConflictException,
  ObjectConcurrencyException,
  ObjectSchemaMismatchException,
} from '../../errors/object-runtime-error.js';

class MockClock implements ClockProvider {
  private currentTime = '2026-08-08T10:00:00.000Z';

  public setTime(iso: string) {
    this.currentTime = iso;
  }

  public nowIso(): string {
    return this.currentTime;
  }
}

class MockIdGenerator implements IdGeneratorProvider {
  private counter = 1;

  public generate(): string {
    return `custom-uuid-${this.counter++}`;
  }
}

describe('Universal Object Runtime Engine Contract & Hardening', () => {
  let repo: InMemoryObjectRepository;
  let mockClock: MockClock;
  let mockIdGen: MockIdGenerator;
  let runtime: ObjectRuntime;

  const taskDef: ObjectDefinition = {
    typeKey: 'task',
    name: 'Task',
    pluralName: 'Tasks',
    icon: 'task',
    allowedCapabilities: [],
    traits: [],
    schemaVersion: 1,
  };

  const taskSchema: SchemaDefinition = {
    typeKey: 'task',
    schemaVersion: 1,
    fields: [
      { key: 'title', label: 'Title', type: FieldType.STRING, validation: { required: true } },
      { key: 'priority', label: 'Priority', type: FieldType.NUMBER },
      { key: 'isDone', label: 'Is Done', type: FieldType.BOOLEAN },
    ],
  };

  beforeEach(() => {
    repo = new InMemoryObjectRepository();
    mockClock = new MockClock();
    mockIdGen = new MockIdGenerator();

    runtime = createObjectRuntime({
      repository: repo,
      clock: mockClock,
      idGenerator: mockIdGen,
    });
  });

  it('STEP 36 UNIVERSAL OBJECT PROOF: handles Camera Equipment without domain branches', async () => {
    const cameraDef: ObjectDefinition = {
      typeKey: 'camera-equipment',
      name: 'Camera Equipment',
      pluralName: 'Cameras',
      icon: 'camera',
      allowedCapabilities: [],
      traits: [],
      schemaVersion: 1,
    };

    const cameraSchema: SchemaDefinition = {
      typeKey: 'camera-equipment',
      schemaVersion: 1,
      fields: [
        { key: 'name', label: 'Equipment Name', type: FieldType.STRING, validation: { required: true } },
        { key: 'brand', label: 'Brand', type: FieldType.STRING },
        { key: 'serialNumber', label: 'Serial Number', type: FieldType.STRING },
        { key: 'purchasePrice', label: 'Purchase Price', type: FieldType.NUMBER },
      ],
    };

    // 1. Create
    const created = await runtime.createObject({
      definition: cameraDef,
      schema: cameraSchema,
      attributes: {
        name: 'Sony A7IV',
        brand: 'Sony',
        serialNumber: 'ABC123456',
        purchasePrice: 120000,
      },
    });

    expect(created.id).toBe('custom-uuid-1');
    expect(created.typeKey).toBe('camera-equipment');
    expect(created.status).toBe(ObjectStatus.ACTIVE);
    expect(created.attributes.purchasePrice).toBe(120000);
    expect(created.version).toBe(1);

    // 2. Read
    const fetched = await runtime.getObject(created.id);
    expect(fetched.attributes.serialNumber).toBe('ABC123456');

    // 3. Update purchasePrice (patch mode)
    mockClock.setTime('2026-08-08T11:00:00.000Z');
    const updated = await runtime.updateObject({
      id: created.id,
      schema: cameraSchema,
      attributes: {
        purchasePrice: 125000,
      },
    });

    expect(updated.attributes.purchasePrice).toBe(125000);
    expect(updated.attributes.name).toBe('Sony A7IV'); // Preserves name!
    expect(updated.attributes.serialNumber).toBe('ABC123456'); // Preserves serialNumber!
    expect(updated.updatedAt).toBe('2026-08-08T11:00:00.000Z');
    expect(updated.createdAt).toBe('2026-08-08T10:00:00.000Z'); // Preserves createdAt!
    expect(updated.version).toBe(2);

    // 4. Archive
    mockClock.setTime('2026-08-08T12:00:00.000Z');
    const archived = await runtime.archiveObject(created.id);
    expect(archived.status).toBe(ObjectStatus.ARCHIVED);
    expect(archived.archivedAt).toBe('2026-08-08T12:00:00.000Z');

    // 5. Restore
    mockClock.setTime('2026-08-08T13:00:00.000Z');
    const restored = await runtime.restoreObject(created.id);
    expect(restored.status).toBe(ObjectStatus.ACTIVE);
    expect(restored.archivedAt).toBeUndefined();

    // 6. Read Final
    const finalState = await runtime.getObject(created.id);
    expect(finalState.status).toBe(ObjectStatus.ACTIVE);
    expect(finalState.attributes.purchasePrice).toBe(125000);
  });

  it('enforces schema version integrity during creation and update', async () => {
    // 1. Mismatched definition vs schema version on creation
    const mismatchedSchema: SchemaDefinition = {
      ...taskSchema,
      schemaVersion: 99, // Mismatch with taskDef.schemaVersion = 1
    };

    await expect(
      runtime.createObject({
        definition: taskDef,
        schema: mismatchedSchema,
        attributes: { title: 'Schema Version Test Task' },
      }),
    ).rejects.toThrow(ObjectSchemaMismatchException);

    // 2. Valid creation
    const obj = await runtime.createObject({
      definition: taskDef,
      schema: taskSchema,
      attributes: { title: 'Valid Task' },
    });

    // 3. Attempt update with mismatched schemaVersion
    mockClock.setTime('2026-08-08T15:00:00.000Z');
    await expect(
      runtime.updateObject({
        id: obj.id,
        schema: mismatchedSchema, // schemaVersion 99 != obj.schemaVersion 1
        attributes: { title: 'Failed Update Attempt' },
      }),
    ).rejects.toThrow(ObjectSchemaMismatchException);

    // 4. Verify failed schema version update did NOT modify stored object
    const stored = await runtime.getObject(obj.id);
    expect(stored.attributes.title).toBe('Valid Task');
    expect(stored.updatedAt).toBe('2026-08-08T10:00:00.000Z');
    expect(stored.version).toBe(1);
    expect(stored.schemaVersion).toBe(1);
  });

  it('preserves falsy values 0 and false during object creation and update', async () => {
    const created = await runtime.createObject({
      definition: taskDef,
      schema: taskSchema,
      attributes: {
        title: 'Preserve Falsy Values Task',
        priority: 0,
        isDone: false,
      },
    });

    expect(created.attributes.priority).toBe(0);
    expect(created.attributes.isDone).toBe(false);

    const updated = await runtime.updateObject({
      id: created.id,
      schema: taskSchema,
      attributes: {
        priority: 0,
      },
    });

    expect(updated.attributes.priority).toBe(0);
    expect(updated.attributes.isDone).toBe(false);
  });

  it('throws ObjectValidationException on missing required attributes', async () => {
    await expect(
      runtime.createObject({
        definition: taskDef,
        schema: taskSchema,
        attributes: {
          priority: 5,
        },
      }),
    ).rejects.toThrow(ObjectValidationException);
  });

  it('throws ObjectNotFoundException when accessing non-existent object ID', async () => {
    await expect(runtime.getObject('non-existent-id')).rejects.toThrow(ObjectNotFoundException);
  });

  it('throws ObjectLifecycleConflictException on illegal status transitions', async () => {
    const obj = await runtime.createObject({
      definition: taskDef,
      schema: taskSchema,
      attributes: { title: 'Lifecycle Test' },
    });

    // Double restore active object
    await expect(runtime.restoreObject(obj.id)).rejects.toThrow(ObjectLifecycleConflictException);

    // Archive
    await runtime.archiveObject(obj.id);

    // Double archive archived object
    await expect(runtime.archiveObject(obj.id)).rejects.toThrow(ObjectLifecycleConflictException);
  });

  it('enforces optimistic concurrency control when expectedVersion is provided', async () => {
    const obj = await runtime.createObject({
      definition: taskDef,
      schema: taskSchema,
      attributes: { title: 'Concurrency Test' },
    });

    // Mismatched version
    await expect(
      runtime.updateObject({
        id: obj.id,
        schema: taskSchema,
        attributes: { title: 'Updated Title' },
        expectedVersion: 999,
      }),
    ).rejects.toThrow(ObjectConcurrencyException);

    // Correct version
    const updated = await runtime.updateObject({
      id: obj.id,
      schema: taskSchema,
      attributes: { title: 'Updated Title' },
      expectedVersion: 1,
    });

    expect(updated.version).toBe(2);
  });
});
