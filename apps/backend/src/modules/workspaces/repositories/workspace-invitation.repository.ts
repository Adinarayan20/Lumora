import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  WorkspaceInvitation,
  InvitationStatus,
} from '../../../generated/prisma/client.js';
import { PrismaTransaction } from '../../auth/repositories/audit-log.repository';

export interface CreateWorkspaceInvitationData {
  workspaceId: string;
  email: string;
  invitedById: string;
  roleId?: string;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class WorkspaceInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation | null> {
    const client = tx ?? this.prisma;
    return client.workspaceInvitation.findUnique({
      where: { id },
      include: { workspace: true, invitedBy: true },
    });
  }

  async findByToken(
    token: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation | null> {
    const client = tx ?? this.prisma;
    return client.workspaceInvitation.findUnique({
      where: { token },
      include: { workspace: true, invitedBy: true },
    });
  }

  async findWorkspaceInvitations(
    workspaceId: string,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation[]> {
    const client = tx ?? this.prisma;
    return client.workspaceInvitation.findMany({
      where: {
        workspaceId,
        status: InvitationStatus.PENDING,
      },
      include: { invitedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    data: CreateWorkspaceInvitationData,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation> {
    const client = tx ?? this.prisma;
    return client.workspaceInvitation.create({
      data: {
        workspaceId: data.workspaceId,
        email: data.email.toLowerCase(),
        invitedById: data.invitedById,
        roleId: data.roleId,
        token: data.token,
        expiresAt: data.expiresAt,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async updateStatus(
    id: string,
    status: InvitationStatus,
    tx?: PrismaTransaction,
  ): Promise<WorkspaceInvitation> {
    const client = tx ?? this.prisma;
    return client.workspaceInvitation.update({
      where: { id },
      data: { status },
    });
  }
}
