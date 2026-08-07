import { Injectable } from '@nestjs/common';
import { CacheStore } from './cache-store.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';
import type { IUserCache } from '../interfaces/user-cache.interface.js';

@Injectable()
export class UserCacheProvider implements IUserCache {
  constructor(private readonly cacheStore: CacheStore) {}

  public async get<T = unknown>(userId: string): Promise<T | null> {
    const key = RedisKeyStrategy.userKey(userId);
    return this.cacheStore.get<T>(key);
  }

  public async set<T = unknown>(
    userId: string,
    data: T,
    ttlSeconds = RedisTtlPolicies.USER_CACHE_TTL_SECONDS,
  ): Promise<void> {
    const key = RedisKeyStrategy.userKey(userId);
    await this.cacheStore.set<T>(key, data, ttlSeconds);
  }

  public async delete(userId: string): Promise<void> {
    const key = RedisKeyStrategy.userKey(userId);
    await this.cacheStore.delete(key);
  }
}
