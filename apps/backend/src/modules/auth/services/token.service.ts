import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  sessionId?: string;
  deviceId?: string;
  [key: string]: unknown;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException(
        'JWT_SECRET environment variable is not configured.',
      );
    }
    const expiresInConfig =
      this.configService.get<string>('JWT_EXPIRES_IN') || '15m';

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresInConfig as unknown as number,
    });
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new InternalServerErrorException(
        'JWT_REFRESH_SECRET environment variable is not configured.',
      );
    }
    const expiresInConfig =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresInConfig as unknown as number,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new InternalServerErrorException(
          'JWT_SECRET environment variable is not configured.',
        );
      }
      return await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
      if (!secret) {
        throw new InternalServerErrorException(
          'JWT_REFRESH_SECRET environment variable is not configured.',
        );
      }
      return await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  getRefreshTokenExpiryDate(): Date {
    const expiresInStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const daysMatch = expiresInStr.match(/(\d+)d/);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : 7;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }
}
