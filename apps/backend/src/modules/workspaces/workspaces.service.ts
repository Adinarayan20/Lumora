import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
  EntityNotFoundException,
  ForbiddenException as DomainForbiddenException,
  PersonalWorkspaceDeletionForbiddenException,
  TargetNotWorkspaceMemberException,
} from '@lumora/shared';
import { SystemConstants } from '../../common/constants/system.constants.js';
import { WorkspacePolicies } from '../../domain/workspace/policies/workspace.policies.js';
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
} from '../../generated/prisma/client.js';
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
  ): Promise<Result<Workspace, ApplicationException>> {
    const slug = await this.slugService.generateUniqueSlug(
      WorkspacePolicies.personalWorkspaceSlug(displayName),
      tx,
    );
    const workspace = await this.workspaceRepository.create(
      {
        name: WorkspacePolicies.personalWorkspaceName(displayName),
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

    return Result.ok(workspace);
  }

  async createWorkspace(
    ownerId: string,
    dto: CreateWorkspaceDto,
  ): Promise<Result<Workspace, ApplicationException>> {
    const slug = await this.slugService.generateUniqueSlug(dto.name);

    const workspace = await this.prisma.$transaction(
      async (tx) => {
        const created = await this.workspaceRepository.create(
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
          { workspaceId: created.id, userId: ownerId },
          tx,
        );
        await this.rbacService.seedDefaultWorkspaceRoles(
          created.id,
          ownerId,
          tx,
        );

        await this.auditLogRepository.create(
          {
            userId: ownerId,
            entity: 'Workspace',
            entityId: created.id,
            action: AuditAction.CREATE,
            newData: { type: WorkspaceType.CUSTOM, slug },
          },
          tx,
        );

        await this.eventPublisher.publishWorkspaceCreated(
          new WorkspaceCreatedEvent(
            created.id,
            ownerId,
            created.name,
            created.slug,
            created.type,
            created.plan,
          ),
          tx,
        );

        return created;
      },
      { timeout: SystemConstants.DEFAULT_WORKSPACE_TRANSACTION_TIMEOUT_MS },
    );

    return Result.ok(workspace);
  }

  async getUserWorkspaces(
    userId: string,
  ): Promise<Result<Workspace[], ApplicationException>> {
    const workspaces =
      await this.workspaceRepository.findUserWorkspaces(userId);
    return Result.ok(workspaces);
  }

  async getWorkspaceByIdOrSlug(
    idOrSlug: string,
    userId: string,
  ): Promise<Result<Workspace, ApplicationException>> {
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
      return Result.fail(new EntityNotFoundException('Workspace', idOrSlug));
    }

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember && workspace.ownerId !== userId) {
      return Result.fail(new DomainForbiddenException('workspace:read'));
    }

    return Result.ok(workspace);
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<Result<Workspace, ApplicationException>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return Result.fail(new EntityNotFoundException('Workspace', workspaceId));
    }

    if (workspace.ownerId !== userId) {
      return Result.fail(new DomainForbiddenException('workspace:update'));
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

    return Result.ok(updated);
  }

  async softDeleteWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<Result<Workspace, ApplicationException>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return Result.fail(new EntityNotFoundException('Workspace', workspaceId));
    }

    if (workspace.ownerId !== userId) {
      return Result.fail(new DomainForbiddenException('workspace:delete'));
    }

    if (workspace.type === WorkspaceType.PERSONAL) {
      return Result.fail(new PersonalWorkspaceDeletionForbiddenException());
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

    return Result.ok(deleted);
  }

  async transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    dto: TransferOwnershipDto,
  ): Promise<Result<Workspace, ApplicationException>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return Result.fail(new EntityNotFoundException('Workspace', workspaceId));
    }

    if (workspace.ownerId !== currentOwnerId) {
      return Result.fail(
        new DomainForbiddenException('workspace:transfer-ownership'),
      );
    }

    const targetMember = await this.memberRepository.findMember(
      workspaceId,
      dto.newOwnerId,
    );
    if (!targetMember) {
      return Result.fail(
        new TargetNotWorkspaceMemberException(workspaceId, dto.newOwnerId),
      );
    }

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const res = await this.workspaceRepository.update(
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

        return res;
      },
      { timeout: SystemConstants.DEFAULT_WORKSPACE_TRANSACTION_TIMEOUT_MS },
    );

    return Result.ok(updated);
  }

  // Delegation helpers
  async getMembers(
    workspaceId: string,
  ): Promise<Result<WorkspaceMember[], ApplicationException>> {
    return this.memberService.getWorkspaceMembers(workspaceId);
  }

  async removeMember(
    workspaceId: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<Result<WorkspaceMember, ApplicationException>> {
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
  ): Promise<Result<WorkspaceInvitation, ApplicationException>> {
    return this.invitationService.createInvitation(
      workspaceId,
      dto.email,
      inviterId,
      dto.roleId,
    );
  }

  async getInvitations(
    workspaceId: string,
  ): Promise<Result<WorkspaceInvitation[], ApplicationException>> {
    return this.invitationService.getWorkspaceInvitations(workspaceId);
  }

  async revokeInvitation(
    workspaceId: string,
    invitationId: string,
    requesterId: string,
  ): Promise<Result<WorkspaceInvitation, ApplicationException>> {
    return this.invitationService.revokeInvitation(
      workspaceId,
      invitationId,
      requesterId,
    );
  }

  async acceptInvitation(
    token: string,
    user: { id: string; email: string },
  ): Promise<
    Result<
      { invitation: WorkspaceInvitation; workspaceId: string },
      ApplicationException
    >
  > {
    return this.prisma.$transaction(
      async (tx) => {
        return this.invitationService.acceptInvitation(token, user, tx);
      },
      { timeout: 20000 },
    );
  }
}
