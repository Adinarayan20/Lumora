import { rrulestr } from 'rrule';
import { RecurrenceRule } from '../value-objects/recurrence-rule.js';

/**
 * Domain Policy encapsulating recurrence calculation and snooze duration target dates.
 */
export class ReminderSchedulingPolicy {
  public static calculateNextOccurrence(
    remindAt: Date,
    recurrenceRule?: RecurrenceRule,
  ): Date | null {
    if (!recurrenceRule) {
      return null;
    }

    try {
      const rule = rrulestr(recurrenceRule.toValue(), { dtstart: remindAt });
      const nextDate = rule.after(remindAt, false);
      return nextDate ?? null;
    } catch {
      return null;
    }
  }

  public static calculateSnoozeTarget(
    baseDate: Date,
    offsetMinutes: number = 15,
  ): Date {
    return new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
  }
}
