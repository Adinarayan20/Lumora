import type { ErrorCode } from '../error-code.enum.js';

/**
 * Standardized JSON payload interface for application exceptions.
 * Ensures consistent error formatting across process and API boundaries.
 */
export interface ApplicationErrorPayload {
  readonly success: false;
  readonly code: ErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
}
