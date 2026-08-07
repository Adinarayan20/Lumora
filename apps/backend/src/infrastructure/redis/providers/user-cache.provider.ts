import { Injectable } from '@nestjs/common';
import { BaseDomainCacheProvider } from './base-domain-cache.provider.js';
import { CacheStore } from './cache-store.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';
import type { IUserCache } from '../interfaces/user-cache.interface.js';

@Injectable()
export class UserCacheProvider
  extends BaseDomainCacheProvider
  implements IUserCache
{
  constructor(cacheStore: CacheStore, ttlPolicies: RedisTtlPolicies) {
    super(
      cacheStore,
      (id: string) => RedisKeyStrategy.userKey(id),
      ttlPolicies.userCacheTtlSeconds,
    );
  }
}
