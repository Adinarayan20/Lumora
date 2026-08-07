import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
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
  ): Promise<Result<WorkspaceInvitation, ApplicationException>> {
    const workspace = await this.workspaceRepository.findById(workspaceId, tx);
    if (!workspace) {
      return Result.fail(new EntityNotFoundException('Workspace', workspaceId));
    }

    if (workspace.ownerId !== invitedById) {
      return Result.fail(
        new DomainForbiddenException('workspace:invite-member'),
      );
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

    return Result.ok(invitation);
  }

  async getWorkspaceInvitations(
    workspaceId: string,
    tx?: PrismaTransaction,
  ): Promise<Result<WorkspaceInvitation[], ApplicationException>> {
    const invitations =
      await this.invitationRepository.findWorkspaceInvitations(workspaceId, tx);
    return Result.ok(invitations);
  }

  async revokeInvitation(
    workspaceId: string,
    invitationId: string,
    requesterId: string,
    tx?: PrismaTransaction,
  ): Promise<Result<WorkspaceInvitation, ApplicationException>> {
    const workspace = await this.workspaceRepository.findById(workspaceId, tx);
    if (!workspace || workspace.ownerId !== requesterId) {
      return Result.fail(
        new DomainForbiddenException('workspace:revoke-invitation'),
      );
    }

    const invitation = await this.invitationRepository.findById(
      invitationId,
      tx,
    );
    if (!invitation || invitation.workspaceId !== workspaceId) {
      return Result.fail(
        new EntityNotFoundException('Invitation', invitationId),
      );
    }

    const revoked = await this.invitationRepository.updateStatus(
      invitationId,
      InvitationStatus.REVOKED,
      tx,
    );
    return Result.ok(revoked);
  }

  async acceptInvitation(
    token: string,
    user: { id: string; email: string },
    tx?: PrismaTransaction,
  ): Promise<
    Result<
      { invitation: WorkspaceInvitation; workspaceId: string },
      ApplicationException
    >
  > {
    const invitation = await this.invitationRepository.findByToken(token, tx);
    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      return Result.fail(
        new DomainValidationException(
          'Invitation is invalid or has already been used.',
        ),
      );
    }

    if (new Date() > invitation.expiresAt) {
      await this.invitationRepository.updateStatus(
        invitation.id,
        InvitationStatus.EXPIRED,
        tx,
      );
      return Result.fail(
        new DomainValidationException('Invitation has expired.'),
      );
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return Result.fail(
        new DomainForbiddenException('workspace:accept-invitation'),
      );
    }

    const addMemberResult = await this.memberService.addMember(
      invitation.workspaceId,
      user.id,
      invitation.roleId ?? undefined,
      tx,
    );

    if (addMemberResult.isFailure) {
      return Result.fail(addMemberResult.getError());
    }

    const updatedInvitation = await this.invitationRepository.updateStatus(
      invitation.id,
      InvitationStatus.ACCEPTED,
      tx,
    );

    await this.eventPublisher.publishMemberJoined(
      new WorkspaceMemberJoinedEvent(invitation.workspaceId, user.id),
      tx,
    );

    return Result.ok({
      invitation: updatedInvitation,
      workspaceId: invitation.workspaceId,
    });
  }
}
