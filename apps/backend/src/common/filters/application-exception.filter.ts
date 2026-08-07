import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationException, ErrorCode } from '@lumora/shared';

/**
 * Strict, type-safe lookup table mapping every ErrorCode to its HTTP status.
 * Utilizing TypeScript's Record<ErrorCode, number> guarantees compile-time completeness:
 * adding a new ErrorCode to @lumora/shared without updating this map will fail compilation.
 */
const HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  // ─── 404 Not Found ──────────────────────────────────────────────────
  [ErrorCode.ENTITY_NOT_FOUND]: HttpStatus.NOT_FOUND,

  // ─── 409 Conflict (State / Resource Collision) ─────────────────────
  [ErrorCode.RESOURCE_CONFLICT]: HttpStatus.CONFLICT,
  [ErrorCode.REVISION_CONFLICT]: HttpStatus.CONFLICT,
  [ErrorCode.EMAIL_ALREADY_REGISTERED]: HttpStatus.CONFLICT,
  [ErrorCode.USERNAME_TAKEN]: HttpStatus.CONFLICT,

  // ─── 401 Unauthorized ───────────────────────────────────────────────
  [ErrorCode.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.INVALID_REFRESH_TOKEN]: HttpStatus.UNAUTHORIZED,

  // ─── 403 Forbidden ──────────────────────────────────────────────────
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: HttpStatus.FORBIDDEN,

  // ─── 429 Too Many Requests ──────────────────────────────────────────
  [ErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,

  // ─── 400 Bad Request (Validation & Domain Invariants) ──────────────
  [ErrorCode.DOMAIN_VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.OAUTH_ACCOUNT_RESOLUTION_FAILED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.PERSONAL_WORKSPACE_DELETION_FORBIDDEN]: HttpStatus.BAD_REQUEST,
  [ErrorCode.TARGET_NOT_WORKSPACE_MEMBER]: HttpStatus.BAD_REQUEST,
  [ErrorCode.RECURRENCE_RULE_INVALID]: HttpStatus.BAD_REQUEST,
  [ErrorCode.REMINDER_ONLY_ACTIVE_CAN_SNOOZE]: HttpStatus.BAD_REQUEST,

  // ─── 500 Internal Server Error ──────────────────────────────────────
  [ErrorCode.SYSTEM_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};

/**
 * Global NestJS exception filter for all ApplicationException subclasses.
 *
 * Maps structured ErrorCode values to HTTP status codes via HTTP_STATUS_MAP.
 * Produces a consistent error body:
 *   { error: { code: string, message: string, details?: Record<string, unknown> } }
 *
 * Design decisions:
 * - Controllers throw ApplicationException subclasses (or re-throw from Result failures).
 * - This filter catches them and performs the HTTP mapping — controllers never do it.
 * - Record<ErrorCode, number> guarantees compile-time exhaustiveness for all ErrorCodes.
 * - Fallback to 500 Internal Server Error serves as a runtime fail-safe for unmapped strings.
 * - Registered globally via APP_FILTER in AppModule.
 */
@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = ApplicationExceptionFilter.toHttpStatus(exception.code);

    this.logException(exception, host, status);

    response.status(status).json({
      error: {
        code: exception.code,
        message: exception.message,
        ...(exception.details !== undefined && { details: exception.details }),
      },
    });
  }

  /**
   * Extension point for structured production logging.
   * Override or extend in subclasses/interceptors to log exception details,
   * request context, and stack traces without altering the public HTTP response payload.
   */
  protected logException(
    _exception: ApplicationException,
    _host: ArgumentsHost,
    _status: number,
  ): void {
    // Hook for production logger integration (e.g., Pino, Winston, OpenTelemetry)
    void _exception;
    void _host;
    void _status;
  }

  /**
   * Maps a domain ErrorCode to an HTTP status code.
   * Type-checked against Record<ErrorCode, number> for compile-time exhaustiveness.
   */
  public static toHttpStatus(code: ErrorCode): number {
    return HTTP_STATUS_MAP[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
