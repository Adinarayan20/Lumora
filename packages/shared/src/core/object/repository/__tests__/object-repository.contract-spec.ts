import { describe, it, expect, beforeEach } from "vitest";
import type { IObjectRepository } from "../object-repository.interface.js";
import type { UniversalObject } from "../../types/universal-object.types.js";
import { ObjectStatus } from "../../../catalog/object-status.js";
import {
  ObjectNotFoundException,
  ObjectAlreadyExistsException,
  ObjectConcurrencyException,
  ObjectLifecycleConflictException,
  ObjectValidationException,
} from "../../errors/object-runtime-error.js";

export function runObjectRepositoryContractTests(
  createRepository: () => Promise<IObjectRepository> | IObjectRepository,
): void {
  describe("Universal Object Repository Behavioral Contract Suite", () => {
    let repo: IObjectRepository;

    const sampleObject: UniversalObject = {
      id: "22222222-2222-4222-a222-222222222222",
      typeKey: "task",
      schemaVersion: 1,
      status: ObjectStatus.ACTIVE,
      attributes: {
        title: "Contract Task",
        priority: 0,
        isDone: false,
        notes: "",
        optionalNull: null,
        nested: { count: 42, tags: ["contract", "test"] },
      },
      createdAt: "2026-08-08T12:00:00.000Z",
      updatedAt: "2026-08-08T12:00:00.000Z",
      version: 1,
    };

    beforeEach(async () => {
      repo = await createRepository();
    });

    it("creates and retrieves a Universal Object cleanly by ID", async () => {
      const created = await repo.create(sampleObject);
      expect(created.id).toBe(sampleObject.id);
      expect(created.status).toBe(ObjectStatus.ACTIVE);

      const fetched = await repo.getById(sampleObject.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(sampleObject.id);
      expect(fetched?.attributes.title).toBe("Contract Task");
    });

    it('preserves falsy attribute values (0, false, "", null)', async () => {
      const created = await repo.create(sampleObject);
      expect(created.attributes.priority).toBe(0);
      expect(created.attributes.isDone).toBe(false);
      expect(created.attributes.notes).toBe("");
      expect(created.attributes.optionalNull).toBeNull();
    });

    it("rejects creation of duplicate object ID with ObjectAlreadyExistsException", async () => {
      await repo.create(sampleObject);
      await expect(repo.create(sampleObject)).rejects.toThrow(
        ObjectAlreadyExistsException,
      );
    });

    it("enforces expectedVersion atomic compare-and-swap CAS checks during update", async () => {
      await repo.create(sampleObject);

      const updated = await repo.update(
        {
          ...sampleObject,
          attributes: { title: "Updated Title" },
          updatedAt: "2026-08-08T13:00:00.000Z",
        },
        1, // expectedVersion = 1
      );
      expect(updated.version).toBe(2);

      await expect(
        repo.update(
          {
            ...sampleObject,
            attributes: { title: "Stale Update" },
          },
          1, // Stale version 1
        ),
      ).rejects.toThrow(ObjectConcurrencyException);
    });

    it("handles archive and restore lifecycle state transitions deterministically", async () => {
      await repo.create(sampleObject);

      const archived = await repo.archive(
        sampleObject.id,
        "2026-08-08T14:00:00.000Z",
        "2026-08-08T14:00:00.000Z",
      );
      expect(archived.status).toBe(ObjectStatus.ARCHIVED);
      expect(archived.archivedAt).toBe("2026-08-08T14:00:00.000Z");

      await expect(
        repo.archive(
          sampleObject.id,
          "2026-08-08T14:00:00.000Z",
          "2026-08-08T14:00:00.000Z",
        ),
      ).rejects.toThrow(ObjectLifecycleConflictException);

      const restored = await repo.restore(
        sampleObject.id,
        "2026-08-08T15:00:00.000Z",
      );
      expect(restored.status).toBe(ObjectStatus.ACTIVE);
      expect(restored.archivedAt).toBeUndefined();
    });

    it("validates pagination offset and limit inputs strictly", async () => {
      await repo.create(sampleObject);
      const list = await repo.list({ offset: 0, limit: 10 });
      expect(list.length).toBe(1);

      await expect(repo.list({ offset: -1 })).rejects.toThrow(
        ObjectValidationException,
      );
      await expect(repo.list({ limit: -5 })).rejects.toThrow(
        ObjectValidationException,
      );
    });
  });
}

describe("InMemoryObjectRepository Behavioral Contract Compliance", () => {
  const {
    InMemoryObjectRepository,
  } = require("../in-memory-object-repository.js");
  runObjectRepositoryContractTests(() => new InMemoryObjectRepository());
});
