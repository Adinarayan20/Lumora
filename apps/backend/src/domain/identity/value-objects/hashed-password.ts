import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface HashedPasswordProps extends Record<string, unknown> {
  hash: string;
}

/**
 * Value Object encapsulating a non-sensitive bcrypt-hashed password string.
 * Prevents raw plaintext passwords from being represented as HashedPassword instances.
 */
export class HashedPassword extends ValueObject<HashedPasswordProps> {
  private constructor(props: HashedPasswordProps) {
    super(props);
  }

  public static create(hash: string): HashedPassword {
    const emptyGuard = Guard.againstEmptyString(hash, 'passwordHash');
    if (emptyGuard.isFailure) {
      throw emptyGuard.getError();
    }

    if (
      !hash.startsWith('$2a$') &&
      !hash.startsWith('$2b$') &&
      hash.length < 20
    ) {
      throw new DomainValidationException(
        `Invalid hashed password payload format.`,
        { passwordHash: [`Value must be a valid bcrypt password hash.`] },
      );
    }

    return new HashedPassword({ hash });
  }

  public toValue(): string {
    return this.props.hash;
  }
}
