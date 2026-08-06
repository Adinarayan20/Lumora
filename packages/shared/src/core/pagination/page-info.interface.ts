/**
 * Standardized pagination cursor metadata returned with paginated queries.
 */
export interface PageInfo {
  /**
   * Indicates whether additional items exist beyond the current page in forward navigation.
   */
  readonly hasNextPage: boolean;

  /**
   * Indicates whether items exist prior to the current page in backward navigation.
   */
  readonly hasPreviousPage: boolean;

  /**
   * Opaque cursor pointing to the first item in the current page payload.
   */
  readonly startCursor?: string | undefined;

  /**
   * Opaque cursor pointing to the last item in the current page payload.
   */
  readonly endCursor?: string | undefined;

  /**
   * Total item count matching the query filter.
   * @note Optional. Omitted by default during standard keyset queries to prevent expensive COUNT(*) database scans.
   */
  readonly totalCount?: number | undefined;
}
