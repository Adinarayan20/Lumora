import { describe, it, expect } from 'vitest';
import { ReminderAggregate } from '../reminder.aggregate.js';
import { RecurrenceRule } from '../value-objects/recurrence-rule.js';
import { ReminderSchedulingPolicy } from '../policies/reminder-scheduling.policy.js';
import { UniqueEntityId, DomainValidationException } from '@lumora/shared';

describe('ReminderAggregate Domain Root', () => {
  const workspaceId = new UniqueEntityId();
  const objectId = new UniqueEntityId();
  const createdById = new UniqueEntityId();
  const remindAt = new Date('2026-08-10T10:00:00Z');

  it('should create valid reminder aggregate and record ReminderScheduledEvent', () => {
    const reminder = ReminderAggregate.create({
      workspaceId,
      objectId,
      createdById,
      remindAt,
    });

    expect(reminder.id).toBeDefined();
    expect(reminder.remindAt).toEqual(remindAt);
    expect(reminder.hasUncommittedEvents()).toBe(true);
    expect(reminder.domainEvents[0].eventName).toBe('reminder.scheduled');
  });

  it('should calculate next occurrence for valid RRULE', () => {
    const rule = RecurrenceRule.create('FREQ=DAILY;INTERVAL=1');
    const nextDate = ReminderSchedulingPolicy.calculateNextOccurrence(remindAt, rule);

    expect(nextDate).toBeDefined();
    expect(nextDate?.toISOString()).toBe('2026-08-11T10:00:00.000Z');
  });

  it('should reject invalid RFC 5545 RRULE string', () => {
    expect(() => RecurrenceRule.create('INVALID_RRULE_STRING')).toThrow(DomainValidationException);
  });

  it('should trigger execution and update status', () => {
    const reminder = ReminderAggregate.create({
      workspaceId,
      objectId,
      createdById,
      remindAt,
    });

    reminder.pullDomainEvents(); // Clear scheduled event
    reminder.triggerExecution('exec-1001');

    expect(reminder.lastExecutionId).toBe('exec-1001');
    expect(reminder.executionStatus).toBe('TRIGGERED');
    expect(reminder.domainEvents.some((e) => e.eventName === 'reminder.triggered')).toBe(true);
  });
});
