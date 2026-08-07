import { Injectable, Logger } from '@nestjs/common';
import { RedisClientProvider } from '../redis-client.provider.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import type {
  IRateLimitStore,
  RateLimitResult,
} from '../interfaces/rate-limit-store.interface.js';

/**
 * Atomic Lua Script for distributed rate limiting.
 * Atomically increments counter and sets expiration window on first hit.
 * Returns array: [totalHits, ttlSeconds]
 */
const ATOMIC_RATE_LIMIT_LUA_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if tonumber(current) == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
`;

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

      // Execute atomic Lua script
      const res = (await client.eval(
        ATOMIC_RATE_LIMIT_LUA_SCRIPT,
        1,
        key,
        ttlSeconds,
      )) as [number, number];

      const totalHits = Number(res[0]);
      const ttl = Number(res[1]);

      const resetTimeMs = now + (ttl > 0 ? ttl * 1000 : ttlSeconds * 1000);
      return { totalHits, resetTimeMs };
    } catch (error) {
      this.logger.error(
        `Failed to increment rate limiter entry: ${(error as Error).message}`,
      );
      // Safe fallback on Redis infrastructure error: allow request with reset window
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
        `Failed to query rate limiter counter: ${(error as Error).message}`,
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
        `Failed to reset rate limiter counter: ${(error as Error).message}`,
      );
    }
  }
}
