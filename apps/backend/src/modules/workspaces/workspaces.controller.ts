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
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async createWorkspace(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(userId, dto);
  }

  @Get()
  async getUserWorkspaces(@CurrentUser('id') userId: string) {
    return this.workspacesService.getUserWorkspaces(userId);
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.workspacesService.acceptInvitation(dto.token, user);
  }

  @Get(':idOrSlug')
  @RequirePermissions(Permissions.Workspace.Read)
  async getWorkspaceByIdOrSlug(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.getWorkspaceByIdOrSlug(idOrSlug, userId);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Workspace.Update)
  async updateWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.updateWorkspace(workspaceId, userId, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Workspace.Delete)
  async softDeleteWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.softDeleteWorkspace(workspaceId, userId);
  }

  @Post(':id/transfer-ownership')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permissions.Workspace.TransferOwnership)
  async transferOwnership(
    @Param('id') workspaceId: string,
    @CurrentUser('id') currentOwnerId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.workspacesService.transferOwnership(
      workspaceId,
      currentOwnerId,
      dto,
    );
  }

  @Get(':id/members')
  @RequirePermissions(Permissions.Member.List)
  async getMembers(@Param('id') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Delete(':id/members/:userId')
  @RequirePermissions(Permissions.Member.Remove)
  async removeMember(
    @Param('id') workspaceId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') requesterId: string,
  ) {
    return this.workspacesService.removeMember(
      workspaceId,
      targetUserId,
      requesterId,
    );
  }

  @Post(':id/invitations')
  @RequirePermissions(Permissions.Member.Invite)
  async inviteMember(
    @Param('id') workspaceId: string,
    @CurrentUser('id') inviterId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspacesService.inviteMember(workspaceId, dto, inviterId);
  }

  @Get(':id/invitations')
  @RequirePermissions(Permissions.Member.List)
  async getInvitations(@Param('id') workspaceId: string) {
    return this.workspacesService.getInvitations(workspaceId);
  }

  @Delete(':id/invitations/:invitationId')
  @RequirePermissions(Permissions.Member.Invite)
  async revokeInvitation(
    @Param('id') workspaceId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser('id') requesterId: string,
  ) {
    return this.workspacesService.revokeInvitation(
      workspaceId,
      invitationId,
      requesterId,
    );
  }
}
