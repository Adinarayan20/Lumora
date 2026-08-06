export const ReminderSource = {
  MANUAL: 'MANUAL',
  AI: 'AI',
  AUTOMATION: 'AUTOMATION',
  CALENDAR: 'CALENDAR',
  IMPORT: 'IMPORT',
  API: 'API',
} as const;

export type ReminderSource = (typeof ReminderSource)[keyof typeof ReminderSource];

export const ReminderTriggerType = {
  TIME: 'TIME',
  LOCATION: 'LOCATION',
  WEBHOOK: 'WEBHOOK',
  AI: 'AI',
  AUTOMATION: 'AUTOMATION',
} as const;

export type ReminderTriggerType =
  (typeof ReminderTriggerType)[keyof typeof ReminderTriggerType];

export const ReminderStatus = {
  ACTIVE: 'ACTIVE',
  SNOOZED: 'SNOOZED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISMISSED: 'DISMISSED',
  DELETED: 'DELETED',
} as const;

export type ReminderStatus = (typeof ReminderStatus)[keyof typeof ReminderStatus];

export const ReminderExecutionStatus = {
  PENDING: 'PENDING',
  TRIGGERED: 'TRIGGERED',
  SNOOZED: 'SNOOZED',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED',
} as const;

export type ReminderExecutionStatus =
  (typeof ReminderExecutionStatus)[keyof typeof ReminderExecutionStatus];

export const ReminderPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type ReminderPriority =
  (typeof ReminderPriority)[keyof typeof ReminderPriority];
