import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, ApplicationException } from '@lumora/shared';
import { SearchEntityCategory } from '../../../domain/search/value-objects/search-entity-category.js';
import type { ISearchRepository } from '../../../domain/search/repositories/search.repository.interface.js';
import { SEARCH_REPOSITORY_TOKEN } from '../search.tokens.js';

export interface RemoveSearchIndexCommand {
  workspaceId: string;
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
  ): Promise<Result<void, ApplicationException>> {
    try {
      await this.searchRepository.deleteByEntity(
        new UniqueEntityId(command.workspaceId),
        SearchEntityCategory.create(command.entityCategory),
        new UniqueEntityId(command.entityId),
      );
      return Result.ok<void, ApplicationException>(undefined);
    } catch (error) {
      if (error instanceof ApplicationException) return Result.fail(error);
      throw error;
    }
  }
}
