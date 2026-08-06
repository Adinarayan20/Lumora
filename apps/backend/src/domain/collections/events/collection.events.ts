import {
  UniqueEntityId,
  InstantString,
  CollectionEventName,
  DomainEvent,
} from '@lumora/shared';
import { CollectionType } from '../value-objects/collection-enums.js';

export class CollectionCreatedEvent implements DomainEvent<CollectionEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = CollectionEventName.CREATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly slug: string;
    readonly name: string;
    readonly type: CollectionType;
    readonly createdById: string;
  };

  constructor(
    collectionId: UniqueEntityId,
    workspaceId: UniqueEntityId,
    slug: string,
    name: string,
    type: CollectionType,
    createdById: UniqueEntityId,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = collectionId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString() as InstantString;
    this.payload = Object.freeze({
      slug,
      name,
      type,
      createdById: createdById.toValue(),
    });
  }
}
