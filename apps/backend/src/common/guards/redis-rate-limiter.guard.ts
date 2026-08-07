import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response, Request } from 'express';
import { RateLimitExceededException } from '@lumora/shared';
import {
  RATE_LIMIT_STORE_TOKEN,
  type IRateLimitStore,
} from '../../infrastructure/redis/interfaces/rate-limit-store.interface.js';
import { RedisTtlPolicies } from '../../infrastructure/redis/ttl/redis-ttl.policies.js';
import { NetworkIdentityResolver } from '../services/network-identity.resolver.js';
import {
  RATE_LIMIT_METADATA_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator.js';

@Injectable()
export class RedisRateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RedisRateLimiterGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(RATE_LIMIT_STORE_TOKEN)
    private readonly rateLimitStore: IRateLimitStore,
    private readonly networkIdentityResolver: NetworkIdentityResolver,
    private readonly ttlPolicies: RedisTtlPolicies,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const limit = options?.limit ?? this.ttlPolicies.defaultRateLimitQuota;
    const ttlSeconds =
      options?.ttlSeconds ?? this.ttlPolicies.defaultRateLimitTtlSeconds;

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const identifier = this.resolveIdentifier(req, context);
    const result = await this.rateLimitStore.increment(identifier, ttlSeconds);

    const remaining = Math.max(0, limit - result.totalHits);
    const resetTimeSeconds = Math.ceil(result.resetTimeMs / 1000);

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTimeSeconds.toString());

    if (result.totalHits > limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((result.resetTimeMs - Date.now()) / 1000),
      );
      res.setHeader('Retry-After', retryAfterSeconds.toString());

      this.logger.warn(
        `Rate limit quota exceeded for client in window ${ttlSeconds}s (limit: ${limit})`,
      );

      throw new RateLimitExceededException(retryAfterSeconds);
    }

    return true;
  }

  private resolveIdentifier(req: Request, context: ExecutionContext): string {
    const user = (req as unknown as Record<string, unknown>).user as
      { id?: string } | undefined;
    const userId = user?.id;

    const clientIp = this.networkIdentityResolver.extractClientIp(req);

    const handler = context.getHandler().name;
    const className = context.getClass().name;

    const clientKey = userId ? `user:${userId}` : `ip:${clientIp}`;
    return `${clientKey}:${className}:${handler}`;
  }
}
