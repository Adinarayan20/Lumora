import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface TimezonePreferenceProps extends Record<string, unknown> {
  value: string;
}

export class TimezonePreference extends ValueObject<TimezonePreferenceProps> {
  private constructor(props: TimezonePreferenceProps) {
    super(props);
  }

  public static create(timezone: string): TimezonePreference {
    const nullGuard = Guard.againstNullOrUndefined(timezone, 'timezone');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = timezone.trim();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'timezone');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length > 64) {
      throw new DomainValidationException(
        'Timezone string length cannot exceed 64 characters.',
        { timezone: ['Timezone length exceeds 64 characters limit.'] },
      );
    }

    return new TimezonePreference({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
