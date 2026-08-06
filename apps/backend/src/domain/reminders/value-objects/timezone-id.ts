import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface TimezoneIdProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated IANA timezone identifier.
 */
export class TimezoneId extends ValueObject<TimezoneIdProps> {
  private constructor(props: TimezoneIdProps) {
    super(props);
  }

  public static create(timezone: string = 'UTC'): TimezoneId {
    const emptyGuard = Guard.againstEmptyString(timezone, 'timezone');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    const trimmed = timezone.trim();
    try {
      Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    } catch {
      throw new DomainValidationException(
        `Invalid IANA timezone identifier '${timezone}'.`,
        { timezone: [`Timezone identifier is invalid.`] },
      );
    }

    return new TimezoneId({ value: trimmed });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
