import { Injectable } from '@nestjs/common';
import {
  UniqueEntityId,
  PaginatedResult,
  PaginationParams,
} from '@lumora/shared';
import {
  ObjectNotFoundException,
  ObjectAlreadyExistsException,
  ObjectConcurrencyException,
  ObjectLifecycleConflictException,
} from '@lumora/shared';
import type {
  IObjectAggregateRepository,
  ObjectFilter,
} from '../../../domain/objects/repositories/object-aggregate.repository.interface.js';
import { ObjectAggregate } from '../../../domain/objects/object.aggregate.js';
import { ObjectTitle } from '../../../domain/objects/value-objects/object-title.js';
import { ObjectKey } from '../../../domain/objects/value-objects/object-key.js';
import type { PrismaService } from '../prisma.service.js';
import { PrismaObjectMapper } from '../mappers/prisma-object.mapper.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import { WorkspaceExecutionContext } from '../context/workspace-execution-context.js';
import {
  Prisma,
  ObjectStatus as PrismaObjectStatus,
  Object as PrismaObject,
} from '../../../generated/prisma/client.js';

/**
 * ObjectAggregateRepositoryAdapter — Tier 2 Repository Implementation
 *
 * Implements IObjectAggregateRepository (the domain aggregate port) so that
 * CreateObjectUseCase and future aggregate-aware use cases can call `.save(aggregate)`.
 *
 * Strategy:
 *   CREATE: single atomic Prisma insert with all domain fields set correctly.
 *   UPDATE: atomic CAS raw SQL UPDATE … WHERE revision = storedRevision RETURNING *
 *           (reuses the same battle-tested pattern as PrismaObjectRepository Tier 1).
 *   READ:   direct Prisma query returning full row for complete ObjectAggregate reconstruction.
 *
 * This adapter does NOT modify IObjectRepository (Tier 1 contract).
 * This adapter does NOT create a competing persistence architecture.
 * The Tier 1 PrismaObjectRepository remains unchanged and authoritative for UniversalObject operations.
 *
 * ADR-016 migration target — fully implemented.
 * Bind via: { provide: OBJECT_REPOSITORY_TOKEN, useClass: ObjectAggregateRepositoryAdapter }
 */
