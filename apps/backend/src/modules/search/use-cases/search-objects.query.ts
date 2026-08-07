import { Inject, Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { SearchTerm } from '../../../domain/search/value-objects/search-term.js';
import { SearchEntityCategory } from '../../../domain/search/value-objects/search-entity-category.js';
import type { ISearchRepository } from '../../../domain/search/repositories/search.repository.interface.js';
import { SEARCH_REPOSITORY_TOKEN } from '../search.tokens.js';
import { SearchQueryDto } from '../dto/search-query.dto.js';
import { SearchResultDto } from '../dto/search-result.dto.js';
import { SearchResponseMapper } from '../mappers/search-response.mapper.js';

export interface SearchObjectsQueryInput {
  dto: SearchQueryDto;
}

@Injectable()
export class SearchObjectsQuery {
  constructor(
    @Inject(SEARCH_REPOSITORY_TOKEN)
    private readonly searchRepository: ISearchRepository,
  ) {}

  public async execute(
    input: SearchObjectsQueryInput,
  ): Promise<Result<SearchResultDto[], ApplicationException>> {
    try {
      const { dto } = input;
      const termObj = SearchTerm.create(dto.query);
      const categoryObj = dto.category
        ? SearchEntityCategory.create(dto.category)
        : undefined;

      const projections = await this.searchRepository.search(
        termObj,
        categoryObj,
      );

      const dtos = projections.map((p) =>
        SearchResponseMapper.toResponseDto(p),
      );
      return Result.ok(dtos);
    } catch (error) {
      if (error instanceof ApplicationException) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
