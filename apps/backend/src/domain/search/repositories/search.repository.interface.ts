import type { UniqueEntityId } from '@lumora/shared';
import type { SearchIndexEntity } from '../entities/search-index.entity.js';
import type { SearchTerm } from '../value-objects/search-term.js';
import type { SearchEntityCategory } from '../value-objects/search-entity-category.js';

export interface ISearchRepository {
  search(
    query: SearchTerm,
    category?: SearchEntityCategory,
    limit?: number,
  ): Promise<SearchIndexEntity[]>;

  save(entity: SearchIndexEntity): Promise<void>;

  deleteByEntity(
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<void>;

  findByEntity(
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<SearchIndexEntity | null>;
}
