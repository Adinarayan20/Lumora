import {
  ReminderSource,
  ReminderTriggerType,
} from '../../../generated/prisma/client';

export class ReminderCreatedEvent {
  static readonly EVENT_NAME = 'reminder.created';
  constructor(
    public readonly reminderId: string,
    public readonly workspaceId: string,
    public readonly objectId: string,
    public readonly createdById: string,
    public readonly remindAt: Date,
    public readonly recurrenceRule?: string | null,
    public readonly source?: ReminderSource,
    public readonly triggerType?: ReminderTriggerType,
  ) {}
}

export class ReminderTriggeredEvent {
  static readonly EVENT_NAME = 'reminder.triggered';
  constructor(
    public readonly reminderId: string,
    public readonly workspaceId: string,
    public readonly objectId: string,
    public readonly executionId: string,
    public readonly triggeredAt: Date,
    public readonly nextOccurrenceAt?: Date | null,
  ) {}
}

export class ReminderSnoozedEvent {
  static readonly EVENT_NAME = 'reminder.snoozed';
  constructor(
    public readonly reminderId: string,
    public readonly workspaceId: string,
    public readonly objectId: string,
    public readonly userId: string,
    public readonly snoozedUntil: Date,
  ) {}
}

export class ReminderCompletedEvent {
  static readonly EVENT_NAME = 'reminder.completed';
  constructor(
    public readonly reminderId: string,
    public readonly workspaceId: string,
    public readonly objectId: string,
    public readonly userId: string,
    public readonly completedAt: Date,
  ) {}
}

export class ReminderCancelledEvent {
  static readonly EVENT_NAME = 'reminder.cancelled';
  constructor(
    public readonly reminderId: string,
    public readonly workspaceId: string,
    public readonly objectId: string,
    public readonly userId: string,
    public readonly cancelledAt: Date,
  ) {}
}

export class ReminderRestoredEvent {
  static readonly EVENT_NAME = 'reminder.restored';
  constructor(
    public readonly reminderId: string,
    public readonly workspaceId: string,
    public readonly objectId: string,
    public readonly userId: string,
  ) {}
}
