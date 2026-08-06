import {
  UniqueEntityId,
  InstantString,
  HouseholdEventName,
  DomainEvent,
} from '@lumora/shared';

export class HouseholdCreatedEvent implements DomainEvent<HouseholdEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = HouseholdEventName.CREATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly name: string;
    readonly ownerUserId: string;
  };

  constructor(
    householdId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    name: string,
    ownerUserId: UniqueEntityId,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = householdId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      name,
      ownerUserId: ownerUserId.toString(),
    });
  }
}
