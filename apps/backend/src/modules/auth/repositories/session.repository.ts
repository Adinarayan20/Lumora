import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Session, SessionStatus } from '../../../generated/prisma/client';
import { PrismaTransaction } from './audit-log.repository';

export interface CreateSessionData {
  userId: string;
  deviceId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, tx?: PrismaTransaction): Promise<Session | null> {
    const client = tx ?? this.prisma;
    return client.session.findUnique({
      where: { id },
      include: { device: true },
    });
  }

  async findByRefreshToken(
    refreshToken: string,
    tx?: PrismaTransaction,
  ): Promise<Session | null> {
    const client = tx ?? this.prisma;
    return client.session.findFirst({
      where: { refreshToken },
      include: { device: true },
    });
  }

  async findActiveUserSessions(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<Session[]> {
    const client = tx ?? this.prisma;
    return client.session.findMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
      include: { device: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    data: CreateSessionData,
    tx?: PrismaTransaction,
  ): Promise<Session> {
    const client = tx ?? this.prisma;
    return client.session.create({
      data: {
        userId: data.userId,
        deviceId: data.deviceId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: SessionStatus.ACTIVE,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async updateTokens(
    id: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    tx?: PrismaTransaction,
  ): Promise<Session> {
    const client = tx ?? this.prisma;
    return client.session.update({
      where: { id },
      data: {
        accessToken,
        refreshToken,
        expiresAt,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async updateStatus(
    id: string,
    status: SessionStatus,
    tx?: PrismaTransaction,
  ): Promise<Session> {
    const client = tx ?? this.prisma;
    return client.session.update({
      where: { id },
      data: { status },
    });
  }

  async revokeAllUserSessions(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const result = await client.session.updateMany({
      where: { userId, status: SessionStatus.ACTIVE },
      data: { status: SessionStatus.REVOKED },
    });
    return result.count;
  }
}
