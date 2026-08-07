/**
 * Application-layer façade use cases for the Collections bounded context.
 *
 * All use cases delegate to CollectionsService, which owns legacy business logic
 * (slug generation, duplicate item conflict guard, audit logs) until Phase 3
 * DDD migration.
 */
import { Injectable } from '@nestjs/common';
import { Result, ApplicationException } from '@lumora/shared';
import { CollectionsService } from '../collections.service.js';
import { CreateCollectionDto } from '../dto/create-collection.dto.js';
import { UpdateCollectionDto } from '../dto/update-collection.dto.js';
import { FilterCollectionDto } from '../dto/filter-collection.dto.js';
import { AddCollectionItemDto } from '../dto/add-collection-item.dto.js';
import {
  Collection as LumoraCollection,
  CollectionItem,
} from '../../../generated/prisma/client.js';

// ─── Commands ────────────────────────────────────────────────────────────────

export interface CreateCollectionCommand {
  workspaceId: string;
  createdById: string;
  dto: CreateCollectionDto;
}

@Injectable()
export class CreateCollectionUseCase {
  constructor(private readonly service: CollectionsService) {}
  async execute(
    cmd: CreateCollectionCommand,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    return this.service.createCollection(
      cmd.workspaceId,
      cmd.createdById,
      cmd.dto,
    );
  }
}

export interface UpdateCollectionCommand {
  workspaceId: string;
  collectionId: string;
  userId: string;
  dto: UpdateCollectionDto;
}

@Injectable()
export class UpdateCollectionUseCase {
  constructor(private readonly service: CollectionsService) {}
  async execute(
    cmd: UpdateCollectionCommand,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    return this.service.updateCollection(
      cmd.workspaceId,
      cmd.collectionId,
      cmd.userId,
      cmd.dto,
    );
  }
}

export interface DeleteCollectionCommand {
  workspaceId: string;
  collectionId: string;
  userId: string;
}

@Injectable()
export class DeleteCollectionUseCase {
  constructor(private readonly service: CollectionsService) {}
  async execute(
    cmd: DeleteCollectionCommand,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    return this.service.softDeleteCollection(
      cmd.workspaceId,
      cmd.collectionId,
      cmd.userId,
    );
  }
}

export interface AddCollectionItemCommand {
  workspaceId: string;
  collectionId: string;
  userId: string;
  dto: AddCollectionItemDto;
}

@Injectable()
export class AddCollectionItemUseCase {
  constructor(private readonly service: CollectionsService) {}
  async execute(
    cmd: AddCollectionItemCommand,
  ): Promise<Result<CollectionItem, ApplicationException>> {
    return this.service.addCollectionItem(
      cmd.workspaceId,
      cmd.collectionId,
      cmd.userId,
      cmd.dto,
    );
  }
}

export interface RemoveCollectionItemCommand {
  workspaceId: string;
  collectionId: string;
  objectId: string;
  userId: string;
}

@Injectable()
export class RemoveCollectionItemUseCase {
  constructor(private readonly service: CollectionsService) {}
  async execute(
    cmd: RemoveCollectionItemCommand,
  ): Promise<Result<{ removed: boolean }, ApplicationException>> {
    return this.service.removeCollectionItem(
      cmd.workspaceId,
      cmd.collectionId,
      cmd.objectId,
      cmd.userId,
    );
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetWorkspaceCollectionsQueryInput {
  workspaceId: string;
  filter: FilterCollectionDto;
}

@Injectable()
export class GetWorkspaceCollectionsQuery {
  constructor(private readonly service: CollectionsService) {}
  async execute(
    input: GetWorkspaceCollectionsQueryInput,
  ): Promise<Result<LumoraCollection[], ApplicationException>> {
    return this.service.getWorkspaceCollections(
      input.workspaceId,
      input.filter,
    );
  }
}

export interface GetCollectionQueryInput {
  workspaceId: string;
  idOrSlug: string;
}

@Injectable()
export class GetCollectionQuery {
  constructor(private readonly service: CollectionsService) {}
  async execute(
    input: GetCollectionQueryInput,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    return this.service.getCollectionByIdOrSlug(
      input.workspaceId,
      input.idOrSlug,
    );
  }
}
