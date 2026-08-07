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
 * - Unknown/unmapped error codes fall to 500 Internal Server Error (fail-safe, no leakage).
 * - Registered globally via APP_FILTER in AppModule.
 */
@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = ApplicationExceptionFilter.toHttpStatus(exception.code);

    response.status(status).json({
      error: {
        code: exception.code,
        message: exception.message,
        ...(exception.details !== undefined && { details: exception.details }),
      },
    });
  }

  /**
   * Maps a domain ErrorCode to an HTTP status code.
   * Add new codes here when expanding the ErrorCode enum.
   */
  private static toHttpStatus(code: ErrorCode): number {
    switch (code) {
      // ─── 404 Not Found ──────────────────────────────────────────────────
      case ErrorCode.ENTITY_NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      // ─── 409 Conflict ───────────────────────────────────────────────────
      case ErrorCode.RESOURCE_CONFLICT:
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

      // ─── 400 Bad Request ────────────────────────────────────────────────
      case ErrorCode.DOMAIN_VALIDATION_ERROR:
      case ErrorCode.REVISION_CONFLICT:
      case ErrorCode.EMAIL_ALREADY_REGISTERED:
      case ErrorCode.USERNAME_TAKEN:
      case ErrorCode.OAUTH_ACCOUNT_RESOLUTION_FAILED:
      case ErrorCode.PERSONAL_WORKSPACE_DELETION_FORBIDDEN:
      case ErrorCode.TARGET_NOT_WORKSPACE_MEMBER:
      case ErrorCode.RECURRENCE_RULE_INVALID:
      case ErrorCode.REMINDER_ONLY_ACTIVE_CAN_SNOOZE:
        return HttpStatus.BAD_REQUEST;

      // ─── 500 Internal Server Error (fail-safe default) ──────────────────
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
