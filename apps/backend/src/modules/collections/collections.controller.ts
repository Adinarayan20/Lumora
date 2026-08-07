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
import {
  CreateCollectionUseCase,
  GetWorkspaceCollectionsQuery,
  GetCollectionQuery,
  UpdateCollectionUseCase,
  DeleteCollectionUseCase,
  AddCollectionItemUseCase,
  RemoveCollectionItemUseCase,
} from './use-cases/collection-use-cases.js';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { AddCollectionItemDto } from './dto/add-collection-item.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/collections')
export class CollectionsController {
  constructor(
    private readonly createCollectionUseCase: CreateCollectionUseCase,
    private readonly getWorkspaceCollectionsQuery: GetWorkspaceCollectionsQuery,
    private readonly getCollectionQuery: GetCollectionQuery,
    private readonly updateCollectionUseCase: UpdateCollectionUseCase,
    private readonly deleteCollectionUseCase: DeleteCollectionUseCase,
    private readonly addCollectionItemUseCase: AddCollectionItemUseCase,
    private readonly removeCollectionItemUseCase: RemoveCollectionItemUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.Collection.Create)
  async createCollection(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCollectionDto,
  ) {
    const result = await this.createCollectionUseCase.execute({
      workspaceId,
      createdById: userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get()
  @RequirePermissions(Permissions.Collection.Read)
  async getWorkspaceCollections(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterCollectionDto,
  ) {
    const result = await this.getWorkspaceCollectionsQuery.execute({
      workspaceId,
      filter,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Get(':idOrSlug')
  @RequirePermissions(Permissions.Collection.Read)
  async getCollectionByIdOrSlug(
    @Param('workspaceId') workspaceId: string,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    const result = await this.getCollectionQuery.execute({
      workspaceId,
      idOrSlug,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Collection.Update)
  async updateCollection(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    const result = await this.updateCollectionUseCase.execute({
      workspaceId,
      collectionId,
      userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Collection.Delete)
  async softDeleteCollection(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.deleteCollectionUseCase.execute({
      workspaceId,
      collectionId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Post(':id/items')
  @RequirePermissions(Permissions.Collection.Update)
  async addCollectionItem(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddCollectionItemDto,
  ) {
    const result = await this.addCollectionItemUseCase.execute({
      workspaceId,
      collectionId,
      userId,
      dto,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }

  @Delete(':id/items/:objectId')
  @RequirePermissions(Permissions.Collection.Update)
  async removeCollectionItem(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.removeCollectionItemUseCase.execute({
      workspaceId,
      collectionId,
      objectId,
      userId,
    });
    if (result.isFailure) throw result.getError();
    return result.getValue();
  }
}
