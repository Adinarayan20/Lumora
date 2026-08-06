import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId } from '@lumora/shared';
import { SearchEntityCategory } from '../../../domain/search/value-objects/search-entity-category.js';
import type { ISearchRepository } from '../../../domain/search/repositories/search.repository.interface.js';
import { SEARCH_REPOSITORY_TOKEN } from '../search.tokens.js';

export interface RemoveSearchIndexCommand {
  entityCategory: string;
  entityId: string;
}

@Injectable()
export class RemoveSearchIndexUseCase {
  constructor(
    @Inject(SEARCH_REPOSITORY_TOKEN)
    private readonly searchRepository: ISearchRepository,
  ) {}

  public async execute(
    command: RemoveSearchIndexCommand,
  ): Promise<Result<void, Error>> {
    try {
      const { entityCategory, entityId } = command;
      const categoryObj = SearchEntityCategory.create(entityCategory);
      const entityIdObj = new UniqueEntityId(entityId);

      await this.searchRepository.deleteByEntity(categoryObj, entityIdObj);
      return Result.ok<void, Error>(undefined as unknown as void);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
