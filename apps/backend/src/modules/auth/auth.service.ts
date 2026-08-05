import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRepository } from '../users/repositories/user.repository';
import { PasswordService } from './services/password.service';
import { DeviceService, DeviceMetadata } from './services/device.service';
import { SessionService } from './services/session.service';
import { OAuthService } from './services/oauth.service';
import { OAuthAccountRepository } from './repositories/oauth-account.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { EventPublisherService } from './services/event-publisher.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuditAction, User } from '../../generated/prisma/client';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  PasswordChangedEvent,
} from './events/identity.events';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly deviceService: DeviceService,
    private readonly sessionService: SessionService,
    private readonly oauthService: OAuthService,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly eventPublisher: EventPublisherService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Record<string, any>).passwordHash;
    return userWithoutPassword;
  }

  async register(
    dto: RegisterDto,
    meta: DeviceMetadata,
  ): Promise<AuthResponseDto> {
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.userRepository.findByUsername(
      dto.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    return this.prisma.$transaction(
      async (tx) => {
        const user = await this.userRepository.create(
          {
            email: dto.email,
            username: dto.username,
            displayName: dto.displayName,
            passwordHash,
            avatarUrl: dto.avatarUrl,
            timezone: dto.timezone,
            locale: dto.locale,
          },
          tx,
        );

        // Automatically provision 1 Personal Workspace in the same transaction
        await this.workspacesService.createPersonalWorkspace(
          user.id,
          user.displayName,
          tx,
        );

        const device = await this.deviceService.findOrCreateDevice(
          user.id,
          {
            platform: dto.platform ?? meta.platform,
            deviceName: dto.deviceName ?? meta.deviceName,
            appVersion: dto.appVersion ?? meta.appVersion,
            osVersion: dto.osVersion ?? meta.osVersion,
            pushToken: dto.pushToken ?? meta.pushToken,
            userAgent: meta.userAgent,
            ipAddress: meta.ipAddress,
          },
          tx,
        );

        const { session, accessToken, refreshToken } =
          await this.sessionService.createSession(
            {
              userId: user.id,
              email: user.email,
              username: user.username,
              deviceId: device.id,
              ipAddress: meta.ipAddress,
              userAgent: meta.userAgent,
            },
            tx,
          );

        await this.auditLogRepository.create(
          {
            userId: user.id,
            entity: 'User',
            entityId: user.id,
            action: AuditAction.CREATE,
            newData: { email: user.email, username: user.username },
          },
          tx,
        );

        await this.eventPublisher.publishUserRegistered(
          new UserRegisteredEvent(user.id, user.email, user.username),
          tx,
        );

        return {
          user: this.sanitizeUser(user),
          accessToken,
          refreshToken,
          sessionId: session.id,
          deviceId: device.id,
        };
      },
      { timeout: 60000 },
    );
  }

  async login(dto: LoginDto, meta: DeviceMetadata): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmailOrUsername(
      dto.emailOrUsername,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await this.passwordService.comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.prisma.$transaction(async (tx) => {
      const device = await this.deviceService.findOrCreateDevice(
        user.id,
        {
          platform: dto.platform ?? meta.platform,
          deviceName: dto.deviceName ?? meta.deviceName,
          appVersion: dto.appVersion ?? meta.appVersion,
          osVersion: dto.osVersion ?? meta.osVersion,
          pushToken: dto.pushToken ?? meta.pushToken,
          userAgent: meta.userAgent,
          ipAddress: meta.ipAddress,
        },
        tx,
      );

      const { session, accessToken, refreshToken } =
        await this.sessionService.createSession(
          {
            userId: user.id,
            email: user.email,
            username: user.username,
            deviceId: device.id,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
          },
          tx,
        );

      await this.auditLogRepository.create(
        {
          userId: user.id,
          entity: 'Session',
          entityId: session.id,
          action: AuditAction.LOGIN,
          newData: { deviceId: device.id, ipAddress: meta.ipAddress },
        },
        tx,
      );

      await this.eventPublisher.publishUserLoggedIn(
        new UserLoggedInEvent(user.id, session.id, device.id),
        tx,
      );

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        sessionId: session.id,
        deviceId: device.id,
      };
    });
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { session, accessToken, refreshToken } =
      await this.sessionService.rotateRefreshToken(dto.refreshToken);

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      sessionId: session.id,
      deviceId: session.deviceId,
    };
  }

  async logout(
    userId: string,
    sessionId?: string,
  ): Promise<{ success: boolean }> {
    if (sessionId) {
      await this.sessionService.revokeSession(
        userId,
        sessionId,
        'User manual logout',
      );
    } else {
      await this.sessionService.revokeAllUserSessions(
        userId,
        'User manual logout all',
      );
    }

    await this.auditLogRepository.create({
      userId,
      entity: 'Session',
      entityId: sessionId ?? userId,
      action: AuditAction.LOGOUT,
    });

    return { success: true };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const validPassword = await this.passwordService.comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!validPassword) {
      throw new BadRequestException('Current password does not match');
    }

    const newPasswordHash = await this.passwordService.hashPassword(
      dto.newPassword,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.userRepository.update(
        userId,
        { passwordHash: newPasswordHash },
        tx,
      );
      await this.sessionService.revokeAllUserSessions(
        userId,
        'Password changed',
        tx,
      );

      await this.auditLogRepository.create(
        {
          userId,
          entity: 'User',
          entityId: userId,
          action: AuditAction.UPDATE,
          newData: { passwordUpdated: true },
        },
        tx,
      );

      await this.eventPublisher.publishPasswordChanged(
        new PasswordChangedEvent(userId),
        tx,
      );
    });

    return { success: true };
  }

  async oauthLogin(
    dto: OAuthLoginDto,
    meta: DeviceMetadata,
  ): Promise<AuthResponseDto> {
    const oauthData = await this.oauthService.authenticateOAuthUser(
      dto.provider,
      dto.token,
    );

    return this.prisma.$transaction(async (tx) => {
      let oauthAccount =
        await this.oauthAccountRepository.findByProviderAndAccountId(
          dto.provider,
          oauthData.providerAccountId,
          tx,
        );

      let user: User | null = null;

      if (oauthAccount) {
        user = await this.userRepository.findById(oauthAccount.userId, tx);
      } else {
        user = await this.userRepository.findByEmail(oauthData.email, tx);
        if (!user) {
          const randomPassword = await this.passwordService.hashPassword(
            `OAuth_${Date.now()}_${Math.random()}`,
          );
          user = await this.userRepository.create(
            {
              email: oauthData.email,
              username: `user_${Date.now().toString(36)}`,
              displayName: oauthData.displayName,
              passwordHash: randomPassword,
              avatarUrl: oauthData.avatarUrl,
            },
            tx,
          );

          // Auto provision 1 Personal Workspace for OAuth user registration
          await this.workspacesService.createPersonalWorkspace(
            user.id,
            user.displayName,
            tx,
          );
        }

        oauthAccount = await this.oauthAccountRepository.create(
          {
            userId: user.id,
            provider: dto.provider,
            providerAccountId: oauthData.providerAccountId,
            accessToken: oauthData.accessToken,
            refreshToken: oauthData.refreshToken,
            expiresAt: oauthData.expiresAt,
          },
          tx,
        );
      }

      if (!user) {
        throw new UnauthorizedException(
          'Unable to resolve user for OAuth login',
        );
      }

      const device = await this.deviceService.findOrCreateDevice(
        user.id,
        {
          platform: dto.platform ?? meta.platform,
          deviceName: dto.deviceName ?? meta.deviceName,
          userAgent: meta.userAgent,
          ipAddress: meta.ipAddress,
        },
        tx,
      );

      const { session, accessToken, refreshToken } =
        await this.sessionService.createSession(
          {
            userId: user.id,
            email: user.email,
            username: user.username,
            deviceId: device.id,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
          },
          tx,
        );

      await this.auditLogRepository.create(
        {
          userId: user.id,
          entity: 'OAuthAccount',
          entityId: oauthAccount.id,
          action: AuditAction.LOGIN,
          newData: { provider: dto.provider },
        },
        tx,
      );

      await this.eventPublisher.publishUserLoggedIn(
        new UserLoggedInEvent(user.id, session.id, device.id),
        tx,
      );

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        sessionId: session.id,
        deviceId: device.id,
      };
    });
  }
}
