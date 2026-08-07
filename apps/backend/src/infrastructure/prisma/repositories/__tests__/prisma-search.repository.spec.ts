/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniqueEntityId, IdGenerator } from '@lumora/shared';
import { PrismaSearchRepository } from '../prisma-search.repository.js';
import { SearchIndexEntity } from '../../../../domain/search/entities/search-index.entity.js';
import { SearchTerm } from '../../../../domain/search/value-objects/search-term.js';
import { SearchEntityCategory } from '../../../../domain/search/value-objects/search-entity-category.js';

describe('PrismaSearchRepository Unit Tests', () => {
  let repository: PrismaSearchRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      searchIndex: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    repository = new PrismaSearchRepository(mockPrisma);
  });

  it('should update existing projection on save duplicate indexing', async () => {
    const projection = SearchIndexEntity.create({
      entityCategory: 'OBJECT',
      entityId: new UniqueEntityId(),
      title: 'Initial Title',
      content: 'Initial Content',
    });

    mockPrisma.searchIndex.upsert.mockResolvedValue({
      id: projection.id.toString(),
      entity: 'OBJECT',
      entityId: projection.entityId.toString(),
      title: 'Updated Title',
      content: 'Updated Content',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    projection.updateContent('Updated Title', 'Updated Content');
    await repository.save(projection);

    expect(mockPrisma.searchIndex.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: projection.id.toString() },
        update: {
          title: 'Updated Title',
          content: 'Updated Content',
        },
      }),
    );
  });

  it('should delete projection by entity category and entity id', async () => {
    const category = SearchEntityCategory.create('SPACE');
    const entityId = new UniqueEntityId();

    mockPrisma.searchIndex.deleteMany.mockResolvedValue({ count: 1 });

    await repository.deleteByEntity(category, entityId);

    expect(mockPrisma.searchIndex.deleteMany).toHaveBeenCalledWith({
      where: {
        entity: 'SPACE',
        entityId: entityId.toString(),
      },
    });
  });

  it('should apply category filtering when searching', async () => {
    const term = SearchTerm.create('roadmap');
    const category = SearchEntityCategory.create('OBJECT');
    const mockId = IdGenerator.generate().toString();
    const mockEntId = IdGenerator.generate().toString();

    mockPrisma.searchIndex.findMany.mockResolvedValue([
      {
        id: mockId,
        entity: 'OBJECT',
        entityId: mockEntId,
        title: 'Q3 Roadmap',
        content: 'Roadmap text',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const results = await repository.search(term, category);

    expect(results).toHaveLength(1);
    expect(mockPrisma.searchIndex.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          entity: 'OBJECT',
        }),
      }),
    );
  });

  it('should respect custom limit parameters during search execution', async () => {
    const term = SearchTerm.create('lumora');
    mockPrisma.searchIndex.findMany.mockResolvedValue([]);

    await repository.search(term, undefined, 5);

    expect(mockPrisma.searchIndex.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
      }),
    );
  });

  it('should return empty result list when no search matches exist', async () => {
    const term = SearchTerm.create('nonexistent');
    mockPrisma.searchIndex.findMany.mockResolvedValue([]);

    const results = await repository.search(term);

    expect(results).toHaveLength(0);
  });

  it('should handle duplicate indexing idempotently via database upsert', async () => {
    const projection = SearchIndexEntity.create({
      entityCategory: 'COLLECTION',
      entityId: new UniqueEntityId(),
      title: 'Collection Title',
      content: 'Collection Content',
    });

    mockPrisma.searchIndex.upsert.mockResolvedValue({
      id: projection.id.toString(),
      entity: 'COLLECTION',
      entityId: projection.entityId.toString(),
      title: 'Collection Title',
      content: 'Collection Content',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.save(projection);
    await repository.save(projection);

    expect(mockPrisma.searchIndex.upsert).toHaveBeenCalledTimes(2);
  });
});
