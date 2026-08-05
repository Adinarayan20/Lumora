import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import { TokenService, JwtPayload } from './token.service';
import { Session, SessionStatus } from '../../../generated/prisma/client';
import { PrismaTransaction } from '../repositories/audit-log.repository';
import { EventPublisherService } from './event-publisher.service';
import {
  SessionCreatedEvent,
  SessionRevokedEvent,
} from '../events/identity.events';

export interface CreateSessionParams {
  userId: string;
  email: string;
  username: string;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async createSession(
    params: CreateSessionParams,
    tx?: PrismaTransaction,
  ): Promise<{ session: Session; accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: params.userId,
      email: params.email,
      username: params.username,
      deviceId: params.deviceId,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    const expiresAt = this.tokenService.getRefreshTokenExpiryDate();

    const session = await this.sessionRepository.create(
      {
        userId: params.userId,
        deviceId: params.deviceId,
        accessToken,
        refreshToken,
        expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
      tx,
    );

    await this.eventPublisher.publishSessionCreated(
      new SessionCreatedEvent(session.id, params.userId, params.deviceId),
      tx,
    );

    return { session, accessToken, refreshToken };
  }

  async rotateRefreshToken(
    refreshTokenStr: string,
    tx?: PrismaTransaction,
  ): Promise<{ session: Session; accessToken: string; refreshToken: string }> {
    const payload = await this.tokenService.verifyRefreshToken(refreshTokenStr);
    const session = await this.sessionRepository.findByRefreshToken(
      refreshTokenStr,
      tx,
    );

    if (!session || session.status !== SessionStatus.ACTIVE) {
      if (session) {
        await this.sessionRepository.updateStatus(
          session.id,
          SessionStatus.REVOKED,
          tx,
        );
        await this.eventPublisher.publishSessionRevoked(
          new SessionRevokedEvent(
            session.id,
            session.userId,
            'Refresh token reuse detected',
          ),
          tx,
        );
      }
      throw new UnauthorizedException('Session invalid or revoked');
    }

    if (new Date() > session.expiresAt) {
      await this.sessionRepository.updateStatus(
        session.id,
        SessionStatus.EXPIRED,
        tx,
      );
      throw new UnauthorizedException('Session expired');
    }

    const newPayload: JwtPayload = {
      sub: session.userId,
      email: payload.email,
      username: payload.username,
      sessionId: session.id,
      deviceId: session.deviceId,
    };

    const newAccessToken =
      await this.tokenService.generateAccessToken(newPayload);
    const newRefreshToken =
      await this.tokenService.generateRefreshToken(newPayload);
    const newExpiresAt = this.tokenService.getRefreshTokenExpiryDate();

    const updatedSession = await this.sessionRepository.updateTokens(
      session.id,
      newAccessToken,
      newRefreshToken,
      newExpiresAt,
      tx,
    );

    return {
      session: updatedSession,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getUserSessions(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<Session[]> {
    return this.sessionRepository.findActiveUserSessions(userId, tx);
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    reason = 'User logout',
    tx?: PrismaTransaction,
  ): Promise<Session> {
    const session = await this.sessionRepository.findById(sessionId, tx);
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found or unauthorized');
    }

    const revoked = await this.sessionRepository.updateStatus(
      sessionId,
      SessionStatus.REVOKED,
      tx,
    );

    await this.eventPublisher.publishSessionRevoked(
      new SessionRevokedEvent(sessionId, userId, reason),
      tx,
    );

    return revoked;
  }

  async revokeAllUserSessions(
    userId: string,
    reason = 'Revoke all sessions',
    tx?: PrismaTransaction,
  ): Promise<number> {
    const count = await this.sessionRepository.revokeAllUserSessions(
      userId,
      tx,
    );
    if (count > 0) {
      await this.eventPublisher.publishSessionRevoked(
        new SessionRevokedEvent('all', userId, reason),
        tx,
      );
    }
    return count;
  }
}
