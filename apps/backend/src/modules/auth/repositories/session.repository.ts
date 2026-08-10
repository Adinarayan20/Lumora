import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { Session, SessionStatus } from '../../../generated/prisma/client.js';
import { PrismaTransaction } from './audit-log.repository.js';

export interface CreateSessionData {
  userId: string;
  deviceId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * SessionRepository — stores session tokens as SHA-256 hashes.
 *
 * Security: refresh tokens are hashed before persistence so that a database
 * breach does not expose usable tokens. The raw token is returned to the caller
 * (for sending to the client) but only the hash is stored.
 *
 * Lookup: incoming refresh token is hashed before querying.
 */
@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Hash a token with SHA-256 for safe storage. */
  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

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
    const hash = SessionRepository.hashToken(refreshToken);
    return client.session.findFirst({
      where: { refreshToken: hash },
      include: { device: true },
    });
  }

  async findActiveUserSessions(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<Session[]> {
    const client = tx ?? this.prisma;
    return client.session.findMany({
      where: { userId, status: SessionStatus.ACTIVE },
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
        accessToken: SessionRepository.hashToken(data.accessToken),
        refreshToken: SessionRepository.hashToken(data.refreshToken),
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
        accessToken: SessionRepository.hashToken(accessToken),
        refreshToken: SessionRepository.hashToken(refreshToken),
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
    return client.session.update({ where: { id }, data: { status } });
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
