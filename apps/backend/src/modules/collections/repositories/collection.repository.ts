import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  Collection as LumoraCollection,
  CollectionItem,
  CollectionStatus,
  CollectionType,
  Prisma,
} from '../../../generated/prisma/client';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { FilterCollectionDto } from '../dto/filter-collection.dto';
import { USER_PUBLIC_SELECT } from '../../objects/repositories/object.repository';

export const COLLECTION_RELATIONS_INCLUDE = {
  createdBy: { select: USER_PUBLIC_SELECT },
  updatedBy: { select: USER_PUBLIC_SELECT },
  items: {
    include: {
      object: {
        include: {
          createdBy: { select: USER_PUBLIC_SELECT },
        },
      },
    },
    orderBy: { order: 'asc' as const },
  },
} as const;

export type CollectionWithRelations = Prisma.CollectionGetPayload<{
  include: typeof COLLECTION_RELATIONS_INCLUDE;
}>;

export interface CreateCollectionData {
  workspaceId: string;
  createdById: string;
  slug: string;
  name: string;
  description?: string;
  type?: CollectionType;
  query?: Record<string, any>;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date;
  isFavorite?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateCollectionData {
  updatedById: string;
  name?: string;
  description?: string;
  type?: CollectionType;
  query?: Record<string, any>;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date | null;
  isFavorite?: boolean;
  status?: CollectionStatus;
  settings?: Record<string, any>;
  archivedAt?: Date | null;
  deletedAt?: Date | null;
}

@Injectable()
export class CollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<CollectionWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.collection.findFirst({
      where: {
        id,
        status: { not: CollectionStatus.DELETED },
      },
      include: COLLECTION_RELATIONS_INCLUDE,
    });
  }

  async findBySlug(
    workspaceId: string,
    slug: string,
    tx?: PrismaTransaction,
  ): Promise<CollectionWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.collection.findFirst({
      where: {
        workspaceId,
        slug,
        status: { not: CollectionStatus.DELETED },
      },
      include: COLLECTION_RELATIONS_INCLUDE,
    });
  }

  async doesSlugExist(
    workspaceId: string,
    slug: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;
    const count = await client.collection.count({
      where: { workspaceId, slug },
    });
    return count > 0;
  }

  async findWorkspaceCollections(
    workspaceId: string,
    filter: FilterCollectionDto,
    tx?: PrismaTransaction,
  ): Promise<CollectionWithRelations[]> {
    const client = tx ?? this.prisma;
    const where: Prisma.CollectionWhereInput = {
      workspaceId,
      status: filter.status ?? { not: CollectionStatus.DELETED },
    };

    if (filter.type) {
      where.type = filter.type;
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

    return client.collection.findMany({
      where,
      include: COLLECTION_RELATIONS_INCLUDE,
      orderBy: [{ pinnedAt: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(
    data: CreateCollectionData,
    tx?: PrismaTransaction,
  ): Promise<LumoraCollection> {
    const client = tx ?? this.prisma;
    return client.collection.create({
      data: {
        workspaceId: data.workspaceId,
        createdById: data.createdById,
        slug: data.slug,
        name: data.name,
        description: data.description,
        type: data.type ?? CollectionType.STATIC,
        query: data.query,
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
    data: UpdateCollectionData,
    tx?: PrismaTransaction,
  ): Promise<CollectionWithRelations> {
    const client = tx ?? this.prisma;
    return client.collection.update({
      where: { id },
      data: {
        updatedById: data.updatedById,
        name: data.name,
        description: data.description,
        type: data.type,
        query: data.query,
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
      include: COLLECTION_RELATIONS_INCLUDE,
    });
  }

  async softDelete(
    id: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<LumoraCollection> {
    const client = tx ?? this.prisma;
    return client.collection.update({
      where: { id },
      data: {
        status: CollectionStatus.DELETED,
        deletedAt: new Date(),
        updatedById: userId,
        revision: { increment: 1 },
      },
    });
  }

  async addItem(
    collectionId: string,
    objectId: string,
    order: number = 0,
    tx?: PrismaTransaction,
  ): Promise<CollectionItem> {
    const client = tx ?? this.prisma;
    return client.collectionItem.create({
      data: {
        collectionId,
        objectId,
        order,
      },
    });
  }

  async removeItem(
    collectionId: string,
    objectId: string,
    tx?: PrismaTransaction,
  ): Promise<Prisma.BatchPayload> {
    const client = tx ?? this.prisma;
    return client.collectionItem.deleteMany({
      where: {
        collectionId,
        objectId,
      },
    });
  }
}
