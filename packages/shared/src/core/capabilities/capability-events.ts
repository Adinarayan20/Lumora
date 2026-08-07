import type { DomainEvent } from "../events/domain-event.interface.js";
import { CatalogEventName } from "../events/event-names.js";
import { UniqueEntityId } from "../primitives/unique-entity-id.js";
import type { InstantString } from "../events/instant-string.js";

export class CapabilityExecutedEvent
  implements
    DomainEvent<
      typeof CatalogEventName.OBJECT_DEFINITION_UPDATED,
      { capabilityKey: string; actionName: string }
    >
{
  public readonly eventId: UniqueEntityId;
  public readonly eventName = CatalogEventName.OBJECT_DEFINITION_UPDATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion: number;
  public readonly payload: Readonly<{ capabilityKey: string; actionName: string }>;

  constructor(
    aggregateId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    capabilityKey: string,
    actionName: string,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = aggregateId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.schemaVersion = 1;
    this.payload = Object.freeze({ capabilityKey, actionName });
  }
}
