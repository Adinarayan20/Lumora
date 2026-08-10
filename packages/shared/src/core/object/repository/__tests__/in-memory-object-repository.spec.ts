import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryObjectRepository } from "../in-memory-object-repository.js";
import type { UniversalObject } from "../../types/universal-object.types.js";
import { ObjectStatus } from "../../../catalog/object-status.js";
import {
  ObjectNotFoundException,
  ObjectAlreadyExistsException,
  ObjectLifecycleConflictException,
  ObjectConcurrencyException,
  ObjectValidationException,
} from "../../errors/object-runtime-error.js";

describe("InMemoryObjectRepository Domain Contract & Micro-Hardening", () => {
  let repo: InMemoryObjectRepository;

  const dummyObject: UniversalObject = {
    id: "obj-uuid-1",
    typeKey: "task",
    schemaVersion: 1,
    status: ObjectStatus.ACTIVE,
    attributes: {
      title: "Test Task",
      priority: 0,
      isDone: false,
      notes: "",
      optionalNull: null,
      nested: { a: 1, b: [10, 20] },
    },
    createdAt: "2026-08-08T00:00:00.000Z",
    updatedAt: "2026-08-08T00:00:00.000Z",
    version: 1,
  };

  beforeEach(() => {
    repo = new InMemoryObjectRepository();
  });

  it("defensively clones stored memory so mutations on fetched objects cannot alter repository state", async () => {
    await repo.create(dummyObject);

    // 1. Fetch object from repo
    const fetched = await repo.getById("obj-uuid-1");
    expect(fetched).not.toBeNull();

    // 2. Attempt to mutate fetched attributes
    const attributes = fetched!.attributes as Record<string, unknown>;
    try {
      (attributes.nested as Record<string, unknown>).a = 999;
    } catch {
      // Ignore frozen object mutation error in strict mode
    }

    // 3. Fetch again and assert repository state remained unchanged!
    const reFetched = await repo.getById("obj-uuid-1");
    expect((reFetched!.attributes.nested as Record<string, unknown>).a).toBe(1);
  });

  it("preserves falsy values 0, false, empty string, null, and nested arrays", async () => {
    const created = await repo.create(dummyObject);
    expect(created.attributes.priority).toBe(0);
    expect(created.attributes.isDone).toBe(false);
    expect(created.attributes.notes).toBe("");
    expect(created.attributes.optionalNull).toBeNull();
    expect(
      Array.isArray((created.attributes.nested as Record<string, unknown>).b),
    ).toBe(true);
  });

  it("enforces expectedVersion atomic compare-and-swap CAS checks during update", async () => {
    await repo.create(dummyObject);

    // 1. Correct expectedVersion succeeds
    const updated = await repo.update(
      {
        ...dummyObject,
        attributes: { title: "Updated Title" },
        version: 2,
      },
      1, // expectedVersion = 1 matches stored version 1!
    );
    expect(updated.version).toBe(2);

    // 2. Stale expectedVersion throws ObjectConcurrencyException
    await expect(
      repo.update(
        {
          ...dummyObject,
          attributes: { title: "Stale Attempt" },
          version: 999,
        },
        1, // Stale version 1 (repository is now at version 2!)
      ),
    ).rejects.toThrow(ObjectConcurrencyException);

    // 3. Assert repository state was NOT mutated by stale update
    const current = await repo.getById("obj-uuid-1");
    expect(current?.attributes.title).toBe("Updated Title");
    expect(current?.version).toBe(2);
  });

  it("validates offset and limit pagination inputs deterministically", async () => {
    await repo.create(dummyObject);

    // 1. Valid offset 0 and positive limit
    const list1 = await repo.list({ offset: 0, limit: 10 });
    expect(list1.length).toBe(1);

    // 2. Limit 0 returns empty list
    const listEmpty = await repo.list({ limit: 0 });
    expect(listEmpty.length).toBe(0);

    // 3. Negative offset rejected
    await expect(repo.list({ offset: -1 })).rejects.toThrow(
      ObjectValidationException,
    );

    // 4. Negative limit rejected
    await expect(repo.list({ limit: -5 })).rejects.toThrow(
      ObjectValidationException,
    );

    // 5. Fractional offset rejected
    await expect(repo.list({ offset: 1.5 })).rejects.toThrow(
      ObjectValidationException,
    );

    // 6. NaN offset rejected
    await expect(repo.list({ offset: NaN })).rejects.toThrow(
      ObjectValidationException,
    );
  });

  it("throws ObjectAlreadyExistsException when creating duplicate ID", async () => {
    await repo.create(dummyObject);
    await expect(repo.create(dummyObject)).rejects.toThrow(
      ObjectAlreadyExistsException,
    );
  });

  it("throws ObjectNotFoundException when updating non-existent object", async () => {
    await expect(repo.update(dummyObject)).rejects.toThrow(
      ObjectNotFoundException,
    );
  });

  it("handles archive and restore lifecycle state transitions deterministically", async () => {
    await repo.create(dummyObject);

    // 1. Archive
    const archived = await repo.archive(
      "obj-uuid-1",
      "2026-08-08T01:00:00.000Z",
      "2026-08-08T01:00:00.000Z",
    );
    expect(archived.status).toBe(ObjectStatus.ARCHIVED);
    expect(archived.archivedAt).toBe("2026-08-08T01:00:00.000Z");

    // 2. Reject double archive
    await expect(
      repo.archive(
        "obj-uuid-1",
        "2026-08-08T01:00:00.000Z",
        "2026-08-08T01:00:00.000Z",
      ),
    ).rejects.toThrow(ObjectLifecycleConflictException);

    // 3. Restore
    const restored = await repo.restore(
      "obj-uuid-1",
      "2026-08-08T02:00:00.000Z",
    );
    expect(restored.status).toBe(ObjectStatus.ACTIVE);
    expect(restored.archivedAt).toBeUndefined();
  });
});
