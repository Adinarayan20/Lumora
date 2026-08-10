/**
 * ObjectAggregateRepositoryAdapter — REAL PostgreSQL Integration Tests
 *
 * Requires: POSTGRES_INTEGRATION_TEST=true
 * Run via:  POSTGRES_INTEGRATION_TEST=true npx vitest run --config vitest.config.integration.ts
 *
 * All imports are lazy-loaded to prevent module resolution failures
 * when the guard is false and PostgreSQL is unavailable.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { PrismaService } from '../../../prisma.service.js';
import type { ObjectAggregateRepositoryAdapter } from '../../object-aggregate.repository.adapter.js';
import type { PrismaUnitOfWork } from '../../../prisma-unit-of-work.js';
import type { ObjectAggregate } from '../../../../../domain/objects/object.aggregate.js';

const RUN = process.env.POSTGRES_INTEGRATION_TEST === 'true';

describe.runIf(RUN)(
  'ObjectAggregateRepositoryAdapter — REAL PostgreSQL Integration',
  async () => {
    // Lazy imports — only resolved when POSTGRES_INTEGRATION_TEST=true
    const { PrismaService } = await import('../../../prisma.service.js');
    const { ObjectAggregateRepositoryAdapter } =
      await import('../../object-aggregate.repository.adapter.js');
    const { WorkspaceExecutionContext } =
      await import('../../../context/workspace-execution-context.js');
    const { PrismaUnitOfWork } =
      await import('../../../prisma-unit-of-work.js');
    const { UniqueEntityId, ObjectConcurrencyException } =
      await import('@lumora/shared');
    const { ObjectAggregate } =
      await import('../../../../../domain/objects/object.aggregate.js');
    const { ObjectTitle } =
      await import('../../../../../domain/objects/value-objects/object-title.js');
    const { ObjectKey } =
      await import('../../../../../domain/objects/value-objects/object-key.js');
    const { ObjectStatus } =
      await import('../../../../../domain/objects/value-objects/object-status.js');

    let prisma: PrismaService;
    let adapterA: ObjectAggregateRepositoryAdapter;
    let adapterB: ObjectAggregateRepositoryAdapter;
    let uow: PrismaUnitOfWork;

    const wsA = '11111111-aaaa-4111-a111-111111111111';
    const wsB = '22222222-bbbb-4222-a222-222222222222';
    const userA = '33333333-aaaa-4333-a333-333333333333';
    const userB = '44444444-bbbb-4444-a444-444444444444';

    beforeAll(async () => {
      prisma = new PrismaService();
      await prisma.$connect();
      uow = new PrismaUnitOfWork(prisma);
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    beforeEach(async () => {
      await prisma.object.deleteMany({
        where: { workspaceId: { in: [wsA, wsB] } },
      });
      await prisma.outboxMessage.deleteMany({
        where: { workspaceId: { in: [wsA, wsB] } },
      });

      const ctxA = new WorkspaceExecutionContext(wsA, userA);
      const ctxB = new WorkspaceExecutionContext(wsB, userB);
      adapterA = new ObjectAggregateRepositoryAdapter(prisma, ctxA);
      adapterB = new ObjectAggregateRepositoryAdapter(prisma, ctxB);
    });

    function makeAggregate(
      wsId: string,
      userId: string,
      id?: string,
    ): ObjectAggregate {
      return ObjectAggregate.create({
        id: id ? new UniqueEntityId(id) : undefined,
        workspaceId: new UniqueEntityId(wsId),
        createdById: new UniqueEntityId(userId),
        objectKey: ObjectKey.create(),
        typeKey: 'NOTE',
        title: ObjectTitle.create('Test Note'),
        attributes: {},
      });
    }

    it('saves and retrieves aggregate with all domain fields intact', async () => {
      const agg = makeAggregate(wsA, userA);
      await adapterA.save(agg);
      const fetched = await adapterA.findById(agg.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.title.toValue()).toBe('Test Note');
      expect(fetched!.revision).toBe(1);
      expect(fetched!.status).toBe(ObjectStatus.ACTIVE);
    });

    it('enforces workspace isolation', async () => {
      const agg = makeAggregate(wsA, userA);
      await adapterA.save(agg);
      const fromB = await adapterB.findById(agg.id);
      expect(fromB).toBeNull();
    });

    it('CAS update increments revision', async () => {
      const agg = makeAggregate(wsA, userA);
      await adapterA.save(agg);
      agg.updateDetails(
        new UniqueEntityId(userA),
        ObjectTitle.create('Updated Title'),
        'desc',
        { count: 42 },
      );
      await adapterA.save(agg);
      const fetched = await adapterA.findById(agg.id);
      expect(fetched!.revision).toBe(2);
      expect(fetched!.title.toValue()).toBe('Updated Title');
    });

    it('concurrent CAS: exactly one writer wins', async () => {
      const id = '55555555-ffff-4555-a555-555555555555';
      const agg = makeAggregate(wsA, userA, id);
      await adapterA.save(agg);
      const ctxA2 = new WorkspaceExecutionContext(wsA, userA);
      const adapterA2 = new ObjectAggregateRepositoryAdapter(prisma, ctxA2);
      const r1 = await adapterA.findById(new UniqueEntityId(id));
      const r2 = await adapterA2.findById(new UniqueEntityId(id));
      r1!.updateDetails(
        new UniqueEntityId(userA),
        ObjectTitle.create('Writer A'),
        undefined,
        {},
      );
      r2!.updateDetails(
        new UniqueEntityId(userA),
        ObjectTitle.create('Writer B'),
        undefined,
        {},
      );
      const results = await Promise.allSettled([
        adapterA.save(r1!),
        adapterA2.save(r2!),
      ]);
      expect(results.filter((r) => r.status === 'fulfilled').length).toBe(1);
      expect(results.filter((r) => r.status === 'rejected').length).toBe(1);
      expect(
        (results.find((r) => r.status === 'rejected') as PromiseRejectedResult)
          .reason,
      ).toBeInstanceOf(ObjectConcurrencyException);
    });

    it('soft delete: findById returns null after delete', async () => {
      const agg = makeAggregate(wsA, userA);
      await adapterA.save(agg);
      await adapterA.delete(agg.id);
      expect(await adapterA.findById(agg.id)).toBeNull();
    });

    it('findPaginated returns workspace-scoped cursor page', async () => {
      for (let i = 0; i < 3; i++)
        await adapterA.save(makeAggregate(wsA, userA));
      await adapterB.save(makeAggregate(wsB, userB));
      const page = await adapterA.findPaginated(
        { first: 2 },
        { workspaceId: new UniqueEntityId(wsA) },
      );
      expect(page.items.length).toBe(2);
      expect(page.pageInfo.hasNextPage).toBe(true);
      page.items.forEach((item) =>
        expect(item.workspaceId.toValue()).toBe(wsA),
      );
    });

    it('UnitOfWork: transaction rollback removes object', async () => {
      const agg = makeAggregate(wsA, userA);
      await expect(
        uow.execute(async () => {
          await prisma.object.create({
            data: {
              id: agg.id.toValue(),
              workspaceId: wsA,
              createdById: userA,
              updatedById: userA,
              objectKey: agg.objectKey.toValue(),
              typeKey: 'NOTE',
              title: 'Rollback Test',
              schemaVersion: 1,
              status: 'ACTIVE',
              attributes: {},
              revision: 1,
            },
          });
          throw new Error('Forced rollback');
        }),
      ).rejects.toThrow('Forced rollback');
      expect(
        await prisma.object.findUnique({ where: { id: agg.id.toValue() } }),
      ).toBeNull();
    });
  },
);
