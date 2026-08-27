/**
 * Constant object type keys supported by the Lumora Universal Object Engine.
 *
 * IMPORTANT: REMINDER is intentionally absent. In the Lumora domain model,
 * a Reminder is a Responsibility that belongs to an Object — it is not itself
 * an Object type. See 03_SYSTEM_ARCHITECTURE.md §6, §15.
 */
export const ObjectTypeKey = {
  NOTE: "NOTE",
  TASK: "TASK",
  EVENT: "EVENT",
  DOCUMENT: "DOCUMENT",
  HABIT: "HABIT",
} as const;

export type ObjectTypeKey = (typeof ObjectTypeKey)[keyof typeof ObjectTypeKey];
