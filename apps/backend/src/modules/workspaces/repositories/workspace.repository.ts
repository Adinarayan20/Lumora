import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  Workspace,
  WorkspaceType,
  WorkspaceVisibility,
  WorkspaceStatus,
  WorkspacePlan,
  Prisma,
} from '../../../generated/prisma/client';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';

export type WorkspaceWithMembers = Prisma.WorkspaceGetPayload<{
  include: { owner: true; members: { include: { user: true } } };
}>;

export interface CreateWorkspaceData {
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  type?: WorkspaceType;
  visibility?: WorkspaceVisibility;
  plan?: WorkspacePlan;
  settings?: Record<string, unknown>;
}

export interface UpdateWorkspaceData {
  name?: string;
  slug?: string;
  ownerId?: string;
  description?: string;
  icon?: string;
  emoji?: string;
  cover?: string;
  color?: string;
  visibility?: WorkspaceVisibility;
  status?: WorkspaceStatus;
  plan?: WorkspacePlan;
  settings?: Record<string, unknown>;
  deletedAt?: Date | null;
}

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceWithMembers | null> {
    const client = tx ?? this.prisma;
    return client.workspace.findFirst({
      where: {
        id,
        status: { not: WorkspaceStatus.DELETED },
      },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
    });
  }

  async findBySlug(
    slug: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceWithMembers | null> {
    const client = tx ?? this.prisma;
    return client.workspace.findFirst({
      where: {
        slug,
        status: { not: WorkspaceStatus.DELETED },
      },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
    });
  }

  async doesSlugExist(slug: string, tx?: PrismaTransaction): Promise<boolean> {
    const client = tx ?? this.prisma;
    const count = await client.workspace.count({
      where: { slug },
    });
    return count > 0;
  }

  async findUserWorkspaces(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceWithMembers[]> {
    const client = tx ?? this.prisma;
    return client.workspace.findMany({
      where: {
        status: { not: WorkspaceStatus.DELETED },
        OR: [
          { ownerId: userId },
          { members: { some: { userId, status: 'ACTIVE' } } },
        ],
      },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    data: CreateWorkspaceData,
    tx?: PrismaTransaction,
  ): Promise<Workspace> {
    const client = tx ?? this.prisma;
    return client.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
        description: data.description,
        icon: data.icon,
        emoji: data.emoji,
        cover: data.cover,
        color: data.color,
        type: data.type ?? WorkspaceType.CUSTOM,
        visibility: data.visibility ?? WorkspaceVisibility.PRIVATE,
        plan: data.plan ?? WorkspacePlan.FREE,
        settings: data.settings
          ? (data.settings as Prisma.InputJsonValue)
          : undefined,
      },
      include: {
        owner: true,
        members: true,
      },
    });
  }

  async update(
    id: string,
    data: UpdateWorkspaceData,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceWithMembers> {
    const client = tx ?? this.prisma;
    const settingsJson = data.settings
      ? (data.settings as Prisma.InputJsonValue)
      : undefined;

    return client.workspace.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
        description: data.description,
        icon: data.icon,
        emoji: data.emoji,
        cover: data.cover,
        color: data.color,
        visibility: data.visibility,
        status: data.status,
        plan: data.plan,
        deletedAt: data.deletedAt,
        settings: settingsJson,
      },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
    });
  }

  async softDelete(id: string, tx?: PrismaTransaction): Promise<Workspace> {
    const client = tx ?? this.prisma;
    return client.workspace.update({
      where: { id },
      data: {
        status: WorkspaceStatus.DELETED,
        deletedAt: new Date(),
      },
    });
  }
}
