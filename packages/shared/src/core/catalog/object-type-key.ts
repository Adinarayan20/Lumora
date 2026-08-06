/**
 * Constant object type keys supported by the Lumora Universal Object Engine.
 */
export const ObjectTypeKey = {
  NOTE: "NOTE",
  TASK: "TASK",
  REMINDER: "REMINDER",
  EVENT: "EVENT",
  DOCUMENT: "DOCUMENT",
  HABIT: "HABIT",
} as const;

export type ObjectTypeKey = (typeof ObjectTypeKey)[keyof typeof ObjectTypeKey];
