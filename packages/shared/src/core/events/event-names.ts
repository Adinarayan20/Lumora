/**
 * Strongly typed event name constant objects and union types for compile-time safety.
 */
export const UserEventName = {
  REGISTERED: 'user.registered',
} as const;

export type UserEventName = (typeof UserEventName)[keyof typeof UserEventName];

export const WorkspaceEventName = {
  CREATED: 'workspace.created',
} as const;

export type WorkspaceEventName = (typeof WorkspaceEventName)[keyof typeof WorkspaceEventName];

export const ObjectEventName = {
  CREATED: 'object.created',
  UPDATED: 'object.updated',
  DELETED: 'object.deleted',
} as const;

export type ObjectEventName = (typeof ObjectEventName)[keyof typeof ObjectEventName];

export const ReminderEventName = {
  SCHEDULED: 'reminder.scheduled',
  TRIGGERED: 'reminder.triggered',
  COMPLETED: 'reminder.completed',
} as const;

export type ReminderEventName = (typeof ReminderEventName)[keyof typeof ReminderEventName];

/**
 * Union type representing all valid domain event name string literals.
 */
export type DomainEventName =
  | UserEventName
  | WorkspaceEventName
  | ObjectEventName
  | ReminderEventName;
