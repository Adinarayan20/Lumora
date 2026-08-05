import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  Object as LumoraObject,
  ObjectStatus,
  Prisma,
} from '../../../generated/prisma/client';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';
import { FilterObjectDto } from '../dto/filter-object.dto';

export const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

export const OBJECT_RELATIONS_INCLUDE = {
  createdBy: { select: USER_PUBLIC_SELECT },
  updatedBy: { select: USER_PUBLIC_SELECT },
  space: true,
} as const;

export type ObjectWithRelations = Prisma.ObjectGetPayload<{
  include: typeof OBJECT_RELATIONS_INCLUDE;
}>;

export interface CreateObjectData {
  workspaceId: string;
  createdById: string;
  objectKey: string;
  typeKey: string;
  title: string;
  description?: string;
  spaceId?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date;
  isFavorite?: boolean;
  systemData?: Record<string, any>;
  attributes?: Record<string, any>;
}

export interface UpdateObjectData {
  updatedById: string;
  title?: string;
  description?: string;
  spaceId?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  pinnedAt?: Date | null;
  isFavorite?: boolean;
  status?: ObjectStatus;
  systemData?: Record<string, any>;
  attributes?: Record<string, any>;
  archivedAt?: Date | null;
  deletedAt?: Date | null;
}

@Injectable()
export class ObjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<ObjectWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.object.findFirst({
      where: {
        id,
        status: { not: ObjectStatus.DELETED },
      },
      include: OBJECT_RELATIONS_INCLUDE,
    });
  }

  async findByObjectKey(
    workspaceId: string,
    objectKey: string,
    tx?: PrismaTransaction,
  ): Promise<ObjectWithRelations | null> {
    const client = tx ?? this.prisma;
    return client.object.findFirst({
      where: {
        workspaceId,
        objectKey,
        status: { not: ObjectStatus.DELETED },
      },
      include: OBJECT_RELATIONS_INCLUDE,
    });
  }

  async doesObjectKeyExist(
    workspaceId: string,
    objectKey: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;
    const count = await client.object.count({
      where: { workspaceId, objectKey },
    });
    return count > 0;
  }

  async findWorkspaceObjects(
    workspaceId: string,
    filter: FilterObjectDto,
    tx?: PrismaTransaction,
  ): Promise<ObjectWithRelations[]> {
    const client = tx ?? this.prisma;
    const where: Prisma.ObjectWhereInput = {
      workspaceId,
      status: filter.status ?? { not: ObjectStatus.DELETED },
    };

    if (filter.typeKey) {
      where.typeKey = filter.typeKey;
    }
    if (filter.spaceId) {
      where.spaceId = filter.spaceId;
    }
    if (filter.isFavorite !== undefined) {
      where.isFavorite = filter.isFavorite;
    }
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return client.object.findMany({
      where,
      include: OBJECT_RELATIONS_INCLUDE,
      orderBy: [{ pinnedAt: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(
    data: CreateObjectData,
    tx?: PrismaTransaction,
  ): Promise<LumoraObject> {
    const client = tx ?? this.prisma;
    return client.object.create({
      data: {
        workspaceId: data.workspaceId,
        createdById: data.createdById,
        objectKey: data.objectKey,
        typeKey: data.typeKey,
        title: data.title,
        description: data.description,
        spaceId: data.spaceId,
        icon: data.icon,
        emoji: data.emoji,
        cover: data.cover,
        color: data.color,
        pinnedAt: data.pinnedAt,
        isFavorite: data.isFavorite ?? false,
        systemData: data.systemData,
        attributes: data.attributes,
      },
    });
  }

  async update(
    id: string,
    data: UpdateObjectData,
    tx?: PrismaTransaction,
  ): Promise<ObjectWithRelations> {
    const client = tx ?? this.prisma;
    return client.object.update({
      where: { id },
      data: {
        updatedById: data.updatedById,
        title: data.title,
        description: data.description,
        spaceId: data.spaceId,
        icon: data.icon,
        emoji: data.emoji,
        cover: data.cover,
        color: data.color,
        pinnedAt: data.pinnedAt,
        isFavorite: data.isFavorite,
        status: data.status,
        archivedAt: data.archivedAt,
        deletedAt: data.deletedAt,
        revision: { increment: 1 },
        systemData: data.systemData,
        attributes: data.attributes,
      },
      include: OBJECT_RELATIONS_INCLUDE,
    });
  }

  async softDelete(
    id: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<LumoraObject> {
    const client = tx ?? this.prisma;
    return client.object.update({
      where: { id },
      data: {
        status: ObjectStatus.DELETED,
        deletedAt: new Date(),
        updatedById: userId,
        revision: { increment: 1 },
      },
    });
  }
}
