import type { PageInfo } from './page-info.interface.js';

/**
 * Generic container interface for paginated query results.
 */
export interface PaginatedResult<T> {
  /**
   * List of items returned for the requested page.
   */
  readonly items: readonly T[];

  /**
   * Cursor metadata describing page boundaries and navigation state.
   */
  readonly pageInfo: PageInfo;
}
