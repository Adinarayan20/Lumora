import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationException, ErrorCode } from '@lumora/shared';

/**
 * Global NestJS exception filter for all ApplicationException subclasses.
 *
 * Maps structured ErrorCode values to HTTP status codes.
 * Produces a consistent error body:
 *   { error: { code: string, message: string, details?: Record<string, unknown> } }
 *
 * Design decisions:
 * - Controllers throw ApplicationException subclasses (or re-throw from Result failures).
 * - This filter catches them and performs the HTTP mapping — controllers never do it.
 * - Compile-time exhaustiveness check guarantees all ErrorCode values are mapped.
 * - Unknown/unmapped error codes fall back to 500 Internal Server Error (runtime fail-safe).
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
   * Guaranteed exhaustive at compile-time for all declared ErrorCode values.
   */
  public static toHttpStatus(code: ErrorCode): number {
    switch (code) {
      // ─── 404 Not Found ──────────────────────────────────────────────────
      case ErrorCode.ENTITY_NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      // ─── 409 Conflict (State / Resource Collision) ─────────────────────
      case ErrorCode.RESOURCE_CONFLICT:
      case ErrorCode.REVISION_CONFLICT:
      case ErrorCode.EMAIL_ALREADY_REGISTERED:
      case ErrorCode.USERNAME_TAKEN:
        return HttpStatus.CONFLICT;

      // ─── 401 Unauthorized ───────────────────────────────────────────────
      case ErrorCode.UNAUTHENTICATED:
      case ErrorCode.INVALID_CREDENTIALS:
      case ErrorCode.SESSION_EXPIRED:
      case ErrorCode.INVALID_REFRESH_TOKEN:
        return HttpStatus.UNAUTHORIZED;

      // ─── 403 Forbidden ──────────────────────────────────────────────────
      case ErrorCode.INSUFFICIENT_PERMISSIONS:
        return HttpStatus.FORBIDDEN;

      // ─── 400 Bad Request (Validation & Domain Invariants) ──────────────
      case ErrorCode.DOMAIN_VALIDATION_ERROR:
      case ErrorCode.OAUTH_ACCOUNT_RESOLUTION_FAILED:
      case ErrorCode.PERSONAL_WORKSPACE_DELETION_FORBIDDEN:
      case ErrorCode.TARGET_NOT_WORKSPACE_MEMBER:
      case ErrorCode.RECURRENCE_RULE_INVALID:
      case ErrorCode.REMINDER_ONLY_ACTIVE_CAN_SNOOZE:
        return HttpStatus.BAD_REQUEST;

      // ─── 500 Internal Server Error ──────────────────────────────────────
      case ErrorCode.SYSTEM_ERROR:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      // ─── Compile-Time Exhaustiveness & Runtime Fail-Safe Fallback ──────
      default: {
        const _exhaustiveCheck: never = code;
        void _exhaustiveCheck;
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
