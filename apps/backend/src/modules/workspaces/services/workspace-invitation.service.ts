import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  ForbiddenException as DomainForbiddenException,
  DomainValidationException,
} from '@lumora/shared';
import { nanoid } from 'nanoid';
import { WorkspaceInvitationRepository } from '../repositories/workspace-invitation.repository';
import { WorkspaceRepository } from '../repositories/workspace.repository';
import { WorkspaceMemberService } from './workspace-member.service';
import {
  WorkspaceInvitation,
  InvitationStatus,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { WorkspaceEventPublisherService } from './workspace-event-publisher.service';
import {
  WorkspaceMemberInvitedEvent,
  WorkspaceMemberJoinedEvent,
} from '../events/workspace.events';

@Injectable()
export class WorkspaceInvitationService {
  constructor(
    private readonly invitationRepository: WorkspaceInvitationRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberService: WorkspaceMemberService,
    private readonly eventPublisher: WorkspaceEventPublisherService,
  ) {}

  async createInvitation(
    workspaceId: string,
    email: string,
    invitedById: string,
    roleId?: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation> {
    const workspace = await this.workspaceRepository.findById(workspaceId, tx);
    if (!workspace) {
      throw new EntityNotFoundException('Workspace', workspaceId);
    }

    if (workspace.ownerId !== invitedById) {
      throw new DomainForbiddenException('workspace:invite-member');
    }

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiration

    const invitation = await this.invitationRepository.create(
      {
        workspaceId,
        email,
        invitedById,
        roleId,
        token,
        expiresAt,
      },
      tx,
    );

    await this.eventPublisher.publishMemberInvited(
      new WorkspaceMemberInvitedEvent(
        invitation.id,
        workspaceId,
        email,
        invitedById,
      ),
      tx,
    );

    return invitation;
  }

  async getWorkspaceInvitations(
    workspaceId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation[]> {
    return this.invitationRepository.findWorkspaceInvitations(workspaceId, tx);
  }

  async revokeInvitation(
    workspaceId: string,
    invitationId: string,
    requesterId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation> {
    const workspace = await this.workspaceRepository.findById(workspaceId, tx);
    if (!workspace || workspace.ownerId !== requesterId) {
      throw new DomainForbiddenException('workspace:revoke-invitation');
    }

    const invitation = await this.invitationRepository.findById(
      invitationId,
      tx,
    );
    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new EntityNotFoundException('Invitation', invitationId);
    }

    return this.invitationRepository.updateStatus(
      invitationId,
      InvitationStatus.REVOKED,
      tx,
    );
  }

  async acceptInvitation(
    token: string,
    user: { id: string; email: string },
    tx?: PrismaTransaction,
  ): Promise<{ invitation: WorkspaceInvitation; workspaceId: string }> {
    const invitation = await this.invitationRepository.findByToken(token, tx);
    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new DomainValidationException(
        'Invitation is invalid or has already been used.',
      );
    }

    if (new Date() > invitation.expiresAt) {
      await this.invitationRepository.updateStatus(
        invitation.id,
        InvitationStatus.EXPIRED,
        tx,
      );
      throw new DomainValidationException('Invitation has expired.');
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new DomainForbiddenException('workspace:accept-invitation');
    }

    await this.memberService.addMember(
      invitation.workspaceId,
      user.id,
      invitation.roleId ?? undefined,
      tx,
    );
    const updatedInvitation = await this.invitationRepository.updateStatus(
      invitation.id,
      InvitationStatus.ACCEPTED,
      tx,
    );

    await this.eventPublisher.publishMemberJoined(
      new WorkspaceMemberJoinedEvent(invitation.workspaceId, user.id),
      tx,
    );

    return {
      invitation: updatedInvitation,
      workspaceId: invitation.workspaceId,
    };
  }
}
