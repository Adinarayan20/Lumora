import type { UniqueEntityId } from '../primitives/unique-entity-id.js';

/**
 * Pure, framework-agnostic data contract representing an immutable domain event.
 * Uses Value Objects for aggregate and workspace identities, ISO-8601 strings for timestamps,
 * and explicit schema versioning for long-term platform evolution.
 */
export interface DomainEvent<
  TName extends string = string,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * Unique event identifier value object.
   */
  readonly eventId: UniqueEntityId;

  /**
   * Strongly typed event name constant string.
   */
  readonly eventName: TName;

  /**
   * Unique entity/aggregate identifier value object emiting the event.
   */
  readonly aggregateId: UniqueEntityId;

  /**
   * Optional multi-tenant workspace identifier value object for tenant isolation.
   */
  readonly workspaceId?: UniqueEntityId | undefined;

  /**
   * ISO-8601 formatted timestamp string when the event occurred.
   */
  readonly occurredAt: string;

  /**
   * Schema version number for event payload evolution (default = 1).
   */
  readonly schemaVersion: number;

  /**
   * Strongly typed immutable payload data object.
   */
  readonly payload: Readonly<TPayload>;
}
