import type { BaseReminderPayload } from './base-payloads.js';

export interface ReminderScheduledPayload extends BaseReminderPayload {
  readonly remindAt: string;
  readonly recurrenceRule?: string | undefined;
}

export interface ReminderTriggeredPayload extends BaseReminderPayload {
  readonly executionId: string;
  readonly triggeredAt: string;
}

export interface ReminderCompletedPayload extends BaseReminderPayload {
  readonly completedAt: string;
}
