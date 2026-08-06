import type { PaginationParams, PaginatedResult } from '@lumora/shared';
import type { IBaseRepository } from './base.repository.interface.js';

/**
 * Extension repository interface adding keyset (cursor-based) paginated query capabilities.
 */
export interface IPaginatedRepository<
  TEntity,
  TId,
  TFilter = Record<string, unknown>,
> extends IBaseRepository<TEntity, TId> {
  /**
   * Executes an index-backed keyset paginated query against the domain repository.
   */
  findPaginated(
    params: PaginationParams,
    filter?: TFilter,
  ): Promise<PaginatedResult<TEntity>>;
}
