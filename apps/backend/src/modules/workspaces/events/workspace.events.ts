import { WorkspaceType, WorkspacePlan } from '../../../generated/prisma/client.js';

export class WorkspaceCreatedEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly type: WorkspaceType,
    public readonly plan: WorkspacePlan,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class WorkspaceUpdatedEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class WorkspaceDeletedEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly ownerId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class WorkspaceMemberInvitedEvent {
  constructor(
    public readonly invitationId: string,
    public readonly workspaceId: string,
    public readonly email: string,
    public readonly invitedById: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class WorkspaceMemberJoinedEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class WorkspaceMemberRemovedEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly removedById: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class WorkspaceOwnershipTransferredEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly previousOwnerId: string,
    public readonly newOwnerId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
