import { Injectable } from '@nestjs/common';
import { BaseDomainCacheProvider } from './base-domain-cache.provider.js';
import { CacheStore } from './cache-store.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';
import type { IWorkspaceCache } from '../interfaces/workspace-cache.interface.js';

@Injectable()
export class WorkspaceCacheProvider
  extends BaseDomainCacheProvider
  implements IWorkspaceCache
{
  constructor(cacheStore: CacheStore, ttlPolicies: RedisTtlPolicies) {
    super(
      cacheStore,
      (id: string) => RedisKeyStrategy.workspaceKey(id),
      ttlPolicies.workspaceCacheTtlSeconds,
    );
  }
}
