import { BaseDomainEvent } from '../base-domain-event.js';

export interface ReminderScheduledPayload extends Record<string, unknown> {
  readonly workspaceId: string;
  readonly reminderId: string;
  readonly objectId: string;
  readonly remindAt: string;
  readonly recurrenceRule?: string | undefined;
}

export interface ReminderTriggeredPayload extends Record<string, unknown> {
  readonly workspaceId: string;
  readonly reminderId: string;
  readonly objectId: string;
  readonly executionId: string;
  readonly triggeredAt: string;
}

export interface ReminderCompletedPayload extends Record<string, unknown> {
  readonly workspaceId: string;
  readonly reminderId: string;
  readonly objectId: string;
  readonly completedAt: string;
}

/**
 * Event emitted when a reminder is scheduled.
 */
export class ReminderScheduledEvent extends BaseDomainEvent<ReminderScheduledPayload> {
  public static readonly EVENT_NAME = 'reminder.scheduled';

  constructor(payload: ReminderScheduledPayload) {
    super(ReminderScheduledEvent.EVENT_NAME, payload.reminderId, payload, payload.workspaceId);
  }
}

/**
 * Event emitted when a reminder execution triggers.
 */
export class ReminderTriggeredEvent extends BaseDomainEvent<ReminderTriggeredPayload> {
  public static readonly EVENT_NAME = 'reminder.triggered';

  constructor(payload: ReminderTriggeredPayload) {
    super(ReminderTriggeredEvent.EVENT_NAME, payload.reminderId, payload, payload.workspaceId);
  }
}

/**
 * Event emitted when a reminder is marked as completed.
 */
export class ReminderCompletedEvent extends BaseDomainEvent<ReminderCompletedPayload> {
  public static readonly EVENT_NAME = 'reminder.completed';

  constructor(payload: ReminderCompletedPayload) {
    super(ReminderCompletedEvent.EVENT_NAME, payload.reminderId, payload, payload.workspaceId);
  }
}
