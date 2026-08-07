import { ApplicationException } from "./application-exception.js";
import { ErrorCode } from "./error-code.js";

/**
 * Abstract base class for access control and security exception failures.
 */
export abstract class SecurityException extends ApplicationException {}

/**
 * Thrown when user credentials are missing, invalid, or expired.
 */
export class UnauthorizedException extends SecurityException {
  constructor(
    message: string = "Authentication credentials are missing or invalid.",
  ) {
    super(message, ErrorCode.UNAUTHENTICATED);
  }
}

/**
 * Thrown when an authenticated user lacks permission for a requested resource or operation.
 */
export class ForbiddenException extends SecurityException {
  public readonly requiredPermission: string;

  constructor(
    requiredPermission: string,
    message: string = `Access denied. Missing required permission '${requiredPermission}'.`,
  ) {
    super(message, ErrorCode.INSUFFICIENT_PERMISSIONS, { requiredPermission });
    this.requiredPermission = requiredPermission;
  }
}

/**
 * Thrown when a user or IP address exceeds the configured rate limit quota.
 */
export class RateLimitExceededException extends SecurityException {
  public readonly retryAfterSeconds: number;

  constructor(
    retryAfterSeconds: number,
    message: string = `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
  ) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, { retryAfterSeconds });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
