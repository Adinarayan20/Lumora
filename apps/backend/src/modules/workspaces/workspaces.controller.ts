import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import {
  CreateWorkspaceUseCase,
  GetUserWorkspacesQuery,
  GetWorkspaceQuery,
  UpdateWorkspaceUseCase,
  DeleteWorkspaceUseCase,
  TransferOwnershipUseCase,
  GetMembersQuery,
  RemoveMemberUseCase,
  InviteMemberUseCase,
  GetInvitationsQuery,
  RevokeInvitationUseCase,
  AcceptInvitationUseCase,
} from './use-cases/workspace-use-cases.js';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly createWorkspaceUseCase: CreateWorkspaceUseCase,
    private readonly getUserWorkspacesQuery: GetUserWorkspacesQuery,
    private readonly getWorkspaceQuery: GetWorkspaceQuery,
    private readonly updateWorkspaceUseCase: UpdateWorkspaceUseCase,
    private readonly deleteWorkspaceUseCase: DeleteWorkspaceUseCase,
    private readonly transferOwnershipUseCase: TransferOwnershipUseCase,
    private readonly getMembersQuery: GetMembersQuery,
    private readonly removeMemberUseCase: RemoveMemberUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly getInvitationsQuery: GetInvitationsQuery,
    private readonly revokeInvitationUseCase: RevokeInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
  ) {}

  @Post()
  async createWorkspace(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkspaceDto,
  ) {
    const result = await this.createWorkspaceUseCase.execute({
      ownerId: userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get()
  async getUserWorkspaces(@CurrentUser('id') userId: string) {
    const result = await this.getUserWorkspacesQuery.execute({ userId });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: AcceptInvitationDto,
  ) {
    const result = await this.acceptInvitationUseCase.execute({
      token: dto.token,
      user,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get(':idOrSlug')
  @RequirePermissions(Permissions.Workspace.Read)
  async getWorkspaceByIdOrSlug(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.getWorkspaceQuery.execute({ idOrSlug, userId });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Workspace.Update)
  async updateWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    const result = await this.updateWorkspaceUseCase.execute({
      workspaceId,
      userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Workspace.Delete)
  async softDeleteWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.deleteWorkspaceUseCase.execute({
      workspaceId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post(':id/transfer-ownership')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Workspace.TransferOwnership)
  async transferOwnership(
    @Param('id') workspaceId: string,
    @CurrentUser('id') currentOwnerId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    const result = await this.transferOwnershipUseCase.execute({
      workspaceId,
      currentOwnerId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get(':id/members')
  @RequirePermissions(Permissions.Member.List)
  async getMembers(@Param('id') workspaceId: string) {
    const result = await this.getMembersQuery.execute({ workspaceId });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id/members/:userId')
  @RequirePermissions(Permissions.Member.Remove)
  async removeMember(
    @Param('id') workspaceId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') requesterId: string,
  ) {
    const result = await this.removeMemberUseCase.execute({
      workspaceId,
      targetUserId,
      requesterId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post(':id/invitations')
  @RequirePermissions(Permissions.Member.Invite)
  async inviteMember(
    @Param('id') workspaceId: string,
    @CurrentUser('id') inviterId: string,
    @Body() dto: InviteMemberDto,
  ) {
    const result = await this.inviteMemberUseCase.execute({
      workspaceId,
      inviterId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get(':id/invitations')
  @RequirePermissions(Permissions.Member.List)
  async getInvitations(@Param('id') workspaceId: string) {
    const result = await this.getInvitationsQuery.execute({ workspaceId });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id/invitations/:invitationId')
  @RequirePermissions(Permissions.Member.Invite)
  async revokeInvitation(
    @Param('id') workspaceId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser('id') requesterId: string,
  ) {
    const result = await this.revokeInvitationUseCase.execute({
      workspaceId,
      invitationId,
      requesterId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
