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
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { FilterObjectDto } from './dto/filter-object.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Post()
  @RequirePermissions(Permissions.Object.Create)
  async createObject(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateObjectDto,
  ) {
    return this.objectsService.createObject(workspaceId, userId, dto);
  }

  @Get()
  @RequirePermissions(Permissions.Object.Read)
  async getWorkspaceObjects(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterObjectDto,
  ) {
    return this.objectsService.getWorkspaceObjects(workspaceId, filter);
  }

  @Get(':idOrKey')
  @RequirePermissions(Permissions.Object.Read)
  async getObjectByIdOrKey(
    @Param('workspaceId') workspaceId: string,
    @Param('idOrKey') idOrKey: string,
  ) {
    return this.objectsService.getObjectByIdOrKey(workspaceId, idOrKey);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Object.Update)
  async updateObject(
    @Param('workspaceId') workspaceId: string,
    @Param('id') objectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateObjectDto,
  ) {
    return this.objectsService.updateObject(workspaceId, objectId, userId, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Object.Delete)
  async softDeleteObject(
    @Param('workspaceId') workspaceId: string,
    @Param('id') objectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.objectsService.softDeleteObject(workspaceId, objectId, userId);
  }
}
