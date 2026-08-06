/**
 * Standardized input parameters for keyset (cursor-based) pagination requests.
 */
export interface PaginationParams {
  /**
   * Maximum number of items to return in forward pagination.
   */
  readonly first?: number | undefined;

  /**
   * Opaque cursor string indicating the starting point for forward pagination.
   */
  readonly after?: string | undefined;

  /**
   * Maximum number of items to return in backward pagination.
   */
  readonly last?: number | undefined;

  /**
   * Opaque cursor string indicating the starting point for backward pagination.
   */
  readonly before?: string | undefined;

  /**
   * Sort direction for key-based sorting ('asc' for ascending, 'desc' for descending).
   */
  readonly sortOrder?: "asc" | "desc" | undefined;
}
