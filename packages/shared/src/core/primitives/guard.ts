import { Result } from "./result.js";
import { DomainValidationException } from "../errors/domain-exceptions.js";

export interface GuardArgumentCollection {
  value: unknown;
  argumentName: string;
}

/**
 * Defensive domain invariant validation helpers returning monadic Result instances.
 */
export class Guard {
  /**
   * Asserts that a given value is neither null nor undefined.
   */
  public static againstNullOrUndefined(
    value: unknown,
    argumentName: string,
  ): Result<void, DomainValidationException> {
    if (value === null || value === undefined) {
      return Result.fail(
        new DomainValidationException(
          `Argument '${argumentName}' cannot be null or undefined.`,
          { [argumentName]: [`Value is required.`] },
        ),
      );
    }
    return Result.ok(undefined);
  }

  /**
   * Asserts that a bulk collection of arguments are all non-null and defined.
   */
  public static againstNullOrUndefinedBulk(
    args: readonly GuardArgumentCollection[],
  ): Result<void, DomainValidationException> {
    for (const arg of args) {
      const result = Guard.againstNullOrUndefined(arg.value, arg.argumentName);
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok(undefined);
  }

  /**
   * Asserts that a string parameter is non-null, defined, and non-empty after trimming.
   */
  public static againstEmptyString(
    value: string,
    argumentName: string,
  ): Result<void, DomainValidationException> {
    const nullCheck = Guard.againstNullOrUndefined(value, argumentName);
    if (nullCheck.isFailure) {
      return nullCheck;
    }

    if (typeof value !== "string" || value.trim().length === 0) {
      return Result.fail(
        new DomainValidationException(
          `Argument '${argumentName}' cannot be empty string or whitespace.`,
          { [argumentName]: [`Value must not be empty.`] },
        ),
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Asserts that a string length falls within specified inclusive boundaries.
   */
  public static againstInvalidLength(
    value: string,
    minLength: number,
    maxLength: number,
    argumentName: string,
  ): Result<void, DomainValidationException> {
    const stringCheck = Guard.againstEmptyString(value, argumentName);
    if (stringCheck.isFailure && minLength > 0) {
      return stringCheck;
    }

    const strValue = value ?? "";
    if (strValue.length < minLength || strValue.length > maxLength) {
      return Result.fail(
        new DomainValidationException(
          `Argument '${argumentName}' length (${strValue.length}) out of range [${minLength}, ${maxLength}].`,
          {
            [argumentName]: [
              `Length must be between ${minLength} and ${maxLength} characters.`,
            ],
          },
        ),
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Asserts that a numeric parameter is a positive number strictly greater than zero.
   */
  public static againstNegativeOrZero(
    value: number,
    argumentName: string,
  ): Result<void, DomainValidationException> {
    const nullCheck = Guard.againstNullOrUndefined(value, argumentName);
    if (nullCheck.isFailure) {
      return nullCheck;
    }

    if (typeof value !== "number" || isNaN(value) || value <= 0) {
      return Result.fail(
        new DomainValidationException(
          `Argument '${argumentName}' must be a positive number greater than zero.`,
          { [argumentName]: [`Value must be > 0.`] },
        ),
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Asserts that a numeric parameter falls within an inclusive range [min, max].
   */
  public static inRange(
    value: number,
    min: number,
    max: number,
    argumentName: string,
  ): Result<void, DomainValidationException> {
    const nullCheck = Guard.againstNullOrUndefined(value, argumentName);
    if (nullCheck.isFailure) {
      return nullCheck;
    }

    if (
      typeof value !== "number" ||
      isNaN(value) ||
      value < min ||
      value > max
    ) {
      return Result.fail(
        new DomainValidationException(
          `Argument '${argumentName}' (${value}) must be within range [${min}, ${max}].`,
          { [argumentName]: [`Value must be between ${min} and ${max}.`] },
        ),
      );
    }

    return Result.ok(undefined);
  }
}
