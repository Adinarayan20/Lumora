import {
  UniqueEntityId,
  InstantString,
  ObjectEventName,
  DomainEvent,
  ObjectTypeKey,
} from '@lumora/shared';

export class ObjectCreatedEvent implements DomainEvent<ObjectEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = ObjectEventName.CREATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly objectKey: string;
    readonly typeKey: ObjectTypeKey;
    readonly title: string;
    readonly createdById: string;
    readonly spaceId?: string;
  };

  constructor(
    objectId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    objectKey: string,
    typeKey: ObjectTypeKey,
    title: string,
    createdById: UniqueEntityId,
    spaceId?: UniqueEntityId,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = objectId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      objectKey,
      typeKey,
      title,
      createdById: createdById.toValue(),
      spaceId: spaceId?.toValue(),
    });
  }
}

export class ObjectUpdatedEvent implements DomainEvent<ObjectEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = ObjectEventName.UPDATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly updatedById: string;
  };

  constructor(
    objectId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    updatedById: UniqueEntityId,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = objectId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({ updatedById: updatedById.toValue() });
  }
}

export class ObjectDeletedEvent implements DomainEvent<ObjectEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = ObjectEventName.DELETED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly deletedById: string;
  };

  constructor(
    objectId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    deletedById: UniqueEntityId,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = objectId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({ deletedById: deletedById.toValue() });
  }
}
