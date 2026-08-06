import { ErrorCode } from './error-code.enum.js';
import type { ApplicationErrorPayload } from './interfaces/error-payload.interface.js';

/**
 * Abstract root exception class for the application.
 * Extends native Error with structured machine-readable codes, detail metadata, and payload serialization.
 */
export abstract class ApplicationException extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details ? Object.freeze({ ...details }) : undefined;
    this.timestamp = new Date().toISOString();

    // Restore prototype chain for TypeScript/ES5 compatibility
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture clean stack trace if supported by runtime
    const errorConstructor = Error as unknown as {
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    };
    if (typeof errorConstructor.captureStackTrace === 'function') {
      errorConstructor.captureStackTrace(this, new.target);
    }
  }

  /**
   * Serializes the exception into a standardized ApplicationErrorPayload object.
   */
  public toPayload(): ApplicationErrorPayload {
    return {
      success: false,
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
      timestamp: this.timestamp,
    };
  }
}
