import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
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
  ): Promise<Result<LumoraObject, ApplicationException>> {
    let objectKey = dto.objectKey?.trim();
    if (!objectKey) {
      objectKey = await this.generateUniqueObjectKey(workspaceId, dto.typeKey);
    } else {
      const exists = await this.objectRepository.doesObjectKeyExist(
        workspaceId,
        objectKey,
      );
      if (exists) {
        return Result.fail(
          new ConflictException(
            'Object',
            `key '${objectKey}' already exists in this workspace`,
          ),
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

    return Result.ok(object);
  }

  async getWorkspaceObjects(
    workspaceId: string,
    filter: FilterObjectDto,
  ): Promise<Result<LumoraObject[], ApplicationException>> {
    const objects = await this.objectRepository.findWorkspaceObjects(
      workspaceId,
      filter,
    );
    return Result.ok(objects);
  }

  async getObjectByIdOrKey(
    workspaceId: string,
    idOrKey: string,
  ): Promise<Result<LumoraObject, ApplicationException>> {
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
      return Result.fail(new EntityNotFoundException('Object', idOrKey));
    }

    return Result.ok(object);
  }

  async updateObject(
    workspaceId: string,
    objectId: string,
    userId: string,
    dto: UpdateObjectDto,
  ): Promise<Result<LumoraObject, ApplicationException>> {
    const objectResult = await this.getObjectByIdOrKey(workspaceId, objectId);
    if (objectResult.isFailure) {
      return Result.fail(objectResult.getError());
    }

    const object = objectResult.getValue();

    if (dto.revision !== undefined && dto.revision !== object.revision) {
      return Result.fail(
        new RevisionConflictException('Object', object.revision, dto.revision),
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

    return Result.ok(updated);
  }

  async softDeleteObject(
    workspaceId: string,
    objectId: string,
    userId: string,
  ): Promise<Result<LumoraObject, ApplicationException>> {
    const objectResult = await this.getObjectByIdOrKey(workspaceId, objectId);
    if (objectResult.isFailure) {
      return Result.fail(objectResult.getError());
    }

    const object = objectResult.getValue();
    const deleted = await this.objectRepository.softDelete(object.id, userId);

    await this.auditLogRepository.create({
      userId,
      entity: 'Object',
      entityId: object.id,
      action: AuditAction.DELETE,
    });

    return Result.ok(deleted);
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
