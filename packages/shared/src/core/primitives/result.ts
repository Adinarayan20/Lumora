import { ApplicationException } from "../errors/application-exception.js";
import { ErrorCode } from "../errors/error-code.js";

/**
 * Type-safe monadic container representing either a successful outcome (T) or a failed outcome (E).
 * Prevents using exception control flow for expected business validation failures.
 */
export class Result<T, E = ApplicationException> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T | undefined;
  private readonly _error?: E | undefined;

  private constructor(
    isSuccess: boolean,
    value?: T | undefined,
    error?: E | undefined,
  ) {
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
  public static fail<T = never, E = ApplicationException>(
    error: E,
  ): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Combines an array of Result instances into a single Result containing an array of values.
   * Returns the first failed Result if any element is a failure.
   */
  public static combine<T, E = ApplicationException>(
    results: Result<T, E>[],
  ): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail<T[], E>(result.getError());
      }
      values.push(result.getValue());
    }
    return Result.ok<T[], E>(values);
  }

  /**
   * Retrieves the successful value.
   * @throws {ResultAccessException} if called on a failed Result.
   */
  public getValue(): T {
    if (!this.isSuccess) {
      throw new ResultAccessException(
        "Cannot retrieve value from a failed Result instance.",
      );
    }
    return this._value as T;
  }

  /**
   * Retrieves the error object.
   * @throws {ResultAccessException} if called on a successful Result.
   */
  public getError(): E {
    if (this.isSuccess) {
      throw new ResultAccessException(
        "Cannot retrieve error from a successful Result instance.",
      );
    }
    return this._error as E;
  }

  /**
   * Returns the value if successful, or the provided fallback value if failed.
   */
  public unwrapOr(fallback: T): T {
    return this.isSuccess ? (this._value as T) : fallback;
  }

  /**
   * Transforms the successful value using the provided mapping function.
   * If this Result is a failure, returns a new failed Result containing the original error.
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this._error as E);
    }
    return Result.ok<U, E>(fn(this._value as T));
  }

  /**
   * Chains another Result-returning operation onto a successful Result.
   */
  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail<U, E>(this._error as E);
    }
    return fn(this._value as T);
  }

  /**
   * Pattern matches on the Result outcome, calling onOk for success or onFail for failure.
   */
  public match<R>(onOk: (value: T) => R, onFail: (error: E) => R): R {
    if (this.isSuccess) {
      return onOk(this._value as T);
    }
    return onFail(this._error as E);
  }
}

/**
 * Exception thrown when invalid API usage access attempts are made on Result instances.
 * System error representing developer usage violation rather than business rule failure.
 */
export class ResultAccessException extends ApplicationException {
  constructor(message: string) {
    super(message, ErrorCode.SYSTEM_ERROR);
  }
}
