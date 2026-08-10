import type { DomainEvent } from "../events/domain-event.interface.js";
import { CatalogEventName } from "../events/event-names.js";
import { UniqueEntityId } from "../primitives/unique-entity-id.js";
import type { InstantString } from "../events/instant-string.js";

export class SchemaRegisteredEvent implements DomainEvent<
  CatalogEventName,
  { typeKey: string; schemaVersion: number }
> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = CatalogEventName.SCHEMA_REGISTERED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ typeKey: string; schemaVersion: number }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    typeKey: string,
    schemaVersion: number,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = schemaVersion;
    this.payload = Object.freeze({ typeKey, schemaVersion });
  }
}

export class SchemaUpdatedEvent implements DomainEvent<
  CatalogEventName,
  { typeKey: string; schemaVersion: number }
> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = CatalogEventName.SCHEMA_UPDATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ typeKey: string; schemaVersion: number }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    typeKey: string,
    schemaVersion: number,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = schemaVersion;
    this.payload = Object.freeze({ typeKey, schemaVersion });
  }
}

export class ObjectDefinitionRegisteredEvent implements DomainEvent<
  CatalogEventName,
  { typeKey: string }
> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = CatalogEventName.OBJECT_DEFINITION_REGISTERED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ typeKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    typeKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ typeKey });
  }
}

export class ObjectDefinitionUpdatedEvent implements DomainEvent<
  CatalogEventName,
  { typeKey: string }
> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = CatalogEventName.OBJECT_DEFINITION_UPDATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ typeKey: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    typeKey: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ typeKey });
  }
}
