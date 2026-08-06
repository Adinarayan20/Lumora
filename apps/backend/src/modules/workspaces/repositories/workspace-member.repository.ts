import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  WorkspaceMember,
  WorkspaceMemberStatus,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';

export interface CreateWorkspaceMemberData {
  workspaceId: string;
  userId: string;
  roleId?: string;
  status?: WorkspaceMemberStatus;
}

@Injectable()
export class WorkspaceMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMember(
    workspaceId: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMember | null> {
    const client = tx ?? this.prisma;
    return client.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      include: { user: true, workspace: true },
    });
  }

  async findWorkspaceMembers(
    workspaceId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMember[]> {
    const client = tx ?? this.prisma;
    return client.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addMember(
    data: CreateWorkspaceMemberData,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMember> {
    const client = tx ?? this.prisma;
    return client.workspaceMember.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        roleId: data.roleId,
        status: data.status ?? WorkspaceMemberStatus.ACTIVE,
      },
      include: { user: true },
    });
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceMember> {
    const client = tx ?? this.prisma;
    return client.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }
}
