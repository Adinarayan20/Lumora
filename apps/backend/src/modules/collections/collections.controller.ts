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
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { AddCollectionItemDto } from './dto/add-collection-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { Permissions } from '../rbac/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workspaces/:workspaceId/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @RequirePermissions(Permissions.Collection.Create)
  async createCollection(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.collectionsService.createCollection(workspaceId, userId, dto);
  }

  @Get()
  @RequirePermissions(Permissions.Collection.Read)
  async getWorkspaceCollections(
    @Param('workspaceId') workspaceId: string,
    @Query() filter: FilterCollectionDto,
  ) {
    return this.collectionsService.getWorkspaceCollections(workspaceId, filter);
  }

  @Get(':idOrSlug')
  @RequirePermissions(Permissions.Collection.Read)
  async getCollectionByIdOrSlug(
    @Param('workspaceId') workspaceId: string,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    return this.collectionsService.getCollectionByIdOrSlug(
      workspaceId,
      idOrSlug,
    );
  }

  @Patch(':id')
  @RequirePermissions(Permissions.Collection.Update)
  async updateCollection(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.updateCollection(
      workspaceId,
      collectionId,
      userId,
      dto,
    );
  }

  @Delete(':id')
  @RequirePermissions(Permissions.Collection.Delete)
  async softDeleteCollection(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionsService.softDeleteCollection(
      workspaceId,
      collectionId,
      userId,
    );
  }

  @Post(':id/items')
  @RequirePermissions(Permissions.Collection.Update)
  async addCollectionItem(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddCollectionItemDto,
  ) {
    return this.collectionsService.addCollectionItem(
      workspaceId,
      collectionId,
      userId,
      dto,
    );
  }

  @Delete(':id/items/:objectId')
  @RequirePermissions(Permissions.Collection.Update)
  async removeCollectionItem(
    @Param('workspaceId') workspaceId: string,
    @Param('id') collectionId: string,
    @Param('objectId') objectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionsService.removeCollectionItem(
      workspaceId,
      collectionId,
      objectId,
      userId,
    );
  }
}
