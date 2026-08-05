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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { DeviceMetadata } from './services/device.service';
import { OAuthProvider } from '../../generated/prisma/client';

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

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const meta = this.extractDeviceMetadata(req);
    return this.authService.register(dto, meta);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const meta = this.extractDeviceMetadata(req);
    return this.authService.login(dto, meta);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
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
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Post('oauth/:provider')
  @HttpCode(HttpStatus.OK)
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
