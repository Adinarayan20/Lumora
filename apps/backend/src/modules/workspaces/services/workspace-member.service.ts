import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  ForbiddenException as DomainForbiddenException,
  ConflictException,
} from '@lumora/shared';
import { WorkspaceMemberRepository } from '../repositories/workspace-member.repository';
import { WorkspaceRepository } from '../repositories/workspace.repository';
import {
  WorkspaceMember,
  WorkspaceMemberStatus,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { WorkspaceEventPublisherService } from './workspace-event-publisher.service';
import { WorkspaceMemberRemovedEvent } from '../events/workspace.events';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly memberRepository: WorkspaceMemberRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly eventPublisher: WorkspaceEventPublisherService,
  ) {}

  async getWorkspaceMembers(
    workspaceId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMember[]> {
    return this.memberRepository.findWorkspaceMembers(workspaceId, tx);
  }

  async addMember(
    workspaceId: string,
    userId: string,
    roleId?: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMember> {
    const existing = await this.memberRepository.findMember(
      workspaceId,
      userId,
      tx,
    );
    if (existing) {
      if (existing.status === WorkspaceMemberStatus.ACTIVE) {
        throw new ConflictException(
          'WorkspaceMember',
          'User is already a member of this workspace',
        );
      }
    }

    return this.memberRepository.addMember(
      {
        workspaceId,
        userId,
        roleId,
        status: WorkspaceMemberStatus.ACTIVE,
      },
      tx,
    );
  }

  async removeMember(
    workspaceId: string,
    targetUserId: string,
    requesterId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMember> {
    const workspace = await this.workspaceRepository.findById(workspaceId, tx);
    if (!workspace) {
      throw new EntityNotFoundException('Workspace', workspaceId);
    }

    if (workspace.ownerId === targetUserId) {
      throw new DomainForbiddenException('workspace:remove-owner');
    }

    if (workspace.ownerId !== requesterId && requesterId !== targetUserId) {
      throw new DomainForbiddenException('workspace:remove-member');
    }

    const removed = await this.memberRepository.removeMember(
      workspaceId,
      targetUserId,
      tx,
    );

    await this.eventPublisher.publishMemberRemoved(
      new WorkspaceMemberRemovedEvent(workspaceId, targetUserId, requesterId),
      tx,
    );

    return removed;
  }
}
