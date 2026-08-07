import { Injectable } from '@nestjs/common';
import { BaseDomainCacheProvider } from './base-domain-cache.provider.js';
import { CacheStore } from './cache-store.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';
import type { IObjectCache } from '../interfaces/object-cache.interface.js';

@Injectable()
export class ObjectCacheProvider
  extends BaseDomainCacheProvider
  implements IObjectCache
{
  constructor(cacheStore: CacheStore, ttlPolicies: RedisTtlPolicies) {
    super(
      cacheStore,
      (id: string) => RedisKeyStrategy.objectKey(id),
      ttlPolicies.objectCacheTtlSeconds,
    );
  }
}
