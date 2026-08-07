import { CacheStore } from './cache-store.js';

export abstract class BaseDomainCacheProvider {
  constructor(
    protected readonly cacheStore: CacheStore,
    protected readonly keyBuilder: (id: string) => string,
    protected readonly defaultTtlSeconds: number,
  ) {}

  public async get<T = unknown>(id: string): Promise<T | null> {
    const key = this.keyBuilder(id);
    return this.cacheStore.get<T>(key);
  }

  public async set<T = unknown>(
    id: string,
    data: T,
    ttlSeconds = this.defaultTtlSeconds,
  ): Promise<void> {
    const key = this.keyBuilder(id);
    await this.cacheStore.set<T>(key, data, ttlSeconds);
  }

  public async delete(id: string): Promise<void> {
    const key = this.keyBuilder(id);
    await this.cacheStore.delete(key);
  }
}
