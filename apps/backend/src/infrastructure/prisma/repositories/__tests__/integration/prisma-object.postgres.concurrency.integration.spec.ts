import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaService } from '../../../prisma.service.js';
import { PrismaObjectRepository } from '../../prisma-object.repository.js';
import { WorkspaceExecutionContext } from '../../../context/workspace-execution-context.js';
import type { UniversalObject } from '@lumora/shared';
import {
  ObjectStatus,
  ObjectConcurrencyException,
  ObjectLifecycleConflictException,
} from '@lumora/shared';

const isPostgresIntegrationTestEnabled =
  process.env.POSTGRES_INTEGRATION_TEST === 'true';

describe.runIf(isPostgresIntegrationTestEnabled)(
  'PrismaObjectRepository REAL PostgreSQL Integration & Concurrency Spec',
  () => {
    let prisma: PrismaService;
    let repoA: PrismaObjectRepository;
    let repoB: PrismaObjectRepository;

    const workspaceIdA = '11111111-1111-4111-a111-111111111111';
    const workspaceIdB = '22222222-2222-4222-a222-222222222222';
    const userIdA = '33333333-3333-4333-a333-333333333333';
    const userIdB = '44444444-4444-4444-a444-444444444444';

    const contextA = new WorkspaceExecutionContext(workspaceIdA, userIdA);
    const contextB = new WorkspaceExecutionContext(workspaceIdB, userIdB);

    beforeAll(async () => {
      prisma = new PrismaService();
      await prisma.$connect();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    beforeEach(async () => {
      // Clean up test workspace data
      await prisma.object.deleteMany({
        where: {
          workspaceId: { in: [workspaceIdA, workspaceIdB] },
        },
      });

      repoA = new PrismaObjectRepository(prisma, contextA);
      repoB = new PrismaObjectRepository(prisma, contextB);
    });

    it('executes genuine concurrent atomic CAS updates where exactly 1 succeeds and 1 fails with ObjectConcurrencyException', async () => {
      const initialObject: UniversalObject = {
        id: '55555555-5555-4555-a555-555555555555',
        typeKey: 'note',
        schemaVersion: 1,
        status: ObjectStatus.ACTIVE,
        attributes: { title: 'Initial Title', versionCounter: 1 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      // 1. Create initial object (version 1)
      const created = await repoA.create(initialObject);
      expect(created.version).toBe(1);

      // 2. Prepare two competing mutations targeting version 1
      const mutationA: UniversalObject = {
        ...created,
        attributes: { title: 'Title updated by Writer A', versionCounter: 2 },
      };

      const mutationB: UniversalObject = {
        ...created,
        attributes: { title: 'Title updated by Writer B', versionCounter: 2 },
      };

      // 3. Execute both updates concurrently against real PostgreSQL
      const results = await Promise.allSettled([
        repoA.update(mutationA, 1),
        repoA.update(mutationB, 1),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      );

      // 4. Assert CAS Invariant: Exactly one succeeded, exactly one failed
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      // 5. Verify exception type of rejected operation
      const rejectionReason = rejected[0].reason;
      expect(rejectionReason).toBeInstanceOf(ObjectConcurrencyException);

      // 6. Verify stored DB state: revision is 2
      const fetched = await repoA.getById(initialObject.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.version).toBe(2);
    });

    it('guarantees tenant isolation under real PostgreSQL queries', async () => {
      const objectA: UniversalObject = {
        id: '66666666-6666-4666-a666-666666666666',
        typeKey: 'task',
        schemaVersion: 1,
        status: ObjectStatus.ACTIVE,
        attributes: { title: 'Workspace A Private Task' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      await repoA.create(objectA);

      // Tenant B attempts to read Workspace A's object
      const resultB = await repoB.getById(objectA.id);
      expect(resultB).toBeNull();
    });

    it('prevents mutation of archived objects in PostgreSQL', async () => {
      const object: UniversalObject = {
        id: '77777777-7777-4777-a777-777777777777',
        typeKey: 'document',
        schemaVersion: 1,
        status: ObjectStatus.ACTIVE,
        attributes: { title: 'Archived Document Test' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      await repoA.create(object);

      // Archive object
      const nowIso = new Date().toISOString();
      await repoA.archive(object.id, nowIso, nowIso);

      // Attempt update on archived object
      await expect(
        repoA.update(
          {
            ...object,
            attributes: { title: 'Attempted Resurrection' },
          },
          1,
        ),
      ).rejects.toThrow(ObjectLifecycleConflictException);
    });
  },
);
