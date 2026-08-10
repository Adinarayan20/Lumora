import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchController } from '../search.controller.js';
import { IndexEntityUseCase } from '../use-cases/index-entity.use-case.js';
import { RemoveSearchIndexUseCase } from '../use-cases/remove-search-index.use-case.js';
import { SearchObjectsQuery } from '../use-cases/search-objects.query.js';
import { SearchResultDto } from '../dto/search-result.dto.js';
import { Result } from '@lumora/shared';

describe('SearchController', () => {
  let controller: SearchController;
  let indexEntityUseCase: IndexEntityUseCase;
  let removeSearchIndexUseCase: RemoveSearchIndexUseCase;
  let searchObjectsQuery: SearchObjectsQuery;

  beforeEach(() => {
    indexEntityUseCase = {
      execute: vi.fn(),
    } as unknown as IndexEntityUseCase;
    removeSearchIndexUseCase = {
      execute: vi.fn(),
    } as unknown as RemoveSearchIndexUseCase;
    searchObjectsQuery = {
      execute: vi.fn(),
    } as unknown as SearchObjectsQuery;

    controller = new SearchController(
      indexEntityUseCase,
      removeSearchIndexUseCase,
      searchObjectsQuery,
    );
  });

  it('delegates search query to searchObjectsQuery and returns result value', async () => {
    const mockResponse: SearchResultDto[] = [];
    const execSpy = vi
      .spyOn(searchObjectsQuery, 'execute')
      .mockResolvedValue(Result.ok(mockResponse));

    const result = await controller.search('ws-123', { query: 'test' });
    expect(result).toEqual(mockResponse);
    expect(execSpy).toHaveBeenCalledWith({
      workspaceId: 'ws-123',
      dto: { query: 'test' },
    });
  });
});
