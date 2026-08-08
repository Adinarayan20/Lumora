import type {
  IObjectRepository,
  UniversalObject,
  ObjectFilterOptions,
} from '@lumora/shared';
import {
  ObjectNotFoundException,
  ObjectAlreadyExistsException,
  ObjectConcurrencyException,
  ObjectLifecycleConflictException,
  ObjectValidationException,
} from '@lumora/shared';
import type { PrismaService } from '../prisma.service.js';
import { WorkspaceExecutionContext } from '../context/workspace-execution-context.js';
import { PrismaObjectMapper } from '../mappers/prisma-object.mapper.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import {
  Prisma,
  ObjectStatus as PrismaObjectStatus,
  Object as PrismaObject,
} from '../../../generated/prisma/client.js';
import type { ITransactionContext } from '../../../domain/common/unit-of-work/transaction-context.interface.js';
import { PrismaTransactionContext } from '../prisma-unit-of-work.js';

type PrismaClientOrTx = PrismaService | Prisma.TransactionClient;

export class PrismaObjectRepository implements IObjectRepository {
  constructor(
    private readonly prisma: PrismaClientOrTx,
    private readonly context: WorkspaceExecutionContext,
  ) {}

  private get db(): Prisma.TransactionClient {
    if ('client' in this.prisma && this.prisma.client) {
      return this.prisma.client as unknown as Prisma.TransactionClient;
    }
    return this.prisma;
  }

  /**
   * Returns a transaction-bound instance of PrismaObjectRepository operating within the specified UnitOfWork transaction context.
   * Does NOT alter the authoritative domain port interface.
   */
  public withTransaction(
    txContext: ITransactionContext,
  ): PrismaObjectRepository {
    if (
      txContext instanceof PrismaTransactionContext &&
      txContext.prismaTransaction
    ) {
      return new PrismaObjectRepository(
        txContext.prismaTransaction as Prisma.TransactionClient,
        this.context,
      );
    }
    return this;
  }

