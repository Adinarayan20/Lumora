import { Inject, Injectable } from '@nestjs/common';
import { Result, UniqueEntityId, ApplicationException } from '@lumora/shared';
import { SearchIndexEntity } from '../../../domain/search/entities/search-index.entity.js';
import { SearchEntityCategory } from '../../../domain/search/value-objects/search-entity-category.js';
import type { ISearchRepository } from '../../../domain/search/repositories/search.repository.interface.js';
import { SEARCH_REPOSITORY_TOKEN } from '../search.tokens.js';
import { IndexEntityDto } from '../dto/index-entity.dto.js';
import { SearchResultDto } from '../dto/search-result.dto.js';
import { SearchResponseMapper } from '../mappers/search-response.mapper.js';

export interface IndexEntityCommand {
  dto: IndexEntityDto;
}

@Injectable()
export class IndexEntityUseCase {
  constructor(
    @Inject(SEARCH_REPOSITORY_TOKEN)
    private readonly searchRepository: ISearchRepository,
  ) {}

  public async execute(
    command: IndexEntityCommand,
  ): Promise<Result<SearchResultDto, ApplicationException>> {
    try {
      const { dto } = command;
      const categoryObj = SearchEntityCategory.create(dto.entityCategory);
      const entityIdObj = new UniqueEntityId(dto.entityId);

      let projection = await this.searchRepository.findByEntity(
        categoryObj,
        entityIdObj,
      );

      if (projection) {
        projection.updateContent(dto.title, dto.content);
      } else {
        projection = SearchIndexEntity.create({
          entityCategory: categoryObj,
          entityId: entityIdObj,
          title: dto.title,
          content: dto.content,
        });
      }

      await this.searchRepository.save(projection);

      const responseDto = SearchResponseMapper.toResponseDto(projection);
      return Result.ok(responseDto);
    } catch (error) {
      if (error instanceof ApplicationException) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
