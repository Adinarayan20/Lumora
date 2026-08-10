import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
  EntityNotFoundException,
  RevisionConflictException,
} from '@lumora/shared';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { PrismaExceptionMapper } from '../../infrastructure/prisma/mappers/prisma-exception.mapper.js';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository.js';
import { UpdateObjectDto } from './dto/update-object.dto.js';
import { FilterObjectDto } from './dto/filter-object.dto.js';
import { ObjectResponseDto } from './dto/object-response.dto.js';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export interface PaginatedObjectsResult {
  items: ObjectResponseDto[];
  hasNextPage: boolean;
  nextCursor?: string;
  total?: number;
}
import {
  ObjectStatus as PrismaObjectStatus,
  Prisma,
  AuditAction,
} from '../../generated/prisma/client.js';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export interface PaginatedObjectsResult {
  items: ObjectResponseDto[];
  hasNextPage: boolean;
  nextCursor?: string;
  total?: number;
}

@Injectable()
export class ObjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async getWorkspaceObjects(
    workspaceId: string,
    filter: FilterObjectDto,
    pagination?: PaginationQueryDto,
  ): Promise<Result<PaginatedObjectsResult, ApplicationException>> {
    try {
      const where: Prisma.ObjectWhereInput = { workspaceId };

      if (filter.status) {
        where.status = filter.status as PrismaObjectStatus;
      } else {
        where.status = { not: PrismaObjectStatus.DELETED };
      }

      if (filter.typeKey) where.typeKey = filter.typeKey;
      if (filter.spaceId) where.spaceId = filter.spaceId;
      if (filter.isFavorite !== undefined) where.isFavorite = filter.isFavorite;
      if (filter.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      // Cursor-based pagination (first + after)
      if (pagination?.first !== undefined || pagination?.after !== undefined) {
        const pageSize = Math.min(
          pagination.first ?? DEFAULT_PAGE_SIZE,
          MAX_PAGE_SIZE,
        );
        let cursorWhere: Prisma.ObjectWhereInput | undefined;

        if (pagination.after) {
          const decoded = this.decodeCursor(pagination.after);
          if (decoded) {
            cursorWhere = {
              OR: [
                { updatedAt: { lt: decoded.updatedAt } },
                {
                  updatedAt: { equals: decoded.updatedAt },
                  id: { lt: decoded.id },
                },
              ],
            };
          }
        }

        const finalWhere: Prisma.ObjectWhereInput = cursorWhere
          ? { AND: [where, cursorWhere] }
          : where;

        const rows = await this.prisma.object.findMany({
          where: finalWhere,
          orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
          take: pageSize + 1,
        });

        const hasNextPage = rows.length > pageSize;
        const items = hasNextPage ? rows.slice(0, pageSize) : rows;
        const nextCursor =
          items.length > 0
            ? this.encodeCursor(items[items.length - 1])
            : undefined;

        return Result.ok({
          items: items.map((r) => this.rowToDto(r)),
          hasNextPage,
          nextCursor,
        });
      }

      // Legacy limit/offset pagination
      const limit = Math.min(
        pagination?.limit ?? DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE,
      );
      const offset = pagination?.offset ?? 0;

      const rows = await this.prisma.object.findMany({
        where,
        orderBy: [{ pinnedAt: 'desc' }, { updatedAt: 'desc' }],
        take: limit,
        skip: offset,
      });

      return Result.ok({
        items: rows.map((r) => this.rowToDto(r)),
        hasNextPage: false,
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Object');
    }
  }

  async getObjectByIdOrKey(
    workspaceId: string,
    idOrKey: string,
  ): Promise<Result<ObjectResponseDto, ApplicationException>> {
    try {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          idOrKey,
        );

      const row = await this.prisma.object.findFirst({
        where: isUuid
          ? {
              id: idOrKey,
              workspaceId,
              status: { not: PrismaObjectStatus.DELETED },
            }
          : {
              workspaceId,
              objectKey: idOrKey,
              status: { not: PrismaObjectStatus.DELETED },
            },
      });

      if (!row)
        return Result.fail(new EntityNotFoundException('Object', idOrKey));
      return Result.ok(this.rowToDto(row));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error, 'Object');
    }
  }

  async updateObject(
    workspaceId: string,
    objectId: string,
    userId: string,
    dto: UpdateObjectDto,
  ): Promise<Result<ObjectResponseDto, ApplicationException>> {
    try {
      const existing = await this.prisma.object.findFirst({
        where: {
          id: objectId,
          workspaceId,
          status: { not: PrismaObjectStatus.DELETED },
        },
      });

      if (!existing)
        return Result.fail(new EntityNotFoundException('Object', objectId));

      if (dto.revision !== undefined && dto.revision !== existing.revision) {
        return Result.fail(
          new RevisionConflictException(
            'Object',
            existing.revision,
            dto.revision,
          ),
        );
      }

      const now = new Date();

      // Use unchecked update input so scalar IDs (updatedById, spaceId) work directly
      const updateData: Prisma.ObjectUncheckedUpdateInput = {
        updatedById: userId,
        revision: { increment: 1 },
        updatedAt: now,
      };

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.spaceId !== undefined) updateData.spaceId = dto.spaceId;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.emoji !== undefined) updateData.emoji = dto.emoji;
      if (dto.cover !== undefined) updateData.cover = dto.cover;
      if (dto.color !== undefined) updateData.color = dto.color;
      if (dto.isFavorite !== undefined) updateData.isFavorite = dto.isFavorite;
      if (dto.attributes !== undefined)
        updateData.attributes = dto.attributes as Prisma.InputJsonValue;
      if (dto.systemData !== undefined)
        updateData.systemData = dto.systemData as Prisma.InputJsonValue;
      if (dto.pinnedAt !== undefined)
        updateData.pinnedAt = dto.pinnedAt ? new Date(dto.pinnedAt) : null;

      if (dto.status !== undefined) {
        updateData.status = dto.status as PrismaObjectStatus;
        if (dto.status === PrismaObjectStatus.ARCHIVED)
          updateData.archivedAt = now;
        else if (dto.status === PrismaObjectStatus.ACTIVE)
          updateData.archivedAt = null;
      }

      const result = await this.prisma.object.updateMany({
        where: {
          id: objectId,
          workspaceId,
          status: { not: PrismaObjectStatus.DELETED },
        },
        data: updateData,
      });

      if (result.count === 0)
        return Result.fail(new EntityNotFoundException('Object', objectId));

      const updated = await this.prisma.object.findFirstOrThrow({
        where: { id: objectId, workspaceId },
      });

      await this.auditLogRepository.create({
        userId,
        entity: 'Object',
        entityId: objectId,
        action: AuditAction.UPDATE,
        newData: { typeKey: updated.typeKey, revision: updated.revision },
      });

      return Result.ok(this.rowToDto(updated));
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw PrismaExceptionMapper.toDomainException(error, 'Object');
    }
  }

  async softDeleteObject(
    workspaceId: string,
    objectId: string,
    userId: string,
  ): Promise<Result<ObjectResponseDto, ApplicationException>> {
    try {
      const now = new Date();
      const result = await this.prisma.object.updateMany({
        where: {
          id: objectId,
          workspaceId,
          status: { not: PrismaObjectStatus.DELETED },
        },
        data: {
          status: PrismaObjectStatus.DELETED,
          deletedAt: now,
          updatedById: userId,
          revision: { increment: 1 },
          updatedAt: now,
        },
      });

      if (result.count === 0)
        return Result.fail(new EntityNotFoundException('Object', objectId));

      const deleted = await this.prisma.object.findFirstOrThrow({
        where: { id: objectId, workspaceId },
      });

      await this.auditLogRepository.create({
        userId,
        entity: 'Object',
        entityId: objectId,
        action: AuditAction.DELETE,
      });

      return Result.ok(this.rowToDto(deleted));
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw PrismaExceptionMapper.toDomainException(error, 'Object');
    }
  }

  async verifyObjectInWorkspace(
    workspaceId: string,
    objectId: string,
  ): Promise<boolean> {
    const count = await this.prisma.object.count({
      where: {
        id: objectId,
        workspaceId,
        status: { not: PrismaObjectStatus.DELETED },
      },
    });
    return count > 0;
  }

  private encodeCursor(row: { updatedAt: Date; id: string }): string {
    return Buffer.from(`${row.updatedAt.toISOString()}|${row.id}`).toString(
      'base64url',
    );
  }

  private decodeCursor(cursor: string): { updatedAt: Date; id: string } | null {
    try {
      const raw = Buffer.from(cursor, 'base64url').toString('utf-8');
      const sep = raw.indexOf('|');
      if (sep === -1) return null;
      const updatedAt = new Date(raw.substring(0, sep));
      const id = raw.substring(sep + 1);
      if (!id || isNaN(updatedAt.getTime())) return null;
      return { updatedAt, id };
    } catch {
      return null;
    }
  }

  private rowToDto(row: Prisma.ObjectGetPayload<object>): ObjectResponseDto {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      spaceId: row.spaceId ?? undefined,
      createdById: row.createdById,
      updatedById: row.updatedById ?? undefined,
      objectKey: row.objectKey,
      typeKey: row.typeKey,
      title: row.title,
      description: row.description ?? undefined,
      icon: row.icon ?? undefined,
      emoji: row.emoji ?? undefined,
      cover: row.cover ?? undefined,
      color: row.color ?? undefined,
      pinnedAt: row.pinnedAt?.toISOString(),
      isFavorite: row.isFavorite,
      status: row.status,
      attributes: (row.attributes as Record<string, unknown>) ?? {},
      revision: row.revision,
      archivedAt: row.archivedAt?.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
