import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  Collection as LumoraCollection,
  CollectionItem,
  CollectionType,
  Prisma,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { FilterCollectionDto } from '../dto/filter-collection.dto';
import { USER_PUBLIC_SELECT } from '../../common/prisma-select.constants.js';

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
}

export interface UpdateCollectionData {
  updatedById: string;
  name?: string;
  description?: string;
  type?: CollectionType;
  query?: Record<string, any>;
}

//
// Collection was reduced — see cleanup report §12. No status/lifecycle
// fields remain: findById/findBySlug/findWorkspaceCollections no longer
// filter by status, softDelete() is now a real hard delete(), and update()
// no longer touches a CAS revision counter (Collection is not a
// concurrently-edited source of truth the way Object is).
//
@Injectable()
export class CollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<CollectionWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.collection.findFirst({
      where: { id },
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
      where: { workspaceId, slug },
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
    const where: Prisma.CollectionWhereInput = { workspaceId };

    if (filter.type) {
      where.type = filter.type;
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
      orderBy: [{ updatedAt: 'desc' }],
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
      },
      include: COLLECTION_RELATIONS_INCLUDE,
    });
  }

  /**
   * Hard-deletes a Collection. Collection has no soft-delete recovery
   * window — losing a saved grouping is not the same stakes as losing
   * an Object. CollectionItem rows cascade-delete automatically
   * (schema onDelete: Cascade); the referenced Objects are untouched.
   */
  async delete(id: string, tx?: PrismaTransaction): Promise<LumoraCollection> {
    const client = tx ?? this.prisma;
    return client.collection.delete({ where: { id } });
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
