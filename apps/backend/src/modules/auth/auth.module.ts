import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { DeviceService } from './services/device.service';
import { SessionService } from './services/session.service';
import { OAuthService } from './services/oauth.service';
import { GoogleOAuthProvider } from './providers/google-oauth.provider';
import { EventPublisherService } from './services/event-publisher.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionRepository } from './repositories/session.repository';
import { DeviceRepository } from './repositories/device.repository';
import { OAuthAccountRepository } from './repositories/oauth-account.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { EventRepository } from './repositories/event.repository';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    UsersModule,
    forwardRef(() => WorkspacesModule),
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
