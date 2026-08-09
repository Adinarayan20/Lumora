import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import {
  Prisma,
  SearchIndex as PrismaSearchIndex,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { ISearchRepository } from '../../../domain/search/repositories/search.repository.interface.js';
import { SearchIndexEntity } from '../../../domain/search/entities/search-index.entity.js';
import { SearchTerm } from '../../../domain/search/value-objects/search-term.js';
import { SearchEntityCategory } from '../../../domain/search/value-objects/search-entity-category.js';

/**
 * PrismaSearchRepository — WORKSPACE-SCOPED (Phase F repair).
 *
 * All operations now require workspaceId. Cross-workspace queries are impossible.
 * SearchIndex is a derived read-side projection: source of truth is the Object table.
 */
@Injectable()
export class PrismaSearchRepository implements ISearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async search(
    workspaceId: UniqueEntityId,
    query: SearchTerm,
    category?: SearchEntityCategory,
    limit = 20,
  ): Promise<SearchIndexEntity[]> {
    try {
      const term = query.getValue();
      const where: Prisma.SearchIndexWhereInput = {
        workspaceId: workspaceId.toValue(), // ← mandatory workspace scope
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
        ],
      };
      if (category) where.entity = category.getValue();

      const records = await this.prisma.searchIndex.findMany({
        where,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
      return records.map((r) => this.toDomain(r));
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async save(entity: SearchIndexEntity): Promise<void> {
    try {
      const data = this.toPersistence(entity);
      await this.prisma.searchIndex.upsert({
        where: { id: entity.id.toString() },
        create: data as Prisma.SearchIndexUncheckedCreateInput,
        update: {
          title: data.title as string,
          content: data.content as string,
          workspaceId: data.workspaceId as string,
          updatedAt: new Date(),
        } as Prisma.SearchIndexUncheckedUpdateInput,
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async deleteByEntity(
    workspaceId: UniqueEntityId,
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<void> {
    try {
      await this.prisma.searchIndex.deleteMany({
        where: {
          workspaceId: workspaceId.toValue(),
          entity: category.getValue(),
          entityId: entityId.toString(),
        },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findByEntity(
    workspaceId: UniqueEntityId,
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<SearchIndexEntity | null> {
    try {
      const record = await this.prisma.searchIndex.findFirst({
        where: {
          workspaceId: workspaceId.toValue(),
          entity: category.getValue(),
          entityId: entityId.toString(),
        },
      });
      return record ? this.toDomain(record) : null;
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public toDomain(model: PrismaSearchIndex): SearchIndexEntity {
    return SearchIndexEntity.reconstitute({
      id: new UniqueEntityId(model.id),
      workspaceId: new UniqueEntityId(
        (model as any).workspaceId ?? '00000000-0000-0000-0000-000000000000',
      ),
      entityCategory: SearchEntityCategory.create(model.entity),
      entityId: new UniqueEntityId(model.entityId),
      title: model.title,
      content: model.content,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  public toPersistence(entity: SearchIndexEntity): Record<string, unknown> {
    return {
      id: entity.id.toString(),
      workspaceId: entity.workspaceId.toValue(),
      entity: entity.entityCategory.getValue(),
      entityId: entity.entityId.toString(),
      title: entity.title,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
