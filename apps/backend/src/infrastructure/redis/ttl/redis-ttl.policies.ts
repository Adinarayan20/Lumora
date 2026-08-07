import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisTtlPolicies {
  constructor(private readonly configService: ConfigService) {}

  public get objectCacheTtlSeconds(): number {
    return this.configService.get<number>('OBJECT_CACHE_TTL_SECONDS', 3600);
  }

  public get workspaceCacheTtlSeconds(): number {
    return this.configService.get<number>('WORKSPACE_CACHE_TTL_SECONDS', 7200);
  }

  public get userCacheTtlSeconds(): number {
    return this.configService.get<number>('USER_CACHE_TTL_SECONDS', 86400);
  }

  public get defaultRateLimitTtlSeconds(): number {
    return this.configService.get<number>('DEFAULT_RATE_LIMIT_TTL_SECONDS', 60);
  }

  public get refreshTokenTtlSeconds(): number {
    return this.configService.get<number>('REFRESH_TOKEN_TTL_SECONDS', 604800);
  }
}
