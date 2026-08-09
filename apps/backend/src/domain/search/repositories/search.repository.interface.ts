import type { UniqueEntityId } from '@lumora/shared';
import type { SearchIndexEntity } from '../entities/search-index.entity.js';
import type { SearchTerm } from '../value-objects/search-term.js';
import type { SearchEntityCategory } from '../value-objects/search-entity-category.js';

/**
 * ISearchRepository — workspace-scoped search projection repository.
 *
 * ALL operations are workspace-scoped. Cross-workspace queries are forbidden.
 * workspaceId is mandatory on search() and save() to guarantee isolation.
 */
export interface ISearchRepository {
  search(
    workspaceId: UniqueEntityId,
    query: SearchTerm,
    category?: SearchEntityCategory,
    limit?: number,
  ): Promise<SearchIndexEntity[]>;

  save(entity: SearchIndexEntity): Promise<void>;

  deleteByEntity(
    workspaceId: UniqueEntityId,
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<void>;

  findByEntity(
    workspaceId: UniqueEntityId,
    category: SearchEntityCategory,
    entityId: UniqueEntityId,
  ): Promise<SearchIndexEntity | null>;
}
