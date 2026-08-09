import { describe, it, expect, vi } from 'vitest';
import { IdGenerator, UniqueEntityId } from '@lumora/shared';
import { SearchObjectsQuery } from '../search-objects.query.js';
import { SearchIndexEntity } from '../../../../domain/search/entities/search-index.entity.js';
import type { ISearchRepository } from '../../../../domain/search/repositories/search.repository.interface.js';

describe('SearchObjectsQuery', () => {
  it('should execute keyword search query and return matching SearchResultDto list', async () => {
    const workspaceId = new UniqueEntityId(IdGenerator.generate());
    const entityId = IdGenerator.generate();

    const projection = SearchIndexEntity.create({
      workspaceId,
      entityCategory: 'OBJECT',
      entityId: new UniqueEntityId(entityId),
      title: 'Roadmap Object',
      content: 'Indexed content body.',
    });

    const mockRepo: ISearchRepository = {
      search: vi.fn().mockResolvedValue([projection]),
      save: vi.fn(),
      deleteByEntity: vi.fn(),
      findByEntity: vi.fn(),
    };

    const queryHandler = new SearchObjectsQuery(mockRepo);
    const result = await queryHandler.execute({
      workspaceId: workspaceId.toValue(),
      dto: { query: 'roadmap', category: 'OBJECT' },
    });

    expect(result.isSuccess).toBe(true);
    const results = result.getValue();
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Roadmap Object');
    expect(results[0].workspaceId).toBe(workspaceId.toValue());
  });
});
