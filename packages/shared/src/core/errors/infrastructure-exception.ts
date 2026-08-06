import { ApplicationException } from './application-exception.js';
import { ErrorCode } from './error-code.enum.js';

/**
 * Thrown when an underlying database, file system, or external integration service fails.
 */
export class InfrastructureException extends ApplicationException {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    const causeMessage = originalError instanceof Error ? originalError.message : String(originalError ?? '');
    super(message, ErrorCode.INTERNAL_INFRASTRUCTURE_ERROR, {
      ...(causeMessage && { causeMessage }),
    });
    this.originalError = originalError;
  }
}
