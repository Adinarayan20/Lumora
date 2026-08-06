import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Role, Prisma } from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';

export type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: { permissions: { include: { permission: true } } };
}>;

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByWorkspaceAndName(
    workspaceId: string,
    name: string,
    tx?: PrismaTransaction,
  ): Promise<RoleWithPermissions | null> {
    const client = tx ?? this.prisma;
    return client.role.findFirst({
      where: { workspaceId, name },
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  async findWorkspaceRoles(
    workspaceId: string,
    tx?: PrismaTransaction,
  ): Promise<RoleWithPermissions[]> {
    const client = tx ?? this.prisma;
    return client.role.findMany({
      where: { workspaceId },
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createRole(
    workspaceId: string,
    name: string,
    description?: string,
    isSystem = false,
    tx?: PrismaTransaction,
  ): Promise<Role> {
    const client = tx ?? this.prisma;
    return client.role.create({
      data: {
        workspaceId,
        name,
        description,
        system: isSystem,
      },
    });
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }

  async findGlobalPermissionsByKeys(
    keys: string[],
    tx?: PrismaTransaction,
  ): Promise<{ id: string; key: string }[]> {
    const client = tx ?? this.prisma;
    return client.permission.findMany({
      where: { key: { in: keys } },
      select: { id: true, key: true },
    });
  }
}
