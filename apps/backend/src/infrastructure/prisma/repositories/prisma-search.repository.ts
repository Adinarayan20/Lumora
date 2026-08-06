import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '@lumora/shared';
import { Prisma, SearchIndex as PrismaSearchIndex } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma.service.js';
import { PrismaExceptionMapper } from '../mappers/prisma-exception.mapper.js';
import type { ISearchRepository } from '../../../domain/search/repositories/search.repository.interface.js';
import { SearchIndexEntity } from '../../../domain/search/entities/search-index.entity.js';
import { SearchTerm } from '../../../domain/search/value-objects/search-term.js';
import { SearchEntityCategory } from '../../../domain/search/value-objects/search-entity-category.js';

@Injectable()
export class PrismaSearchRepository implements ISearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async search(
    query: SearchTerm,
    category?: SearchEntityCategory,
    limit = 20,
  ): Promise<SearchIndexEntity[]> {
    try {
      const term = query.getValue();
      const where: Prisma.SearchIndexWhereInput = {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
        ],
      };

      if (category) {
        where.entity = category.getValue();
      }

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
          title: data.title,
          content: data.content,
        } as Prisma.SearchIndexUncheckedUpdateInput,
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async deleteByEntity(
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<void> {
    try {
      await this.prisma.searchIndex.deleteMany({
        where: {
          entity: category.getValue(),
          entityId: entityId.toString(),
        },
      });
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  public async findByEntity(
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<SearchIndexEntity | null> {
    try {
      const record = await this.prisma.searchIndex.findFirst({
        where: {
          entity: category.getValue(),
          entityId: entityId.toString(),
        },
      });

      if (!record) return null;

      return this.toDomain(record);
    } catch (error) {
      throw PrismaExceptionMapper.toDomainException(error);
    }
  }

  /**
   * Explicit mapping converting database SearchIndex model to SearchIndexEntity projection.
   */
  public toDomain(model: PrismaSearchIndex): SearchIndexEntity {
    return SearchIndexEntity.reconstitute({
      id: new UniqueEntityId(model.id),
      entityCategory: SearchEntityCategory.create(model.entity),
      entityId: new UniqueEntityId(model.entityId),
      title: model.title,
      content: model.content,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Explicit mapping converting SearchIndexEntity projection to database persistence payload.
   */
  public toPersistence(entity: SearchIndexEntity): Record<string, unknown> {
    return {
      id: entity.id.toString(),
      entity: entity.entityCategory.getValue(),
      entityId: entity.entityId.toString(),
      title: entity.title,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
