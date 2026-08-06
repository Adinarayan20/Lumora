import { DomainValidationException } from "../errors/domain-exceptions.js";
import { IdGenerator } from "./id-generator.js";
import { ValueObject } from "./value-object.js";

interface UniqueEntityIdProps extends Record<string, unknown> {
  value: string;
}

/**
 * Domain Value Object encapsulating a validated RFC 4122 v4 UUID string identifier.
 */
export class UniqueEntityId extends ValueObject<UniqueEntityIdProps> {
  constructor(id?: string | undefined) {
    const rawValue = id ?? IdGenerator.generate();

    if (!UniqueEntityId.isValid(rawValue)) {
      throw new DomainValidationException(
        `Invalid unique identifier format '${rawValue}'. Expected valid UUID v4.`,
        { id: [`Identifier '${rawValue}' is not a valid RFC 4122 v4 UUID.`] },
      );
    }

    super({ value: rawValue });
  }

  /**
   * Validates whether a given string is a valid RFC 4122 v4 UUID.
   */
  public static isValid(id: string): boolean {
    return IdGenerator.isValid(id);
  }

  /**
   * Returns the underlying string UUID value.
   */
  public toValue(): string {
    return this.props.value;
  }

  /**
   * Returns the underlying string UUID value.
   */
  public override toString(): string {
    return this.props.value;
  }

  /**
   * Compares equality with another UniqueEntityId instance.
   */
  public override equals(id?: UniqueEntityId | undefined): boolean {
    if (id === null || id === undefined) {
      return false;
    }

    if (this.constructor !== id.constructor) {
      return false;
    }

    return this.toValue() === id.toValue();
  }
}
