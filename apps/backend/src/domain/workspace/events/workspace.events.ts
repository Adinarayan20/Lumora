import {
  UniqueEntityId,
  InstantString,
  WorkspaceEventName,
  DomainEvent,
} from '@lumora/shared';
import {
  WorkspaceType,
  WorkspacePlan,
} from '../value-objects/workspace-enums.js';

export class WorkspaceCreatedEvent implements DomainEvent<WorkspaceEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = WorkspaceEventName.CREATED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly ownerId: string;
    readonly name: string;
    readonly slug: string;
    readonly type: WorkspaceType;
    readonly plan: WorkspacePlan;
  };

  constructor(
    workspaceId: UniqueEntityId,
    ownerId: UniqueEntityId,
    name: string,
    slug: string,
    type: WorkspaceType,
    plan: WorkspacePlan,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = workspaceId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString();
    this.payload = Object.freeze({
      ownerId: ownerId.toValue(),
      name,
      slug,
      type,
      plan,
    });
  }
}

export class WorkspaceOwnershipTransferredEvent implements DomainEvent<WorkspaceEventName> {
  public readonly eventId: UniqueEntityId;
  public readonly eventName = WorkspaceEventName.OWNERSHIP_TRANSFERRED;
  public readonly aggregateId: UniqueEntityId;
  public readonly workspaceId: UniqueEntityId;
  public readonly occurredAt: InstantString;
  public readonly schemaVersion = 1;
  public readonly payload: {
    readonly previousOwnerId: string;
    readonly newOwnerId: string;
  };

  constructor(
    workspaceId: UniqueEntityId,
    previousOwnerId: UniqueEntityId,
    newOwnerId: UniqueEntityId,
  ) {
    this.eventId = new UniqueEntityId();
    this.aggregateId = workspaceId;
    this.workspaceId = workspaceId;
    this.occurredAt = new Date().toISOString();
    this.payload = Object.freeze({
      previousOwnerId: previousOwnerId.toValue(),
      newOwnerId: newOwnerId.toValue(),
    });
  }
}
