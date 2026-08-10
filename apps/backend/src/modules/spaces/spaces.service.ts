import { Injectable } from '@nestjs/common';
import {
  Result,
  ApplicationException,
  EntityNotFoundException,
  DomainValidationException,
  RevisionConflictException,
} from '@lumora/shared';
import { SpaceRepository } from './repositories/space.repository';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { FilterSpaceDto } from './dto/filter-space.dto';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import { AuditAction, SpaceStatus } from '../../generated/prisma/client.js';
import { SpaceResponseDto } from './dto/space-response.dto.js';

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
  ): Promise<Result<SpaceResponseDto, ApplicationException>> {
    if (dto.parentId) {
      const parentResult = await this.validateParent(workspaceId, dto.parentId);
      if (parentResult.isFailure) {
        return Result.fail(parentResult.getError());
      }
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

    return Result.ok(this.toDto(space));
  }

  async getWorkspaceSpaces(
    workspaceId: string,
    filter: FilterSpaceDto,
  ): Promise<Result<SpaceResponseDto[], ApplicationException>> {
    const spaces = await this.spaceRepository.findWorkspaceSpaces(
      workspaceId,
      filter,
    );
    return Result.ok(spaces.map((s) => this.toDto(s)));
  }

  async getSpaceByIdOrSlug(
    workspaceId: string,
    idOrSlug: string,
  ): Promise<Result<SpaceResponseDto, ApplicationException>> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    let space = isUuid ? await this.spaceRepository.findById(idOrSlug) : null;

    if (!space) {
      space = await this.spaceRepository.findBySlug(workspaceId, idOrSlug);
    }

    if (!space || space.workspaceId !== workspaceId) {
      return Result.fail(new EntityNotFoundException('Space', idOrSlug));
    }

    return Result.ok(this.toDto(space));
  }

  async updateSpace(
    workspaceId: string,
    spaceId: string,
    userId: string,
    dto: UpdateSpaceDto,
  ): Promise<Result<SpaceResponseDto, ApplicationException>> {
    const spaceResult = await this.getSpaceByIdOrSlug(workspaceId, spaceId);
    if (spaceResult.isFailure) {
      return Result.fail(spaceResult.getError());
    }

    const space = spaceResult.getValue();

    if (dto.revision !== undefined && dto.revision !== space.revision) {
      return Result.fail(
        new RevisionConflictException('Space', space.revision, dto.revision),
      );
    }

    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === space.id) {
        return Result.fail(
          new DomainValidationException('A Space cannot be its own parent.'),
        );
      }
      const parentResult = await this.validateParent(workspaceId, dto.parentId);
      if (parentResult.isFailure) {
        return Result.fail(parentResult.getError());
      }
      const cycleResult = await this.validateParentCycle(
        workspaceId,
        space.id,
        dto.parentId,
      );
      if (cycleResult.isFailure) {
        return Result.fail(cycleResult.getError());
      }
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

    return Result.ok(this.toDto(updated));
  }

  async softDeleteSpace(
    workspaceId: string,
    spaceId: string,
    userId: string,
  ): Promise<Result<SpaceResponseDto, ApplicationException>> {
    const spaceResult = await this.getSpaceByIdOrSlug(workspaceId, spaceId);
    if (spaceResult.isFailure) {
      return Result.fail(spaceResult.getError());
    }

    const space = spaceResult.getValue();

    const { childSpacesCount, childObjectsCount } =
      await this.spaceRepository.countActiveChildren(space.id);

    if (childSpacesCount > 0 || childObjectsCount > 0) {
      return Result.fail(
        new DomainValidationException(
          `Cannot delete Space containing active contents (${childSpacesCount} child spaces, ${childObjectsCount} objects). Delete or move contents first.`,
        ),
      );
    }

    const deleted = await this.spaceRepository.softDelete(space.id, userId);

    await this.auditLogRepository.create({
      userId,
      entity: 'Space',
      entityId: space.id,
      action: AuditAction.DELETE,
    });

    return Result.ok(this.toDto(deleted));
  }

  private async validateParent(
    workspaceId: string,
    parentId: string,
  ): Promise<Result<void, ApplicationException>> {
    const parent = await this.spaceRepository.findById(parentId);
    if (!parent || parent.workspaceId !== workspaceId) {
      return Result.fail(new EntityNotFoundException('Parent space', parentId));
    }
    return Result.ok(undefined);
  }

  private async validateParentCycle(
    workspaceId: string,
    spaceId: string,
    targetParentId: string,
  ): Promise<Result<void, ApplicationException>> {
    let currentId: string | null = targetParentId;
    const maxDepth = 50;
    let depth = 0;

    while (currentId && depth < maxDepth) {
      if (currentId === spaceId) {
        return Result.fail(
          new DomainValidationException(
            'Circular spatial hierarchy detected: target parent is a child of this Space.',
          ),
        );
      }
      const parentSpace = await this.spaceRepository.findById(currentId);
      currentId = parentSpace?.parentId || null;
      depth++;
    }
    return Result.ok(undefined);
  }

  private toDto(
    s: import('../../generated/prisma/client.js').Space,
  ): SpaceResponseDto {
    return {
      id: s.id,
      workspaceId: s.workspaceId,
      parentId: s.parentId ?? undefined,
      createdById: s.createdById,
      updatedById: s.updatedById ?? undefined,
      slug: s.slug,
      name: s.name,
      description: s.description ?? undefined,
      icon: s.icon ?? undefined,
      emoji: s.emoji ?? undefined,
      cover: s.cover ?? undefined,
      color: s.color ?? undefined,
      pinnedAt: s.pinnedAt?.toISOString(),
      isFavorite: s.isFavorite,
      status: s.status,
      settings: (s.settings as Record<string, unknown>) ?? undefined,
      revision: s.revision,
      archivedAt: s.archivedAt?.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
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
