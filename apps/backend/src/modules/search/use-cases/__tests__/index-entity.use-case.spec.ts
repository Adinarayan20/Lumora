import { describe, it, expect, vi } from 'vitest';
import { IdGenerator } from '@lumora/shared';
import { IndexEntityUseCase } from '../index-entity.use-case.js';
import type { ISearchRepository } from '../../../../domain/search/repositories/search.repository.interface.js';

describe('IndexEntityUseCase', () => {
  it('should create new search projection and return SearchResultDto', async () => {
    const entityId = IdGenerator.generate();

    const mockRepo: ISearchRepository = {
      search: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      deleteByEntity: vi.fn(),
      findByEntity: vi.fn().mockResolvedValue(null),
    };

    const useCase = new IndexEntityUseCase(mockRepo);
    const result = await useCase.execute({
      dto: {
        entityCategory: 'OBJECT',
        entityId,
        title: 'Project Roadmap',
        content: 'Content text for search indexing.',
      },
    });

    expect(result.isSuccess).toBe(true);
    const dto = result.getValue();
    expect(dto.title).toBe('Project Roadmap');
    expect(dto.entityCategory).toBe('OBJECT');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
