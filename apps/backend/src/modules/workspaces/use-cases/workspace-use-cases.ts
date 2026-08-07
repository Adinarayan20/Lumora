/**
 * Application-layer façade use cases for the Workspaces bounded context.
 *
 * All use cases delegate to WorkspacesService, which owns legacy business logic
 * (slug generation, transaction orchestration, ownership guards, RBAC seeding,
 * invitation lifecycle, audit logs, domain event publishing) until Phase 3 DDD
 * migration.
 *
 * NOTE: WorkspacesService.createPersonalWorkspace() is an internal-only method
 * consumed by the Auth module during user registration. It does not receive a
 * controller-facing Use Case wrapper in this batch.
 */
import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { WorkspacesService } from '../workspaces.service.js';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto.js';
import { InviteMemberDto } from '../dto/invite-member.dto.js';
import { TransferOwnershipDto } from '../dto/transfer-ownership.dto.js';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
} from '../../../generated/prisma/client.js';

// ─── Commands ────────────────────────────────────────────────────────────────

export interface CreateWorkspaceCommand {
  ownerId: string;
  dto: CreateWorkspaceDto;
}

@Injectable()
export class CreateWorkspaceUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: CreateWorkspaceCommand,
  ): Promise<Result<Workspace, ApplicationException>> {
    return this.service.createWorkspace(cmd.ownerId, cmd.dto);
  }
}

export interface UpdateWorkspaceCommand {
  workspaceId: string;
  userId: string;
  dto: UpdateWorkspaceDto;
}

@Injectable()
export class UpdateWorkspaceUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: UpdateWorkspaceCommand,
  ): Promise<Result<Workspace, ApplicationException>> {
    return this.service.updateWorkspace(cmd.workspaceId, cmd.userId, cmd.dto);
  }
}

export interface DeleteWorkspaceCommand {
  workspaceId: string;
  userId: string;
}

@Injectable()
export class DeleteWorkspaceUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: DeleteWorkspaceCommand,
  ): Promise<Result<Workspace, ApplicationException>> {
    return this.service.softDeleteWorkspace(cmd.workspaceId, cmd.userId);
  }
}

export interface TransferOwnershipCommand {
  workspaceId: string;
  currentOwnerId: string;
  dto: TransferOwnershipDto;
}

@Injectable()
export class TransferOwnershipUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: TransferOwnershipCommand,
  ): Promise<Result<Workspace, ApplicationException>> {
    return this.service.transferOwnership(
      cmd.workspaceId,
      cmd.currentOwnerId,
      cmd.dto,
    );
  }
}

export interface RemoveMemberCommand {
  workspaceId: string;
  targetUserId: string;
  requesterId: string;
}

@Injectable()
export class RemoveMemberUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: RemoveMemberCommand,
  ): Promise<Result<WorkspaceMember, ApplicationException>> {
    return this.service.removeMember(
      cmd.workspaceId,
      cmd.targetUserId,
      cmd.requesterId,
    );
  }
}

export interface InviteMemberCommand {
  workspaceId: string;
  inviterId: string;
  dto: InviteMemberDto;
}

@Injectable()
export class InviteMemberUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: InviteMemberCommand,
  ): Promise<Result<WorkspaceInvitation, ApplicationException>> {
    return this.service.inviteMember(cmd.workspaceId, cmd.dto, cmd.inviterId);
  }
}

export interface RevokeInvitationCommand {
  workspaceId: string;
  invitationId: string;
  requesterId: string;
}

@Injectable()
export class RevokeInvitationUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: RevokeInvitationCommand,
  ): Promise<Result<WorkspaceInvitation, ApplicationException>> {
    return this.service.revokeInvitation(
      cmd.workspaceId,
      cmd.invitationId,
      cmd.requesterId,
    );
  }
}

export interface AcceptInvitationCommand {
  token: string;
  user: { id: string; email: string };
}

@Injectable()
export class AcceptInvitationUseCase {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    cmd: AcceptInvitationCommand,
  ): Promise<
    Result<
      { invitation: WorkspaceInvitation; workspaceId: string },
      ApplicationException
    >
  > {
    return this.service.acceptInvitation(cmd.token, cmd.user);
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetUserWorkspacesQueryInput {
  userId: string;
}

@Injectable()
export class GetUserWorkspacesQuery {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    input: GetUserWorkspacesQueryInput,
  ): Promise<Result<Workspace[], ApplicationException>> {
    return this.service.getUserWorkspaces(input.userId);
  }
}

export interface GetWorkspaceQueryInput {
  idOrSlug: string;
  userId: string;
}

@Injectable()
export class GetWorkspaceQuery {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    input: GetWorkspaceQueryInput,
  ): Promise<Result<Workspace, ApplicationException>> {
    return this.service.getWorkspaceByIdOrSlug(input.idOrSlug, input.userId);
  }
}

export interface GetMembersQueryInput {
  workspaceId: string;
}

@Injectable()
export class GetMembersQuery {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    input: GetMembersQueryInput,
  ): Promise<Result<WorkspaceMember[], ApplicationException>> {
    return this.service.getMembers(input.workspaceId);
  }
}

export interface GetInvitationsQueryInput {
  workspaceId: string;
}

@Injectable()
export class GetInvitationsQuery {
  constructor(private readonly service: WorkspacesService) {}
  async execute(
    input: GetInvitationsQueryInput,
  ): Promise<Result<WorkspaceInvitation[], ApplicationException>> {
    return this.service.getInvitations(input.workspaceId);
  }
}
