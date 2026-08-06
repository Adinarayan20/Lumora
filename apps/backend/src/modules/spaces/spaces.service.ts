import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SpaceRepository } from './repositories/space.repository';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { FilterSpaceDto } from './dto/filter-space.dto';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import {
  Space as LumoraSpace,
  AuditAction,
  SpaceStatus,
} from '../../generated/prisma/client.js';

@Injectable()
export class SpacesService {
  constructor(
    private readonly spaceRepository: SpaceRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createSpace(
    workspaceId: string,
    createdById: string,
    dto: CreateSpaceDto,
  ): Promise<LumoraSpace> {
    if (dto.parentId) {
      await this.validateParent(workspaceId, dto.parentId);
    }

    const slug = await this.generateSlug(workspaceId, dto.name);
    const pinnedAt = dto.pinnedAt ? new Date(dto.pinnedAt) : undefined;

    const space = await this.spaceRepository.create({
      workspaceId,
      createdById,
      slug,
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId,
      icon: dto.icon,
      emoji: dto.emoji,
      cover: dto.cover,
      color: dto.color,
      pinnedAt,
      isFavorite: dto.isFavorite,
      settings: dto.settings as Record<string, any>,
    });

    await this.auditLogRepository.create({
      userId: createdById,
      entity: 'Space',
      entityId: space.id,
      action: AuditAction.CREATE,
      newData: {
        workspaceId,
        slug,
        name: dto.name,
        parentId: dto.parentId,
      },
    });

    return space;
  }

  async getWorkspaceSpaces(
    workspaceId: string,
    filter: FilterSpaceDto,
  ): Promise<LumoraSpace[]> {
    return this.spaceRepository.findWorkspaceSpaces(workspaceId, filter);
  }

  async getSpaceByIdOrSlug(
    workspaceId: string,
    idOrSlug: string,
  ): Promise<LumoraSpace> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    let space = isUuid ? await this.spaceRepository.findById(idOrSlug) : null;

    if (!space) {
      space = await this.spaceRepository.findBySlug(workspaceId, idOrSlug);
    }

    if (!space || space.workspaceId !== workspaceId) {
      throw new NotFoundException('Space not found');
    }

    return space;
  }

  async updateSpace(
    workspaceId: string,
    spaceId: string,
    userId: string,
    dto: UpdateSpaceDto,
  ): Promise<LumoraSpace> {
    const space = await this.getSpaceByIdOrSlug(workspaceId, spaceId);

    if (dto.revision !== undefined && dto.revision !== space.revision) {
      throw new ConflictException(
        `Space revision mismatch: current is ${space.revision}, update expected ${dto.revision}`,
      );
    }

    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === space.id) {
        throw new BadRequestException('A Space cannot be its own parent');
      }
      await this.validateParent(workspaceId, dto.parentId);
      await this.validateParentCycle(workspaceId, space.id, dto.parentId);
    }

    const pinnedAt =
      dto.pinnedAt === null
        ? null
        : dto.pinnedAt
          ? new Date(dto.pinnedAt)
          : undefined;
    const archivedAt =
      dto.status === SpaceStatus.ARCHIVED ? new Date() : undefined;

    const updated = await this.spaceRepository.update(space.id, {
      updatedById: userId,
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId,
      icon: dto.icon,
      emoji: dto.emoji,
      cover: dto.cover,
      color: dto.color,
      pinnedAt,
      isFavorite: dto.isFavorite,
      status: dto.status,
      settings: dto.settings as Record<string, any>,
      archivedAt,
    });

    await this.auditLogRepository.create({
      userId,
      entity: 'Space',
      entityId: space.id,
      action: AuditAction.UPDATE,
      newData: {
        name: dto.name,
        revision: updated.revision,
      },
    });

    return updated;
  }

  async softDeleteSpace(
    workspaceId: string,
    spaceId: string,
    userId: string,
  ): Promise<LumoraSpace> {
    const space = await this.getSpaceByIdOrSlug(workspaceId, spaceId);

    const { childSpacesCount, childObjectsCount } =
      await this.spaceRepository.countActiveChildren(space.id);

    if (childSpacesCount > 0 || childObjectsCount > 0) {
      throw new BadRequestException(
        `Cannot delete Space containing active contents (${childSpacesCount} child spaces, ${childObjectsCount} objects). Delete or move contents first.`,
      );
    }

    const deleted = await this.spaceRepository.softDelete(space.id, userId);

    await this.auditLogRepository.create({
      userId,
      entity: 'Space',
      entityId: space.id,
      action: AuditAction.DELETE,
    });

    return deleted;
  }

  private async validateParent(
    workspaceId: string,
    parentId: string,
  ): Promise<void> {
    const parent = await this.spaceRepository.findById(parentId);
    if (!parent || parent.workspaceId !== workspaceId) {
      throw new NotFoundException('Parent space not found in this workspace');
    }
  }

  private async validateParentCycle(
    workspaceId: string,
    spaceId: string,
    targetParentId: string,
  ): Promise<void> {
    let currentId: string | null = targetParentId;
    const maxDepth = 50;
    let depth = 0;

    while (currentId && depth < maxDepth) {
      if (currentId === spaceId) {
        throw new BadRequestException(
          'Circular spatial hierarchy detected: target parent is a child of this Space',
        );
      }
      const parentSpace = await this.spaceRepository.findById(currentId);
      currentId = parentSpace?.parentId || null;
      depth++;
    }
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
        .replace(/^-+|-+$/g, '') || 'space';

    let candidate = baseSlug;
    let counter = 1;

    while (await this.spaceRepository.doesSlugExist(workspaceId, candidate)) {
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }

    return candidate;
  }
}
