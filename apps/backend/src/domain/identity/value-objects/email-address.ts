import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface EmailAddressProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated RFC 5321 email address.
 */
export class EmailAddress extends ValueObject<EmailAddressProps> {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private constructor(props: EmailAddressProps) {
    super(props);
  }

  public static create(email: string): EmailAddress {
    const nullGuard = Guard.againstEmptyString(email, 'email');
    if (nullGuard.isFailure) {
      throw nullGuard.getError();
    }

    const trimmed = email.trim().toLowerCase();
    if (!EmailAddress.EMAIL_REGEX.test(trimmed)) {
      throw new DomainValidationException(
        `Invalid email address format '${email}'.`,
        { email: [`Format is invalid.`] },
      );
    }

    return new EmailAddress({ value: trimmed });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
