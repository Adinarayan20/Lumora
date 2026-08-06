import {
  UniqueEntityId,
  InstantString,
  SpaceEventName,
  DomainEvent,
} from '@lumora/shared';

export class SpaceCreatedEvent implements DomainEvent<SpaceEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = SpaceEventName.CREATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly slug: string;
    readonly name: string;
    readonly createdById: string;
    readonly parentId?: string;
  };

  constructor(
    spaceId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    slug: string,
    name: string,
    createdById: UniqueEntityId,
    parentId?: UniqueEntityId,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = spaceId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString();
    this.payload = Object.freeze({
      slug,
      name,
      createdById: createdById.toValue(),
      parentId: parentId?.toValue(),
    });
  }
}
