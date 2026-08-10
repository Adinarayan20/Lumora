/**
 * Standardized machine-readable error code constant object and type definition.
 * Maps unique error identifier strings used across domain, application, and API layers.
 *
 * Grouped by domain for discoverability. The global ApplicationExceptionFilter maps
 * each code to an HTTP status code — controllers must never perform this mapping themselves.
 */
export const ErrorCode = {
  // ─── Domain Rule Violations ───────────────────────────────────────────────

  /** A requested aggregate root or entity could not be resolved. */
  ENTITY_NOT_FOUND: "ENTITY_NOT_FOUND",

  /** A domain constraint, property invariant, or business rule validation failed. */
  DOMAIN_VALIDATION_ERROR: "DOMAIN_VALIDATION_ERROR",

  /** A unique constraint or optimistic-concurrency collision occurred. */
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",

  /** Optimistic-concurrency revision field mismatch on update. */
  REVISION_CONFLICT: "REVISION_CONFLICT",

  // ─── Auth Domain ─────────────────────────────────────────────────────────

  /** Registration was rejected because the supplied email is already registered. */
  EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",

  /** Registration was rejected because the supplied username is already taken. */
  USERNAME_TAKEN: "USERNAME_TAKEN",

  /** Login failed because email/username or password did not match. */
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  /** The session has expired and the user must re-authenticate. */
  SESSION_EXPIRED: "SESSION_EXPIRED",

  /** The supplied refresh token is invalid, revoked, or expired. */
  INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",

  /** An OAuth provider user could not be resolved to a Lumora account. */
  OAUTH_ACCOUNT_RESOLUTION_FAILED: "OAUTH_ACCOUNT_RESOLUTION_FAILED",

  // ─── Workspace Domain ─────────────────────────────────────────────────────

  /** Attempted to delete a PERSONAL workspace, which is permanent and cannot be removed. */
  PERSONAL_WORKSPACE_DELETION_FORBIDDEN:
    "PERSONAL_WORKSPACE_DELETION_FORBIDDEN",

  /** The target user for a membership or ownership operation is not a workspace member. */
  TARGET_NOT_WORKSPACE_MEMBER: "TARGET_NOT_WORKSPACE_MEMBER",

  // ─── Reminder Domain ──────────────────────────────────────────────────────

  /** The supplied RRULE recurrence string is not a valid RFC 5545 recurrence rule. */
  RECURRENCE_RULE_INVALID: "RECURRENCE_RULE_INVALID",

  /** A snooze operation was rejected because the reminder is not in ACTIVE status. */
  REMINDER_ONLY_ACTIVE_CAN_SNOOZE: "REMINDER_ONLY_ACTIVE_CAN_SNOOZE",

  // ─── Access Control & Security ────────────────────────────────────────────

  /** Credentials are missing, invalid, or the token has expired. Maps to HTTP 401. */
  UNAUTHENTICATED: "UNAUTHENTICATED",

  /** The authenticated user lacks a required permission for this operation. Maps to HTTP 403. */
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  /** Too many requests have been sent in a given time window. Maps to HTTP 429. */
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // ─── System Failures ──────────────────────────────────────────────────────

  /** An unrecoverable infrastructure or system error occurred. Maps to HTTP 500. */
  SYSTEM_ERROR: "SYSTEM_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
