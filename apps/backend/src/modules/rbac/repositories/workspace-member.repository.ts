import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';

export type WorkspaceMemberWithRolePermissions =
  Prisma.WorkspaceMemberGetPayload<{
    include: {
      workspace: true;
      role: {
        include: {
          permissions: {
            include: { permission: true };
          };
        };
      };
    };
  }>;

@Injectable()
export class WorkspaceMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMemberWithRolePermissions(
    workspaceId: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMemberWithRolePermissions | null> {
    const client = tx ?? this.prisma;
    return client.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      include: {
        workspace: true,
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    roleId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: { roleId },
    });
  }
}
