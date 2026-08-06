import { ApplicationException } from '../errors/application-exception.js';
import { ErrorCode } from '../errors/error-code.js';

/**
 * Type-safe monadic container representing either a successful outcome or a failed outcome.
 * Prevents using exception control flow for expected business validation failures.
 */
export class Result<T, E = ApplicationException> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T | undefined;
  private readonly _error?: E | undefined;

  private constructor(isSuccess: boolean, value?: T | undefined, error?: E | undefined) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._value = value;
    this._error = error;

    Object.freeze(this);
  }

  /**
   * Creates a successful Result instance containing the given value.
   */
  public static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  /**
   * Creates a failure Result instance containing the given error.
   */
  public static fail<T = never, E = ApplicationException>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Retrieves the successful value.
   * @throws {ApplicationException} if called on a failed Result.
   */
  public getValue(): T {
    if (!this.isSuccess) {
      throw new ResultAccessException('Cannot retrieve value from a failed Result instance.');
    }
    return this._value as T;
  }

  /**
   * Retrieves the error object.
   * @throws {ApplicationException} if called on a successful Result.
   */
  public getError(): E {
    if (this.isSuccess) {
      throw new ResultAccessException('Cannot retrieve error from a successful Result instance.');
    }
    return this._error as E;
  }
}

/**
 * Exception thrown when invalid access attempts are made on Result instances.
 */
export class ResultAccessException extends ApplicationException {
  constructor(message: string) {
    super(message, ErrorCode.DOMAIN_VALIDATION_ERROR);
  }
}
