import { ApplicationException } from "./application-exception.js";
import { ErrorCode } from "./error-code.js";

/**
 * Thrown when an underlying database, file system, network, or system process fails unexpectedly.
 */
export class SystemException extends ApplicationException {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    let causeMessage: string | undefined;
    if (originalError instanceof Error) {
      causeMessage = originalError.message;
    } else if (typeof originalError === "string") {
      causeMessage = originalError;
    }

    super(
      message,
      ErrorCode.SYSTEM_ERROR,
      causeMessage !== undefined ? { causeMessage } : undefined,
    );
    this.originalError = originalError;
  }
}
