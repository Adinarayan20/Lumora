import { UniqueEntityId } from "../primitives/unique-entity-id.js";
import { DomainValidationException } from "../errors/domain-exceptions.js";
import type { DomainEventName } from "./event-names.js";
import type { InstantString } from "./instant-string.js";
import type { DomainEvent } from "./domain-event.interface.js";

export interface CreateDomainEventOptions<
  TName extends DomainEventName,
  TPayload extends Record<string, unknown>,
> {
  readonly eventName: TName;
  readonly aggregateId: UniqueEntityId;
  readonly payload: TPayload;
  readonly workspaceId?: UniqueEntityId | undefined;
  readonly eventId?: UniqueEntityId | undefined;
  readonly occurredAt?: InstantString | undefined;
  readonly schemaVersion?: number | undefined;
}

/**
 * Lightweight factory function for constructing immutable DomainEvent data contracts.
 * Validates schemaVersion (>= 1), freezes payload properties, and supports custom eventId/occurredAt.
 */
export function createDomainEvent<
  TName extends DomainEventName,
  TPayload extends Record<string, unknown>,
>(
  options: CreateDomainEventOptions<TName, TPayload>,
): DomainEvent<TName, TPayload> {
  const schemaVersion = options.schemaVersion ?? 1;

  if (schemaVersion < 1 || !Number.isInteger(schemaVersion)) {
    throw new DomainValidationException(
      `Invalid event schemaVersion '${schemaVersion}'. Schema version must be an integer greater than or equal to 1.`,
      { schemaVersion: ["Event schemaVersion must be an integer >= 1."] },
    );
  }

  return {
    eventId: options.eventId ?? new UniqueEntityId(),
    eventName: options.eventName,
    aggregateId: options.aggregateId,
    ...(options.workspaceId !== undefined && {
      workspaceId: options.workspaceId,
    }),
    occurredAt: options.occurredAt ?? new Date().toISOString(),
    schemaVersion,
    payload: Object.freeze({ ...options.payload }),
  };
}
