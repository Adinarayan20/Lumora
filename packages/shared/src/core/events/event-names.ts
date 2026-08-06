/**
 * Strongly typed event name constant objects and union types for compile-time safety.
 */
export const UserEventName = {
  REGISTERED: "user.registered",
  LOGGED_IN: "user.logged_in",
  PASSWORD_CHANGED: "user.password_changed",
  SESSION_REVOKED: "user.session_revoked",
} as const;

export type UserEventName = (typeof UserEventName)[keyof typeof UserEventName];

export const WorkspaceEventName = {
  CREATED: "workspace.created",
  UPDATED: "workspace.updated",
  DELETED: "workspace.deleted",
  OWNERSHIP_TRANSFERRED: "workspace.ownership_transferred",
  MEMBER_INVITED: "workspace.member_invited",
  MEMBER_JOINED: "workspace.member_joined",
  MEMBER_REMOVED: "workspace.member_removed",
} as const;

export type WorkspaceEventName =
  (typeof WorkspaceEventName)[keyof typeof WorkspaceEventName];

export const ObjectEventName = {
  CREATED: "object.created",
  UPDATED: "object.updated",
  DELETED: "object.deleted",
  ARCHIVED: "object.archived",
  RESTORED: "object.restored",
  PINNED: "object.pinned",
} as const;

export type ObjectEventName =
  (typeof ObjectEventName)[keyof typeof ObjectEventName];

export const ReminderEventName = {
  SCHEDULED: "reminder.scheduled",
  TRIGGERED: "reminder.triggered",
  SNOOZED: "reminder.snoozed",
  COMPLETED: "reminder.completed",
  CANCELLED: "reminder.cancelled",
  RESTORED: "reminder.restored",
} as const;

export type ReminderEventName =
  (typeof ReminderEventName)[keyof typeof ReminderEventName];

export const SpaceEventName = {
  CREATED: "space.created",
  UPDATED: "space.updated",
  DELETED: "space.deleted",
  ARCHIVED: "space.archived",
} as const;

export type SpaceEventName =
  (typeof SpaceEventName)[keyof typeof SpaceEventName];

export const CollectionEventName = {
  CREATED: "collection.created",
  UPDATED: "collection.updated",
  DELETED: "collection.deleted",
  ITEM_ADDED: "collection.item_added",
  ITEM_REMOVED: "collection.item_removed",
} as const;

export type CollectionEventName =
  (typeof CollectionEventName)[keyof typeof CollectionEventName];

export const NotificationEventName = {
  DELIVERED: "notification.delivered",
  FAILED: "notification.failed",
  READ: "notification.read",
} as const;

export type NotificationEventName =
  (typeof NotificationEventName)[keyof typeof NotificationEventName];

export const MediaEventName = {
  UPLOADED: "media.uploaded",
  DELETED: "media.deleted",
} as const;

export type MediaEventName =
  (typeof MediaEventName)[keyof typeof MediaEventName];

export const SearchEventName = {
  INDEXED: "search.indexed",
  REMOVED: "search.removed",
} as const;

export type SearchEventName =
  (typeof SearchEventName)[keyof typeof SearchEventName];

/**
 * Union type representing all valid domain event name string literals.
 */
export type DomainEventName =
  | UserEventName
  | WorkspaceEventName
  | ObjectEventName
  | ReminderEventName
  | SpaceEventName
  | CollectionEventName
  | NotificationEventName
  | MediaEventName
  | SearchEventName;
