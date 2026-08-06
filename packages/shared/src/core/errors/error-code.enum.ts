/**
 * Standardized machine-readable error code enumeration.
 * Maps unique error identifier strings used across domain, application, and API layers.
 */
export enum ErrorCode {
  // Domain Rule Violations
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  DOMAIN_VALIDATION_ERROR = 'DOMAIN_VALIDATION_ERROR',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // Access Control & Security
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // System & Infrastructure Failure
  INTERNAL_INFRASTRUCTURE_ERROR = 'INTERNAL_INFRASTRUCTURE_ERROR',
}
