import type { UniqueEntityId } from '../primitives/unique-entity-id.js';

/**
 * Pure, framework-agnostic contract interface representing an immutable domain event.
 */
export interface IDomainEvent<TPayload = Record<string, unknown>> {
  /**
   * Unique event identifier.
   */
  readonly eventId: UniqueEntityId;

  /**
   * Canonical event name string (e.g. 'object.created', 'reminder.triggered').
   */
  readonly eventName: string;

  /**
   * Identifier of the primary aggregate root emitting the event.
   */
  readonly aggregateId: string;

  /**
   * Optional multi-tenant workspace identifier for security and tenant isolation.
   */
  readonly workspaceId?: string | undefined;

  /**
   * Timestamp when the event occurred.
   */
  readonly occurredAt: Date;

  /**
   * Strongly typed domain event payload data contract.
   */
  readonly payload: TPayload;
}
