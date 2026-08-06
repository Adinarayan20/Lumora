import type { UniqueEntityId } from "../primitives/unique-entity-id.js";
import type { DomainEventName } from "./event-names.js";
import type { InstantString } from "./instant-string.js";

/**
 * Pure, framework-agnostic data contract representing an immutable domain event.
 * Constrained by DomainEventName, uses Value Objects for aggregate identities, InstantString for ISO timestamps,
 * and explicit schema versioning for long-term platform evolution.
 */
export interface DomainEvent<
  TName extends DomainEventName = DomainEventName,
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
   * Unique entity/aggregate identifier value object emitting the event.
   */
  readonly aggregateId: UniqueEntityId;

  /**
   * Optional multi-tenant workspace identifier value object for tenant isolation.
   */
  readonly workspaceId?: UniqueEntityId | undefined;

  /**
   * ISO-8601 formatted timestamp string when the event occurred.
   */
  readonly occurredAt: InstantString;

  /**
   * Schema version number for event payload evolution (default = 1).
   */
  readonly schemaVersion: number;

  /**
   * Strongly typed immutable payload data object.
   */
  readonly payload: Readonly<TPayload>;
}
