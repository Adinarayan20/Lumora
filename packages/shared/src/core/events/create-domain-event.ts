import { UniqueEntityId } from '../primitives/unique-entity-id.js';
import type { DomainEvent } from './domain-event.interface.js';

export interface CreateDomainEventOptions<
  TName extends string,
  TPayload extends Record<string, unknown>,
> {
  readonly eventName: TName;
  readonly aggregateId: UniqueEntityId;
  readonly payload: TPayload;
  readonly workspaceId?: UniqueEntityId | undefined;
  readonly eventId?: UniqueEntityId | undefined;
  readonly occurredAt?: string | undefined;
  readonly schemaVersion?: number | undefined;
}

/**
 * Lightweight factory function for constructing immutable DomainEvent data contracts.
 * Freezes only payload properties and supports explicit eventId, occurredAt, and schemaVersion.
 */
export function createDomainEvent<
  TName extends string,
  TPayload extends Record<string, unknown>,
>(options: CreateDomainEventOptions<TName, TPayload>): DomainEvent<TName, TPayload> {
  return {
    eventId: options.eventId ?? new UniqueEntityId(),
    eventName: options.eventName,
    aggregateId: options.aggregateId,
    ...(options.workspaceId !== undefined && { workspaceId: options.workspaceId }),
    occurredAt: options.occurredAt ?? new Date().toISOString(),
    schemaVersion: options.schemaVersion ?? 1,
    payload: Object.freeze({ ...options.payload }),
  };
}
