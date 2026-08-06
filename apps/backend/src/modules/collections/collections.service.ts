import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CollectionRepository } from './repositories/collection.repository';
import { ObjectRepository } from '../objects/repositories/object.repository';
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
    private readonly objectRepository: ObjectRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createCollection(
    workspaceId: string,
    createdById: string,
    dto: CreateCollectionDto,
  ): Promise<LumoraCollection> {
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

    return collection;
  }

  async getWorkspaceCollections(
    workspaceId: string,
    filter: FilterCollectionDto,
  ): Promise<LumoraCollection[]> {
    return this.collectionRepository.findWorkspaceCollections(
      workspaceId,
      filter,
    );
  }

  async getCollectionByIdOrSlug(
    workspaceId: string,
    idOrSlug: string,
  ): Promise<LumoraCollection> {
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
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async updateCollection(
    workspaceId: string,
    collectionId: string,
    userId: string,
    dto: UpdateCollectionDto,
  ): Promise<LumoraCollection> {
    const collection = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );

    if (dto.revision !== undefined && dto.revision !== collection.revision) {
      throw new ConflictException(
        `Collection revision mismatch: current is ${collection.revision}, update expected ${dto.revision}`,
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

    return updated;
  }

  async softDeleteCollection(
    workspaceId: string,
    collectionId: string,
    userId: string,
  ): Promise<LumoraCollection> {
    const collection = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );

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

    return deleted;
  }

  async addCollectionItem(
    workspaceId: string,
    collectionId: string,
    userId: string,
    dto: AddCollectionItemDto,
  ): Promise<CollectionItem> {
    const collection = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );

    const object = await this.objectRepository.findById(dto.objectId);
    if (!object || object.workspaceId !== workspaceId) {
      throw new NotFoundException(
        'Universal Object not found in this workspace',
      );
    }

    try {
      const item = await this.collectionRepository.addItem(
        collection.id,
        object.id,
        dto.order ?? 0,
      );

      await this.auditLogRepository.create({
        userId,
        entity: 'CollectionItem',
        entityId: item.id,
        action: AuditAction.CREATE,
        newData: {
          collectionId: collection.id,
          objectId: object.id,
        },
      });

      return item;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          'Object is already attached to this collection',
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
  ): Promise<{ removed: boolean }> {
    const collection = await this.getCollectionByIdOrSlug(
      workspaceId,
      collectionId,
    );

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

    return { removed: result.count > 0 };
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
