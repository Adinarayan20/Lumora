/**
 * Centralized configuration default constants for the Transactional Outbox Engine.
 */
export const OUTBOX_DEFAULTS = {
  DEFAULT_POLL_INTERVAL_MS: 2000,
  DEFAULT_BATCH_SIZE: 50,
  DEFAULT_MAX_RETRIES: 5,
  DEFAULT_STALE_LOCK_THRESHOLD_MS: 30000,
} as const;
