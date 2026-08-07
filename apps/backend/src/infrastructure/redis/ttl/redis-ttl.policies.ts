export class RedisTtlPolicies {
  /** 1 hour in seconds for object entity cache */
  public static readonly OBJECT_CACHE_TTL_SECONDS = 3600;

  /** 2 hours in seconds for workspace metadata cache */
  public static readonly WORKSPACE_CACHE_TTL_SECONDS = 7200;

  /** 24 hours in seconds for user profile cache */
  public static readonly USER_CACHE_TTL_SECONDS = 86400;

  /** 1 minute in seconds for default API rate limit window */
  public static readonly DEFAULT_RATE_LIMIT_TTL_SECONDS = 60;

  /** 7 days in seconds for refresh token storage */
  public static readonly REFRESH_TOKEN_TTL_SECONDS = 604800;
}
