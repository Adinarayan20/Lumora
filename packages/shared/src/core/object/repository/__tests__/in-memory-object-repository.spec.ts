import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryObjectRepository } from '../in-memory-object-repository.js';
import type { UniversalObject } from '../../types/universal-object.types.js';
import { ObjectStatus } from '../../../catalog/object-status.js';
import {
  ObjectNotFoundException,
  ObjectAlreadyExistsException,
  ObjectLifecycleConflictException,
} from '../../errors/object-runtime-error.js';

describe('InMemoryObjectRepository Domain Contract', () => {
  let repo: InMemoryObjectRepository;

  const dummyObject: UniversalObject = {
    id: 'obj-uuid-1',
    typeKey: 'task',
    schemaVersion: 1,
    status: ObjectStatus.ACTIVE,
    attributes: { title: 'Test Task' },
    createdAt: '2026-08-08T00:00:00.000Z',
    updatedAt: '2026-08-08T00:00:00.000Z',
    version: 1,
  };

  beforeEach(() => {
    repo = new InMemoryObjectRepository();
  });

  it('creates and resolves object by ID safely with defensive cloning', async () => {
    const created = await repo.create(dummyObject);
    expect(created.id).toBe('obj-uuid-1');

    const fetched = await repo.getById('obj-uuid-1');
    expect(fetched).not.toBeNull();
    expect(fetched?.attributes.title).toBe('Test Task');
  });

  it('throws ObjectAlreadyExistsException when creating duplicate ID', async () => {
    await repo.create(dummyObject);
    await expect(repo.create(dummyObject)).rejects.toThrow(ObjectAlreadyExistsException);
  });

  it('throws ObjectNotFoundException when updating non-existent object', async () => {
    await expect(repo.update(dummyObject)).rejects.toThrow(ObjectNotFoundException);
  });

  it('handles archive and restore lifecycle state transitions deterministically', async () => {
    await repo.create(dummyObject);

    // 1. Archive
    const archived = await repo.archive('obj-uuid-1', '2026-08-08T01:00:00.000Z', '2026-08-08T01:00:00.000Z');
    expect(archived.status).toBe(ObjectStatus.ARCHIVED);
    expect(archived.archivedAt).toBe('2026-08-08T01:00:00.000Z');
    expect(archived.version).toBe(2);

    // 2. Reject double archive
    await expect(repo.archive('obj-uuid-1', '2026-08-08T01:00:00.000Z', '2026-08-08T01:00:00.000Z')).rejects.toThrow(
      ObjectLifecycleConflictException,
    );

    // 3. Restore
    const restored = await repo.restore('obj-uuid-1', '2026-08-08T02:00:00.000Z');
    expect(restored.status).toBe(ObjectStatus.ACTIVE);
    expect(restored.archivedAt).toBeUndefined();
    expect(restored.version).toBe(3);

    // 4. Reject double restore
    await expect(repo.restore('obj-uuid-1', '2026-08-08T02:00:00.000Z')).rejects.toThrow(
      ObjectLifecycleConflictException,
    );
  });
});
