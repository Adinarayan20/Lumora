import { ApplicationException } from './application-exception.js';
import { ErrorCode } from './error-code.js';

/**
 * Thrown when an underlying database, file system, network, or system process fails unexpectedly.
 */
export class SystemException extends ApplicationException {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    const causeMessage = originalError instanceof Error ? originalError.message : String(originalError ?? '');
    super(message, ErrorCode.SYSTEM_ERROR, {
      ...(causeMessage && { causeMessage }),
    });
    this.originalError = originalError;
  }
}
