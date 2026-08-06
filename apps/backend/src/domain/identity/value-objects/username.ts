import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface UsernameProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated Lumora username (3-32 alphanumeric characters or underscores).
 */
export class Username extends ValueObject<UsernameProps> {
  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_]{3,32}$/;

  private constructor(props: UsernameProps) {
    super(props);
  }

  public static create(username: string): Username {
    const lengthGuard = Guard.againstInvalidLength(username, 3, 32, 'username');
    if (lengthGuard.isFailure) {
      throw lengthGuard.getError();
    }

    const trimmed = username.trim().toLowerCase();
    if (!Username.USERNAME_REGEX.test(trimmed)) {
      throw new DomainValidationException(
        `Invalid username '${username}'. Must be 3-32 alphanumeric characters or underscores.`,
        { username: [`Format is invalid.`] },
      );
    }

    return new Username({ value: trimmed });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
