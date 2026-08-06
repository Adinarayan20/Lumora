import { DomainValidationException } from '../errors/domain-exceptions.js';
import { ValueObject } from './value-object.js';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface UniqueEntityIdProps extends Record<string, unknown> {
  value: string;
}

/**
 * Domain Value Object encapsulating a validated RFC 4122 v4 UUID string identifier.
 */
export class UniqueEntityId extends ValueObject<UniqueEntityIdProps> {
  constructor(id?: string | undefined) {
    const rawValue = id ?? crypto.randomUUID();

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
    return UUID_V4_REGEX.test(id);
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

    if (!(id instanceof UniqueEntityId)) {
      return false;
    }

    return this.toValue() === id.toValue();
  }
}
