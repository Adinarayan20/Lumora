import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaObjectRepository } from '../prisma-object.repository.js';
import { WorkspaceExecutionContext } from '../../context/workspace-execution-context.js';
import type { PrismaService } from '../../prisma.service.js';
import type { UniversalObject } from '@lumora/shared';
import {
  ObjectStatus,
  ObjectAlreadyExistsException,
  ObjectConcurrencyException,
  ObjectLifecycleConflictException,
  ObjectValidationException,
} from '@lumora/shared';
import { ObjectStatus as PrismaObjectStatus } from '../../../../generated/prisma/client.js';

describe('PrismaObjectRepository Foundation (Phase E.1)', () => {
  let repository: PrismaObjectRepository;
  let mockPrisma: {
    object: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirstOrThrow: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };
  let context: WorkspaceExecutionContext;

  const sampleUniversalObject: UniversalObject = {
    id: '11111111-1111-4111-a111-111111111111',
    typeKey: 'task',
    schemaVersion: 1,
    status: ObjectStatus.ACTIVE,
    attributes: {
      name: 'Phase E Test Task',
      priority: 0,
      isDone: false,
      notes: '',
      optionalNull: null,
      nested: { a: 1 },
    },
    createdAt: '2026-08-08T10:00:00.000Z',
    updatedAt: '2026-08-08T10:00:00.000Z',
    version: 1,
  };

  const samplePrismaModel = {
    id: '11111111-1111-4111-a111-111111111111',
    workspaceId: 'w-100',
    createdById: 'u-200',
    updatedById: 'u-200',
    objectKey: '11111111-1111-4111-a111-111111111111',
    typeKey: 'task',
    title: 'Phase E Test Task',
    schemaVersion: 1,
    status: PrismaObjectStatus.ACTIVE,
    attributes: {
      name: 'Phase E Test Task',
      priority: 0,
      isDone: false,
      notes: '',
      optionalNull: null,
      nested: { a: 1 },
    },
    revision: 1,
    archivedAt: null,
    deletedAt: null,
    createdAt: new Date('2026-08-08T10:00:00.000Z'),
    updatedAt: new Date('2026-08-08T10:00:00.000Z'),
  };

  beforeEach(() => {
    context = new WorkspaceExecutionContext('w-100', 'u-200');

    mockPrisma = {
      object: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findFirstOrThrow: vi.fn(),
        create: vi.fn(),
        updateMany: vi.fn(),
        findMany: vi.fn(),
      },
    };

    repository = new PrismaObjectRepository(
      mockPrisma as unknown as PrismaService,
      context,
    );
  });

  it('implements getById with strict workspace scoping', async () => {
    mockPrisma.object.findFirst.mockResolvedValue(samplePrismaModel);

    const result = await repository.getById(
      '11111111-1111-4111-a111-111111111111',
    );

    expect(result).not.toBeNull();
    expect(result?.id).toBe(sampleUniversalObject.id);
    expect(mockPrisma.object.findFirst).toHaveBeenCalledWith({
      where: {
        id: '11111111-1111-4111-a111-111111111111',
        workspaceId: 'w-100', // Enforces workspace isolation!
        status: { not: PrismaObjectStatus.DELETED },
      },
    });
  });

  it('creates Universal Object and maps falsy attributes correctly', async () => {
    mockPrisma.object.findUnique.mockResolvedValue(null);
    mockPrisma.object.create.mockResolvedValue(samplePrismaModel);

    const created = await repository.create(sampleUniversalObject);

    expect(created.attributes.priority).toBe(0);
    expect(created.attributes.isDone).toBe(false);
    expect(created.attributes.notes).toBe('');
    expect(created.attributes.optionalNull).toBeNull();

    expect(mockPrisma.object.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: 'w-100',
        createdById: 'u-200',
        revision: 1,
      }),
    });
  });

  it('rejects duplicate object ID on create with ObjectAlreadyExistsException', async () => {
    mockPrisma.object.findUnique.mockResolvedValue(samplePrismaModel);

    await expect(repository.create(sampleUniversalObject)).rejects.toThrow(
      ObjectAlreadyExistsException,
    );
  });

  it('rejects BigInt attributes during serialization boundary check', async () => {
    const invalidObj: UniversalObject = {
      ...sampleUniversalObject,
      attributes: {
        invalidBigInt: BigInt(99999),
      },
    };

    mockPrisma.object.findUnique.mockResolvedValue(null);

    await expect(repository.create(invalidObj)).rejects.toThrow(
      ObjectValidationException,
    );
  });

  it('enforces atomic CAS expectedVersion update and increments revision', async () => {
    mockPrisma.object.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.object.findFirstOrThrow.mockResolvedValue({
      ...samplePrismaModel,
      revision: 2,
      updatedAt: new Date('2026-08-08T11:00:00.000Z'),
    });

    const updated = await repository.update(
      {
        ...sampleUniversalObject,
        updatedAt: '2026-08-08T11:00:00.000Z',
      },
      1, // expectedVersion = 1
    );

    expect(updated.version).toBe(2);
    expect(mockPrisma.object.updateMany).toHaveBeenCalledWith({
      where: {
        id: sampleUniversalObject.id,
        workspaceId: 'w-100',
        revision: 1, // CAS condition
        status: PrismaObjectStatus.ACTIVE,
      },
      data: expect.objectContaining({
        revision: 2, // newVersion = expectedVersion + 1
      }),
    });
  });

  it('throws ObjectConcurrencyException on expectedVersion mismatch', async () => {
    mockPrisma.object.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.object.findFirst.mockResolvedValue({
      ...samplePrismaModel,
      revision: 5, // Stale!
    });

    await expect(
      repository.update(sampleUniversalObject, 1), // Expecting 1, but stored is 5!
    ).rejects.toThrow(ObjectConcurrencyException);
  });

  it('enforces anti-resurrection lifecycle guard when updating inactive object', async () => {
    mockPrisma.object.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.object.findFirst.mockResolvedValue({
      ...samplePrismaModel,
      status: PrismaObjectStatus.ARCHIVED, // Inactive!
    });

    await expect(repository.update(sampleUniversalObject, 1)).rejects.toThrow(
      ObjectLifecycleConflictException,
    );
  });
});
