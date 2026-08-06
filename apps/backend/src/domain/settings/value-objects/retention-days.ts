import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface RetentionDaysProps extends Record<string, unknown> {
  days: number;
}

export class RetentionDays extends ValueObject<RetentionDaysProps> {
  private constructor(props: RetentionDaysProps) {
    super(props);
  }

  public static create(days: number): RetentionDays {
    const nullGuard = Guard.againstNullOrUndefined(days, 'days');
    if (nullGuard.isFailure) throw nullGuard.getError();

    if (days < 1 || days > 3650) {
      throw new DomainValidationException(
        'Retention period must be between 1 and 3650 days (10 years).',
        { days: ['Retention period out of bounds (1..3650 days).'] },
      );
    }

    return new RetentionDays({ days });
  }

  public getDays(): number {
    return this.props.days;
  }
}
