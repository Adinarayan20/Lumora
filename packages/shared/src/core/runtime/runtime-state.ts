/**
 * Strongly typed State Machine lifecycle status for LumoraObjectRuntime instances.
 */
export enum RuntimeState {
  CREATED = "CREATED",
  INITIALIZING = "INITIALIZING",
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
  ARCHIVED = "ARCHIVED",
  SOFT_DELETED = "SOFT_DELETED",
  RESTORED = "RESTORED",
  PURGED = "PURGED",
}
