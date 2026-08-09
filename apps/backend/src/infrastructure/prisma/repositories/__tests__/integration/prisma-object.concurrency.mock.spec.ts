import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaObjectRepository } from '../../prisma-object.repository.js';
import { WorkspaceExecutionContext } from '../../../context/workspace-execution-context.js';
import type { PrismaService } from '../../../prisma.service.js';
import type { UniversalObject } from '@lumora/shared';
import {
  ObjectStatus,
  ObjectConcurrencyException,
  ObjectLifecycleConflictException,
  ObjectNotFoundException,
} from '@lumora/shared';

describe('PrismaObjectRepository Unit & Mock CAS Concurrency Spec', () => {
  let repositoryA: PrismaObjectRepository;
  let repositoryB: PrismaObjectRepository;
  let mockPrisma: {
    object: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirstOrThrow: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    $queryRaw: ReturnType<typeof vi.fn>;
  };
  let contextA: WorkspaceExecutionContext;
  let contextB: WorkspaceExecutionContext;

  const objectA: UniversalObject = {
    id: '33333333-3333-4333-a333-333333333333',
    typeKey: 'note',
    schemaVersion: 1,
    status: ObjectStatus.ACTIVE,
    attributes: { title: 'Workspace A Note', count: 1 },
    createdAt: '2026-08-08T12:00:00.000Z',
    updatedAt: '2026-08-08T12:00:00.000Z',
    version: 1,
  };

  const prismaModelA = {
    id: '33333333-3333-4333-a333-333333333333',
    workspaceId: 'workspace-A',
    createdById: 'user-A',
    updatedById: 'user-A',
    objectKey: '33333333-3333-4333-a333-333333333333',
    typeKey: 'note',
    title: 'Workspace A Note',
    schemaVersion: 1,
    status: 'ACTIVE',
    attributes: { title: 'Workspace A Note', count: 1 },
    revision: 1,
    archivedAt: null,
    deletedAt: null,
    createdAt: new Date('2026-08-08T12:00:00.000Z'),
    updatedAt: new Date('2026-08-08T12:00:00.000Z'),
  };

  beforeEach(() => {
    contextA = new WorkspaceExecutionContext('workspace-A', 'user-A');
    contextB = new WorkspaceExecutionContext('workspace-B', 'user-B');

    mockPrisma = {
      object: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findFirstOrThrow: vi.fn(),
        create: vi.fn(),
        updateMany: vi.fn(),
        findMany: vi.fn(),
      },
      $queryRaw: vi.fn(),
    };

    repositoryA = new PrismaObjectRepository(
      mockPrisma as unknown as PrismaService,
      contextA,
    );
    repositoryB = new PrismaObjectRepository(
      mockPrisma as unknown as PrismaService,
      contextB,
    );
  });

  it('guarantees tenant isolation so Workspace B cannot access Workspace A object', async () => {
    mockPrisma.object.findFirst.mockResolvedValue(null);

    const result = await repositoryB.getById(objectA.id);

    expect(result).toBeNull();
    expect(mockPrisma.object.findFirst).toHaveBeenCalledWith({
      where: {
        id: objectA.id,
        workspaceId: 'workspace-B', // Isolated to Workspace B!
        status: { not: 'DELETED' },
      },
    });
  });

  it('executes atomic SQL UPDATE RETURNING for CAS mutations eliminating read-after-write window', async () => {
    const updatedPrismaModel = {
      ...prismaModelA,
      revision: 2,
      attributes: { title: 'Updated Title', count: 2 },
      updatedAt: new Date('2026-08-08T13:00:00.000Z'),
    };

    mockPrisma.$queryRaw.mockResolvedValue([updatedPrismaModel]);

    const updated = await repositoryA.update(
      {
        ...objectA,
        attributes: { title: 'Updated Title', count: 2 },
        updatedAt: '2026-08-08T13:00:00.000Z',
      },
      1, // expectedVersion = 1
    );

    expect(updated.version).toBe(2);
    expect(updated.attributes.title).toBe('Updated Title');
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('handles simulated concurrent CAS race condition where second attempt receives ObjectConcurrencyException', async () => {
    // Attempt 1 succeeds via SQL RETURNING
    mockPrisma.$queryRaw.mockResolvedValueOnce([
      {
        ...prismaModelA,
        revision: 2,
        updatedAt: new Date('2026-08-08T13:00:00.000Z'),
      },
    ]);

    const result1 = await repositoryA.update(objectA, 1);
    expect(result1.version).toBe(2);

    // Attempt 2 fails because revision is now 2 (0 rows returned)
    mockPrisma.$queryRaw.mockResolvedValueOnce([]);
    mockPrisma.object.findFirst.mockResolvedValueOnce({
      ...prismaModelA,
      revision: 2, // Stale!
    });

    await expect(repositoryA.update(objectA, 1)).rejects.toThrow(
      ObjectConcurrencyException,
    );
  });

  it('prevents anti-resurrection when attempting to update an archived object', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([]);
    mockPrisma.object.findFirst.mockResolvedValueOnce({
      ...prismaModelA,
      status: 'ARCHIVED', // Inactive status!
    });

    await expect(repositoryA.update(objectA, 1)).rejects.toThrow(
      ObjectLifecycleConflictException,
    );
  });

  it('throws ObjectNotFoundException when targeting non-existent object', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([]);
    mockPrisma.object.findFirst.mockResolvedValueOnce(null);

    await expect(repositoryA.update(objectA, 1)).rejects.toThrow(
      ObjectNotFoundException,
    );
  });
});
