import { Injectable } from '@nestjs/common';
import { CacheStore } from './cache-store.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';
import type { IObjectCache } from '../interfaces/object-cache.interface.js';

@Injectable()
export class ObjectCacheProvider implements IObjectCache {
  constructor(private readonly cacheStore: CacheStore) {}

  public async get<T = unknown>(objectId: string): Promise<T | null> {
    const key = RedisKeyStrategy.objectKey(objectId);
    return this.cacheStore.get<T>(key);
  }

  public async set<T = unknown>(
    objectId: string,
    data: T,
    ttlSeconds = RedisTtlPolicies.OBJECT_CACHE_TTL_SECONDS,
  ): Promise<void> {
    const key = RedisKeyStrategy.objectKey(objectId);
    await this.cacheStore.set<T>(key, data, ttlSeconds);
  }

  public async delete(objectId: string): Promise<void> {
    const key = RedisKeyStrategy.objectKey(objectId);
    await this.cacheStore.delete(key);
  }
}
