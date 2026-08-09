import { SearchIndexEntity } from '../../../domain/search/entities/search-index.entity.js';
import { SearchResultDto } from '../dto/search-result.dto.js';

export class SearchResponseMapper {
  public static toResponseDto(entity: SearchIndexEntity): SearchResultDto {
    return {
      id: entity.id.toString(),
      workspaceId: entity.workspaceId.toValue(),
      entityCategory: entity.entityCategory.getValue(),
      entityId: entity.entityId.toString(),
      title: entity.title,
      content: entity.content,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
