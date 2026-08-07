import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT_TOKEN } from './redis-client.provider.js';
import { RedisClientProvider } from './redis-client.provider.js';
import { RedisTtlPolicies } from './ttl/redis-ttl.policies.js';
import { CacheStore } from './providers/cache-store.js';
import { RateLimiterStore } from './providers/rate-limiter-store.js';
import { OBJECT_CACHE_TOKEN } from './interfaces/object-cache.interface.js';
import { WORKSPACE_CACHE_TOKEN } from './interfaces/workspace-cache.interface.js';
import { USER_CACHE_TOKEN } from './interfaces/user-cache.interface.js';
import { RATE_LIMIT_STORE_TOKEN } from './interfaces/rate-limit-store.interface.js';
import { ObjectCacheProvider } from './providers/object-cache.provider.js';
import { WorkspaceCacheProvider } from './providers/workspace-cache.provider.js';
import { UserCacheProvider } from './providers/user-cache.provider.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisClientProvider,
    RedisTtlPolicies,
    CacheStore,
    RateLimiterStore,
    ObjectCacheProvider,
    WorkspaceCacheProvider,
    UserCacheProvider,
    {
      provide: REDIS_CLIENT_TOKEN,
      useFactory: (provider: RedisClientProvider): Redis =>
        provider.getClient(),
      inject: [RedisClientProvider],
    },
    {
      provide: OBJECT_CACHE_TOKEN,
      useClass: ObjectCacheProvider,
    },
    {
      provide: WORKSPACE_CACHE_TOKEN,
      useClass: WorkspaceCacheProvider,
    },
    {
      provide: USER_CACHE_TOKEN,
      useClass: UserCacheProvider,
    },
    {
      provide: RATE_LIMIT_STORE_TOKEN,
      useClass: RateLimiterStore,
    },
  ],
  exports: [
    RedisClientProvider,
    RedisTtlPolicies,
    CacheStore,
    RateLimiterStore,
    REDIS_CLIENT_TOKEN,
    OBJECT_CACHE_TOKEN,
    WORKSPACE_CACHE_TOKEN,
    USER_CACHE_TOKEN,
    RATE_LIMIT_STORE_TOKEN,
  ],
})
export class RedisModule {}
