import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { OAuthLoginDto } from './dto/oauth-login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { DeviceMetadata } from './services/device.service.js';
import { OAuthProvider } from '../../generated/prisma/client.js';
import { RedisRateLimiterGuard } from '../../common/guards/redis-rate-limiter.guard.js';
import { RateLimit } from '../../common/decorators/rate-limit.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractDeviceMetadata(req: Request): DeviceMetadata {
    return {
      userAgent: req.headers['user-agent'],
      ipAddress:
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    };
  }

  /**
   * POST /auth/register
   * Rate-limited: 10 registrations per IP per hour.
   */
  @Post('register')
  @UseGuards(RedisRateLimiterGuard)
  @RateLimit({ limit: 10, ttlSeconds: 3600 })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const meta = this.extractDeviceMetadata(req);
    return this.authService.register(dto, meta);
  }

  /**
   * POST /auth/login
   * Rate-limited: 20 login attempts per identifier per 15 minutes.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RedisRateLimiterGuard)
  @RateLimit({ limit: 20, ttlSeconds: 900 })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const meta = this.extractDeviceMetadata(req);
    return this.authService.login(dto, meta);
  }

  /**
   * POST /auth/refresh
   * Rate-limited: 30 refreshes per identifier per 15 minutes.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RedisRateLimiterGuard)
  @RateLimit({ limit: 30, ttlSeconds: 900 })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string, @Body() dto: LogoutDto) {
    return this.authService.logout(userId, dto.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RedisRateLimiterGuard)
  @RateLimit({ limit: 5, ttlSeconds: 3600 })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  /**
   * POST /auth/oauth/:provider
   * Rate-limited: 10 OAuth attempts per identifier per 15 minutes.
   */
  @Post('oauth/:provider')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RedisRateLimiterGuard)
  @RateLimit({ limit: 10, ttlSeconds: 900 })
  async oauthLogin(
    @Param('provider') providerStr: string,
    @Body() dto: OAuthLoginDto,
    @Req() req: Request,
  ) {
    const meta = this.extractDeviceMetadata(req);
    dto.provider = providerStr.toUpperCase() as OAuthProvider;
    return this.authService.oauthLogin(dto, meta);
  }
}