@Injectable()
export class ObjectAggregateRepositoryAdapter implements IObjectAggregateRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: WorkspaceExecutionContext,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // IBaseRepository: findById
  // ─────────────────────────────────────────────────────────────

  public async findById(id: UniqueEntityId): Promise<ObjectAggregate | null> {
    try {
      const row = await this.prisma.object.findFirst({
        where: {
          id: id.toValue(),
          workspaceId: this.context.workspaceId,
          status: { not: PrismaObjectStatus.DELETED },
        },
      });
      return row ? this.rowToAggregate(row) : null;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'ObjectAggregate');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IBaseRepository: save  (new aggregate → insert; existing → CAS update)
  // ─────────────────────────────────────────────────────────────

  public async save(aggregate: ObjectAggregate): Promise<void> {
    try {
      const existingRow = await this.prisma.object.findFirst({
        where: {
          id: aggregate.id.toValue(),
          workspaceId: aggregate.workspaceId.toValue(),
        },
        select: { id: true, revision: true, status: true },
      });

      if (!existingRow) {
        await this.createAggregate(aggregate);
      } else {
        await this.updateAggregate(aggregate, existingRow.revision);
      }
    } catch (error) {
      if (
        error instanceof ObjectAlreadyExistsException ||
        error instanceof ObjectConcurrencyException ||
        error instanceof ObjectLifecycleConflictException ||
        error instanceof ObjectNotFoundException
      ) {
        throw error;
      }
      throw PrismaExceptionMapper.toDomainException(error, 'ObjectAggregate');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IBaseRepository: delete (soft-delete)
  // ─────────────────────────────────────────────────────────────

  public async delete(id: UniqueEntityId): Promise<void> {
    try {
      const result = await this.prisma.object.updateMany({
        where: {
          id: id.toValue(),
          workspaceId: this.context.workspaceId,
          status: { not: PrismaObjectStatus.DELETED },
        },
        data: {
          status: PrismaObjectStatus.DELETED,
          deletedAt: new Date(),
          updatedById: this.context.userId,
          revision: { increment: 1 },
          updatedAt: new Date(),
        },
      });
      if (result.count === 0) {
        throw new ObjectNotFoundException(id.toValue());
      }
    } catch (error) {
      if (error instanceof ObjectNotFoundException) throw error;
      throw PrismaExceptionMapper.toDomainException(error, 'ObjectAggregate');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IBaseRepository: exists
  // ─────────────────────────────────────────────────────────────

  public async exists(id: UniqueEntityId): Promise<boolean> {
    try {
      const count = await this.prisma.object.count({
        where: {
          id: id.toValue(),
          workspaceId: this.context.workspaceId,
          status: { not: PrismaObjectStatus.DELETED },
        },
      });
      return count > 0;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'ObjectAggregate');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IObjectAggregateRepository: findByObjectKey
  // ─────────────────────────────────────────────────────────────

  public async findByObjectKey(
    workspaceId: UniqueEntityId,
    objectKey: ObjectKey,
  ): Promise<ObjectAggregate | null> {
    try {
      const row = await this.prisma.object.findFirst({
        where: {
          workspaceId: workspaceId.toValue(),
          objectKey: objectKey.toValue(),
          status: { not: PrismaObjectStatus.DELETED },
        },
      });
      return row ? this.rowToAggregate(row) : null;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'ObjectAggregate');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IObjectAggregateRepository: existsByObjectKey
  // ─────────────────────────────────────────────────────────────

  public async existsByObjectKey(
    workspaceId: UniqueEntityId,
    objectKey: ObjectKey,
  ): Promise<boolean> {
    try {
      const count = await this.prisma.object.count({
        where: {
          workspaceId: workspaceId.toValue(),
          objectKey: objectKey.toValue(),
        },
      });
      return count > 0;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'ObjectAggregate');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IPaginatedRepository: findPaginated
  // ─────────────────────────────────────────────────────────────

  public async findPaginated(
    params: PaginationParams,
    filter?: ObjectFilter,
  ): Promise<PaginatedResult<ObjectAggregate>> {
    try {
      const pageSize = params.first ?? 50;
      const sortOrder: Prisma.SortOrder =
        params.sortOrder === 'asc' ? 'asc' : 'desc';

      const workspaceId =
        filter?.workspaceId?.toValue() ?? this.context.workspaceId;

      const where: Prisma.ObjectWhereInput = {
        workspaceId,
        status: filter?.status
          ? filter.status
          : { not: PrismaObjectStatus.DELETED },
      };

      if (filter?.spaceId) {
        where.spaceId = filter.spaceId.toValue();
      }
      if (filter?.typeKey) {
        where.typeKey = filter.typeKey;
      }
      if (filter?.isFavorite !== undefined) {
        where.isFavorite = filter.isFavorite;
      }

      // Cursor: base64url-encoded "updatedAt_ISO|id"
      let cursorCondition: Prisma.ObjectWhereInput | undefined;
      if (params.after) {
        const decoded = this.decodeCursor(params.after);
        if (decoded) {
          cursorCondition =
            sortOrder === 'desc'
              ? {
                  OR: [
                    { updatedAt: { lt: decoded.updatedAt } },
                    {
                      updatedAt: { equals: decoded.updatedAt },
                      id: { lt: decoded.id },
                    },
                  ],
                }
              : {
                  OR: [
                    { updatedAt: { gt: decoded.updatedAt } },
                    {
                      updatedAt: { equals: decoded.updatedAt },
                      id: { gt: decoded.id },
                    },
                  ],
                };
        }
      }

      const finalWhere: Prisma.ObjectWhereInput = cursorCondition
        ? { AND: [where, cursorCondition] }
        : where;

      // Fetch one extra to determine hasNextPage without COUNT(*)
      const rows = await this.prisma.object.findMany({
        where: finalWhere,
        orderBy: [{ updatedAt: sortOrder }, { id: sortOrder }],
        take: pageSize + 1,
      });

      const hasNextPage = rows.length > pageSize;
      const pageItems = hasNextPage ? rows.slice(0, pageSize) : rows;
      const aggregates = pageItems.map((r) => this.rowToAggregate(r));

      const startCursor =
        pageItems.length > 0 ? this.encodeCursor(pageItems[0]) : undefined;
      const endCursor =
        pageItems.length > 0
          ? this.encodeCursor(pageItems[pageItems.length - 1])
          : undefined;

      return {
        items: aggregates,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!params.after,
          startCursor,
          endCursor,
        },
      };
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'ObjectAggregate');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Private: create — single atomic insert with all domain fields
  // ─────────────────────────────────────────────────────────────

  private async createAggregate(aggregate: ObjectAggregate): Promise<void> {
    const serializedAttributes = PrismaObjectMapper.serializeAttributes(
      aggregate.attributes,
    );

    try {
      await this.prisma.object.create({
        data: {
          id: aggregate.id.toValue(),
          workspaceId: aggregate.workspaceId.toValue(),
          createdById: aggregate.createdById.toValue(),
          updatedById: aggregate.createdById.toValue(),
          objectKey: aggregate.objectKey.toValue(),
          typeKey: aggregate.typeKey,
          title: aggregate.title.toValue(),
          description: aggregate.description ?? null,
          icon: aggregate.icon ?? null,
          emoji: aggregate.emoji ?? null,
          cover: aggregate.cover ?? null,
          color: aggregate.color ?? null,
          spaceId: aggregate.spaceId?.toValue() ?? null,
          pinnedAt: aggregate.pinnedAt ?? null,
          isFavorite: aggregate.isFavorite,
          status: aggregate.status,
          schemaVersion: 1,
          systemData:
            (aggregate.systemData as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          attributes: serializedAttributes,
          revision: 1,
          createdAt: aggregate.createdAt,
          updatedAt: aggregate.updatedAt,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ObjectAlreadyExistsException(aggregate.id.toValue());
      }
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Private: update — atomic CAS raw SQL UPDATE … RETURNING *
  //   (same battle-tested pattern as PrismaObjectRepository Tier 1)
  // ─────────────────────────────────────────────────────────────

  private async updateAggregate(
    aggregate: ObjectAggregate,
    storedRevision: number,
  ): Promise<void> {
    const serializedAttributes = PrismaObjectMapper.serializeAttributes(
      aggregate.attributes,
    );
    const now = aggregate.updatedAt;

    const rows = await this.prisma.$queryRaw<PrismaObject[]>(Prisma.sql`
      UPDATE "Object"
      SET
        "title"       = ${aggregate.title.toValue()},
        "description" = ${aggregate.description ?? null},
        "icon"        = ${aggregate.icon ?? null},
        "emoji"       = ${aggregate.emoji ?? null},
        "cover"       = ${aggregate.cover ?? null},
        "color"       = ${aggregate.color ?? null},
        "spaceId"     = ${aggregate.spaceId?.toValue() ?? null}::uuid,
        "pinnedAt"    = ${aggregate.pinnedAt ?? null},
        "isFavorite"  = ${aggregate.isFavorite},
        "status"      = ${aggregate.status}::"ObjectStatus",
        "attributes"  = ${JSON.stringify(serializedAttributes)}::jsonb,
        "systemData"  = ${JSON.stringify(aggregate.systemData)}::jsonb,
        "updatedById" = ${aggregate.updatedById?.toValue() ?? this.context.userId}::uuid,
        "revision"    = ${storedRevision + 1},
        "updatedAt"   = ${now},
        "archivedAt"  = ${aggregate.archivedAt ?? null},
        "deletedAt"   = ${aggregate.deletedAt ?? null}
      WHERE "id"          = ${aggregate.id.toValue()}::uuid
        AND "workspaceId" = ${aggregate.workspaceId.toValue()}::uuid
        AND "revision"    = ${storedRevision}
      RETURNING *;
    `);

    if (!Array.isArray(rows) || rows.length === 0) {
      // Distinguish concurrency conflict vs lifecycle conflict vs not found
      const current = await this.prisma.object.findFirst({
        where: {
          id: aggregate.id.toValue(),
          workspaceId: aggregate.workspaceId.toValue(),
        },
        select: { revision: true, status: true },
      });

      if (!current) {
        throw new ObjectNotFoundException(aggregate.id.toValue());
      }
      if (current.revision !== storedRevision) {
        throw new ObjectConcurrencyException(
          aggregate.id.toValue(),
          storedRevision,
          current.revision,
        );
      }
      throw new ObjectLifecycleConflictException(
        aggregate.id.toValue(),
        current.status,
        'update_aggregate',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Private: reconstitute ObjectAggregate from raw Prisma row
  // ─────────────────────────────────────────────────────────────

  private rowToAggregate(row: PrismaObject): ObjectAggregate {
    return ObjectAggregate.reconstitute({
      id: new UniqueEntityId(row.id),
      workspaceId: new UniqueEntityId(row.workspaceId),
      spaceId: row.spaceId ? new UniqueEntityId(row.spaceId) : undefined,
      createdById: new UniqueEntityId(row.createdById),
      updatedById: row.updatedById
        ? new UniqueEntityId(row.updatedById)
        : undefined,
      objectKey: ObjectKey.create(row.objectKey),
      typeKey: row.typeKey as any,
      title: ObjectTitle.create(row.title),
      description: row.description ?? undefined,
      icon: row.icon ?? undefined,
      emoji: row.emoji ?? undefined,
      cover: row.cover ?? undefined,
      color: row.color ?? undefined,
      pinnedAt: row.pinnedAt ?? undefined,
      isFavorite: row.isFavorite,
      status: row.status,
      systemData: (row.systemData as Record<string, unknown>) ?? {},
      attributes: (row.attributes as Record<string, unknown>) ?? {},
      revision: row.revision,
      archivedAt: row.archivedAt ?? undefined,
      deletedAt: row.deletedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Private: cursor encoding/decoding (updatedAt ISO + id)
  // ─────────────────────────────────────────────────────────────

  private encodeCursor(row: PrismaObject): string {
    const payload = `${row.updatedAt.toISOString()}|${row.id}`;
    return Buffer.from(payload).toString('base64url');
  }

  private decodeCursor(cursor: string): { updatedAt: Date; id: string } | null {
    try {
      const raw = Buffer.from(cursor, 'base64url').toString('utf-8');
      const sepIdx = raw.indexOf('|');
      if (sepIdx === -1) return null;
      const updatedAtStr = raw.substring(0, sepIdx);
      const id = raw.substring(sepIdx + 1);
      if (!id) return null;
      const updatedAt = new Date(updatedAtStr);
      if (isNaN(updatedAt.getTime())) return null;
      return { updatedAt, id };
    } catch {
      return null;
    }
  }
}
