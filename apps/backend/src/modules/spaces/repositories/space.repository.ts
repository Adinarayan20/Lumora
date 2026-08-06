import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  Space as LumoraSpace,
  SpaceStatus,
  ObjectStatus,
  Prisma,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { FilterSpaceDto } from '../dto/filter-space.dto';
import { USER_PUBLIC_SELECT } from '../../objects/repositories/object.repository';

export const SPACE_RELATIONS_INCLUDE = {
  createdBy: { select: USER_PUBLIC_SELECT },
  updatedBy: { select: USER_PUBLIC_SELECT },
  parent: true,
} as const;

export type SpaceWithRelations = Prisma.SpaceGetPayload<{
  include: typeof SPACE_RELATIONS_INCLUDE;
}>;

export interface CreateSpaceData {
  workspaceId: string;
  createdById: string;
  slug: string;
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date;
  isFavorite?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateSpaceData {
  updatedById: string;
  name?: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date | null;
  isFavorite?: boolean;
  status?: SpaceStatus;
  settings?: Record<string, any>;
  archivedAt?: Date | null;
  deletedAt?: Date | null;
}

@Injectable()
export class SpaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<SpaceWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.space.findFirst({
      where: {
        id,
        status: { not: SpaceStatus.DELETED },
      },
      include: SPACE_RELATIONS_INCLUDE,
    });
  }

  async findBySlug(
    workspaceId: string,
    slug: string,
    tx?: PrismaTransaction,
  ): Promise<SpaceWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.space.findFirst({
      where: {
        workspaceId,
        slug,
        status: { not: SpaceStatus.DELETED },
      },
      include: SPACE_RELATIONS_INCLUDE,
    });
  }

  async doesSlugExist(
    workspaceId: string,
    slug: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;
    const count = await client.space.count({
      where: { workspaceId, slug },
    });
    return count > 0;
  }

  async findWorkspaceSpaces(
    workspaceId: string,
    filter: FilterSpaceDto,
    tx?: PrismaTransaction,
  ): Promise<SpaceWithRelations[]> {
    const client = tx ?? this.prisma;
    const where: Prisma.SpaceWhereInput = {
      workspaceId,
      status: filter.status ?? { not: SpaceStatus.DELETED },
    };

    if (filter.parentId !== undefined) {
      where.parentId = filter.parentId || null;
    }
    if (filter.isFavorite !== undefined) {
      where.isFavorite = filter.isFavorite;
    }
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return client.space.findMany({
      where,
      include: SPACE_RELATIONS_INCLUDE,
      orderBy: [{ pinnedAt: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async countActiveChildren(
    spaceId: string,
    tx?: PrismaTransaction,
  ): Promise<{ childSpacesCount: number; childObjectsCount: number }> {
    const client = tx ?? this.prisma;
    const [childSpacesCount, childObjectsCount] = await Promise.all([
      client.space.count({
        where: { parentId: spaceId, status: { not: SpaceStatus.DELETED } },
      }),
      client.object.count({
        where: { spaceId, status: { not: ObjectStatus.DELETED } },
      }),
    ]);
    return { childSpacesCount, childObjectsCount };
  }

  async create(
    data: CreateSpaceData,
    tx?: PrismaTransaction,
  ): Promise<LumoraSpace> {
    const client = tx ?? this.prisma;
    return client.space.create({
      data: {
        workspaceId: data.workspaceId,
        createdById: data.createdById,
        slug: data.slug,
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        icon: data.icon,
        emoji: data.emoji,
        cover: data.cover,
        color: data.color,
        pinnedAt: data.pinnedAt,
        isFavorite: data.isFavorite ?? false,
        settings: data.settings,
      },
    });
  }

  async update(
    id: string,
    data: UpdateSpaceData,
    tx?: PrismaTransaction,
  ): Promise<SpaceWithRelations> {
    const client = tx ?? this.prisma;
    return client.space.update({
      where: { id },
      data: {
        updatedById: data.updatedById,
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        icon: data.icon,
        emoji: data.emoji,
        cover: data.cover,
        color: data.color,
        pinnedAt: data.pinnedAt,
        isFavorite: data.isFavorite,
        status: data.status,
        settings: data.settings,
        archivedAt: data.archivedAt,
        deletedAt: data.deletedAt,
        revision: { increment: 1 },
      },
      include: SPACE_RELATIONS_INCLUDE,
    });
  }

  async softDelete(
    id: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<LumoraSpace> {
    const client = tx ?? this.prisma;
    return client.space.update({
      where: { id },
      data: {
        status: SpaceStatus.DELETED,
        deletedAt: new Date(),
        updatedById: userId,
        revision: { increment: 1 },
      },
    });
  }
}
