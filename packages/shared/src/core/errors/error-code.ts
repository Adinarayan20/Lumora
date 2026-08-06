/**
 * Standardized machine-readable error code constant object and type definition.
 * Maps unique error identifier strings used across domain, application, and API layers.
 */
export const ErrorCode = {
  // Domain Rule Violations
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  DOMAIN_VALIDATION_ERROR: 'DOMAIN_VALIDATION_ERROR',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Access Control & Security
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // System Failures
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
