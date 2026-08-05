import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { WorkspaceSlugService } from './services/workspace-slug.service';
import { WorkspaceMemberService } from './services/workspace-member.service';
import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { WorkspaceEventPublisherService } from './services/workspace-event-publisher.service';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import {
  Workspace,
  WorkspaceType,
  WorkspaceMember,
  WorkspaceInvitation,
  AuditAction,
} from '../../generated/prisma/client';
import { PrismaTransaction } from '../auth/repositories/audit-log.repository';
import {
  WorkspaceCreatedEvent,
  WorkspaceUpdatedEvent,
  WorkspaceDeletedEvent,
  WorkspaceOwnershipTransferredEvent,
} from './events/workspace.events';

import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: WorkspaceMemberRepository,
    private readonly slugService: WorkspaceSlugService,
    private readonly memberService: WorkspaceMemberService,
    private readonly invitationService: WorkspaceInvitationService,
    private readonly eventPublisher: WorkspaceEventPublisherService,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly rbacService: RbacService,
  ) {}

  async createPersonalWorkspace(
    ownerId: string,
    displayName: string,
    tx?: PrismaTransaction,
  ): Promise<Workspace> {
    const slug = await this.slugService.generateUniqueSlug(
      `${displayName}-personal`,
      tx,
    );
    const workspace = await this.workspaceRepository.create(
      {
        name: `${displayName}'s Workspace`,
        slug,
        ownerId,
        type: WorkspaceType.PERSONAL,
      },
      tx,
    );

    await this.memberRepository.addMember(
      { workspaceId: workspace.id, userId: ownerId },
      tx,
    );
    await this.rbacService.seedDefaultWorkspaceRoles(workspace.id, ownerId, tx);

    await this.auditLogRepository.create(
      {
        userId: ownerId,
        entity: 'Workspace',
        entityId: workspace.id,
        action: AuditAction.CREATE,
        newData: { type: WorkspaceType.PERSONAL, slug },
      },
      tx,
    );

    await this.eventPublisher.publishWorkspaceCreated(
      new WorkspaceCreatedEvent(
        workspace.id,
        ownerId,
        workspace.name,
        workspace.slug,
        workspace.type,
        workspace.plan,
      ),
      tx,
    );

    return workspace;
  }

  async createWorkspace(
    ownerId: string,
    dto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    const slug = await this.slugService.generateUniqueSlug(dto.name);

    return this.prisma.$transaction(
      async (tx) => {
        const workspace = await this.workspaceRepository.create(
          {
            name: dto.name,
            slug,
            ownerId,
            description: dto.description,
            icon: dto.icon,
            emoji: dto.emoji,
            cover: dto.cover,
            color: dto.color,
            type: WorkspaceType.CUSTOM,
            visibility: dto.visibility,
            plan: dto.plan,
            settings: dto.settings,
          },
          tx,
        );

        await this.memberRepository.addMember(
          { workspaceId: workspace.id, userId: ownerId },
          tx,
        );
        await this.rbacService.seedDefaultWorkspaceRoles(
          workspace.id,
          ownerId,
          tx,
        );

        await this.auditLogRepository.create(
          {
            userId: ownerId,
            entity: 'Workspace',
            entityId: workspace.id,
            action: AuditAction.CREATE,
            newData: { type: WorkspaceType.CUSTOM, slug },
          },
          tx,
        );

        await this.eventPublisher.publishWorkspaceCreated(
          new WorkspaceCreatedEvent(
            workspace.id,
            ownerId,
            workspace.name,
            workspace.slug,
            workspace.type,
            workspace.plan,
          ),
          tx,
        );

        return workspace;
      },
      { timeout: 20000 },
    );
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository.findUserWorkspaces(userId);
  }

  async getWorkspaceByIdOrSlug(
    idOrSlug: string,
    userId: string,
  ): Promise<Workspace> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    let workspace = isUuid
      ? await this.workspaceRepository.findById(idOrSlug)
      : null;

    if (!workspace) {
      workspace = await this.workspaceRepository.findBySlug(idOrSlug);
    }

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember && workspace.ownerId !== userId) {
      throw new ForbiddenException('Access denied to workspace');
    }

    return workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the workspace owner can update workspace details',
      );
    }

    const updated = await this.workspaceRepository.update(workspaceId, dto);

    await this.auditLogRepository.create({
      userId,
      entity: 'Workspace',
      entityId: workspaceId,
      action: AuditAction.UPDATE,
      newData: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        emoji: dto.emoji,
        cover: dto.cover,
        color: dto.color,
        visibility: dto.visibility,
      },
    });

    await this.eventPublisher.publishWorkspaceUpdated(
      new WorkspaceUpdatedEvent(workspaceId, userId),
    );

    return updated;
  }

  async softDeleteWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the workspace owner can delete a workspace',
      );
    }

    if (workspace.type === WorkspaceType.PERSONAL) {
      throw new BadRequestException('Personal workspace cannot be deleted');
    }

    const deleted = await this.workspaceRepository.softDelete(workspaceId);

    await this.auditLogRepository.create({
      userId,
      entity: 'Workspace',
      entityId: workspaceId,
      action: AuditAction.DELETE,
    });

    await this.eventPublisher.publishWorkspaceDeleted(
      new WorkspaceDeletedEvent(workspaceId, userId),
    );

    return deleted;
  }

  async transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    dto: TransferOwnershipDto,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== currentOwnerId) {
      throw new ForbiddenException(
        'Only the workspace owner can transfer ownership',
      );
    }

    const targetMember = await this.memberRepository.findMember(
      workspaceId,
      dto.newOwnerId,
    );
    if (!targetMember) {
      throw new BadRequestException(
        'Target owner must be an active workspace member',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const updated = await this.workspaceRepository.update(
          workspaceId,
          { ownerId: dto.newOwnerId },
          tx,
        );

        await this.auditLogRepository.create(
          {
            userId: currentOwnerId,
            entity: 'Workspace',
            entityId: workspaceId,
            action: AuditAction.UPDATE,
            newData: {
              previousOwnerId: currentOwnerId,
              newOwnerId: dto.newOwnerId,
            },
          },
          tx,
        );

        await this.eventPublisher.publishOwnershipTransferred(
          new WorkspaceOwnershipTransferredEvent(
            workspaceId,
            currentOwnerId,
            dto.newOwnerId,
          ),
          tx,
        );

        return updated;
      },
      { timeout: 20000 },
    );
  }

  // Delegation helpers
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.memberService.getWorkspaceMembers(workspaceId);
  }

  async removeMember(
    workspaceId: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<WorkspaceMember> {
    return this.memberService.removeMember(
      workspaceId,
      targetUserId,
      requesterId,
    );
  }

  async inviteMember(
    workspaceId: string,
    dto: InviteMemberDto,
    inviterId: string,
  ): Promise<WorkspaceInvitation> {
    return this.invitationService.createInvitation(
      workspaceId,
      dto.email,
      inviterId,
      dto.roleId,
    );
  }

  async getInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return this.invitationService.getWorkspaceInvitations(workspaceId);
  }

  async revokeInvitation(
    workspaceId: string,
    invitationId: string,
    requesterId: string,
  ): Promise<WorkspaceInvitation> {
    return this.invitationService.revokeInvitation(
      workspaceId,
      invitationId,
      requesterId,
    );
  }

  async acceptInvitation(
    token: string,
    user: { id: string; email: string },
  ): Promise<{ invitation: WorkspaceInvitation; workspaceId: string }> {
    return this.prisma.$transaction(
      async (tx) => {
        return this.invitationService.acceptInvitation(token, user, tx);
      },
      { timeout: 20000 },
    );
  }
}
