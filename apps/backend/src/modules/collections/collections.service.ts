import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
  EntityNotFoundException,
  ConflictException,
  RevisionConflictException,
} from '@lumora/shared';
import { CollectionRepository } from './repositories/collection.repository';
import { ObjectsService } from '../objects/objects.service.js';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { AddCollectionItemDto } from './dto/add-collection-item.dto';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import {
  Collection as LumoraCollection,
  CollectionItem,
  AuditAction,
  CollectionStatus,
  CollectionType,
} from '../../generated/prisma/client.js';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly objectsService: ObjectsService,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createCollection(
    workspaceId: string,
    createdById: string,
    dto: CreateCollectionDto,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    const slug = await this.generateSlug(workspaceId, dto.name);
    const pinnedAt = dto.pinnedAt ? new Date(dto.pinnedAt) : undefined;

    const collection = await this.collectionRepository.create({
      workspaceId,
      createdById,
      slug,
      name: dto.name,
      description: dto.description,
      type: dto.type ?? CollectionType.STATIC,
      query: dto.query,
      icon: dto.icon,
      emoji: dto.emoji,
      cover: dto.cover,
      color: dto.color,
      pinnedAt,
      isFavorite: dto.isFavorite,
      settings: dto.settings,
    });

    await this.auditLogRepository.create({
      userId: createdById,
      entity: 'Collection',
      entityId: collection.id,
      action: AuditAction.CREATE,
      newData: {
        workspaceId,
        slug,
        name: dto.name,
        type: collection.type,
      },
    });

    return Result.ok(collection);
  }

  async getWorkspaceCollections(
    workspaceId: string,
    filter: FilterCollectionDto,
  ): Promise<Result<LumoraCollection[], ApplicationException>> {
    const collections =
      await this.collectionRepository.findWorkspaceCollections(
        workspaceId,
        filter,
      );
    return Result.ok(collections);
  }

  async getCollectionByIdOrSlug(
    workspaceId: string,
    idOrSlug: string,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    let collection = isUuid
      ? await this.collectionRepository.findById(idOrSlug)
      : null;

    if (!collection) {
      collection = await this.collectionRepository.findBySlug(
        workspaceId,
        idOrSlug,
      );
    }

    if (!collection || collection.workspaceId !== workspaceId) {
      return Result.fail(new EntityNotFoundException('Collection', idOrSlug));
    }

    return Result.ok(collection);
  }

  async updateCollection(
    workspaceId: string,
    collectionId: string,
    userId: string,
    dto: UpdateCollectionDto,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    const collectionResult = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );
    if (collectionResult.isFailure) {
      return Result.fail(collectionResult.getError());
    }

    const collection = collectionResult.getValue();

    if (dto.revision !== undefined && dto.revision !== collection.revision) {
      return Result.fail(
        new RevisionConflictException(
          'Collection',
          collection.revision,
          dto.revision,
        ),
      );
    }

    const pinnedAt =
      dto.pinnedAt === null
        ? null
        : dto.pinnedAt
          ? new Date(dto.pinnedAt)
          : undefined;
    const archivedAt =
      dto.status === CollectionStatus.ARCHIVED ? new Date() : undefined;

    const updated = await this.collectionRepository.update(collection.id, {
      updatedById: userId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      query: dto.query,
      icon: dto.icon,
      emoji: dto.emoji,
      cover: dto.cover,
      color: dto.color,
      pinnedAt,
      isFavorite: dto.isFavorite,
      status: dto.status,
      settings: dto.settings,
      archivedAt,
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Collection',
      entityId: collection.id,
      action: AuditAction.UPDATE,
      newData: {
        name: dto.name,
        revision: updated.revision,
      },
    });

    return Result.ok(updated);
  }

  async softDeleteCollection(
    workspaceId: string,
    collectionId: string,
    userId: string,
  ): Promise<Result<LumoraCollection, ApplicationException>> {
    const collectionResult = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );
    if (collectionResult.isFailure) {
      return Result.fail(collectionResult.getError());
    }

    const collection = collectionResult.getValue();

    const deleted = await this.collectionRepository.softDelete(
      collection.id,
      userId,
    );

    await this.auditLogRepository.create({
      userId,
      entity: 'Collection',
      entityId: collection.id,
      action: AuditAction.DELETE,
    });

    return Result.ok(deleted);
  }

  async addCollectionItem(
    workspaceId: string,
    collectionId: string,
    userId: string,
    dto: AddCollectionItemDto,
  ): Promise<Result<CollectionItem, ApplicationException>> {
    const collectionResult = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );
    if (collectionResult.isFailure) {
      return Result.fail(collectionResult.getError());
    }

    const collection = collectionResult.getValue();

    const objectExists = await this.objectsService.verifyObjectInWorkspace(workspaceId, dto.objectId);
    if (!objectExists) {
      return Result.fail(new EntityNotFoundException('Object', dto.objectId));
    }

    try {
      const item = await this.collectionRepository.addItem(
        collection.id,
        dto.objectId,
        dto.order ?? 0,
      );

      await this.auditLogRepository.create({
        userId,
        entity: 'CollectionItem',
        entityId: item.id,
        action: AuditAction.CREATE,
        newData: {
          collectionId: collection.id,
          objectId: dto.objectId,
        },
      });

      return Result.ok(item);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        return Result.fail(
          new ConflictException(
            'CollectionItem',
            'Object is already attached to this collection',
          ),
        );
      }
      throw err;
    }
  }

  async removeCollectionItem(
    workspaceId: string,
    collectionId: string,
    objectId: string,
    userId: string,
  ): Promise<Result<{ removed: boolean }, ApplicationException>> {
    const collectionResult = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );
    if (collectionResult.isFailure) {
      return Result.fail(collectionResult.getError());
    }

    const collection = collectionResult.getValue();

    const result = await this.collectionRepository.removeItem(
      collection.id,
      objectId,
    );

    await this.auditLogRepository.create({
      userId,
      entity: 'CollectionItem',
      entityId: `${collection.id}:${objectId}`,
      action: AuditAction.DELETE,
    });

    return Result.ok({ removed: result.count > 0 });
  }

  private async generateSlug(
    workspaceId: string,
    name: string,
  ): Promise<string> {
    const baseSlug =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'collection';

    let candidate = baseSlug;
    let counter = 1;

    while (
      await this.collectionRepository.doesSlugExist(workspaceId, candidate)
    ) {
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }

    return candidate;
  }
}





