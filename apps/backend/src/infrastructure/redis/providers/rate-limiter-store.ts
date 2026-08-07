import { Injectable, Logger } from '@nestjs/common';
import { RedisClientProvider } from '../redis-client.provider.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import type {
  IRateLimitStore,
  RateLimitResult,
} from '../interfaces/rate-limit-store.interface.js';

@Injectable()
export class RateLimiterStore implements IRateLimitStore {
  private readonly logger = new Logger(RateLimiterStore.name);

  constructor(private readonly redisClientProvider: RedisClientProvider) {}

  public async increment(
    identifier: string,
    ttlSeconds: number,
  ): Promise<RateLimitResult> {
    const key = RedisKeyStrategy.rateLimitKey(identifier);
    const now = Date.now();

    try {
      const client = this.redisClientProvider.getClient();
      const multi = client.multi();
      multi.incr(key);
      multi.ttl(key);
      const results = await multi.exec();

      let totalHits = 1;
      let ttl = -1;

      if (results && results[0] && results[0][1]) {
        totalHits = Number(results[0][1]);
      }
      if (results && results[1] && results[1][1]) {
        ttl = Number(results[1][1]);
      }

      if (ttl === -1) {
        await client.expire(key, ttlSeconds);
        ttl = ttlSeconds;
      }

      const resetTimeMs = now + (ttl > 0 ? ttl * 1000 : ttlSeconds * 1000);
      return { totalHits, resetTimeMs };
    } catch (error) {
      this.logger.error(
        `Failed to increment rate limit for '${identifier}': ${(error as Error).message}`,
      );
      // Safe fallback on Redis failure: allow request through with reset window
      return { totalHits: 1, resetTimeMs: now + ttlSeconds * 1000 };
    }
  }

  public async get(identifier: string): Promise<number | null> {
    const key = RedisKeyStrategy.rateLimitKey(identifier);
    try {
      const client = this.redisClientProvider.getClient();
      const val = await client.get(key);
      return val ? parseInt(val, 10) : null;
    } catch (error) {
      this.logger.error(
        `Failed to get rate limit for '${identifier}': ${(error as Error).message}`,
      );
      return null;
    }
  }

  public async reset(identifier: string): Promise<void> {
    const key = RedisKeyStrategy.rateLimitKey(identifier);
    try {
      const client = this.redisClientProvider.getClient();
      await client.del(key);
    } catch (error) {
      this.logger.error(
        `Failed to reset rate limit for '${identifier}': ${(error as Error).message}`,
      );
    }
  }
}
