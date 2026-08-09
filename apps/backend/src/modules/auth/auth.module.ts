import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './services/password.service.js';
import { TokenService } from './services/token.service.js';
import { DeviceService } from './services/device.service.js';
import { SessionService } from './services/session.service.js';
import { OAuthService } from './services/oauth.service.js';
import { GoogleOAuthProvider } from './providers/google-oauth.provider.js';
import { EventPublisherService } from './services/event-publisher.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { SessionRepository } from './repositories/session.repository.js';
import { DeviceRepository } from './repositories/device.repository.js';
import { OAuthAccountRepository } from './repositories/oauth-account.repository.js';
import { AuditLogRepository } from './repositories/audit-log.repository.js';
import { EventRepository } from './repositories/event.repository.js';
import { UsersModule } from '../users/users.module.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';
import { RedisRateLimiterGuard } from '../../common/guards/redis-rate-limiter.guard.js';
import { NetworkIdentityResolver } from '../../common/services/network-identity.resolver.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    UsersModule,
    forwardRef(() => WorkspacesModule),
    // RedisModule is @Global — RATE_LIMIT_STORE_TOKEN + RedisTtlPolicies available without import
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    DeviceService,
    SessionService,
    OAuthService,
    GoogleOAuthProvider,
    EventPublisherService,
    JwtStrategy,
    SessionRepository,
    DeviceRepository,
    OAuthAccountRepository,
    AuditLogRepository,
    EventRepository,
    // Rate limiting
    NetworkIdentityResolver,
    RedisRateLimiterGuard,
  ],
  exports: [
    AuthService,
    SessionService,
    DeviceService,
    TokenService,
    JwtStrategy,
    SessionRepository,
    DeviceRepository,
    AuditLogRepository,
    EventRepository,
  ],
})
export class AuthModule {}
