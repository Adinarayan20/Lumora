import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';
import { rrulestr } from 'rrule';

interface RecurrenceRuleProps extends Record<string, unknown> {
  value: string;
}

/**
 * Value Object encapsulating a validated RFC 5545 RRULE recurrence specification string.
 */
export class RecurrenceRule extends ValueObject<RecurrenceRuleProps> {
  private constructor(props: RecurrenceRuleProps) {
    super(props);
  }

  public static create(rule: string): RecurrenceRule {
    const emptyGuard = Guard.againstEmptyString(rule, 'recurrenceRule');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    const trimmed = rule.trim();
    try {
      rrulestr(trimmed);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Invalid RFC 5545 string';
      throw new DomainValidationException(
        `Invalid RFC 5545 recurrence rule '${rule}': ${msg}`,
        { recurrenceRule: [`Rule format is invalid.`] },
      );
    }

    return new RecurrenceRule({ value: trimmed });
  }

  public toValue(): string {
    return this.props.value;
  }

  public override toString(): string {
    return this.props.value;
  }
}