  public async getById(id: string): Promise<UniversalObject | null> {
    try {
      const model = await this.db.object.findFirst({
        where: {
          id,
          workspaceId: this.context.workspaceId,
          status: { not: PrismaObjectStatus.DELETED },
        },
      });
      return model ? PrismaObjectMapper.toDomain(model) : null;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'UniversalObject');
    }
  }

  public async create(object: UniversalObject): Promise<UniversalObject> {
    try {
      // Check for ID duplicate within workspace
      const existing = await this.db.object.findUnique({
        where: { id: object.id },
      });
      if (existing) {
        throw new ObjectAlreadyExistsException(object.id);
      }

      const serializedAttributes = PrismaObjectMapper.serializeAttributes(
        object.attributes,
      );

      const createdModel = await this.db.object.create({
        data: {
          id: object.id,
          workspaceId: this.context.workspaceId,
          createdById: this.context.userId,
          updatedById: this.context.userId,
          objectKey: object.id, // Immutable objectKey
          typeKey: object.typeKey,
          title:
            (object.attributes.name as string) ||
            (object.attributes.title as string) ||
            object.typeKey,
          schemaVersion: object.schemaVersion,
          status: object.status,
          attributes: serializedAttributes,
          revision: 1, // Creation version always starts at 1
          createdAt: new Date(object.createdAt),
          updatedAt: new Date(object.updatedAt),
        },
      });

      return PrismaObjectMapper.toDomain(createdModel);
    } catch (error) {
      if (
        error instanceof ObjectAlreadyExistsException ||
        error instanceof ObjectValidationException
      ) {
        throw error;
      }
      throw PrismaExceptionMapper.toDomainException(error, 'UniversalObject');
    }
  }

  public async update(
    object: UniversalObject,
    expectedVersion?: number,
  ): Promise<UniversalObject> {
    try {
      const serializedAttributes = PrismaObjectMapper.serializeAttributes(
        object.attributes,
      );

      if (expectedVersion !== undefined) {
        // Atomic CAS update using raw SQL RETURNING to eliminate read-after-write race condition
        if ('$queryRaw' in this.db && typeof this.db.$queryRaw === 'function') {
          const rows = await this.db.$queryRaw<PrismaObject[]>(Prisma.sql`
            UPDATE "Object"
            SET
              "typeKey" = ${object.typeKey},
              "schemaVersion" = ${object.schemaVersion},
              "attributes" = ${JSON.stringify(serializedAttributes)}::jsonb,
              "updatedById" = ${this.context.userId}::uuid,
              "revision" = ${expectedVersion + 1},
              "updatedAt" = ${new Date(object.updatedAt)}
            WHERE "id" = ${object.id}::uuid
              AND "workspaceId" = ${this.context.workspaceId}::uuid
              AND "revision" = ${expectedVersion}
              AND "status" = 'ACTIVE'::"ObjectStatus"
            RETURNING *;
          `);

          if (Array.isArray(rows) && rows.length > 0) {
            return PrismaObjectMapper.toDomain(rows[0]);
          }
        } else {
          // Fallback for mocked environment without $queryRaw
          const result = await this.db.object.updateMany({
            where: {
              id: object.id,
              workspaceId: this.context.workspaceId,
              revision: expectedVersion,
              status: PrismaObjectStatus.ACTIVE,
            },
            data: {
              typeKey: object.typeKey,
              schemaVersion: object.schemaVersion,
              attributes: serializedAttributes,
              updatedById: this.context.userId,
              revision: expectedVersion + 1,
              updatedAt: new Date(object.updatedAt),
            },
          });

          if (result.count > 0) {
            const updatedModel = await this.db.object.findFirstOrThrow({
              where: { id: object.id, workspaceId: this.context.workspaceId },
            });
            return PrismaObjectMapper.toDomain(updatedModel);
          }
        }

        // Zero rows updated: Distinguish ObjectNotFound vs ObjectConcurrencyException vs Lifecycle Conflict
        const existing = await this.db.object.findFirst({
          where: { id: object.id, workspaceId: this.context.workspaceId },
        });

        if (!existing) {
          throw new ObjectNotFoundException(object.id);
        }

        if (existing.status !== PrismaObjectStatus.ACTIVE) {
          throw new ObjectLifecycleConflictException(
            object.id,
            existing.status,
            'update_attributes_on_inactive_object',
          );
        }

        throw new ObjectConcurrencyException(
          object.id,
          expectedVersion,
          existing.revision,
        );
      }

      // Unconditional incremental update: locks status = ACTIVE to prevent anti-resurrection
      if ('$queryRaw' in this.db && typeof this.db.$queryRaw === 'function') {
        const rows = await this.db.$queryRaw<PrismaObject[]>(Prisma.sql`
          UPDATE "Object"
          SET
            "typeKey" = ${object.typeKey},
            "schemaVersion" = ${object.schemaVersion},
            "attributes" = ${JSON.stringify(serializedAttributes)}::jsonb,
            "updatedById" = ${this.context.userId}::uuid,
            "revision" = "revision" + 1,
            "updatedAt" = ${new Date(object.updatedAt)}
          WHERE "id" = ${object.id}::uuid
            AND "workspaceId" = ${this.context.workspaceId}::uuid
            AND "status" = 'ACTIVE'::"ObjectStatus"
          RETURNING *;
        `);

        if (Array.isArray(rows) && rows.length > 0) {
          return PrismaObjectMapper.toDomain(rows[0]);
        }
      } else {
        const result = await this.db.object.updateMany({
          where: {
            id: object.id,
            workspaceId: this.context.workspaceId,
            status: PrismaObjectStatus.ACTIVE,
          },
          data: {
            typeKey: object.typeKey,
            schemaVersion: object.schemaVersion,
            attributes: serializedAttributes,
            updatedById: this.context.userId,
            revision: { increment: 1 },
            updatedAt: new Date(object.updatedAt),
          },
        });

        if (result.count > 0) {
          const updatedModel = await this.db.object.findFirstOrThrow({
            where: { id: object.id, workspaceId: this.context.workspaceId },
          });
          return PrismaObjectMapper.toDomain(updatedModel);
        }
      }

      const existing = await this.db.object.findFirst({
        where: { id: object.id, workspaceId: this.context.workspaceId },
      });

      if (!existing) {
        throw new ObjectNotFoundException(object.id);
      }

      throw new ObjectLifecycleConflictException(
        object.id,
        existing.status,
        'update_attributes_on_inactive_object',
      );
    } catch (error) {
      if (
        error instanceof ObjectNotFoundException ||
        error instanceof ObjectConcurrencyException ||
        error instanceof ObjectLifecycleConflictException ||
        error instanceof ObjectValidationException
      ) {
        throw error;
      }
      throw PrismaExceptionMapper.toDomainException(error, 'UniversalObject');
    }
  }

  public async list(
    options?: ObjectFilterOptions,
  ): Promise<readonly UniversalObject[]> {
    try {
      if (options?.offset !== undefined) {
        if (
          typeof options.offset !== 'number' ||
          Number.isNaN(options.offset) ||
          !Number.isInteger(options.offset) ||
          options.offset < 0
        ) {
          throw new ObjectValidationException(
            `Invalid offset '${options.offset}': must be a non-negative integer.`,
          );
        }
      }

      if (options?.limit !== undefined) {
        if (
          typeof options.limit !== 'number' ||
          Number.isNaN(options.limit) ||
          !Number.isInteger(options.limit) ||
          options.limit < 0
        ) {
          throw new ObjectValidationException(
            `Invalid limit '${options.limit}': must be a non-negative integer.`,
          );
        }
      }

      const where: Prisma.ObjectWhereInput = {
        workspaceId: this.context.workspaceId,
        status: options?.status
          ? options.status
          : { not: PrismaObjectStatus.DELETED },
      };

      if (options?.typeKey) {
        where.typeKey = options.typeKey;
      }

      const models = await this.db.object.findMany({
        where,
        skip: options?.offset,
        take: options?.limit,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      });

      return Object.freeze(
        models.map((m: PrismaObject) => PrismaObjectMapper.toDomain(m)),
      );
    } catch (error) {
      if (error instanceof ObjectValidationException) {
        throw error;
      }
      throw PrismaExceptionMapper.toDomainException(error, 'UniversalObject');
    }
  }

  public async archive(
    id: string,
    archivedAtIso: string,
    updatedAtIso: string,
  ): Promise<UniversalObject> {
    try {
      if ('$queryRaw' in this.db && typeof this.db.$queryRaw === 'function') {
        const rows = await this.db.$queryRaw<PrismaObject[]>(Prisma.sql`
          UPDATE "Object"
          SET
            "status" = 'ARCHIVED'::"ObjectStatus",
            "archivedAt" = ${new Date(archivedAtIso)},
            "updatedAt" = ${new Date(updatedAtIso)},
            "updatedById" = ${this.context.userId}::uuid,
            "revision" = "revision" + 1
          WHERE "id" = ${id}::uuid
            AND "workspaceId" = ${this.context.workspaceId}::uuid
            AND "status" = 'ACTIVE'::"ObjectStatus"
          RETURNING *;
        `);

        if (Array.isArray(rows) && rows.length > 0) {
          return PrismaObjectMapper.toDomain(rows[0]);
        }
      } else {
        const result = await this.db.object.updateMany({
          where: {
            id,
            workspaceId: this.context.workspaceId,
            status: PrismaObjectStatus.ACTIVE,
          },
          data: {
            status: PrismaObjectStatus.ARCHIVED,
            archivedAt: new Date(archivedAtIso),
            updatedAt: new Date(updatedAtIso),
            updatedById: this.context.userId,
            revision: { increment: 1 },
          },
        });

        if (result.count > 0) {
          const updatedModel = await this.db.object.findFirstOrThrow({
            where: { id, workspaceId: this.context.workspaceId },
          });
          return PrismaObjectMapper.toDomain(updatedModel);
        }
      }

      const existing = await this.db.object.findFirst({
        where: { id, workspaceId: this.context.workspaceId },
      });

      if (!existing) {
        throw new ObjectNotFoundException(id);
      }

      throw new ObjectLifecycleConflictException(
        id,
        existing.status,
        'archive',
      );
    } catch (error) {
      if (
        error instanceof ObjectNotFoundException ||
        error instanceof ObjectLifecycleConflictException
      ) {
        throw error;
      }
      throw PrismaExceptionMapper.toDomainException(error, 'UniversalObject');
    }
  }

  public async restore(
    id: string,
    updatedAtIso: string,
  ): Promise<UniversalObject> {
    try {
      if ('$queryRaw' in this.db && typeof this.db.$queryRaw === 'function') {
        const rows = await this.db.$queryRaw<PrismaObject[]>(Prisma.sql`
          UPDATE "Object"
          SET
            "status" = 'ACTIVE'::"ObjectStatus",
            "archivedAt" = NULL,
            "updatedAt" = ${new Date(updatedAtIso)},
            "updatedById" = ${this.context.userId}::uuid,
            "revision" = "revision" + 1
          WHERE "id" = ${id}::uuid
            AND "workspaceId" = ${this.context.workspaceId}::uuid
            AND "status" = 'ARCHIVED'::"ObjectStatus"
          RETURNING *;
        `);

        if (Array.isArray(rows) && rows.length > 0) {
          return PrismaObjectMapper.toDomain(rows[0]);
        }
      } else {
        const result = await this.db.object.updateMany({
          where: {
            id,
            workspaceId: this.context.workspaceId,
            status: PrismaObjectStatus.ARCHIVED,
          },
          data: {
            status: PrismaObjectStatus.ACTIVE,
            archivedAt: null,
            updatedAt: new Date(updatedAtIso),
            updatedById: this.context.userId,
            revision: { increment: 1 },
          },
        });

        if (result.count > 0) {
          const updatedModel = await this.db.object.findFirstOrThrow({
            where: { id, workspaceId: this.context.workspaceId },
          });
          return PrismaObjectMapper.toDomain(updatedModel);
        }
      }

      const existing = await this.db.object.findFirst({
        where: { id, workspaceId: this.context.workspaceId },
      });

      if (!existing) {
        throw new ObjectNotFoundException(id);
      }

      throw new ObjectLifecycleConflictException(
        id,
        existing.status,
        'restore',
      );
    } catch (error) {
      if (
        error instanceof ObjectNotFoundException ||
        error instanceof ObjectLifecycleConflictException
      ) {
        throw error;
      }
      throw PrismaExceptionMapper.toDomainException(error, 'UniversalObject');
    }
  }
}
