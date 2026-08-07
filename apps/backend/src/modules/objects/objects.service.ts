import { Injectable } from '@nestjs/common';
import {
  EntityNotFoundException,
  ConflictException,
  RevisionConflictException,
} from '@lumora/shared';
import { ObjectRepository } from './repositories/object.repository';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { FilterObjectDto } from './dto/filter-object.dto';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import {
  Object as LumoraObject,
  AuditAction,
  ObjectStatus,
} from '../../generated/prisma/client.js';

@Injectable()
export class ObjectsService {
  constructor(
    private readonly objectRepository: ObjectRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createObject(
    workspaceId: string,
    createdById: string,
    dto: CreateObjectDto,
  ): Promise<LumoraObject> {
    let objectKey = dto.objectKey?.trim();
    if (!objectKey) {
      objectKey = await this.generateUniqueObjectKey(workspaceId, dto.typeKey);
    } else {
      const exists = await this.objectRepository.doesObjectKeyExist(
        workspaceId,
        objectKey,
      );
      if (exists) {
        throw new ConflictException(
          'Object',
          `key '${objectKey}' already exists in this workspace`,
        );
      }
    }

    const pinnedAt = dto.pinnedAt ? new Date(dto.pinnedAt) : undefined;

    const object = await this.objectRepository.create({
      workspaceId,
      createdById,
      objectKey,
      typeKey: dto.typeKey,
      title: dto.title,
      description: dto.description,
      spaceId: dto.spaceId,
      icon: dto.icon,
      emoji: dto.emoji,
      cover: dto.cover,
      color: dto.color,
      pinnedAt,
      isFavorite: dto.isFavorite,
      systemData: dto.systemData,
      attributes: dto.attributes,
    });

    await this.auditLogRepository.create({
      userId: createdById,
      entity: 'Object',
      entityId: object.id,
      action: AuditAction.CREATE,
      newData: {
        workspaceId,
        objectKey,
        typeKey: dto.typeKey,
        title: dto.title,
      },
    });

    return object;
  }

  async getWorkspaceObjects(
    workspaceId: string,
    filter: FilterObjectDto,
  ): Promise<LumoraObject[]> {
    return this.objectRepository.findWorkspaceObjects(workspaceId, filter);
  }

  async getObjectByIdOrKey(
    workspaceId: string,
    idOrKey: string,
  ): Promise<LumoraObject> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrKey,
      );
    let object = isUuid ? await this.objectRepository.findById(idOrKey) : null;

    if (!object) {
      object = await this.objectRepository.findByObjectKey(
        workspaceId,
        idOrKey,
      );
    }

    if (!object || object.workspaceId !== workspaceId) {
      throw new EntityNotFoundException('Object', idOrKey);
    }

    return object;
  }

  async updateObject(
    workspaceId: string,
    objectId: string,
    userId: string,
    dto: UpdateObjectDto,
  ): Promise<LumoraObject> {
    const object = await this.getObjectByIdOrKey(workspaceId, objectId);

    if (dto.revision !== undefined && dto.revision !== object.revision) {
      throw new RevisionConflictException(
        'Object',
        object.revision,
        dto.revision,
      );
    }

    const pinnedAt =
      dto.pinnedAt === null
        ? null
        : dto.pinnedAt
          ? new Date(dto.pinnedAt)
          : undefined;
    const archivedAt =
      dto.status === ObjectStatus.ARCHIVED ? new Date() : undefined;

    const updated = await this.objectRepository.update(object.id, {
      updatedById: userId,
      title: dto.title,
      description: dto.description,
      spaceId: dto.spaceId,
      icon: dto.icon,
      emoji: dto.emoji,
      cover: dto.cover,
      color: dto.color,
      pinnedAt,
      isFavorite: dto.isFavorite,
      status: dto.status,
      systemData: dto.systemData,
      attributes: dto.attributes,
      archivedAt,
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Object',
      entityId: object.id,
      action: AuditAction.UPDATE,
      newData: {
        title: dto.title,
        typeKey: object.typeKey,
        revision: updated.revision,
      },
    });

    return updated;
  }

  async softDeleteObject(
    workspaceId: string,
    objectId: string,
    userId: string,
  ): Promise<LumoraObject> {
    const object = await this.getObjectByIdOrKey(workspaceId, objectId);

    const deleted = await this.objectRepository.softDelete(object.id, userId);

    await this.auditLogRepository.create({
      userId,
      entity: 'Object',
      entityId: object.id,
      action: AuditAction.DELETE,
    });

    return deleted;
  }

  private async generateUniqueObjectKey(
    workspaceId: string,
    typeKey: string,
  ): Promise<string> {
    const prefix = typeKey.split('.').pop()?.toUpperCase() || 'OBJ';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
      const exists = await this.objectRepository.doesObjectKeyExist(
        workspaceId,
        candidate,
      );
      if (!exists) {
        return candidate;
      }
    }
    return `${prefix}-${Date.now()}`;
  }
}
