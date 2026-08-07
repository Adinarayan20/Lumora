import { Injectable } from '@nestjs/common';
import { CacheStore } from './cache-store.js';
import { RedisKeyStrategy } from '../key-strategy/redis-key.strategy.js';
import { RedisTtlPolicies } from '../ttl/redis-ttl.policies.js';
import type { IWorkspaceCache } from '../interfaces/workspace-cache.interface.js';

@Injectable()
export class WorkspaceCacheProvider implements IWorkspaceCache {
  constructor(private readonly cacheStore: CacheStore) {}

  public async get<T = unknown>(workspaceId: string): Promise<T | null> {
    const key = RedisKeyStrategy.workspaceKey(workspaceId);
    return this.cacheStore.get<T>(key);
  }

  public async set<T = unknown>(
    workspaceId: string,
    data: T,
    ttlSeconds = RedisTtlPolicies.WORKSPACE_CACHE_TTL_SECONDS,
  ): Promise<void> {
    const key = RedisKeyStrategy.workspaceKey(workspaceId);
    await this.cacheStore.set<T>(key, data, ttlSeconds);
  }

  public async delete(workspaceId: string): Promise<void> {
    const key = RedisKeyStrategy.workspaceKey(workspaceId);
    await this.cacheStore.delete(key);
  }
}
