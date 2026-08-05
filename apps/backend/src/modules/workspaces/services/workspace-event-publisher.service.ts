import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../../auth/repositories/event.repository';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import {
  WorkspaceCreatedEvent,
  WorkspaceUpdatedEvent,
  WorkspaceDeletedEvent,
  WorkspaceMemberInvitedEvent,
  WorkspaceMemberJoinedEvent,
  WorkspaceMemberRemovedEvent,
  WorkspaceOwnershipTransferredEvent,
} from '../events/workspace.events';

@Injectable()
export class WorkspaceEventPublisherService {
  private readonly logger = new Logger(WorkspaceEventPublisherService.name);

  constructor(private readonly eventRepository: EventRepository) {}

  async publishWorkspaceCreated(
    event: WorkspaceCreatedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: WorkspaceCreated - ${event.workspaceId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.ownerId,
        type: 'WorkspaceCreated',
        payload: {
          workspaceId: event.workspaceId,
          name: event.name,
          slug: event.slug,
          type: event.type,
          plan: event.plan,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishWorkspaceUpdated(
    event: WorkspaceUpdatedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: WorkspaceUpdated - ${event.workspaceId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.updatedBy,
        type: 'WorkspaceUpdated',
        payload: {
          workspaceId: event.workspaceId,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishWorkspaceDeleted(
    event: WorkspaceDeletedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: WorkspaceDeleted - ${event.workspaceId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.ownerId,
        type: 'WorkspaceDeleted',
        payload: {
          workspaceId: event.workspaceId,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishMemberInvited(
    event: WorkspaceMemberInvitedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: WorkspaceMemberInvited - ${event.invitationId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.invitedById,
        type: 'WorkspaceMemberInvited',
        payload: {
          invitationId: event.invitationId,
          workspaceId: event.workspaceId,
          email: event.email,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishMemberJoined(
    event: WorkspaceMemberJoinedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: WorkspaceMemberJoined - ${event.userId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.userId,
        type: 'WorkspaceMemberJoined',
        payload: {
          workspaceId: event.workspaceId,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishMemberRemoved(
    event: WorkspaceMemberRemovedEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: WorkspaceMemberRemoved - ${event.userId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.removedById,
        type: 'WorkspaceMemberRemoved',
        payload: {
          workspaceId: event.workspaceId,
          userId: event.userId,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }

  async publishOwnershipTransferred(
    event: WorkspaceOwnershipTransferredEvent,
    tx?: PrismaTransaction,
  ): Promise<void> {
    this.logger.log(
      `Domain Event Emitted: WorkspaceOwnershipTransferred - ${event.workspaceId}`,
    );
    await this.eventRepository.create(
      {
        userId: event.previousOwnerId,
        type: 'WorkspaceOwnershipTransferred',
        payload: {
          workspaceId: event.workspaceId,
          previousOwnerId: event.previousOwnerId,
          newOwnerId: event.newOwnerId,
          timestamp: event.timestamp.toISOString(),
        },
      },
      tx,
    );
  }
}
