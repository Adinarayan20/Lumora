import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { FilterSpaceDto } from './dto/filter-space.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @RequirePermissions(Permissions.Space.Create)
  async createSpace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSpaceDto,
  ) {
    return this.spacesService.createSpace(workspaceId, userId, dto);
  }

  @Get()
  @RequirePermissions(Permissions.Space.Read)
  async getWorkspaceSpaces(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterSpaceDto,
  ) {
    return this.spacesService.getWorkspaceSpaces(workspaceId, filter);
  }

  @Get(':idOrSlug')
  @RequirePermissions(Permissions.Space.Read)
  async getSpaceByIdOrSlug(
    @Param('workspaceId') workspaceId: string,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    return this.spacesService.getSpaceByIdOrSlug(workspaceId, idOrSlug);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Space.Update)
  async updateSpace(
    @Param('workspaceId') workspaceId: string,
    @Param('id') spaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.spacesService.updateSpace(workspaceId, spaceId, userId, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Space.Delete)
  async softDeleteSpace(
    @Param('workspaceId') workspaceId: string,
    @Param('id') spaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.spacesService.softDeleteSpace(workspaceId, spaceId, userId);
  }
}
