import { UniqueEntityId } from '../primitives/unique-entity-id.js';
import type { IDomainEvent } from './domain-event.interface.js';

/**
 * Abstract base class for concrete domain events.
 * Enforces automatic eventId generation, occurredAt timestamps, and payload freezing.
 */
export abstract class BaseDomainEvent<TPayload extends Record<string, unknown>>
  implements IDomainEvent<TPayload> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName: string;
  public readonly aggregateId: string;
  public readonly workspaceId?: string | undefined;
  public readonly occurredAt: Date;
  public readonly payload: TPayload;

  constructor(
    eventName: string,
    aggregateId: string,
    payload: TPayload,
    workspaceId?: string | undefined,
    eventId?: UniqueEntityId | undefined,
    occurredAt?: Date | undefined,
  ) {
    this.eventId = eventId ?? new UniqueEntityId();
    this.eventName = eventName;
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = occurredAt ?? new Date();
    this.payload = Object.freeze({ ...payload });

    Object.freeze(this);
  }
}
