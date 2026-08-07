export const SystemConstants = {
  /** Sentinel UUID used as the actor ID for system-generated events with no human actor. */
  SYSTEM_USER_ID: '00000000-0000-0000-0000-000000000000',
  /** Default transaction timeout in milliseconds for auth workflows. */
  DEFAULT_AUTH_TRANSACTION_TIMEOUT_MS: 60_000,
  /** Default transaction timeout in milliseconds for workspace workflows. */
  DEFAULT_WORKSPACE_TRANSACTION_TIMEOUT_MS: 20_000,
} as const;
