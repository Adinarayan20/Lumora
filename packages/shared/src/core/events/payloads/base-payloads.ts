import type { UniqueEntityId } from "../../primitives/unique-entity-id.js";

/**
 * Common payload base interface for Universal Object events.
 */
export interface BaseObjectPayload extends Record<string, unknown> {
  readonly workspaceId: UniqueEntityId;
  readonly objectId: UniqueEntityId;
  readonly typeKey: string;
}

/**
 * Common payload base interface for Reminder events.
 */
export interface BaseReminderPayload extends Record<string, unknown> {
  readonly workspaceId: UniqueEntityId;
  readonly reminderId: UniqueEntityId;
  readonly objectId: UniqueEntityId;
}
