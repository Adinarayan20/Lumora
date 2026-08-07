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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateObjectFacadeUseCase } from './use-cases/create-object-facade.use-case.js';
import { GetWorkspaceObjectsQuery } from './use-cases/get-workspace-objects.query.js';
import { GetObjectQuery } from './use-cases/get-object.query.js';
import { UpdateObjectUseCase } from './use-cases/update-object.use-case.js';
import { DeleteObjectUseCase } from './use-cases/delete-object.use-case.js';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { FilterObjectDto } from './dto/filter-object.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/objects')
export class ObjectsController {
  constructor(
    private readonly createObjectUseCase: CreateObjectFacadeUseCase,
    private readonly getWorkspaceObjectsQuery: GetWorkspaceObjectsQuery,
    private readonly getObjectQuery: GetObjectQuery,
    private readonly updateObjectUseCase: UpdateObjectUseCase,
    private readonly deleteObjectUseCase: DeleteObjectUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.Object.Create)
  async createObject(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateObjectDto,
  ) {
    const result = await this.createObjectUseCase.execute({
      workspaceId,
      createdById: userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get()
  @RequirePermissions(Permissions.Object.Read)
  async getWorkspaceObjects(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterObjectDto,
  ) {
    const result = await this.getWorkspaceObjectsQuery.execute({
      workspaceId,
      filter,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get(':idOrKey')
  @RequirePermissions(Permissions.Object.Read)
  async getObjectByIdOrKey(
    @Param('workspaceId') workspaceId: string,
    @Param('idOrKey') idOrKey: string,
  ) {
    const result = await this.getObjectQuery.execute({ workspaceId, idOrKey });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Object.Update)
  async updateObject(
    @Param('workspaceId') workspaceId: string,
    @Param('id') objectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateObjectDto,
  ) {
    const result = await this.updateObjectUseCase.execute({
      workspaceId,
      objectId,
      userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Object.Delete)
  async softDeleteObject(
    @Param('workspaceId') workspaceId: string,
    @Param('id') objectId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.deleteObjectUseCase.execute({
      workspaceId,
      objectId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
