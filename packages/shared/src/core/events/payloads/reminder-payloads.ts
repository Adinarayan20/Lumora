import type { InstantString } from "../instant-string.js";
import type { BaseReminderPayload } from "./base-payloads.js";

export interface ReminderScheduledPayload extends BaseReminderPayload {
  readonly remindAt: InstantString;
  readonly recurrenceRule?: string | undefined;
}

export interface ReminderTriggeredPayload extends BaseReminderPayload {
  readonly executionId: string;
  readonly triggeredAt: InstantString;
}

export interface ReminderCompletedPayload extends BaseReminderPayload {
  readonly completedAt: InstantString;
}
